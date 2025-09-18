export const API_BASE = 'https://antchu.pythonanywhere.com/api/comics';

export async function fetchComic(code, date) {
    const url = `${API_BASE}/${code}?date=${date}`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

export async function fetchRandomComic(code) {
    const url = `${API_BASE}/${code}/random`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}