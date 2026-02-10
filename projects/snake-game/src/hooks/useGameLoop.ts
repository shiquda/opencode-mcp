import { useRef, useCallback, useEffect } from 'react';

export function useGameLoop(callback: (deltaTime: number) => void, running: boolean) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    callbackRef.current(delta);
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, loop]);
}
