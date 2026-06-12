import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';
import Swiper from 'swiper';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { travelData, wishlistData, getTravelEntryById, type TravelEntry } from './travel-data';
import { translations, type Language } from '../i18n/translations';

interface AppState {
  selectedId: string | null;
  isUpdating: boolean;
  activeTab: 'visited' | 'wishlist';
  globe: InstanceType<typeof ThreeGlobe> | null;
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  controls: InstanceType<typeof OrbitControls> | null;
  timeline: Swiper | null;
}

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

const travelCopy: Record<string, { country: string; city: string; story?: string }> = {
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
  if (!container) return;

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
  const visitedCountryFeatures = await fetch('/assets/globe/countries.geojson')
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      const features = Array.isArray(data?.features) ? data.features : [];
      return features.filter((feature: any) => isVisitedCountryFeature(feature, visitedCountryCodes));
    })
    .catch(() => []);

  const globe = new ThreeGlobe()
    .globeImageUrl('/assets/globe/earth-blue-marble.jpg')
    .bumpImageUrl('/assets/globe/earth-topology.png')
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
      return cityMap[d.city] || d.city;
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
    handleGlobeClick(event, container, camera, scene);
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
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
) {
  if (!state.globe) return;

  const rect = container.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const globeObjects = scene.children.filter(c => c instanceof ThreeGlobe);
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
  if (!state.camera || !state.controls) return;

  const [lat, lng] = coordinates;

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
        <button type="button" class="timeline-tab" data-tab="wishlist">${t('travel.tab.wishlist')} (${wishlistData.filter(e => ['IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode)).length})</button>
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
    : wishlistData.filter(e => ['IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode));

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

    const formattedDate = formatTravelDate(entries[0].startDate);

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

interface MouseParticle {
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

let mouseParticles: MouseParticle[] = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let particleContainer: HTMLElement | null = null;
let cursorDot: HTMLElement | null = null;

function initMouseEffects() {
  // Create particle container
  particleContainer = document.createElement('div');
  particleContainer.className = 'mouse-particles';
  document.body.appendChild(particleContainer);

  // Create cursor dot
  cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Calculate movement distance
    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Spawn particles based on movement
    if (distance > 2) {
      const particleCount = Math.min(Math.floor(distance / 4), 3);
      for (let i = 0; i < particleCount; i++) {
        spawnParticle(mouseX, mouseY);
      }
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  // Animation loop
  function animateParticles() {
    // Update cursor dot position
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }

    // Update particles
    for (let i = mouseParticles.length - 1; i >= 0; i--) {
      const p = mouseParticles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity and friction
      p.vy += 0.15; // gravity
      p.vx *= 0.98; // friction
      p.vy *= 0.98;
      
      // Decrease life
      p.life -= 1;
      
      // Update element
      const opacity = p.life / p.maxLife;
      const scale = opacity * 0.8 + 0.2;
      p.element.style.left = p.x + 'px';
      p.element.style.top = p.y + 'px';
      p.element.style.opacity = opacity.toString();
      p.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
      
      // Remove dead particles
      if (p.life <= 0) {
        p.element.remove();
        mouseParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

function spawnParticle(x: number, y: number) {
  if (!particleContainer) return;

  const particle = document.createElement('div');
  particle.className = 'mouse-particle';
  
  // Random size variation
  const size = 4 + Math.random() * 4;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  
  // Random color between green and cyan
  const hue = 140 + Math.random() * 40; // 140 (green) to 180 (cyan)
  particle.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 65%, 0.9) 0%, hsla(${hue}, 100%, 55%, 0.6) 50%, transparent 100%)`;
  particle.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 100%, 60%, 0.6), 0 0 ${size * 4}px hsla(${hue}, 100%, 50%, 0.3)`;
  
  particleContainer.appendChild(particle);

  // Random velocity
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 2;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed - 1; // slight upward bias

  const maxLife = 30 + Math.random() * 20;

  mouseParticles.push({
    element: particle,
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    life: maxLife,
    maxLife: maxLife,
    size: size
  });

  // Limit particle count
  if (mouseParticles.length > 50) {
    const oldest = mouseParticles.shift();
    if (oldest) {
      oldest.element.remove();
    }
  }
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
    wishlistTab.textContent = `${t('travel.tab.wishlist')} (${wishlistData.filter(e => ['IN', 'PW', 'MX', 'NZ', 'VN'].includes(e.countryCode)).length})`;
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

function initAiChat() {
  const root = document.querySelector('[data-ai-chat]') as HTMLElement | null;
  const trigger = document.querySelector('[data-ai-chat-trigger]') as HTMLButtonElement | null;
  const panel = document.querySelector('[data-ai-chat-panel]') as HTMLElement | null;
  const closeButton = document.querySelector('[data-ai-chat-close]') as HTMLButtonElement | null;
  const form = document.querySelector('[data-ai-chat-form]') as HTMLFormElement | null;
  const input = document.querySelector('[data-ai-chat-input]') as HTMLTextAreaElement | null;
  const submit = document.querySelector('[data-ai-chat-submit]') as HTMLButtonElement | null;
  const messages = document.querySelector('[data-ai-chat-messages]') as HTMLElement | null;

  if (!root || !trigger || !panel || !form || !input || !submit || !messages) return;

  const setOpen = (open: boolean) => {
    root.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    if (open) {
      window.setTimeout(() => input.focus(), 120);
    }
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const renderInlineMarkdown = (value: string) => {
    let output = escapeHtml(value);
    output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
    output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return output;
  };

  const isMarkdownTableDivider = (line: string) =>
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

  const splitMarkdownTableRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim());

  const renderMarkdown = (value: string) => {
    const normalized = value.replace(/\r\n/g, '\n').trim();
    if (!normalized) return '';

    const lines = normalized.split('\n');
    const blocks: string[] = [];

    for (let index = 0; index < lines.length;) {
      const line = lines[index];
      const nextLine = lines[index + 1];

      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (line.includes('|') && nextLine && isMarkdownTableDivider(nextLine)) {
        const headers = splitMarkdownTableRow(line);
        const rows: string[][] = [];
        index += 2;
        while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
          rows.push(splitMarkdownTableRow(lines[index]));
          index += 1;
        }

        const head = headers.map(header => `<th>${renderInlineMarkdown(header)}</th>`).join('');
        const body = rows
          .map(row => `<tr>${headers.map((_, cellIndex) => `<td>${renderInlineMarkdown(row[cellIndex] || '')}</td>`).join('')}</tr>`)
          .join('');
        blocks.push(`<div class="ai-markdown-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`);
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        const items: string[] = [];
        while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
          items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const items: string[] = [];
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^\s*\d+\.\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      const paragraphLines: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        !(lines[index].includes('|') && lines[index + 1] && isMarkdownTableDivider(lines[index + 1])) &&
        !/^\s*[-*]\s+/.test(lines[index]) &&
        !/^\s*\d+\.\s+/.test(lines[index])
      ) {
        paragraphLines.push(lines[index]);
        index += 1;
      }
      blocks.push(`<p>${paragraphLines.map(renderInlineMarkdown).join('<br>')}</p>`);
    }

    return blocks.join('');
  };

  const setMessageMarkdown = (article: HTMLElement, text: string) => {
    const body = article.querySelector('[data-ai-message-body]') as HTMLElement | null;
    if (!body) return;
    body.innerHTML = renderMarkdown(text);
  };

  const appendMessage = (role: 'user' | 'assistant' | 'error', text: string) => {
    const article = document.createElement('article');
    article.className = `ai-message ${role === 'user' ? 'ai-message-user' : 'ai-message-assistant'}${role === 'error' ? ' ai-message-error' : ''}`;
    const body = document.createElement('div');
    body.className = 'ai-message-body';
    body.dataset.aiMessageBody = '';
    article.appendChild(body);
    messages.appendChild(article);
    setMessageMarkdown(article, text);
    messages.scrollTop = messages.scrollHeight;
    return article;
  };

  const resizeInput = () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  };

  const chatEndpoints = () => {
    const endpoints = ['/api/chat'];
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      endpoints.push('http://localhost:8787/api/chat');
    }
    return endpoints;
  };

  const ask = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question) return;

    appendMessage('user', question);
    input.value = '';
    resizeInput();
    submit.disabled = true;

    const pending = appendMessage('assistant', t('ai.thinking'));
    pending.classList.add('is-streaming');

    try {
      let response: Response | null = null;
      let lastError: unknown = null;
      const body = JSON.stringify({
        message: question,
        language: currentLanguage,
      });

      for (const endpoint of chatEndpoints()) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          if (response.ok) break;
          lastError = new Error(`AI request failed: ${response.status}`);
        } catch (error) {
          lastError = error;
        }
      }

      if (!response?.ok) {
        throw lastError || new Error('AI request failed');
      }

      const pendingText = pending.querySelector('[data-ai-message-body]') as HTMLElement;
      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setMessageMarkdown(pending, typeof data.reply === 'string' ? data.reply : t('ai.error'));
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedText = '';
        pendingText.innerHTML = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          streamedText += decoder.decode(value, { stream: true });
          setMessageMarkdown(pending, streamedText);
          messages.scrollTop = messages.scrollHeight;
        }

        streamedText += decoder.decode();
        setMessageMarkdown(pending, streamedText || t('ai.error'));
      } else {
        setMessageMarkdown(pending, await response.text());
      }
    } catch {
      pending.classList.add('ai-message-error');
      setMessageMarkdown(pending, t('ai.error'));
    } finally {
      pending.classList.remove('is-streaming');
      submit.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }
  };

  trigger.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
  closeButton?.addEventListener('click', () => setOpen(false));

  input.addEventListener('input', resizeInput);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });

  document.querySelectorAll('[data-ai-question]').forEach(button => {
    button.addEventListener('click', () => {
      const question = (button as HTMLElement).innerText || button.getAttribute('data-ai-question') || '';
      setOpen(true);
      ask(question);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      setOpen(false);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  currentLanguage = getStoredLanguage();
  await initGlobe();
  initTimeline();
  initDetailPanel();
  updateVisitedCount();
  initBackgroundEffects();
  initMouseEffects();
  initAppearanceMenu();
  initThemeToggle();
  initLanguageToggle();
  initActiveNavigation();
  initAiChat();
});
