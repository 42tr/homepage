import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: process.env.SITE_URL || 'https://42tr.cn',
  output: 'static',
  integrations: [vue()],
  vite: { ssr: { noExternal: ['@vicons/carbon'] } },
  build: { format: 'directory' },
});
