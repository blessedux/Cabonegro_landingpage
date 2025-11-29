'use client'

import { useRef } from 'react'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { usePathname } from 'next/navigation'

interface TextSection {
  label: string
  title: string
  description: string
}

export default function AboutUs() {
  const pathname = usePathname()
  
  // Determine locale from pathname
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const aboutTitle = locale === 'es' ? 'Cabo Negro: Una localización estratégica' : locale === 'zh' ? '卡波内格罗海事码头' : locale === 'fr' ? 'Terminal Maritime Cabo Negro' : 'Cabo Negro Maritime Terminal'
  
  // Intro paragraph text
  const introParagraph = locale === 'es' 
    ? 'Chile es el país más austral del mundo. En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur. El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    : locale === 'zh'
    ? '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
    : locale === 'fr'
    ? 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
    : 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'
  
  // Define icon sections based on locale (these will be displayed as a list, not scrolling)
  const textSections: TextSection[] = locale === 'es' ? [
    {
      label: 'Ubicación Estratégica',
      title: 'Chile es el país más austral del mundo',
      description: 'En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur.'
    },
    {
      label: 'Desarrollo Portuario',
      title: 'Cabo Negro: Nodo clave para Magallanes',
      description: 'El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    },
    {
      label: 'Hidrógeno Verde',
      title: 'Potencial eólico excepcional',
      description: 'Magallanes posee uno de los mayores potenciales eólicos del planeta, ideal para la producción de hidrógeno verde y energías renovables.'
    },
    {
      label: 'Ruta Alternativa',
      title: 'Paso natural libre de peajes',
      description: 'Ruta alternativa al Canal de Panamá, paso natural libre de peajes y confiable ante restricciones globales.'
    }
  ] : locale === 'zh' ? [
    {
      label: 'Strategic Location',
      title: '智利最南端的远见性发展',
      description: '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
    },
    {
      label: 'Green Hydrogen',
      title: '绿色氢经济',
      description: '作为智利绿色氢经济的战略门户，卡波内格罗将推动可再生能源的发展。'
    },
    {
      label: 'Trade Routes',
      title: '国际贸易路线',
      description: '作为国际贸易路线的战略门户，连接全球市场。'
    },
    {
      label: 'Maritime Terminal',
      title: '海事码头',
      description: '现代化的海事码头设施，支持高效的物流和运输。'
    }
  ] : locale === 'fr' ? [
    {
      label: 'Emplacement Stratégique',
      title: 'Développement visionnaire',
      description: 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
    },
    {
      label: 'Hydrogène Vert',
      title: 'Économie de l\'hydrogène vert',
      description: 'Porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili.'
    },
    {
      label: 'Routes Commerciales',
      title: 'Routes commerciales internationales',
      description: 'Connecter les marchés mondiaux à travers des routes commerciales stratégiques.'
    },
    {
      label: 'Terminal Maritime',
      title: 'Installations modernes',
      description: 'Terminal maritime moderne avec des installations de logistique et de transport efficaces.'
    }
  ] : [
    {
      label: 'Strategic Location',
      title: 'Cabo Negro Maritime Terminal',
      description: 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'
    },
    {
      label: 'Green Hydrogen',
      title: 'Gateway to Green Hydrogen Economy',
      description: 'Positioned as the strategic gateway for Chile\'s green hydrogen economy, Cabo Negro will drive renewable energy development.'
    },
    {
      label: 'Trade Routes',
      title: 'International Trade Routes',
      description: 'Serving as a strategic gateway for international trade routes, connecting global markets.'
    },
    {
      label: 'Maritime Terminal',
      title: 'Modern Maritime Facilities',
      description: 'State-of-the-art maritime terminal facilities supporting efficient logistics and transportation.'
    }
  ]

  // No scroll logic needed - showing all content at once
  
  const sectionRef = useRef<HTMLElement>(null)
  
  return (
    <>
      {/* Spacer to ensure scroll before AboutUs section - increased to push it below fold */}
      <div className="h-[100vh] md:h-[120vh]" />
      
      {/* AboutUs section */}
      <section 
        ref={sectionRef}
        data-aboutus-section="true"
        className="relative flex flex-col justify-center bg-transparent overflow-hidden supports-[overflow:clip]:overflow-clip z-[4]"
        style={{
          backgroundColor: 'transparent',
          zIndex: 4,
          minHeight: '100vh', // Fixed to 100vh
          border: '2px solid red' // DEBUG: Red border for section
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24" style={{ border: '2px solid blue' }}>
          {/* Title */}
          <div className="mb-12 w-full text-center" style={{ border: '2px solid yellow' }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-center text-white" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                <BlurTextAnimation 
                  text={aboutTitle}
                  fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                  textColor="text-white"
                  animationDelay={0}
                />
              </h2>
                  </div>

          {/* Content Container - Reorganized layout */}
          <div 
            className="max-w-md mx-auto lg:max-w-none"
            style={{
              border: '2px solid green'
            }}
          >
            <div 
              className="flex flex-col lg:flex-row lg:gap-12 items-start"
              style={{
                border: '2px solid purple'
              }}
            >
              {/* Left column - Paragraph first, then icons */}
              <div 
                className="flex-1 w-full"
                style={{ border: '2px solid cyan' }}
              >
                {/* Intro Paragraph */}
                <div className="mb-8 lg:mb-12">
                  <p className="text-lg sm:text-xl text-white leading-relaxed">
                    {introParagraph}
                  </p>
                </div>
                
                {/* Icons Grid - 4 icons displayed as a list */}
                <div className="space-y-6 lg:space-y-8">
                  {textSections.map((section, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4"
                      style={{ border: '2px solid orange' }}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
                        {index === 0 && (
                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 4 7 7c0 3 3 6 5 8 2-2 5-5 5-8 0-3-2-5-5-5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3M10 21h4" />
                            <circle cx="12" cy="12" r="9" strokeWidth={1} strokeDasharray="1.5 2" opacity="0.5" />
                          </svg>
                        )}
                        {index === 1 && (
                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M4 18v-5c0-1 1-2 2-2h12c1 0 2 1 2 2v5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 13h12M7 10h10" />
                            <circle cx="9" cy="14" r="0.8" fill="currentColor" />
                            <circle cx="12" cy="14" r="0.8" fill="currentColor" />
                            <circle cx="15" cy="14" r="0.8" fill="currentColor" />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 4 7 7c0 3 3 6 5 8 2-2 5-5 5-8 0-3-2-5-5-5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3M10 21h4" />
                            <circle cx="12" cy="12" r="9" strokeWidth={1} strokeDasharray="1.5 2" opacity="0.5" />
                          </svg>
                        )}
                        {index === 3 && (
                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M4 18v-5c0-1 1-2 2-2h12c1 0 2 1 2 2v5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 13h12M7 10h10" />
                            <line x1="17" y1="10" x2="17" y2="7" strokeLinecap="round" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l2-1" />
                          </svg>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl text-white font-semibold mb-2">{section.title}</h3>
                        <p className="text-base lg:text-lg text-white/90 leading-relaxed">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right column - Map placeholder with margin-top */}
              <div 
                className="flex-1 flex items-start lg:sticky lg:z-10 w-full lg:w-auto mt-8 lg:mt-0"
                style={{
                  border: '2px solid magenta',
                  top: '80px' // Margin from top to avoid overlapping title
                }}
              >
                <div 
                  className="w-full h-[400px] lg:h-[500px] bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center"
                  style={{ border: '2px solid lime' }}
                >
                <div className="text-center text-gray-400">
                  <svg 
                    className="w-24 h-24 mx-auto mb-4 opacity-50" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                    />
                  </svg>
                    <p className="text-sm font-medium text-white/70">
                      {locale === 'es' ? 'Mapa Interactivo' : locale === 'zh' ? '交互式地图' : locale === 'fr' ? 'Carte Interactive' : 'Interactive Map'}
                    </p>
                    <p className="text-xs mt-2 opacity-75 text-white/50">
                      {locale === 'es' ? 'Próximamente' : locale === 'zh' ? '即将推出' : locale === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Spacer to push next section - reduced since section is more compact */}
      <div className="h-[40vh] md:h-[50vh]" />
    </>
  )
}
