---
title: "并查集"
date: 2026-03-12
tags: ["算法"]
summary: "并查集"
---
**并查集（Union Find / Disjoint Set Union）** 是一种用于管理分组的数据结构（一般使用树形结构来表示）~

（1）Find：查询 a 元素和 b 元素是否为同一组（只需要判断他们的 root 根节点是否为同一个即可）

（2）Union：合并元素 a 和 b 为同一组


代码

```python
class DSU:
    def __init__(self, parent: list[int]):
        this.parent = parent
        
    def find(self, x: int):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
        
    def union(self, x: int, y: int):
        px = self.find(x)
        py = self.find(y)
        self.parent[px] = py
```
