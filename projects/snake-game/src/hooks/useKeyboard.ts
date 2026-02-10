import { useEffect, useRef, useCallback } from 'react';

type KeyHandler = (code: string) => void;

export function useKeyboard(handler: KeyHandler, active: boolean) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const relevantKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space', 'Escape',
    ];
    if (relevantKeys.includes(e.code)) {
      e.preventDefault();
      handlerRef.current(e.code);
    }
  }, []);

  useEffect(() => {
    if (active) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onKeyDown]);
}
