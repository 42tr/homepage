<script setup>
</script>

<template>
    <div class="card license-card">
        <div class="license-header">
            <svg class="license-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M7 12h-2"/>
                <path d="M19 12h-2"/>
                <path d="M12 7v-2"/>
                <path d="M12 19v-2"/>
            </svg>
            <div class="license-title">机动车驾驶证</div>
        </div>
        <div class="divider"></div>
        <div class="license-details">
            <div class="detail-item">
                <span class="detail-label">准驾车型</span>
                <span class="detail-value license-type">C1D</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">C1</span>
                <span class="detail-value">小型汽车</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">D</span>
                <span class="detail-value">普通三轮摩托车</span>
            </div>
        </div>
        <div class="license-tags">
            <span class="tag tag-blue">手动挡</span>
            <span class="tag tag-orange">摩托车</span>
        </div>
    </div>
</template>

<style scoped>
.license-card {
    width: 100%;
    max-width: 280px;
    min-width: 240px;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(30, 30, 35, 0.75);
}

.license-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.license-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    color: #9096ee;
}

.license-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
}

.license-details {
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

.license-type {
    font-size: 18px;
    font-weight: 700;
    color: #9096ee;
    letter-spacing: 1px;
}

.license-tags {
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
.tag-orange { background-color: #e8a838; }
</style>
