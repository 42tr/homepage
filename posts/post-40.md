---
title: "linux 系统监控"
date: 2025-09-25
tags: ["日志"]
summary: "服务有的时候内存会升高，加个日志~"
---

1. 先写个记录日志的脚本

```shell
#!/bin/bash

# 监控 systemctl status x 的脚本
# 作者: Assistant
# 日期: 2024

# 配置变量
SERVICE_NAME="x"
LOG_FILE="/var/log/x_status.log"
MAX_LOG_SIZE=100  # 最大日志文件大小（MB），超过则轮转

# 获取当前时间戳
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 检查 systemctl 命令是否存在
if ! command -v systemctl &> /dev/null; then
    echo "[$TIMESTAMP] ERROR: systemctl command not found" >> "$LOG_FILE"
    exit 1
fi

# 检查服务是否存在
if ! systemctl list-units --full --all | grep -q "^${SERVICE_NAME}\."; then
    echo "[$TIMESTAMP] ERROR: Service '$SERVICE_NAME' not found" >> "$LOG_FILE"
    exit 1
fi

# 获取服务状态信息
STATUS_OUTPUT=$(systemctl status "$SERVICE_NAME" 2>&1)

# 写入日志文件
{
    echo "=== Status check at $TIMESTAMP ==="
    echo "$STATUS_OUTPUT"
    echo "=================================="
    echo ""
} >> "$LOG_FILE"

# 日志轮转功能（可选）
if [ -f "$LOG_FILE" ]; then
    # 获取当前日志文件大小（MB）
    CURRENT_SIZE=$(du -m "$LOG_FILE" 2>/dev/null | cut -f1)
    
    # 如果日志文件超过最大大小，进行轮转
    if [ "$CURRENT_SIZE" -gt "$MAX_LOG_SIZE" ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old"
        echo "[$TIMESTAMP] Log file rotated due to size limit" >> "$LOG_FILE"
    fi
fi

echo "[$TIMESTAMP] Status check completed successfully"
```

2. 创建服务文件 `/etc/systemd/system/x-monitor.service`
```
[Unit]
Description=Monitor X service status
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/monitor_x_status.sh
User=root
```

3. 创建定时器文件 `/etc/systemd/system/x-monitor.timer`
```
[Unit]
Description=Run X service monitor every minute
Requires=x-monitor.service

[Timer]
OnCalendar=*:*:00
Persistent=true

[Install]
WantedBy=timers.target
```

4. 启用并启动定时器
```
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用并启动定时器
sudo systemctl enable --now x-monitor.timer

# 查看定时器状态
sudo systemctl status x-monitor.timer
```

5. 停止监控
```
systemctl disable --now x-monitor.timer
```
