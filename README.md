# Personal Website

Ming Gao 的个人网站，基于 Astro + TypeScript 构建的静态站点。

Personal website for Ming Gao, built with Astro + TypeScript.

[中文版](#中文版) | [English](#english)

---

## 中文版

### 技术栈

- Astro 静态站点生成
- TypeScript 浏览器交互（含 React 组件、Three.js 地球可视化）
- 本地 / Docker 部署：Nginx 托管静态文件，宿主机 Caddy 反向代理（端口 `18080`）
- GitHub Pages 部署：GitHub Actions 自动构建发布

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

测试 AI 聊天时，在另一个终端启动本地 AI API 服务：

```bash
cp .env.example .env
npm run dev:api
```

LongCat API 密钥填在 `.env` 里，浏览器端不会接触到密钥。

### Docker 部署

首次先创建共享服务网络：

```bash
docker network create service-gateway
```

构建并启动本项目：

```bash
docker compose up -d --build
```

公网站点地址：

```text
http://yadan.duckdns.org:18080/
```

Docker 栈包含：

- `personal-website`：Nginx 托管的 Astro 静态站点
- `personal-website-ai`：LongCat 驱动的 `/api/chat` 服务
- `caddy`：网站与 API 的公网反向代理

基金估值服务不由本仓库构建，独立部署在 `fund-valuation-system` 仓库。

路由器管理页（与本站无关）：

```text
http://192.168.100.1/
```

### GitHub Pages 部署

推送到 `main` 分支后，GitHub Actions 会使用 Pages 专用配置 `astro.config.pages.mjs`（子路径基址 `/personal-website`）自动构建并发布，本地 Docker 部署仍使用根路径的 `astro.config.mjs`，两者互不影响。

线上地址：

```text
https://gaoming945.github.io/personal-website/
```

说明：Pages 只托管静态站点，AI 聊天（`/api/chat`）、内容管理后台等依赖后端 API 的功能仅在 Docker 部署下可用；Pages 版本在接口不可用时会自动使用随包静态数据兜底。

### 内容与多语言

- 页面标记：`src/pages/index.astro`
- 全局样式：`src/styles/global.css`
- 浏览器行为：`src/scripts/main.tsx`
- 中英文文案：`src/i18n/translations.ts`
- 静态文件（包括二维码）：`public/assets`
- AI 聊天后端：`api/server.mjs`

站点默认中文，所选语言保存在浏览器 `localStorage` 中。

---

## English

### Stack

- Astro static site generation
- TypeScript browser interactions (React components, Three.js globe visualization)
- Local / Docker hosting: Nginx serves the static site, Caddy reverse proxy on host port `18080`
- GitHub Pages hosting: automatic build and deploy via GitHub Actions

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

Start the local AI API service in another terminal when testing chat:

```bash
cp .env.example .env
npm run dev:api
```

Put the LongCat API key in `.env`. The browser never receives the key.

### Docker

Create the shared service network once:

```bash
docker network create service-gateway
```

Build and run this project:

```bash
docker compose up -d --build
```

The public website is served at:

```text
http://yadan.duckdns.org:18080/
```

The Docker stack includes:

- `personal-website`: static Astro site served by Nginx
- `personal-website-ai`: LongCat-backed `/api/chat` service
- `caddy`: public reverse proxy for the website and API

The fund valuation service is not built by this repository; it lives in the separate `fund-valuation-system` repository.

The router admin page remains separate at:

```text
http://192.168.100.1/
```

### GitHub Pages

Pushing to `main` triggers a GitHub Actions workflow that builds with the Pages-specific config `astro.config.pages.mjs` (base path `/personal-website`) and deploys automatically. The Docker deployment keeps using the root-path `astro.config.mjs`; the two setups do not interfere.

Live URL:

```text
https://gaoming945.github.io/personal-website/
```

Note: Pages hosts the static site only. Features backed by the API service (AI chat at `/api/chat`, the admin content manager) are available in the Docker deployment only; on Pages the site falls back to its bundled static data when the API is unreachable.

### Content And I18n

- Page markup lives in `src/pages/index.astro`.
- Global styles live in `src/styles/global.css`.
- Browser behavior lives in `src/scripts/main.tsx`.
- Chinese and English copy lives in `src/i18n/translations.ts`.
- Static files, including QR codes, live in `public/assets`.
- AI chat backend lives in `api/server.mjs`.

The site defaults to Chinese and stores the selected language in browser `localStorage`.
