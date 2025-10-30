"use client";

import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export function CaboNegroRulerCarousel() {
  const originalItems: CarouselItem[] = [
    { id: 1, title: "STRATEGIC GATEWAY" },
    { id: 2, title: "MARITIME TERMINAL" },
    { id: 3, title: "WIND POWER" },
    { id: 4, title: "INDUSTRIAL READY" },
    { id: 5, title: "REGULATORY ADVANTAGE" },
    { id: 6, title: "H₂V OPPORTUNITY" },
    { id: 7, title: "GREEN HYDROGEN" },
    { id: 8, title: "SUSTAINABLE ENERGY" },
    { id: 9, title: "GLOBAL TRADE" },
  ];
  
  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-black border-4 border-red-500">
      <div className="border-4 border-red-400 w-full">
        <RulerCarousel originalItems={originalItems} />
      </div>
    </div>
  );
}
