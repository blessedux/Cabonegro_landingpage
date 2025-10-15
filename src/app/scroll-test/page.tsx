'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollTestPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [language, setLanguage] = useState<'en' | 'es' | 'zh'>('en');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-section') || '0');
          if (entry.isIntersecting) {
            setCurrentSection(index);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -50% 0px'
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      title: "Cabo Negro",
      subtitle: "The Southern Gateway to the Hydrogen Era",
      content: "Where wind, sea, and vision converge.\nCabo Negro is the industrial and maritime heart of Chile's Magallanes region —\na natural corridor linking the Pacific, Atlantic, and Antarctica.\nHere begins the next global energy route.",
      position: 'left'
    },
    {
      title: "Invest in the Future of Energy",
      content: "• Magallanes could produce 13% of the world's green hydrogen.\n• The region's world-class wind potential drives one of the fastest-growing clean-energy frontiers on Earth.\n• Cabo Negro sits at the center — ready for industry, logistics, and export infrastructure.",
      position: 'right'
    },
    {
      title: "A Port Built for Tomorrow",
      content: "• Deep-water terminal with 16 m draft, designed for heavy cargo and H₂-related exports.\n• Over 300 ha of industrial land, with roads, power, and water systems in place.\n• Direct access to Route 9 — connecting the park with Punta Arenas and the Antarctic route.",
      position: 'left'
    },
    {
      title: "Strategic, Sustainable, Ready",
      content: "• Recognized as a strategic alternative to the Panama Canal.\n• Backed by Chile's updated urban plan enabling industrial expansion.\n• Supported by national institutions and leading universities.",
      position: 'right'
    },
    {
      title: "Join the Transformation",
      subtitle: "Invest now in the infrastructure powering the world's clean-energy transition.",
      content: "Cabo Negro — The Port of the Southern Wind.",
      cta: true,
      position: 'left'
    }
  ];

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' },
    zh: { name: '中文', flag: '🇨🇳' }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-white">
              Cabo Negro Scroll Test
            </h1>
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code as 'en' | 'es' | 'zh')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    language === code
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Triggers - Invisible sections for scroll detection */}
      <div className="pt-20">
        {sections.map((_, index) => (
          <div
            key={index}
            ref={(el) => { sectionRefs.current[index] = el; }}
            data-section={index}
            className="h-screen"
          />
        ))}
      </div>

      {/* Fixed Content Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center transition-all duration-1000 ease-out ${
              currentSection === index
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            <div className={`w-full px-8 sm:px-12 lg:px-16 ${
              section.position === 'left' ? 'text-left' : 'text-right'
            }`}>
              <div className={`max-w-4xl ${
                section.position === 'left' ? 'ml-0' : 'ml-auto'
              }`}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {section.title}
                </h2>
                
                {section.subtitle && (
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 mb-8 font-light">
                    {section.subtitle}
                  </p>
                )}
                
                <div className="text-lg sm:text-xl lg:text-2xl text-white/70 leading-relaxed">
                  {section.content.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex} className="mb-4">
                      {line}
                    </p>
                  ))}
                </div>

                {section.cta && (
                  <div className="mt-12 flex flex-col sm:flex-row gap-4 pointer-events-auto">
                    <button className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-white/90 transition-colors">
                      Request the Investment Deck
                    </button>
                    <button className="border border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-black transition-colors">
                      Explore the Masterplan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col gap-2">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-8 rounded-full transition-colors duration-300 ${
                currentSection === index
                  ? 'bg-white' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
