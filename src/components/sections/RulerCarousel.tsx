"use client";

import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export function CaboNegroRulerCarousel() {
  const originalItems: CarouselItem[] = [
    { 
      id: 1, 
      title: "FOUNDATION",
      phaseTitle: "PHASE 1: INFRASTRUCTURE FOUNDATION",
      description: "Complete maritime concession approval and establish basic port infrastructure with 350m platform and ramp access.",
      date: "2025"
    },
    { 
      id: 2, 
      title: "DEVELOPMENT",
      phaseTitle: "PHASE 2: INDUSTRIAL DEVELOPMENT",
      description: "Develop 300+ hectares of industrial infrastructure with 13MW electrical capacity and internal road network.",
      date: "2025"
    },
    { 
      id: 3, 
      title: "HYDROGEN",
      phaseTitle: "PHASE 3: HYDROGEN HUB",
      description: "Establish green hydrogen production facilities and processing infrastructure for H₂V export capabilities.",
      date: "2026"
    },
    { 
      id: 4, 
      title: "ENERGY",
      phaseTitle: "PHASE 4: WIND ENERGY INTEGRATION",
      description: "Deploy wind power infrastructure with 7x Chile's current capacity to power hydrogen production.",
      date: "2026"
    },
    { 
      id: 5, 
      title: "EXPANSION",
      phaseTitle: "PHASE 5: MARITIME EXPANSION",
      description: "Complete 350m bridge and 300m pier construction for full maritime terminal operations.",
      date: "2026"
    },
    { 
      id: 6, 
      title: "LOGISTICS",
      phaseTitle: "PHASE 6: LOGISTICS NETWORK",
      description: "Establish comprehensive logistics and supply chain infrastructure for global trade operations.",
      date: "2026"
    },
    { 
      id: 7, 
      title: "REGULATION",
      phaseTitle: "PHASE 7: REGULATORY COMPLIANCE",
      description: "Achieve full international maritime standards compliance and environmental certifications.",
      date: "2026"
    },
    { 
      id: 8, 
      title: "LAUNCH",
      phaseTitle: "PHASE 8: OPERATIONAL LAUNCH",
      description: "Commence full-scale operations as strategic gateway connecting Atlantic and Pacific trade routes.",
      date: "2027"
    },
    { 
      id: 9, 
      title: "ESTABLISH",
      phaseTitle: "PHASE 9: GLOBAL EXPANSION",
      description: "Scale operations and establish Cabo Negro as the premier Southern Hemisphere industrial hub.",
      date: "2028"
    },
  ];
  
  return (
    <div className="min-h-screen overflow-hidden flex items-start justify-center bg-white">
      <div className="w-full">
        <RulerCarousel originalItems={originalItems} />
      </div>
    </div>
  );
}
