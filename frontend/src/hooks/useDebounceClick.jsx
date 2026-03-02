import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to prevent multiple rapid clicks on a button
 * @param {Function} callback - The function to execute on click
 * @param {number} delay - Delay in milliseconds before allowing next click (default: 1000ms)
 * @returns {Object} - Object containing the debounced handler and loading state
 */
export const useDebounceClick = (callback, delay = 1000) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const timeoutRef = useRef(null);

    const debouncedCallback = useCallback((...args) => {
        // Prevent execution if already processing
        if (isProcessing) {
            return;
        }

        // Set processing state to true
        setIsProcessing(true);

        // Execute the callback
        callback(...args);

        // Clear existing timeout if any
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Reset processing state after delay
        timeoutRef.current = setTimeout(() => {
            setIsProcessing(false);
        }, delay);
    }, [callback, delay, isProcessing]);

    // Cleanup timeout on unmount
    useCallback(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        handleClick: debouncedCallback,
        isProcessing,
    };
};