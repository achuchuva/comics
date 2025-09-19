import React, { useState, useEffect } from 'react';
import { fetchComic } from './api.js';

export function ComicPreview({ code, date }) {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const getComicImage = async () => {
            try {
                const comic = await fetchComic(code, date);
                if (comic && comic.image_url) {
                    setImageUrl(comic.image_url);
                }
            } catch (error) {
                console.error(`Failed to fetch preview for ${code} on ${date}:`, error);
            }
        };

        getComicImage();
    }, [code, date]);

    if (!imageUrl) {
        return <div className="preview-placeholder">Loading...</div>;
    }

    return <img src={imageUrl} alt={`Preview for ${code} on ${date}`} className="comic-preview-img" />;
}
