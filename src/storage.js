const STORAGE_KEYS = { LAST_STATE: 'comics:lastState', FAVORITES: 'comics:favorites' };

export function loadLastState(defaultComic) {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.comic) return parsed;
        }
    } catch {}
    return { comic: defaultComic, date: null };
}

export function saveLastState(state) {
    try { localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify({ comic: state.comic, date: state.date })); } catch {}
}

export function getFavorites() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; } catch { return []; }
}

export function setFavorites(list) {
    try { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list)); } catch {}
}

export function isFavorited(code, date) {
    return getFavorites().some(f => f.code === code && f.date === date);
}