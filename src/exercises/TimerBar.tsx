import { useEffect, useRef, useState } from 'react';

/** Only shown when the user turned the time limit on in Ajustes. */
export function TimerBar({ ms, label, onEnd }: { ms: number; label: string; onEnd: () => void }) {
  const [left, setLeft] = useState(1);
  const end = useRef(onEnd);
  end.current = onEnd;

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const fraction = Math.max(0, 1 - (Date.now() - start) / ms);
      setLeft(fraction);
      if (fraction === 0) {
        window.clearInterval(id);
        end.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [ms]);

  return (
    <div className="my-2" role="timer" aria-label={label}>
      <p className="mb-1 text-base text-tinta-suave">{label}</p>
      <div className="h-3 overflow-hidden rounded-full bg-borde">
        <div className="h-full rounded-full bg-acento" style={{ width: `${left * 100}%` }} />
      </div>
    </div>
  );
}
