<script setup>
</script>

<template>
    <a href="https://pss-system.cponline.cnipa.gov.cn/conventionalSearch" target="_blank" rel="noopener noreferrer" class="card patent-card">
        <div class="patent-header">
            <svg class="patent-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M12 18v-6"/>
                <path d="M9 15l3-3 3 3"/>
            </svg>
            <div class="patent-title">发明专利</div>
        </div>
        <div class="divider"></div>
        <div class="patent-details">
            <div class="patent-name">
                多路召回方法、训练方法及处理设备
            </div>
            <div class="detail-item">
                <span class="detail-label">公开号</span>
                <span class="detail-value patent-number">CN121301944A</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">类型</span>
                <span class="detail-value">发明专利申请</span>
            </div>
        </div>
        <div class="patent-tags">
            <span class="tag tag-green">AI</span>
            <span class="tag tag-blue">检索</span>
            <span class="tag tag-purple">专利</span>
        </div>
    </a>
</template>

<style scoped>
.patent-card {
    width: 100%;
    max-width: 280px;
    min-width: 240px;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(30, 30, 35, 0.75);
}

.patent-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.patent-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    color: #9096ee;
}

.patent-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
}

.patent-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.patent-name {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 4px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.detail-value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
}

.patent-number {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
    color: #9096ee;
    letter-spacing: 0.5px;
}

.patent-tags {
    display: flex;
    gap: 6px;
    margin-top: 12px;
}

.tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    color: white;
}

.tag-green { background-color: #5cb85c; }
.tag-blue { background-color: #4a90d9; }
.tag-purple { background-color: #9b6dd1; }
</style>
