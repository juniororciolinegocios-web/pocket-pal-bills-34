import { useEffect, useRef, useState } from 'react';

interface UseCountUpProps {
  start: number;
  end: number;
  duration: number;
  decimals?: number;
  delay?: number;
}

export function useCountUp({ start, end, duration, decimals = 2, delay = 0 }: UseCountUpProps) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Se não há delay, começar imediatamente
    const startDelay = delay;
    const startAnimation = () => {
      startTimeRef.current = null;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: ease-out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const current = start + (end - start) * easeProgress;
        setValue(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [start, end, duration, decimals, delay]);

  return value;
}
