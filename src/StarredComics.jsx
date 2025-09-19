import React from 'react';
import * as storage from './storage.js';
import { ComicPreview } from './ComicPreview.jsx';

export function StarredComics({ onSelectComic, onClose }) {
    const favorites = storage.getFavorites();

    const handleComicClick = (fav) => {
        onSelectComic(fav.code, fav.date);
    };

    return (
        <div className="starred-comics-container">
            <div className="starred-comics-header">
                <h2>Starred Comics</h2>
                <button onClick={onClose} className="close-button">Close</button>
            </div>
            {favorites.length === 0 ? (
                <p>You have no starred comics yet.</p>
            ) : (
                <div className="starred-grid">
                    {favorites.map((fav, index) => (
                        <div key={index} className="starred-item" onClick={() => handleComicClick(fav)}>
                            <ComicPreview code={fav.code} date={fav.date} />
                            <span className="comic-name">{fav.code}</span>
                            <span className="comic-date">{fav.date}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
