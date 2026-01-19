"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WorldMap } from "@/components/ui/world-map";

export function WorldMapDemoZh() {
  const containerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the map section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Track scroll progress for description section
  const { scrollYProgress: descScrollYProgress } = useScroll({
    target: descriptionRef,
    offset: ["start end", "center center"]
  });

  // Map slides down from top to bottom of container as user scrolls
  const mapY = useTransform(scrollYProgress, [0, 1], ['0px', '40px']);

  // Map slides horizontally from left to right as user scrolls
  const mapX = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  // Side margins increase (map width decreases) as user scrolls
  const sideMargin = useTransform(scrollYProgress, [0, 1], [48, 120]);

  // Description animation - fade in and slide up
  const descOpacity = useTransform(descScrollYProgress, [0, 0.3, 1], [0, 1, 1]);
  const descY = useTransform(descScrollYProgress, [0, 0.3, 1], [50, 0, 0]);

  return (
    <div 
      ref={containerRef} 
      className="pt-0 pb-0 bg-white w-full relative z-20 md:min-h-[100vh] md:mt-0"
      data-white-background="true"
      style={{ position: 'relative' }}
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
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 7.3697, lng: 9.1244 }, startColor: '#0ea5e9', controlOffsetX: -15, controlOffsetY: 25 },
            { start: { lat: -70.0, lng: -70.83 }, end: { lat: 50.1109, lng: 8.6821 }, startColor: '#0ea5e9', controlOffsetX: -5, controlOffsetY: 35 },
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
              { start: { lat: -70.0, lng: -70.83 }, end: { lat: 7.3697, lng: 9.1244 }, startColor: '#0ea5e9', controlOffsetX: -15, controlOffsetY: 25 },
              { start: { lat: -70.0, lng: -70.83 }, end: { lat: 50.1109, lng: 8.6821 }, startColor: '#0ea5e9', controlOffsetX: -5, controlOffsetY: 35 },
              { start: { lat: 35, lng: -180 }, end: { lat: 31.2304, lng: 121.4737 }, controlOffsetX: 40, controlOffsetY: -10 },
            ]}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Strategic Description Section - Below the map */}
      <motion.div
        ref={descriptionRef}
        className="w-full bg-white py-16 md:py-24 px-4 md:px-6"
        style={{
          opacity: descOpacity,
          y: descY
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6 text-center">
            战略海上门户
          </h3>
          <div className="space-y-4 text-black text-base md:text-lg leading-relaxed">
            <p>
              卡波内格罗位于<strong>智利最南端</strong>，直接位于<strong>麦哲伦海峡</strong>——世界上最重要的海上走廊之一。这一战略位置作为巴拿马运河的天然替代路线，连接大西洋和太平洋，无需通行费或拥堵。
            </p>
            <p>
              该地区的工业潜力得到<strong>超过1,200公顷</strong>可开发土地的支持，可直接进入深水港，能够处理高达<strong>200,000载重吨</strong>的船舶。麦哲伦海峡每年约有<strong>超过15,000艘船舶</strong>通过，随着全球贸易路线的多样化，交通量不断增长。
            </p>
            <p>
              麦哲伦地区拥有<strong>世界上最大的风能潜力之一</strong>，平均风速超过<strong>12米/秒</strong>，非常适合绿色制氢。工业房地产开发预计在未来十年内支持<strong>超过20亿美元的基础设施投资</strong>，将卡波内格罗定位为南美洲的关键物流和能源中心。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
