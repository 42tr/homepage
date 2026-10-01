<script setup>
import SelfInfo from '../components/SelfInfo.vue';
import Leetcode from '../components/Leetcode.vue';
import University from '../components/University.vue';
import SkillGraph from '../components/SkillGraph.vue';
import ClockCard from '../components/ClockCard.vue';
import DriverLicense from '../components/DriverLicense.vue';
import SoftExam from '../components/SoftExam.vue';
import Patent from '../components/Patent.vue';
import NvidiaCertificate from '../components/NvidiaCertificate.vue';
import Footer from '../components/Footer.vue';
import Haruhi from '../assets/haruhi.webp?url';
</script>

<template>
    <div class="home-page">
        <div class="home-shell">
            <header class="site-header">
                <a class="wordmark" href="#home" aria-label="42tr 首页">42tr<span class="brand-dot">.</span></a>
                <span class="header-note">一个持续构建中的个人空间</span>
                <nav aria-label="页面导航">
                    <a href="#toolbox">技术</a>
                    <a href="#journey">经历</a>
                    <a href="/resume" target="_blank" rel="noopener noreferrer">简历 <span aria-hidden="true">↗</span></a>
                </nav>
            </header>

            <main id="home">
                <section class="intro-grid" aria-label="关于我">
                    <SelfInfo />
                    <aside class="side-notes">
                        <ClockCard />
                        <div class="card now-card">
                            <span class="eyebrow">ON MY RADAR / 关注中</span>
                            <h2>从系统架构，<br>到 AI 的更多可能。</h2>
                            <p>Agent · MCP · 知识检索</p>
                            <span class="note-footer">保持好奇，持续构建<span aria-hidden="true">_</span></span>
                        </div>
                    </aside>
                </section>

                <section id="toolbox" class="page-section" aria-labelledby="toolbox-title">
                    <div class="section-heading">
                        <h2 id="toolbox-title"><span class="section-index">01 /</span> 我的工具箱</h2>
                        <span class="section-caption">从界面到系统，从想法到实现</span>
                    </div>
                    <div class="toolbox-grid">
                        <SkillGraph />
                        <Leetcode />
                    </div>
                </section>

                <section id="journey" class="page-section" aria-labelledby="journey-title">
                    <div class="section-heading">
                        <h2 id="journey-title"><span class="section-index">02 /</span> 一路积累</h2>
                        <a class="section-link" href="/resume" target="_blank" rel="noopener noreferrer">完整经历 <span aria-hidden="true">↗</span></a>
                    </div>
                    <div class="credentials-grid">
                        <University />
                        <SoftExam />
                        <Patent />
                        <NvidiaCertificate />
                    </div>
                </section>

                <section class="page-section" aria-labelledby="life-title">
                    <div class="section-heading">
                        <h2 id="life-title"><span class="section-index">03 /</span> 代码之外</h2>
                        <span class="section-caption">生活不止一个线程</span>
                    </div>
                    <div class="life-grid">
                        <DriverLicense />
                        <figure class="card interest-card">
                            <img :src="Haruhi" alt="凉宫春日插画" loading="lazy" width="640" height="360">
                            <figcaption>
                                <span class="eyebrow">OFFLINE / 兴趣存档</span>
                                <h3>给想象力，留一点位置。</h3>
                                <span>凉宫春日 · 动漫</span>
                            </figcaption>
                        </figure>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    </div>
</template>

<style scoped>
.home-page {
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
.home-shell { width: min(1440px, 100%); margin-inline: auto; padding: 0 clamp(16px, 3.5vw, 64px); box-sizing: border-box; }
.site-header { min-height: 96px; display: flex; align-items: center; gap: 24px; }
.wordmark { font: 800 28px/1 ui-monospace, monospace; letter-spacing: -2px; color: #eeeef2; }
.brand-dot { color: var(--home-accent); }
.header-note { font-size: 12px; color: var(--home-muted); }
.site-header nav { display: flex; gap: 28px; margin-left: auto; font-size: 13px; }
.site-header nav a { color: #bfc0cc; transition: color .2s; }
.site-header nav a:hover, .section-link:hover { color: #fff; }
.intro-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; }
.side-notes { display: grid; grid-template-rows: auto 1fr; gap: 20px; min-width: 0; }
.home-page :deep(.card) { width: 100%; min-width: 0; max-width: none; margin: 0; border: 1px solid var(--home-border); border-radius: 20px; background: var(--home-surface); box-shadow: none; backdrop-filter: none; }
.home-page :deep(a.card:hover), .home-page :deep(a:hover > .card) { border-color: #77718f; background: #202129; }
.home-page :deep(a:focus-visible), .home-page :deep(button:focus-visible) { outline: 2px solid var(--home-accent); outline-offset: 5px; }
.home-page :deep(.detail-label), .home-page :deep(.uni-en), .home-page :deep(.label), .home-page :deep(.ring-label), .home-page :deep(.total) { color: var(--home-muted); }
.home-page :deep(.tag) { background: #292a35; color: #c7c2f6; border-radius: 6px; }
.now-card { padding: 26px; display: flex; flex-direction: column; align-items: flex-start; }
.eyebrow { color: var(--home-muted); font: 10px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1.4px; }
.now-card h2 { font-size: clamp(19px, 2vw, 25px); font-weight: 500; line-height: 1.6; margin: 16px 0 8px; }
.now-card p { color: var(--home-accent); font: 12px/1.8 ui-monospace, monospace; margin: 0 0 24px; }
.note-footer { margin-top: auto; color: var(--home-muted); font-size: 12px; width: 100%; display: flex; justify-content: space-between; }
.note-footer span { color: var(--home-accent); }
.page-section { margin-top: 40px; scroll-margin-top: 24px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.section-heading h2 { font-size: 16px; font-weight: 500; margin: 0; }
.section-index { color: var(--home-accent); font: 11px ui-monospace, monospace; margin-right: 10px; }
.section-caption, .section-link { color: var(--home-muted); font-size: 12px; }
.toolbox-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.toolbox-grid > * { min-width: 0; }
.credentials-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
.credentials-grid :deep(.uni-card), .credentials-grid :deep(.exam-card), .credentials-grid :deep(.patent-card), .life-grid :deep(.license-card) { padding: 22px; }
.credentials-grid :deep(.certificate-header) { padding: 22px 18px 14px; }
.credentials-grid :deep(.certificate-icon) { width: 26px; height: 26px; }
.credentials-grid :deep(.certificate-title) { font-size: 13px; }
.credentials-grid :deep(.certificate-image-wrapper) { height: 160px; margin: 0; }
.credentials-grid :deep(.certificate-image-wrapper img) { width: 100%; height: 100%; object-fit: contain; }
.life-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 20px; }
.interest-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.interest-card img { width: 100%; height: 100%; min-height: 220px; max-height: 260px; object-fit: cover; object-position: center 35%; }
.interest-card figcaption { padding: 28px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
.interest-card h3 { font-size: 19px; font-weight: 500; line-height: 1.7; margin: 18px 0; }
.interest-card figcaption > span:last-child { color: var(--home-muted); font-size: 12px; }
@media (max-width: 1100px) {
    .credentials-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .credentials-grid :deep(.certificate-image-wrapper) { height: 150px; }
}
@media (max-width: 760px) {
    .site-header { min-height: 76px; }
    .header-note { display: none; }
    .site-header nav { gap: 20px; }
    .intro-grid, .toolbox-grid, .life-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .side-notes { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: auto; gap: 16px; }
    .now-card { padding: 20px; }
    .now-card h2 { font-size: 18px; margin: 10px 0; }
    .now-card p { margin-bottom: 16px; }
    .page-section { margin-top: 30px; }
    .section-caption { display: none; }
}
@media (max-width: 480px) {
    .side-notes, .credentials-grid { grid-template-columns: minmax(0, 1fr); }
    .now-card h2 br { display: none; }
    .now-card h2 { font-size: 19px; }
    .credentials-grid :deep(.certificate-image-wrapper) { height: 190px; }
    .interest-card { grid-template-columns: minmax(0, 1fr); }
    .interest-card img { height: 210px; min-height: 0; }
    .interest-card figcaption { padding: 22px; }
    .interest-card h3 { margin: 10px 0; }
}
</style>
