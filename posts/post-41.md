---
title: "离线环境下实现经纬度与地区名称双向转换"
date: 2025-10-13
tags: ["gis","python"]
summary: "离线环境下实现经纬度与地区名称双向转换"
---
在很多实际应用场景中，我们无法依赖网络请求（如高德、百度地图 API），例如：
- 内网系统
- 数据安全要求高的环境
- 移动端离线应用
- 批量处理大量地理数据

这时，**离线地理编码（Offline Geocoding）** 就成为必要选择。本文将介绍如何使用 GeoJSON + Shapely 在 Python 中实现 **经纬度 ↔ 地区名称** 的双向转换，并支持计算两地距离。

## 核心思路
- 数据源：使用包含中国行政区划边界的 GeoJSON 文件（如省、市、区县）
- 空间判断：利用 shapely 判断点是否在多边形内（反向编码）
- 几何中心：取行政区多边形的质心作为代表经纬度（正向编码）
- 距离计算：采用 Haversine 公式计算球面距离

## 所需依赖
```python
pip install shapely
```

## 数据准备
以下 `GeoJSON` 文件（可从[阿里云 DataV 地理工具](https://datav.aliyun.com/portal/school/atlas/area_selector?spm=a2ty_o01.29997173.0.0.691f51719yR1dE)下载）：
- `geo_province.json`：省级边界
- `geo_city.json`：市级边界
- `geo_china.json`：区县级边界（全国）

## 核心代码
```python
import json
import math
from shapely.geometry import Point, shape

class OfflineGeocoder:
    def __init__(self, geojson_paths):
        self.features = []
        self.code2name = {}
        for geojson_path in geojson_paths:
            with open(geojson_path, 'r', encoding='utf-8') as f:
                geojson_data = json.load(f)
                self.features.extend(geojson_data['features'])
                for feature in geojson_data['features']:
                    self.code2name[feature['properties']['adcode']] = feature['properties']['name']

        self.name_index = {}
        for feat in self.features:
            props = feat['properties']
            key = f"{props.get('name', '')}"
            self.name_index[key] = feat

    def position2region(self, lat, lon):
        """经纬度 → 地区"""
        point = Point(lon, lat)
        features = []
        for feat in self.features:
            if shape(feat['geometry']).contains(point):
                features.append(feat)
        ans = ""
        for feat in features:
            props = feat['properties']
            temp = ""
            for code in props.get('acroutes', []):
                temp += f"{self.code2name.get(code, '')}-"
            temp += f"{props.get('name', '')}"
            if len(temp) > len(ans):
                ans = temp
        return ans

    def region2position(self, full_name):
        """地区 → 经纬度（质心）"""
        feat = self.name_index.get(full_name)
        if not feat:
            return None
        centroid = shape(feat['geometry']).centroid
        return {'lat': centroid.y, 'lon': centroid.x}

    def distance_of_regions(self, region1, region2):
        """
        地区 → 距离（千米），保留 2 位小数
        """
        pos1 = self.region2position(region1)
        pos2 = self.region2position(region2)
        if not pos1 or not pos2:
            return None
        dis = self.distance_of_position(pos1['lat'], pos1['lon'], pos2['lat'], pos2['lon']) / 1000
        return f"{dis:.2f} km"

    def distance_of_position(self, lat1, lon1, lat2, lon2):
        """经纬度 → 距离（米）"""

        # 将度转换为弧度
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        # 地球半径（米）
        R = 6371000

        # Haversine公式计算两点间距离
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad

        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        distance = R * c
        return distance

Geo = OfflineGeocoder(["geo_china.json", "geo_province.json", "geo_city.json"])
```

测试

```python
from geo_helper import Geo

# 位置转地区
print(Geo.position2region(39.9087, 116.4729))

# 地区转位置
print(Geo.region2position("银川市"))

# 地区距离
print(Geo.distance_of_regions("银川市", "北京市"))
```

### ⚠️ 注意事项
- 地区重名问题：当前实现以“地区名”为 key，若存在重名（如多个“朝阳区”），会覆盖。生产环境建议使用 adcode 或完整路径作为 key。
- 性能优化：若需高频查询，可对多边形建立 R-tree 空间索引（使用 rtree 库）。
- 数据：可以自定义区域，新增对应的 json 文件即可。
