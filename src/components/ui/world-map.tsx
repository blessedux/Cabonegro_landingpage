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

  // Grid spacing for dotted map alignment (DottedMap with height:100 typically uses ~10-12 unit spacing)
  const GRID_SPACING = 10;

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SPACING) * GRID_SPACING;
  };

  const projectPoint = (lat: number, lng: number, snap: boolean = true) => {
    let x = (lng + 180) * (800 / 360);
    let y = (90 - lat) * (400 / 180);
    if (snap) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }
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
  const renderMapContent = (instanceId: string = '') => (
    <>
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none relative z-0"
        style={{ zIndex: 0 }}
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="-100 -50 1000 500"
        className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible z-10"
        style={{ zIndex: 10, overflow: 'visible' }}
        overflow="visible"
        preserveAspectRatio="xMidYMid meet"
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
        <g className="overflow-visible" style={{ overflow: 'visible' }} transform="translate(-50, 25)">
        {dots.map((dot, i) => {
          const color = dot.color || lineColor;
          // Identify connections involving CaboNegro port (~ -70.0, -70.83)
          const approxEqual = (a: number, b: number, eps: number = 0.5) => Math.abs(a - b) < eps;
          const connectsCaboNegro = (
            (approxEqual(dot.start.lat, -70.0) && approxEqual(dot.start.lng, -70.83)) ||
            (approxEqual(dot.end.lat, -70.0) && approxEqual(dot.end.lng, -70.83))
          );
          // Apply additional offset to the right for non-Cabo Negro dots (450 units = 45% of 1000 viewBox width)
          const additionalOffsetX = connectsCaboNegro ? 0 : 450;
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          // Snap final positions to grid after applying offset (same as circles)
          const snappedStartX = snapToGrid(startPoint.x + additionalOffsetX);
          const snappedStartY = snapToGrid(startPoint.y);
          const snappedEndX = snapToGrid(endPoint.x + additionalOffsetX);
          const snappedEndY = snapToGrid(endPoint.y);
          const midX = (snappedStartX + snappedEndX) / 2 + (dot.controlOffsetX || 0);
          // Prefer curves facing downward (toward bottom) by default
          const baseMidY = Math.max(snappedStartY, snappedEndY) + 40;
          const midY = baseMidY + (dot.controlOffsetY || 0);
          const pathD = `M ${snappedStartX} ${snappedStartY} Q ${midX} ${midY} ${snappedEndX} ${snappedEndY}`;
          return (
            <g key={`path-group-${i}${instanceId}`} style={{ overflow: 'visible' }}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={dashed ? "4 6" : undefined}
                initial={{ pathLength: 0, strokeOpacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1, 0],
                  strokeOpacity: [0, connectsCaboNegro ? 1 : 0.7, connectsCaboNegro ? 1 : 0.7, 0],
                }}
                transition={{
                  duration: connectsCaboNegro ? 6 : 4,
                  times: [0, 0.5, 0.8, 1],
                  delay: 0.3 * i,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                }}
              />
            </g>
          );
        })}

        {dots.map((dot, i) => {
          // Identify connections involving CaboNegro port (~ -70.0, -70.83)
          const approxEqual = (a: number, b: number, eps: number = 0.5) => Math.abs(a - b) < eps;
          const connectsCaboNegro = (
            (approxEqual(dot.start.lat, -70.0) && approxEqual(dot.start.lng, -70.83)) ||
            (approxEqual(dot.end.lat, -70.0) && approxEqual(dot.end.lng, -70.83))
          );
          // Apply additional offset to the right for non-Cabo Negro dots (450 units = 45% of 1000 viewBox width)
          const additionalOffsetX = connectsCaboNegro ? 0 : 450;
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          // Snap final positions to grid after applying offset
          const snappedStartX = snapToGrid(startPoint.x + additionalOffsetX);
          const snappedStartY = snapToGrid(startPoint.y);
          const snappedEndX = snapToGrid(endPoint.x + additionalOffsetX);
          const snappedEndY = snapToGrid(endPoint.y);
          return (
          <g key={`points-group-${i}${instanceId}`}>
            <g key={`start-${i}${instanceId}`}>
              <circle
                cx={snappedStartX}
                cy={snappedStartY}
                r="2"
                fill={dot.startColor || dot.color || lineColor}
              />
              <circle
                cx={snappedStartX}
                cy={snappedStartY}
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
            <g key={`end-${i}${instanceId}`}>
              <circle
                cx={snappedEndX}
                cy={snappedEndY}
                r="2"
                fill={dot.endColor || dot.color || lineColor}
              />
              <circle
                cx={snappedEndX}
                cy={snappedEndY}
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
        )})}
        </g>
      </svg>
    </>
  );

  return (
    <div className="w-full max-w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans overflow-hidden">
      {/* Mobile: Duplicated maps for seamless infinite loop with scale */}
      <motion.div
        className="md:hidden flex w-[200%] h-full relative scale-[1.4] overflow-visible"
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
        <div className="w-1/2 h-full flex-shrink-0 relative overflow-visible">
          {renderMapContent('-1')}
        </div>
        {/* Second map instance for seamless loop */}
        <div className="w-1/2 h-full flex-shrink-0 relative overflow-visible">
          {renderMapContent('-2')}
        </div>
      </motion.div>

      {/* Desktop: Duplicated maps for seamless infinite loop */}
      <motion.div
        className="hidden md:flex w-[200%] h-full relative overflow-visible"
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
        <div className="w-1/2 h-full flex-shrink-0 relative overflow-visible">
          {renderMapContent('-1')}
        </div>
        {/* Second map instance for seamless loop */}
        <div className="w-1/2 h-full flex-shrink-0 relative overflow-visible">
          {renderMapContent('-2')}
        </div>
      </motion.div>
    </div>
  );
}
