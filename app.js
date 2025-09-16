(() => {
  const API_BASE = 'https://antchu.pythonanywhere.com/api/comics'; // Adjust if needed
  const SUPPORTED = [
    { name: 'Garfield', code: 'garfield' },
    { name: 'Pearls Before Swine', code: 'pearlsbeforeswine' },
    { name: 'Calvin and Hobbes', code: 'calvinandhobbes' }
  ];

  // DOM refs
  const comicSelect = document.getElementById('comicSelect');
  const dateInput = document.getElementById('dateInput');
  const randomBtn = document.getElementById('randomBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const starBtn = document.getElementById('starBtn');
  const favoritesBtn = document.getElementById('favoritesBtn');
  const comicImage = document.getElementById('comicImage');
  const titleEl = document.getElementById('title');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const controlsEl = document.getElementById('controls');
  const stageEl = document.getElementById('comicStage');
  const favoritesPanel = document.getElementById('favoritesPanel');
  const favoritesList = document.getElementById('favoritesList');
  const closeFavorites = document.getElementById('closeFavorites');

  // State
  let current = { comic: SUPPORTED[0].code, date: null };
  let currentData = null;
  let controlsVisible = true;

  const STORAGE_KEYS = {
    LAST_STATE: 'comics:lastState',
    FAVORITES: 'comics:favorites'
  };

  function saveLastState() {
    localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(current));
  }

  function loadLastState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.comic && parsed.date) current = parsed;
      }
    } catch {}
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch { return []; }
  }

  function setFavorites(list) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
  }

  function isFavorited(code, date) {
    return getFavorites().some(f => f.code === code && f.date === date);
  }

  function toggleFavorite() {
    if (!current.date) return;
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.code === current.comic && f.date === current.date);
    if (idx >= 0) {
      favs.splice(idx,1);
    } else {
      favs.push({ code: current.comic, date: current.date, title: currentData?.title || '', image_url: currentData?.image_url || '' });
    }
    setFavorites(favs);
    updateStarBtn();
  }

  function updateStarBtn() {
    if (isFavorited(current.comic, current.date)) {
      starBtn.textContent = '★';
      starBtn.classList.add('starred');
    } else {
      starBtn.textContent = '☆';
      starBtn.classList.remove('starred');
    }
  }

  function populateSelect() {
    comicSelect.innerHTML = '';
    SUPPORTED.forEach(c => {
      const option = document.createElement('option');
      option.value = c.code; option.textContent = c.name; comicSelect.appendChild(option);
    });
  }

  async function fetchComic(code, date) {
    showLoading(true); showError();
    try {
      const url = `${API_BASE}/${code}?date=${date}`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      currentData = data;
      renderComic(data);
      current.date = data.date;
      saveLastState();
      updateStarBtn();
    } catch (e) {
      showError('Could not load comic. ' + e.message);
    } finally {
      showLoading(false);
    }
  }

  async function fetchRandom(code) {
    showLoading(true); showError();
    try {
      const url = `${API_BASE}/${code}/random`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      currentData = data;
      renderComic(data);
      current.date = data.date;
      saveLastState();
      updateStarBtn();
    } catch (e) {
      showError('Random fetch failed. ' + e.message);
    } finally { showLoading(false); }
  }

  function renderComic(data) {
    comicImage.src = data.image_url;
    comicImage.alt = data.title || `${data.comic} comic`;
    titleEl.textContent = `${humanName(data.comic)} — ${data.date}`;
    dateInput.value = data.date;
  }

  function humanName(code) {
    return SUPPORTED.find(c => c.code === code)?.name || code;
  }

  function showLoading(flag) {
    loadingEl.classList.toggle('hidden', !flag);
  }

  function showError(msg='') {
    if (!msg) { errorEl.classList.add('hidden'); errorEl.textContent=''; return; }
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  function shiftDate(days) {
    if (!current.date) return;
    const d = new Date(current.date);
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().slice(0,10);
    fetchComic(current.comic, iso);
  }

  // Gesture handling
  let touchStartX = null; let touchStartY = null; let touchMoved = false;
  stageEl.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY; touchMoved = false;
  }, { passive:true });
  stageEl.addEventListener('touchmove', e => { if (touchStartX!==null) touchMoved = true; }, { passive:true });
  stageEl.addEventListener('touchend', e => {
    if (touchStartX===null) return;
    const dx = (e.changedTouches[0].clientX - touchStartX);
    const dy = (e.changedTouches[0].clientY - touchStartY);
    const absX = Math.abs(dx), absY = Math.abs(dy);
    if (absX > 40 && absX > absY) {
      if (dx < 0) shiftDate(1); else shiftDate(-1);
    } else if (!touchMoved) {
      toggleControls();
    }
    touchStartX = touchStartY = null; touchMoved=false;
  });

  // Pointer (desktop) single click toggles controls
  stageEl.addEventListener('click', e => {
    if (e.target === comicImage) toggleControls();
  });

  function toggleControls(force) {
    if (typeof force === 'boolean') controlsVisible = force; else controlsVisible = !controlsVisible;
    controlsEl.classList.toggle('hidden', !controlsVisible);
  }

  function openFavorites() {
    buildFavoritesList();
    favoritesPanel.classList.remove('hidden');
  }
  function closeFavoritesPanel() { favoritesPanel.classList.add('hidden'); }

  function buildFavoritesList() {
    const favs = getFavorites();
    favoritesList.innerHTML = '';
    if (!favs.length) { favoritesList.innerHTML = '<p style="grid-column:1/-1;opacity:.7;">No favorites yet.</p>'; return; }
    favs.slice().reverse().forEach(f => {
      const div = document.createElement('div');
      div.className = 'favorite-item';
      const img = document.createElement('img');
      img.loading='lazy'; img.decoding='async';
      img.src = f.image_url; img.alt = f.title || f.code;
      const meta = document.createElement('div'); meta.className='favorite-meta';
      meta.textContent = `${humanName(f.code)}\n${f.date}`;
      div.appendChild(img); div.appendChild(meta);
      div.addEventListener('click', () => {
        current.comic = f.code; comicSelect.value = f.code; fetchComic(f.code, f.date); closeFavoritesPanel();
      });
      favoritesList.appendChild(div);
    });
  }

  // Event bindings
  comicSelect.addEventListener('change', () => {
    current.comic = comicSelect.value; // keep date; reload current date if any
    if (current.date) fetchComic(current.comic, current.date); else fetchRandom(current.comic);
    saveLastState();
  });

  dateInput.addEventListener('change', () => {
    if (dateInput.value) fetchComic(current.comic, dateInput.value);
  });

  randomBtn.addEventListener('click', () => fetchRandom(current.comic));
  prevBtn.addEventListener('click', () => shiftDate(-1));
  nextBtn.addEventListener('click', () => shiftDate(1));
  starBtn.addEventListener('click', toggleFavorite);
  favoritesBtn.addEventListener('click', openFavorites);
  closeFavorites.addEventListener('click', closeFavoritesPanel);

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') shiftDate(-1); else if (e.key === 'ArrowRight') shiftDate(1); else if (e.key === 'f') toggleFavorite();
  });

  // Init
  function init() {
    populateSelect();
    loadLastState();
    comicSelect.value = current.comic;
    if (current.date) {
      fetchComic(current.comic, current.date);
    } else {
      fetchRandom(current.comic);
    }
    updateStarBtn();
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) saveLastState(); });
  window.addEventListener('beforeunload', saveLastState);

  init();
})();
