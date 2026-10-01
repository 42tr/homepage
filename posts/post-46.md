---
title: "算力"
date: 2026-01-07
tags: ["操作系统"]
summary: "估算一台机器计算能力~"
---

## 估算方式

- **CPU**：核心数 × 主频 × 每核心每周期 FP32 FLOPs ≈ FP32 GFLOPS
- **GPU**：CUDA cores × 主频 × 2

### 树莓派

```shell
# lscpu
Architecture:             aarch64
  CPU op-mode(s):         32-bit, 64-bit
  Byte Order:             Little Endian
CPU(s):                   4
  On-line CPU(s) list:    0-3
Vendor ID:                ARM
  Model name:             Cortex-A72
    Model:                3
    Thread(s) per core:   1
    Core(s) per cluster:  4
    Socket(s):            -
    Cluster(s):           1
    Stepping:             r0p3
    CPU max MHz:          1800.0000
    CPU min MHz:          600.0000
    BogoMIPS:             108.00
    Flags:                fp asimd evtstrm crc32 cpuid
Caches (sum of all):
  L1d:                    128 KiB (4 instances)
  L1i:                    192 KiB (4 instances)
  L2:                     1 MiB (1 instance)
Vulnerabilities:
  Gather data sampling:   Not affected
  Itlb multihit:          Not affected
  L1tf:                   Not affected
  Mds:                    Not affected
  Meltdown:               Not affected
  Mmio stale data:        Not affected
  Reg file data sampling: Not affected
  Retbleed:               Not affected
  Spec rstack overflow:   Not affected
  Spec store bypass:      Vulnerable
  Spectre v1:             Mitigation; __user pointer sanitization
  Spectre v2:             Vulnerable
  Srbds:                  Not affected
  Tsx async abort:        Not affected
```

注：
- 支持 NEON SIMD，128-bit
- FP32 SIMD vector 长度 4 → 每周期 4 FLOPs
- Cortex-A72 可以做 FMA（乘加） → 每周期 8 FLOPs

理论峰值算力 = 4 × 1.8 GHz × 8 = **57.6 GFLOPS**（FP32）


ARM + 内存带宽限制较明显，经验值：

实际可用 FP32：30% ~ 60% ≈ **17 ~ 35 GFLOPS**

### mac mini m1
#### CPU
FP32 GFLOPS = (P核 × P频率 + E核 × E频率) × 8
```shell
sysctl -n hw.perflevel0.physicalcpu   # 性能核（P-core）
sysctl -n hw.perflevel1.physicalcpu   # 能效核（E-core）
```
看芯片型号
```shell
sysctl -n machdep.cpu.brand_string
```
|芯片|P 核频率|E 核频率|
|-|-|-|
|M1|~3.2 GHz|~2.0 GHz|
|M2|~3.5 GHz|~2.4 GHz|
|M3|~4.0 GHz|~2.8 GHz|

```shell
$ sysctl -n hw.perflevel0.physicalcpu
6

$ sysctl -n hw.perflevel1.physicalcpu
2

$ sysctl -n machdep.cpu.brand_string
Apple M1 Pro

```

算力 ≈ ( 6 x 3.2 + 2 x 2.0 ) x 8 = **185.6 GFLOPS**

Apple Silicon 内存带宽强，但调度保守：

实际可用 FP32 ≈ 60% ~ 80%

≈ **110 ~ 150 GFLOPS**

#### GPU
```shell
$ system_profiler SPDisplaysDataType

Graphics/Displays:

    Apple M1 Pro:

      Chipset Model: Apple M1 Pro
      Type: GPU
      Bus: Built-In
      Total Number of Cores: 14
      Vendor: Apple (0x106b)
      Metal Support: Metal 4
      Displays:
        Color LCD:
          Display Type: Built-in Liquid Retina XDR Display
          Resolution: 3024 x 1964 Retina
          Main Display: Yes
          Mirror: Off
          Online: Yes
          Automatically Adjust Brightness: Yes
          Connection Type: Internal
```
**官方参考 FP32 理论峰值**
|芯片 / 核心数|FP32 TFLOPS|
|-|-|
|M1 Pro 14 核|~2.3 TFLOPS|
|M1 Pro 16 核|~2.6 TFLOPS|

### Linux 服务器
```shell
$ lscpu
Architecture:             x86_64
  CPU op-mode(s):         32-bit, 64-bit
  Address sizes:          46 bits physical, 57 bits virtual
  Byte Order:             Little Endian
CPU(s):                   128
  On-line CPU(s) list:    0-127
Vendor ID:                GenuineIntel
  Model name:             INTEL(R) XEON(R) GOLD 6530
    CPU family:           6
    Model:                207
    Thread(s) per core:   2
    Core(s) per socket:   32
    Socket(s):            2
    Stepping:             2
    CPU max MHz:          4000.0000
    CPU min MHz:          800.0000
    BogoMIPS:             4200.00
    Flags:                fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc a
                          rt arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf tsc_known_freq pni pclmulqdq dtes64 ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr p
                          dcm pcid dca sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb cat_l3 cat_l2 cdp_l3 intel_pp
                          in cdp_l2 ssbd mba ibrs ibpb stibp ibrs_enhanced tpr_shadow flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid cqm rdt_a avx512f avx
                          512dq rdseed adx smap avx512ifma clflushopt clwb intel_pt avx512cd sha_ni avx512bw avx512vl xsaveopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_
                          mbm_local split_lock_detect user_shstk avx_vnni avx512_bf16 wbnoinvd dtherm ida arat pln pts vnmi avx512vbmi umip pku ospke waitpkg avx512_vbmi2 gfni vaes vpclmulq
                          dq avx512_vnni avx512_bitalg tme avx512_vpopcntdq la57 rdpid bus_lock_detect cldemote movdiri movdir64b enqcmd fsrm md_clear serialize tsxldtrk pconfig arch_lbr ib
                          t amx_bf16 avx512_fp16 amx_tile amx_int8 flush_l1d arch_capabilities
Virtualization features:
  Virtualization:         VT-x
Caches (sum of all):
  L1d:                    3 MiB (64 instances)
  L1i:                    2 MiB (64 instances)
  L2:                     128 MiB (64 instances)
  L3:                     320 MiB (2 instances)
NUMA:
  NUMA node(s):           2
  NUMA node0 CPU(s):      0-31,64-95
  NUMA node1 CPU(s):      32-63,96-127
Vulnerabilities:
  Gather data sampling:   Not affected
  Itlb multihit:          Not affected
  L1tf:                   Not affected
  Mds:                    Not affected
  Meltdown:               Not affected
  Mmio stale data:        Not affected
  Reg file data sampling: Not affected
  Retbleed:               Not affected
  Spec rstack overflow:   Not affected
  Spec store bypass:      Mitigation; Speculative Store Bypass disabled via prctl
  Spectre v1:             Mitigation; usercopy/swapgs barriers and __user pointer sanitization
  Spectre v2:             Mitigation; Enhanced / Automatic IBRS; IBPB conditional; RSB filling; PBRSB-eIBRS SW sequence; BHI BHI_DIS_S
  Srbds:                  Not affected
  Tsx async abort:        Not affected
```
注：
- Xeon Gold 6530 支持 AVX512
- 每个 AVX512 vector 寄存器 512 bit → 16 FP32 per vector
- CPU 支持 FMA（乘加） → 每周期每核心可以执行 32 FLOPs

2 × Intel Xeon Gold 6530，一共 128 逻辑核心（64 物理核心 × 2 超线程）

理论峰值算力 = 64 × 4 GHz × 32 = **8.2 TFLOPS**（FP32）

实际可用通常 70–80% ≈ **5.74 ~ 6.56 TFLOPS**

```shell
$ nvidia-smi
Wed Jan  7 17:51:05 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.169                Driver Version: 570.169        CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 4090        Off |   00000000:4B:00.0 Off |                  Off |
| 30%   29C    P8              8W /  450W |    7449MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   1  NVIDIA GeForce RTX 4090        Off |   00000000:4C:00.0 Off |                  Off |
| 30%   31C    P8              8W /  450W |   21079MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   2  NVIDIA GeForce RTX 4090        Off |   00000000:4E:00.0 Off |                  Off |
| 30%   29C    P8             10W /  450W |    3457MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   3  NVIDIA GeForce RTX 4090        Off |   00000000:4F:00.0 Off |                  Off |
| 30%   31C    P8              7W /  450W |    2007MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   4  NVIDIA GeForce RTX 4090        Off |   00000000:CB:00.0 Off |                  Off |
| 30%   33C    P8              7W /  450W |   20443MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   5  NVIDIA GeForce RTX 4090        Off |   00000000:CC:00.0 Off |                  Off |
| 30%   34C    P8              5W /  450W |   20359MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   6  NVIDIA GeForce RTX 4090        Off |   00000000:CE:00.0 Off |                  Off |
| 30%   31C    P8              7W /  450W |   20359MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   7  NVIDIA GeForce RTX 4090        Off |   00000000:CF:00.0 Off |                  Off |
| 30%   32C    P8              5W /  450W |   22098MiB /  24564MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
```
| GPU      | CUDA 核心 | 基本时钟     | FP32 计算能力          |
| -------- | ------- | -------- | ------------------ |
| RTX 4090 | 16,384  | 2.23 GHz | ~82.6 TFLOPS（FP32） |

82.6 TFLOPS × 8 ≈ **660 TFLOPS**（理论峰值）

实际可用（70–80%）≈ **450–500 TFLOPS**


### 对比
|项目|树莓派 4|M1 Pro|服务器|
|-|-|-|-|
|理论 FP32|~58 GFLOPS|~186 GFLOPS|8.2 TFLOPS|
|实际 FP32|~20–30|~110–150| 5.12 ~ 6.56|
|倍数|1×|~5–6×|~170-328x|

|项目|树莓派 4|M1 Pro|服务器|
|-|-|-|-|
|GPU FP32|~10 GFLOPS|~2.6 TFLOPS|~660 TFLOPS|
|AI / 专用计算单元|❌|Neural Engine ≈ 11 TOPS|Tensor Core（4090）≈ 1300+ TOPS INT8|

M1 Pro ≈ 树莓派 100×

8×4090 服务器 ≈ M1 Pro 60×

服务器 ≈ 树莓派 8000×
