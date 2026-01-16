"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WorldMap } from "@/components/ui/world-map";

export function WorldMapDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the map section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map slides down from top to bottom of container as user scrolls
  // Slides down at least 40px as user scrolls through the section
  const mapY = useTransform(scrollYProgress, [0, 1], ['0px', '40px']);

  // Map slides horizontally from left to right as user scrolls
  // Creates a side-to-side animation effect
  const mapX = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  // Side margins increase (map width decreases) as user scrolls
  // Start with larger margins (smaller width), increase to even larger margins (even smaller width)
  // On mobile, keep full width (no margins) - handled via separate wrapper
  const sideMargin = useTransform(scrollYProgress, [0, 1], [48, 120]); // 48px to 120px (3rem to 7.5rem)

  return (
    <div 
      ref={containerRef} 
      className="pt-0 pb-0 bg-white w-full relative md:min-h-[100vh] md:mt-0"
      data-white-background="true"
      style={{ position: 'relative', zIndex: 20 }}
    >
      {/* Mobile map - simple flow, no sticky, no wrapper */}
      <motion.div
        className="md:hidden relative w-full bg-white mt-40"
        style={{
          y: mapY,
          x: 0,
          height: '50vh'
        }}
      >
        <div className="scale-[2] origin-center h-full w-full" style={{ overflow: 'hidden' }}>
          <WorldMap
            dashed
            dots={[
            // Americas
            // Valparaíso directly to CaboNegro bottom (left-tilted) - white path, blue port dot
            { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: -40, controlOffsetY: 45 },
            // Atlantic side (moved start further up/right in Brazil) → CaboNegro bottom (right-tilted) - white path, blue port dot
            { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: 60, controlOffsetY: 40 }, // São Paulo → CaboNegro bottom

            // New route: Top of green vector (Valparaíso) → California coast (San Francisco)
            { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: 37.7749, lng: -122.4194 }, controlOffsetX: 80, controlOffsetY: -10 },

            // CaboNegro bottom → Southern California (near-straight upward arc)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 32.7157, lng: -117.1611 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 60 }, // CaboNegro bottom → San Diego
            { start: { lat: -22.9519, lng: -43.2105 }, end: { lat: 25.7743, lng: -80.1937 } },   // Rio de Janeiro → Miami
            { start: { lat: 19.4326, lng: -99.1332 }, end: { lat: 34.0522, lng: -118.2437 } },  // Mexico City → Los Angeles

            // Atlantic → Europe
            { start: { lat: 14.7167, lng: -17.4677 }, end: { lat: 36.1408, lng: -5.3536 } },    // Dakar → Gibraltar
            { start: { lat: 36.1408, lng: -5.3536 }, end: { lat: 38.7223, lng: -9.1393 } },     // Gibraltar → Lisbon
            { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 51.9244, lng: 4.4777 } },      // London → Rotterdam

            // Europe → Asia
            { start: { lat: 41.0082, lng: 28.9784 }, end: { lat: 29.7604, lng: 95.3621 } },     // Istanbul → Suez vicinity (approx route via land bridge)
            { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 35.6762, lng: 139.6503 } },   // Shanghai → Tokyo
            { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.5665, lng: 126.978 } },    // Tokyo → Seoul

            // Asia → Oceania
            { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: -33.8688, lng: 151.2093 } },   // Singapore → Sydney
            { start: { lat: -37.8136, lng: 144.9631 }, end: { lat: -36.8485, lng: 174.7633 } }, // Melbourne → Auckland

            // Africa & Indian Ocean
            { start: { lat: -33.9249, lng: 18.4241 }, end: { lat: -12.4634, lng: 130.8456 } },  // Cape Town → Darwin
            { start: { lat: -26.2041, lng: 28.0473 }, end: { lat: -20.1667, lng: 57.5 } },      // Johannesburg → Port Louis

            // CaboNegro bottom → West coast of Africa (Dakar)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 14.7167, lng: -17.4677 }, startColor: '#0ea5e9', controlOffsetX: -20, controlOffsetY: 30 },
            // CaboNegro bottom → West coast of Africa (Abidjan)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 5.3453, lng: -4.0244 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 20 },
            // CaboNegro bottom → Center of Africa (Nigeria/Cameroon region)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 7.3697, lng: 9.1244 }, startColor: '#0ea5e9', controlOffsetX: -15, controlOffsetY: 25 },
            // CaboNegro bottom → Center of Europe (Central Europe - Germany/Switzerland region)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 50.1109, lng: 8.6821 }, startColor: '#0ea5e9', controlOffsetX: -5, controlOffsetY: 35 },

            // CaboNegro bottom → China routes removed to avoid right-side vectors

            // CaboNegro bottom → far left border (exiting map)
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: -60, lng: -180 }, startColor: '#0ea5e9', controlOffsetX: -50, controlOffsetY: 20 },

            // From far left border → China (Shanghai) to route via left side of map
            { start: { lat: 35, lng: -180 }, end: { lat: 31.2304, lng: 121.4737 }, controlOffsetX: 40, controlOffsetY: -10 },
          ]}
        />
        </div>
      </motion.div>
      
      {/* Desktop sticky wrapper - with side margins and horizontal movement */}
      <motion.div 
        className="hidden md:block sticky top-[6.5rem] flex items-start justify-center pt-0"
        style={{
          paddingLeft: sideMargin,
          paddingRight: sideMargin,
          zIndex: 1
        }}
      >
        {/* Desktop wrapper - with side margins and horizontal movement */}
        <motion.div
          className="relative w-full max-w-full overflow-hidden bg-white"
          style={{
            y: mapY,
            x: mapX,
            height: '100vh'
          }}
        >
          <div className="origin-center overflow-hidden h-full w-full">
            <WorldMap
          dashed
          dots={[
          // Americas
          // Valparaíso directly to CaboNegro bottom (left-tilted) - white path, blue port dot
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: -40, controlOffsetY: 45 },
          // Atlantic side (moved start further up/right in Brazil) → CaboNegro bottom (right-tilted) - white path, blue port dot
          { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: -70.0, lng: -70.83 }, endColor: '#0ea5e9', controlOffsetX: 60, controlOffsetY: 40 }, // São Paulo → CaboNegro bottom

          // New route: Top of green vector (Valparaíso) → California coast (San Francisco)
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: 37.7749, lng: -122.4194 }, controlOffsetX: 80, controlOffsetY: -10 },

          // CaboNegro bottom → Southern California (near-straight upward arc)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 32.7157, lng: -117.1611 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 60 }, // CaboNegro bottom → San Diego
          { start: { lat: -22.9519, lng: -43.2105 }, end: { lat: 25.7743, lng: -80.1937 } },   // Rio de Janeiro → Miami
          { start: { lat: 19.4326, lng: -99.1332 }, end: { lat: 34.0522, lng: -118.2437 } },  // Mexico City → Los Angeles

          // Atlantic → Europe
          { start: { lat: 14.7167, lng: -17.4677 }, end: { lat: 36.1408, lng: -5.3536 } },    // Dakar → Gibraltar
          { start: { lat: 36.1408, lng: -5.3536 }, end: { lat: 38.7223, lng: -9.1393 } },     // Gibraltar → Lisbon
          { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 51.9244, lng: 4.4777 } },      // London → Rotterdam

          // Europe → Asia
          { start: { lat: 41.0082, lng: 28.9784 }, end: { lat: 29.7604, lng: 95.3621 } },     // Istanbul → Suez vicinity (approx route via land bridge)
          { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 35.6762, lng: 139.6503 } },   // Shanghai → Tokyo
          { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.5665, lng: 126.978 } },    // Tokyo → Seoul

          // Asia → Oceania
          { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: -33.8688, lng: 151.2093 } },   // Singapore → Sydney
          { start: { lat: -37.8136, lng: 144.9631 }, end: { lat: -36.8485, lng: 174.7633 } }, // Melbourne → Auckland

          // Africa & Indian Ocean
          { start: { lat: -33.9249, lng: 18.4241 }, end: { lat: -12.4634, lng: 130.8456 } },  // Cape Town → Darwin
          { start: { lat: -26.2041, lng: 28.0473 }, end: { lat: -20.1667, lng: 57.5 } },      // Johannesburg → Port Louis

          // CaboNegro bottom → West coast of Africa (Dakar)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 14.7167, lng: -17.4677 }, startColor: '#0ea5e9', controlOffsetX: -20, controlOffsetY: 30 },
          // CaboNegro bottom → West coast of Africa (Abidjan)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 5.3453, lng: -4.0244 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 20 },
          // CaboNegro bottom → Center of Africa (Nigeria/Cameroon region)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 7.3697, lng: 9.1244 }, startColor: '#0ea5e9', controlOffsetX: -15, controlOffsetY: 25 },
          // CaboNegro bottom → Center of Europe (Central Europe - Germany/Switzerland region)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: 50.1109, lng: 8.6821 }, startColor: '#0ea5e9', controlOffsetX: -5, controlOffsetY: 35 },

          // CaboNegro bottom → China routes removed to avoid right-side vectors

          // CaboNegro bottom → far left border (exiting map)
          { start: { lat: -70.0, lng: -70.83 }, end: { lat: -60, lng: -180 }, startColor: '#0ea5e9', controlOffsetX: -50, controlOffsetY: 20 },

          // From far left border → China (Shanghai) to route via left side of map
          { start: { lat: 35, lng: -180 }, end: { lat: 31.2304, lng: 121.4737 }, controlOffsetX: 40, controlOffsetY: -10 },
        ]}
          />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}



