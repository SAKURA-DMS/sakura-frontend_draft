import { useMemo } from "react";

/**
 * Subtle floating tiny pink dots for atmospheric depth.
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FloatingParticles({ count = 30 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${rand(0, 100)}%`,
      top: `${rand(0, 100)}%`,
      size: rand(2, 4),
      duration: `${rand(6, 14)}s`,
      delay: `${rand(0, 8)}s`,
      opacity: rand(0.15, 0.35),
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "#FFB7C5",
            opacity: p.opacity,
            animation: `particleFloat ${p.duration} ${p.delay} ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
