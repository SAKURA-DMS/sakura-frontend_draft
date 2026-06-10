import { useState, useCallback } from "react";

const BURST_COLORS = ["#FFB7C5", "#FF9EB5", "#FFC8D5", "#FFD6E0"];

function PetalSVG({ color, size }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 18 24" fill="none">
      <path
        d="M 9 0 C 15 0 18 6 18 12 C 18 18 14 24 9 24 C 4 24 0 18 0 12 C 0 6 3 0 9 0 Z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

export function usePetalBurst() {
  const [petals, setPetals] = useState([]);

  const triggerBurst = useCallback((e) => {
    e.stopPropagation();
    const x = e.clientX;
    const y = e.clientY;
    const burstId = Date.now() + Math.random();
    const newPetals = Array.from({ length: 15 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      return {
        id: burstId + i,
        x,
        y,
        burstX: Math.cos(angle),
        burstY: Math.sin(angle),
        duration: 5 + Math.random() * 4,
        size: 10 + Math.random() * 10,
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
        sway: (Math.random() - 0.5) * 120,
        delay: Math.random() * 0.3,
        spin: 360 + Math.random() * 360,
      };
    });
    setPetals((prev) => [...prev, ...newPetals]);
    setTimeout(() => {
      setPetals((prev) => prev.filter((p) => !newPetals.find((np) => np.id === p.id)));
    }, 10000);
  }, []);

  return { petals, triggerBurst };
}

export default function PetalBurstOverlay({ petals }) {
  if (petals.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 10000, overflow: "hidden" }}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            animationName: "petalBurst",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationFillMode: "forwards",
            "--burst-x": p.burstX,
            "--burst-y": p.burstY,
            "--sway": p.sway,
            "--spin": `${p.spin}deg`,
            opacity: 0,
          }}
        >
          <PetalSVG color={p.color} size={p.size} />
        </div>
      ))}
    </div>
  );
}
