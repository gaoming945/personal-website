export interface TravelPhoto {
  src: string;
  thumb?: string;
  caption?: string;
}

export interface TravelVideo {
  src: string;
  caption?: string;
}

export interface TravelEntry {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  startDate: string;
  endDate: string;
  flag: string;
  coordinates: [number, number];
  coverImage?: string;
  story?: string;
  notes?: string[];
  photos?: TravelPhoto[];
  videos?: TravelVideo[];
  isVisited: boolean;
}

export const travelData: TravelEntry[] = [
  // ===== 已访问国家 (isVisited: true) - 按时间倒序 =====
  {
    id: 'indonesia-bali-2026',
    country: '印度尼西亚',
    countryCode: 'ID',
    city: '巴厘岛',
    startDate: '2026-04-30',
    endDate: '2026-04-30',
    flag: '🇮🇩',
    coordinates: [-8.3405, 115.0920],
    story: '巴厘岛是印度尼西亚最著名的岛屿之一，以其美丽的海滩、丰富的文化和独特的艺术而闻名。',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200', 'thumb': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', 'caption': '巴厘岛海滩'},
      {'src': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200', 'thumb': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=200', 'caption': '乌布梯田'},
      {'src': 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1200', 'thumb': 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=200', 'caption': '海神庙'},
      {'src': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200', 'thumb': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200', 'caption': '库塔海滩'}
    ],
    videos: [
      {'src': 'https://www.w3schools.com/html/mov_bbb.mp4', 'caption': '巴厘岛旅行视频'}
    ],
    isVisited: true,
  },
  {
    id: 'philippines-manila-2026',
    country: '菲律宾',
    countryCode: 'PH',
    city: '马尼拉',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    flag: '🇵🇭',
    coordinates: [14.5995, 120.9842],
    story: '马尼拉是菲律宾的首都，拥有丰富的历史和文化遗产。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200', 'caption': '马尼拉夜景'},
      {'src': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200', 'caption': '巧克力山'}
    ],
    isVisited: true,
  },
  {
    id: 'philippines-bohol-2026',
    country: '菲律宾',
    countryCode: 'PH',
    city: '薄荷岛',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    flag: '🇵🇭',
    coordinates: [9.8500, 124.0000],
    story: '薄荷岛以其美丽的海滩和潜水点而闻名。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200', 'caption': '薄荷岛海滩'},
      {'src': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200', 'caption': '巧克力山'}
    ],
    isVisited: true,
  },
  {
    id: 'japan-tokyo-2026',
    country: '日本',
    countryCode: 'JP',
    city: '东京',
    startDate: '2026-02-12',
    endDate: '2026-02-12',
    flag: '🇯🇵',
    coordinates: [35.6762, 139.6503],
    story: '东京是传统与现代的完美融合。在浅草寺感受江户风情，转头就能看到涩谷十字路口的现代都市节奏。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'caption': '东京塔'},
      {'src': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'caption': '浅草寺'}
    ],
    isVisited: true,
  },
  {
    id: 'uk-london-2025',
    country: '英国',
    countryCode: 'GB',
    city: '伦敦',
    startDate: '2025-10-01',
    endDate: '2025-10-01',
    flag: '🇬🇧',
    coordinates: [51.5074, -0.1278],
    story: '伦敦是一座充满历史和文化底蕴的城市，大本钟、伦敦塔桥、大英博物馆等都是必游之地。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200', 'caption': '伦敦大本钟'},
      {'src': 'https://images.unsplash.com/photo-1529655683826-3d4627c997de?w=1200', 'caption': '伦敦塔桥'}
    ],
    isVisited: true,
  },
  {
    id: 'srilanka-colombo-2025',
    country: '斯里兰卡',
    countryCode: 'LK',
    city: '科伦坡',
    startDate: '2025-09-30',
    endDate: '2025-09-30',
    flag: '🇱🇰',
    coordinates: [6.9271, 79.8612],
    story: '斯里兰卡被称为印度洋上的明珠，科伦坡是其首都，拥有丰富的历史和文化遗产。',
    isVisited: true,
  },
  {
    id: 'malaysia-kl-2025',
    country: '马来西亚',
    countryCode: 'MY',
    city: '吉隆坡',
    startDate: '2025-08-22',
    endDate: '2025-08-22',
    flag: '🇲🇾',
    coordinates: [3.1390, 101.6869],
    story: '吉隆坡是一座多元文化交融的城市。双子塔的现代感、黑风洞的印度教色彩、茨厂街的华人文化，在这里和谐共存。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200', 'caption': '双子塔'},
      {'src': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200', 'caption': '吉隆坡夜景'}
    ],
    isVisited: true,
  },
  {
    id: 'singapore-2025',
    country: '新加坡',
    countryCode: 'SG',
    city: '新加坡',
    startDate: '2025-06-01',
    endDate: '2025-06-01',
    flag: '🇸🇬',
    coordinates: [1.3521, 103.8198],
    story: '新加坡虽小但精致有序。滨海湾花园的超级树让人仿佛置身未来世界，牛车水和小印度的多元文化融合令人印象深刻。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200', 'caption': '滨海湾花园'},
      {'src': 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=1200', 'caption': '滨海湾金沙'}
    ],
    isVisited: true,
  },
  {
    id: 'australia-melbourne-2025',
    country: '澳大利亚',
    countryCode: 'AU',
    city: '墨尔本',
    startDate: '2025-05-01',
    endDate: '2025-05-01',
    flag: '🇦🇺',
    coordinates: [-37.8136, 144.9631],
    story: '墨尔本以其艺术氛围和咖啡文化著称。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200', 'caption': '墨尔本街头'},
      {'src': 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200', 'caption': '墨尔本咖啡'}
    ],
    isVisited: true,
  },
  {
    id: 'australia-sydney-2025',
    country: '澳大利亚',
    countryCode: 'AU',
    city: '悉尼',
    startDate: '2025-05-01',
    endDate: '2025-05-01',
    flag: '🇦🇺',
    coordinates: [-33.8688, 151.2093],
    story: '悉尼以歌剧院和海港大桥闻名。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200', 'caption': '悉尼歌剧院'},
      {'src': 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200', 'caption': '悉尼海港大桥'}
    ],
    isVisited: true,
  },
  {
    id: 'southkorea-seoul-2025',
    country: '韩国',
    countryCode: 'KR',
    city: '首尔',
    startDate: '2025-04-03',
    endDate: '2025-04-03',
    flag: '🇰🇷',
    coordinates: [37.5665, 126.9780],
    story: '首尔是韩国的首都，融合了传统与现代，景福宫、明洞、江南区等都是热门景点。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200', 'caption': '首尔景福宫'},
      {'src': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200', 'caption': '首尔明洞'}
    ],
    isVisited: true,
  },
  {
    id: 'japan-hiroshima-2025',
    country: '日本',
    countryCode: 'JP',
    city: '广岛',
    startDate: '2025-02-21',
    endDate: '2025-02-21',
    flag: '🇯🇵',
    coordinates: [34.3853, 132.4553],
    story: '广岛是一座具有历史意义的城市，和平纪念公园和原子弹圆顶屋提醒人们珍惜和平。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'caption': '广岛和平纪念公园'},
      {'src': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'caption': '广岛城'}
    ],
    isVisited: true,
  },
  {
    id: 'southkorea-jeju-2025',
    country: '韩国',
    countryCode: 'KR',
    city: '济州岛',
    startDate: '2025-01-24',
    endDate: '2025-01-24',
    flag: '🇰🇷',
    coordinates: [33.4890, 126.4983],
    story: '济州岛是韩国最大的岛屿，以其独特的火山地貌、美丽的海滩和丰富的文化而闻名。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200', 'caption': '济州岛海滩'},
      {'src': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200', 'caption': '济州岛火山'}
    ],
    isVisited: true,
  },
  {
    id: 'japan-osaka-2024',
    country: '日本',
    countryCode: 'JP',
    city: '大阪',
    startDate: '2024-09-12',
    endDate: '2024-09-12',
    flag: '🇯🇵',
    coordinates: [34.6937, 135.5023],
    story: '大阪以其美食和活力著称。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'caption': '大阪城'},
      {'src': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'caption': '道顿堀'}
    ],
    isVisited: true,
  },
  {
    id: 'japan-nagoya-2024',
    country: '日本',
    countryCode: 'JP',
    city: '名古屋',
    startDate: '2024-09-12',
    endDate: '2024-09-12',
    flag: '🇯🇵',
    coordinates: [35.1815, 136.9066],
    story: '名古屋是日本的工业中心，拥有丰富的历史和文化遗产。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'caption': '名古屋城'},
      {'src': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'caption': '名古屋车站'}
    ],
    isVisited: true,
  },
  {
    id: 'china-hongkong-2023',
    country: '中国',
    countryCode: 'CN',
    city: '中国香港',
    startDate: '2023-09-16',
    endDate: '2023-09-16',
    flag: '🇭🇰',
    coordinates: [22.3193, 114.1694],
    story: '香港是一个国际大都市，融合了东西方文化，维多利亚港、太平山顶、迪士尼乐园等都是热门景点。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200', 'caption': '维多利亚港'},
      {'src': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200', 'caption': '太平山顶'}
    ],
    isVisited: true,
  },
  {
    id: 'thailand-bangkok-2019',
    country: '泰国',
    countryCode: 'TH',
    city: '曼谷',
    startDate: '2019-06-05',
    endDate: '2019-06-05',
    flag: '🇹🇭',
    coordinates: [13.7563, 100.5018],
    story: '曼谷是一座充满活力的城市。大皇宫的金碧辉煌让人震撼，街头小吃的酸辣鲜香令人难忘。',
    photos: [
      {'src': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200', 'caption': '大皇宫'},
      {'src': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200', 'caption': '水上市场'}
    ],
    isVisited: true,
  },
];

export function getTravelEntryById(id: string): TravelEntry | undefined {
  return travelData.find(entry => entry.id === id);
}

export function getTravelEntriesByCountry(countryCode: string): TravelEntry[] {
  return travelData.filter(entry => entry.countryCode === countryCode);
}

// ===== 心愿清单 (isVisited: false) =====
// 83个国家（排除俄罗斯、朝鲜等不安全国家）
export const wishlistData: TravelEntry[] = [
  { id: 'wishlist-india', country: '印度', countryCode: 'IN', city: '新德里', startDate: '', endDate: '', flag: '🇮🇳', coordinates: [28.6139, 77.2090], isVisited: false },
  { id: 'wishlist-palau', country: '帕劳', countryCode: 'PW', city: '科罗尔', startDate: '', endDate: '', flag: '🇵🇼', coordinates: [7.5000, 134.6243], isVisited: false },
  { id: 'wishlist-mexico', country: '墨西哥', countryCode: 'MX', city: '墨西哥城', startDate: '', endDate: '', flag: '🇲🇽', coordinates: [19.4326, -99.1332], isVisited: false },
  { id: 'wishlist-newzealand', country: '新西兰', countryCode: 'NZ', city: '皇后镇', startDate: '', endDate: '', flag: '🇳🇿', coordinates: [-45.0312, 168.6626], isVisited: false },
  { id: 'wishlist-vietnam', country: '越南', countryCode: 'VN', city: '河内', startDate: '', endDate: '', flag: '🇻🇳', coordinates: [21.0278, 105.8342], isVisited: false },
  { id: 'wishlist-usa', country: '美国', countryCode: 'US', city: '纽约', startDate: '', endDate: '', flag: '🇺🇸', coordinates: [40.7128, -74.0060], isVisited: false },
  { id: 'wishlist-uk', country: '英国', countryCode: 'GB', city: '伦敦', startDate: '', endDate: '', flag: '🇬🇧', coordinates: [51.5074, -0.1278], isVisited: false },
  { id: 'wishlist-france', country: '法国', countryCode: 'FR', city: '巴黎', startDate: '', endDate: '', flag: '🇫🇷', coordinates: [48.8566, 2.3522], isVisited: false },
  { id: 'wishlist-germany', country: '德国', countryCode: 'DE', city: '柏林', startDate: '', endDate: '', flag: '🇩🇪', coordinates: [52.5200, 13.4050], isVisited: false },
  { id: 'wishlist-italy', country: '意大利', countryCode: 'IT', city: '罗马', startDate: '', endDate: '', flag: '🇮🇹', coordinates: [41.9028, 12.4964], isVisited: false },
  { id: 'wishlist-spain', country: '西班牙', countryCode: 'ES', city: '巴塞罗那', startDate: '', endDate: '', flag: '🇪🇸', coordinates: [41.3874, 2.1686], isVisited: false },
  { id: 'wishlist-portugal', country: '葡萄牙', countryCode: 'PT', city: '里斯本', startDate: '', endDate: '', flag: '🇵🇹', coordinates: [38.7223, -9.1393], isVisited: false },
  { id: 'wishlist-netherlands', country: '荷兰', countryCode: 'NL', city: '阿姆斯特丹', startDate: '', endDate: '', flag: '🇳🇱', coordinates: [52.3676, 4.9041], isVisited: false },
  { id: 'wishlist-belgium', country: '比利时', countryCode: 'BE', city: '布鲁塞尔', startDate: '', endDate: '', flag: '🇧🇪', coordinates: [50.8503, 4.3517], isVisited: false },
  { id: 'wishlist-switzerland', country: '瑞士', countryCode: 'CH', city: '苏黎世', startDate: '', endDate: '', flag: '🇨🇭', coordinates: [47.3769, 8.5417], isVisited: false },
  { id: 'wishlist-austria', country: '奥地利', countryCode: 'AT', city: '维也纳', startDate: '', endDate: '', flag: '🇦🇹', coordinates: [48.2082, 16.3738], isVisited: false },
  { id: 'wishlist-greece', country: '希腊', countryCode: 'GR', city: '雅典', startDate: '', endDate: '', flag: '🇬🇷', coordinates: [37.9838, 23.7275], isVisited: false },
  { id: 'wishlist-turkey', country: '土耳其', countryCode: 'TR', city: '伊斯坦布尔', startDate: '', endDate: '', flag: '🇹🇷', coordinates: [41.0082, 28.9784], isVisited: false },
  { id: 'wishlist-egypt', country: '埃及', countryCode: 'EG', city: '开罗', startDate: '', endDate: '', flag: '🇪🇬', coordinates: [30.0444, 31.2357], isVisited: false },
  { id: 'wishlist-morocco', country: '摩洛哥', countryCode: 'MA', city: '马拉喀什', startDate: '', endDate: '', flag: '🇲🇦', coordinates: [31.6295, -7.9811], isVisited: false },
  { id: 'wishlist-southafrica', country: '南非', countryCode: 'ZA', city: '开普敦', startDate: '', endDate: '', flag: '🇿🇦', coordinates: [-33.9249, 18.4241], isVisited: false },
  { id: 'wishlist-kenya', country: '肯尼亚', countryCode: 'KE', city: '内罗毕', startDate: '', endDate: '', flag: '🇰🇪', coordinates: [-1.2921, 36.8219], isVisited: false },
  { id: 'wishlist-tanzania', country: '坦桑尼亚', countryCode: 'TZ', city: '桑给巴尔', startDate: '', endDate: '', flag: '🇹🇿', coordinates: [-6.1659, 39.2026], isVisited: false },
  { id: 'wishlist-ethiopia', country: '埃塞俄比亚', countryCode: 'ET', city: '亚的斯亚贝巴', startDate: '', endDate: '', flag: '🇪🇹', coordinates: [9.0192, 38.7525], isVisited: false },
  { id: 'wishlist-uae', country: '阿联酋', countryCode: 'AE', city: '迪拜', startDate: '', endDate: '', flag: '🇦🇪', coordinates: [25.2048, 55.2708], isVisited: false },
  { id: 'wishlist-jordan', country: '约旦', countryCode: 'JO', city: '佩特拉', startDate: '', endDate: '', flag: '🇯🇴', coordinates: [30.3285, 35.4444], isVisited: false },
  { id: 'wishlist-israel', country: '以色列', countryCode: 'IL', city: '耶路撒冷', startDate: '', endDate: '', flag: '🇮🇱', coordinates: [31.7683, 35.2137], isVisited: false },
  { id: 'wishlist-lebanon', country: '黎巴嫩', countryCode: 'LB', city: '贝鲁特', startDate: '', endDate: '', flag: '🇱🇧', coordinates: [33.8938, 35.5018], isVisited: false },
  { id: 'wishlist-cambodia', country: '柬埔寨', countryCode: 'KH', city: '暹粒', startDate: '', endDate: '', flag: '🇰🇭', coordinates: [13.3671, 103.8448], isVisited: false },
  { id: 'wishlist-philippines', country: '菲律宾', countryCode: 'PH', city: '宿务', startDate: '', endDate: '', flag: '🇵🇭', coordinates: [10.3157, 123.8854], isVisited: false },
  { id: 'wishlist-myanmar', country: '缅甸', countryCode: 'MM', city: '仰光', startDate: '', endDate: '', flag: '🇲🇲', coordinates: [16.8661, 96.1951], isVisited: false },
  { id: 'wishlist-srilanka', country: '斯里兰卡', countryCode: 'LK', city: '科伦坡', startDate: '', endDate: '', flag: '🇱🇰', coordinates: [6.9271, 79.8612], isVisited: false },
  { id: 'wishlist-nepal', country: '尼泊尔', countryCode: 'NP', city: '加德满都', startDate: '', endDate: '', flag: '🇳🇵', coordinates: [27.7172, 85.3240], isVisited: false },
  { id: 'wishlist-bhutan', country: '不丹', countryCode: 'BT', city: '廷布', startDate: '', endDate: '', flag: '🇧🇹', coordinates: [27.4728, 89.6393], isVisited: false },
  { id: 'wishlist-mongolia', country: '蒙古', countryCode: 'MN', city: '乌兰巴托', startDate: '', endDate: '', flag: '🇲🇳', coordinates: [47.8864, 106.9057], isVisited: false },
  { id: 'wishlist-cuba', country: '古巴', countryCode: 'CU', city: '哈瓦那', startDate: '', endDate: '', flag: '🇨🇺', coordinates: [23.1136, -82.3666], isVisited: false },
  { id: 'wishlist-jamaica', country: '牙买加', countryCode: 'JM', city: '金斯敦', startDate: '', endDate: '', flag: '🇯🇲', coordinates: [17.9714, -76.7936], isVisited: false },
  { id: 'wishlist-panama', country: '巴拿马', countryCode: 'PA', city: '巴拿马城', startDate: '', endDate: '', flag: '🇵🇦', coordinates: [8.9824, -79.5199], isVisited: false },
  { id: 'wishlist-costa-rica', country: '哥斯达黎加', countryCode: 'CR', city: '圣何塞', startDate: '', endDate: '', flag: '🇨🇷', coordinates: [9.9281, -84.0907], isVisited: false },
  { id: 'wishlist-colombia', country: '哥伦比亚', countryCode: 'CO', city: '卡塔赫纳', startDate: '', endDate: '', flag: '🇨🇴', coordinates: [10.3910, -75.5144], isVisited: false },
  { id: 'wishlist-peru', country: '秘鲁', countryCode: 'PE', city: '库斯科', startDate: '', endDate: '', flag: '🇵🇪', coordinates: [-13.1631, -72.5450], isVisited: false },
  { id: 'wishlist-chile', country: '智利', countryCode: 'CL', city: '圣地亚哥', startDate: '', endDate: '', flag: '🇨🇱', coordinates: [-33.4489, -70.6693], isVisited: false },
  { id: 'wishlist-argentina', country: '阿根廷', countryCode: 'AR', city: '布宜诺斯艾利斯', startDate: '', endDate: '', flag: '🇦🇷', coordinates: [-34.6037, -58.3816], isVisited: false },
  { id: 'wishlist-brazil', country: '巴西', countryCode: 'BR', city: '里约热内卢', startDate: '', endDate: '', flag: '🇧🇷', coordinates: [-22.9068, -43.1729], isVisited: false },
  { id: 'wishlist-ecuador', country: '厄瓜多尔', countryCode: 'EC', city: '基多', startDate: '', endDate: '', flag: '🇪🇨', coordinates: [-0.1807, -78.4678], isVisited: false },
  { id: 'wishlist-iceland', country: '冰岛', countryCode: 'IS', city: '雷克雅未克', startDate: '', endDate: '', flag: '🇮🇸', coordinates: [64.1466, -21.9426], isVisited: false },
  { id: 'wishlist-norway', country: '挪威', countryCode: 'NO', city: '奥斯陆', startDate: '', endDate: '', flag: '🇳🇴', coordinates: [59.9139, 10.7522], isVisited: false },
  { id: 'wishlist-sweden', country: '瑞典', countryCode: 'SE', city: '斯德哥尔摩', startDate: '', endDate: '', flag: '🇸🇪', coordinates: [59.3293, 18.0686], isVisited: false },
  { id: 'wishlist-denmark', country: '丹麦', countryCode: 'DK', city: '哥本哈根', startDate: '', endDate: '', flag: '🇩🇰', coordinates: [55.6761, 12.5683], isVisited: false },
  { id: 'wishlist-finland', country: '芬兰', countryCode: 'FI', city: '赫尔辛基', startDate: '', endDate: '', flag: '🇫🇮', coordinates: [60.1699, 24.9384], isVisited: false },
  { id: 'wishlist-estonia', country: '爱沙尼亚', countryCode: 'EE', city: '塔林', startDate: '', endDate: '', flag: '🇪🇪', coordinates: [59.4370, 24.7536], isVisited: false },
  { id: 'wishlist-latvia', country: '拉脱维亚', countryCode: 'LV', city: '里加', startDate: '', endDate: '', flag: '🇱🇻', coordinates: [56.9496, 24.1052], isVisited: false },
  { id: 'wishlist-lithuania', country: '立陶宛', countryCode: 'LT', city: '维尔纽斯', startDate: '', endDate: '', flag: '🇱🇹', coordinates: [54.6872, 25.2797], isVisited: false },
  { id: 'wishlist-poland', country: '波兰', countryCode: 'PL', city: '克拉科夫', startDate: '', endDate: '', flag: '🇵🇱', coordinates: [50.0647, 19.9450], isVisited: false },
  { id: 'wishlist-czech', country: '捷克', countryCode: 'CZ', city: '布拉格', startDate: '', endDate: '', flag: '🇨🇿', coordinates: [50.0755, 14.4378], isVisited: false },
  { id: 'wishlist-hungary', country: '匈牙利', countryCode: 'HU', city: '布达佩斯', startDate: '', endDate: '', flag: '🇭🇺', coordinates: [47.4979, 19.0402], isVisited: false },
  { id: 'wishlist-romania', country: '罗马尼亚', countryCode: 'RO', city: '布加勒斯特', startDate: '', endDate: '', flag: '🇷🇴', coordinates: [44.4268, 26.1025], isVisited: false },
  { id: 'wishlist-bulgaria', country: '保加利亚', countryCode: 'BG', city: '索非亚', startDate: '', endDate: '', flag: '🇧🇬', coordinates: [42.6977, 23.3219], isVisited: false },
  { id: 'wishlist-croatia', country: '克罗地亚', countryCode: 'HR', city: '杜布罗夫尼克', startDate: '', endDate: '', flag: '🇭🇷', coordinates: [42.6403, 18.1083], isVisited: false },
  { id: 'wishlist-serbia', country: '塞尔维亚', countryCode: 'RS', city: '贝尔格莱德', startDate: '', endDate: '', flag: '🇷🇸', coordinates: [44.7866, 20.4489], isVisited: false },
  { id: 'wishlist-slovenia', country: '斯洛文尼亚', countryCode: 'SI', city: '布莱德', startDate: '', endDate: '', flag: '🇸🇮', coordinates: [46.3687, 14.1029], isVisited: false },
  { id: 'wishlist-slovakia', country: '斯洛伐克', countryCode: 'SK', city: '布拉迪斯拉发', startDate: '', endDate: '', flag: '🇸🇰', coordinates: [48.1486, 17.1077], isVisited: false },
  { id: 'wishlist-georgia', country: '格鲁吉亚', countryCode: 'GE', city: '第比利斯', startDate: '', endDate: '', flag: '🇬🇪', coordinates: [41.7151, 44.8271], isVisited: false },
  { id: 'wishlist-armenia', country: '亚美尼亚', countryCode: 'AM', city: '埃里温', startDate: '', endDate: '', flag: '🇦🇲', coordinates: [40.1792, 44.4991], isVisited: false },
  { id: 'wishlist-azerbaijan', country: '阿塞拜疆', countryCode: 'AZ', city: '巴库', startDate: '', endDate: '', flag: '🇦🇿', coordinates: [40.4093, 49.8671], isVisited: false },
  { id: 'wishlist-kazakhstan', country: '哈萨克斯坦', countryCode: 'KZ', city: '阿拉木图', startDate: '', endDate: '', flag: '🇰🇿', coordinates: [43.2220, 76.8512], isVisited: false },
  { id: 'wishlist-uzbekistan', country: '乌兹别克斯坦', countryCode: 'UZ', city: '撒马尔罕', startDate: '', endDate: '', flag: '🇺🇿', coordinates: [39.6270, 66.9750], isVisited: false },
  { id: 'wishlist-kyrgyzstan', country: '吉尔吉斯斯坦', countryCode: 'KG', city: '比什凯克', startDate: '', endDate: '', flag: '🇰🇬', coordinates: [42.8746, 74.5698], isVisited: false },
  { id: 'wishlist-tajikistan', country: '塔吉克斯坦', countryCode: 'TJ', city: '杜尚别', startDate: '', endDate: '', flag: '🇹🇯', coordinates: [38.5598, 68.7738], isVisited: false },
  { id: 'wishlist-pakistan', country: '巴基斯坦', countryCode: 'PK', city: '伊斯兰堡', startDate: '', endDate: '', flag: '🇵🇰', coordinates: [33.7294, 73.0931], isVisited: false },
  { id: 'wishlist-bangladesh', country: '孟加拉国', countryCode: 'BD', city: '达卡', startDate: '', endDate: '', flag: '🇧🇩', coordinates: [23.8103, 90.4125], isVisited: false },
  { id: 'wishlist-thailand', country: '泰国', countryCode: 'TH', city: '曼谷', startDate: '', endDate: '', flag: '🇹🇭', coordinates: [13.7563, 100.5018], isVisited: false },
  { id: 'wishlist-laos', country: '老挝', countryCode: 'LA', city: '琅勃拉邦', startDate: '', endDate: '', flag: '🇱🇦', coordinates: [19.8893, 102.1315], isVisited: false },
  { id: 'wishlist-maldives', country: '马尔代夫', countryCode: 'MV', city: '马累', startDate: '', endDate: '', flag: '🇲🇻', coordinates: [4.1755, 73.5093], isVisited: false },
  { id: 'wishlist-mauritius', country: '毛里求斯', countryCode: 'MU', city: '路易港', startDate: '', endDate: '', flag: '🇲🇺', coordinates: [-20.1609, 57.5012], isVisited: false },
  { id: 'wishlist-seychelles', country: '塞舌尔', countryCode: 'SC', city: '维多利亚', startDate: '', endDate: '', flag: '🇸🇨', coordinates: [-4.6796, 55.4920], isVisited: false },
  { id: 'wishlist-madagascar', country: '马达加斯加', countryCode: 'MG', city: '塔那那利佛', startDate: '', endDate: '', flag: '🇲🇬', coordinates: [-18.8792, 47.5079], isVisited: false },
  { id: 'wishlist-zimbabwe', country: '津巴布韦', countryCode: 'ZW', city: '维多利亚瀑布', startDate: '', endDate: '', flag: '🇿🇼', coordinates: [-17.9243, 25.8572], isVisited: false },
  { id: 'wishlist-botswana', country: '博茨瓦纳', countryCode: 'BW', city: '马翁', startDate: '', endDate: '', flag: '🇧🇼', coordinates: [-19.9833, 23.4167], isVisited: false },
  { id: 'wishlist-namibia', country: '纳米比亚', countryCode: 'NA', city: '温得和克', startDate: '', endDate: '', flag: '🇳🇦', coordinates: [-22.5609, 17.0658], isVisited: false },
  { id: 'wishlist-zambia', country: '赞比亚', countryCode: 'ZM', city: '卢萨卡', startDate: '', endDate: '', flag: '🇿🇲', coordinates: [-15.3875, 28.3228], isVisited: false },
  { id: 'wishlist-malawi', country: '马拉维', countryCode: 'MW', city: '利隆圭', startDate: '', endDate: '', flag: '🇲🇼', coordinates: [-13.9626, 33.7741], isVisited: false },
  { id: 'wishlist-mozambique', country: '莫桑比克', countryCode: 'MZ', city: '马普托', startDate: '', endDate: '', flag: '🇲🇿', coordinates: [-25.9692, 32.5732], isVisited: false },
];

export function getWishlistCountryCodes(): string[] {
  return [...new Set(wishlistData.map(entry => entry.countryCode))];
}

export function getWishlistEntryById(id: string): TravelEntry | undefined {
  return wishlistData.find(entry => entry.id === id);
}

export function getWishlistEntriesByCountry(countryCode: string): TravelEntry[] {
  return wishlistData.filter(entry => entry.countryCode === countryCode);
}
