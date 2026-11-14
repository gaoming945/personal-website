# Personal Website

Ming Gao 的个人网站，基于 Astro + TypeScript 构建的静态站点，部署在 GitHub Pages。

Personal website for Ming Gao, built with Astro + TypeScript and hosted on GitHub Pages.

[中文版](#中文版) | [English](#english)

---

## 中文版

### 技术栈

- Astro 静态站点生成
- TypeScript 浏览器交互（含 React 组件、Three.js 地球可视化）
- GitHub Pages 部署：推送到 `main` 后由 GitHub Actions 自动构建发布

### 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建并做类型检查：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

### 部署（GitHub Pages）

推送到 `main` 分支后，GitHub Actions 会使用 `astro.config.pages.mjs`（子路径基址 `/personal-website`）自动构建并发布，约 1 分钟生效。

线上地址：

```text
https://gaoming945.github.io/personal-website/
```

说明：本站已改为纯静态站点，内容全部随仓库发布（见下方数据文件）。原 Docker + 后端 API 部署（AI 聊天、内容管理后台）已于 2026-11-14 下线，相关代码已从仓库移除（git 历史中仍可找回）。

### 内容与多语言

- 页面标记：`src/pages/index.astro`
- 全局样式：`src/styles/global.css`
- 浏览器行为：`src/scripts/main.tsx`
- 中英文文案：`src/i18n/translations.ts`
- 旅行数据：`src/scripts/travel-data.ts`
- 项目与健身照片静态数据：`public/projects.json`、`public/photos.json`
- 静态文件：`public/assets`

站点默认中文，所选语言保存在浏览器 `localStorage` 中。

---

## English

### Stack

- Astro static site generation
- TypeScript browser interactions (React components, Three.js globe visualization)
- GitHub Pages hosting: automatic build and deploy via GitHub Actions on push to `main`

### Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build and type-check the static site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Deployment (GitHub Pages)

Pushing to `main` triggers a GitHub Actions workflow that builds with `astro.config.pages.mjs` (base path `/personal-website`) and deploys automatically, live in about a minute.

Live URL:

```text
https://gaoming945.github.io/personal-website/
```

Note: the site is now fully static — all content ships with the repository (see the data files below). The former Docker + backend API deployment (AI chat, admin content manager) was retired on 2026-11-14 and its code removed from the repo (still available in git history).

### Content And I18n

- Page markup lives in `src/pages/index.astro`.
- Global styles live in `src/styles/global.css`.
- Browser behavior lives in `src/scripts/main.tsx`.
- Chinese and English copy lives in `src/i18n/translations.ts`.
- Travel data lives in `src/scripts/travel-data.ts`.
- Static project and fitness-photo data lives in `public/projects.json` and `public/photos.json`.
- Static files live in `public/assets`.

The site defaults to Chinese and stores the selected language in browser `localStorage`.
