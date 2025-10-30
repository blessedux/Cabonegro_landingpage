"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";
import { useTheme } from "next-themes";

interface RouteSpec {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
  color?: string; // optional per-route color
  controlOffsetX?: number; // shift control point horizontally for tilt
  controlOffsetY?: number; // shift control point vertically for arc height
  startColor?: string; // optional per-endpoint color override
  endColor?: string;   // optional per-endpoint color override
}

interface MapProps {
  dots?: Array<RouteSpec>;
  lineColor?: string;
  dashed?: boolean;
}

export function WorldMap({
  dots = [],
  lineColor = "#ffffff",
  dashed = true,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const { theme } = useTheme();

  const svgMap = map.getSVG({
    radius: 0.22,
    color: theme === "dark" ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: theme === "dark" ? "black" : "white",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Render map content (Image + SVG with all routes)
  const renderMapContent = () => (
    <>
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible"
        overflow="visible"
      >
        {/* Subtle continent tint pulses: alternating white/blue glows */}
        <defs>
          <radialGradient id="americas-mask" cx="20%" cy="55%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="emea-mask" cx="55%" cy="45%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="apac-mask" cx="80%" cy="55%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* White pulse layers */}
        <g>
          <rect x="0" y="0" width="800" height="400" fill="url(#americas-mask)">
            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="6s" repeatCount="indefinite" />
          </rect>
          <rect x="0" y="0" width="800" height="400" fill="url(#emea-mask)">
            <animate attributeName="opacity" values="0.12;0.04;0.12" dur="7s" begin="1s" repeatCount="indefinite" />
          </rect>
          <rect x="0" y="0" width="800" height="400" fill="url(#apac-mask)">
            <animate attributeName="opacity" values="0.12;0.04;0.12" dur="8s" begin="2s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Blue pulse layers (very subtle) */}
        <defs>
          <radialGradient id="americas-mask-blue" cx="20%" cy="55%" r="35%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="emea-mask-blue" cx="55%" cy="45%" r="35%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="apac-mask-blue" cx="80%" cy="55%" r="35%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g>
          <rect x="0" y="0" width="800" height="400" fill="url(#americas-mask-blue)">
            <animate attributeName="opacity" values="0.04;0;0.04" dur="10s" begin="0.5s" repeatCount="indefinite" />
          </rect>
          <rect x="0" y="0" width="800" height="400" fill="url(#emea-mask-blue)">
            <animate attributeName="opacity" values="0.04;0;0.04" dur="11s" begin="2s" repeatCount="indefinite" />
          </rect>
          <rect x="0" y="0" width="800" height="400" fill="url(#apac-mask-blue)">
            <animate attributeName="opacity" values="0.04;0;0.04" dur="12s" begin="3s" repeatCount="indefinite" />
          </rect>
        </g>
        {dots.map((dot, i) => {
          const color = dot.color || lineColor;
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const midX = (startPoint.x + endPoint.x) / 2 + (dot.controlOffsetX || 0);
          // Prefer curves facing downward (toward bottom) by default
          const baseMidY = Math.max(startPoint.y, endPoint.y) + 40;
          const midY = baseMidY + (dot.controlOffsetY || 0);
          const pathD = `M ${startPoint.x} ${startPoint.y} Q ${midX} ${midY} ${endPoint.x} ${endPoint.y}`;
          // Identify connections involving CaboNegro bottom port (~ -85, -70)
          const approxEqual = (a: number, b: number, eps: number = 0.5) => Math.abs(a - b) < eps;
          const connectsCaboNegro = (
            (approxEqual(dot.start.lat, -85) && approxEqual(dot.start.lng, -70)) ||
            (approxEqual(dot.end.lat, -85) && approxEqual(dot.end.lng, -70))
          );
          return (
            <g key={`path-group-${i}`}>
              <defs>
                <linearGradient id={`path-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="5%" stopColor={color} stopOpacity="1" />
                  <stop offset="95%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={pathD}
                fill="none"
                stroke={`url(#path-gradient-${i})`}
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray={dashed ? "4 6" : undefined}
                initial={{ pathLength: 0, strokeOpacity: 0 }}
                whileInView={{
                  pathLength: [0, 1, 1, 0],
                  strokeOpacity: [0, connectsCaboNegro ? 0.95 : 0.45, connectsCaboNegro ? 0.95 : 0.45, 0],
                }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: connectsCaboNegro ? 6 : 4,
                  times: [0, 0.5, 0.8, 1],
                  delay: 0.5 * i,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.6,
                }}
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={dot.startColor || dot.color || lineColor}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={dot.startColor || dot.color || lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="2;8;2"
                  keyTimes="0;0.5;1"
                  dur="3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  keyTimes="0;0.5;1"
                  dur="3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={dot.endColor || dot.color || lineColor}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={dot.endColor || dot.color || lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="2;8;2"
                  keyTimes="0;0.5;1"
                  dur="3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  keyTimes="0;0.5;1"
                  dur="3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </>
  );

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans overflow-hidden">
      {/* Mobile: Duplicated maps for seamless infinite loop with scale */}
      <motion.div
        className="md:hidden flex w-[200%] h-full relative scale-[1.4]"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          duration: 50,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* First map instance */}
        <div className="w-1/2 h-full flex-shrink-0 relative">
          {renderMapContent()}
        </div>
        {/* Second map instance for seamless loop */}
        <div className="w-1/2 h-full flex-shrink-0 relative">
          {renderMapContent()}
        </div>
      </motion.div>

      {/* Desktop: Duplicated maps for seamless infinite loop */}
      <motion.div
        className="hidden md:flex w-[200%] h-full relative"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          duration: 60,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* First map instance */}
        <div className="w-1/2 h-full flex-shrink-0 relative">
          {renderMapContent()}
        </div>
        {/* Second map instance for seamless loop */}
        <div className="w-1/2 h-full flex-shrink-0 relative">
          {renderMapContent()}
        </div>
      </motion.div>
    </div>
  );
}
