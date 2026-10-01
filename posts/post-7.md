---
title: "docker 镜像源"
date: 2025-01-16
tags: ["树莓派","docker"]
summary: "国内镜像站都失效了"
---

```shell
tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
        "https://hub.urlsa.us.kg",
        "https://hub.haod.eu.org"
  ]
}
EOF
```

:::note{title="来源"}
https://hub.chxza.eu.org/#/
:::
