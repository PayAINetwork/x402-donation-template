"use client";

import { useEffect, useState } from "react";

export function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<
    Array<{
      id: number;
      left: string;
      delay: string;
      duration: string;
      size: string;
    }>
  >([]);

  useEffect(() => {
    // Generate static snowflakes only on client side to avoid hydration mismatch
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 10}s`, // 10-13s duration
      size: `${Math.random() * 0.4 + 0.2}rem`, // Random size
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 bg-white rounded-full opacity-80 animate-snow"
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            width: flake.size,
            height: flake.size,
          }}
        />
      ))}
    </div>
  );
}
