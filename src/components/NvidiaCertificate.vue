<script setup>
import certificateImg from "../assets/nvidia_certificate_dl_start.webp?url";

const certificateUrl = "https://learn.nvidia.com/certificates?id=Bzp6L9x0Ty6tZJK_T38j2A#";
</script>

<template>
    <a
        :href="certificateUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="card certificate-card"
    >
        <div class="certificate-header">
            <svg
                class="certificate-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <div class="certificate-title">NVIDIA 深度学习认证</div>
        </div>
        <div class="certificate-image-wrapper">
            <img
                :src="certificateImg"
                alt="NVIDIA Certificate of Competency - Getting Started with Deep Learning"
                loading="lazy"
                width="640"
                height="537"
            />
        </div>
        <div class="certificate-footer">
            <span class="certificate-link">查看证书 →</span>
        </div>
    </a>
</template>

<style scoped>
.certificate-card {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    border-top: 3px solid #76b900;
}

.certificate-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 16px 12px;
}

.certificate-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    color: #76b900;
}

.certificate-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.certificate-image-wrapper {
    width: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
}

.certificate-image-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.certificate-card:hover .certificate-image-wrapper img {
    transform: scale(1.03);
}

.certificate-footer {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px 16px;
}

.certificate-link {
    font-size: 13px;
    font-weight: 500;
    color: #76b900;
}
</style>
