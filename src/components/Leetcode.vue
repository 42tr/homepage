<script setup>
import { computed, ref } from 'vue'

// Build-time snapshot: rendered into the HTML so the card works without JavaScript.
// The vanilla script in src/pages/index.astro replaces these values from /api/leetcode.
import snapshot from '../../data/leetcode.json'
const updatedDate = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(snapshot.updated_at))
const data = ref(snapshot)
const loading = ref(false)
const error = ref(null)

const solvePercent = computed(() => {
  if (!data.value.question_total) return 0
  return Math.round((data.value.question_solved / data.value.question_total) * 100)
})
</script>

<template>
    <a :href="`https://leetcode.cn/u/${snapshot.user_slug}/`" target="_blank" rel="noopener noreferrer">
        <div class="card leetcode-card">
            <div class="card-header">
                <div class="leetcode-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.544-4.543c-.467-.466-.702-1.15-.702-1.824s.235-1.357.702-1.824l4.543-4.543c.467-.467 1.113-.702 1.824-.702s1.357.235 1.823.702l2.697 2.606-1.058 1.058-2.697-2.607c-.195-.195-.45-.293-.705-.293s-.51.098-.706.293l-4.543 4.543c-.195.195-.293.45-.293.705s.098.51.293.706l4.543 4.543c.195.195.45.293.706.293s.51-.098.705-.293l2.697-2.607 1.058 1.058zM20.748 16.488l-4.543 4.543c-.467.467-1.113.662-1.824.662s-1.357-.195-1.824-.662l-2.697-2.606 1.058-1.058 2.697 2.607c.195.195.45.293.705.293s.51-.098.706-.293l4.543-4.543c.195-.195.293-.45.293-.705s-.098-.51-.293-.706l-4.543-4.543c-.195-.195-.45-.293-.706-.293s-.51.098-.705.293l-2.697 2.607-1.058-1.058 2.697-2.606c.467-.467 1.113-.702 1.824-.702s1.357.235 1.824.702l4.543 4.543c.467.467.702 1.15.702 1.824s-.235 1.357-.702 1.824z"/>
                    </svg>
                </div>
                <span class="card-title">LeetCode</span>
            </div>
            <div class="card-body">
                <div v-if="loading" class="loading-wrapper"><span class="spinner"></span></div>
                <template v-else>
                    <div v-if="error" class="error-message">{{ error }}</div>
                    <div v-else class="stats-wrapper">
                        <!-- 分数环 -->
                        <div class="rating-ring-wrapper">
                            <div class="rating-ring">
                                <svg class="ring-svg" viewBox="0 0 120 120">
                                    <circle class="ring-bg" cx="60" cy="60" r="52"/>
                                    <circle
                                        class="ring-progress"
                                        cx="60"
                                        cy="60"
                                        r="52"
                                        :stroke-dasharray="`${(data.rating || 0) / 3000 * 326.73} 326.73`"
                                        data-leetcode-ring
                                    />
                                </svg>
                                <div class="ring-text">
                                    <span class="ring-value" data-leetcode="rating">{{ data.rating || '--' }}</span>
                                    <span class="ring-label">竞赛分</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-list">
                            <div class="stat-item">
                                <span class="label">全球排名</span>
                                <span class="value"><span data-leetcode="global_ranking">{{ data.global_ranking || '--' }}</span> <span class="total">/ <span data-leetcode="global_total_participants">{{ data.global_total_participants || '--' }}</span></span></span>
                            </div>
                            <div class="stat-item">
                                <span class="label">全国排名</span>
                                <span class="value"><span data-leetcode="local_ranking">{{ data.local_ranking || '--' }}</span> <span class="total">/ <span data-leetcode="local_total_participants">{{ data.local_total_participants || '--' }}</span></span></span>
                            </div>
                            <div class="stat-item">
                                <span class="label">已解答</span>
                                <div class="solve-bar-wrapper">
                                    <div class="solve-bar">
                                        <div class="solve-fill" :style="{ width: solvePercent + '%' }" data-leetcode-fill></div>
                                    </div>
                                    <span class="solve-text" data-leetcode="questions">{{ data.question_solved || 0 }} / {{ data.question_total || 0 }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <p class="updated-date" data-leetcode-updated>数据更新：{{ updatedDate }}</p>
        </div>
    </a>
</template>

<style scoped>
.leetcode-card {
    padding: 20px;
    min-height: 280px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.leetcode-icon {
    color: #ffa116;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.stats-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 加载动画 */
.loading-wrapper {
    display: flex;
    justify-content: center;
    padding: 40px 0;
}

.spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-top-color: #ffa116;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* 分数环 */
.rating-ring-wrapper {
    display: flex;
    justify-content: center;
}

.rating-ring {
    position: relative;
    width: 110px;
    height: 110px;
}

.ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.ring-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 8;
}

.ring-progress {
    fill: none;
    stroke: #ffa116;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dasharray 1s ease;
}

.ring-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.ring-value {
    font-size: 22px;
    font-weight: 700;
    color: #ffa116;
}

.ring-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
}

/* 统计数据列表 */
.stat-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-item:last-child {
    border-bottom: none;
}

.label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
}

.value {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
}

.total {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
}

/* 解题进度条 */
.solve-bar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.solve-bar {
    width: 60px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.solve-fill {
    height: 100%;
    background: linear-gradient(90deg, #5fb878, #3d8b53);
    border-radius: 2px;
    transition: width 1s ease;
}

.solve-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.error-message {
    color: #ff6b6b;
    text-align: center;
    padding: 20px;
    font-size: 0.95rem;
}
</style>

<style scoped>
.updated-date { margin: 16px 0 0; color: #a2a3b1; font-size: 10px; }
</style>
