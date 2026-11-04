---
title: "ping 永远通、端口也开着，SSH 却报 No route to host —— 一次 ARP martian 排障实录"
date: 2026-11-04
tags: ["网络", "Linux", "Docker", "ARP", "排障", "运维"]
summary: "一台云上服务器 SSH 时断时续、多地同时中招，ping 却 0% 丢包。最终定位到一个 Docker 网段抢占了云网关 IP，虚拟机不再应答 ARP，上游路由器对每个新建连接回 ICMP host unreachable。完整记录对照实验、逐层下探到 L2、martian source 实锤与换段修复，以及一小时后原样复发和一次「端到端全绿、机制指标全红」的假阳性止血。"
---

> 一台云上服务器 SSH 时断时续，多地同时中招，`ping` 却 0% 丢包。
> 最后查出来：一个 Docker 网段抢占了云网关的 IP，导致虚拟机**不再应答 ARP**，
> 上游路由器只能对每个新建连接回 ICMP host unreachable。
>
> 后半段还有两个反转：修好一小时后它**因为同事的一次重新部署而原样复发**；
> 以及一个"零停机止血方案"给出了**端到端全绿、机制指标全红**的假阳性。
>
> 关键词：`EHOSTUNREACH` / martian source / rp_filter / Docker 默认地址池
>
> 文中公网 IP、主机名、MAC、项目名、路径均已脱敏（公网地址使用 RFC 5737 文档保留段）；
> 私网地址保留原样，因为网段冲突本身就是故障成因。

---

## 一、现象

服务器是 某私有云 上的 KVM 虚拟机，内网 `172.31.0.174/24`，网关 `172.31.0.1`；
公网 `203.0.113.10` 由上游设备做端口映射，`22174 → 172.31.0.174:22`。

症状有四条，每一条都很"不讲道理"：

1. SSH 时好时坏，失败时报 `ssh: connect to host 203.0.113.10 port 22174: No route to host`
2. 失败**不是随机抖动，而是成段的**：连续失败 13 次、18 次、10 次，中间夹着"连续成功 6~8 次"的短窗口
3. 多个相互独立的网络（不同运营商、不同云厂商）都反映连不上
4. `ping 203.0.113.10`：**60 包 0% 丢包**，RTT 34ms ± 1ms，稳得离谱

"ping 通但连不上"这八个字基本锁定了方向：ICMP 与 TCP 走的是不同判定路径，
中间有设备**只对 TCP 新建连接说不**。

顺带一个容易被忽略的细节：`No route to host` 是 `connect()` 返回 `EHOSTUNREACH`，
它的来源是收到了 **ICMP type 3**（code 1 host-unreachable / code 9、10、13 admin-prohibited）。
如果是防火墙静默 DROP，你会看到 `Connection timed out`；如果是端口没人监听，你会看到 `Connection refused`。
**错误码本身就是线索**，别一律当成"网络不通"。

---

## 二、排除本地：对照实验比猜测快

本机是 WSL2（`systemd-detect-virt` → `wsl`），默认路由走一张 USB 网卡 `eth3`。
第一反应当然是怀疑 WSL 的 NAT 或者 USB 网卡抽风。

但**不要靠猜，做对照**：一边探测故障目标，一边探测一个完全无关的目标。

```bash
# 三路 ping + 两路 TCP，同时跑
ping -D -i 0.5 192.168.1.1   > p_gw.log  2>&1 &   # 本地网关
ping -D -i 0.5 1.1.1.1        > p_wan.log 2>&1 &   # 公网对照
ping -D -i 0.5 203.0.113.10   > p_srv.log 2>&1 &   # 故障目标
for i in $(seq 1 60); do
  timeout 4 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443'       && r1=OK || r1=FAIL   # 对照
  timeout 4 bash -c 'exec 3<>/dev/tcp/203.0.113.10/22174' && r2=OK || r2=FAIL   # 目标
  echo "$(date +%T) ctrl=$r1 server=$r2"
  sleep 1
done
```

结果：

| 探测 | 结果 |
|---|---|
| 网关 / 公网 / 目标 三路 ping（各 357 包） | **全部 0% 丢包** |
| TCP → `1.1.1.1:443` | **0/60 失败** |
| TCP → `203.0.113.10:22174` | **46/60 失败** |

同一秒内，去对照目标的 TCP 好好的，去目标的 TCP 被拒。本地网卡、WSL NAT、局域网、出口全部无罪。

> **教训 1**：排障第一步永远是"找一个已知正常的对照物"。没有对照，任何单点测量都无法归因。

---

## 三、排除服务器：它健康得过分

登上服务器（连接本身要靠重试循环，这也很说明问题）扫一遍常规嫌疑：

```
sshd -T | grep -E 'clientalive|maxstartups|tcpkeepalive'
  clientaliveinterval 0 / maxstartups 10:30:100 / tcpkeepalive yes
ss -s
  TCP: 1167 (estab 95, timewait 2)      TcpExtListenOverflows 0  TcpExtListenDrops 0
conntrack: 544 / 262144
eth0: RX/TX errors 0, dropped 0        softnet_stat: dropped 0, squeezed 0
负载 2.18 / 64 核，内存 147GiB 可用，网卡流量 上行 149kbps
```

`ListenOverflows=0`、`ListenDrops=0` 说明 backlog 没满，`MaxStartups` 没触发；
conntrack 用了 0.2%；网卡零丢包；链路 `carrier_changes = 2`（开机至今只 up/down 各一次）。
**这台机器闲得发慌，根本不是它扛不住。**

---

## 四、抓到发拒绝包的人

既然客户端收到 ICMP host-unreachable，那就把那个 ICMP 包抓出来看**源地址是谁**。

本机没有 root、装不了 tcpdump，但手上有另一台能拿到 root 的机器（下称机器 C）。
**换个观测点**，问题就解开了：

```bash
# 在机器 C 上
tcpdump -ni any -tttt -v "icmp and host 203.0.113.10" &
for i in $(seq 1 25); do timeout 5 bash -c "exec 3<>/dev/tcp/203.0.113.10/22174"; sleep 1; done
```

抓到 31 个 ICMP 包，长这样：

```
203.0.113.10 > 192.0.2.95: ICMP host 203.0.113.10 unreachable, length 68
    192.0.2.95.52102 > 203.0.113.10.22174: Flags [S], seq 3583531126, ...
```

**ICMP 的源地址就是公网 IP 自己**，type 3 code 1（host unreachable），里面还嵌着被拒的那个 SYN。

同一时刻服务器 VM 的 `IcmpMsgOutType3` 计数器：三次测量**始终停在 261，一次没涨**。

> 结论：拒绝包不是服务器发的，是**持有这个公网 IP 的上游设备**发的。
> 而它说的是"host unreachable"——即"我够不着后端那台主机"。

---

## 五、端口交叉实验：NAT 会话的指纹

如果限制是针对整个公网 IP 的，那所有端口应该同起同落；如果只针对 SSH，那就是端口级策略。
把四个端口**在同一轮里交替**测（串行测会被时间窗口混淆，这是第一版实验的坑）：

```
时间         22174(SSH)       56000(docker)    59300(docker)    22
17:58:54   No route to host No route to host No route to host Connection refused
17:59:04   No route to host No route to host No route to host Connection refused
17:59:13   No route to host OK               OK               Connection refused
17:59:18   OK               OK               OK               Connection refused
17:59:57   OK               OK               OK               Connection refused
18:00:06   No route to host No route to host No route to host Connection refused
```

三个**需要 NAT 转发**的端口同起同落；而**没有转发规则的 22 端口永远立刻回 RST，从不被拒**。

这个对比极其关键：22 端口的 RST 是设备本地终结的，不需要解析后端 MAC；
转发端口则必须先把包送到后端主机。**故障只发生在"需要找到后端"的那条路径上。**

---

## 六、一次错误归因（以及为什么被打脸）

服务器上 `auth.log` 的数字很吓人：

```
185745  Connection closed by invalid user ...
 78217  Connection closed by authenticating user ...
攻击源 TOP: 单一来源 9 万+ 次，次高 1.7 万+ 次
```

我当时的推断是：爆破把上游 NAT 设备的会话表打满了，于是新建连接被拒。
听起来很顺——**但它解释不了现象**。

一句质疑就把这个结论推翻了：`lastb -n 20` 看下来每分钟也没几个，这量级怎么可能撑爆会话表？

质疑是对的，而且还有一层：`lastb` 读的是 `btmp`，只有**真正走到认证阶段并失败**的记录才会落盘；
上面那 18 万条大多是 `[preauth]` 阶段就被关掉的，根本不进 `btmp`。所以 `lastb` 严重低估了 TCP 新建速率。

**但即便按真实速率算，也只有 1~2 次/分钟**。再看服务器实况：estab 95、conntrack 544/262144、流量 149kbps。
这个量级连一台家用路由器的会话表都填不满。归因不成立，撤回。

> **教训 2**：一个假设必须能解释**全部**特征，尤其是"阵发性"和"多源同步"。
> 爆破是均匀的背景噪音，它产生不了"闸门每 30~70 秒开合一次、且对所有客户端同时开合"这种形态。
> 相关 ≠ 因果，数字大 ≠ 是原因。

---

## 七、决定性实验：在服务器抓包，看 SYN 到底来没来

同时做两件事：服务器端抓包，客户端按秒探测并打时间戳。

服务器端 100 秒窗口内**实际到达**的 SYN：

| 源 | 发出 | 到达 | 到达率 |
|---|---|---|---|
| 本机 | ~37 | 12 | 32% |
| 机器 C（公有云） | ~20 | 7 | 35% |
| 机器 B | ~12 | 1 | 8% |

**失败的尝试，SYN 一个都没到服务器。** 配合第四步（服务器没发过 ICMP），
可以确定：包在到达 VM 之前就被上游设备拒了。

再看三地成功时刻的对照：

```
本机 OK: 17:56:38 17:56:40 17:57:05 17:57:07 17:57:09 17:57:11 17:57:52
机器 C OK: 17:56:39 17:56:41 17:57:05 17:57:07 17:57:09 17:57:11 17:57:52 17:57:55 17:57:57
```

两个完全独立的网络，成功时刻**逐秒吻合**。闸门是按目的地统一开合的，不是针对某个源 IP。

---

## 八、下探到 L2：102 次询问，1 次应答

既然上游"够不着后端"，那就看它到底在够什么。在服务器 `eth0` 上抓 ARP：

```bash
tcpdump -ni eth0 -tttt -e "arp"
```

100 秒的结果：

```
上游网关的询问：who-has 172.31.0.174 tell 172.31.0.1     84 次（约 1 次/秒，持续不断）
VM 的应答     ：Reply 172.31.0.174 is-at 02:00:00:00:00:11    1 次
对照邻居 .142 ：询问 29 次 / 应答 30 次（正常机器是这样的）
```

网关的目的 MAC 完全正确（先 3 次单播到 VM 的 MAC，再转广播），说明**云侧 MAC 绑定没问题**。
是 VM 自己**不应答 ARP**。

更硬的证据在内核统计里：

```
/proc/net/stat/arp_cache:  rcv_probes_mcast = 0    rcv_probes_ucast = 0
```

"收到探测"的计数器恒为 0 —— 说明 `arp_process()` **根本没走到处理请求那一步就提前返回了**。

还有一个诡异的时间巧合：VM 自己发出 ARP 请求的那一刻，SYN 立刻就开始进来了。

```
09:33:15.540123  ARP, Request who-has 172.31.0.1 tell 172.31.0.174   ← VM 主动发帧
09:33:15.540813  198.51.100.7.54379 > 172.31.0.174.22: Flags [S]   ← 0.7 毫秒后 SYN 到达
09:34:03.668234  ARP, Request who-has 172.31.0.1 tell 172.31.0.174   ← 又一次
09:34:03.669182  SYN 恢复
```

**每一次"闸门打开"，都精确对应 VM 自己向外发了一帧。**
上游只能靠偷看 VM 发出的帧来重新学习它的 MAC —— 因为它问不到答案。

---

## 九、实锤：martian source

`arp_process()` 在回应答之前会先调 `ip_route_input_noref()` 做一次入向路由校验，
校验不过就静默 `return`，**不回包、不记日志**（除非你打开 `log_martians`）。

打开它，观测 20 秒：

```bash
echo 1 > /proc/sys/net/ipv4/conf/all/log_martians
echo 1 > /proc/sys/net/ipv4/conf/eth0/log_martians
```

```
IPv4: martian source 172.31.0.174 from 172.31.0.1, on dev eth0
IPv4: martian source 172.31.0.174 from 172.31.0.1, on dev eth0
IPv4: martian source 172.31.0.174 from 172.31.0.1, on dev eth0
... 每秒一条，频率与网关的 ARP 询问完全一致
```

**内核认为"来自 172.31.0.1 的包"是火星包**——因为在这台机器看来，`172.31.0.1` 是它自己的地址。

为什么？看路由表：

```
172.31.0.0/24 dev eth0            proto kernel scope link src 172.31.0.174     ← VM 真实网段
172.31.0.0/16 dev br-xxxxxxxxxxxx proto kernel scope link src 172.31.0.1       ← Docker 网桥
local 172.31.0.1 dev br-xxxxxxxxxxxx table local proto kernel scope host       ← 致命的一条

$ ip route get 172.31.0.1
local 172.31.0.1 dev lo table local src 172.31.0.1
```

`br-xxxxxxxxxxxx` 是 Docker 网络 `stack-net` 的网桥，网段 `172.31.0.0/16`，
Docker 给它分配的地址正是 **`172.31.0.1`——云网关的地址**。

> 注：`rp_filter=2`（松散模式）也拦这种情况。松散模式放过的是"回程接口不匹配"，
> 但"源地址是本机自己的地址"属于 martian source，照样拒。

---

## 十、根因：Docker 默认地址池的最后一格

Docker 内置的本地地址池是 `172.17.0.0/16` 一路排到 `172.31.0.0/16`。
这台机器跑了 101 个容器、37 个自定义网络，`172.17`~`172.30` **全部耗尽**，
于是新建网络时兜底分到了最后一格：`172.31.0.0/16` —— 正好覆盖宿主机自己的 `172.31.0.0/24`。

而这台机器的部署脚本自带"换段"逻辑（`lib.sh` 里的 `pick_free_prefix` / `subnet_free` / `rewrite_private_prefix`），
但它有两个盲区：

```python
# 只在 172.20 ~ 172.31 里找
for b in range(20, 32):
    cand = ipaddress.ip_network(f'172.{b}.0.0/16')
    if not cand.overlaps(want) and free(cand):   # free() 只遍历 docker network 的网段
        ...
```

1. 候选范围恰好包含 172.31；
2. `free()` **只查 Docker 网络的网段，不查宿主机自己的接口和路由**。

所以它理直气壮地认定 `172.31.0.0/16` 空闲，选了它。
备份目录 `backups/<时间戳>-netswitch` 的时间戳与该网络的创建时间**秒级吻合**
——故障起点就是那次自动换段。

---

## 十一、把所有现象串起来

一条因果链解释全部症状：

```
Docker 网段 172.31.0.0/16 抢走网关 IP 172.31.0.1
        ↓
local 路由表出现 local 172.31.0.1 → 内核认为网关是自己
        ↓
网关发来的 ARP 询问被判为 martian source，arp_process() 静默返回，不回 ARP
        ↓
上游路由器的 neigh 条目解析失败 → 3 次单播 + 3 次广播探测 → FAILED
        ↓
对任何需要转发的新建 TCP 连接回 ICMP type3 code1 → 客户端 EHOSTUNREACH / "No route to host"
        ↓
只有当 VM 自己向外发帧时（每 30~50 秒 ARP 一次网关），路由器才能从源 MAC 重新学到它
        ↓
放行 8~10 秒 → 条目再次过期 → 继续拒绝
```

于是每个"讲不通"的现象都有了解释：

| 现象 | 解释 |
|---|---|
| ping 0% 丢包 | ping 通只证明"持有该公网 IP 的设备"活着，**不证明后端 VM 可达** |
| 端口 22 永远秒回 RST | 无转发规则，设备本地终结，不需要后端 MAC |
| 22174/56000/59300 同起同落 | 凡需建 NAT 会话的转发路径，一律受阻 |
| 失败成段、成功也成段 | 路由器只在"偷看到 VM 发帧"后短暂恢复 |
| 多地客户端成功时刻逐秒吻合 | 闸门按目的地开合，与源无关 |
| 已建立连接大多能撑住 | 转发表项已存在，不需要重新解析 MAC |
| 服务器各项指标全绿 | 故障点根本不在服务器上 |

---

## 十二、修复

`.env` 里的 `NET_PREFIX=172.31` 是唯一改点（所有 compose 的 `ipv4_address` 都写成 `${NET_PREFIX}.0.x`），
网络声明为 `external: true`、数据卷也全是 `external: true`，因此 `down` 不会碰数据。

```bash
# 1. 备份：.env、private/、原网络定义、11 个容器的完整 inspect
# 2. 拆除三个 compose 项目（-t 60 优雅停，绝不加 -v）
docker compose -f compose.<应用组>.yml   down -t 60
docker compose -f compose.<中间件组>.yml down -t 60
docker compose -f compose.<基础组>.yml   down -t 60
# 3. 删网络
docker network rm stack-net
# 4. 复用项目自带函数改写 9 个 private/*.env（自动备份），并写回 .env
. ./bin/lib.sh
rewrite_private_prefix 172.31 172.40 "$TS" $conflict_files
env_upsert "$ENV_FILE" NET_PREFIX 172.40
# 5. 用项目自带 init.sh 建新网络（--subnet 172.40.0.0/16）
./bin/init.sh
# 6. 按依赖顺序拉起（基础 → 中间件 → 应用），只恢复原本在跑的服务
docker compose -f compose.<基础组>.yml   up -d <基础服务>
docker compose -f compose.<中间件组>.yml up -d <中间件服务>
docker compose -f compose.<应用组>.yml   up -d <应用服务>
```

整个脚本用 `setsid nohup` 脱离 SSH 会话执行、全程记日志、失败自动回滚
——因为**此时的 SSH 本身就有 70% 概率连不上**，交互式操作随时会被打断在半路。

选 `172.40` 而不是让脚本自动挑：`pick_free_prefix()` 只在 172.20~31 里找，
删掉旧网络后 `172.31.0.0/16` 又变"空闲"，**它会把同一个坑再踩一遍**。

> 这套流程后来跑了两遍。第二遍的起因见第十四节——上面这段话不幸言中。

---

## 十三、验证

| 指标 | 修复前 | 修复后 |
|---|---|---|
| 网关 ARP 询问 / VM 应答（90~100s） | 84~102 次 / **1 次** | **2 次 / 2 次** |
| `martian source` 日志 | ~1 条/秒 | **0 条** |
| `local` 表里的 `172.31.0.1` | 存在 | **0 条** |
| 本机完整 SSH 握手 40 次 | 失败 30~70% | **40/40 成功** |
| 拆网瞬间的本地探测 | 14/14 失败 | ≈200 次仅 1 次失败 |
| 机器 C | 13~16/25 失败 | **0/30** |
| 机器 B（真实 ssh 客户端） | — | **0/10** |
| 持续会话 100 秒（故意关掉 keepalive） | 频繁断 | **无中断** |
| 容器 | — | **10/10 healthy**，配置已同步到 172.40 |

拆网那一刻的效果立竿见影：`local 172.31.0.1` 消失后，网关从"每秒问一次、问不到"
变成"问一次就拿到答案"，30 秒内询问次数从 84 降到 **1**。

（第二遍迁移后复测的数字与此一致：`local` 表 0 条、120 秒内 ARP 询问 2 / 应答 2、
martian 0 条、三地连通性 0 失败、24 个容器全部重建且无缺失。）

---

## 十四、修复之后：一小时后它原样复发

上午 10:26 验收通过：40/40 握手成功、martian 0 条、ARP 2 问 2 答。我以为事情结束了。

**11:36，同事部署了一套新版本**，新网络又被建在 `172.31.0.0/16`。一小时后复测：

| 指标 | 我验收时(10:26) | 复发后(13:24) |
|---|---|---|
| 20 秒内 ARP 询问 / 应答 | 2 / **2** | 16 / **0** |
| martian 日志 | **0** | **18 条 / 20 秒** |
| 本地 20 次连接 | 0 失败 | **11 失败** |

原因就写在他们的脚本里：`ensure_network` 发现期望网段被占（我上午建的那个网络还在），
于是走自动换段；`pick_free_prefix()` 在 172.20~31 里找空闲段——
**172.31 刚好被我腾空了**，于是它理所当然地选了 172.31。
连带把我写进 `.env` 的 `NET_PREFIX=172.40` 覆盖回 `172.31`，`private/*.env` 也被反向改写了一遍。

> **教训 3：腾空一个危险资源，等于把它重新放回自动分配的候选池。**
>
> 如果当时 172.31 还被旧网络占着，`pick_free_prefix()` 会找不到空闲段而直接 `die` 报错——
> 那是一次**响亮的失败**。我的"顺手清理"把它变成了**静默的复发**。
>
> 推论：**修一个由自动化产生的问题，必须同时修那个自动化**，
> 否则你只是在两次触发之间做了一次清理。

---

## 十五、一个失败的止血方案，和一个更危险的假阳性

复发时那套栈有 23 个容器、是同事刚部署的、当时还有人在线，全量重建要停机几分钟。
于是我找了个"零停机"的止血方案。

**推理**：martian 判定发生在 `arp_process()` → `ip_route_input_noref()` → `fib_validate_source()`，
而后者受 `rp_filter` 控制；那么把 `rp_filter` 置 0 就该跳过校验、让 ARP 应答恢复。

```bash
sysctl -w net.ipv4.conf.all.rp_filter=0 net.ipv4.conf.eth0.rp_filter=0
```

**实测结果：假设是错的。**

```
90 秒观测：网关 ARP 询问 68 次 / 本机应答 0 次 / 新增 martian 日志 69 条
```

"源地址是本机自己的地址"这种 martian 判定**不受 `rp_filter` 门控**，置 0 也照拦。
我对内核代码路径的推断错了，而且没有在实施前先花 5 秒做个小实验验证它。

### 真正危险的部分

同一时间，端到端测试**全绿**：

```
本机完整 SSH 握手 50 次 : 失败 0
另一地 TCP 探测 30 次   : 失败 0
第三地真实 ssh 10 次    : 失败 0
```

机制指标全红、端到端指标全绿——如果只看后者，我会宣布"止血成功"然后收工。

原因藏在负载里：那台机器的 load 从 2 涨到了 **11.9**，115 个容器在猛发流量。
Linux 的 neigh 条目会在**收到对端任何一帧时按源 MAC 刷新**，
所以网关的 ARP 缓存被持续续命，压根没走到"需要重新解析"那一步。

**故障机制完好无损，只是被流量掩盖了。** 一旦机器闲下来（夜里、周末、故障排查时把业务停掉），
neigh 条目过期 → PROBE 三次无应答 → FAILED → 新建连接全被 ICMP 拒绝。
这也正好解释了最初那个"成段失败、成段恢复"的阵发形态：**恢复窗口就是宿主机恰好在发流量的时候**。

> **教训 4：端到端成功率不能用来验证机制类修复。**
>
> 要测机制本身：ARP 应答率、martian 计数、`local` 路由表条目。
> 这三项在这次事故里从头到尾都是最可靠的判据，而连通性测试骗过我一次。
>
> **教训 5：验证要在低负载下做。** 高流量会掩盖一切依赖缓存/条目过期的故障。
> 反过来说，一个"负载上来就好了"的网络故障，几乎一定是缓存类问题。

---

## 十六、断根：给自动选段补上宿主机网段

止血方案撤掉（`rp_filter` 恢复 2、删除持久化文件），然后做真正该做的两件事。

### 1. 修那个会自动选中危险网段的函数

三处加法式改动，不动原有逻辑：

```bash
# 宿主机自身占用的网段（排除 docker 网桥与虚拟口）
host_subnets() {
  ip -4 -o addr show 2>/dev/null \
    | awk '$2 !~ /^(lo|docker[0-9]*|br-|veth|virbr|cni|flannel|tunl|kube|nw-)/ {print $4}'
}

subnet_free()      { _subnet_plan free "$1" "$(network_subnets) $(host_subnets)"; }
pick_free_prefix() { _subnet_plan pick "$1" "$(network_subnets) $(host_subnets)"; }
```

```python
# 候选范围：172.20-31（原有）耗尽后继续 172.40-59，
# 关键是必须能"逃出" Docker 内置池的最后一格 172.31
for b in list(range(20, 32)) + list(range(40, 60)):
```

打完补丁立刻验证（改代码不验证等于没改）：

```
host_subnets()            => 172.31.0.174/24
subnet_free 172.31.0.0/16 => 已占用   ✓（被宿主机网段挡住）
pick_free_prefix 172.31   => 172.41   ✓（不再是 172.31）
bash -n                   => 通过     ✓
```

### 2. 把迁移做成可交付的脚本

第二次迁移面对的是 24 个容器、7 个 compose 组、其中 5 个 worker 还挂在 `profiles` 下。
脚本要点（都是这次踩出来的）：

- `--dry-run` 先打印全部动作，不碰任何东西
- 预检：flock 是否被占、有无部署进程在跑、新旧前缀、**新前缀是否撞上宿主机网段**、磁盘余量、镜像是否都在本地
- 备份：`.env`、`private/`、网络定义，以及**每个容器的完整 `docker inspect`**
- 复用项目自带的 `rewrite_private_prefix()` / `env_upsert()` / `init.sh`，不手搓 sed
- 按部署脚本的顺序、经其 `dc()` 封装拉起——它才会自动带 `--profile workers`，
  直接 `docker compose up -d` 会**静默漏掉那 5 个后台 worker**
- 每组 `up` 之后等 healthy 再进下一组，避免应用抢在数据库就绪前启动
- 任一步失败自动回滚（还原配置 + 用旧网段重建网络 + 重新拉起）
- 全程 `setsid nohup` 脱离 SSH 会话执行并落日志——**因为此时 SSH 本身就有 70% 概率连不上**，
  交互式操作随时会被打断在半路，留下一个既没拆完也没建好的中间态

第二次迁移的结果：`local 172.31.0.1` = 0 条，120 秒内 ARP 询问 2 / 应答 2，martian 0 条，
三地连通性 0 失败，24 个容器全部重建、与迁移前基线逐一比对无缺失。

---

## 十七、复盘

### 七个自己踩的坑

1. **`pkill -f "ping -D -i 0.5"` 把自己的 shell 杀了**（exit 143）——
   因为父 shell 的命令行里就含这个字符串，`-f` 匹配整条命令行。
2. **`grep -c 'reply'` 漏掉了 tcpdump 输出的 `Reply`**（首字母大写），
   一度得出"VM 完全不应答 ARP"的结论。真实数字是 1/102，虽然结论方向没错，但**数字错了就是错了**。
3. **机器 B 的测试数据 100% 是假的**：它的登录 shell 是 zsh（不支持 `/dev/tcp`），
   而且没有 `timeout`/`ip`/`ss`。所有"失败"其实都是 `command not found`。
   我据此得出过"机器 B 20/20 全被拒"的错误结论。换成真实 ssh 客户端复测是 10/10 全通。
4. **把爆破当成主因**（见第六节）。
5. **`grep -c healthy` 会把 `unhealthy` 也数进去**（子串匹配），于是我一度报告"24 个容器全部 healthy"，
   实际是 23 healthy + 1 unhealthy。统计健康数要用 `docker ps --filter health=healthy`，不要 grep 状态字符串。
6. **在 `sh -c` 里用 `/dev/tcp` 测端口**——`/dev/tcp` 是 **bash** 内建，dash / busybox sh 不支持，
   于是所有探测都返回"不通"。这个坑我踩了两次：一次让某台跳板机的全部测试数据变成假的，
   一次让我误判容器间网络不通。**跨机器批量探测前，先确认对端的 shell 和内建支持。**
7. **相信了自己对内核代码的推断**（`rp_filter` 门控 martian 判定），没做 5 秒小实验就上了生产（见第十五节）。

> **教训 6**：测量工具本身必须先被验证。
> 跨机器批量探测时，先确认目标机的 shell、`timeout`、`/dev/tcp` 支持情况；
> 否则你测的是"命令是否存在"，不是"网络是否连通"。

### 九条方法论

1. **对照实验优先于单点测量**。同时测一个已知正常的目标，一次就能砍掉一半假设空间。
2. **错误码要读准**。`EHOSTUNREACH` / `ECONNREFUSED` / `ETIMEDOUT` 分别对应
   "收到 ICMP 拒绝" / "收到 RST" / "什么都没收到"，指向完全不同的故障层。
3. **ICMP 通不代表可达**。公网 IP 上的 ping 很可能由 NAT/防火墙设备代答，
   它证明的是"那个设备活着"，与后端主机毫无关系。
4. **假设必须能解释形态，不只是解释存在**。
   "阵发性""多源同步""端口 22 例外"这三个特征，直接把"会话表被爆破打满"排除掉了。
5. **逐层下探，直到看见包**。IP 层看不出问题就看 ARP，ARP 看不出就开 `log_martians`。
   内核的静默丢弃，往往只差一个开关就能变成日志。
6. **机制指标 > 端到端指标**。验证修复要测机制本身（ARP 应答率、martian 计数、路由表条目），
   端到端成功率会被流量、缓存、重试掩盖。
7. **修自动化产生的问题，必须同时修自动化**；顺手"清理"危险资源，可能正是让自动化重新选中它的前提。
8. **动手前把基线存下来**。这次能一句话讲清"某容器的 unhealthy 早于我的改动"，
   靠的是迁移前备份的 `docker inspect`——里面带着旧实例的健康检查时间戳。
   （那个容器的真实原因是应用配置校验失败：管理员初始密码强度不够，与网络无关。）
9. **假设先做小实验，再上生产**。尤其是"我读代码觉得应该是这样"的假设。

---

## 十八、附录：命令速查

```bash
# 判断是谁在发 ICMP 拒绝（需要一台有 root 的第三方机器）
tcpdump -ni any -tttt -v "icmp and host <目标IP>"

# 交叉端口测试：区分"全局限速"与"转发路径故障"
for p in 22174 56000 22 80; do
  timeout 4 bash -c "exec 3<>/dev/tcp/<IP>/$p" 2>&1 | sed 's/bash: connect: //'
done    # No route to host=ICMP拒绝 / refused=RST / 空+超时=静默丢包

# 服务器端：SYN 到底来没来
tcpdump -ni any -tttt "tcp port 22 and tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0"

# L2 层：ARP 询问与应答
tcpdump -ni eth0 -tttt -e "arp"
grep -c 'who-has <本机IP>' cap.txt ; grep -ic 'is-at' cap.txt   # 注意 Reply 首字母大写

# 内核 ARP 统计（收到探测的计数）
cat /proc/net/stat/arp_cache

# 打开 martian 日志（静默丢弃变可见）
echo 1 > /proc/sys/net/ipv4/conf/all/log_martians
echo 1 > /proc/sys/net/ipv4/conf/eth0/log_martians

# 排查 Docker 网段与宿主机网段冲突
ip -4 route show table all | grep <宿主机网段>
ip route show table local | grep <网关IP>          # 有 local <网关IP> 就是出事了
docker network ls -q | xargs docker network inspect -f '{{.Name}}: {{range .IPAM.Config}}{{.Subnet}}{{end}}'
```

### 预防

- **给 Docker 显式指定 `default-address-pools`**，避开云上私网段；
  或者在所有 `docker network create` / compose 里显式写死 `subnet`，不依赖自动分配。
- 部署脚本做网段冲突检测时，**必须把宿主机自己的接口地址和路由表算进去**，
  只查 `docker network ls` 是不够的。
- 云上虚拟机的 Docker 网段，建议整体挪到 `10.x` 或 `172.40+` 这类不会与 VPC 私网段相撞的范围。
- 排障期间若 SSH 本身不稳，**所有远端操作都写成脚本 + `setsid nohup` 后台跑 + 落日志**，
  别指望交互式会话能撑完；脚本要带 `--dry-run`、预检、备份和自动回滚。
- **自动选段的候选范围必须能逃出 Docker 内置池**（`172.17.0.0/16`~`172.31.0.0/16`）。
  池耗尽时它一定会落到最后一格，而那一格极易与云上 VPC 私网段相撞。
- 交付出去的修复，**验证要看机制指标，并且最好在低负载下复测一次**——
  高流量会把所有依赖缓存过期的故障掩盖成"已经好了"。
- 改动生产前把基线（容器 inspect、路由表、计数器）存成文件，
  事后才说得清哪些问题是既有的、哪些是自己引入的。
