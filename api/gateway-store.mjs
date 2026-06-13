import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import crypto from 'node:crypto';

const DEFAULT_DAILY_REQUESTS = 80;
const DEFAULT_DAILY_TOKENS = 120_000;

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function randomToken(prefix, bytes = 24) {
  return `${prefix}_${crypto.randomBytes(bytes).toString('base64url')}`;
}

function defaultState() {
  return {
    version: 1,
    invites: [],
    keys: [],
    events: [],
  };
}

export class GatewayStore {
  constructor({ dataDir }) {
    this.dataDir = dataDir;
    this.filePath = join(dataDir, 'gateway-store.json');
    this.state = defaultState();
    this.load();
  }

  load() {
    mkdirSync(this.dataDir, { recursive: true });
    if (!existsSync(this.filePath)) {
      this.save();
      return;
    }

    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'));
      this.state = {
        ...defaultState(),
        ...parsed,
        invites: Array.isArray(parsed.invites) ? parsed.invites : [],
        keys: Array.isArray(parsed.keys) ? parsed.keys : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch {
      this.state = defaultState();
      this.save();
    }
  }

  save() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf8');
    renameSync(tmpPath, this.filePath);
  }

  createInvite({
    label = 'invite',
    maxRedemptions = 1,
    expiresAt = null,
    dailyRequests = DEFAULT_DAILY_REQUESTS,
    dailyTokens = DEFAULT_DAILY_TOKENS,
  } = {}) {
    const code = randomToken('invite', 18);
    const invite = {
      id: crypto.randomUUID(),
      codeHash: sha256(code),
      label: String(label).slice(0, 80),
      maxRedemptions: Number(maxRedemptions) || 1,
      redeemedCount: 0,
      expiresAt,
      dailyRequests: Number(dailyRequests) || DEFAULT_DAILY_REQUESTS,
      dailyTokens: Number(dailyTokens) || DEFAULT_DAILY_TOKENS,
      disabled: false,
      createdAt: new Date().toISOString(),
    };
    this.state.invites.push(invite);
    this.logEvent({ type: 'invite.created', inviteId: invite.id, label: invite.label });
    this.save();
    return { invite, code };
  }

  redeemInvite({ code, label = 'gateway user' }) {
    const codeHash = sha256(String(code || '').trim());
    const invite = this.state.invites.find(item => item.codeHash === codeHash);
    if (!invite || invite.disabled) {
      return { ok: false, status: 404, error: 'Invite not found' };
    }

    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
      return { ok: false, status: 410, error: 'Invite expired' };
    }

    if (invite.redeemedCount >= invite.maxRedemptions) {
      return { ok: false, status: 409, error: 'Invite already used' };
    }

    const apiKey = randomToken('lcx', 32);
    const keyRecord = {
      id: crypto.randomUUID(),
      keyHash: sha256(apiKey),
      inviteId: invite.id,
      label: String(label || invite.label || 'gateway user').slice(0, 80),
      dailyRequests: invite.dailyRequests,
      dailyTokens: invite.dailyTokens,
      disabled: false,
      usage: {},
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };

    invite.redeemedCount += 1;
    this.state.keys.push(keyRecord);
    this.logEvent({ type: 'key.created', keyId: keyRecord.id, inviteId: invite.id, label: keyRecord.label });
    this.save();
    return { ok: true, keyRecord, apiKey };
  }

  getKey(apiKey) {
    const keyHash = sha256(String(apiKey || '').trim());
    return this.state.keys.find(item => item.keyHash === keyHash && !item.disabled) || null;
  }

  usageFor(keyRecord) {
    const day = todayKey();
    if (!keyRecord.usage[day]) {
      keyRecord.usage[day] = { requests: 0, tokens: 0 };
    }
    return keyRecord.usage[day];
  }

  checkQuota(keyRecord, inputTokens = 0) {
    const usage = this.usageFor(keyRecord);
    if (usage.requests >= keyRecord.dailyRequests) {
      return { ok: false, error: 'Daily request quota exceeded' };
    }
    if (usage.tokens + inputTokens > keyRecord.dailyTokens) {
      return { ok: false, error: 'Daily token quota exceeded' };
    }
    return { ok: true };
  }

  recordUsage(keyRecord, { inputTokens = 0, outputTokens = 0, status = 200, model = '' } = {}) {
    const usage = this.usageFor(keyRecord);
    usage.requests += 1;
    usage.tokens += Math.max(0, Number(inputTokens) || 0) + Math.max(0, Number(outputTokens) || 0);
    keyRecord.lastUsedAt = new Date().toISOString();
    this.logEvent({
      type: 'key.used',
      keyId: keyRecord.id,
      model,
      status,
      inputTokens,
      outputTokens,
    });
    this.save();
    return usage;
  }

  publicKeyStatus(keyRecord) {
    const usage = this.usageFor(keyRecord);
    return {
      id: keyRecord.id,
      label: keyRecord.label,
      dailyRequests: keyRecord.dailyRequests,
      dailyTokens: keyRecord.dailyTokens,
      usage,
      createdAt: keyRecord.createdAt,
      lastUsedAt: keyRecord.lastUsedAt,
    };
  }

  logEvent(event) {
    this.state.events.push({
      ...event,
      at: new Date().toISOString(),
    });
    if (this.state.events.length > 1000) {
      this.state.events = this.state.events.slice(-1000);
    }
  }
}

export function extractBearerToken(request) {
  const header = request.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : '';
}
