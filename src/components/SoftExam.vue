<script setup>
</script>

<template>
    <div class="card exam-card">
        <div class="exam-header">
            <svg class="exam-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                <circle cx="12" cy="11" r="2"/>
            </svg>
            <div class="exam-title">软考</div>
        </div>
        <div class="divider"></div>
        <div class="exam-details">
            <div class="detail-item">
                <span class="detail-label">证书</span>
                <span class="detail-value">软件设计师</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">级别</span>
                <span class="detail-value">中级</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">证书</span>
                <span class="detail-value">系统架构设计师</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">级别</span>
                <span class="detail-value">高级</span>
            </div>
        </div>
        <div class="exam-tags">
            <span class="tag tag-blue">软考</span>
            <span class="tag tag-purple">中级</span>
            <span class="tag tag-orange">高级</span>
        </div>
    </div>
</template>

<style scoped>
.exam-card {
    width: 100%;
    max-width: 280px;
    min-width: 240px;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(30, 30, 35, 0.75);
}

.exam-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.exam-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    color: #9096ee;
}

.exam-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
}

.exam-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

.exam-tags {
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

.tag-blue { background-color: #4a90d9; }
.tag-purple { background-color: #9b6dd1; }
.tag-orange { background-color: #e8a838; }
</style>
