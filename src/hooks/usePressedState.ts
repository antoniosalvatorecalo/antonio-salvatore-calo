import { useRef, useState, useCallback } from 'react';

const LONG_PRESS_MS = 400;
const MOVE_THRESHOLD = 15;

export function usePressedState() {
  const [isPressed, setIsPressed] = useState(false);
  const isPressedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStartPos = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    isPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      isPressedRef.current = true;
      setIsPressed(true);
    }, LONG_PRESS_MS);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    if (isPressedRef.current) {
      isPressedRef.current = false;
      setIsPressed(false);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!timerRef.current && !isPressedRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      if (isPressedRef.current) {
        isPressedRef.current = false;
        setIsPressed(false);
      }
    }
  }, []);

  return { isPressed, isPressedRef, onTouchStart, onTouchEnd, onTouchMove };
}
