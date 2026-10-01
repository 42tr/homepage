<script setup>
// 主要技能类别及其子技能
const categories = [
    {
        id: 'frontend',
        name: '前端开发',
        color: '#61dafb',
        children: [
            { id: 'vue', name: 'Vue', level: 4, color: '#4fc08d' },
            { id: 'react', name: 'React', level: 2, color: '#61dafb' },
            { id: 'elementui', name: 'ElementUI', level: 4, color: '#409eff' },
            { id: 'naiveui', name: 'NaiveUI', level: 4, color: '#18a058' },
        ]
    },
    {
        id: 'backend',
        name: '后端开发',
        color: '#68d391',
        children: [
            { id: 'database', name: '数据库', level: 4, color: '#f093fb' },
            { id: 'search', name: '搜索引擎', level: 4, color: '#ff9500' },
            { id: 'msgqueue', name: '消息队列', level: 4, color: '#20b2aa' },
            { id: 'architecture', name: '系统架构', level: 4, color: '#74c0fc' },
        ]
    },
    {
        id: 'language',
        name: '编程语言',
        color: '#9b59b6',
        children: [
            { id: 'rust', name: 'Rust', level: 4, color: '#ce422b' },
            { id: 'python', name: 'Python', level: 4, color: '#3776ab' },
            { id: 'java', name: 'Java', level: 4, color: '#ed8b00' },
            { id: 'js', name: 'JavaScript', level: 4, color: '#f7df1e' },
            { id: 'go', name: 'Go', level: 4, color: '#00add8' },
        ]
    },
    {
        id: 'ai',
        name: '人工智能',
        color: '#a8e6cf',
        children: [
            { id: 'mcp', name: 'MCP', level: 3, color: '#a8e6cf' },
            { id: 'agent', name: 'Agent', level: 3, color: '#a8e6cf' },
        ]
    },
    {
        id: 'tools',
        name: '开发工具',
        color: '#ffa8a8',
        children: [
            { id: 'git', name: 'Git', level: 4, color: '#f05032' },
            { id: 'zed', name: 'Zed', level: 5, color: '#7c3aed' },
            { id: 'nvim', name: 'Neovim', level: 3, color: '#57c7ff' },
        ]
    },
];
</script>

<template>
    <div class="skill-card card">
        <div class="skill-heading">
            <div><span class="eyebrow">STACK / 技术栈</span><h3>用合适的工具，解决有趣的问题。</h3></div>
            <button class="toggle-button" type="button" aria-expanded="true" aria-controls="skill-details" data-skill-toggle>
                <span data-skill-label>收起</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 8 7 7-1.4 1.4L12 10.8l-5.6 5.6L5 15z" /></svg>
            </button>
        </div>
        <div hidden class="skill-summary">前端开发 / 后端开发 / 编程语言 / 人工智能 / 开发工具</div>
        <div id="skill-details" class="skill-tree">
            <section v-for="category in categories" :key="category.id" class="category-section">
                <h4><span class="category-dot" :style="{ backgroundColor: category.color }"></span>{{ category.name }}</h4>
                <div class="sub-skills">
                    <span v-for="skill in category.children" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.skill-card { padding: 26px; }
.skill-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.eyebrow { color: #a2a3b1; font: 10px/1.6 ui-monospace, monospace; letter-spacing: 1.4px; }
h3 { font-size: 16px; font-weight: 500; line-height: 1.6; margin: 10px 0 0; }
.toggle-button { display: flex; align-items: center; gap: 4px; flex-shrink: 0; padding: 6px 8px; border: 1px solid #393844; border-radius: 6px; background: #25242e; color: #c2bbef; font: inherit; font-size: 11px; cursor: pointer; }
.toggle-button:hover { background: #343044; }
.toggle-button svg { width: 14px; height: 14px; }
.skill-tree { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 24px; }
.category-section { min-width: 0; }
.category-section:last-child { grid-column: 1 / -1; }
h4 { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 400; color: #b8b6c4; margin: 0 0 10px; }
.category-dot { width: 5px; height: 5px; border-radius: 50%; }
.sub-skills { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { padding: 4px 9px; border: 1px solid #33323e; border-radius: 6px; background: #24232d; color: #d7d3e9; font: 11px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; }
.skill-summary { color: #aaa6bb; font-size: 13px; line-height: 2; }
@media (max-width: 480px) { .skill-card { padding: 22px; } .skill-tree { grid-template-columns: minmax(0, 1fr); gap: 20px; } }
</style>

<style scoped>
[hidden] { display: none !important; }
.toggle-button[aria-expanded="false"] svg { transform: rotate(180deg); }
</style>
