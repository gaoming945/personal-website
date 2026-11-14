import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// GitHub Pages 专用配置：项目页子路径 /personal-website。
// 本地 Docker 部署仍用 astro.config.mjs（根路径），互不影响。
export default defineConfig({
  site: 'https://gaoming945.github.io',
  base: '/personal-website',
  output: 'static',
  integrations: [react()]
});
