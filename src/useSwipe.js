// A more robust useSwipe hook with mouse and touch support
import { useState } from 'react';

export const useSwipe = ({ onSwipeLeft, onSwipeRight }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 70;

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    };
    
    // Mouse event handlers
    const handleMouseDown = (e) => {
        setTouchEnd(null);
        setTouchStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        // We only care about movement if the mouse button is pressed
        if (e.buttons === 1) { // 1 means the primary mouse button is pressed
            setTouchEnd(e.clientX);
        }
    };

    const handleMouseUp = () => {
        handleTouchEnd();
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
    };
};