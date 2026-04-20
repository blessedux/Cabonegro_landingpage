'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Network, Route } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Icon from '@mdi/react'
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { ParqueTecnologicoHero } from '@/components/sections/ParqueTecnologicoHero'
import { useHeroBridgeProgress } from '@/hooks/useHeroBridgeProgress'
import { mdiGantryCrane, mdiSatelliteVariant } from '@mdi/js'

// Code-split navigation components - only load when needed
const Navbar = dynamic(() => import('@/components/sections/Navbar'), { ssr: false })
const NavbarEs = dynamic(() => import('@/components/sections/Navbar-es'), { ssr: false })
const NavbarZh = dynamic(() => import('@/components/sections/Navbar-zh'), { ssr: false })

// Code-split footer and cookie banner - only load when needed
// Enable SSR for footer - it's lightweight and should render immediately
const Footer = dynamic(() => import('@/components/sections/Footer'), { 
  ssr: true
})
const CookieBanner = dynamic(() => import('@/components/sections/CookieBanner'), { ssr: false })

export default function ParqueTecnologicoPage() {
  const pathname = usePathname()
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const HERO_VIDEO = 'https://storage.reimage.dev/mente-files/vid-81121d04042e/original.mp4'

  // Get localized text based on locale
  const getLocalizedText = () => {
    const texts: Record<string, any> = {
      en: {
        back: 'Back',
        hero: {
          title: 'Patagon Valley',
          subtitle: 'Technological & Logistic Park',
          posterAlt: 'Patagon Valley — technological and logistics park'
        },
        vision: {
          title: 'Technological Ecosystem of the Southernmost End of the World',
          subtitle: 'For energy-intensive companies, satellite connectivity and advanced industrial operations',
          description: 'Patagon Valley has available land, ideal for companies seeking to develop their projects in an area with excellent connectivity in every sense. The land has a strategic location in terms of:',
          items: [
            {
              title: 'Direct Connection to Austral Fiber Optic',
              description: 'Allowing high-capacity and low-latency data transmission.'
            },
            {
              title: 'Immediate Access to Route 9 North',
              description: 'International highway connecting the southern end of Chile with Argentina and the rest of Patagonia.'
            },
            {
              title: 'Privileged Satellite Connection',
              description: 'Taking advantage of the polar LEO (Low Earth Orbit), which offers greater communication stability and speed in data transfer thanks to the proximity of satellites to the Earth\'s surface.'
            },
            {
              title: 'Logistics Connectivity with Port Project',
              description: 'Since Patagon Valley land is located X km from the Cabo Negro Maritime Terminal area, making it an ideal alternative for technological and logistics projects requiring operational proximity to the port.'
            }
          ]
        },
        commercial: {
          title: 'Commercial Focus',
          description: 'We are open to receiving any company or institution interested in developing their projects within our areas, promoting the natural synergy generated in this port, technological and logistics hub. Considering the characteristics of the different pillars of Cabo Negro, we identify as potential interested parties companies linked to:',
          sectors: [
            'Artificial Intelligence',
            'Marine Robotics',
            'Energy and industries associated with green hydrogen',
            'Satellite and space sector',
            'Data centers and high energy demand services',
            'Telecommunications and advanced connectivity',
            'Logistics and industrial development'
          ]
        },
        clients: {
          title: 'Our Clients',
          subtitle: 'Leading companies trust Patagon Valley'
        },
        explore: {
          button: 'Explore Terrain'
        },
        contact: {
          title: 'Get in Touch',
          description: 'Interested in Patagon Valley? Contact us for more information.',
          contactBtn: 'Contact',
          scheduleBtn: 'Schedule Meeting',
          downloadBtn: 'Download Fact Sheet'
        }
      },
      es: {
        back: 'Volver',
        hero: {
          title: 'Parque Tecnológico & Logístico',
          subtitle: 'Parque Tecnológico & Logístico',
          posterAlt: 'Parque Tecnológico y Logístico Patagon Valley'
        },
        vision: {
          title: 'Ecosistema tecnológico del extremo sur del mundo',
          subtitle: 'Para empresas intensivas en energía, conectividad satelital y operaciones industriales avanzadas',
          description: 'Patagon Valley cuenta con terrenos disponibles, ideales para empresas que busquen desarrollar sus proyectos en una zona con excelente conectividad en todo sentido. Los terrenos cuentan con una ubicación estratégica en cuanto:',
          items: [
            {
              title: 'Conexión directa a Fibra Óptica Austral',
              description: 'Permitiendo transmisión de datos de alta capacidad y baja latencia.'
            },
            {
              title: 'Acceso inmediato a Ruta 9 Norte',
              description: 'Carretera internacional que conecta el extremo sur de Chile con Argentina y el resto de la Patagonia.'
            },
            {
              title: 'Conexión satelital privilegiada',
              description: 'Aprovechando la órbita polar LEO (Low Earth Orbit), que ofrece mayor estabilidad en la comunicación y rapidez en el traspaso de datos gracias a la cercanía de los satélites a la superficie terrestre.'
            },
            {
              title: 'Conectividad logística con el proyecto portuario',
              description: 'Ya que los terrenos de Patagon Valley colindan con el área del Terminal Marítimo Cabo Negro, lo que los convierte en una alternativa ideal para proyectos tecnológicos y logísticos que requieran proximidad operativa al puerto.'
            }
          ]
        },
        commercial: {
          title: 'Enfoque Comercial',
          description: 'Estamos abiertos a recibir a cualquier empresa o institución interesada en desarrollar sus proyectos dentro de nuestras áreas, promoviendo la sinergia natural que se genera en este polo portuario, tecnológico y logístico. Considerando las características de los distintos pilares de Cabo Negro, identificamos como potenciales interesados a empresas vinculadas con:',
          sectors: [
            'Inteligencia artificial',
            'Robótica marina',
            'Energía e industrias asociadas al hidrógeno verde',
            'Sector satelital y espacial',
            'Data centers y servicios de alta demanda energética',
            'Telecomunicaciones y conectividad avanzada',
            'Desarrollo logístico e industrial'
          ]
        },
        clients: {
          title: 'Nuestros Clientes',
          subtitle: 'Empresas líderes confían en Patagon Valley'
        },
        explore: {
          button: 'Explorar Terreno'
        },
        contact: {
          title: 'Contáctanos',
          description: '¿Interesado en Patagon Valley? Contáctanos para más información.',
          contactBtn: 'Contacto',
          scheduleBtn: 'Agendar Reunión',
          downloadBtn: 'Descargar Fact Sheet'
        }
      },
      zh: {
        back: '返回',
        hero: {
          title: 'Patagon Valley',
          subtitle: '科技与物流园区',
          posterAlt: 'Patagon Valley 科技与物流园区'
        },
        vision: {
          title: '世界最南端的技术生态系统',
          subtitle: '面向能源密集型公司、卫星连接和先进工业运营',
          description: 'Patagon Valley 拥有可用土地，非常适合寻求在各方面连接性极佳的地区开发项目的公司。这些土地在以下方面具有战略位置：',
          items: [
            {
              title: '直接连接南方光纤',
              description: '允许高容量和低延迟的数据传输。'
            },
            {
              title: '立即通往9号公路北段',
              description: '连接智利南端与阿根廷和巴塔哥尼亚其他地区的国际高速公路。'
            },
            {
              title: '特权卫星连接',
              description: '利用极地低地球轨道（LEO），由于卫星靠近地球表面，提供更大的通信稳定性和数据传输速度。'
            },
            {
              title: '与港口项目的物流连接',
              description: '由于 Patagon Valley 的土地位于卡波内格罗海运码头区域 X 公里处，使其成为需要靠近港口运营的技术和物流项目的理想选择。'
            }
          ]
        },
        commercial: {
          title: '商业重点',
          description: '我们欢迎任何有兴趣在我们区域内开发项目的公司或机构，促进这个港口、技术和物流中心产生的自然协同效应。考虑到卡波内格罗不同支柱的特点，我们确定以下相关公司为潜在感兴趣方：',
          sectors: [
            '人工智能',
            '海洋机器人',
            '能源和与绿色氢相关的产业',
            '卫星和空间部门',
            '数据中心和高能源需求服务',
            '电信和先进连接',
            '物流和工业发展'
          ]
        },
        clients: {
          title: '我们的客户',
          subtitle: '领先企业信任 Patagon Valley'
        },
        explore: {
          button: '探索地形'
        },
        contact: {
          title: '联系我们',
          description: '对 Patagon Valley 感兴趣？联系我们了解更多信息。',
          contactBtn: '联系',
          scheduleBtn: '安排会议',
          downloadBtn: '下载概况表'
        }
      },
      fr: {
        back: 'Retour',
        hero: {
          title: 'Patagon Valley',
          subtitle: 'Parc Technologique & Logistique',
          posterAlt: 'Patagon Valley — parc technologique et logistique'
        },
        vision: {
          title: 'Écosystème technologique de l\'extrémité la plus méridionale du monde',
          subtitle: 'Pour les entreprises à forte intensité énergétique, la connectivité satellitaire et les opérations industrielles avancées',
          description: 'Patagon Valley dispose de terrains disponibles, idéaux pour les entreprises cherchant à développer leurs projets dans une zone avec une excellente connectivité à tous égards. Les terrains ont un emplacement stratégique en termes de :',
          items: [
            {
              title: 'Connexion directe à la Fibre Optique Australe',
              description: 'Permettant la transmission de données à haute capacité et à faible latence.'
            },
            {
              title: 'Accès immédiat à la Route 9 Nord',
              description: 'Autoroute internationale reliant l\'extrémité sud du Chili à l\'Argentine et au reste de la Patagonie.'
            },
            {
              title: 'Connexion satellitaire privilégiée',
              description: 'Tirant parti de l\'orbite polaire LEO (Low Earth Orbit), qui offre une plus grande stabilité de communication et une vitesse de transfert de données grâce à la proximité des satellites à la surface de la Terre.'
            },
            {
              title: 'Connectivité logistique avec le projet portuaire',
              description: 'Étant donné que les terrains de Patagon Valley sont situés à X km de la zone du Terminal Maritime Cabo Negro, ce qui en fait une alternative idéale pour les projets technologiques et logistiques nécessitant une proximité opérationnelle au port.'
            }
          ]
        },
        commercial: {
          title: 'Focus Commercial',
          description: 'Nous sommes ouverts à recevoir toute entreprise ou institution intéressée à développer ses projets dans nos zones, promouvant la synergie naturelle générée dans ce pôle portuaire, technologique et logistique. Compte tenu des caractéristiques des différents piliers de Cabo Negro, nous identifions comme parties potentiellement intéressées les entreprises liées à :',
          sectors: [
            'Intelligence Artificielle',
            'Robotique Marine',
            'Énergie et industries associées à l\'hydrogène vert',
            'Secteur satellitaire et spatial',
            'Centres de données et services à forte demande énergétique',
            'Télécommunications et connectivité avancée',
            'Développement logistique et industriel'
          ]
        },
        clients: {
          title: 'Nos Clients',
          subtitle: 'Les entreprises leaders font confiance à Patagon Valley'
        },
        explore: {
          button: 'Explorer le Terrain'
        },
        contact: {
          title: 'Contactez-nous',
          description: 'Intéressé par Patagon Valley ? Contactez-nous pour plus d\'informations.',
          contactBtn: 'Contact',
          scheduleBtn: 'Planifier une Réunion',
          downloadBtn: 'Télécharger la Fiche Technique'
        }
      }
    }
    return texts[locale] || texts.en
  }

  const localizedText = getLocalizedText()

  const heroVisionBridgeRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const bridgeMotionEnabled = prefersReducedMotion !== true
  const rawBridgeProgress = useHeroBridgeProgress(heroVisionBridgeRef, bridgeMotionEnabled, pathname)

  const smoothHeroVision = useSpring(rawBridgeProgress, {
    stiffness: 128,
    damping: 28,
    mass: 0.2,
  })

  const hv = prefersReducedMotion === true ? rawBridgeProgress : smoothHeroVision

  const heroMediaScale = useTransform(hv, [0, 0.42, 1], [1.38, 1.12, 1])
  const heroMediaY = useTransform(hv, [0, 1], ['0%', '0%'])
  const heroMediaBlur = useTransform(hv, [0, 1], [0, 10])
  const heroContentY = useTransform(hv, [0, 1], [0, -150])
  const visionParallaxY = useTransform(hv, [0.35, 0.92], [72, 0])
  const visionParallaxOpacity = useTransform(hv, [0.25, 0.55], [0.88, 1])

  // Get appropriate Navbar component
  const getNavbar = () => {
    if (locale === 'es') return <NavbarEs />
    if (locale === 'zh') return <NavbarZh />
    return <Navbar />
  }

  // Card hover/click state management (similar to AboutUs)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const iconsContainerRef = useRef<HTMLDivElement>(null)
  const [iconOpacities, setIconOpacities] = useState<number[]>([0, 0, 0, 0])
  const maxOpacitiesRef = useRef<number[]>([0, 0, 0, 0])

  // Icon fade-in animation on scroll (similar to AboutUs)
  useEffect(() => {
    const handleIconScroll = () => {
      if (!iconsContainerRef.current) return
      
      const rect = iconsContainerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const triggerPoint = viewportHeight * 0.8
      
      const icons = iconsContainerRef.current.children
      const newOpacities: number[] = []
      
      if (rect.bottom > 0) {
        for (let i = 0; i < icons.length; i++) {
          const iconRect = icons[i].getBoundingClientRect()
          const iconTop = iconRect.top
          const iconCenter = iconTop + iconRect.height / 2
          
          const iconTriggerPoint = triggerPoint - (i * 50)
          const distance = iconCenter - iconTriggerPoint
          
          let opacity = 0
          if (distance < 0) {
            opacity = Math.min(1, 1 + (distance / 80))
          } else if (distance < 80) {
            opacity = Math.max(0, 1 - (distance / 80))
          }
          
          opacity = Math.max(0, Math.min(1, opacity))
          
          if (opacity > maxOpacitiesRef.current[i]) {
            maxOpacitiesRef.current[i] = opacity
          }
          
          if (maxOpacitiesRef.current[i] >= 1 && rect.top < viewportHeight * 1.5) {
            opacity = 1
          } else if (maxOpacitiesRef.current[i] >= 1 && rect.top > viewportHeight * 1.5) {
            opacity = Math.max(0, opacity)
          } else {
            opacity = Math.max(maxOpacitiesRef.current[i], opacity)
          }
          
          newOpacities.push(opacity)
        }
      } else {
        for (let i = 0; i < icons.length; i++) {
          if (maxOpacitiesRef.current[i] >= 1 && rect.top < viewportHeight * 2) {
            newOpacities.push(1)
          } else {
            newOpacities.push(0)
          }
        }
      }
      
      setIconOpacities(newOpacities)
    }
    
    window.addEventListener('scroll', handleIconScroll, { passive: true })
    handleIconScroll()
    
    return () => {
      window.removeEventListener('scroll', handleIconScroll)
    }
  }, [])

  // Icon components for each vision item
  const getIcon = (index: number) => {
    switch (index) {
      case 0: // Fiber Optic
        return <Network className="w-full h-full text-white" />
      case 1: // Route 9
        return <Route className="w-full h-full text-white" />
      case 2: // Satellite
        return <Icon path={mdiSatelliteVariant} size={80} className="text-white w-full h-full" />
      case 3: // Port/Logistics
        return <Icon path={mdiGantryCrane} size={80} className="text-white w-full h-full" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto">{getNavbar()}</div>
      </div>

      {/* Hero → vision: scroll bridge (same pattern as terminal / parque logístico) */}
      <div
        ref={heroVisionBridgeRef}
        className={prefersReducedMotion ? 'relative' : 'relative h-[168vh] min-h-[168vh]'}
      >
        <div
          className={
            prefersReducedMotion
              ? 'relative'
              : 'sticky top-0 z-0 h-[100dvh] min-h-[100dvh] w-full overflow-hidden'
          }
        >
          <ParqueTecnologicoHero
            title={localizedText.hero.title}
            subtitle={localizedText.hero.subtitle}
            posterSrc="/cabonegro_slide3.webp"
            posterAlt={localizedText.hero.posterAlt}
            videoSrc={HERO_VIDEO}
            scrollMotion={
              prefersReducedMotion
                ? undefined
                : {
                    mediaScale: heroMediaScale,
                    mediaY: heroMediaY,
                    contentY: heroContentY,
                    mediaBlur: heroMediaBlur,
                  }
            }
          />
        </div>
      </div>

      {/* Vision and Advantages Section */}
      <motion.section
        data-white-background="true"
        className="relative z-10 py-20 px-6 bg-white"
        style={
          prefersReducedMotion
            ? undefined
            : {
                y: visionParallaxY,
                opacity: visionParallaxOpacity,
              }
        }
      >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {localizedText.vision.title}
            </h2>
            <p className="text-xl md:text-2xl text-blue-600 mb-6 font-semibold">
              {localizedText.vision.subtitle}
            </p>
            <p className="text-xl text-gray-700 mb-8 max-w-4xl leading-relaxed">
              {localizedText.vision.description}
            </p>
          </div>
          <div ref={iconsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full items-stretch">
            {localizedText.vision.items.map((item: any, index: number) => {
              const isHovered = hoveredCard === index
              // Use title as stable unique key
              const uniqueKey = `vision-${item.title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`
              return (
                <div
                  key={uniqueKey}
                  className="relative flex flex-col items-start text-left p-6 rounded-lg border border-white/30 backdrop-blur-md transition-all duration-300 hover:border-white/40 h-full cursor-pointer overflow-hidden"
                  style={{ 
                    opacity: iconOpacities[index] || 0,
                    transform: `translateY(${iconOpacities[index] ? 0 : 20}px)`,
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHoveredCard(index)
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                    setHoveredCard(null)
                  }}
                  onClick={() => {
                    setHoveredCard(hoveredCard === index ? null : index)
                  }}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/patagon_valley.webp"
                      alt="Patagon Valley"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 w-full">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-4">
                      {getIcon(index)}
                    </div>
                    <h3 className="text-lg lg:text-xl text-white font-semibold mb-2">{item.title}</h3>
                    <div 
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isHovered ? '24rem' : '0',
                        minHeight: isHovered ? 'auto' : '0',
                      }}
                    >
                      <p 
                        className={`text-sm lg:text-base text-white/90 leading-relaxed transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Interactive Map Placeholder Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="relative w-full h-[600px] md:h-[700px] rounded-lg overflow-hidden border border-gray-200">
            <div className="absolute inset-0 scale-110">
              <Image
                src="/Patagon_Valley_v2.webp"
                alt="Patagon Valley"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {localizedText.clients.title}
            </h2>
            <p className="text-xl text-gray-700">
              {localizedText.clients.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="flex items-center justify-center h-24 w-48 bg-black rounded-lg p-6">
              <Image
                src="/logos/aws.png"
                alt="AWS"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-24 w-48 bg-black rounded-lg p-6">
              <Image
                src="/gtd_white_logo.png"
                alt="GTD"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}

