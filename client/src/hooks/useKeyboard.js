import { useEffect, useRef } from 'react';

export function useKeyboard() {
  const keys = useRef({});

  useEffect(() => {
    const onDown = (e) => {
      // Prevent page scroll when using arrow keys
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
      keys.current[e.key] = true;
    };

    const onUp = (e) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return keys;
}