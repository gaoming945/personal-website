import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import crypto from 'node:crypto';

const DEFAULT_UPLOAD_ROOT = '/data/uploads';

function nowIso() {
  return new Date().toISOString();
}

function slugify(value) {
  const base = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || crypto.randomUUID();
}

function cleanText(value, max = 400) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function cleanUrl(value) {
  const text = cleanText(value, 1000);
  if (!text) return '';
  if (text.startsWith('/uploads/')) return text;
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
}

function defaultState() {
  return {
    version: 1,
    travel: [],
    projects: [],
    fitness: [],
    updatedAt: nowIso(),
  };
}

function readSeedTravel() {
  const sourcePath = join(process.cwd(), 'src/scripts/travel-data.ts');
  if (!existsSync(sourcePath)) return { travel: [], wishlist: [] };
  const source = readFileSync(sourcePath, 'utf8');

  const extractArray = (name) => {
    const marker = `export const ${name}: TravelEntry[] = [`;
    const start = source.indexOf(marker);
    if (start === -1) return [];
    const arrayStart = source.indexOf('[', start);
    const endMarker = name === 'travelData' ? '\n\nexport function' : '\n];';
    const end = source.indexOf(endMarker, arrayStart);
    if (arrayStart === -1 || end === -1) return [];
    const text = source.slice(arrayStart, name === 'travelData' ? end : end + 2).replace(/;\s*$/, '');
    try {
      return Function(`"use strict"; return (${text});`)();
    } catch {
      return [];
    }
  };

  return {
    travel: extractArray('travelData'),
    wishlist: extractArray('wishlistData'),
  };
}

function readSeedFitness() {
  const sourcePath = join(process.cwd(), 'public/photos.json');
  if (!existsSync(sourcePath)) return [];
  try {
    const photos = JSON.parse(readFileSync(sourcePath, 'utf8'));
    return Array.isArray(photos) ? photos : [];
  } catch {
    return [];
  }
}

function seedProjects() {
  return [
    {
      id: 'market-watch-streamlit',
      name: 'Market Watch Streamlit',
      summary: '美股跨资产宏观风控引擎：监控 QQQ / TQQQ / SOXX / SOXL，输出风险评分、风险归因与操作矩阵。',
      shortSummary: '美股跨资产宏观风控引擎。',
      category: 'data',
      kicker: '数据工具',
      status: '在线运行',
      techStack: ['Python', 'Streamlit', 'Finance'],
      coverImage: '',
      githubUrl: 'https://github.com/gaoming945/market_watch_streamlit',
      projectUrl: 'http://yadan.duckdns.org:8501/',
      distributionName: '',
      distributionImage: '',
      order: 1,
      visible: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'fund-valuation-system',
      name: 'Fund Valuation System',
      summary: '基金实时估值服务：整合公开净值、持仓、行情、汇率和申购限额，并计算个人持仓盈亏，覆盖美股 / 港股 / A 股。',
      shortSummary: '基金实时估值服务，支持美股 / 港股 / A 股。',
      category: 'data',
      kicker: '基金估值',
      status: '在线运行',
      techStack: ['Node.js', 'Docker', 'WeChat Mini Program', 'Self-hosted'],
      coverImage: '',
      githubUrl: 'https://github.com/gaoming945/fund-valuation-system',
      projectUrl: 'http://yadan.duckdns.org:19090/',
      distributionName: '',
      distributionImage: '',
      order: 2,
      visible: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
}

function normalizeTravel(item) {
  const date = cleanText(item.startDate || item.date, 40);
  const photos = Array.isArray(item.photos)
    ? item.photos.map(photo => ({
        src: cleanUrl(photo.src),
        thumb: cleanUrl(photo.thumb || photo.src),
        caption: cleanText(photo.caption, 160),
      })).filter(photo => photo.src)
    : [];

  return {
    id: cleanText(item.id, 120) || `${slugify(item.country)}-${slugify(item.city)}-${date || Date.now()}`,
    country: cleanText(item.country, 120),
    countryCode: cleanText(item.countryCode, 4).toUpperCase(),
    city: cleanText(item.city, 120),
    startDate: date,
    endDate: cleanText(item.endDate || date, 40),
    flag: cleanText(item.flag, 12),
    coordinates: Array.isArray(item.coordinates) ? [toNumber(item.coordinates[0]), toNumber(item.coordinates[1])] : [0, 0],
    story: cleanText(item.story || item.description, 1200),
    coverImage: cleanUrl(item.coverImage || photos[0]?.src),
    notes: Array.isArray(item.notes) ? item.notes.map(note => cleanText(note, 200)).filter(Boolean) : [],
    photos,
    videos: Array.isArray(item.videos) ? item.videos.map(video => ({
      src: cleanUrl(video.src),
      caption: cleanText(video.caption, 160),
    })).filter(video => video.src) : [],
    isVisited: toBool(item.isVisited, true),
    order: toNumber(item.order, 100),
    visible: toBool(item.visible, true),
    createdAt: item.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

function normalizeProject(item) {
  return {
    id: cleanText(item.id, 120) || slugify(item.name),
    name: cleanText(item.name, 160),
    summary: cleanText(item.summary || item.description, 1200),
    shortSummary: cleanText(item.shortSummary || item.summary || item.description, 240),
    category: cleanText(item.category, 80) || 'data',
    kicker: cleanText(item.kicker, 120),
    status: cleanText(item.status, 80),
    techStack: Array.isArray(item.techStack)
      ? item.techStack.map(tag => cleanText(tag, 60)).filter(Boolean)
      : String(item.techStack || '').split(',').map(tag => cleanText(tag, 60)).filter(Boolean),
    coverImage: cleanUrl(item.coverImage),
    githubUrl: cleanUrl(item.githubUrl),
    projectUrl: cleanUrl(item.projectUrl),
    distributionName: cleanText(item.distributionName, 120),
    distributionImage: cleanUrl(item.distributionImage),
    order: toNumber(item.order, 100),
    visible: toBool(item.visible, true),
    createdAt: item.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

function normalizeFitness(item) {
  return {
    id: cleanText(item.id, 120) || slugify(`${item.title || item.alt}-${item.date || Date.now()}`),
    title: cleanText(item.title || item.alt, 160),
    date: cleanText(item.date, 40),
    description: cleanText(item.description, 800),
    image: cleanUrl(item.image || item.src),
    category: cleanText(item.category, 80) || '训练',
    width: toNumber(item.width, 800),
    height: toNumber(item.height, 600),
    order: toNumber(item.order, 100),
    visible: toBool(item.visible, true),
    createdAt: item.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export class ContentStore {
  constructor({ dataDir, uploadRoot = DEFAULT_UPLOAD_ROOT }) {
    this.dataDir = dataDir;
    this.uploadRoot = uploadRoot;
    this.filePath = join(dataDir, 'content-store.json');
    this.state = defaultState();
    this.load();
  }

  load() {
    mkdirSync(this.dataDir, { recursive: true });
    mkdirSync(this.uploadRoot, { recursive: true });
    if (!existsSync(this.filePath)) {
      this.state = this.seedState();
      this.save();
      return;
    }
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'));
      this.state = {
        ...defaultState(),
        ...parsed,
        travel: Array.isArray(parsed.travel) ? parsed.travel.map(normalizeTravel) : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects.map(normalizeProject) : [],
        fitness: Array.isArray(parsed.fitness) ? parsed.fitness.map(normalizeFitness) : [],
      };
      const projectIds = new Set(this.state.projects.map(project => project.id));
      const missingSeedProjects = seedProjects()
        .map(normalizeProject)
        .filter(project => !projectIds.has(project.id));
      if (missingSeedProjects.length > 0) {
        this.state.projects.push(...missingSeedProjects);
        this.save();
      }
    } catch {
      this.state = this.seedState();
      this.save();
    }
  }

  seedState() {
    const seeds = readSeedTravel();
    const fitness = readSeedFitness();
    return {
      ...defaultState(),
      travel: seeds.travel.map((item, index) => normalizeTravel({ ...item, order: index + 1 })),
      wishlist: seeds.wishlist.map((item, index) => normalizeTravel({ ...item, order: index + 1, visible: true })),
      projects: seedProjects().map(normalizeProject),
      fitness: fitness.map((item, index) => normalizeFitness({ ...item, order: index + 1, visible: true })),
      updatedAt: nowIso(),
    };
  }

  save() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    this.state.updatedAt = nowIso();
    writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf8');
    renameSync(tmpPath, this.filePath);
  }

  publicContent() {
    const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
    return {
      travel: this.state.travel.filter(item => item.visible).sort(byOrder),
      wishlist: (this.state.wishlist || []).filter(item => item.visible).sort(byOrder),
      projects: this.state.projects.filter(item => item.visible).sort(byOrder),
      fitness: this.state.fitness.filter(item => item.visible).sort(byOrder),
      updatedAt: this.state.updatedAt,
    };
  }

  adminContent() {
    return this.state;
  }

  upsert(type, payload) {
    if (!['travel', 'projects', 'fitness'].includes(type)) {
      throw new Error('Invalid content type');
    }
    const normalizers = { travel: normalizeTravel, projects: normalizeProject, fitness: normalizeFitness };
    const normalized = normalizers[type](payload);
    const list = this.state[type];
    const index = list.findIndex(item => item.id === normalized.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...normalized, createdAt: list[index].createdAt, updatedAt: nowIso() };
    } else {
      list.push({ ...normalized, createdAt: nowIso(), updatedAt: nowIso() });
    }
    this.save();
    return index >= 0 ? list[index] : list[list.length - 1];
  }

  delete(type, id) {
    if (!['travel', 'projects', 'fitness'].includes(type)) {
      throw new Error('Invalid content type');
    }
    const list = this.state[type];
    const next = list.filter(item => item.id !== id);
    if (next.length === list.length) return false;
    this.state[type] = next;
    this.save();
    return true;
  }

  storeUpload({ filename, contentType, buffer }) {
    const allowedTypes = new Map([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/webp', '.webp'],
      ['image/gif', '.gif'],
    ]);
    if (!allowedTypes.has(contentType)) {
      throw new Error('Only JPG, PNG, WEBP and GIF images are allowed');
    }
    if (!buffer?.length || buffer.length > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB');
    }
    const ext = allowedTypes.get(contentType) || extname(filename).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = normalize(join(this.uploadRoot, safeName));
    if (!filePath.startsWith(normalize(this.uploadRoot))) {
      throw new Error('Invalid upload path');
    }
    writeFileSync(filePath, buffer);
    return `/uploads/${safeName}`;
  }
}
