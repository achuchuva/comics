import React, { useState, useEffect } from 'react';
import { fetchComic, fetchRandomComic } from './api.js';
import * as storage from './storage.js';
import { StarredComics } from './StarredComics.jsx';

const comicCodes = [
    { name: 'Garfield', code: 'garfield' },
    { name: 'Calvin and Hobbes', code: 'calvinandhobbes' },
    { name: 'Pearls Before Swine', code: 'pearlsbeforeswine' },
    { name: 'Peanuts', code: 'peanuts' },
    { name: 'Dilbert', code: 'dilbert' },
    { name: 'The Far Side', code: 'thefarside' },
]

export function App() {
    const [date, setDate] = useState(new Date(storage.loadLastState().date) || new Date());
    const [comicImg, setComicImg] = useState(null);
    const [comicCode, setComicCode] = useState(storage.loadLastState().comic || 'garfield');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isStarred, setIsStarred] = useState(false);
    const [showStarred, setShowStarred] = useState(false);

    useEffect(() => {
        const getComic = async () => {
            setLoading(true);
            setError(null);
            try {
                const comic = await fetchComic(comicCode, date.toISOString().split('T')[0]);

                const img = new Image();
                img.onload = () => {
                    setComicImg(img);
                    setIsStarred(storage.isFavorited(comicCode, date.toISOString().split('T')[0]));
                    setLoading(false);
                };
                img.src = comic.image_url;
            } catch (error) {
                console.error('Failed to fetch comics:', error);
                setError('Failed to fetch comic. Please try a different date or comic.');
                setComicImg(null);
                setLoading(false);
            }
        };
        getComic();
    }, [date, comicCode]);

    const previousComic = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() - 1);
        setDate(newDate);
        storage.saveLastState({ comic: comicCode, date: newDate.toISOString().split('T')[0] });
    };

    const nextComic = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);
        setDate(newDate);
        storage.saveLastState({ comic: comicCode, date: newDate.toISOString().split('T')[0] });
    };

    const randomComic = async () => {
        setLoading(true);
        setError(null);
        try {
            const comic = await fetchRandomComic(comicCode);
            
                const img = new Image();
                img.onload = () => {
                    setComicImg(img);
                    setDate(new Date(comic.date));
                    storage.saveLastState({ comic: comicCode, date: comic.date });
                    setLoading(false);
                };
                img.src = comic.image_url;
        } catch (error) {
            console.error('Failed to fetch random comic:', error);
            setError('Failed to fetch random comic. Please try again.');
            setComicImg(null);
            setLoading(false);
        }
    };

    const handleSelectComic = (code, date) => {
        setComicCode(code);
        setDate(new Date(date));
        setShowStarred(false);
    };

    const toggleFavorite = () => {
        const currentDate = date.toISOString().split('T')[0];
        const favorites = storage.getFavorites();
        const isCurrentlyFavorited = storage.isFavorited(comicCode, currentDate);

        let updatedFavorites;
        if (isCurrentlyFavorited) {
            updatedFavorites = favorites.filter(fav => !(fav.code === comicCode && fav.date === currentDate));
        } else {
            updatedFavorites = [...favorites, { code: comicCode, date: currentDate }];
        }

        storage.setFavorites(updatedFavorites);
        setIsStarred(!isCurrentlyFavorited);
    };

    if (showStarred) {
        return <StarredComics onSelectComic={handleSelectComic} onClose={() => setShowStarred(false)} />;
    }

    return (
        <div className="app">
            {error && <div className="error-message">{error}</div>}
            {comicImg && !loading && !error &&
                <img src={comicImg.src} width={comicImg.naturalWidth} height={comicImg.naturalHeight} alt="Comic" />
            }
            {loading &&
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            }
            <br />
            <button onClick={() => previousComic()}>⬅️</button>
            <button onClick={() => randomComic()}>🎲</button>
            <button onClick={() => nextComic()}>➡️</button>
            <button onClick={toggleFavorite}>{isStarred ? '⭐' : '☆'}</button>
            <button onClick={() => setShowStarred(true)}>Starred</button>
            <input type="date" value={date.toISOString().split('T')[0]} onChange={(e) => {
                setDate(new Date(e.target.value));
                storage.saveLastState({ comic: comicCode, date: e.target.value });
            }} />
            <select value={comicCode} onChange={(e) => {
                setComicCode(e.target.value);
                storage.saveLastState({ comic: e.target.value, date: date.toISOString().split('T')[0] });
            }}>
                {comicCodes.map(comic => (
                    <option key={comic.code} value={comic.code}>{comic.name}</option>
                ))}
            </select>
        </div>
    );
}

