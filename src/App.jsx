import React, { useState, useEffect, useRef } from 'react';
import { fetchComic, fetchRandomComic } from './api.js';
import { useSwipe } from './useSwipe.js';
import * as storage from './storage.js';

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

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);
            setDate(newDate);
            storage.saveLastState({ comic: comicCode, date: newDate.toISOString().split('T')[0] });
        },
        onSwipeRight: () => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() - 1);
            setDate(newDate);
            storage.saveLastState({ comic: comicCode, date: newDate.toISOString().split('T')[0] });
        },
    });

    useEffect(() => {
        const getComic = async () => {
            try {
                console.log(comicCode);
                const comic = await fetchComic(comicCode, date.toISOString().split('T')[0]);

                const img = new Image();
                img.src = comic.image_url;

                await new Promise(resolve => {
                    img.onload = resolve;
                });

                setComicImg(img);
            } catch (error) {
                console.error('Failed to fetch comics:', error);
            }
        };
        getComic();
    }, [date, comicCode]);


    return (
        <div className="app" {...swipeHandlers}>
            {comicImg &&
                <img src={comicImg.src} width={comicImg.naturalWidth} height={comicImg.naturalHeight} alt="Comic" />
            }
            {!comicImg &&
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            }
            <input type="date" value={date.toISOString().split('T')[0]} onChange={(e) => {
                setDate(new Date(e.target.value));
                storage.saveLastState({ comic: comicCode, date: e.target.value });
            }} />
            <select onChange={(e) => {
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

