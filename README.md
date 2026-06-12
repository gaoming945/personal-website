# Personal Website

Astro + TypeScript personal website for Ming Gao.

## Stack

- Astro static site generation
- TypeScript browser interactions
- Nginx container for static hosting
- Caddy reverse proxy on host port `18080`

## Development

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

## Docker

Build and run the production containers:

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

The router admin page remains separate at:

```text
http://192.168.100.1/
```

## Content And I18n

- Page markup lives in `src/pages/index.astro`.
- Global styles live in `src/styles/global.css`.
- Browser behavior lives in `src/scripts/main.tsx`.
- Chinese and English copy lives in `src/i18n/translations.ts`.
- Static files, including QR codes, live in `public/assets`.
- AI chat backend lives in `api/server.mjs`.

The site defaults to Chinese and stores the selected language in browser `localStorage`.
