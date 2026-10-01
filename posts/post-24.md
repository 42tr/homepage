---
title: "rust 向量搜索"
date: 2025-04-13
tags: ["rust","搜索"]
summary: "尝试 qdrant 向量搜索~"
---

## 部署向量服务
在 raspberry pi 使用 docker 部署
- 向量数据库：qdrant
- 向量化服务：m3e
    - M3E主要针对中文文本进行向量化处理，但也有一定的双语处理能力
    - M3E属于小模型，资源使用不高，CPU也可以运行，适合私有化部署和资源受限的环境。
```yml
version: '2'
services:
  qdrant:
    image: qdrant/qdrant:v1.13.0
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - "/disk/app/qdrant:/qdrant/storage"
    restart: on-failure

  m3e_api:
    container_name: m3e_api
    environment:
      TZ: Asia/Shanghai
      sk-key: 'sk-42tr'
    image: docker.io/gaord/m3e-large-api:231129
    restart: always
    ports:
      - "6200:6008"
```

## 使用
### 调用向量化 api
```shell
curl --location --request POST 'http://localhost:6200/v1/embeddings' --header 'Authorization: Bearer sk-42tr' --header 'Content-Type: application/json' --data-raw '{
  "model": "m3e",
  "input": ["laf是什么"]
}'
```
问题：使用 树莓派 4b cpu 跑起来太慢了，以上调用就要花 6s 多，一个段落就要 1min，后续尝试部署到带 gpu/npu 的设备。


### 使用 qdrant
使用 rust client，当前代码中未使用向量化服务生成的结果

**Cargo.toml**
```
[package]
name = "test-qdrant"
version = "0.1.0"
edition = "2024"

[dependencies]
anyhow = "1.0.97"
qdrant-client = "1.13.0"
serde_json = "1.0.140"
tokio = { version = "1.44.2", features = ["rt-multi-thread"] }
tonic = "0.13.0"
once_cell = "1.19.0"
uuid = { version = "1", features = ["v4"] }
```
**qd.rs**
```rust
use once_cell::sync::Lazy;
use qdrant_client::qdrant::r#match::MatchValue;
use qdrant_client::qdrant::{
    Condition, CreateCollectionBuilder, Distance, Filter, PointStruct, ScalarQuantizationBuilder,
    SearchParamsBuilder, SearchPointsBuilder, UpsertPointsBuilder, Value, VectorParamsBuilder,
};
use qdrant_client::{Payload, Qdrant};

use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

static COLLECTION_NAME: &str = "x";
static CLIENT: Lazy<Arc<Qdrant>> = Lazy::new(|| {
    let client = Qdrant::from_url("http://192.168.1.3:6334")
        .build()
        .expect("Failed to build Qdrant client");
    Arc::new(client)
});

pub async fn init() -> anyhow::Result<()> {
    CLIENT.delete_collection(COLLECTION_NAME).await?;
    CLIENT
        .create_collection(
            CreateCollectionBuilder::new(COLLECTION_NAME)
                .vectors_config(VectorParamsBuilder::new(10, Distance::Cosine))
                .quantization_config(ScalarQuantizationBuilder::default()),
        )
        .await?;

    let collection_info = CLIENT.collection_info(COLLECTION_NAME).await?;
    dbg!(collection_info);
    Ok(())
}

pub async fn add_points(payloads: Vec<Payload>) -> anyhow::Result<()> {
    let points: Vec<PointStruct> = payloads
        .into_iter()
        .map(|payload| PointStruct::new(Uuid::new_v4().to_string(), vec![12.; 10], payload))
        .collect();
    CLIENT
        .upsert_points(UpsertPointsBuilder::new(COLLECTION_NAME, points))
        .await?;
    Ok(())
}

pub async fn search(
    field: impl Into<String>,
    r#match: impl Into<MatchValue>,
) -> anyhow::Result<Vec<HashMap<String, Value>>> {
    let response = CLIENT
        .search_points(
            SearchPointsBuilder::new(COLLECTION_NAME, [12.; 10], 10)
                .filter(Filter::all([Condition::matches(field, r#match)]))
                .with_payload(true)
                .params(SearchParamsBuilder::default().exact(true)),
        )
        .await?;
    let payloads: Vec<HashMap<String, Value>> = response
        .result
        .into_iter()
        .map(|point| point.payload)
        .collect();
    Ok(payloads)
}
```
**main.rs**
```rust
use qdrant_client::Payload;
mod qd;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    qd::init().await?;
    let payload1: Payload = serde_json::json!(
        {
            "title": "为什么奥特曼不直接放大招打怪兽",
            "content": "奥特曼的技能是打怪兽，而不是放大招。"
        }
    )
    .try_into()
    .unwrap();
    let payload2: Payload = serde_json::json!(
        {
            "title": "同样是带小孩，二哈是二哈，边牧是边牧",
            "content": "二哈是二哈，边牧是边牧，它们都是可爱的宠物。"
        }
    )
    .try_into()
    .unwrap();

    qd::add_points(vec![payload1, payload2]).await?;
    let payloads = qd::search("title", "奥特曼".to_string()).await?;
    println!("{:?}", payloads);

    Ok(())
}
```

## 参考
- [【接入 M3E 向量模型】](https://doc.tryfastgpt.ai/docs/development/custom-models/m3e/)
- [qdrant rust-client](https://github.com/qdrant/rust-client)
