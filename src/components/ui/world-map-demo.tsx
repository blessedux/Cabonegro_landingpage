"use client";

import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function WorldMapDemo() {
  return (
    <div className="py-20 dark:bg-black bg-white w-full">
      <WorldMap
        dashed
        dots={[
          // Americas
          // Valparaíso directly to CaboNegro bottom (left-tilted) - white path, blue port dot
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: -85, lng: -70 }, endColor: '#0ea5e9', controlOffsetX: -40, controlOffsetY: 45 },
          // Atlantic side (moved start further up/right in Brazil) → CaboNegro bottom (right-tilted) - white path, blue port dot
          { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: -85, lng: -70 }, endColor: '#0ea5e9', controlOffsetX: 60, controlOffsetY: 40 }, // São Paulo → CaboNegro bottom

          // New route: Top of green vector (Valparaíso) → California coast (San Francisco)
          { start: { lat: -33.0458, lng: -71.6197 }, end: { lat: 37.7749, lng: -122.4194 }, controlOffsetX: 80, controlOffsetY: -10 },

          // CaboNegro bottom → Southern California (near-straight upward arc)
          { start: { lat: -85, lng: -70 }, end: { lat: 32.7157, lng: -117.1611 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 60 }, // CaboNegro bottom → San Diego
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
          { start: { lat: -85, lng: -70 }, end: { lat: 14.7167, lng: -17.4677 }, startColor: '#0ea5e9', controlOffsetX: -20, controlOffsetY: 30 },
          // CaboNegro bottom → West coast of Africa (Abidjan)
          { start: { lat: -85, lng: -70 }, end: { lat: 5.3453, lng: -4.0244 }, startColor: '#0ea5e9', controlOffsetX: -10, controlOffsetY: 20 },

          // CaboNegro bottom → China (multiple)
          { start: { lat: -85, lng: -70 }, end: { lat: 31.2304, lng: 121.4737 }, startColor: '#0ea5e9', controlOffsetX: 30, controlOffsetY: -10 }, // Shanghai
          { start: { lat: -85, lng: -70 }, end: { lat: 22.5431, lng: 114.0579 }, startColor: '#0ea5e9', controlOffsetX: 20, controlOffsetY: -5 },  // Shenzhen
          { start: { lat: -85, lng: -70 }, end: { lat: 29.8683, lng: 121.5440 }, startColor: '#0ea5e9', controlOffsetX: 25, controlOffsetY: -8 },  // Ningbo

          // CaboNegro bottom → far left border (exiting map)
          { start: { lat: -85, lng: -70 }, end: { lat: -60, lng: -180 }, startColor: '#0ea5e9', controlOffsetX: -50, controlOffsetY: 20 },

          // From far right border → China (Shanghai)
          { start: { lat: 35, lng: 180 }, end: { lat: 31.2304, lng: 121.4737 }, controlOffsetX: -40, controlOffsetY: -10 },
        ]}
      />
    </div>
  );
}


