---
title: "GIS demo"
date: 2025-09-11
tags: ["web"]
summary: "GIS demo"
---
![image.png](/blog/images/948aae03beb2c2e5f31a9c6668469284.image.png)

[【下载数据】](https://data.maptiler.com/downloads/planet/)

案例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Offline Map with tileserver-gl</title>
    <!-- 使用官方 Mapbox GL JS（但我们将绕过 token 验证） -->
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
    <style>
        body { margin: 0; padding: 0; }
        #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    </style>
</head>
<body>
<div id="map"></div>

<script>
    // 👇 虽然我们不使用 Mapbox 服务，但 mapbox-gl.js 仍强制检查 token
    //    我们给一个假的 token 避免报错（不会联网验证，因为源是本地的）
    mapboxgl.accessToken = 'no-token'; 

    // 创建地图
    const map = new mapboxgl.Map({
        container: 'map',
        // 使用 tileserver-gl 自动生成的 style.json
        style: 'http:/192.168.0.46:20001/styles/basic-preview/style.json',
        center: [116.4, 39.9], // 北京大致坐标 [lng, lat]
        zoom: 10,
        hash: true
    });

    // 添加导航控件
    map.addControl(new mapboxgl.NavigationControl());

    // 地图加载完成后打印信息
    map.on('load', () => {
        console.log('地图加载成功！');
    });

    // 捕获错误（调试用）
    map.on('error', (e) => {
        console.error('地图错误:', e);
    });
</script>
</body>
</html>
```
