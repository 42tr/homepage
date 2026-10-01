<template>
    <div class="card clock-card">
        <div class="clock-heading"><span>LOCAL TIME / 此刻</span><span class="greeting">此刻</span></div>
        <div class="time">--:--:--</div>
        <div class="date-row">
            <span class="date">本地时间</span>
            <span class="week"></span>
        </div>
    </div>
</template>

<style scoped>
.clock-card { padding: 24px 26px; }
.clock-heading { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; color: #a2a3b1; font: 10px/1.6 ui-monospace, monospace; letter-spacing: 1px; }
.greeting { color: #c9c4e8; letter-spacing: 0; }
.time { font: 500 clamp(28px, 3.4vw, 46px)/1.3 ui-monospace, SFMono-Regular, Consolas, monospace; color: #e8e5f2; font-variant-numeric: tabular-nums; letter-spacing: -1.5px; margin: 18px 0 12px; }
.date-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: #a2a3b1; font-size: 11px; }
.week { color: #c5bfdc; border-left: 1px solid #42404c; padding-left: 8px; }
@media (max-width: 760px) { .clock-card { padding: 24px 20px; } .time { font-size: clamp(26px, 5vw, 40px); } }
</style>
