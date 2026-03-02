import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook to make a container pannable via mouse drag
 * @param {Object} bounds - Maximum bounds { maxX, maxY }
 * @returns {Object} { mapRef, offset, isDragging, handlers }
 */
export const usePannable = (bounds = { maxX: 2000, maxY: 2000 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { mode } = useSelector((state) => state.unitMaps);
  const mapRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0, scrollX: 0, scrollY: 0 });

  // Extra padding beyond content bounds for comfortable viewing
  const PADDING = 50;

  const handleMouseDown = (e) => {
    const isPannableTarget = e.target.hasAttribute('data-pannable') || 
                            e.target === mapRef.current;
    
    if (isPannableTarget) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        scrollX: offset.x,
        scrollY: offset.y,
      };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !mapRef.current) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    // Get container dimensions
    const containerRect = mapRef.current.getBoundingClientRect();
    
    // Calculate new offset
    const newX = dragStartPos.current.scrollX + deltaX;
    const newY = dragStartPos.current.scrollY + deltaY;
    
    // Clamp with padding:
    // - Can pan PADDING pixels beyond origin (0,0) → up to +PADDING
    // - Can pan to show content beyond viewport → down to -(bounds.max + PADDING - containerSize)
    setOffset({
      x: Math.max(
        -(bounds.maxX + PADDING - containerRect.width),
        Math.min(PADDING, newX)
      ),
      y: Math.max(
        -(bounds.maxY + PADDING - containerRect.height),
        Math.min(PADDING, newY)
      ),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, offset, bounds]);
 
  return {
    mapRef,
    offset,
    isDragging,
    bounds,
    handlers: mode == 'build' ? {
      onMouseDown: handleMouseDown,
    } : {},
  };
};