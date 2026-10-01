<script setup>
import UESTC from '../assets/uestc.svg?url';
</script>

<template>
    <div class="card uni-card">
        <div class="uni-header">
            <img :src="UESTC" class="uni-logo" alt="UESTC" loading="lazy">
            <div class="uni-info">
                <div class="uni-name">电子科技大学</div>
                <div class="uni-en">University of Electronic Science and Technology of China</div>
            </div>
        </div>
        <div class="divider"></div>
        <div class="uni-details">
            <div class="detail-item">
                <span class="detail-label">学历</span>
                <span class="detail-value">本科</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">专业</span>
                <span class="detail-value">软件工程</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">时间</span>
                <span class="detail-value">2014 ~ 2018</span>
            </div>
        </div>
        <div class="uni-tags">
            <span class="tag tag-blue">985</span>
            <span class="tag tag-purple">211</span>
            <span class="tag tag-green">双一流</span>
        </div>
    </div>
</template>

<style scoped>
.uni-card {
    width: 100%;
    max-width: 280px;
    min-width: 240px;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(30, 30, 35, 0.75);
}

.uni-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.uni-logo {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
}

.uni-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.uni-name {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.uni-en {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.3;
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
}

.uni-details {
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

.uni-tags {
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
.tag-green { background-color: #5fb878; }
</style>
