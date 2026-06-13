import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { buildSiteContext } from './site-context.mjs';
import { GatewayStore, extractBearerToken } from './gateway-store.mjs';
import {
  anthropicMessagesEndpoint,
  estimateTokens,
  extractAnthropicText,
  extractStreamText,
  openAiToAnthropicPayload,
  toOpenAiChatCompletion,
} from './longcat-client.mjs';

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
const GATEWAY_ADMIN_TOKEN = process.env.GATEWAY_ADMIN_TOKEN || '';
const GATEWAY_DATA_DIR = process.env.GATEWAY_DATA_DIR || '/data';
const GATEWAY_MAX_BODY_BYTES = Number(process.env.GATEWAY_MAX_BODY_BYTES || 64 * 1024);
const GATEWAY_MAX_TOKENS = Number(process.env.GATEWAY_MAX_TOKENS || 2000);

const rateLimitStore = new Map();
const gatewayStore = new GatewayStore({ dataDir: GATEWAY_DATA_DIR });

const siteContext = buildSiteContext();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  });
  response.end(JSON.stringify(payload));
}

function readBody(request, limitBytes = 4096) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > limitBytes) {
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
  return anthropicMessagesEndpoint(BASE_URL);
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

function requireAdmin(request, response) {
  const token = request.headers['x-admin-token'] || extractBearerToken(request);
  if (!GATEWAY_ADMIN_TOKEN || token !== GATEWAY_ADMIN_TOKEN) {
    sendJson(response, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

function authenticateGatewayKey(request, response) {
  const apiKey = extractBearerToken(request);
  if (!apiKey) {
    sendJson(response, 401, { error: { message: 'Missing bearer token', type: 'auth_error' } });
    return null;
  }

  const keyRecord = gatewayStore.getKey(apiKey);
  if (!keyRecord) {
    sendJson(response, 401, { error: { message: 'Invalid API key', type: 'auth_error' } });
    return null;
  }

  return keyRecord;
}

async function proxyOpenAiChatCompletions(request, response) {
  if (!API_TOKEN) {
    sendJson(response, 503, { error: { message: 'Upstream AI service is not configured', type: 'service_unavailable' } });
    return;
  }

  const keyRecord = authenticateGatewayKey(request, response);
  if (!keyRecord) return;

  const rawBody = await readBody(request, GATEWAY_MAX_BODY_BYTES);
  const payload = JSON.parse(rawBody || '{}');
  const anthropicPayload = openAiToAnthropicPayload(payload, {
    defaultModel: MODEL,
    maxTokensCap: GATEWAY_MAX_TOKENS,
  });

  if (!anthropicPayload.messages.length) {
    sendJson(response, 400, { error: { message: 'messages is required', type: 'invalid_request_error' } });
    return;
  }

  const inputTokens = estimateTokens(anthropicPayload.messages) + estimateTokens(anthropicPayload.system);
  const quota = gatewayStore.checkQuota(keyRecord, inputTokens);
  if (!quota.ok) {
    sendJson(response, 429, { error: { message: quota.error, type: 'quota_error' } });
    return;
  }

  const upstream = await fetch(messagesEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': API_TOKEN,
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(anthropicPayload),
  });

  if (!upstream.ok) {
    const detail = await upstream.text();
    gatewayStore.recordUsage(keyRecord, {
      inputTokens,
      outputTokens: 0,
      status: upstream.status,
      model: anthropicPayload.model,
    });
    sendJson(response, upstream.status, {
      error: {
        message: `Upstream request failed: ${detail.slice(0, 240)}`,
        type: 'upstream_error',
      },
    });
    return;
  }

  if (anthropicPayload.stream) {
    await streamOpenAiGatewayResponse({ upstream, response, keyRecord, model: anthropicPayload.model, inputTokens });
    return;
  }

  const data = await upstream.json();
  const text = extractAnthropicText(data);
  const outputTokens = estimateTokens(text);
  gatewayStore.recordUsage(keyRecord, {
    inputTokens,
    outputTokens,
    status: 200,
    model: anthropicPayload.model,
  });
  sendJson(response, 200, toOpenAiChatCompletion({
    model: anthropicPayload.model,
    text,
    inputTokens,
    outputTokens,
  }));
}

async function streamOpenAiGatewayResponse({ upstream, response, keyRecord, model, inputTokens }) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const eventData = trimmed.slice(5).trim();
      if (!eventData || eventData === '[DONE]') continue;

      try {
        const event = JSON.parse(eventData);
        const text = extractStreamText(event);
        if (!text) continue;
        fullText += text;
        response.write(`data: ${JSON.stringify({
          id: `chatcmpl_${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
        })}\n\n`);
      } catch {
        // Ignore upstream control messages that are not JSON payloads.
      }
    }
  }

  response.write(`data: ${JSON.stringify({
    id: `chatcmpl_${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
  })}\n\n`);
  response.write('data: [DONE]\n\n');
  response.end();

  gatewayStore.recordUsage(keyRecord, {
    inputTokens,
    outputTokens: estimateTokens(fullText),
    status: 200,
    model,
  });
}

async function handleGatewayRedeem(request, response) {
  const rawBody = await readBody(request, 4096);
  const payload = JSON.parse(rawBody || '{}');
  const result = gatewayStore.redeemInvite({
    code: payload.inviteCode,
    label: payload.label,
  });

  if (!result.ok) {
    sendJson(response, result.status, { error: result.error });
    return;
  }

  sendJson(response, 200, {
    apiKey: result.apiKey,
    key: gatewayStore.publicKeyStatus(result.keyRecord),
    baseUrl: '/v1',
    endpoints: {
      models: '/v1/models',
      chatCompletions: '/v1/chat/completions',
    },
  });
}

async function handleCreateInvite(request, response) {
  if (!requireAdmin(request, response)) return;
  const rawBody = await readBody(request, 4096);
  const payload = JSON.parse(rawBody || '{}');
  const expiresInDays = Number(payload.expiresInDays || 14);
  const expiresAt = expiresInDays > 0
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;
  const { invite, code } = gatewayStore.createInvite({
    label: payload.label,
    maxRedemptions: payload.maxRedemptions,
    expiresAt,
    dailyRequests: payload.dailyRequests,
    dailyTokens: payload.dailyTokens,
  });
  sendJson(response, 201, {
    code,
    invite: {
      id: invite.id,
      label: invite.label,
      maxRedemptions: invite.maxRedemptions,
      redeemedCount: invite.redeemedCount,
      expiresAt: invite.expiresAt,
      dailyRequests: invite.dailyRequests,
      dailyTokens: invite.dailyTokens,
      createdAt: invite.createdAt,
    },
  });
}

function handleGatewayStatus(request, response) {
  const keyRecord = authenticateGatewayKey(request, response);
  if (!keyRecord) return;
  sendJson(response, 200, gatewayStore.publicKeyStatus(keyRecord));
}

function handleModels(request, response) {
  const keyRecord = authenticateGatewayKey(request, response);
  if (!keyRecord) return;
  sendJson(response, 200, {
    object: 'list',
    data: [
      {
        id: MODEL,
        object: 'model',
        created: 0,
        owned_by: 'longcat-gateway',
      },
    ],
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (url.pathname === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (!API_TOKEN) {
    sendJson(response, 503, { error: 'AI service is not configured' });
    return;
  }

  try {
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      if (isRateLimited(clientId(request))) {
        sendJson(response, 429, { error: 'Too many requests' });
        return;
      }

      const rawBody = await readBody(request);
      const payload = JSON.parse(rawBody || '{}');
      const message = String(payload.message || '').trim().slice(0, MAX_INPUT_LENGTH);
      const language = payload.language === 'en' ? 'en' : 'zh';

      if (!message) {
        sendJson(response, 400, { error: 'Message is required' });
        return;
      }

      await streamLongCat({ message, language }, response);
      return;
    }

    if (url.pathname === '/api/gateway/redeem' && request.method === 'POST') {
      await handleGatewayRedeem(request, response);
      return;
    }

    if (url.pathname === '/api/gateway/invites' && request.method === 'POST') {
      await handleCreateInvite(request, response);
      return;
    }

    if (url.pathname === '/api/gateway/status' && request.method === 'GET') {
      handleGatewayStatus(request, response);
      return;
    }

    if (url.pathname === '/v1/models' && request.method === 'GET') {
      handleModels(request, response);
      return;
    }

    if (url.pathname === '/v1/chat/completions' && request.method === 'POST') {
      await proxyOpenAiChatCompletions(request, response);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Request failed' });
    } else {
      response.end();
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AI chat and gateway API listening on ${PORT}`);
});
