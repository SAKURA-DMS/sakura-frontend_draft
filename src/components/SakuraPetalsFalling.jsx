import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FLOWER_NODES } from "@/components/SakuraBranch";

const PETAL_COLORS = ["#FFB7C5", "#FFC8D5", "#FF9EB5", "#FFD6E0", "#FFAFC5"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function PetalSVG({ color, width, height, blur }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 24"
      fill="none"
      style={blur ? { filter: "blur(0.8px)" } : undefined}
    >
      <path
        d="M 9 0 C 15 0 18 6 18 12 C 18 18 14 24 9 24 C 4 24 0 18 0 12 C 0 6 3 0 9 0 Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M 9 3 C 9 8, 9 16, 9 22"
        stroke="#fff"
        strokeWidth="0.5"
        opacity="0.25"
        fill="none"
      />
    </svg>
  );
}

export default function SakuraPetalsFalling() {
  const isMobile = useIsMobile();
  const count = isMobile ? 35 : 80;

  const flowerPercents = useMemo(() =>
    FLOWER_NODES.map((f) => ({
      xPct: (f.cx / 1200) * 100,
      yPct: (f.cy / 800) * 100,
    })), []
  );

  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const flower = flowerPercents[i % flowerPercents.length];
      const color = PETAL_COLORS[i % PETAL_COLORS.length];
      const w = rand(10, 20);
      const h = w * rand(1.2, 1.5);
      const duration = rand(8, 15);
      const delay = rand(0, 10);
      const driftX = rand(-60, 60);
      const rotation = rand(360, 540);
      const tiltY = rand(0, 180);
      const startX = flower.xPct + rand(-3, 3);
      const blur = i % 6 === 0;
      const opacity = rand(0.6, 0.85);

      return {
        id: i,
        color,
        width: w,
        height: h,
        blur,
        style: {
          position: "absolute",
          left: `${startX}%`,
          top: "0%",
          width: `${w}px`,
          height: `${h}px`,
          willChange: "transform",
          opacity: 0,
          animationName: i % 2 === 0 ? "petalFallViewport" : "petalFallViewport2",
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          animationIterationCount: "infinite",
          animationFillMode: "both",
          "--petal-drift": `${driftX}px`,
          "--petal-rotation": `${rotation}deg`,
          "--petal-tiltX": `${rand(20, 40)}deg`,
          "--petal-tiltY": `${tiltY}deg`,
          "--petal-opacity": opacity,
          pointerEvents: "none",
        },
      };
    });
  }, [count, flowerPercents]);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, width: "100vw", height: "100vh", perspective: "600px", overflow: "hidden" }}

      aria-hidden="true"
    >
      {petals.map((p) => (
        <div key={p.id} style={p.style}>
          <PetalSVG color={p.color} width={p.width} height={p.height} blur={p.blur} />
        </div>
      ))}
    </div>
  );
}
