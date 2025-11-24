"use client";

import { useEffect, useRef, useState } from "react";
import { WorldMap } from "@/components/ui/world-map";

export function WorldMapDemoEs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [captionActive, setCaptionActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    let hasTriggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTriggered) {
          hasTriggered = true;
          setCaptionActive(true);
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.01 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="py-20 dark:bg-black bg-white w-full relative overflow-hidden">
      <div className="relative w-full max-w-full overflow-hidden">
        <WorldMap
          dashed
          dots={[
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: -40, controlOffsetY: 45 },
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: 37.7749, lng: -122.4194 }, controlOffsetX: 80, controlOffsetY: -10 },
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 32.7157, lng: -117.1611 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 60 },
          { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: 60, controlOffsetY: 40 },
          { start: { lat: -22.9519, lng: -43.2105 }, end: { lat: 25.7743, lng: -80.1937 } },
          { start: { lat: 19.4326, lng: -99.1332 }, end: { lat: 34.0522, lng: -118.2437 } },
          { start: { lat: 14.7167, lng: -17.4677 }, end: { lat: 36.1408, lng: -5.3536 } },
          { start: { lat: 36.1408, lng: -5.3536 }, end: { lat: 38.7223, lng: -9.1393 } },
          { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 51.9244, lng: 4.4777 } },
          { start: { lat: 41.0082, lng: 28.9784 }, end: { lat: 29.7604, lng: 95.3621 } },
          { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 35.6762, lng: 139.6503 } },
          { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.5665, lng: 126.978 } },
          { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: -33.8688, lng: 151.2093 } },
          { start: { lat: -37.8136, lng: 144.9631 }, end: { lat: -36.8485, lng: 174.7633 } },
          { start: { lat: -33.9249, lng: 18.4241 }, end: { lat: -12.4634, lng: 130.8456 } },
          { start: { lat: -26.2041, lng: 28.0473 }, end: { lat: -20.1667, lng: 57.5 } },
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 14.7167, lng: -17.4677 }, startColor: '#0ea5e9', controlOffsetX: -20, controlOffsetY: 30 },
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 5.3453, lng: -4.0244 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 20 },
          // CaboNegro → Centro de África (región Nigeria/Camerún)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 7.3697, lng: 9.1244 }, startColor: '#0ea5e9', controlOffsetX: -15, controlOffsetY: 25 },
          // CaboNegro → Centro de Europa (región Alemania/Suiza)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 50.1109, lng: 8.6821 }, startColor: '#0ea5e9', controlOffsetX: -5, controlOffsetY: 35 },
          // Removed Cabo Negro → China routes (avoid right side)
          // Add left-edge → China to route via left side of the map
          { start: { lat: 35, lng: -180 }, end: { lat: 31.2304, lng: 121.4737 }, controlOffsetX: 40, controlOffsetY: -10 },
        ]}
      />
      <TerminalCaptionEs active={captionActive} />
      </div>
    </div>
  );
}

function TerminalCaptionEs({ active }: { active: boolean }) {
  const lines = [
    "Enlace del Estrecho de Magallanes amplía capacidad Pacífico–Atlántico",
    "Rutas selectivas: 10–15% menos tiempo de tránsito",
    "Redundancia para flujos limitados por el Canal de Panamá"
  ];
  const [displayLines, setDisplayLines] = useState<string[]>(Array(lines.length).fill(""));
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!active) return;
    const chars = "▪";
    const timers: number[] = [];
    lines.forEach((text, idx) => {
      const startDelay = idx * 400;
      const timer = window.setTimeout(() => {
        let iterations = 0;
        const max = text.length * 2;
        const interval = window.setInterval(() => {
          const next = text
            .split("")
            .map((ch, i) => (i < iterations / 2 ? text[i] : chars[Math.floor(Math.random() * chars.length)]))
            .join("");
          setDisplayLines((prev) => {
            const copy = [...prev];
            copy[idx] = next;
            return copy;
          });
          iterations += 1;
          if (iterations >= max) {
            window.clearInterval(interval);
            setDisplayLines((prev) => {
              const copy = [...prev];
              copy[idx] = text;
              return copy;
            });
          }
        }, 35);
        timers.push(interval);
      }, startDelay);
      timers.push(timer);
    });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setDots((d) => (d + 1) % 4), 700);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="pointer-events-none md:absolute bottom-0 md:bottom-1 lg:bottom-2 right-0 md:right-3 lg:right-4 xl:right-6 z-10 max-w-[92%] md:max-w-none w-full md:w-auto mt-12 md:mt-0">
      <div className="inline-block text-xs sm:text-sm md:text-base lg:text-lg font-secondary uppercase tracking-widest text-white/80 bg-black/25 px-3 py-2 rounded">
        {displayLines.map((line, i) => (
          <div key={i} className="leading-tight">
            {line}
            {i === displayLines.length - 1 && (
              <span className="inline-block w-6 text-left">{".".repeat(dots)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


