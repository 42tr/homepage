<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
    <footer class="footer">
        <span><b>42tr.</b> © {{ currentYear }}</span>
        <span>保持好奇，保持热爱。</span>
        <a href="#home">回到顶部 ↑</a>
    </footer>
</template>

<style scoped>
.footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 28px 0; margin-top: 40px; border-top: 1px solid #2c2d36; color: #a2a3b1; font-size: 11px; }
b { color: #d1ccdf; font: 600 14px ui-monospace, monospace; margin-right: 10px; }
a { color: #b5afff; }
@media (max-width: 480px) { .footer > span:nth-child(2) { display: none; } }
</style>
