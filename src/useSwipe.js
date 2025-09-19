import { useDrag } from '@use-gesture/react';

/**
 * A custom React hook to detect horizontal swipes using the '@use-gesture/react' library.
 *
 * @param {object} options - The options for the hook.
 * @param {Function} options.onSwipeLeft - The callback function to execute on a left swipe.
 * @param {Function} options.onSwipeRight - The callback function to execute on a right swipe.
 * @param {number} [options.swipeThreshold] - The minimum distance in pixels for a swipe to be registered.
 * @returns {Function} A `bind` function to be spread onto the target DOM element.
 */
export const useSwipe = ({ onSwipeLeft, onSwipeRight, swipeThreshold = 100 }) => {
  const bind = useDrag(
    ({ swipe: [swipeX], last }) => {
      // The `swipe` state is only set at the end of the gesture (when `last` is true)
      if (last) {
        if (swipeX === -1 && onSwipeLeft) {
          onSwipeLeft();
        }
        if (swipeX === 1 && onSwipeRight) {
          onSwipeRight();
        }
      }
    },
    {
      // Configuration for the drag gesture
      axis: 'x', // We only want to track horizontal movement
      swipe: {
        distance: swipeThreshold, // The minimum distance for a swipe
        velocity: 0.2, // The minimum velocity for a swipe
        duration: 250, // The maximum duration of a swipe
      },
    }
  );

  // Return the bind function to be used in the component
  return bind;
};
