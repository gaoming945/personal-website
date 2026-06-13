function pageShell({ title, body, script = '' }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; --bg:#061113; --panel:#0b1b1f; --panel2:#0e252a; --line:#1f4b52; --text:#e7fbf4; --muted:#8db1ad; --accent:#68f5b2; --danger:#ff7777; }
    * { box-sizing: border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at 20% 0%, rgba(104,245,178,.12), transparent 26rem), var(--bg); color:var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color:inherit; }
    button, input, textarea, select { font:inherit; }
    .login { min-height:100vh; display:grid; place-items:center; padding:24px; }
    .login-card, .admin-card, .editor, .table-wrap { background:rgba(11,27,31,.86); border:1px solid var(--line); box-shadow:0 24px 80px rgba(0,0,0,.28); border-radius:8px; }
    .login-card { width:min(420px,100%); padding:28px; }
    .eyebrow { margin:0 0 8px; color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:12px; font-weight:700; }
    h1 { margin:0 0 8px; font-size:28px; }
    p { color:var(--muted); line-height:1.7; }
    label { display:grid; gap:8px; color:var(--muted); font-size:13px; font-weight:700; }
    input, textarea, select { width:100%; border:1px solid var(--line); background:#071418; color:var(--text); border-radius:6px; padding:11px 12px; outline:none; }
    textarea { min-height:90px; resize:vertical; }
    input:focus, textarea:focus, select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(104,245,178,.12); }
    button { border:1px solid rgba(104,245,178,.38); background:linear-gradient(135deg, rgba(104,245,178,.18), rgba(42,177,181,.16)); color:var(--text); border-radius:6px; padding:10px 13px; cursor:pointer; font-weight:800; }
    button:hover { border-color:var(--accent); }
    button.danger { border-color:rgba(255,119,119,.44); background:rgba(255,119,119,.12); }
    button.ghost { background:transparent; }
    .form-stack { display:grid; gap:16px; }
    .error { color:var(--danger); min-height:22px; }
    .topbar { position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 24px; background:rgba(6,17,19,.9); border-bottom:1px solid var(--line); backdrop-filter:blur(12px); }
    .brand strong { display:block; }
    .brand span { color:var(--muted); font-size:12px; }
    .layout { display:grid; grid-template-columns:240px minmax(0,1fr); min-height:calc(100vh - 68px); }
    .sidebar { border-right:1px solid var(--line); padding:18px; background:rgba(7,20,24,.42); }
    .nav-btn { width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:transparent; color:var(--muted); }
    .nav-btn.is-active { color:var(--text); border-color:var(--accent); background:rgba(104,245,178,.12); }
    .content { padding:22px; display:grid; gap:18px; align-content:start; }
    .admin-card { padding:18px; }
    .stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
    .stat strong { display:block; font-size:28px; }
    .toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    .editor { padding:18px; display:none; }
    .editor.is-open { display:block; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
    .grid .full { grid-column:1/-1; }
    .table-wrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; min-width:780px; }
    th, td { padding:12px; border-bottom:1px solid rgba(31,75,82,.72); text-align:left; vertical-align:top; }
    th { color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
    td { color:var(--text); }
    .muted { color:var(--muted); }
    .actions { display:flex; gap:8px; flex-wrap:wrap; }
    .upload-row { display:flex; gap:10px; align-items:center; }
    .upload-row input { padding:9px; }
    .helper-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .helper-row button { padding:7px 10px; font-size:12px; color:var(--muted); background:rgba(104,245,178,.08); }
    .field-hint { color:var(--muted); font-size:12px; font-weight:500; }
    .pill { display:inline-flex; padding:3px 8px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font-size:12px; margin:2px; }
    @media (max-width: 860px) { .layout { grid-template-columns:1fr; } .sidebar { border-right:0; border-bottom:1px solid var(--line); display:flex; gap:10px; overflow:auto; } .nav-btn { min-width:120px; } .stats, .grid { grid-template-columns:1fr; } .content { padding:16px; } }
  </style>
</head>
<body>${body}<script>${script}</script></body>
</html>`;
}

export function renderLoginPage() {
  return pageShell({
    title: '后台登录',
    body: `<main class="login">
  <section class="login-card">
    <p class="eyebrow">Admin</p>
    <h1>个人网站后台</h1>
    <p>登录后管理旅行、项目和健身内容。</p>
    <form class="form-stack" id="login-form">
      <label>账号<input name="username" autocomplete="username" required></label>
      <label>密码<input name="password" type="password" autocomplete="current-password" required></label>
      <button type="submit">登录</button>
      <div class="error" id="error"></div>
    </form>
  </section>
</main>`,
    script: `
const form = document.getElementById('login-form');
const error = document.getElementById('error');
form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  const payload = Object.fromEntries(new FormData(form).entries());
  const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { error.textContent = data.error || '登录失败'; return; }
  window.location.href = '/admin';
});`,
  });
}

export function renderAdminPage() {
  return pageShell({
    title: '个人网站后台',
    body: `<header class="topbar">
  <div class="brand"><strong>个人网站后台</strong><span>前台展示 + 后台管理</span></div>
  <div class="actions"><a href="/" target="_blank"><button class="ghost" type="button">打开前台</button></a><button id="logout" type="button">退出登录</button></div>
</header>
<main class="layout">
  <aside class="sidebar">
    <button class="nav-btn is-active" data-tab="travel" type="button">环球旅行 <span data-count="travel">0</span></button>
    <button class="nav-btn" data-tab="projects" type="button">项目 <span data-count="projects">0</span></button>
    <button class="nav-btn" data-tab="fitness" type="button">健身 <span data-count="fitness">0</span></button>
  </aside>
  <section class="content">
    <div class="stats">
      <div class="admin-card stat"><span class="muted">旅行</span><strong data-count="travel">0</strong></div>
      <div class="admin-card stat"><span class="muted">项目</span><strong data-count="projects">0</strong></div>
      <div class="admin-card stat"><span class="muted">健身</span><strong data-count="fitness">0</strong></div>
    </div>
    <div class="admin-card toolbar">
      <div><p class="eyebrow" id="section-kicker">Travel</p><h1 id="section-title">环球旅行管理</h1></div>
      <button id="new-item" type="button">新增</button>
    </div>
    <form class="editor" id="editor"></form>
    <div class="table-wrap"><table><thead id="thead"></thead><tbody id="tbody"></tbody></table></div>
  </section>
</main>`,
    script: adminScript(),
  });
}

function adminScript() {
  return `
const state = { tab:'travel', data:{ travel:[], projects:[], fitness:[] }, editing:null };
const labels = {
  travel: { title:'环球旅行管理', kicker:'Travel', columns:['国家/城市','日期','展示','排序','操作'] },
  projects: { title:'项目管理', kicker:'Projects', columns:['项目','技术栈','展示','排序','操作'] },
  fitness: { title:'健身管理', kicker:'Fitness', columns:['标题','分类/日期','展示','排序','操作'] },
};
const projectPresets = {
  'mobile game': { kicker:'移动端游戏', status:'已发布', techStack:'Kotlin, Jetpack Compose, Android' },
  game: { kicker:'玩法原型', status:'可试玩', techStack:'TypeScript, Cocos Creator, Gameplay' },
  data: { kicker:'数据工具', status:'在线运行', techStack:'Python, Streamlit, Finance' },
  web: { kicker:'Web 应用', status:'在线运行', techStack:'TypeScript, Astro, Docker' },
  ai: { kicker:'AI 工具', status:'内测', techStack:'Node.js, LongCat, OpenAI Compatible API' },
};
const fitnessCategories = ['增肌', '减脂', '体态', '饮食', '训练', '恢复'];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const api = async (url, options={}) => {
  const res = await fetch(url, { ...options, headers:{ ...(options.headers || {}) } });
  if (res.status === 401) { window.location.href = '/admin/login'; return null; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
};
async function load() {
  const data = await api('/api/admin/content');
  if (!data) return;
  state.data = data;
  render();
}
function currentList() { return state.data[state.tab] || []; }
function render() {
  document.querySelectorAll('[data-count]').forEach(el => { const key = el.dataset.count; el.textContent = String((state.data[key] || []).length); });
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === state.tab));
  document.getElementById('section-title').textContent = labels[state.tab].title;
  document.getElementById('section-kicker').textContent = labels[state.tab].kicker;
  document.getElementById('thead').innerHTML = '<tr>' + labels[state.tab].columns.map(col => '<th>' + col + '</th>').join('') + '</tr>';
  document.getElementById('tbody').innerHTML = currentList().sort((a,b)=>(a.order||0)-(b.order||0)).map(rowTemplate).join('');
  bindTableActions();
}
function rowTemplate(item) {
  if (state.tab === 'travel') {
    return '<tr><td><strong>'+escapeHtml(item.country)+' / '+escapeHtml(item.city)+'</strong><br><span class="muted">'+escapeHtml(item.countryCode)+' '+escapeHtml(item.flag)+'</span></td><td>'+escapeHtml(item.startDate || '-')+'</td><td>'+visiblePill(item.visible)+'</td><td>'+escapeHtml(item.order)+'</td>'+actions(item.id)+'</tr>';
  }
  if (state.tab === 'projects') {
    return '<tr><td><strong>'+escapeHtml(item.name)+'</strong><br><span class="muted">'+escapeHtml(item.summary)+'</span></td><td>'+((item.techStack||[]).map(tag => '<span class="pill">'+escapeHtml(tag)+'</span>').join(''))+'</td><td>'+visiblePill(item.visible)+'</td><td>'+escapeHtml(item.order)+'</td>'+actions(item.id)+'</tr>';
  }
  return '<tr><td><strong>'+escapeHtml(item.title)+'</strong><br><span class="muted">'+escapeHtml(item.description)+'</span></td><td>'+escapeHtml(item.category)+'<br><span class="muted">'+escapeHtml(item.date || '-')+'</span></td><td>'+visiblePill(item.visible)+'</td><td>'+escapeHtml(item.order)+'</td>'+actions(item.id)+'</tr>';
}
function visiblePill(value) { return value ? '<span class="pill">展示</span>' : '<span class="pill">隐藏</span>'; }
function actions(id) { return '<td><div class="actions"><button data-edit="'+escapeHtml(id)+'" type="button">编辑</button><button class="danger" data-delete="'+escapeHtml(id)+'" type="button">删除</button></div></td>'; }
function bindTableActions() {
  document.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openEditor(currentList().find(item => item.id === btn.dataset.edit))));
  document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('确认删除？这个操作不能撤销。')) return;
    await api('/api/admin/content/' + state.tab + '/' + encodeURIComponent(btn.dataset.delete), { method:'DELETE' });
    await load();
  }));
}
function uploadField(name, value='') {
  return '<div class="full"><label>'+name+'<input name="'+name+'" value="'+escapeHtml(value)+'" placeholder="/uploads/xxx 或 https://..."></label><div class="upload-row"><input type="file" accept="image/*" data-upload-for="'+name+'"><button type="button" data-upload-button="'+name+'">上传图片</button></div></div>';
}
function allTravelPresets() {
  return [...(state.data.travel || []), ...(state.data.wishlist || [])];
}
function countryPresets() {
  const map = new Map();
  for (const item of allTravelPresets()) {
    if (!item.country) continue;
    const current = map.get(item.country);
    if (!current || item.isVisited) map.set(item.country, item);
  }
  return Array.from(map.values()).sort((a, b) => String(a.country).localeCompare(String(b.country), 'zh-CN'));
}
function cityPresets(country = '') {
  return allTravelPresets()
    .filter(item => !country || item.country === country || item.countryCode === country)
    .sort((a, b) => String(a.city).localeCompare(String(b.city), 'zh-CN'));
}
function uniqueOptions(items, getter, labelGetter) {
  const seen = new Set();
  return items
    .map(item => ({ value: getter(item), label: labelGetter(item) }))
    .filter(option => {
      if (!option.value || seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
}
function presetDatalists() {
  const countries = countryPresets()
    .map(item => '<option value="'+escapeHtml(item.country)+'" label="'+escapeHtml([item.flag, item.countryCode, item.city].filter(Boolean).join(' '))+'"></option>')
    .join('');
  const cities = cityPresets()
    .map(item => '<option value="'+escapeHtml(item.city)+'" label="'+escapeHtml([item.country, item.countryCode].filter(Boolean).join(' '))+'"></option>')
    .join('');
  const countryCodes = uniqueOptions(allTravelPresets(), item => item.countryCode, item => [item.flag, item.country, item.city].filter(Boolean).join(' '))
    .map(item => '<option value="'+escapeHtml(item.value)+'" label="'+escapeHtml(item.label)+'"></option>')
    .join('');
  const flags = uniqueOptions(allTravelPresets(), item => item.flag, item => [item.country, item.countryCode, item.city].filter(Boolean).join(' '))
    .map(item => '<option value="'+escapeHtml(item.value)+'" label="'+escapeHtml(item.label)+'"></option>')
    .join('');
  const categories = Object.keys(projectPresets).map(value => '<option value="'+escapeHtml(value)+'"></option>').join('');
  return '<datalist id="country-options">'+countries+'</datalist><datalist id="city-options">'+cities+'</datalist><datalist id="country-code-options">'+countryCodes+'</datalist><datalist id="flag-options">'+flags+'</datalist><datalist id="project-category-options">'+categories+'</datalist>';
}
function openEditor(item={}) {
  state.editing = item;
  const editor = document.getElementById('editor');
  editor.classList.add('is-open');
  editor.innerHTML = presetDatalists() + formTemplate(item) + '<div class="actions full"><button type="submit">保存</button><button class="ghost" type="button" id="cancel-edit">取消</button></div><p class="error" id="form-error"></p>';
  document.getElementById('cancel-edit').addEventListener('click', () => editor.classList.remove('is-open'));
  editor.querySelectorAll('[data-upload-button]').forEach(button => button.addEventListener('click', () => uploadImage(button.dataset.uploadButton)));
  bindEditorConvenience(editor);
  editor.onsubmit = saveEditor;
  window.scrollTo({ top: editor.offsetTop - 90, behavior:'smooth' });
}
function commonFields(item) {
  return '<label>ID<input name="id" value="'+escapeHtml(item.id || '')+'" placeholder="留空自动生成"></label><label>排序<input name="order" type="number" value="'+escapeHtml(item.order ?? 100)+'"></label><label>是否展示<select name="visible"><option value="true" '+(item.visible !== false ? 'selected' : '')+'>展示</option><option value="false" '+(item.visible === false ? 'selected' : '')+'>隐藏</option></select></label>';
}
function formTemplate(item) {
  if (state.tab === 'travel') return '<div class="grid">'+commonFields(item)+'<label>国家<input name="country" list="country-options" required value="'+escapeHtml(item.country || '')+'" placeholder="下拉选择，也可输入模糊搜索"></label><label>城市<input name="city" list="city-options" required value="'+escapeHtml(item.city || '')+'" placeholder="下拉选择城市，自动联动坐标"></label><label>国家代码<input name="countryCode" list="country-code-options" maxlength="4" value="'+escapeHtml(item.countryCode || '')+'" placeholder="例如 JP / CN / GB"></label><label>旗帜<input name="flag" list="flag-options" value="'+escapeHtml(item.flag || '')+'" placeholder="选择国旗"></label><div class="full helper-row"><span class="field-hint">国家、城市、国家代码、旗帜都是下拉候选；选任意一个会自动联动其它字段，之后仍可手动微调。</span></div><label>去过时间<input name="startDate" type="date" value="'+escapeHtml(item.startDate || '')+'"></label><label>结束时间<input name="endDate" type="date" value="'+escapeHtml(item.endDate || item.startDate || '')+'"></label><label>纬度<input name="lat" type="number" step="0.0001" value="'+escapeHtml(item.coordinates?.[0] ?? 0)+'"></label><label>经度<input name="lng" type="number" step="0.0001" value="'+escapeHtml(item.coordinates?.[1] ?? 0)+'"></label><label class="full">简介<textarea name="story">'+escapeHtml(item.story || '')+'</textarea></label>'+uploadField('coverImage', item.coverImage || '')+'<label class="full">照片列表 JSON<textarea name="photos">'+escapeHtml(JSON.stringify(item.photos || [], null, 2))+'</textarea></label></div>';
  if (state.tab === 'projects') return '<div class="grid">'+commonFields(item)+'<label>项目名称<input name="name" required value="'+escapeHtml(item.name || '')+'"></label><label>分类<input name="category" list="project-category-options" value="'+escapeHtml(item.category || '')+'" placeholder="mobile game / game / data / web / ai"></label><div class="full helper-row"><button type="button" data-fill-project>按分类填充标签、状态、技术栈</button><span class="field-hint">已有内容不会被强制覆盖，只在空字段里补默认值。</span></div><label>标签<input name="kicker" value="'+escapeHtml(item.kicker || '')+'"></label><label>状态<input name="status" value="'+escapeHtml(item.status || '')+'"></label><label class="full">项目简介<textarea name="summary">'+escapeHtml(item.summary || '')+'</textarea></label><label class="full">技术栈，逗号分隔<input name="techStack" value="'+escapeHtml((item.techStack || []).join(', '))+'"></label>'+uploadField('coverImage', item.coverImage || '')+'<label>GitHub 地址<input name="githubUrl" value="'+escapeHtml(item.githubUrl || '')+'"></label><label>项目链接<input name="projectUrl" value="'+escapeHtml(item.projectUrl || '')+'"></label><label>分发名称<input name="distributionName" value="'+escapeHtml(item.distributionName || '')+'"></label>'+uploadField('distributionImage', item.distributionImage || '')+'</div>';
  const categoryOptions = fitnessCategories.map(category => '<option value="'+escapeHtml(category)+'" '+(item.category === category ? 'selected' : '')+'>'+escapeHtml(category)+'</option>').join('');
  return '<div class="grid">'+commonFields(item)+'<label>标题<input name="title" required value="'+escapeHtml(item.title || '')+'"></label><label>日期<input name="date" type="date" value="'+escapeHtml(item.date || '')+'"></label><label>分类<select name="category"><option value="">选择分类</option>'+categoryOptions+'</select></label><label class="full">描述<textarea name="description">'+escapeHtml(item.description || '')+'</textarea></label>'+uploadField('image', item.image || '')+'</div>';
}
function findCountryPreset(value) {
  const query = String(value || '').trim().toLowerCase();
  if (!query) return null;
  return countryPresets().find(item => [item.country, item.countryCode, item.flag].some(part => String(part || '').toLowerCase() === query))
    || countryPresets().find(item => [item.country, item.countryCode, item.city].some(part => String(part || '').toLowerCase().includes(query)))
    || null;
}
function findTravelPreset(value, fields = ['country', 'city', 'countryCode', 'flag']) {
  const query = String(value || '').trim().toLowerCase();
  if (!query) return null;
  const entries = allTravelPresets();
  return entries.find(item => fields.some(field => String(item[field] || '').toLowerCase() === query))
    || entries.find(item => fields.some(field => String(item[field] || '').toLowerCase().includes(query)))
    || null;
}
function findCityPreset(city, country='') {
  const cityQuery = String(city || '').trim().toLowerCase();
  const countryQuery = String(country || '').trim().toLowerCase();
  if (!cityQuery) return null;
  return cityPresets().find(item => {
    const cityMatched = String(item.city || '').toLowerCase() === cityQuery || String(item.city || '').toLowerCase().includes(cityQuery);
    const countryMatched = !countryQuery || String(item.country || '').toLowerCase() === countryQuery || String(item.countryCode || '').toLowerCase() === countryQuery;
    return cityMatched && countryMatched;
  }) || null;
}
function setField(form, name, value, { overwrite = true } = {}) {
  const input = form.querySelector('[name="'+name+'"]');
  if (input && (overwrite || !input.value) && value !== undefined && value !== null) input.value = value;
}
function refreshCityOptions(editor, country) {
  const datalist = editor.querySelector('#city-options');
  if (!datalist) return;
  datalist.innerHTML = cityPresets(country)
    .map(item => '<option value="'+escapeHtml(item.city)+'" label="'+escapeHtml([item.country, item.countryCode].filter(Boolean).join(' '))+'"></option>')
    .join('');
}
function applyTravelPreset(editor, preset, { overwriteCity = true } = {}) {
  if (!preset) return;
  setField(editor, 'country', preset.country);
  setField(editor, 'countryCode', preset.countryCode);
  setField(editor, 'flag', preset.flag);
  if (overwriteCity) setField(editor, 'city', preset.city);
  setField(editor, 'lat', preset.coordinates?.[0] ?? 0);
  setField(editor, 'lng', preset.coordinates?.[1] ?? 0);
  refreshCityOptions(editor, preset.country);
}
function bindEditorConvenience(editor) {
  if (state.tab === 'travel') {
    const countryInput = editor.querySelector('[name="country"]');
    const cityInput = editor.querySelector('[name="city"]');
    const codeInput = editor.querySelector('[name="countryCode"]');
    const flagInput = editor.querySelector('[name="flag"]');
    const fillCountry = () => {
      const preset = findCountryPreset(countryInput?.value);
      applyTravelPreset(editor, preset);
    };
    const fillCity = () => {
      const preset = findCityPreset(cityInput?.value, countryInput?.value);
      applyTravelPreset(editor, preset);
    };
    const fillCode = () => {
      const preset = findTravelPreset(codeInput?.value, ['countryCode']);
      applyTravelPreset(editor, preset);
    };
    const fillFlag = () => {
      const preset = findTravelPreset(flagInput?.value, ['flag']);
      applyTravelPreset(editor, preset);
    };
    countryInput?.addEventListener('input', () => refreshCityOptions(editor, countryInput.value));
    countryInput?.addEventListener('change', fillCountry);
    cityInput?.addEventListener('change', fillCity);
    codeInput?.addEventListener('change', fillCode);
    flagInput?.addEventListener('change', fillFlag);
    refreshCityOptions(editor, countryInput?.value || '');
  }
  if (state.tab === 'projects') {
    const fillProject = () => {
      const category = editor.querySelector('[name="category"]')?.value;
      const preset = projectPresets[category];
      if (!preset) return;
      setField(editor, 'kicker', preset.kicker, { overwrite: false });
      setField(editor, 'status', preset.status, { overwrite: false });
      setField(editor, 'techStack', preset.techStack, { overwrite: false });
    };
    editor.querySelector('[name="category"]')?.addEventListener('change', fillProject);
    editor.querySelector('[data-fill-project]')?.addEventListener('click', fillProject);
  }
}
async function uploadImage(name) {
  const input = document.querySelector('[data-upload-for="'+name+'"]');
  const file = input?.files?.[0];
  if (!file) return alert('请选择图片');
  const body = new FormData();
  body.append('file', file);
  const data = await api('/api/admin/upload', { method:'POST', body });
  document.querySelector('[name="'+name+'"]').value = data.url;
}
async function saveEditor(event) {
  event.preventDefault();
  const error = document.getElementById('form-error');
  error.textContent = '';
  try {
    const fd = new FormData(event.currentTarget);
    const obj = Object.fromEntries(fd.entries());
    obj.visible = obj.visible === 'true';
    obj.order = Number(obj.order || 100);
    if (state.tab === 'travel') {
      obj.coordinates = [Number(obj.lat || 0), Number(obj.lng || 0)];
      try { obj.photos = JSON.parse(obj.photos || '[]'); } catch { throw new Error('照片列表 JSON 格式不对'); }
    }
    if (state.tab === 'projects') obj.techStack = String(obj.techStack || '').split(',').map(s => s.trim()).filter(Boolean);
    await api('/api/admin/content/' + state.tab, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj) });
    document.getElementById('editor').classList.remove('is-open');
    await load();
  } catch (err) {
    error.textContent = err.message || '保存失败';
  }
}
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.tab; document.getElementById('editor').classList.remove('is-open'); render(); }));
document.getElementById('new-item').addEventListener('click', () => openEditor({ visible:true, order: currentList().length + 1 }));
document.getElementById('logout').addEventListener('click', async () => { await fetch('/api/admin/logout', { method:'POST' }); window.location.href = '/admin/login'; });
load();`;
}
