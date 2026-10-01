---
title: "邮件清理"
date: 2025-11-19
tags: ["rust"]
summary: "QQ邮箱自动清理邮件，注意备份重要信息~"
---

### `cargo.toml`
```toml
[package]
name = "email_helper"
version = "0.1.0"
edition = "2024"

[dependencies]
imap = "2.4"
native-tls = "0.2"
mailparse = "0.14"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
chrono = { version = "0.4", features = ["serde"] }
encoding_rs = "0.8"
```

### `main.rs`
```rust
use std::net::TcpStream;

use anyhow::Result;
use imap::{
    Session,
    types::{Fetch, Flag, ZeroCopy},
};
use mailparse::{MailHeaderMap, parse_mail};
use native_tls::{TlsConnector, TlsStream};

fn main() -> Result<()> {
    let imap_server = "smtp.qq.com";
    let imap_port = 993;
    let username = "xxx";
    let password = "xxx"; // 授权码

    // 创建 TLS 连接
    let tls = TlsConnector::builder().build()?;
    let client = native_tls::TlsConnector::connect(
        &tls,
        imap_server,
        std::net::TcpStream::connect((imap_server, imap_port))?,
    )?;

    // 使用 imap 2.4 登录
    let mut imap_session = imap::Client::new(client)
        .login(username, password)
        .map_err(|e| e.0)?;

    // 选择 INBOX
    let mailbox = imap_session.select("INBOX")?;
    println!("Total messages in INBOX: {}", mailbox.exists);

    let batch_size = 100;
    let mut start = 1;
    let total = mailbox.exists;
    while start <= total {
        let end = std::cmp::min(start + batch_size - 1, total);
        let sequence_set = format!("{}:{}", start, end);
        println!("Fetching emails {}-{}", start, end);

        let messages = imap_session.fetch(&sequence_set, "(UID FLAGS BODY.PEEK[])")?;
        println!("Fetched {} messages", messages.len());
        let result = handle_messages(&messages, &mut imap_session);
        if result.is_err() {
            println!("Error handling messages: {}", result.err().unwrap());
        }
        start += batch_size;
    }

    // 删除标记的邮件
    imap_session.expunge()?;

    imap_session.logout()?;
    println!("Completed");
    Ok(())
}

fn handle_messages(
    messages: &ZeroCopy<Vec<Fetch>>,
    session: &mut Session<TlsStream<TcpStream>>,
) -> Result<()> {
    for msg in messages.iter() {
        let uid = msg.uid;
        if uid.is_none() {
            println!("uid is none");
            continue;
        }
        let uid = uid.unwrap();
        if let Some(body) = msg.body() {
            let parsed = parse_mail(body)?;

            // 邮件头
            let subject = parsed
                .headers
                .get_first_value("Subject")
                .unwrap_or_default();
            let from = parsed.headers.get_first_value("From").unwrap_or_default();
            let seen = msg.flags().iter().any(|f| matches!(f, Flag::Seen));
            if !seen {
                println!("Email '{}' (UID {}) has not been seen", subject, uid);
                continue;
            }
            if from.contains("联想") || subject.contains("校招") || subject.contains("应聘")
                || subject.contains("校园招聘") || from.contains("校园招聘") || from.contains("校招") || from.contains("yunying1@alimail.zhaopin.com") || from.contains("service@steelport.zhaopin.com") || from.contains("RMASERVER@msi.com") || from.contains("billing@microsoft.com") || from.contains("noreply@steampowered.com") || from.contains("MicrosoftOffice365@email.office.com") || subject.contains("投递进度") || from.contains("no-reply@gitmail.oschina.net") || from.contains("imooc@dm.mukewang.com")
                || subject.contains("漫画更新")
                || subject.contains("ACM TechNews")
                || subject.contains("简单百宝箱")
                || subject.contains("启动完成")
                || (subject.contains("提醒") && from.contains("1055894396@qq.com"))
                || subject.contains("This is jumpserver.")
                || subject.contains("对您很感兴趣，邀您沟通")
                // 阿里云
                || from.contains("aliyun.com")
                // GitHub
                || from.contains("notifications@github.com")
                || subject.contains("[GitHub]")
                // other
                || from.contains("acmhelp@acm.org")
                || from.contains("no-reply@unity3d.com")
                || subject.contains("验证码") || subject.contains("Verification Code") || subject.contains("统一身份认证平台通知") || subject.contains("激活码") || subject.contains("email verification code") || subject.contains("用户注册确认") || subject.contains("Verify your email address")
                || from.contains("support@codepen.io") || from.contains("noreply@topcoder.com") || from.contains("music@tencent.com") || from.contains("cloud_noreply@tencent.com")
                || from.contains("ccfdigital@ccfservice.cn")
                || from.contains("csdn.net")
                || from.contains("51job.com")
                || from.contains("noreply@icloud.com.cn")
                || from.contains("no-reply@email.leetcode.cn") || from.contains("no-reply@email.leetcode-cn.com") || from.contains("no-reply@leetcode.com")
                || from.contains("admin@qq.com") || from.contains("10000@qq.com")
                || from.contains("topcoder.com")
                || subject.contains("安全提醒")
                || from.contains("support@codepen.io")
                || from.contains("huawei_ebg@research-satisfaction.com")
                || from.contains("contact@gitpod.io")
                || from.contains("no_reply@email.apple.com") || from.contains("shipping_notification@orders.apple.com") || from.contains("MarketResearch@insideapple.apple.com>") || from.contains("contact@scenario.com") || from.contains("no-reply@email.apple.com") || from.contains("do_not_reply@apple.com") || from.contains("OnlineResearch@insideapple.apple.com")
                || from.contains("info@service.yuque.com")
                || from.contains("noreply@shmail.ibeisen.com")
                || from.contains("noreply@blizzardgames.cn")
                || from.contains("updates-noreply@linkedin.com")
                || from.contains("no-reply@notify.docker.com")
                || from.contains("maya@meilisearch.com")
                || from.contains("notifications@gitbook.com")
                || from.contains("noreply@wakatime.com")
                || from.contains("hello@promos.memrise.com") || from.contains("elasticon@elastic.co") || from.contains("replies@oracle-mail.com") || from.contains("jobs-listings@linkedin.com") || from.contains("support@gitguardian.com") || from.contains("e@notification.coding.net") || from.contains("membership@ccf.org.cn") || from.contains("developer@photonengine.com") || from.contains("film@tencent.com") || from.contains("welcome@openrouter.ai")
            {
                // 标记删除
                let uid = msg.uid.ok_or("无法获取 UID").unwrap();
                session.uid_store(uid.to_string(), "+FLAGS (\\Deleted)")?;
                session.expunge()?;
                println!("Marked email '{}' (UID {}) for deletion", subject, uid);
            }
        }
    }
    Ok(())
}

```
