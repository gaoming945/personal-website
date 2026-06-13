import crypto from 'node:crypto';

const COOKIE_NAME = 'pw_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        return index === -1
          ? [part, '']
          : [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120_000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  const parts = String(storedHash || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expected = parts[3];
  const actual = crypto.pbkdf2Sync(String(password), salt, iterations, 32, 'sha256').toString('hex');
  return timingSafeEqualText(actual, expected);
}

export class AdminAuth {
  constructor({
    username = process.env.ADMIN_USERNAME || 'admin',
    password = process.env.ADMIN_PASSWORD || '',
    passwordHash = process.env.ADMIN_PASSWORD_HASH || '',
    sessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.GATEWAY_ADMIN_TOKEN || '',
    secureCookie = process.env.ADMIN_COOKIE_SECURE === 'true',
  } = {}) {
    this.username = username;
    this.password = password;
    this.passwordHash = passwordHash;
    this.sessionSecret = sessionSecret;
    this.secureCookie = secureCookie;
  }

  isConfigured() {
    return Boolean(this.username && (this.passwordHash || this.password) && this.sessionSecret);
  }

  verifyCredentials(username, password) {
    if (!this.isConfigured()) return false;
    if (!timingSafeEqualText(username, this.username)) return false;
    if (this.passwordHash) return verifyPassword(password, this.passwordHash);
    return timingSafeEqualText(password, this.password);
  }

  createCookie() {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = JSON.stringify({ sub: this.username, exp: expiresAt });
    const encoded = Buffer.from(payload).toString('base64url');
    const token = `${encoded}.${sign(encoded, this.sessionSecret)}`;
    const flags = [
      `${COOKIE_NAME}=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    ];
    if (this.secureCookie) flags.push('Secure');
    return flags.join('; ');
  }

  clearCookie() {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }

  getSession(request) {
    if (!this.isConfigured()) return null;
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[COOKIE_NAME];
    if (!token || !token.includes('.')) return null;
    const [encoded, signature] = token.split('.');
    if (!timingSafeEqualText(signature, sign(encoded, this.sessionSecret))) return null;
    try {
      const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
      if (payload.sub !== this.username || Number(payload.exp) < Date.now()) return null;
      return { username: payload.sub };
    } catch {
      return null;
    }
  }

  isAuthenticated(request) {
    return Boolean(this.getSession(request));
  }
}
