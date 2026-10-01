<script setup>
import Avatar from '../assets/avatar.webp?url';
import YuqueIcon from '../assets/yuque.svg?url';
import ArrowUpRight from '@vicons/carbon/es/ArrowUpRight.js';
import LogoGithub from '@vicons/carbon/es/LogoGithub.js';
import Notebook from '@vicons/carbon/es/Notebook.js';
import Document from '@vicons/carbon/es/Document.js';

const links = [
    { label: 'GitHub', href: 'https://github.com/42tr', icon: LogoGithub },
    { label: '博客', href: '/blog', icon: Notebook },
    { label: '语雀', href: 'https://www.yuque.com/42tr/knowledge', img: YuqueIcon },
    { label: '简历', href: '/resume', icon: Document },
];
</script>

<template>
    <article class="card self-card">
        <div class="profile-top">
            <a href="/resume" target="_blank" rel="noopener noreferrer" class="avatar-frame" aria-label="查看 42tr 的简历">
                <img :src="Avatar" alt="明日方舟史尔特尔头像" class="avatar" fetchpriority="high" width="88" height="88">
            </a>
            <div class="profile-id">
                <span class="eyebrow">HELLO, WORLD. I'M</span>
                <h1>42tr<span>.</span></h1>
            </div>
            <a class="personality" href="https://www.16personalities.com/intj-personality" target="_blank" rel="noopener noreferrer">INTJ-A <span>建筑师</span></a>
        </div>
        <div class="profile-copy">
            <h2>把想法，<br>写成<span>可以运行的日常。</span></h2>
            <p>设计开发一条龙。游走在前端、后端与 AI 之间，<br class="desktop-break">喜欢拆解问题，也享受从零构建的过程。</p>
        </div>
        <div class="profile-bottom">
            <div class="identity-tags"><span>全栈开发</span><span>系统架构</span><span>AI 探索</span></div>
            <nav class="social-links" aria-label="我的个人链接">
                <a v-for="link in links" :key="link.label" :href="link.href" target="_blank" rel="noopener noreferrer">
                    <img v-if="link.img" :src="link.img" class="link-icon" alt="" aria-hidden="true">
                    <component v-else :is="link.icon" aria-hidden="true" />
                    {{ link.label }}
                    <ArrowUpRight class="link-arrow" aria-hidden="true" />
                </a>
            </nav>
        </div>
    </article>
</template>

<style scoped>
.self-card { padding: clamp(24px, 3.5vw, 46px); display: flex; flex-direction: column; position: relative; }
.profile-top { display: flex; align-items: center; gap: 20px; }
.avatar-frame { width: 88px; height: 88px; flex-shrink: 0; position: relative; overflow: hidden; border-radius: 50%; border: 3px solid #383440; background: #23232b; }
.avatar { width: 100%; height: 100%; object-fit: cover; display: block; }
.eyebrow { color: #a2a3b1; font: 10px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1.4px; }
h1 { font: 700 clamp(36px, 4vw, 52px)/1.1 ui-monospace, monospace; letter-spacing: -3px; margin: 4px 0 0; }
h1 span { color: #b5afff; }
.personality { margin-left: auto; align-self: flex-start; color: #c1bbee; border: 1px solid #3b354b; border-radius: 6px; padding: 6px 10px; font: 11px/1.5 ui-monospace, monospace; white-space: nowrap; }
.personality span { display: block; color: #a2a3b1; font: 10px/1.8 inherit; }
.profile-copy { margin-block: 30px; }
.profile-copy h2 { font-size: clamp(25px, 3.2vw, 42px); font-weight: 600; line-height: 1.45; letter-spacing: -1px; margin: 0 0 16px; }
.profile-copy h2 span { color: #b5afff; }
.profile-copy p { color: #a2a3b1; font-size: 13px; line-height: 1.9; margin: 0; }
.profile-bottom { margin-top: auto; }
.identity-tags { display: flex; flex-wrap: wrap; gap: 16px; color: #c0bdcd; font-size: 11px; margin-bottom: 24px; }
.identity-tags span::before { content: '/'; margin-right: 7px; color: #797489; }
.social-links { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding-top: 20px; border-top: 1px solid #303039; }
.social-links a { display: flex; align-items: center; justify-content: center; gap: 7px; color: #d3d1dc; background: #23232d; border: 1px solid #34333f; border-radius: 9px; padding: 10px 4px; font-size: 12px; transition: background .2s, border-color .2s; }
.social-links a:hover { background: #343044; border-color: #8f84bf; }
.social-links svg { width: 16px; height: 16px; flex-shrink: 0; }
.social-links .link-icon { width: 16px; height: 16px; flex-shrink: 0; }
.social-links .link-arrow { width: 12px; height: 12px; color: #9793a9; }
@media (max-width: 980px) and (min-width: 761px) { .social-links { grid-template-columns: repeat(2, minmax(0, 1fr)); } .personality { padding: 5px; } }
@media (max-width: 480px) { .profile-top { gap: 14px; } .avatar-frame { width: 72px; height: 72px; } .personality { padding: 5px 7px; } .social-links { grid-template-columns: repeat(2, minmax(0, 1fr)); } .desktop-break { display: none; } }
</style>
