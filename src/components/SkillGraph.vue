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
            { id: 'typescript', name: 'TypeScript', level: 4, color: '#3178c6' },
            { id: 'javascript', name: 'JavaScript', level: 4, color: '#f7df1e' },
            { id: 'tailwindcss', name: 'Tailwind CSS', level: 4, color: '#38bdf8' },
            { id: 'nodejs', name: 'NodeJS', level: 4, color: '#5fa04e' },
        ]
    },
    {
        id: 'backend',
        name: '后端开发',
        color: '#68d391',
        children: [
            { id: 'postgres', name: 'Postgres', level: 4, color: '#336791' },
            { id: 'mysql', name: 'MySQL', level: 4, color: '#4479a1' },
            { id: 'tidb', name: 'TiDB', level: 4, color: '#e30c34' },
            { id: 'doris', name: 'Doris', level: 4, color: '#4c8dff' },
            { id: 'elasticsearch', name: 'ElasticSearch', level: 4, color: '#fec514' },
            { id: 'kafka', name: 'Kafka', level: 4, color: '#20b2aa' },
            { id: 'redis', name: 'Redis', level: 4, color: '#dc382d' },
        ]
    },
    {
        id: 'infrastructure',
        name: '基础设施',
        color: '#74c0fc',
        children: [
            { id: 'docker', name: 'Docker', level: 4, color: '#2496ed' },
            { id: 'kubernetes', name: 'Kubernetes', level: 4, color: '#326ce5' },
            { id: 'nginx', name: 'Nginx', level: 4, color: '#009639' },
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
            { id: 'c', name: 'C', level: 4, color: '#a8b9cc' },
            { id: 'go', name: 'Go', level: 4, color: '#00add8' },
        ]
    },
    {
        id: 'ai',
        name: '人工智能',
        color: '#a8e6cf',
        children: [
            { id: 'llm', name: 'LLM', level: 4, color: '#a8e6cf' },
            { id: 'tts', name: 'TTS', level: 3, color: '#a8e6cf' },
            { id: 'ocr', name: 'OCR', level: 3, color: '#a8e6cf' },
            { id: 'rag', name: 'RAG', level: 4, color: '#a8e6cf' },
            { id: 'mcp', name: 'MCP', level: 3, color: '#a8e6cf' },
            { id: 'skills', name: 'Skills', level: 3, color: '#a8e6cf' },
            { id: 'agent', name: 'Agent', level: 3, color: '#a8e6cf' },
        ]
    },
    {
        id: 'ops',
        name: '运维 / 工具',
        color: '#ffa8a8',
        children: [
            { id: 'linux', name: 'Linux', level: 4, color: '#fcc624' },
            { id: 'prometheus', name: 'Prometheus', level: 3, color: '#e6522c' },
            { id: 'grafana', name: 'Grafana', level: 3, color: '#f46800' },
            { id: 'git', name: 'Git', level: 4, color: '#f05032' },
            { id: 'zed', name: 'Zed', level: 5, color: '#7c3aed' },
            { id: 'nvim', name: 'Neovim', level: 3, color: '#57c7ff' },
        ]
    },
    {
        id: 'embedded',
        name: '嵌入式 / 硬件',
        color: '#ffd166',
        children: [
            { id: 'esp32', name: 'ESP32', level: 3, color: '#e7352c' },
            { id: 'raspberrypi', name: '树莓派', level: 3, color: '#c51a4a' },
        ]
    },
];

// 按列排布：前两列各放两个两行高的分类，三个只占一行的分类归入第三列
const byId = Object.fromEntries(categories.map(c => [c.id, c]));
const columns = [
    ['frontend', 'ai'],
    ['backend', 'ops'],
    ['infrastructure', 'language', 'embedded'],
].map(ids => ids.map(id => byId[id]));
</script>

<template>
    <div class="skill-card card">
        <div id="skill-details" class="skill-tree">
            <div v-for="(column, index) in columns" :key="index" class="skill-column">
                <section v-for="category in column" :key="category.id" class="category-section">
                    <h4><span class="category-dot" :style="{ backgroundColor: category.color }"></span>{{ category.name }}</h4>
                    <div class="sub-skills">
                        <span v-for="skill in category.children" :key="skill.id" class="skill-tag">{{ skill.name }}</span>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.skill-card { padding: 26px; display: flex; flex-direction: column; }
.skill-tree { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.skill-column { display: flex; flex-direction: column; justify-content: space-between; gap: 28px; min-width: 0; }
.category-section { min-width: 0; }
h4 { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 400; color: #b8b6c4; margin: 0 0 12px; }
.category-dot { width: 5px; height: 5px; border-radius: 50%; }
.sub-skills { display: flex; flex-wrap: wrap; gap: 9px; }
.skill-tag { padding: 6px 11px; border: 1px solid #33323e; border-radius: 6px; background: #24232d; color: #d7d3e9; font: 11px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; }
@media (max-width: 480px) { .skill-card { padding: 22px; } .skill-tree { grid-template-columns: minmax(0, 1fr); gap: 20px; } }
</style>
