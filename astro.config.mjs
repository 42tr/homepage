import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: process.env.SITE_URL || 'https://42tr.cn',
  output: 'static',
  integrations: [vue()],
  vite: {
    ssr: { noExternal: ['@vicons/carbon'] },
    // WSL 下 inotify 文件事件不可靠，轮询保证模块热更新
    server: { watch: { usePolling: true } },
  },
  build: { format: 'directory' },
});
