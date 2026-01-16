'use client'

import { useParams, usePathname } from 'next/navigation'
import { Download, Calendar, Mail, Warehouse, Truck, Factory, Zap, Wrench } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import Navbar from '@/components/sections/Navbar'
import NavbarEs from '@/components/sections/Navbar-es'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function ParqueLogisticoPage() {
  const params = useParams()
  const pathname = usePathname()
  // Use pathname for consistent locale detection across all pages
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : (params?.locale as string || 'en')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  
  const heroVideo = 'https://storage.reimage.dev/mente-files/vid-81121d04042e/original.mp4'

  // Check if video is already loaded (cached) when component mounts
  useEffect(() => {
    // Small delay to ensure video element is set up
    const checkVideoState = () => {
      if (videoRef.current) {
        // Check if video is already loaded (readyState >= 3 means HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA)
        if (videoRef.current.readyState >= 3) {
          // Add small delay to ensure placeholder shows briefly
          setTimeout(() => setVideoLoaded(true), 200)
        }
      }
    }
    
    // Check immediately and after a short delay
    checkVideoState()
    const timeout = setTimeout(checkVideoState, 100)
    
    return () => clearTimeout(timeout)
  }, [])

  // Get localized text based on locale
  const getLocalizedText = () => {
    const texts: Record<string, any> = {
      en: {
        back: 'Back',
        hero: {
          title: 'Cabo Negro II Logistics Park',
          subtitle: 'Macro Development Industrial Zone'
        },
        terrain: {
          title: 'Available Terrain',
          description: 'The Cabo Negro II Logistics Park offers extensive industrial terrain ready for development. The area provides strategic advantages for logistics operations, industrial facilities, and support services for the maritime terminal and surrounding projects.',
          size: 'Extensive hectares available for development',
          readyText: 'Ready for immediate development and investment'
        },
        uses: {
          title: 'Recommended Uses',
          description: 'The logistics park is designed to accommodate various industrial and logistics activities:',
          items: [
            { icon: Warehouse, title: 'Warehouses', description: 'Storage and distribution facilities' },
            { icon: Truck, title: 'Logistics', description: 'Transportation and cargo handling operations' },
            { icon: Factory, title: 'Industrial Suppliers', description: 'Support services for industrial projects' },
            { icon: Zap, title: 'H2V Infrastructure', description: 'Green hydrogen production and storage facilities' },
            { icon: Wrench, title: 'Maintenance', description: 'Equipment maintenance and repair services' }
          ]
        },
        explore: {
          button: 'Explore Terrain'
        },
        contact: {
          title: 'Get in Touch',
          description: 'Interested in the Logistics Park? Contact us for more information.',
          contactBtn: 'Contact',
          scheduleBtn: 'Schedule Meeting',
          downloadBtn: 'Download Fact Sheet'
        },
        strategicLocation: {
          title: 'Strategic Location',
          description: 'The logistics park is strategically positioned to serve as a support hub for the maritime terminal and surrounding industrial projects. Its proximity to Route 9 and the port provides excellent connectivity for logistics operations.',
          items: [
            'Direct access to Route 9 North',
            'Close proximity to maritime terminal',
            'Connection via international airport at 5 km',
            'Industrial zone with expansion potential',
            'Supporting infrastructure ready'
          ],
          imageAlt: 'Patagon Valley - Industrial Development Zone'
        }
      },
      es: {
        back: 'Volver',
        hero: {
          title: 'Parque Logístico Cabo Negro II',
          subtitle: 'Macro Lote - Zona Industrial'
        },
        terrain: {
          title: 'Terreno Disponible',
          description: 'El Parque Logístico Cabo Negro II ofrece extenso terreno industrial listo para desarrollo. El área proporciona ventajas estratégicas para operaciones logísticas, instalaciones industriales y servicios de apoyo para el terminal marítimo y proyectos circundantes.',
          size: 'Extensas hectáreas disponibles para desarrollo',
          readyText: 'Listo para desarrollo e inversión inmediata'
        },
        uses: {
          title: 'Usos Recomendados',
          description: 'El parque logístico está diseñado para acomodar diversas actividades industriales y logísticas:',
          items: [
            { icon: Warehouse, title: 'Bodegas', description: 'Instalaciones de almacenamiento y distribución' },
            { icon: Truck, title: 'Logística', description: 'Operaciones de transporte y manejo de carga' },
            { icon: Factory, title: 'Proveedores Industriales', description: 'Servicios de apoyo para proyectos industriales' },
            { icon: Zap, title: 'Infraestructura H2V', description: 'Instalaciones de producción y almacenamiento de hidrógeno verde' },
            { icon: Wrench, title: 'Mantenimiento', description: 'Servicios de mantenimiento y reparación de equipos' }
          ]
        },
        explore: {
          button: 'Explorar Terreno'
        },
        contact: {
          title: 'Contáctanos',
          description: '¿Interesado en el Parque Logístico? Contáctanos para más información.',
          contactBtn: 'Contacto',
          scheduleBtn: 'Agendar Reunión',
          downloadBtn: 'Descargar Fact Sheet'
        },
        strategicLocation: {
          title: 'Ubicación Estratégica',
          description: 'El parque logístico está estratégicamente posicionado para servir como centro de apoyo para el terminal marítimo y proyectos industriales circundantes. Su proximidad a la Ruta 9 y al puerto proporciona excelente conectividad para operaciones logísticas.',
          items: [
            'Acceso directo a la Ruta 9 Norte',
            'Cercanía al terminal marítimo',
            'Conexión vía aeropuerto internacional a 5 km',
            'Zona industrial con potencial de expansión',
            'Infraestructura de apoyo lista'
          ],
          imageAlt: 'Valle Patagónico - Zona de Desarrollo Industrial'
        }
      },
      zh: {
        back: '返回',
        hero: {
          title: '卡波内格罗二期物流园区',
          subtitle: '大型开发工业区'
        },
        terrain: {
          title: '可用土地',
          description: '卡波内格罗二期物流园区提供大量可供开发的工业用地。该区域为物流运营、工业设施以及海运码头和周边项目的支持服务提供战略优势。',
          size: '大量公顷土地可供开发',
          readyText: '准备立即开发和投资'
        },
        uses: {
          title: '推荐用途',
          description: '物流园区设计用于容纳各种工业和物流活动：',
          items: [
            { icon: Warehouse, title: '仓库', description: '仓储和配送设施' },
            { icon: Truck, title: '物流', description: '运输和货物处理运营' },
            { icon: Factory, title: '工业供应商', description: '工业项目的支持服务' },
            { icon: Zap, title: 'H2V基础设施', description: '绿色氢能生产和储存设施' },
            { icon: Wrench, title: '维护', description: '设备维护和维修服务' }
          ]
        },
        explore: {
          button: '探索地形'
        },
        contact: {
          title: '联系我们',
          description: '对物流园区感兴趣？联系我们了解更多信息。',
          contactBtn: '联系',
          scheduleBtn: '安排会议',
          downloadBtn: '下载概况表'
        },
        strategicLocation: {
          title: '战略位置',
          description: '物流园区战略定位为海运码头和周边工业项目的支持中心。靠近9号公路和港口，为物流运营提供了出色的连通性。',
          items: [
            '直接通往9号公路北段',
            '靠近海运码头',
            '距离国际机场5公里',
            '具有扩展潜力的工业区',
            '支持基础设施已就绪'
          ],
          imageAlt: '巴塔哥尼亚山谷 - 工业开发区'
        }
      },
      fr: {
        back: 'Retour',
        hero: {
          title: 'Parc Logistique Cabo Negro II',
          subtitle: 'Macro Lot - Zone Industrielle'
        },
        terrain: {
          title: 'Terrain Disponible',
          description: 'Le Parc Logistique Cabo Negro II offre un vaste terrain industriel prêt pour le développement. La zone offre des avantages stratégiques pour les opérations logistiques, les installations industrielles et les services de soutien pour le terminal maritime et les projets environnants.',
          size: 'Vastes hectares disponibles pour le développement',
          readyText: 'Prêt pour le développement et l\'investissement immédiats'
        },
        uses: {
          title: 'Utilisations Recommandées',
          description: 'Le parc logistique est conçu pour accueillir diverses activités industrielles et logistiques :',
          items: [
            { icon: Warehouse, title: 'Entrepôts', description: 'Installations de stockage et de distribution' },
            { icon: Truck, title: 'Logistique', description: 'Opérations de transport et de manutention de cargaison' },
            { icon: Factory, title: 'Fournisseurs Industriels', description: 'Services de soutien pour projets industriels' },
            { icon: Zap, title: 'Infrastructure H2V', description: 'Installations de production et de stockage d\'hydrogène vert' },
            { icon: Wrench, title: 'Maintenance', description: 'Services de maintenance et de réparation d\'équipements' }
          ]
        },
        explore: {
          button: 'Explorer le Terrain'
        },
        contact: {
          title: 'Contactez-nous',
          description: 'Intéressé par le Parc Logistique ? Contactez-nous pour plus d\'informations.',
          contactBtn: 'Contact',
          scheduleBtn: 'Planifier une Réunion',
          downloadBtn: 'Télécharger la Fiche Technique'
        },
        strategicLocation: {
          title: 'Emplacement Stratégique',
          description: 'Le parc logistique est stratégiquement positionné pour servir de centre de soutien pour le terminal maritime et les projets industriels environnants. Sa proximité de la Route 9 et du port offre une excellente connectivité pour les opérations logistiques.',
          items: [
            'Accès direct à la Route 9 Nord',
            'Proximité du terminal maritime',
            'Connexion via aéroport international à 5 km',
            'Zone industrielle avec potentiel d\'expansion',
            'Infrastructure de soutien prête'
          ],
          imageAlt: 'Vallée de Patagonie - Zone de Développement Industriel'
        }
      }
    }
    return texts[locale] || texts.en
  }

  const localizedText = getLocalizedText()

  // Get appropriate Navbar component
  const getNavbar = () => {
    if (locale === 'es') return <NavbarEs />
    if (locale === 'zh') return <NavbarZh />
    return <Navbar />
  }

  const contactPath = `/${locale}/contact?from=parque-logistico`

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      {getNavbar()}

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Lazy Loading Placeholder Image */}
          <div 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              zIndex: 1,
              opacity: videoLoaded ? 0 : 1,
              transition: 'opacity 0.6s ease-in-out',
              pointerEvents: 'none'
            }}
          >
            <Image
              src="/cabonegro_slide3.webp"
              alt="Cabo Negro II Logistics Park"
              fill
              className="object-cover"
              priority
              quality={90}
            />
          </div>
          
          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              zIndex: 2,
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out'
            }}
            onLoadedData={() => {
              console.log('✅ Parque Logistico video loaded data:', heroVideo)
              // Small delay to ensure placeholder is visible briefly
              setTimeout(() => setVideoLoaded(true), 100)
            }}
            onCanPlay={() => {
              console.log('✅ Parque Logistico video can play:', heroVideo)
              // Small delay to ensure placeholder is visible briefly
              setTimeout(() => setVideoLoaded(true), 100)
            }}
            onLoadedMetadata={() => {
              console.log('✅ Parque Logistico video metadata loaded:', heroVideo)
            }}
            onStalled={() => {
              console.warn('⚠️ Parque Logistico video stalled:', heroVideo)
            }}
            onWaiting={() => {
              console.warn('⚠️ Parque Logistico video waiting for data:', heroVideo)
            }}
            onError={(e) => {
              const video = e.currentTarget
              const error = video.error
              let errorMessage = 'Unknown error'
              
              if (error) {
                switch (error.code) {
                  case error.MEDIA_ERR_ABORTED:
                    errorMessage = 'Video loading aborted'
                    break
                  case error.MEDIA_ERR_NETWORK:
                    errorMessage = 'Network error while loading video'
                    break
                  case error.MEDIA_ERR_DECODE:
                    errorMessage = 'Video decoding error'
                    break
                  case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = 'Video format not supported or source not found'
                    break
                  default:
                    errorMessage = `Video error code: ${error.code}`
                }
              }
              
              console.error('❌ Parque Logistico video loading error:', {
                message: errorMessage,
                error: error,
                src: heroVideo,
                networkState: video.networkState,
                readyState: video.readyState
              })
              setVideoError(true)
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" style={{ zIndex: 3 }} />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            {localizedText.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-white">
            {localizedText.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Available Terrain Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.terrain.title}
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-4xl leading-relaxed">
            {localizedText.terrain.description}
          </p>
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Warehouse className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {localizedText.terrain.size}
                </p>
                <p className="text-gray-600">
                  {localizedText.terrain.readyText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Uses Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.uses.title}
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-4xl">
            {localizedText.uses.description}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedText.uses.items.map((item: any, index: number) => {
              const IconComponent = item.icon
              const isExpanded = expandedCard === index
              return (
                <Card 
                  key={index} 
                  className="bg-white border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden shadow-sm"
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                >
                  <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center">
                    {/* Icon - fades out when expanded */}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                        isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    >
                      <IconComponent className="w-16 h-16 text-green-600" />
                    </div>
                    {/* Text - fades in when expanded */}
                    <div 
                      className={`text-center transition-opacity duration-300 ${
                        isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Map Placeholder Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="relative w-full h-[600px] md:h-[700px] rounded-lg overflow-hidden border border-gray-200">
            <div className="absolute inset-0 scale-110">
              <Image
                src="/Patagon_Valley_v2.webp"
                alt="Parque Logístico Cabo Negro II"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">{localizedText.strategicLocation.title}</h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {localizedText.strategicLocation.description}
              </p>
              <ul className="space-y-3 text-gray-700">
                {localizedText.strategicLocation.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/patagon_valley.webp"
                alt={localizedText.strategicLocation.imageAlt}
                fill
                className="object-cover"
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

