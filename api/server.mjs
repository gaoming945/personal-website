import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { buildSiteContext } from './site-context.mjs';

function loadLocalEnv() {
  if (!existsSync('.env')) return;
  const content = readFileSync('.env', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 8787);
const API_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN || process.env.LONGCAT_API_KEY || '';
const BASE_URL = (process.env.ANTHROPIC_BASE_URL || process.env.LONGCAT_BASE_URL || 'https://api.longcat.chat/anthropic').replace(/\/$/, '');
const MODEL = process.env.ANTHROPIC_MODEL || process.env.LONGCAT_MODEL || 'LongCat-2.0-Preview';
const MAX_INPUT_LENGTH = 600;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 18;

const rateLimitStore = new Map();

const siteContext = buildSiteContext();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 4096) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function clientId(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown';
}

function isRateLimited(id) {
  const now = Date.now();
  const current = rateLimitStore.get(id);
  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(id, { count: 1, startedAt: now });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function messagesEndpoint() {
  if (BASE_URL.endsWith('/v1')) return `${BASE_URL}/messages`;
  if (BASE_URL.endsWith('/messages')) return BASE_URL;
  return `${BASE_URL}/v1/messages`;
}

function buildLongCatPayload({ message, language, stream = false }) {
  return {
    model: MODEL,
    max_tokens: 1000,
    temperature: 0.2,
    stream,
    system: `${siteContext}\n\nCurrent language: ${language === 'en' ? 'English' : 'Chinese'}.`,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  };
}

function extractStreamText(event) {
  if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return event.delta.text || '';
  }

  if (event?.type === 'content_block_delta' && typeof event.delta?.text === 'string') {
    return event.delta.text;
  }

  if (event?.type === 'text_delta') {
    return event.text || event.delta || '';
  }

  return '';
}

async function streamLongCat({ message, language }, clientResponse) {
  const response = await fetch(messagesEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': API_TOKEN,
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(buildLongCatPayload({ message, language, stream: true })),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LongCat request failed ${response.status}: ${detail.slice(0, 240)}`);
  }

  if (!response.body) {
    throw new Error('LongCat response did not include a stream');
  }

  clientResponse.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let wroteText = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        const text = extractStreamText(event);
        if (text) {
          wroteText = true;
          clientResponse.write(text);
        }
      } catch {
        // Ignore non-JSON stream control lines.
      }
    }
  }

  if (!wroteText) {
    throw new Error('LongCat stream did not include text');
  }

  clientResponse.end();
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.url === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.url !== '/api/chat' || request.method !== 'POST') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  if (!API_TOKEN) {
    sendJson(response, 503, { error: 'AI service is not configured' });
    return;
  }

  if (isRateLimited(clientId(request))) {
    sendJson(response, 429, { error: 'Too many requests' });
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = JSON.parse(rawBody || '{}');
    const message = String(payload.message || '').trim().slice(0, MAX_INPUT_LENGTH);
    const language = payload.language === 'en' ? 'en' : 'zh';

    if (!message) {
      sendJson(response, 400, { error: 'Message is required' });
      return;
    }

    await streamLongCat({ message, language }, response);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'AI request failed' });
    } else {
      response.end();
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AI chat API listening on ${PORT}`);
});
