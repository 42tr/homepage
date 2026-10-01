---
title: "地理位置搜索"
date: 2025-01-08
tags: ["兴趣"]
summary: "搜索一个位置附近的地址位置点~"
---

如何索引一个地理位置？地理位置由经度、维度组成，常用的索引结构都是一维的，从这方面入手，需要将二维的位置信息转化成一维的。

## 方式一：使用 `geohash`
`geohash` 是一种将经纬度编码为字符串的算法，它将经纬度映射到一个64位的整数上，从而实现对地理位置的索引。参考：[GeoHash核心原理解析](https://www.cnblogs.com/LBSer/p/3310455.html)

简单来说，先把地图展开，然后按照一定的精度，将地图分成 n 个区域，每个区域的点计算得到的 hash 值是相同的，并且每块区域周围的 8 个区域的 hash 值也是可以计算的。

当我们想要搜索一个点附近有哪些别的点时，只需要计算其 hash，就可以找到其所在的区域。在其区域附近找，需要遍历的就很少。

![image.png](/blog/images/03a59fb9ca87c7839a507a9e737669b9.image.png)

问题点：每个区域都是矩形，但是距离一个点相同距离的点形成的是圆形，在搜索附近的位置点时会有问题。如：点所在区域的右上角的区域有个点，但不一定这个点比区域右边的右边的点近，说起来有点绕，看图~

![image.png](/blog/images/8b9f6ceb8bd9f3018dd2654ec0150aad.image.png)


不管矩形怎么设计都可能有这样的问题，这就导致在向外扩张搜索区域时，不好判断扩张方式。

[查看 rust demo 源码](https://github.com/42tr/42tr.github.io/blob/42tr/public/geo.zip)

## 方式二：使用 R 树
参考：[维基百科 R-tree](https://zh.wikipedia.org/wiki/R%E6%A0%91)

R树是用来做空间数据存储的树状数据结构。例如给地理位置，矩形和多边形这类多维数据建立索引。R树的核心思想是聚合距离相近的节点并在树结构的上一层将其表示为这些节点的最小外接矩形，这个最小外接矩形就成为上一层的一个节点。R树的“R”代表“Rectangle（矩形）”。因为所有节点都在它们的最小外接矩形中，所以跟某个矩形不相交的查询就一定跟这个矩形中的所有节点都不相交。

![image.png](/blog/images/78463154ddbe47fac4599991275649cb.image.png)


rust 开源库：[rstar](https://github.com/georust/rstar)

[查看 rust demo 源码](https://github.com/42tr/42tr.github.io/blob/42tr/public/geo2.zip)

## 方式三：使用 redis、elasticsearch 等中间件
参考：[Redis GEO & 实现原理深度分析](https://juejin.cn/post/6844903772984967182)

不是重点，不做详细介绍。

## 尾
Haversine 公式可以用于计算两个地理位置之间的距离。
