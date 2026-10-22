<script setup>
import Avatar from "../assets/avatar.webp?url";
import UESTC from "../assets/uestc.webp?url";
import asiainfo from "../assets/asiainfo.svg?url";
import Rich from "../assets/rich.webp?url";
import Huawei from "../assets/huawei.webp?url";
import Hontor from "../assets/hontor.webp?url";

const profile = {
    name: "刘阳",
    titleEn: "AI APPLICATION ARCHITECT · FULL-STACK ENGINEER",
    summary: ["从底层系统到 AI Agent，把复杂技术变成稳定、可交付的产品。", "擅长跨语言架构设计、工程效率建设与 0→1 应用落地。"],
    introPoints: [
        "业务路径横跨通信设备、行业大数据与 AI 应用三类领域。",
        "既能独立交付完整产品，也能主导架构设计与研发管理。",
        "热衷技术研究，业余折腾嵌入式硬件与开源项目。",
    ],
    experienceYears: "8+",
    philosophy: "“技术的价值，不只在于能运行，更在于能持续创造结果。”",
    footerNote: "用系统思维解决问题，用工程能力交付结果。",
};

const contacts = [
    { label: "电话", value: "18936861530", href: "tel:18936861530", icon: "phone" },
    { label: "邮箱", value: "1055894396@qq.com", href: "mailto:1055894396@qq.com", icon: "mail" },
    { label: "GitHub", value: "github.com/42tr", href: "https://github.com/42tr", icon: "github" },
    { label: "个人网站", value: "42tr.cn", href: "https://42tr.cn", icon: "link" },
];

// 屏幕版与打印版共用同一份数据；printPoints / printStack 是打印版的一页精简表述。
const experiences = [
    {
        company: "中科南京人工智能创新研究院",
        shortName: "中科南京",
        role: "架构师 · 研发经理",
        period: "2025.03 — 至今",
        periodStart: "2025-03",
        logo: Hontor,
        accent: "violet",
        printClass: "print-job-hontor",
        printStack: ["LLM", "Agent", "MCP", "Python", "Rust"],
        projects: [
            {
                title: "AI 助手与智能办公平台",
                summary: "围绕真实业务场景搭建对话式 AI 助手与智能办公平台。",
                points: [
                    "基于 Qwen、DeepSeek 等模型构建 Agent 与 MCP 能力，形成可组合的智能助手架构。",
                    "集成 CosyVoice、SenseVoice、MinerU，落地知识库溯源、公文撰写、PPT / 脑图生成与智能会议等功能。",
                    "使用 Python 负责模型集成与业务编排，使用 Rust 开发知识库等高性能系统组件。",
                ],
                printPoints: [
                    "基于 Qwen、DeepSeek 构建 Agent 与 MCP 能力，支持按用户场景组合工具与业务流程。",
                    "集成 CosyVoice、SenseVoice、MinerU，落地知识库溯源、公文、PPT、脑图生成与智能会议。",
                    "使用 Python 完成模型集成与业务编排，使用 Rust 开发知识库等高性能系统组件。",
                ],
                stack: ["LLM", "Agent", "MCP", "Python", "Rust"],
            },
        ],
    },
    {
        company: "华为",
        shortName: "HUAWEI",
        role: "软件工程师 · CIE",
        period: "2021.09 — 2024.11",
        periodStart: "2021-09",
        logo: Huawei,
        accent: "red",
        printClass: "print-job-huawei",
        printStack: ["C", "Go", "Rust", "Python", "RAG", "Elasticsearch", "Jenkins"],
        projects: [
            {
                title: "维护辅助工具",
                summary: "面向历史案例检索与运维问答的 RAG 应用，作为整体设计者参与开发。",
                points: [
                    "设计整体架构并搭建前后端框架，融合关键词与语义搜索，提出多路召回重排序方案。",
                    "将问题搜索准确率从 50% 提升至 90%，成果获得“数据通信研发部长奖”。",
                    "完成内部聊天机器人接入与 Docker 化部署，并基于相关成果成功申请专利。",
                ],
                printPoints: [
                    "设计 RAG 应用整体架构，搭建前后端框架并接入内部聊天机器人，支持历史案例检索与问答。",
                    "优化 Elasticsearch 搜索效果，提出多路召回重排序方案，将问题搜索准确率从 <b>50% 提升至 90%</b>。",
                    "成果获数据通信研发部长奖，成功申请专利，并完成应用 Docker 化部署。",
                ],
                stack: ["Spring Boot", "Vue 2", "LangChain", "Elasticsearch", "RAG"],
            },
            {
                title: "AR 接入路由器",
                summary: "参与路由器协议与系统机制开发，兼顾底层实现和研发工具链。",
                points: [
                    "使用 C 参与 SSH / TELNET / FTP / NETCONF、NCE 交互、补丁机制及系统模块开发维护。",
                    "维护并优化 Jenkins 门禁与 CI，MR 合入效率提升 10%+，构建发布效率提升 20%+。",
                    "用 Go、Python、Rust 开发补丁查重、构建网站和代码检查工具，每年减少约 2 人月投入。",
                    "作为 Redis PMC 成员参与定制归一与升级，获 Redis 定制归一攻关激励团队奖。",
                ],
                printPoints: [
                    "使用 C 参与 SSH、TELNET、FTP、NETCONF、NCE 交互、补丁机制及系统模块开发维护。",
                    "优化 Jenkins 门禁与版本 CI，MR 合入效率提升 10%+，构建发布效率提升 20%+。",
                    "使用 Go、Python、Rust 开发补丁构建、查重和代码检查工具，每年减少约 2 人月投入。",
                    "作为 Redis PMC 成员参与定制归一与升级，获 Redis 定制归一攻关激励团队奖。",
                ],
                stack: ["C", "Go", "Rust", "Python", "Jenkins", "Redis"],
            },
        ],
    },
    {
        company: "北京睿企",
        shortName: "睿企",
        role: "后端 / 全栈工程师",
        period: "2020.05 — 2021.07",
        periodStart: "2020-05",
        logo: Rich,
        accent: "blue",
        printClass: "print-job-rich print-job-small",
        printStack: ["Spring Boot", "React", "TiDB", "MinIO", "Kubernetes", "Elasticsearch"],
        projects: [
            {
                title: "公安行业 NLP 应用",
                summary: "面向行业大数据治理与分析，负责标准化处理模块及多个业务应用的后端设计与实现。",
                points: [
                    "维护数据标准化流程，设计并实现质态监管、热词雷达、自动报告等应用。",
                    "使用内部 ETL 工具处理多方数据，承担部分 React 管理页面与前端问题修复。",
                ],
                printPoints: [
                    "负责公安行业大数据标准化模块，维护数据处理流程并对接多方 ETL 数据源。",
                    "设计并实现质态监管、热词雷达、自动报告等应用后端，承担部分 React 管理页面开发。",
                    "基于 TiDB、MinIO、Elasticsearch 构建数据存储与检索能力，使用 Kubernetes 管理容器。",
                ],
                stack: ["Spring Boot", "React", "TiDB", "MinIO", "Kubernetes", "Elasticsearch"],
            },
        ],
    },
    {
        company: "亚信科技",
        shortName: "亚信科技",
        role: "全栈工程师",
        period: "2018.03 — 2020.05",
        periodStart: "2018-03",
        logo: asiainfo,
        accent: "orange",
        printClass: "print-job-asiainfo print-job-small",
        printStack: ["Java", "Spring Boot", "MySQL", "Redis", "Kafka", "Electron"],
        projects: [
            {
                title: "电信 CRM 3.0",
                summary: "负责前后端开发、数据库设计与服务部署，完成从业务页面到基础设施的全链路交付。",
                points: [
                    "后端使用 Spring Boot + MyBatis，结合 Redis、Kafka、MySQL、Nginx 构建业务服务。",
                    "前端使用 Vita-Plus 与 Electron 开发桌面及业务应用。",
                ],
                printPoints: [
                    "负责业务功能、数据库设计、服务部署与线上问题处理等全链路交付。",
                    "使用 Spring Boot + MyBatis 构建后端，结合 Redis、Kafka、MySQL、Nginx 支撑业务系统。",
                    "使用 Vita-Plus 与 Electron 开发前端和桌面应用。",
                ],
                stack: ["Java", "Spring Boot", "MySQL", "Redis", "Kafka", "Electron"],
            },
        ],
    },
];

const skillGroups = [
    { title: "AI 工程", skills: ["LLM", "RAG", "Agent", "MCP", "LangChain"] },
    { title: "编程语言", skills: ["Rust", "Python", "Java", "Go", "JavaScript", "C"] },
    {
        title: "工程与数据",
        skills: ["Docker / K8s", "Jenkins", "GitHub Actions", "MySQL", "Redis", "Elasticsearch"],
        printSkills: ["Docker/K8s", "Jenkins", "MySQL", "Redis", "ES"],
    },
    { title: "前端与可视化", printTitle: "前端", skills: ["Vue", "React", "ECharts", "Electron"] },
];

const education = {
    school: "电子科技大学",
    major: "软件工程 · 本科",
    period: "2014.09 — 2018.06",
    periodStart: "2014-09",
    award: "人民一等奖学金 · CET-4",
    logo: UESTC,
};

const credentials = [
    { level: "高级", title: "系统架构设计师" },
    { level: "中级", title: "软件设计师" },
    { level: "认证", title: "NVIDIA 深度学习" },
    { level: "成果", title: "发明专利申请" },
];
</script>

<template>
    <div class="resume-page">
        <header class="site-header">
            <a class="wordmark" href="/" aria-label="42tr 首页">42tr<span class="brand-dot">.</span></a>
            <span class="header-note">个人简历 / RESUME</span>
            <nav aria-label="简历操作">
            <a class="nav-action" href="/" aria-label="返回主页">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                <span>主页</span>
            </a>
            <button class="nav-action print-action" type="button" data-print-resume>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <path d="M6 14h12v8H6z" />
                </svg>
                <span>导出一页 PDF</span>
            </button>
            </nav>
        </header>

        <main class="resume-sheet screen-resume">
            <header class="hero">
                <div class="hero-copy">
                    <div class="profile-top">
                        <img class="avatar" :src="Avatar" alt="42tr 的头像" width="88" height="88" fetchpriority="high" />
                        <div>
                            <span class="eyebrow">RESUME / 关于我</span>
                            <h1>{{ profile.name }}<span class="brand-dot">.</span></h1>
                        </div>
                        <span class="title-code">ARCH · 42TR</span>
                    </div>
                    <div class="title-row">
                        <p>AI 应用架构师 <span>/</span> 全栈工程师</p>
                    </div>
                    <p class="hero-intro">{{ profile.summary.join('') }}</p>
                </div>

                <aside class="hero-focus" aria-label="当前方向">
                    <span class="eyebrow">CURRENT FOCUS / 当前方向</span>
                    <h2>从底层系统，<br>到 AI 应用架构。</h2>
                    <p>Agent · MCP · 知识检索</p>
                    <span class="focus-note">用系统思维解决问题<span aria-hidden="true">_</span></span>
                </aside>

                <div class="hero-footer">
                    <div class="contact-list">
                        <a
                            v-for="contact in contacts"
                            :key="contact.label"
                            class="contact-item"
                            :href="contact.href"
                            :target="contact.icon === 'link' ? '_blank' : undefined"
                            :rel="contact.icon === 'link' ? 'noopener noreferrer' : undefined"
                        >
                            <svg v-if="contact.icon === 'phone'" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <svg v-else-if="contact.icon === 'mail'" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                <path d="m22 6-10 7L2 6" />
                            </svg>
                            <svg v-else-if="contact.icon === 'github'" class="icon-fill" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <span><small>{{ contact.label }}</small>{{ contact.value }}</span>
                        </a>
                    </div>

                    <div class="hero-metrics">
                        <div class="metric"><strong>8<span>+</span></strong><small>年研发经验</small></div>
                        <div class="metric"><strong>90<span>%</span></strong><small>搜索准确率</small></div>
                        <div class="metric"><strong>6</strong><small>主力编程语言</small></div>
                    </div>
                </div>
            </header>

            <div class="resume-content">
                <section id="experience" class="main-column" aria-labelledby="experience-title">
                    <div class="section-heading">
                        <span class="section-index">01 /</span>
                        <div>
                            <h2 id="experience-title">工作经历</h2>
                        </div>
                        <span class="section-caption">从系统开发，到智能应用</span>
                    </div>

                    <div class="experience-list">
                        <article
                            v-for="(experience, index) in experiences"
                            :key="experience.company"
                            class="experience"
                        >
                            <div class="timeline-rail" aria-hidden="true">
                                <span class="timeline-index">0{{ index + 1 }}</span>
                                <span class="timeline-dot"></span>
                            </div>

                            <div class="experience-body">
                                <header class="company-header">
                                    <div class="company-identity">
                                        <span class="logo-wrap"><img :src="experience.logo" :alt="experience.shortName" /></span>
                                        <div>
                                            <h3>{{ experience.company }}</h3>
                                            <p>{{ experience.role }}</p>
                                        </div>
                                    </div>
                                    <time :datetime="experience.periodStart">{{ experience.period }}</time>
                                </header>

                                <div class="project-list">
                                    <section v-for="project in experience.projects" :key="project.title" class="project">
                                        <div class="project-heading">
                                            <h4>{{ project.title }}</h4>
                                            <time v-if="project.period" :datetime="project.periodStart">{{ project.period }}</time>
                                        </div>
                                        <p class="project-summary">{{ project.summary }}</p>
                                        <ul>
                                            <li v-for="point in project.points" :key="point">{{ point }}</li>
                                        </ul>
                                        <div class="stack-list" aria-label="技术栈">
                                            <span v-for="item in project.stack" :key="item">{{ item }}</span>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <aside class="side-column">
                    <section class="side-section intro-card">
                        <span class="side-label">PROFILE / 个人档案</span>
                        <ul class="intro-points">
                            <li v-for="point in profile.introPoints" :key="point" v-html="point"></li>
                        </ul>
                        <div class="availability"><span></span> 当前专注 Agent 与 AI 应用</div>
                    </section>

                    <section class="side-section">
                        <div class="side-heading">
                            <span>02 /</span>
                            <h2>能力矩阵</h2>
                        </div>
                        <div class="skill-groups">
                            <div v-for="group in skillGroups" :key="group.title" class="skill-group">
                                <h3>{{ group.title }}</h3>
                                <div class="skill-tags">
                                    <span v-for="skill in group.skills" :key="skill">{{ skill }}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="side-section">
                        <div class="side-heading">
                            <span>03 /</span>
                            <h2>教育背景</h2>
                        </div>
                        <div class="education-card">
                            <img :src="education.logo" :alt="education.school" />
                            <div>
                                <time :datetime="education.periodStart">{{ education.period }}</time>
                                <h3>{{ education.school }}</h3>
                                <p>{{ education.major }}</p>
                            </div>
                        </div>
                        <p class="education-note">{{ education.award }}</p>
                    </section>

                    <section class="side-section">
                        <div class="side-heading">
                            <span>04 /</span>
                            <h2>资质与成果</h2>
                        </div>
                        <div class="credential-list">
                            <div v-for="credential in credentials" :key="credential.title" class="credential">
                                <span>{{ credential.level }}</span>
                                <strong>{{ credential.title }}</strong>
                            </div>
                        </div>
                    </section>

                    <section class="side-section philosophy-card">
                        <span>ENGINEERING PHILOSOPHY</span>
                        <blockquote>{{ profile.philosophy }}</blockquote>
                    </section>
                </aside>
            </div>

            <footer class="resume-footer">
                <div>
                    <a class="wordmark" href="/">42tr<span class="brand-dot">.</span></a>
                    <p>ARCHITECT · ENGINEER · BUILDER</p>
                </div>
                <p class="footer-note">{{ profile.footerNote }}</p>
            </footer>
        </main>

        <div class="print-resume" aria-label="刘阳一页简历打印版">
            <header class="print-header">
                <img class="print-avatar" :src="Avatar" alt="刘阳的头像" />
                <div>
                    <p class="print-kicker">{{ profile.titleEn }}</p>
                    <h1>{{ profile.name }}<span>.</span></h1>
                    <h2>AI 应用架构师 <span>/</span> 全栈工程师</h2>
                    <p class="print-summary">{{ profile.summary[0] }}<br />{{ profile.summary[1] }}</p>
                </div>
                <div class="print-contact">
                    <a v-for="contact in contacts" :key="contact.label" :href="contact.href">
                        <svg v-if="contact.icon === 'phone'" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <svg v-else-if="contact.icon === 'mail'" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                            <path d="m22 6-10 7L2 6" />
                        </svg>
                        <svg v-else-if="contact.icon === 'github'" class="icon-fill" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>{{ contact.value }}</span>
                    </a>
                    <strong>{{ profile.experienceYears }} 年研发经验</strong>
                </div>
            </header>

            <div class="print-body">
                <section class="print-main">
                    <div class="print-section-title"><span>01</span><h2>工作经历</h2><i></i></div>

                    <div class="print-jobs">
                    <article
                        v-for="experience in experiences"
                        :key="experience.company"
                        class="print-job"
                        :class="experience.printClass"
                    >
                        <header>
                            <div class="print-company">
                                <span class="print-company-logo"><img :src="experience.logo" alt="" /></span>
                                <div><h3>{{ experience.company }}</h3><p>{{ experience.role }}</p></div>
                            </div>
                            <time :datetime="experience.periodStart">{{ experience.period }}</time>
                        </header>
                        <template v-for="(project, projectIndex) in experience.projects" :key="project.title">
                            <h4 :class="{ 'print-subproject': projectIndex > 0 }">
                                {{ project.title }}
                                <span v-if="project.period">{{ project.period }}</span>
                            </h4>
                            <ul>
                                <li v-for="point in project.printPoints || project.points" :key="point" v-html="point"></li>
                            </ul>
                        </template>
                        <div class="print-stack"><span v-for="item in experience.printStack" :key="item">{{ item }}</span></div>
                    </article>
                    </div>
                </section>

                <aside class="print-side">
                    <section>
                        <div class="print-section-title"><span>02</span><h2>个人档案</h2><i></i></div>
                        <div class="print-side-card">
                            <ul class="print-profile">
                                <li v-for="point in profile.introPoints" :key="point" v-html="point"></li>
                            </ul>
                            <p class="print-availability"><span></span> 当前专注 Agent 与 AI 应用</p>
                        </div>
                    </section>

                    <section>
                        <div class="print-section-title"><span>03</span><h2>能力矩阵</h2><i></i></div>
                        <div class="print-side-card">
                            <div class="print-skills">
                                <div v-for="group in skillGroups" :key="group.title">
                                    <h3>{{ group.printTitle || group.title }}</h3>
                                    <p><span v-for="skill in group.printSkills || group.skills" :key="skill">{{ skill }}</span></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div class="print-section-title"><span>04</span><h2>教育背景</h2><i></i></div>
                        <div class="print-side-card">
                            <div class="print-education">
                                <img :src="education.logo" :alt="education.school" />
                                <div>
                                    <time :datetime="education.periodStart">{{ education.period }}</time>
                                    <h3>{{ education.school }}</h3>
                                    <p>{{ education.major }}</p>
                                </div>
                            </div>
                            <p class="print-award">{{ education.award }}</p>
                        </div>
                    </section>

                    <section>
                        <div class="print-section-title"><span>05</span><h2>资质与成果</h2><i></i></div>
                        <div class="print-side-card">
                            <div class="print-credentials">
                                <p v-for="credential in credentials" :key="credential.title"><span>{{ credential.level }}</span>{{ credential.title }}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div class="print-section-title"><span>06</span><h2>工作理念</h2><i></i></div>
                        <div class="print-side-card print-quote">
                            <p>{{ profile.philosophy }}</p>
                        </div>
                    </section>
                </aside>
            </div>

            <footer class="print-footer"><a class="print-wordmark" href="https://42tr.cn">42tr<span>.</span></a><span>{{ profile.footerNote }}</span></footer>
        </div>
    </div>
</template>

<style scoped>
.resume-page {
    --home-bg: #111216;
    --home-surface: #1a1b21;
    --home-border: #2c2d36;
    --home-muted: #a2a3b1;
    --home-accent: #b5afff;
    min-height: 100vh;
    background: var(--home-bg);
    color: #eeeef2;
    font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
}
.resume-page, .resume-page * { box-sizing: border-box; }
.site-header, .resume-sheet { width: min(1440px, 100%); margin-inline: auto; padding-inline: clamp(16px, 3.5vw, 64px); }
.site-header { min-height: 96px; display: flex; align-items: center; gap: 24px; }
.wordmark { font: 800 28px/1 ui-monospace, monospace; letter-spacing: -2px; color: #eeeef2; }
.brand-dot { color: var(--home-accent); }
.header-note { font-size: 12px; color: var(--home-muted); }
.site-header nav { display: flex; align-items: center; gap: 24px; margin-left: auto; }
.nav-action { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; color: #bfc0cc; font: inherit; font-size: 13px; }
.nav-action svg, .contact-item svg { width: 16px; height: 16px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.print-action { padding: 10px 14px; border: 1px solid #34333f; border-radius: 9px; background: #23232d; cursor: pointer; transition: background .2s, border-color .2s; }
.print-action:hover { background: #343044; border-color: #8f84bf; }
.nav-action:hover { color: #fff; }
a:focus-visible, button:focus-visible { outline: 2px solid var(--home-accent); outline-offset: 5px; }
.hero { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 0 36px; padding: clamp(24px, 3.5vw, 46px); border: 1px solid var(--home-border); border-radius: 20px; background: var(--home-surface); }
.profile-top { display: flex; align-items: center; gap: 20px; }
.avatar { width: 88px; height: 88px; flex-shrink: 0; object-fit: cover; border: 3px solid #383440; border-radius: 50%; background: #23232b; }
.eyebrow, .side-label { color: var(--home-muted); font: 10px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1.4px; }
.hero h1 { margin: 4px 0 0; font-size: clamp(36px, 4vw, 52px); font-weight: 600; line-height: 1.2; letter-spacing: -2px; }
.hero h1 .brand-dot { margin-left: 5px; }
.title-code { margin-left: auto; align-self: flex-start; border: 1px solid #3b354b; border-radius: 6px; padding: 6px 10px; color: #c1bbee; font: 11px/1.5 ui-monospace, monospace; white-space: nowrap; }
.title-row p { margin: 28px 0 14px; font-size: clamp(20px, 2.2vw, 28px); font-weight: 500; line-height: 1.6; }
.title-row p span { margin-inline: 6px; color: var(--home-accent); }
.hero-intro { max-width: 620px; margin: 0; color: var(--home-muted); font-size: 13px; line-height: 1.9; }
.hero-focus { display: flex; flex-direction: column; align-items: flex-start; padding: 12px 0 12px 32px; border-left: 1px solid var(--home-border); }
.hero-focus h2 { margin: 22px 0 12px; font-size: clamp(20px, 2vw, 26px); font-weight: 500; line-height: 1.6; }
.hero-focus p { margin: 0 0 28px; color: var(--home-accent); font: 12px/1.8 ui-monospace, monospace; }
.focus-note { display: flex; justify-content: space-between; gap: 20px; width: 100%; margin-top: auto; color: var(--home-muted); font-size: 12px; }
.focus-note span { color: var(--home-accent); }
.hero-footer { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--home-border); }
.contact-list { display: flex; flex-wrap: wrap; gap: 24px; }
.contact-item { display: flex; align-items: center; gap: 10px; color: #d3d1dc; font: 12px/1.6 ui-monospace, monospace; }
.contact-item svg { color: var(--home-accent); }
.contact-item svg.icon-fill { fill: currentColor; stroke: none; }
.contact-item small { display: block; margin-bottom: 4px; color: var(--home-muted); font: 10px/1.5 "PingFang SC", "Microsoft YaHei", sans-serif; }
.contact-item:hover { color: var(--home-accent); }
.hero-metrics { display: flex; flex-shrink: 0; gap: 28px; }
.metric strong { display: block; font: 500 26px/1.3 ui-monospace, monospace; }
.metric strong span { color: var(--home-accent); font-size: 16px; }
.metric small { display: block; margin-top: 5px; color: var(--home-muted); font-size: 10px; }
.resume-content { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); align-items: start; gap: 20px; margin-top: 40px; }
.main-column, .side-column { min-width: 0; }
.section-heading { min-height: 24px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.section-index, .side-heading > span { color: var(--home-accent); font: 11px ui-monospace, monospace; }
.section-heading h2, .side-heading h2 { margin: 0; font-size: 16px; font-weight: 500; }
.section-caption { margin-left: auto; color: var(--home-muted); font-size: 12px; }
.experience-list { display: grid; gap: 16px; }
.experience { position: relative; padding: 28px; border: 1px solid var(--home-border); border-radius: 20px; background: var(--home-surface); }
.timeline-rail { position: absolute; right: 28px; bottom: 26px; }
.timeline-index { color: var(--home-muted); font: 10px ui-monospace, monospace; }
.timeline-dot { display: none; }
.company-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--home-border); }
.company-identity { min-width: 0; display: flex; align-items: center; gap: 12px; }
.logo-wrap { width: 42px; height: 42px; flex-shrink: 0; display: grid; place-items: center; border: 1px solid #34333f; border-radius: 10px; background: #252630; }
.logo-wrap img { width: 28px; height: 28px; object-fit: contain; }
.company-header h3 { margin: 0 0 6px; font-size: 16px; font-weight: 500; line-height: 1.5; }
.company-header p { margin: 0; color: var(--home-muted); font-size: 12px; }
.company-header time { padding-top: 4px; color: var(--home-accent); white-space: nowrap; font: 11px/1.6 ui-monospace, monospace; }
.project { padding-top: 22px; }
.project + .project { margin-top: 22px; border-top: 1px solid var(--home-border); }
.project-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.project-heading h4 { margin: 0; font-size: 14px; font-weight: 500; }
.project-heading time { color: var(--home-muted); white-space: nowrap; font: 10px/1.6 ui-monospace, monospace; }
.project-summary { margin: 12px 0; color: #c9c8d3; font-size: 13px; line-height: 1.85; }
.project ul { list-style: none; margin: 0; padding: 0; }
.project li { position: relative; margin: 8px 0; padding-left: 15px; color: var(--home-muted); font-size: 12px; line-height: 1.9; }
.project li::before { content: ""; position: absolute; left: 0; top: 10px; width: 4px; height: 4px; border-radius: 50%; background: var(--home-accent); }
.stack-list, .skill-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.stack-list { margin-top: 18px; padding-right: 24px; }
.stack-list span, .skill-tags span { padding: 6px 9px; border-radius: 6px; background: #292a35; color: #c7c2f6; font: 10px/1.4 ui-monospace, monospace; }
.side-column { display: grid; gap: 16px; padding-top: 40px; }
.side-section { min-width: 0; padding: 26px; border: 1px solid var(--home-border); border-radius: 20px; background: var(--home-surface); }
.intro-points { margin: 16px 0 20px; padding: 0; list-style: none; }
.intro-points li { position: relative; margin: 8px 0; padding-left: 15px; color: var(--home-muted); font-size: 12px; line-height: 1.9; }
.intro-points li::before { content: ""; position: absolute; left: 0; top: 10px; width: 4px; height: 4px; border-radius: 50%; background: var(--home-accent); }
.availability { display: flex; align-items: center; gap: 9px; color: #c9c8d3; font-size: 11px; }
.availability span { width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: var(--home-accent); box-shadow: 0 0 0 4px #292a35; }
.side-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.skill-group + .skill-group { margin-top: 20px; }
.skill-group h3 { margin: 0 0 10px; color: var(--home-muted); font-size: 11px; font-weight: 400; }
.education-card { display: flex; align-items: center; gap: 13px; }
.education-card img { width: 42px; height: 42px; flex-shrink: 0; }
.education-card time { color: var(--home-accent); font: 10px/1.6 ui-monospace, monospace; }
.education-card h3 { margin: 6px 0; font-size: 15px; font-weight: 500; }
.education-card p, .education-note { margin: 0; color: var(--home-muted); font-size: 11px; line-height: 1.8; }
.education-note { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--home-border); }
.credential-list { display: grid; gap: 10px; }
.credential { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--home-border); border-radius: 9px; }
.credential span { color: var(--home-accent); font-size: 10px; }
.credential strong { font-size: 12px; font-weight: 400; }
.philosophy-card > span { color: var(--home-muted); font: 10px/1.6 ui-monospace, monospace; letter-spacing: 1px; }
.philosophy-card blockquote { margin: 16px 0 0; font-size: 17px; font-weight: 400; line-height: 1.8; }
.resume-footer { min-height: 118px; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 40px; padding-block: 28px; border-top: 1px solid var(--home-border); }
.resume-footer > div p { margin: 12px 0 0; color: var(--home-muted); font: 9px/1.6 ui-monospace, monospace; letter-spacing: 1px; }
.footer-note { margin: 0; color: var(--home-muted); font-size: 12px; line-height: 1.8; }
.print-resume { display: none; }

@media (max-width: 1100px) {
    .hero-footer { align-items: flex-start; flex-direction: column; }
    .hero-metrics { width: 100%; gap: 0; padding-top: 20px; border-top: 1px solid var(--home-border); }
    .metric { flex: 1; }
    .company-header { flex-direction: column; gap: 12px; }
    .side-section { padding: 22px; }
    .title-code { display: none; }
}
@media (max-width: 760px) {
    .site-header { min-height: 76px; }
    .header-note { display: none; }
    .site-header nav { gap: 16px; }
    .hero { grid-template-columns: minmax(0, 1fr); }
    .hero-focus { margin-top: 24px; padding: 24px 0 0; border-left: 0; border-top: 1px solid var(--home-border); }
    .hero-focus h2 { margin: 12px 0 8px; font-size: 20px; }
    .hero-focus h2 br { display: none; }
    .hero-focus p { margin-bottom: 18px; }
    .hero-footer { margin-top: 24px; }
    .contact-list { width: 100%; gap: 20px 28px; }
    .resume-content { grid-template-columns: minmax(0, 1fr); margin-top: 30px; }
    .side-column { grid-template-columns: repeat(2, minmax(0, 1fr)); padding-top: 0; }
    .side-section:first-child, .side-section:last-child { grid-column: 1 / -1; }
    .section-caption { display: none; }
    .resume-footer { margin-top: 30px; }
}
@media (max-width: 480px) {
    .site-header { gap: 12px; }
    .site-header nav { gap: 12px; }
    .nav-action { gap: 6px; font-size: 12px; }
    .print-action { padding: 9px 10px; }
    .avatar { width: 72px; height: 72px; }
    .profile-top { gap: 16px; }
    .title-row p { font-size: 18px; }
    .title-row p span { margin-inline: 2px; }
    .hero-metrics { gap: 12px; }
    .metric strong { font-size: 24px; }
    .experience { padding: 22px; }
    .project-heading { align-items: flex-start; flex-direction: column; gap: 6px; }
    .company-header h3 { font-size: 15px; }
    .side-column { grid-template-columns: minmax(0, 1fr); }
    .resume-footer { align-items: flex-start; flex-direction: column; gap: 20px; }
}

/* Keep the compact A4 layout while sharing the screen palette. */
/* Safari 等忽略 @page margin:0 的浏览器：可打印区域更小，等比缩小保证仍是一页
   （zoom 影响布局本身；Chrome/Firefox 走 @page margin:0 不触发此规则） */
@media print and (max-width: 780px) {
    .print-resume { zoom: 0.88; }
}

@media print {
    @page { size: A4 portrait; margin: 0; }

    :global(html), :global(body), :global(#app) {
        margin: 0 !important;
        padding: 0 !important;
        background: #f7f7f4 !important;
        color-scheme: light;
    }
    :global(body) { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .resume-page { max-width: 210mm; min-height: 0; padding: 0; }
    .site-header, .screen-resume { display: none !important; }
    .print-resume {
        /* 不写死 210mm：浏览器忽略 @page margin:0 时自适应可打印宽度，避免横向裁切 */
        width: auto;
        max-width: 210mm;
        margin: 0 auto;
        /* 底部留白给 fixed 页脚；自然高度控制在 ~276mm，A4 / Letter / 默认边距都能一页放下 */
        padding: 8mm 8mm 12mm;
        display: flex;
        flex-direction: column;
        gap: 2.6mm;
        --print-bg: #f7f7f4;
        --print-surface: #ffffff;
        --print-ink: #17171a;
        --print-text: #4d4c55;
        --print-muted: #777681;
        --print-border: #d9d9df;
        --print-accent: #5f59c9;
        --print-chip: #eeedf7;
        --print-chip-text: #514d91;
        --print-logo: #f0f0f4;
        color: var(--print-ink);
        background: var(--print-bg);
        font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
    }
    .print-header, .print-job, .print-side-card {
        border: .25mm solid var(--print-border);
        border-radius: 3mm;
        background: var(--print-surface);
        break-inside: avoid;
    }
    .print-header {
        position: relative;
        overflow: hidden;
        padding: 4mm;
        display: grid;
        /* 联系栏宽度对齐正文右栏：分隔线落在侧栏卡片左边缘（140.4mm）的参考线上 */
        grid-template-columns: auto minmax(0, 1fr) 57.6mm;
        gap: 6mm;
    }
    .print-header::after { content: ""; position: absolute; right: 2mm; top: -23mm; width: 43mm; height: 43mm; border: 5mm solid rgba(95,89,201,.07); border-radius: 50%; }
    .print-header > div { position: relative; z-index: 1; }
    .print-avatar { position: relative; z-index: 1; width: 16mm; height: 16mm; align-self: center; object-fit: cover; border: .6mm solid #e0dcf0; border-radius: 50%; background: #fff; }
    .print-kicker { margin: 0 0 2mm; color: var(--print-accent); font: 600 6pt/1.5 ui-monospace, monospace; letter-spacing: .1em; }
    .print-header h1 { margin: 0 0 1.6mm; font-size: 24pt; font-weight: 600; line-height: 1.1; }
    .print-header h1 span, .print-header h2 span { color: var(--print-accent); }
    .print-header h1 span { margin-left: 1mm; }
    .print-header h2 { margin: 0; font-size: 11.2pt; font-weight: 500; line-height: 1.5; }
    .print-summary { margin: 1.5mm 0 0; color: var(--print-muted); font-size: 7.4pt; line-height: 1.55; }
    .print-contact {
        padding-left: 5mm;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2mm;
        border-left: .25mm solid var(--print-border);
        color: var(--print-text);
        font: 6.8pt/1.4 ui-monospace, monospace;
    }
    .print-contact a { display: flex; align-items: center; gap: 1.5mm; color: inherit; text-decoration: none; }
    .print-contact svg { width: 2.8mm; height: 2.8mm; flex-shrink: 0; fill: none; stroke: var(--print-accent); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .print-contact svg.icon-fill { fill: var(--print-accent); stroke: none; }
    .print-contact strong { margin-top: 1mm; padding: 2mm 3mm; border-radius: 1.5mm; color: var(--print-accent); background: var(--print-chip); font-size: 7.2pt; font-weight: 500; }
    .print-body { display: grid; grid-template-columns: minmax(0, 2.1fr) minmax(0, 1fr); gap: 3mm; min-height: 221mm; }
    .print-main, .print-side { min-width: 0; }
    /* 列内卡片用 space-between 摊开：有富余高度时（A4）均匀分布填满页面，
       内容更高的环境（Safari 默认边距）自动回落为紧凑排列 */
    .print-main { display: flex; flex-direction: column; }
    /* 卡片用 space-between 摊开：有富余高度时（A4）均匀分布填满页面，
       内容更高的环境（Safari 默认边距）自动回落为紧凑排列；
       标题在摊开容器外，保证两列首卡顶部对齐 */
    .print-jobs { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .print-jobs .print-job { flex-shrink: 0; }
    .print-section-title { display: flex; align-items: center; gap: 2mm; margin-bottom: 2.5mm; }
    .print-section-title span { color: var(--print-accent); font: 6.2pt/1 ui-monospace, monospace; }
    .print-section-title span::after { content: " /"; }
    .print-section-title h2 { margin: 0; font-size: 9.2pt; font-weight: 500; line-height: 1.2; }
    .print-section-title i { height: .25mm; flex: 1; background: linear-gradient(90deg, var(--print-border), transparent); }
    .print-job { margin-bottom: 2.5mm; padding: 3mm 3.5mm; border-left: 1mm solid var(--job-accent, var(--print-accent)); background: linear-gradient(105deg, var(--job-tint, #fff) 0%, var(--print-surface) 43%); }
    .print-job-hontor { --job-accent: #6758c7; --job-tint: #f5f2ff; }
    .print-job-huawei { --job-accent: #d64058; --job-tint: #fff3f3; }
    .print-job-rich { --job-accent: #2f81c5; --job-tint: #f1f7fc; }
    .print-job-asiainfo { --job-accent: #df7c2e; --job-tint: #fff6ed; }
    .print-job:last-child { margin-bottom: 0; }
    .print-job header { display: flex; justify-content: space-between; align-items: center; gap: 2mm; margin-bottom: 2.2mm; padding-bottom: 1.8mm; border-bottom: .25mm solid var(--print-border); }
    .print-company { min-width: 0; display: flex; align-items: center; gap: 2mm; }
    .print-company-logo { width: 6.4mm; height: 6.4mm; flex: 0 0 6.4mm; padding: 1mm; display: grid; place-items: center; border-radius: 1.5mm; background: var(--job-tint, var(--print-logo)); }
    .print-company-logo img { width: 100%; height: 100%; object-fit: contain; }
    .print-job header h3 { color: var(--job-accent, var(--print-ink)); margin: 0 0 .8mm; font-size: 8.2pt; font-weight: 500; line-height: 1.4; }
    .print-job header p { margin: 0; color: var(--print-muted); font-size: 6.2pt; }
    .print-job time { color: var(--job-accent, var(--print-accent)); white-space: nowrap; font: 6pt/1.4 ui-monospace, monospace; }
    .print-job h4 { display: flex; align-items: baseline; justify-content: space-between; gap: 2mm; margin: 1.6mm 0 1.2mm; font-size: 8pt; font-weight: 500; }
    .print-job h4 span { color: var(--print-muted); white-space: nowrap; font: 5.6pt/1.4 ui-monospace, monospace; }
    .print-job h4.print-subproject { margin-top: 2mm; padding-top: 1.6mm; border-top: .25mm solid var(--print-border); }
    .print-job ul { list-style: none; margin: 0; padding: 0; }
    .print-job li { position: relative; margin: .6mm 0; padding-left: 2.5mm; color: var(--print-text); font-size: 7.3pt; line-height: 1.5; }
    .print-job li::before { content: ""; position: absolute; left: .2mm; top: 1.5mm; width: .7mm; height: .7mm; border-radius: 50%; background: var(--job-accent, var(--print-accent)); }
    .print-job li b { color: var(--print-ink); font-weight: 600; }
    .print-stack, .print-skills p { display: flex; flex-wrap: wrap; gap: 1mm; }
    .print-stack { margin: 2mm 0 0; }
    .print-stack span, .print-skills p span { padding: 1mm 1.4mm; border-radius: 1mm; color: var(--print-chip-text); background: var(--print-chip); font: 5.8pt/1.3 ui-monospace, monospace; }
    .print-side { display: flex; flex-direction: column; justify-content: space-between; gap: 2.2mm; }
    .print-side-card { padding: 3mm; background: #fffefd; }
    .print-profile { margin: 0; padding: 0; list-style: none; }
    .print-profile li { position: relative; margin: .8mm 0; padding-left: 2.6mm; color: var(--print-muted); font-size: 7.2pt; line-height: 1.6; }
    .print-profile li::before { content: ""; position: absolute; left: 0; top: 1.4mm; width: 1mm; height: 1mm; border-radius: 50%; background: var(--print-accent); }
    .print-availability { display: flex; align-items: center; gap: 1.6mm; margin: 1.6mm 0 0; padding-top: 1.6mm; border-top: 1px solid var(--print-border); color: var(--print-text); font-size: 6.8pt; }
    .print-availability span { width: 1.4mm; height: 1.4mm; flex-shrink: 0; border-radius: 50%; background: #3d9a5f; }
    .print-skills { display: grid; gap: 2.4mm; }
    .print-skills h3 { margin: 0 0 1.2mm; color: var(--print-muted); font-size: 7pt; font-weight: 400; }
    .print-skills p { margin: 0; }
    .print-education { display: flex; align-items: center; gap: 2mm; }
    .print-education img { width: 8mm; height: 8mm; }
    .print-education time { color: var(--print-accent); font: 5.8pt/1.5 ui-monospace, monospace; }
    .print-education h3 { margin: 1mm 0; font-size: 7.8pt; font-weight: 500; }
    .print-education p, .print-award { margin: 0; color: var(--print-muted); font-size: 6.2pt; line-height: 1.6; }
    .print-award { margin-top: 2mm; padding-top: 1.6mm; border-top: .25mm solid var(--print-border); }
    .print-credentials { display: grid; gap: 1.5mm; }
    .print-credentials p { margin: 0; padding: 2.2mm; display: flex; align-items: center; gap: 2mm; border: .25mm solid var(--print-border); border-radius: 1.5mm; font-size: 6.5pt; }
    .print-credentials span { color: var(--print-accent); font-size: 5.8pt; }
    .print-quote p { margin: 0; font-size: 8.4pt; line-height: 1.6; }
    .print-footer { position: fixed; bottom: 6mm; left: 7mm; right: 7mm; padding-top: 2mm; display: flex; align-items: center; justify-content: space-between; gap: 4mm; border-top: .7mm solid var(--print-accent); background: var(--print-bg); }
    .print-footer .print-wordmark { font: 800 13pt/1 ui-monospace, monospace; letter-spacing: -.06em; color: var(--print-ink); text-decoration: none; }
    .print-footer .print-wordmark span { color: var(--print-accent); }
    .print-footer > span { color: var(--print-muted); font-size: 6.2pt; }
}
</style>
