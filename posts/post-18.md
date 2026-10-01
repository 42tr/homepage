---
title: "树莓派小车"
date: 2025-02-28
tags: ["树莓派"]
summary: "Raspblock 视觉全向车"
---

![image.png](/blog/images/2be159235c7dba6298401cc7211957b9.image.png)

# 安装
按教程来即可
# 使用
由于我使用的树莓派5，使用官方提供的镜像时发现在树莓派5上不可用，只能自己安装树莓派官方镜像后，使用网关提供的脚本自己运行 python。

# 遇到的问题与解决方式
原本的教程中最新的是树莓派4b，买了最新的树莓派5之后，发现与之前的树莓派有不同，在使用 raspblock 时会报错
```log
Traceback (most recent call last):
  File "/usr/lib/python3/dist-packages/serial/serialposix.py", line 322, in open
    self.fd = os.open(self.portstr, os.O_RDWR | os.O_NOCTTY | os.O_NONBLOCK)
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: '/dev/ttyAMA0'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/home/ku/Documents/test.py", line 4, in <module>
    robot = Raspblock()
            ^^^^^^^^^^^
  File "/usr/local/lib/python3.11/dist-packages/Raspblock-0.0.1-py3.11.egg/Raspblock.py", line 12, in __init__
  File "/usr/lib/python3/dist-packages/serial/serialutil.py", line 244, in __init__
    self.open()
  File "/usr/lib/python3/dist-packages/serial/serialposix.py", line 325, in open
    raise SerialException(msg.errno, "could not open port {}: {}".format(self._port, msg))
serial.serialutil.SerialException: [Errno 2] could not open port /dev/ttyAMA0: [Errno 2] No such file or directory: '/dev/ttyAMA0'
Exception ignored in: <function Raspblock.__del__ at 0x7fff32f88c20>
Traceback (most recent call last):
  File "/usr/local/lib/python3.11/dist-packages/Raspblock-0.0.1-py3.11.egg/Raspblock.py", line 16, in __del__
AttributeError: 'Raspblock' object has no attribute 'ser'
```
解决方法：在配置文件中增加一行以打开ttyAMA0串口，修改 `/boot/firmware/config.txt`，添加一行 `dtoverlay=uart0`，保存后重启即可

# 参考
- [Raspblock视觉全向车](https://www.yahboom.com/study/Raspblock#xuanzhon_8)
- [树莓派5串口通信](https://blog.csdn.net/weixin_48662810/article/details/139300977)
