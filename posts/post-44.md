---
title: "rust 性能测试"
date: 2025-11-20
tags: ["rust"]
summary: "测试 cpu 和写入性能~"
---

`Cargo.toml`
```toml
[package]
name = "test01"
version = "0.1.0"
edition = "2024"

[dependencies]
rand = "0.9.2"
rand_xoshiro = "0.7.0"
rayon = "1.11.0"
```

`main.rs`
```rust
use rand_xoshiro::Xoshiro256PlusPlus;
use rand::{RngCore, SeedableRng};
use std::fs::File;
use std::io::{BufWriter, Write};
use std::time::Instant;
use rayon::prelude::*;   // ← 需要这个

const CHARSET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const LINE_LEN: usize = 100;
const BATCH: usize = 100000;
const TOTAL_LINE: usize = 10_000_000;
const THREAD_NUM: usize = 8;

fn main() {
    rayon::ThreadPoolBuilder::new()
        .num_threads(THREAD_NUM)
        .build_global()
        .unwrap();

    let start = Instant::now();

    (0..THREAD_NUM).into_par_iter().for_each(|chunk| {
        let mut rng = Xoshiro256PlusPlus::seed_from_u64(123456 + chunk as u64);

        let filename = format!("log{}.txt", chunk);
        let file = File::create(filename).unwrap();
        let mut writer = BufWriter::new(file);

        let mut buf = vec![0u8; BATCH * LINE_LEN];

        for _ in 0..(TOTAL_LINE / THREAD_NUM / BATCH) {
            rng.fill_bytes(&mut buf);

            for b in &mut buf {
                *b = CHARSET[(*b & 63) as usize];
            }

            writer.write_all(&buf).unwrap();
        }

        writer.flush().unwrap();
    });

    println!("Time: {:?}", start.elapsed());
}
```

在 m1 macbook pro 8c 上
```plaintext
Time: 1.50388325s
```
