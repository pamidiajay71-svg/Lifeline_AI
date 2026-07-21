import { useEffect, useRef, useState } from 'react';

export function useTypingEffect(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let i = 0;
    const tick = () => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      ref.current = window.setTimeout(tick, speed);
    };
    ref.current = window.setTimeout(tick, speed);
    return () => {
      if (ref.current) window.clearTimeout(ref.current);
    };
  }, [text, speed]);

  return { displayed, done };
}
