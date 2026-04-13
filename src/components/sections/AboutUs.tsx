'use client'

import { useRef, useState, useEffect, memo, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MdDirectionsBoat, MdEnergySavingsLeaf } from 'react-icons/md'
import Icon from '@mdi/react'
import { mdiGantryCrane, mdiSatelliteVariant } from '@mdi/js'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { LinkWithPreloader } from '@/components/ui/LinkWithPreloader'

// Code-split RotatingEarth component (includes D3.js ~200KB) - only load when needed
const RotatingEarth = dynamic(() => import('@/components/ui/rotating-earth'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] flex items-center justify-center"><div className="text-white">Loading globe...</div></div>
})

// Lazy load wrapper using Intersection Observer - only loads when component is about to enter viewport
function LazyRotatingEarth({ width = 600, height = 400, className = "" }: { width?: number; height?: number; className?: string }) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Start loading when element is 200px away from viewport (rootMargin)
          if (entry.isIntersecting && !shouldLoad) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🌍 [LazyRotatingEarth] Component entering viewport - loading RotatingEarth')
            }
            setShouldLoad(true)
            // Disconnect observer once we've triggered the load
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px', // Start loading 200px before it enters viewport
        threshold: 0.01
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  return (
    <div ref={containerRef} className={className} style={{ width, height, minHeight: height }}>
      {shouldLoad ? (
        <RotatingEarth width={width} height={height} className={className} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-white/60 text-sm">Globe will load when visible</div>
        </div>
      )}
    </div>
  )
}

interface TextSection {
  label: string
  title: string
  description: string
}

/**
 * About intro: only these exact phrases are bold.
 * Latin locales: word tokens match after stripping edge punctuation (case-insensitive).
 */
const INTRO_BOLD_PHRASES: Record<'es' | 'en' | 'fr', readonly (readonly string[])[]> = {
  es: [
    ['estrecho', 'de', 'magallanes'],
    ['cabo', 'negro'],
    ['desarrollo', 'portuario', 'logístico', 'y', 'tecnológico'],
  ],
  en: [
    ['strait', 'of', 'magellan'],
    ['cabo', 'negro'],
    ['port', 'logistics', 'and', 'technological', 'development'],
  ],
  fr: [
    ['détroit', 'de', 'magellan'],
    ['cabo', 'negro'],
    ['développement', 'portuaire', 'logistique', 'et', 'technologique'],
  ],
}

/** Chinese intros have no spaces between words — bold by exact substring. */
const ZH_INTRO_BOLD_PHRASES = ['麦哲伦海峡', '卡波内格罗', '港口、物流和技术发展'] as const

function tokenNorm(word: string): string {
  return word.replace(/^[.,;:!?¿¡]+|[.,;:!?¿¡]+$/g, '').toLowerCase()
}

function buildLatinBoldMask(words: string[], phrases: readonly (readonly string[])[]): boolean[] {
  const bold = new Array(words.length).fill(false)
  for (const phrase of phrases) {
    const len = phrase.length
    for (let i = 0; i <= words.length - len; i++) {
      let ok = true
      for (let j = 0; j < len; j++) {
        if (tokenNorm(words[i + j]) !== phrase[j]) {
          ok = false
          break
        }
      }
      if (ok) {
        for (let j = 0; j < len; j++) bold[i + j] = true
      }
    }
  }
  return bold
}

function mergeBoldRanges(ranges: { start: number; end: number }[]): { start: number; end: number }[] {
  const sorted = ranges
    .filter((r) => r.start < r.end)
    .sort((a, b) => a.start - b.start)
  const out: { start: number; end: number }[] = []
  for (const r of sorted) {
    const last = out[out.length - 1]
    if (!last || r.start > last.end) out.push({ ...r })
    else last.end = Math.max(last.end, r.end)
  }
  return out
}

/** Renders Chinese intro with bold only on exact phrase substrings (no space tokenization). */
function ChineseIntroParagraph({ text, className = '' }: { text: string; className?: string }) {
  const ranges: { start: number; end: number }[] = []
  for (const p of ZH_INTRO_BOLD_PHRASES) {
    let from = 0
    while (from < text.length) {
      const i = text.indexOf(p, from)
      if (i === -1) break
      ranges.push({ start: i, end: i + p.length })
      from = i + p.length
    }
  }
  const merged = mergeBoldRanges(ranges)
  const parts: ReactNode[] = []
  let cursor = 0
  merged.forEach((r, idx) => {
    if (cursor < r.start) {
      parts.push(
        <span key={`t-${idx}-a`}>{text.slice(cursor, r.start)}</span>
      )
    }
    parts.push(
      <span key={`t-${idx}-b`} className="font-bold">
        {text.slice(r.start, r.end)}
      </span>
    )
    cursor = r.end
  })
  if (cursor < text.length) {
    parts.push(<span key="t-end">{text.slice(cursor)}</span>)
  }
  return (
    <p
      className={`flex flex-wrap leading-relaxed ${className}`}
      style={{
        color: '#000000',
        fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
        lineHeight: '2',
        letterSpacing: '0.01em',
      }}
    >
      {parts}
    </p>
  )
}

// Simple paragraph component — Latin locales: phrase-only bold via INTRO_BOLD_PHRASES
function SimpleParagraph({ text, className = "", locale = 'en' }: { text: string; className?: string; locale?: string }) {
  if (locale === 'zh') {
    return <ChineseIntroParagraph text={text} className={className} />
  }

  const words = text.split(' ')
  const phrases =
    locale === 'es' ? INTRO_BOLD_PHRASES.es : locale === 'fr' ? INTRO_BOLD_PHRASES.fr : INTRO_BOLD_PHRASES.en
  const boldMask = buildLatinBoldMask(words, phrases)

  return (
    <p
      className={`flex flex-wrap leading-relaxed ${className}`}
      style={{
        color: '#000000',
        fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
        lineHeight: '2',
        letterSpacing: '0.01em',
      }}
    >
      {words.map((word, i) => (
        <span key={i} className={`mr-2 ${boldMask[i] ? 'font-bold' : ''}`}>
          {word}
        </span>
      ))}
    </p>
  )
}

function AboutUs() {
  const pathname = usePathname()
  
  // Determine locale from pathname
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  
  // CTA button text based on locale
  const ctaText = locale === 'es' 
    ? 'Explorar Terreno' 
    : locale === 'zh' 
    ? '探索地形' 
    : locale === 'fr'
    ? 'Explorer le Terrain'
    : 'Explore Terrain'
  
  const basePath = locale === 'en' ? '' : `/${locale}`
  const aboutTitle = locale === 'es' ? 'Cabo Negro: Una localización estratégica' : locale === 'zh' ? '卡波内格罗海事码头' : locale === 'fr' ? 'Terminal Maritime Cabo Negro' : 'Cabo Negro Maritime Terminal'
  
  // Intro paragraph text
  const introParagraph =
    locale === 'es'
      ? 'Chile es el país más austral del mundo. En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur. El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
      : locale === 'zh'
        ? '智利是世界上最南端的国家。在其最南端，蓬塔阿雷纳斯市坐落于麦哲伦海峡之上，是南半球最重要、最具战略意义的海上走廊之一。卡波内格罗片区距市区仅数分钟车程，具备港口、物流和技术发展的独特条件，正成为麦哲伦地区工业增长的关键节点。'
        : locale === 'fr'
          ? 'Le Chili est le pays le plus austral du monde. À son extrême sud, la ville de Punta Arenas est située directement sur le détroit de Magellan, l\'un des corridors maritimes les plus importants et stratégiques de l\'hémisphère sud. Le secteur de Cabo Negro, à quelques minutes de la ville, réunit des conditions uniques pour le développement portuaire, logistique et technologique, s\'imposant comme nœud clé pour la croissance industrielle de la région de Magallanes.'
          : 'Chile is the southernmost country in the world. In its far south, the city of Punta Arenas lies directly on the Strait of Magellan, one of the southern hemisphere\'s most relevant and strategic maritime corridors. The Cabo Negro area, minutes from the city, offers unique conditions for port, logistics, and technological development, establishing itself as a key node for industrial growth in Magallanes.'
  
  // Define icon sections based on locale - matching todo.md lines 54-57
  const textSections: TextSection[] = locale === 'es' ? [
    {
      label: 'Ruta Alternativa',
      title: 'Ruta alternativa al Canal de Panamá',
      description: 'Paso natural libre de peajes y confiable ante restricciones globales, conectando los océanos Atlántico y Pacífico.'
    },
    {
      label: 'Hidrógeno Verde',
      title: 'Capital energética del hidrógeno verde',
      description: 'Magallanes posee uno de los mayores potenciales eólicos del planeta, ideal para la producción de hidrógeno verde y energías renovables.'
    },
    {
      label: 'Tecnología',
      title: 'Ecosistema satelital y tecnológico',
      description: 'Infraestructura de conectividad avanzada con fibra óptica, órbita LEO y proximidad a centros tecnológicos.'
    },
    {
      label: 'Logística',
      title: 'Nodo logístico industrial',
      description: 'Cabo Negro reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    }
  ] : locale === 'zh' ? [
    {
      label: 'Trade Routes',
      title: '巴拿马运河的替代路线',
      description: '连接大西洋和太平洋的天然通道，免通行费且可靠。'
    },
    {
      label: 'Green Hydrogen',
      title: '绿色氢能源之都',
      description: '作为智利绿色氢经济的战略门户，推动可再生能源发展。'
    },
    {
      label: 'Technology',
      title: '卫星和技术生态系统',
      description: '先进连接基础设施，包括光纤、低地球轨道和接近技术中心。'
    },
    {
      label: 'Logistics',
      title: '工业物流节点',
      description: '卡波内格罗作为港口、物流和技术发展的关键节点。'
    }
  ] : locale === 'fr' ? [
    {
      label: 'Routes Commerciales',
      title: 'Route alternative au Canal de Panama',
      description: 'Passage naturel sans péage et fiable face aux restrictions mondiales, reliant les océans Atlantique et Pacifique.'
    },
    {
      label: 'Hydrogène Vert',
      title: 'Capitale énergétique de l\'hydrogène vert',
      description: 'Porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili.'
    },
    {
      label: 'Technologie',
      title: 'Écosystème satellitaire et technologique',
      description: 'Infrastructure de connectivité avancée avec fibre optique, orbite LEO et proximité des centres technologiques.'
    },
    {
      label: 'Logistique',
      title: 'Nœud logistique industriel',
      description: 'Cabo Negro réunit des conditions uniques pour le développement portuaire, logistique et technologique.'
    }
  ] : [
    {
      label: 'Trade Routes',
      title: 'Alternative Route to Panama Canal',
      description: 'Natural passage free of tolls and reliable in the face of global restrictions, connecting the Atlantic and Pacific oceans.'
    },
    {
      label: 'Green Hydrogen',
      title: 'Green Hydrogen Energy Capital',
      description: 'Positioned as the strategic gateway for Chile\'s green hydrogen economy, driving renewable energy development.'
    },
    {
      label: 'Technology',
      title: 'Satellite and Technology Ecosystem',
      description: 'Advanced connectivity infrastructure with fiber optics, LEO orbit, and proximity to technology centers.'
    },
    {
      label: 'Logistics',
      title: 'Industrial Logistics Hub',
      description: 'Cabo Negro brings together unique conditions for port, logistics, and technological development.'
    }
  ]

  const iconsContainerRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null) // Track which card is hovered
  
  
  return (
    <>
      {/* AboutUs section - normal document flow */}
      <section 
        id="about"
        data-aboutus-section="true"
        data-white-background="true"
        className="relative py-24 w-full"
        style={{
          minHeight: '100vh',
          backgroundColor: 'transparent', // Transparent to show gradient background
          zIndex: 1, // Above gradient background (0) but below navbar (100)
          position: 'relative',
          isolation: 'isolate', // Create new stacking context
          pointerEvents: 'auto' // Ensure it's interactive
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Title */}
          <div className="mb-16 w-full text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center text-black" style={{ color: '#000000', textShadow: 'none' }}>
              {aboutTitle}
            </h2>
          </div>

          {/* Content Container - Paragraph left, Globe right */}
          <div className="flex flex-col lg:flex-row lg:gap-12 items-start lg:items-start mb-12">
            {/* Left column - Paragraph */}
            <div className="flex-1 w-full lg:w-1/2 mb-12 lg:mb-0">
              <div className="p-4" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                <SimpleParagraph 
                  text={introParagraph}
                  locale={locale}
                />
              </div>
            </div>
            
            {/* Right column - Globe - Lazy loaded */}
            <div className="flex-1 w-full lg:w-1/2">
              <LazyRotatingEarth width={600} height={400} className="w-full h-full" />
            </div>
          </div>
          
          {/* Icons Grid - Full width, horizontal layout (4 columns) */}
          <div ref={iconsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-stretch">
            {textSections.map((section, index) => {
              const isHovered = hoveredCard === index
              // Use label as stable unique key
              const uniqueKey = `section-${section.label}`
              return (
                <div
                  key={uniqueKey}
                  className="flex flex-col items-start text-left p-6 rounded-lg border border-gray-200 bg-gray-50 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 h-full"
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHoveredCard(index)
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                    setHoveredCard(null)
                  }}
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-4">
                    {index === 0 && (
                      <MdDirectionsBoat className="w-full h-full text-gray-700" />
                    )}
                    {index === 1 && (
                      <MdEnergySavingsLeaf className="w-full h-full text-gray-700" />
                    )}
                    {index === 2 && (
                      <Icon path={mdiSatelliteVariant} size={80} className="text-gray-700 w-full h-full" />
                    )}
                    {index === 3 && (
                      <Icon path={mdiGantryCrane} size={80} className="text-gray-700 w-full h-full" />
                    )}
                  </div>
                  <h3 className="text-lg lg:text-xl text-gray-800 font-semibold mb-2">{section.title}</h3>
                  <div 
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isHovered ? '24rem' : '0',
                      minHeight: isHovered ? 'auto' : '0',
                    }}
                  >
                    <p 
                      className={`text-sm lg:text-base text-gray-600 leading-relaxed transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* CTA Button - Below the cards - Disabled */}
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-6 rounded-md shadow-lg transition-all duration-200"
            >
              <LinkWithPreloader href={`${basePath}/explore`}>
                <span className="flex items-center gap-2">
                  {ctaText}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </LinkWithPreloader>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

// Memoize AboutUs to prevent unnecessary re-renders
export default memo(AboutUs)
