import { useEffect, useMemo } from "react";

// Toggle: set to false to disable Christmas visuals everywhere.
export const CHRISTMAS_MODE = true;

type Snowflake = {
  id: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  size: number;
};

export function ChristmasTheme() {
  const snowflakes = useMemo<Snowflake[]>(
    () =>
      Array.from({ length: 24 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 6,
        opacity: 0.25 + Math.random() * 0.55,
        size: 10 + Math.random() * 10,
      })),
    []
  );

  useEffect(() => {
    // no-op: keeps the component deterministic post-mount in StrictMode
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {snowflakes.map((f) => (
        <span
          key={f.id}
          className="absolute top-0 animate-snowfall text-foreground"
          style={{
            left: `${f.left}%`,
            opacity: f.opacity,
            fontSize: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}
