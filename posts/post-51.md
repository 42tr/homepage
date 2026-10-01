---
title: "Rust LanceDB 内存不足问题"
date: 2026-03-20
tags: ["rust"]
summary: "线上 Rust LanceDB 报错问题处理~"
---

![](/blog/images/f208dec396b94e50cd6c283eeb3a6ced.0249f7d955002a045e0e1503995afb5f.jpg)

报错内容：
```log
thread '<unnamed>' (245) panicked at library/std/src/sys/pal/unix/stack_overflow.rs:231:13:
failed to set up alternative stack guard page: Cannot allocate memory (os error 12)
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

thread '<unnamed>' (246) panicked at library/std/src/sys/pal/unix/stack_overflow.rs:231:13:
failed to set up alternative stack guard page: Cannot allocate memory (os error 12)
2026-03-19 15:07:33 [lance_io::local] DEBUG - get_range: range=713265..717361

thread '<unnamed>' (247) panicked at library/std/src/sys/pal/unix/stack_overflow.rs:227:13:
failed to allocate an alternative stack: Cannot allocate memory (os error 12)
2026-03-19 15:07:33 [lance_io::local] DEBUG - open; path=Path { raw: "app/data/lancedb_data/documents.lance/data/3836854-10fc-49da-af99-3315c0982ed4.lance" } block-size=4096 know.
fatal runtime error: failed to initiate panic, error fatal runtime error: failed to initiate panic, error fatal runtime error: failed to initiate panic, error 555, aborting
, aborting
, aborting
memory allocation of 41 bytes failed
```
### 猜测一：RAM 不足
从报错可以看到是内存分配失败，启动时监控内存 `free -mh`，内存变化不大，确认不是 RAM 不足。

### 猜测二：Docker 容器限制
猜测是 Docker 容器限制了内存使用，修改 `docker-compose.yaml`
```yaml
services:
  app:
    image: your-image
    mem_limit: 128g
```
发现还是不行。

### 猜测三：虚拟内存不足

![image.png](/blog/images/4e1af38d3ebaf1bdb0206df4cb9f2fee.image.png)
根据AI推理，修改 stack 大小
```yaml
services:
  app:
    ulimits:
      stack: 1024
```
仍然不行。

尝试增加 swap，依然不行。

### 猜测四：mmap（实际问题）
因为 lancedb 会把数据读到 mmap 提高访问速度

查询系统允许的最大 mmap 数量
```shell
> cat /proc/sys/vm/max_map_count
262162 /proc/2440330/maps
```

查询 mmap 数量
```shell
pid=$(pgrep -f '/app/htknow|htknow' | head -n1)
wc -l /proc/$pid/maps
```

临时修改
```shell
sysctl -w vm.max_map_count=1048576
```
再启动就 ok 了，确认是该问题。

持久化配置
```shell
echo 'vm.max_map_count=2097152' | sudo tee /etc/sysctl.d/99-htknow.conf
sudo sysctl --system
```
