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
        <div class="divider"></div>
        <div class="certificate-image-wrapper">
            <img
                :src="certificateImg"
                alt="NVIDIA Certificate of Competency - Getting Started with Deep Learning"
                loading="lazy"
                width="640"
                height="537"
            />
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
    padding: 22px 22px 0;
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 22px 0;
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
    height: 198px;
    padding: 16px 0 22px;
    box-sizing: border-box;
    overflow: hidden;
    background: transparent;
    transition: padding 0.5s ease;
}

.certificate-card:hover .certificate-image-wrapper {
    padding: 0;
}

.certificate-image-wrapper img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
}
</style>
