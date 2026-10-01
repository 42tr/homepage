---
title: "克鲁斯卡尔（Kruskal）算法"
date: 2026-03-19
tags: ["算法"]
summary: "最小生成树算法"
---
![image.png](/blog/images/c7acc431b3ce8354959da1a6bdf295c6.image.png)

克鲁斯卡尔算法（Kruskal Algorithm）是一种用于求解最小生成树（Minimum Spanning Tree, MST）的经典贪心算法，适用于无向加权图。

**核心思想**：每次选择当前权重最小、且不会形成环的边加入生成树。

**关键点**：使用并查集判断是否会形成环。

**时间复杂度**
- 排序边：O(E log E)
- 并查集操作：近似 O(E α(N))（α 是反阿克曼函数，极小）

总体复杂度：O(E log E)

代码：
```python
def kruskal(n: list, edges: list[list[int]]): # [[端点1, 端点2, 权重], ...]
    edges.sort(key=lambda x: x[2])  # 按权重排序
    dsu = DSU(n)
    mst = []
    
    for u, v, w in edges:
        if dsu.find(u) == dsu.find(v):
            continue
        dsu.union(u, v)
        mst.append((u, v, w))
  
    return mst
```

练习题：[3600.升级后最大生成树稳定性](https://leetcode.cn/problems/maximize-spanning-tree-stability-with-upgrades/description/)
