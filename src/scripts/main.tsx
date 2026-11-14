import Swiper from 'swiper';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { travelData as seedTravelData, wishlistData as seedWishlistData, type TravelEntry } from './travel-data';
import { translations, type Language } from '../i18n/translations';

// BASE_URL 根路径构建时为 "/"，子路径构建时为 "/personal-website"（无尾斜杠），统一补齐尾斜杠再拼接。
const BASE_URL = import.meta.env.BASE_URL.replace(/\/?$/, '/');

type ThreeModule = typeof import('three');
type OrbitControlsCtor = (typeof import('three/examples/jsm/controls/OrbitControls.js'))['OrbitControls'];
type ThreeGlobeCtor = (typeof import('three-globe'))['default'];

interface AppState {
  selectedId: string | null;
  isUpdating: boolean;
  activeTab: 'visited' | 'wishlist';
  globe: any | null;
  camera: any | null;
  scene: any | null;
  renderer: any | null;
  controls: any | null;
  timeline: Swiper | null;
}

type GlobeRuntime = {
  THREE: ThreeModule;
  OrbitControls: OrbitControlsCtor;
  ThreeGlobe: ThreeGlobeCtor;
};

const state: AppState = {
  selectedId: null,
  isUpdating: false,
  activeTab: 'visited',
  globe: null,
  camera: null,
  scene: null,
  renderer: null,
  controls: null,
  timeline: null,
};

let currentLanguage: Language = 'zh';
let globeRuntime: GlobeRuntime | null = null;
let globeInitStarted = false;
let travelData: TravelEntry[] = seedTravelData;
let wishlistData: TravelEntry[] = seedWishlistData;

interface ManagedProject {
  id: string;
  name: string;
  summary: string;
  shortSummary?: string;
  category: string;
  kicker?: string;
  status?: string;
  techStack: string[];
  coverImage?: string;
  githubUrl?: string;
  projectUrl?: string;
  distributionName?: string;
  distributionImage?: string;
  order?: number;
  visible?: boolean;
}

const fallbackProjectData: ManagedProject[] = [
  {
    id: 'grid',
    name: 'Grid',
    summary: '格子解谜游戏，融合推箱子与磁力箱机制，用 Compose 做出清晰的移动端交互。',
    shortSummary: '格子解谜游戏，融合推箱子与磁力箱机制。',
    category: 'mobile game',
    kicker: '移动端游戏',
    status: '已发布',
    techStack: ['Kotlin', 'Jetpack Compose', 'Android'],
    githubUrl: 'https://github.com/gaoming945/Grid',
    distributionName: '格阵',
    distributionImage: '/assets/qrcodes/grid.png',
    order: 1,
    visible: true,
  },
  {
    id: 'defense-survivor',
    name: 'Defense Survivor',
    summary: 'Cocos Creator 纵版空战射击游戏，关注节奏、弹幕密度和成长反馈。',
    shortSummary: 'Cocos Creator 纵版空战射击游戏。',
    category: 'game',
    kicker: '玩法原型',
    status: '可试玩',
    techStack: ['TypeScript', 'Cocos Creator', 'Gameplay'],
    githubUrl: 'https://github.com/gaoming945/DefenseSurvivor',
    distributionName: '星穹防线',
    distributionImage: '/assets/qrcodes/starfrontier.png',
    order: 2,
    visible: true,
  },
  {
    id: 'market-watch-streamlit',
    name: 'Market Watch Streamlit',
    summary: '美股跨资产宏观风控引擎，把监控、信号和风险状态组织成可操作视图。',
    shortSummary: '美股跨资产宏观风控引擎。',
    category: 'data',
    kicker: '数据工具',
    status: '在线运行',
    techStack: ['Python', 'Streamlit', 'Finance'],
    githubUrl: 'https://github.com/gaoming945/market_watch_streamlit',
    projectUrl: 'http://yadan.duckdns.org:8501/',
    order: 3,
    visible: true,
  },
  {
    id: 'fund-valuation-system',
    name: 'Fund Valuation System',
    summary: '美股基金估值系统，部署在软路由 Docker 环境里，用于查看基金估值、运行状态和自托管数据服务。',
    shortSummary: '美股基金估值系统，部署在软路由里在线运行。',
    category: 'data',
    kicker: '基金估值',
    status: '在线运行',
    techStack: ['Python', 'Finance', 'Docker', 'Self-hosted'],
    projectUrl: 'http://yadan.duckdns.org:19090/',
    order: 4,
    visible: true,
  },
];

let projectData: ManagedProject[] = fallbackProjectData;

function getTravelEntryById(id: string): TravelEntry | undefined {
  return [...travelData, ...wishlistData].find(entry => entry.id === id);
}

async function loadGlobeRuntime() {
  if (globeRuntime) return globeRuntime;

  const [THREE, controlsModule, globeModule] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three-globe'),
  ]);

  globeRuntime = {
    THREE,
    OrbitControls: controlsModule.OrbitControls,
    ThreeGlobe: globeModule.default,
  };

  return globeRuntime;
}

const travelCopy: Record<string, { country: string; city: string; story?: string }> = {
  'usa-los-angeles-2026': {
    country: 'United States',
    city: 'Los Angeles',
    story: 'Visited Los Angeles and San Francisco during the USA trip from September 24 to October 6, 2026. This entry records the Los Angeles stop; the dates cover the entire trip.',
  },
  'usa-san-francisco-2026': {
    country: 'United States',
    city: 'San Francisco',
    story: 'Visited Los Angeles and San Francisco during the USA trip from September 24 to October 6, 2026. This entry records the San Francisco stop; the dates cover the entire trip.',
  },
  'wishlist-maldives': { country: 'Maldives', city: 'Malé' },
  'portugal-lisbon-2026': {
    country: 'Portugal',
    city: 'Lisbon',
    story: 'Lisbon unfolds across seven hills, where yellow trams, colorful neighborhoods, and the Tagus River give the city a relaxed, bright rhythm.',
  },
  'spain-madrid-2026': {
    country: 'Spain',
    city: 'Madrid',
    story: 'Madrid brings together historic neighborhoods, major museums, and lively city life, making it an important new stop on the Europe map.',
  },
  'spain-barcelona-2026': {
    country: 'Spain',
    city: 'Barcelona',
    story: 'Barcelona brings together Gaudi architecture, the Mediterranean coast, and lively neighborhoods as another stop on this Spain trip.',
  },
  'indonesia-bali-2026': {
    country: 'Indonesia',
    city: 'Bali',
    story: 'Bali is one of Indonesia\'s most famous islands, known for beautiful beaches, rich culture, and distinctive arts.',
  },
  'philippines-manila-2026': {
    country: 'Philippines',
    city: 'Manila',
    story: 'Manila is the capital of the Philippines, with a rich mix of history and cultural heritage.',
  },
  'philippines-bohol-2026': {
    country: 'Philippines',
    city: 'Bohol',
    story: 'Bohol is known for its beaches, diving spots, and easy island rhythm.',
  },
  'japan-tokyo-2026': {
    country: 'Japan',
    city: 'Tokyo',
    story: 'Tokyo blends tradition and modern life beautifully: Edo-era atmosphere in Asakusa, then the urban pulse of Shibuya just a train ride away.',
  },
  'uk-london-2025': {
    country: 'United Kingdom',
    city: 'London',
    story: 'London is packed with history and culture, from Big Ben and Tower Bridge to the British Museum.',
  },
  'srilanka-colombo-2025': {
    country: 'Sri Lanka',
    city: 'Colombo',
    story: 'Sri Lanka is often called the pearl of the Indian Ocean, and Colombo brings together its history, coast, and city energy.',
  },
  'malaysia-kl-2025': {
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    story: 'Kuala Lumpur is a multicultural city where the Petronas Towers, Batu Caves, and Chinatown sit in the same living rhythm.',
  },
  'singapore-2025': {
    country: 'Singapore',
    city: 'Singapore',
    story: 'Singapore is small, precise, and futuristic. Gardens by the Bay feels like a sci-fi set, while Chinatown and Little India keep the city grounded in culture.',
  },
  'australia-melbourne-2025': {
    country: 'Australia',
    city: 'Melbourne',
    story: 'Melbourne is known for its art scene, coffee culture, and relaxed urban texture.',
  },
  'australia-sydney-2025': {
    country: 'Australia',
    city: 'Sydney',
    story: 'Sydney is best known for the Opera House, Harbour Bridge, and bright waterfront views.',
  },
  'southkorea-seoul-2025': {
    country: 'South Korea',
    city: 'Seoul',
    story: 'Seoul mixes tradition and modern life, from Gyeongbokgung Palace to Myeongdong and Gangnam.',
  },
  'japan-hiroshima-2025': {
    country: 'Japan',
    city: 'Hiroshima',
    story: 'Hiroshima is a city of deep historical meaning, with Peace Memorial Park and the Atomic Bomb Dome as lasting reminders of peace.',
  },
  'southkorea-jeju-2025': {
    country: 'South Korea',
    city: 'Jeju',
    story: 'Jeju is South Korea\'s largest island, famous for volcanic landscapes, beaches, and island culture.',
  },
  'japan-osaka-2024': {
    country: 'Japan',
    city: 'Osaka',
    story: 'Osaka is known for food, energy, and an easygoing city character.',
  },
  'japan-nagoya-2024': {
    country: 'Japan',
    city: 'Nagoya',
    story: 'Nagoya is one of Japan\'s industrial centers, with plenty of history and cultural heritage.',
  },
  'china-hongkong-2023': {
    country: 'China',
    city: 'Hong Kong',
    story: 'Hong Kong is an international city where Eastern and Western cultures meet, from Victoria Harbour to The Peak and Disneyland.',
  },
  'thailand-bangkok-2019': {
    country: 'Thailand',
    city: 'Bangkok',
    story: 'Bangkok is full of energy: the Grand Palace shines in gold, and the street food leaves a lasting spicy, sour, and vivid memory.',
  },
  'wishlist-india': { country: 'India', city: 'New Delhi' },
  'wishlist-palau': { country: 'Palau', city: 'Koror' },
  'wishlist-mexico': { country: 'Mexico', city: 'Mexico City' },
  'wishlist-newzealand': { country: 'New Zealand', city: 'Queenstown' },
  'wishlist-vietnam': { country: 'Vietnam', city: 'Hanoi' },
};

const photoCaptionCopy: Record<string, string> = {
  '巴厘岛海滩': 'Bali beach',
  '乌布梯田': 'Ubud rice terraces',
  '海神庙': 'Tanah Lot Temple',
  '库塔海滩': 'Kuta Beach',
  '巴厘岛旅行视频': 'Bali travel video',
  '马尼拉夜景': 'Manila night view',
  '巧克力山': 'Chocolate Hills',
  '薄荷岛海滩': 'Bohol beach',
  '东京塔': 'Tokyo Tower',
  '浅草寺': 'Senso-ji Temple',
  '伦敦大本钟': 'Big Ben',
  '伦敦塔桥': 'Tower Bridge',
  '双子塔': 'Petronas Twin Towers',
  '吉隆坡夜景': 'Kuala Lumpur night view',
  '滨海湾花园': 'Gardens by the Bay',
  '滨海湾金沙': 'Marina Bay Sands',
  '墨尔本街头': 'Melbourne streets',
  '墨尔本咖啡': 'Melbourne coffee',
  '悉尼歌剧院': 'Sydney Opera House',
  '悉尼海港大桥': 'Sydney Harbour Bridge',
  '首尔景福宫': 'Gyeongbokgung Palace',
  '首尔明洞': 'Myeongdong',
  '广岛和平纪念公园': 'Hiroshima Peace Memorial Park',
  '广岛城': 'Hiroshima Castle',
  '济州岛海滩': 'Jeju beach',
  '济州岛火山': 'Jeju volcano',
  '大阪城': 'Osaka Castle',
  '道顿堀': 'Dotonbori',
  '名古屋城': 'Nagoya Castle',
  '名古屋车站': 'Nagoya Station',
  '维多利亚港': 'Victoria Harbour',
  '太平山顶': 'The Peak',
  '大皇宫': 'The Grand Palace',
  '水上市场': 'Floating market',
};

function t(key: string, replacements: Record<string, string | number> = {}) {
  let value = translations[currentLanguage][key] || translations.zh[key] || key;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, String(replacement));
  });
  return value;
}

function entryCity(entry: TravelEntry) {
  return currentLanguage === 'en' ? travelCopy[entry.id]?.city || entry.city : entry.city;
}

function entryCountry(entry: TravelEntry) {
  return currentLanguage === 'en' ? travelCopy[entry.id]?.country || entry.country : entry.country;
}

function entryStory(entry: TravelEntry) {
  return currentLanguage === 'en' ? travelCopy[entry.id]?.story || entry.story : entry.story;
}

function mediaCaption(caption?: string) {
  if (!caption) return '';
  return currentLanguage === 'en' ? photoCaptionCopy[caption] || caption : caption;
}

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadManagedContent() {
  try {
    const response = await fetch('/api/public/content', { headers: { Accept: 'application/json' } });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.travel) && payload.travel.length > 0) {
        travelData = payload.travel;
      }
      if (Array.isArray(payload.wishlist) && payload.wishlist.length > 0) {
        wishlistData = payload.wishlist;
      }
      if (Array.isArray(payload.projects)) {
        projectData = payload.projects;
      }
    }
  } catch {
    // 后台内容接口不可用时使用随包静态数据兜底，避免前台空白。
  }

  // 项目卡片没有随包种子数据，接口不可用时用静态 projects.json 兜底（后台恢复后仍以后台为准）。
  if (projectData.length === 0) {
    try {
      const fallbackResponse = await fetch(`${BASE_URL}projects.json`);
      if (fallbackResponse.ok) {
        const fallbackProjects = await fallbackResponse.json();
        if (Array.isArray(fallbackProjects)) {
          projectData = fallbackProjects;
        }
      }
    } catch {
      // 静态兜底也不可用时保持空白（与原行为一致）。
    }
  }
}

function renderManagedProjects() {
  const grid = document.querySelector('.project-grid') as HTMLElement | null;
  if (!grid || projectData.length === 0) return;

  grid.innerHTML = projectData
    .filter(project => project.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((project, index) => {
      const techTags = (project.techStack || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
      const links = [
        project.githubUrl
          ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noreferrer" class="project-link" data-i18n="project.link">打开仓库</a>`
          : '',
        project.projectUrl
          ? `<a href="${escapeHtml(project.projectUrl)}" target="_blank" rel="noreferrer" class="project-link project-link-website" data-i18n="project.link.website">打开网站</a>`
          : '',
      ].filter(Boolean).join('');
      const distribution = project.distributionImage
        ? `<div class="distribution-panel">
            <div>
              <span class="distribution-label" data-i18n="distribution.label">App 分发</span>
              <strong>${escapeHtml(project.distributionName || project.name)}</strong>
            </div>
            <img src="${escapeHtml(project.distributionImage)}" alt="${escapeHtml(project.distributionName || project.name)} App 分发二维码" width="120" height="120" loading="lazy" />
          </div>`
        : '';

      return `<article class="project-card" data-category="${escapeHtml(project.category || 'data')}">
        <div class="card-topline">
          <span class="node-id">${String(index + 1).padStart(2, '0')}</span>
          <span class="status-chip">${escapeHtml(project.category || 'Project')}</span>
        </div>
        <div class="project-card-header">
          <span class="project-kicker">${escapeHtml(project.kicker || '项目')}</span>
          <span class="project-state">${escapeHtml(project.status || '在线')}</span>
        </div>
        <h3>${escapeHtml(project.name)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <div class="project-tags">${techTags}</div>
        ${distribution}
        <div class="project-links">${links}</div>
      </article>`;
    })
    .join('');

  updateProjectCarousel();
}

function initProjectFilters() {
  const buttons = Array.from(document.querySelectorAll('[data-filter]')) as HTMLButtonElement[];
  const applyFilter = (filter: string) => {
    document.querySelectorAll('.project-card').forEach(card => {
      const category = card.getAttribute('data-category') || '';
      card.classList.toggle('is-hidden', filter !== 'all' && !category.split(/\s+/).includes(filter));
    });
    buttons.forEach(button => button.classList.toggle('is-active', button.dataset.filter === filter));
    const grid = document.querySelector('.project-grid') as HTMLElement | null;
    if (grid) {
      grid.scrollTo({ left: 0, behavior: 'smooth' });
    }
    updateProjectCarousel();
  };
  buttons.forEach(button => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all'));
  });
}

function visibleProjectCards() {
  return Array.from(document.querySelectorAll('.project-card:not(.is-hidden)')) as HTMLElement[];
}

function updateProjectCarousel() {
  const carousel = document.querySelector('[data-project-carousel]') as HTMLElement | null;
  const grid = document.querySelector('.project-grid') as HTMLElement | null;
  const prev = document.querySelector('[data-project-prev]') as HTMLButtonElement | null;
  const next = document.querySelector('[data-project-next]') as HTMLButtonElement | null;
  if (!carousel || !grid || !prev || !next) return;

  const cards = visibleProjectCards();
  const needsCarousel = cards.length > 3;
  carousel.classList.toggle('has-overflow', needsCarousel);
  prev.hidden = !needsCarousel;
  next.hidden = !needsCarousel;

  if (!needsCarousel) {
    prev.disabled = true;
    next.disabled = true;
    return;
  }

  const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth - 1);
  prev.disabled = grid.scrollLeft <= 1;
  next.disabled = grid.scrollLeft >= maxScroll;
}

function initProjectCarousel() {
  const grid = document.querySelector('.project-grid') as HTMLElement | null;
  const prev = document.querySelector('[data-project-prev]') as HTMLButtonElement | null;
  const next = document.querySelector('[data-project-next]') as HTMLButtonElement | null;
  if (!grid || !prev || !next) return;

  const scrollByPage = (direction: -1 | 1) => {
    const visibleCard = visibleProjectCards()[0];
    const fallbackStep = grid.clientWidth;
    const styles = window.getComputedStyle(grid);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const cardStep = visibleCard ? visibleCard.getBoundingClientRect().width + gap : fallbackStep;
    grid.scrollBy({ left: direction * Math.max(cardStep, 1), behavior: 'smooth' });
  };

  prev.addEventListener('click', () => scrollByPage(-1));
  next.addEventListener('click', () => scrollByPage(1));
  grid.addEventListener('scroll', () => window.requestAnimationFrame(updateProjectCarousel), { passive: true });
  window.addEventListener('resize', updateProjectCarousel);
  updateProjectCarousel();
}

function formatTravelDate(dateStr: string) {
  const date = new Date(dateStr);
  if (currentLanguage === 'en') {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCountryFeatureCode(feature: any) {
  return feature?.properties?.ISO_A2 || feature?.properties?.ISO_A2_EH || feature?.properties?.WB_A2;
}

function isChinaRegionFeature(feature: any) {
  const properties = feature?.properties ?? {};
  const codes = [
    properties.ISO_A2,
    properties.ISO_A2_EH,
    properties.WB_A2,
    properties.ADM0_A3,
    properties.SOV_A3,
    properties.GU_A3,
  ].filter(Boolean);
  const names = [
    properties.NAME,
    properties.NAME_EN,
    properties.ADMIN,
    properties.SOVEREIGNT,
    properties.BRK_NAME,
  ].filter(Boolean);

  return (
    codes.some(code => ['CN', 'CN-TW', 'TW', 'HK', 'MO', 'CHN', 'CH1', 'TWN', 'HKG', 'MAC'].includes(String(code))) ||
    names.some(name => ['China', 'People\'s Republic of China', 'Taiwan', 'Hong Kong', 'Macao', 'Macau'].includes(String(name)))
  );
}

function isVisitedCountryFeature(feature: any, visitedCountryCodes: Set<string>) {
  if (visitedCountryCodes.has(getCountryFeatureCode(feature))) {
    return true;
  }

  return visitedCountryCodes.has('CN') && isChinaRegionFeature(feature);
}

// ==================== Globe Module ====================

async function initGlobe() {
  const container = document.querySelector('[data-travel-globe]') as HTMLElement;
  if (!container || globeInitStarted) return;
  globeInitStarted = true;

  const { THREE, OrbitControls, ThreeGlobe } = await loadGlobeRuntime();

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  state.scene = scene;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.z = 300;
  state.camera = camera;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
  container.appendChild(renderer.domElement);
  state.renderer = renderer;

  scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

  // Get visited countries data (all entries are visited now)
  const visitedEntries = travelData;
  const visitedCountryCodes = new Set(visitedEntries.filter(entry => entry.isVisited).map(entry => entry.countryCode));
  const visitedCountryFeatures = await fetch(`${BASE_URL}assets/globe/countries.geojson`)
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      const features = Array.isArray(data?.features) ? data.features : [];
      return features.filter((feature: any) => isVisitedCountryFeature(feature, visitedCountryCodes));
    })
    .catch(() => []);

  const globe = new ThreeGlobe()
    .globeImageUrl(`${BASE_URL}assets/globe/earth-blue-marble.jpg`)
    .bumpImageUrl(`${BASE_URL}assets/globe/earth-topology.png`)
    .showAtmosphere(true)
    .atmosphereColor('#41ff8a')
    .atmosphereAltitude(0.18)
    // Country layer - one highlighted surface per visited country
    .polygonsData(visitedCountryFeatures)
    .polygonAltitude(0.012)
    .polygonCapColor(() => 'rgba(65, 255, 138, 0.42)')
    .polygonSideColor(() => 'rgba(65, 255, 138, 0.16)')
    .polygonStrokeColor(() => '#e9fff0')
    .polygonsTransitionDuration(800)
    // Points layer - city markers (yellow cylinders)
    .pointsData(visitedEntries)
    .pointLat((d: any) => d.coordinates[0])
    .pointLng((d: any) => d.coordinates[1])
    .pointColor(() => '#ffeb3b')
    .pointAltitude(0.04)
    .pointRadius(0.6)
    .pointsMerge(true)
    .pointsTransitionDuration(500)
    // Labels layer - show all cities with optimized layout
    .labelsData(visitedEntries)
    .labelLat((d: any) => d.coordinates[0])
    .labelLng((d: any) => d.coordinates[1])
    .labelText((d: any) => {
      // Map Chinese city names to English
      const cityMap: Record<string, string> = {
        '北京': 'Beijing',
        '东京': 'Tokyo',
        '大阪': 'Osaka',
        '名古屋': 'Nagoya',
        '广岛': 'Hiroshima',
        '曼谷': 'Bangkok',
        '新加坡': 'Singapore',
        '吉隆坡': 'Kuala Lumpur',
        '中国香港': 'Hong Kong',
        '首尔': 'Seoul',
        '济州岛': 'Jeju',
        '马尼拉': 'Manila',
        '薄荷岛': 'Bohol',
        '墨尔本': 'Melbourne',
        '悉尼': 'Sydney',
        '科伦坡': 'Colombo',
        '伦敦': 'London',
        '巴厘岛': 'Bali'
      };
      return travelCopy[d.id]?.city || cityMap[d.city] || d.city;
    })
    .labelSize(0.8)
    .labelColor(() => '#ffffff')
    .labelAltitude(0.1)
    .labelDotRadius(0.2)
    .labelIncludeDot(true)
    // @ts-ignore - using index to alternate orientations
    .labelDotOrientation((_d: any, i: number) => {
      const orientations: Array<'right' | 'bottom' | 'left'> = ['right', 'bottom', 'left'];
      return orientations[i % orientations.length];
    })
    .labelResolution(3)
    .labelsTransitionDuration(1000);

  scene.add(globe);
  state.globe = globe;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 101;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1.0;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  
  state.controls = controls;

  renderer.domElement.addEventListener('click', (event) => {
    handleGlobeClick(event, container, camera, scene, THREE, ThreeGlobe);
  });

  // Default select first visited entry, or first wishlist entry
  const defaultEntry = travelData.find(e => e.isVisited);
  if (defaultEntry) {
    selectTravel(defaultEntry.id, 'init');
  }

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

function handleGlobeClick(
  event: MouseEvent,
  container: HTMLElement,
  camera: any,
  scene: any,
  THREE: typeof import('three'),
  ThreeGlobe: typeof import('three-globe').default,
) {
  if (!state.globe) return;

  const rect = container.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const globeObjects = scene.children.filter((c: any) => c instanceof ThreeGlobe);
  if (globeObjects.length === 0) return;

  const intersects = raycaster.intersectObjects(globeObjects, true);
  if (intersects.length === 0) return;

  const hit = intersects[0];
  if (!hit.face) return;

  const point = hit.point.clone();
  globeObjects[0].worldToLocal(point);

  const lat = 90 - Math.acos(point.y / point.length()) * (180 / Math.PI);
  const lng = Math.atan2(-point.z, point.x) * (180 / Math.PI);

  let closestEntry: TravelEntry | null = null;
  let closestDist = Infinity;

  for (const entry of travelData) {
    const dLat = entry.coordinates[0] - lat;
    const dLng = entry.coordinates[1] - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < closestDist) {
      closestDist = dist;
      closestEntry = entry;
    }
  }

  if (closestEntry && closestDist < 900) {
    selectTravel(closestEntry.id, 'globe');
  }
}

function flyToCountry(coordinates: [number, number]) {
  if (!state.camera || !state.controls || !globeRuntime) return;

  const [lat, lng] = coordinates;
  const { THREE } = globeRuntime;

  // Use ThreeGlobe's exact coordinate system (from Polar2Cartesian in shader):
  // phi = toRad(90 - lat), theta = toRad(90 - lng)
  // x = r * sin(phi) * cos(theta), y = r * cos(phi), z = r * sin(phi) * sin(theta)
  const radius = 250;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (90 - lng) * (Math.PI / 180);

  const targetX = radius * Math.sin(phi) * Math.cos(theta);
  const targetY = radius * Math.cos(phi);
  const targetZ = radius * Math.sin(phi) * Math.sin(theta);

  const startPos = state.camera.position.clone();
  const endPos = new THREE.Vector3(targetX, targetY, targetZ);
  const duration = 1200;
  const startTime = Date.now();

  // Disable auto-rotate during flight animation
  state.controls.autoRotate = false;

  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    state.camera!.position.lerpVectors(startPos, endPos, eased);
    state.camera!.lookAt(0, 0, 0);

    if (t < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      // Re-enable auto-rotate after animation completes
      if (state.controls) {
        state.controls.autoRotate = true;
      }
    }
  }
  animateCamera();
}

function initGlobeWhenVisible() {
  const container = document.querySelector('[data-travel-globe]') as HTMLElement | null;
  if (!container) return;

  if (!('IntersectionObserver' in window)) {
    void initGlobe();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    void initGlobe();
  }, {
    rootMargin: '320px 0px',
    threshold: 0.01,
  });

  observer.observe(container);
}

// ==================== Timeline Module ====================

function initTimeline() {
  const container = document.querySelector('[data-travel-timeline]') as HTMLElement;
  if (!container) return;

  initTimelineTabs(container);
  renderTimelineItems(container);
}

function initTimelineTabs(container: HTMLElement) {
  const header = document.createElement('div');
  header.className = 'timeline-header';
  header.innerHTML = `
    <div class="timeline-heading">
      <span data-i18n="travel.index.kicker">${t('travel.index.kicker')}</span>
      <strong data-i18n="travel.index.title">${t('travel.index.title')}</strong>
    </div>
    <div class="timeline-tools">
      <div class="timeline-tabs">
        <button type="button" class="timeline-tab is-active" data-tab="visited">${t('travel.tab.visited')} (${travelData.filter(e => e.isVisited).length})</button>
        <button type="button" class="timeline-tab" data-tab="wishlist">${t('travel.tab.wishlist')} (${wishlistData.filter(e => ['MV', 'IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode)).length})</button>
      </div>
      <div class="timeline-controls" data-timeline-controls></div>
    </div>
  `;

  header.querySelectorAll('.timeline-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as 'visited' | 'wishlist';
      state.activeTab = tab;
      header.querySelectorAll('.timeline-tab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderTimelineItems(container);
    });
  });

  container.appendChild(header);
}

function renderTimelineItems(container: HTMLElement) {
  // Remove old swiper wrapper and items, keep tabs
  const oldWrapper = container.querySelector('.swiper-wrapper');
  oldWrapper?.remove();
  const oldGrid = container.querySelector('.wishlist-grid');
  oldGrid?.remove();
  const controls = container.querySelector('[data-timeline-controls]');
  if (controls) {
    controls.innerHTML = '';
  }

  const filtered = state.activeTab === 'visited'
    ? travelData.filter(e => e.isVisited)
    : wishlistData.filter(e => ['MV', 'IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode));

  if (filtered.length === 0) return;

  if (state.activeTab === 'wishlist') {
    renderWishlistGrid(container, filtered);
  } else {
    renderVisitedTimeline(container, filtered);
  }
}

function renderVisitedTimeline(container: HTMLElement, data: TravelEntry[]) {
  const sortedData = [...data].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  // Group entries by date
  const groupedByDate: Map<string, TravelEntry[]> = new Map();
  sortedData.forEach(entry => {
    const dateKey = entry.startDate;
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(entry);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'swiper-wrapper';

  groupedByDate.forEach((entries) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide timeline-item';
    slide.dataset.travelId = entries[0].id;

    const formattedDate = formatTravelDate(entries[0].startDate)
      + (entries[0].endDate !== entries[0].startDate ? ' → ' + formatTravelDate(entries[0].endDate) : '');

    // Get unique flags for this date
    const flags = [...new Set(entries.map(entry => entry.flag))].join(' ');

    // Display each city on a new line
    const cityLines = entries.map(entry =>
      `<div class="timeline-city-line">${entryCountry(entry)} · ${entryCity(entry)}</div>`
    ).join('');

    slide.innerHTML = `
      <div class="timeline-flags">${flags}</div>
      <div class="timeline-cities">${cityLines}</div>
      <p class="timeline-date">${formattedDate}</p>
    `;

    slide.addEventListener('click', () => {
      selectTravel(entries[0].id, 'timeline');
    });

    wrapper.appendChild(slide);
  });

  container.appendChild(wrapper);

  // Add custom navigation buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'timeline-nav-btn timeline-nav-prev';
  prevBtn.innerHTML = '‹';
  prevBtn.setAttribute('aria-label', 'Previous');
  const controls = container.querySelector('[data-timeline-controls]');
  controls?.appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'timeline-nav-btn timeline-nav-next';
  nextBtn.innerHTML = '›';
  nextBtn.setAttribute('aria-label', 'Next');
  controls?.appendChild(nextBtn);

  // Initialize Swiper after wrapper is created
  if (state.timeline) {
    state.timeline.destroy(true, true);
  }

  state.timeline = new Swiper(container, {
    modules: [FreeMode],
    slidesPerView: 'auto',
    spaceBetween: 16,
    freeMode: {
      enabled: true,
      sticky: false,
    },
  });

  // Custom navigation
  prevBtn.addEventListener('click', () => {
    state.timeline?.slidePrev();
  });

  nextBtn.addEventListener('click', () => {
    state.timeline?.slideNext();
  });
}

function renderWishlistGrid(container: HTMLElement, data: TravelEntry[]) {
  // Destroy Swiper if exists (wishlist doesn't use Swiper)
  if (state.timeline) {
    state.timeline.destroy(true, true);
    state.timeline = null;
  }

  const grid = document.createElement('div');
  grid.className = 'wishlist-grid';

  data.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'wishlist-card';
    card.dataset.travelId = entry.id;

    card.innerHTML = `
      <span class="wishlist-flag">${entry.flag}</span>
      <strong class="wishlist-city">${entryCity(entry)}</strong>
      <span class="wishlist-country">${entryCountry(entry)}</span>
    `;

    card.addEventListener('click', () => {
      selectTravel(entry.id, 'wishlist');
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function updateTimelineActiveState(travelId: string) {
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.classList.toggle('is-active', item.getAttribute('data-travel-id') === travelId);
  });
  document.querySelectorAll('.wishlist-card').forEach(card => {
    card.classList.toggle('is-active', card.getAttribute('data-travel-id') === travelId);
  });
}

// ==================== Detail Panel Module ====================

function initDetailPanel() {
  renderEmptyState();
}

function renderEmptyState() {
  const panel = document.querySelector('[data-travel-detail]');
  if (!panel) return;

  panel.innerHTML = `
    <div class="travel-empty-state">
      <span>// SELECT_DESTINATION</span>
      <h3>${t('travel.select.title')}</h3>
      <p>${t('travel.select.copy')}</p>
    </div>
  `;
}

function renderTravelDetail(entry: TravelEntry) {
  const panel = document.querySelector('[data-travel-detail]');
  if (!panel) return;

  if (!entry.isVisited) {
    renderWishlistDetail(entry);
    return;
  }

  const photoCount = entry.photos?.length || 0;
  const hasCover = !!entry.coverImage || photoCount > 0;
  const coverImage = entry.coverImage || (photoCount > 0 ? entry.photos![0].src : '');
  // Use placeholder cover when no photos available
  const placeholderCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
  const displayImage = hasCover ? coverImage : placeholderCover;
  const showPlaceholder = !hasCover;
  const photosHTML = `
    <div class="travel-cover ${showPlaceholder ? 'travel-cover-placeholder' : ''}" data-lightbox-trigger="${entry.id}" ${showPlaceholder ? 'data-lightbox-disabled' : ''}>
      <img src="${displayImage}" alt="${entryCity(entry)}" loading="lazy" class="travel-cover-img" />
      <div class="travel-cover-overlay">
        <span>${showPlaceholder ? t('travel.photos.pending') : t('travel.photos.count', { count: photoCount })}</span>
      </div>
    </div>
  `;

  const notesHTML = entry.notes && entry.notes.length > 0 ? `
    <div class="travel-notes">
      <strong>// TRAVEL_TIPS</strong>
      <ul>
        ${entry.notes.map(note => `<li>${note}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  panel.innerHTML = `
    ${photosHTML}
    <div class="travel-detail-header">
      <span class="travel-detail-kicker">// DESTINATION_FILE</span>
      <h3>${entry.flag} ${entryCity(entry)}${currentLanguage === 'zh' ? '，' : ', '}${entryCountry(entry)}</h3>
    </div>
    <div class="travel-meta">
      <div class="travel-date">
        <span class="travel-date-label">${t('travel.date.label')}</span>
        <span class="travel-date-value">${formatTravelDate(entry.startDate)}${entry.startDate !== entry.endDate ? ' → ' + formatTravelDate(entry.endDate) : ''}</span>
      </div>
    </div>
    ${entryStory(entry) ? `
      <div class="travel-story">
        <strong>// TRAVEL_LOG</strong>
        <p>${entryStory(entry)}</p>
      </div>
    ` : ''}
    ${notesHTML}
  `;

  // Handle click on cover image (skip placeholder covers)
  const coverEl = panel.querySelector('[data-lightbox-trigger]');
  if (coverEl && !coverEl.hasAttribute('data-lightbox-disabled')) {
    coverEl.addEventListener('click', () => {
      openLightbox(entry.id);
    });
  }
}

function renderWishlistDetail(entry: TravelEntry) {
  const panel = document.querySelector('[data-travel-detail]');
  if (!panel) return;

  panel.innerHTML = `
    <div class="wishlist-detail">
      <span class="wishlist-detail-flag">${entry.flag}</span>
      <span class="travel-detail-kicker">// WISHLIST_FILE</span>
      <h3>${entryCity(entry)}${currentLanguage === 'zh' ? '，' : ', '}${entryCountry(entry)}</h3>
      <p class="wishlist-detail-status">// WISHLIST_PENDING</p>
      <p class="wishlist-detail-hint">${t('travel.wishlist.hint')}</p>
    </div>
  `;
}

// ==================== Coordination Module ====================

function selectTravel(travelId: string, _source: 'init' | 'globe' | 'timeline' | 'detail' | 'wishlist') {
  if (state.isUpdating) return;

  state.isUpdating = true;
  state.selectedId = travelId;

  const entry = getTravelEntryById(travelId);
  if (!entry) {
    state.isUpdating = false;
    return;
  }

  // Auto-switch tab based on entry type
  if (entry.isVisited && state.activeTab === 'wishlist') {
    state.activeTab = 'visited';
    updateTabButtons('visited');
    renderTimelineItems(document.querySelector('[data-travel-timeline]')!);
  } else if (!entry.isVisited && state.activeTab === 'visited') {
    state.activeTab = 'wishlist';
    updateTabButtons('wishlist');
    renderTimelineItems(document.querySelector('[data-travel-timeline]')!);
  }

  renderTravelDetail(entry);
  updateTimelineActiveState(travelId);

  flyToCountry(entry.coordinates);

  setTimeout(() => {
    state.isUpdating = false;
  }, 100);
}


// ==================== Detail Panel Module ====================


function updateTabButtons(activeTab: 'visited' | 'wishlist') {
  document.querySelectorAll('.timeline-tab').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-tab') === activeTab);
  });
}

// ==================== Helper Functions ====================

function updateVisitedCount() {
  // Count unique countries from travelData
  const visitedCountries = new Set(travelData.filter(e => e.isVisited).map(e => e.countryCode));
  const count = visitedCountries.size;
  const countElement = document.getElementById('visited-count');
  if (countElement) {
    countElement.textContent = count.toString();
  }
}

// Background music player removed

// ==================== Background Effects ====================

function initBackgroundEffects() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Create particles container
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'bg-particles';
  document.body.appendChild(particlesContainer);

  // Create floating particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
  }
}

// ==================== Mouse Effects ====================

let cursorGlow: HTMLElement | null = null;
let cursorGlowFrame = 0;
let cursorGlowX = 0;
let cursorGlowY = 0;

function initMouseEffects() {
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', event => {
    cursorGlowX = event.clientX;
    cursorGlowY = event.clientY;

    if (cursorGlowFrame) return;
    cursorGlowFrame = window.requestAnimationFrame(() => {
      cursorGlowFrame = 0;
      cursorGlow?.style.setProperty('--cursor-x', `${cursorGlowX}px`);
      cursorGlow?.style.setProperty('--cursor-y', `${cursorGlowY}px`);
      cursorGlow?.classList.add('is-active');
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorGlow?.classList.remove('is-active');
  });
}

// ==================== Travel Lightbox ====================

let lightboxOpen = false;

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumb?: string;
  caption?: string;
}

let lightboxItems: MediaItem[] = [];
let lightboxKeyHandler: ((event: KeyboardEvent) => void) | null = null;

function openLightbox(travelId: string) {
  const entry = getTravelEntryById(travelId);
  if (!entry) return;

  // Combine photos and videos
  const photos: MediaItem[] = (entry.photos || []).map(p => ({
    type: 'image',
    src: p.src,
    thumb: p.thumb,
    caption: p.caption,
  }));
  const videos: MediaItem[] = (entry.videos || []).map(v => ({
    type: 'video',
    src: v.src,
    caption: v.caption,
  }));

  lightboxItems = [...photos, ...videos];
  if (lightboxItems.length === 0) return;

  currentSlide = 0;
  lightboxOpen = true;
  renderLightbox(entry);
}

function closeLightbox() {
  lightboxOpen = false;
  if (lightboxKeyHandler) {
    document.removeEventListener('keydown', lightboxKeyHandler);
    lightboxKeyHandler = null;
  }
  const container = document.getElementById('lightbox-root');
  if (container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

function renderLightbox(entry: TravelEntry) {
  let container = document.getElementById('lightbox-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lightbox-root';
    document.body.appendChild(container);
  }

  container.style.display = 'block';
  const dateRange = entry.startDate === entry.endDate
    ? formatTravelDate(entry.startDate)
    : formatTravelDate(entry.startDate) + ' → ' + formatTravelDate(entry.endDate);

  container.innerHTML = `
    <div class="media-lightbox">
      <div class="media-lightbox-backdrop" data-lightbox-close></div>
      <div class="media-lightbox-content">
        <button class="media-lightbox-close" data-lightbox-close>×</button>
        <div class="media-lightbox-stage">
          ${lightboxItems.map((item, idx) => `
            <div class="media-lightbox-slide ${idx === 0 ? 'active' : ''}" data-slide="${idx}">
              ${item.type === 'video' 
                ? '<video src="' + item.src + '" controls autoplay class="media-lightbox-video"></video>'
                : '<img src="' + item.src + '" alt="' + mediaCaption(item.caption) + '" class="media-lightbox-img" loading="lazy">'
              }
              <div class="media-lightbox-caption">
                <strong>${entryCity(entry)}</strong>
                <span>${entry.flag} ${entryCountry(entry)} · ${dateRange}</span>
                ${item.caption ? '<p>' + mediaCaption(item.caption) + '</p>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
        ${lightboxItems.length > 1 ? `
          <button class="media-lightbox-nav prev" data-lightbox-prev>‹</button>
          <button class="media-lightbox-nav next" data-lightbox-next>›</button>
          <div class="media-lightbox-counter">
            <span data-lightbox-counter>1 / ${lightboxItems.length}</span>
          </div>
          <div class="media-lightbox-thumbs">
            ${lightboxItems.map((item, idx) => `
              <button class="media-lightbox-thumb ${idx === 0 ? 'active' : ''}" data-lightbox-thumb="${idx}">
                ${item.type === 'video' 
                  ? '<span>▶</span>' 
                  : '<img src="' + (item.thumb || item.src) + '" alt="' + mediaCaption(item.caption) + '" loading="lazy">'
                }
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Event listeners
  container.querySelectorAll('[data-lightbox-close]').forEach(el => {
    el.addEventListener('click', closeLightbox);
  });
  container.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => navigateLightbox(-1));
  container.querySelector('[data-lightbox-next]')?.addEventListener('click', () => navigateLightbox(1));
  container.querySelectorAll('[data-lightbox-thumb]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt((el as HTMLElement).dataset.lightboxThumb || '0');
      goToSlide(idx);
    });
  });

  // Keyboard navigation
  if (lightboxKeyHandler) {
    document.removeEventListener('keydown', lightboxKeyHandler);
  }
  lightboxKeyHandler = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  };
  document.addEventListener('keydown', lightboxKeyHandler);

  // Show first slide
  updateSlidePosition(0);
}

let currentSlide = 0;

function navigateLightbox(direction: number) {
  currentSlide = (currentSlide + direction + lightboxItems.length) % lightboxItems.length;
  updateSlidePosition(currentSlide);
}

function goToSlide(index: number) {
  currentSlide = index;
  updateSlidePosition(currentSlide);
}

function updateSlidePosition(index: number) {
  document.querySelectorAll('.media-lightbox-slide').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  const counter = document.querySelector('[data-lightbox-counter]');
  if (counter) {
    counter.textContent = `${index + 1} / ${lightboxItems.length}`;
  }
  document.querySelectorAll('.media-lightbox-thumb').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
}

// ==================== Initialization ====================

// ==================== Language Switching ====================

const LANGUAGE_STORAGE_KEY = 'personal-website-language';
const THEME_STORAGE_KEY = 'personal-website-theme';
type Theme = 'lab' | 'ocean' | 'sunset';

function isLanguage(value: string | null): value is Language {
  return value === 'zh' || value === 'en';
}

function isTheme(value: string | null): value is Theme {
  return value === 'lab' || value === 'ocean' || value === 'sunset';
}

function getStoredLanguage(): Language {
  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(storedLanguage) ? storedLanguage : 'zh';
  } catch {
    return 'zh';
  }
}

function getStoredTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : 'lab';
  } catch {
    return 'lab';
  }
}

function switchTheme(theme: Theme) {
  if (theme === 'lab') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.dataset.theme = theme;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Keep theme switching usable even when storage is unavailable.
  }

  document.querySelectorAll('[data-theme-switch]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-theme-switch') === theme);
  });
}

function initThemeToggle() {
  document.querySelectorAll('[data-theme-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const theme = btn.getAttribute('data-theme-switch');
      if (isTheme(theme)) {
        switchTheme(theme);
      }
    });
  });

  switchTheme(getStoredTheme());
}

function initAppearanceMenu() {
  const menus = Array.from(document.querySelectorAll('[data-appearance-menu]')) as HTMLElement[];

  const closeMenus = (except?: HTMLElement) => {
    menus.forEach(menu => {
      if (menu !== except) {
        menu.classList.remove('is-open');
        menu.querySelector('[data-appearance-trigger]')?.setAttribute('aria-expanded', 'false');
      }
    });
  };

  menus.forEach(menu => {
    const trigger = menu.querySelector('[data-appearance-trigger]') as HTMLButtonElement | null;
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const shouldOpen = !menu.classList.contains('is-open');
      closeMenus(menu);
      menu.classList.toggle('is-open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
    });

    menu.addEventListener('click', event => event.stopPropagation());
  });

  document.addEventListener('click', () => closeMenus());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenus();
    }
  });
}

function switchLanguage(lang: Language) {
  currentLanguage = lang;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Keep language switching usable even when storage is unavailable.
  }

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && translations[lang][key] && el instanceof HTMLTextAreaElement) {
      el.placeholder = translations[lang][key];
    }
  });

  // Update language button active state
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lang-switch') === lang);
  });

  // Update page title
  document.title = translations[lang].documentTitle;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // Update mobile brand
  const mobileBrand = document.querySelector('.mobile-brand');
  if (mobileBrand && translations[lang]['mobile.brand']) {
    mobileBrand.textContent = translations[lang]['mobile.brand'];
  }

  refreshTravelLanguage();
}

function refreshTravelLanguage() {
  const timelineContainer = document.querySelector('[data-travel-timeline]') as HTMLElement | null;
  const visitedTab = document.querySelector('[data-tab="visited"]');
  const wishlistTab = document.querySelector('[data-tab="wishlist"]');

  if (visitedTab) {
    visitedTab.textContent = `${t('travel.tab.visited')} (${travelData.filter(e => e.isVisited).length})`;
  }

  if (wishlistTab) {
    wishlistTab.textContent = `${t('travel.tab.wishlist')} (${wishlistData.filter(e => ['MV', 'IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode)).length})`;
  }

  if (timelineContainer) {
    renderTimelineItems(timelineContainer);
    if (state.selectedId) {
      updateTimelineActiveState(state.selectedId);
    }
  }

  if (state.selectedId) {
    const entry = getTravelEntryById(state.selectedId);
    if (entry) {
      renderTravelDetail(entry);
    }
  } else {
    renderEmptyState();
  }

}

function initLanguageToggle() {
  // Desktop language toggle
  document.querySelectorAll('.language-toggle [data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang-switch') as Language;
      switchLanguage(lang);
    });
  });

  // Mobile language toggle
  document.querySelectorAll('.mobile-language-toggle [data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang-switch') as Language;
      switchLanguage(lang);
    });
  });

  switchLanguage(getStoredLanguage());
}

function initActiveNavigation() {
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]')) as HTMLAnchorElement[];
  const sections = links
    .map(link => {
      const id = link.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { id, link, section } : null;
    })
    .filter((item): item is { id: string; link: HTMLAnchorElement; section: HTMLElement } => item !== null);

  if (sections.length === 0) return;

  const nav = document.querySelector('.navbar') as HTMLElement | null;

  const setActive = (activeId: string) => {
    sections.forEach(({ id, link }) => {
      const isActive = id === activeId;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const getActivationLine = () => (nav?.getBoundingClientRect().height ?? 72) + 28;

  let ticking = false;
  const updateActiveSection = () => {
    const activationLine = getActivationLine();
    const activeSection = sections.reduce((current, item) => {
      const top = item.section.getBoundingClientRect().top;
      return top <= activationLine ? item : current;
    }, sections[0]);

    setActive(activeSection.id);
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  };

  links.forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1);
      if (id) {
        setActive(id);
        window.setTimeout(requestUpdate, 360);
      }
    });
  });

  updateActiveSection();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
}

document.addEventListener('DOMContentLoaded', async () => {
  currentLanguage = getStoredLanguage();
  await loadManagedContent();
  renderManagedProjects();
  initProjectCarousel();
  initProjectFilters();
  initTimeline();
  initDetailPanel();
  updateVisitedCount();
  initBackgroundEffects();
  initMouseEffects();
  initAppearanceMenu();
  initThemeToggle();
  initLanguageToggle();
  initActiveNavigation();
  initGlobeWhenVisible();
});
