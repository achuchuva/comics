(() => {
  const API_BASE = 'https://antchu.pythonanywhere.com/api/comics';
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

  const STORAGE_KEYS = { LAST_STATE: 'comics:lastState', FAVORITES: 'comics:favorites' };

  function saveLastState() { localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(current)); }
  function loadLastState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      if (raw) { const parsed = JSON.parse(raw); if (parsed.comic && parsed.date) current = parsed; }
    } catch {}
  }
  function getFavorites() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; } catch { return []; } }
  function setFavorites(list) { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list)); }
  function isFavorited(code, date) { return getFavorites().some(f => f.code === code && f.date === date); }
  function toggleFavorite() {
    if (!current.date) return;
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.code === current.comic && f.date === current.date);
    if (idx >= 0) favs.splice(idx,1); else favs.push({ code: current.comic, date: current.date, title: currentData?.title || '', image_url: currentData?.image_url || '' });
    setFavorites(favs); updateStarBtn();
  }
  function updateStarBtn() {
    if (isFavorited(current.comic, current.date)) { starBtn.textContent='★'; starBtn.classList.add('starred'); }
    else { starBtn.textContent='☆'; starBtn.classList.remove('starred'); }
  }
  function populateSelect() {
    comicSelect.innerHTML='';
    SUPPORTED.forEach(c => { const o=document.createElement('option'); o.value=c.code; o.textContent=c.name; comicSelect.appendChild(o); });
  }

  function showLoading(flag){ loadingEl.classList.toggle('hidden', !flag); }
  function showError(msg=''){ if(!msg){ errorEl.classList.add('hidden'); errorEl.textContent=''; return;} errorEl.textContent=msg; errorEl.classList.remove('hidden'); }
  function humanName(code){ return SUPPORTED.find(c=>c.code===code)?.name || code; }
  function renderComic(data){ comicImage.src=data.image_url; comicImage.alt=data.title || `${data.comic} comic`; titleEl.textContent=`${humanName(data.comic)} — ${data.date}`; dateInput.value=data.date; }

  async function fetchComic(code,date){ showLoading(true); showError(); try { const url=`${API_BASE}/${code}?date=${date}`; const resp=await fetch(url,{ headers:{ 'Accept':'application/json' }}); if(!resp.ok) throw new Error(`HTTP ${resp.status}`); const data=await resp.json(); currentData=data; renderComic(data); current.date=data.date; saveLastState(); updateStarBtn(); } catch(e){ showError('Could not load comic. '+e.message);} finally { showLoading(false);} }
  async function fetchRandom(code){ showLoading(true); showError(); try { const url=`${API_BASE}/${code}/random`; const resp=await fetch(url); if(!resp.ok) throw new Error(`HTTP ${resp.status}`); const data=await resp.json(); currentData=data; renderComic(data); current.date=data.date; saveLastState(); updateStarBtn(); } catch(e){ showError('Random fetch failed. '+e.message);} finally { showLoading(false);} }

  function shiftDate(days){ if(!current.date) return; const d=new Date(current.date); d.setDate(d.getDate()+days); const iso=d.toISOString().slice(0,10); fetchComic(current.comic, iso); }

  let isAnimating=false;
  function shiftDateAnimated(days, dir){
    if(!current.date || isAnimating) return;
    isAnimating=true;
    // Ensure no inline transform leftover
    comicImage.style.transition=''; comicImage.style.transform='';
    const outClass = dir==='left' ? 'slide-out-left' : 'slide-out-right';
    const inClass = dir==='left' ? 'slide-in-right' : 'slide-in-left';
    comicImage.classList.remove('slide-in-left','slide-in-right','slide-out-left','slide-out-right');
    comicImage.classList.add(outClass);
    const afterOut=()=>{
      comicImage.removeEventListener('animationend', afterOut);
      const d=new Date(current.date); d.setDate(d.getDate()+days); const iso=d.toISOString().slice(0,10);
      showLoading(true);
      fetchComic(current.comic, iso).then(()=>{
        const applyIn=()=>{ showLoading(false); comicImage.classList.remove('slide-in-left','slide-in-right','slide-out-left','slide-out-right'); comicImage.classList.add(inClass); comicImage.addEventListener('animationend',()=>{ isAnimating=false; }, { once:true }); };
        if(!comicImage.complete) comicImage.addEventListener('load', applyIn, { once:true }); else applyIn();
      }).catch(()=>{ showLoading(false); isAnimating=false; });
    };
    comicImage.addEventListener('animationend', afterOut, { once:true });
  }

  // Pointer + drag swipe logic
  let pointerStart=null, pointerMoved=false, activePointerId=null, lastTapTime=0, dragApplied=false;
  const SWIPE_TRIGGER_PX=110, MAX_DRAG_PX=160;
  function setImageTranslate(x){ comicImage.style.transform=`translateX(${x}px)`; }
  function resetImageTranslate(animated=true){
    if(animated){
      comicImage.style.transition='transform .18s ease';
      requestAnimationFrame(()=> setImageTranslate(0));
      const clear=()=>{ comicImage.style.transition=''; comicImage.removeEventListener('transitionend', clear); };
      comicImage.addEventListener('transitionend', clear, { once:true });
    } else { comicImage.style.transition=''; setImageTranslate(0); }
  }
  function pointerDown(e){
    if(activePointerId!==null || isAnimating) return;
    activePointerId=e.pointerId; dragApplied=false; pointerMoved=false;
    pointerStart={ x:e.clientX, y:e.clientY, target:e.target };
  }
  function pointerMove(e){
    if(e.pointerId!==activePointerId || !pointerStart) return;
    const dx=e.clientX-pointerStart.x, dy=e.clientY-pointerStart.y;
    if(Math.abs(dx)>8 || Math.abs(dy)>8) pointerMoved=true;
    if(!isAnimating && Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>6){
      dragApplied=true;
      const clamped=Math.max(-MAX_DRAG_PX, Math.min(MAX_DRAG_PX, dx));
      setImageTranslate(clamped);
    }
  }
  function pointerUp(e){
    if(e.pointerId!==activePointerId || !pointerStart) return;
    const dx=e.clientX-pointerStart.x, dy=e.clientY-pointerStart.y;
    const absX=Math.abs(dx), absY=Math.abs(dy); const now=Date.now();
    let triggeredSwipe=false;
    if(dragApplied && absX>=SWIPE_TRIGGER_PX && absX>absY){
      triggeredSwipe=true;
      const off = dx<0 ? -window.innerWidth*0.5 : window.innerWidth*0.5;
      comicImage.style.transition='transform .16s ease';
      requestAnimationFrame(()=> setImageTranslate(off));
      comicImage.addEventListener('transitionend', ()=>{
        comicImage.style.transition=''; comicImage.style.transform='';
        if(dx<0) shiftDateAnimated(1,'left'); else shiftDateAnimated(-1,'right');
      }, { once:true });
    } else if(!pointerMoved){
      // tap: only toggle if not starting inside controls (except the image)
      const withinControls = controlsEl.contains(pointerStart.target) && pointerStart.target !== comicImage;
      if(!withinControls){
        if(now-lastTapTime < 300){ /* possible double tap placeholder */ }
        toggleControls(); lastTapTime=now;
      }
    }
    if(!triggeredSwipe) resetImageTranslate(triggeredSwipe);
    pointerStart=null; activePointerId=null; pointerMoved=false; dragApplied=false;
  }
  function pointerCancel(){ pointerStart=null; activePointerId=null; pointerMoved=false; dragApplied=false; resetImageTranslate(false); }
  stageEl.addEventListener('pointerdown', pointerDown, { passive:true });
  stageEl.addEventListener('pointermove', pointerMove, { passive:true });
  stageEl.addEventListener('pointerup', pointerUp, { passive:true });
  stageEl.addEventListener('pointercancel', pointerCancel, { passive:true });

  stageEl.addEventListener('click', e => { if(e.target===comicImage) toggleControls(); });
  function toggleControls(force){ if(typeof force==='boolean') controlsVisible=force; else controlsVisible=!controlsVisible; controlsEl.classList.toggle('hidden', !controlsVisible); }
  function openFavorites(){ buildFavoritesList(); favoritesPanel.classList.remove('hidden'); }
  function closeFavoritesPanel(){ favoritesPanel.classList.add('hidden'); }
  function buildFavoritesList(){
    const favs=getFavorites(); favoritesList.innerHTML='';
    if(!favs.length){ favoritesList.innerHTML='<p style="grid-column:1/-1;opacity:.7;">No favorites yet.</p>'; return; }
    favs.slice().reverse().forEach(f=>{ const div=document.createElement('div'); div.className='favorite-item'; const img=document.createElement('img'); img.loading='lazy'; img.decoding='async'; img.src=f.image_url; img.alt=f.title||f.code; const meta=document.createElement('div'); meta.className='favorite-meta'; meta.textContent=`${humanName(f.code)}\n${f.date}`; div.appendChild(img); div.appendChild(meta); div.addEventListener('click', ()=>{ current.comic=f.code; comicSelect.value=f.code; fetchComic(f.code, f.date); closeFavoritesPanel(); }); favoritesList.appendChild(div); });
  }

  // Events
  comicSelect.addEventListener('change', ()=>{ current.comic=comicSelect.value; if(current.date) fetchComic(current.comic, current.date); else fetchRandom(current.comic); saveLastState(); });
  dateInput.addEventListener('change', ()=>{ if(dateInput.value) fetchComic(current.comic, dateInput.value); });
  randomBtn.addEventListener('click', ()=> fetchRandom(current.comic));
  prevBtn.addEventListener('click', ()=> shiftDateAnimated(-1,'right'));
  nextBtn.addEventListener('click', ()=> shiftDateAnimated(1,'left'));
  starBtn.addEventListener('click', toggleFavorite);
  favoritesBtn.addEventListener('click', openFavorites);
  closeFavorites.addEventListener('click', closeFavoritesPanel);
  window.addEventListener('keydown', e => { if(e.key==='ArrowLeft') shiftDateAnimated(-1,'right'); else if(e.key==='ArrowRight') shiftDateAnimated(1,'left'); else if(e.key==='f') toggleFavorite(); });

  function init(){
    populateSelect(); loadLastState(); comicSelect.value=current.comic;
    if(current.date) fetchComic(current.comic, current.date); else fetchRandom(current.comic);
    updateStarBtn();
  }
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) saveLastState(); });
  window.addEventListener('beforeunload', saveLastState);
  init();
})();
