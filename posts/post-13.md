---
title: "Rust 日志"
date: 2025-02-20
tags: ["rust"]
summary: "使用 log 加具体实现库，完成 rust 的日志操作~"
---

# log - 日志门面
`slf4j` 是 Java 的日志门面库，`log` 是 Rust 的日志门面库，由官方积极维护可以放心使用。相应的日志 API 已成为事实上的标准，被其它日志框架所使用，有了日志门面开发者可以很方便切换自己的日志框架。
> A lightweight logging facade.
> 
> The log crate provides a single logging API that abstracts over the actual logging implementation. Libraries can use the logging API provided by this crate, and the consumer of those libraries can choose the logging implementation that is most suitable for its use case.
> 
> If no logging implementation is selected, the facade falls back to a “noop” implementation that ignores all log messages. The overhead in this case is very small - just an integer load, comparison and jump.
> 
> A log request consists of a target, a level, and a body. A target is a string which defaults to the module path of the location of the log request, though that default may be overridden. Logger implementations typically use the target to filter requests based on some user configuration.

## 使用
引入
```toml
[dependencies]
log = "0.4"
```
或
```shell
cargo add log
```
使用
```rust
use log::{info, warn,error,trace};

fn main() {
    // 记录日志
    info!("This is an info message");
    warn!("This is a warning message");
    error!("This is an error message");
    trace!("This is an trace message");
}
```
运行上面的示例，实际上看不到任何输出。因为 log 仅仅是日志门面库，它并不具备完整的日志库功能！
因为 log 仅仅是日志门面库，对于库和应用的开发者来说使用方法是有区别的，这也是 log 包这么设计的优势所在。

除了以上常用的，`log` 还提供了 `log!` 和 `log_enabled!` 宏，后者用于确定一条消息在当前模块中，对于给定的日志级别是否能够被记录。
```rust
use log::Level::Debug;
use log::{debug, log_enabled};

// 判断能否记录 Debug 消息
if log_enabled!(Debug) {
    let data = expensive_call();
     // 下面的日志记录较为昂贵，因此我们先在前面判断了是否能够记录，能，才继续这里的逻辑
    debug!("expensive debug data: {} {}", data.x, data.y);
}
if log_enabled!(target: "Global", Debug) {
   let data = expensive_call();
   debug!(target: "Global", "expensive debug data: {} {}", data.x, data.y);
}
```
而 `log!` 宏就简单的多，它是一个通用的日志记录方式，因此需要我们手动指定日志级别：
```rust
use log::{log, Level};

let data = (42, "Forty-two");
let private_data = "private";

log!(Level::Error, "Received errors: {}, {}", data.0, data.1);
log!(target: "app_events", Level::Warn, "App warning: {}, {}, {}",
    data.0, data.1, private_data);
```


### 库的开发者
作为库的开发者，你只要在库中使用门面库即可，将具体的日志库交给用户去选择和绑定：
```rust
use log::{info, trace, warn};
pub fn deal_with_something() {
    // 开始处理

    // 记录一些日志
    trace!("a trace log");
    info!("a info long: {}", "abc");
    warn!("a warning log: {}, retrying", err);

    // 结束处理
}
```
### 应用开发者
如果是应用开发者，就需要去选择一个具体的日志库了。

目前已经有了不少日志库实现，官方在 github 上也推荐了一些 ，主要分为以下几类：

- 简单的最小记录器，如 env_logger 等
- 复杂的可配置框架，如 log4rs 等
- 其他设施的适配器，如 syslog、db_logger 等
- 对于 WebAssembly 二进制文件：console_log
- 对于动态库：需要在日志上构造一个 FFI 安全包装器，以便在库中进行初始化。
- 实用程序，如 alterable_logger 等

### 日志库开发者
对于日志库开发者而言，自然要实现自己的 Log 特征:
```rust
use log::{Record, Level, Metadata};
struct SimpleLogger;
impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }
    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("{} - {}", record.level(), record.args());
        }
    }
    fn flush(&self) {}
}
```
除此之外，还需要包装下 `set_logger` 和 `set_max_level`：
```rust
use log::{SetLoggerError, LevelFilter};
static LOGGER: SimpleLogger = SimpleLogger;
pub fn init() -> Result<(), SetLoggerError> {
    log::set_logger(&LOGGER)
        .map(|()| log::set_max_level(LevelFilter::Info))
}
```
然后在 `main` 函数里设置全局记录器：
```rust
use log::{info, warn,error,trace};

fn main() {
    //设置日志
    init();
    // 记录日志
    info!("This is an info message");
    warn!("This is a warning message");
    error!("This is an error message");
    trace!("This is an trace message");
}
```
运行后终端输出如下，因为设置日志等级为Info，所以没有输出Trace等级日志：
```log
INFO - This is an info message
WARN - This is a warning message
ERROR - This is an error message
```

# log4rs
[`log4rs`](https://github.com/estk/log4rs/tree/main) 是一个高度可配置的日志框架，以 Java 的 `Logback` 和 `log4j` 库为模型。

## 使用
### 添加依赖
```shell
cargo add log4rs
```
### 添加配置文件
在项目根目录下，创建一个 `log4rs.yaml` 配置文件，并添加以下内容：
```yaml
refresh_rate: 30 seconds

appenders:
  stdout:
    kind: console
    encoder:
      pattern: "{d(%Y-%m-%d %H:%M:%S.%f)} [{l}] {t} - {m}{n}"
  
  rolling_file:
    kind: rolling_file
    path: logs/test.log
    append: true 
    encoder:
      pattern: "{d(%Y-%m-%d %H:%M:%S.%f)} [{l}] {t} - {m}{n}"
    policy:
      kind: compound
      trigger:
        kind: size
        limit: 10 mb
      roller:        
        kind: fixed_window
        pattern: logs/test.{}.log
        base: 1
        count: 5
        
root:
  level: info 
  appenders:
    - stdout
    - rolling_file
```
上面配置文件设定日志输出到控制台、文件，文件按10 mb大小滚动，只保留最近五个文件。各个配置字段的具体含义可以参考配置：
- refresh_rate：用于确定 log4rs 扫描配置文件以查找更改的频率，如果发现更改，记录器将自动重新配置
- appender： 负责将日志收集到文件、控制台或系统日志, 可配置多个
- stdout、rolling_file：追加器的唯一标识字符串，自己随便定义，它的 kind 字段只支持console、file、rolling_file 三种实现
- encoder： 负责将 log 信息转换为合适的格式, 如固定格式的平文本或json
- pattern：编码模板，格式可配置，具体格式详见pattern
- policy：策略字段，策略必须具有 kind 字段，默认（且仅受支持）策略为 kind: compound
- trigger：触发器字段用于指示何时滚动日志文件，支持 size 和 time 两种类型，这里使用的是按大小

### 使用
```rust
use log::*;
use log4rs;

fn main() {
    log4rs::init_file("log4rs.yaml", Default::default()).unwrap();

    for i in 1..=1000 {
        info!("This is loop iteration {}", i);
    }
}
```
运行结果
```log
2024-04-01 15:43:28.596832500 [INFO] hello_world - This is loop iteration 1
```

# 参考
> [Rust 实现日志记录功能](https://www.cnblogs.com/timefiles/p/18108881)
