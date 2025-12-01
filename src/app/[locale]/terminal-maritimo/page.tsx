'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { Download, Calendar, Mail, Ship, Shield, Navigation, MapPin, Zap, Factory } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

// Type declaration for spline-viewer custom element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        url?: string
      }, HTMLElement>
    }
  }
}
import {
  ContainerScroll,
  ContainerSticky,
  ContainerAnimated,
  ContainerInset,
  HeroVideo,
  HeroButton,
} from '@/components/ui/animated-video-on-scroll'
import { RulerCarousel, type CarouselItem } from '@/components/ui/ruler-carousel'

// Code-split navigation components - only load when needed
const Navbar = dynamic(() => import('@/components/sections/Navbar'), { ssr: false })
const NavbarEs = dynamic(() => import('@/components/sections/Navbar-es'), { ssr: false })
const NavbarZh = dynamic(() => import('@/components/sections/Navbar-zh'), { ssr: false })

// Code-split footer and cookie banner - only load when needed
const Footer = dynamic(() => import('@/components/sections/Footer'), { 
  ssr: false,
  loading: () => <div className="min-h-[200px]" />
})
const CookieBanner = dynamic(() => import('@/components/sections/CookieBanner'), { ssr: false })

export default function TerminalMaritimoPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'

  // Get localized text based on locale
  const getLocalizedText = () => {
    const texts: Record<string, any> = {
      en: {
        back: 'Back',
        hero: {
          title: 'Cabo Negro Maritime Terminal',
          subtitle: 'Strategic Port Infrastructure in the Strait of Magellan'
        },
        vision: {
          title: 'Project Vision',
          description: 'The Cabo Negro Maritime Terminal represents a strategic port infrastructure project in the Strait of Magellan, designed to serve as a key logistics and maritime hub for the southernmost region of the world. The terminal will facilitate cargo operations, support green hydrogen projects, and serve as a gateway for Antarctic operations.'
        },
        developedBy: {
          title: 'Developed By',
          description: 'This project is being developed by leading companies in the maritime and logistics sector:',
          compasDescription: 'Compas Marine is a leading maritime services company with extensive experience in port operations and logistics in the southern region of Chile.'
        },
        advantages: {
          title: 'Port Advantages',
          items: [
            { icon: Shield, title: 'Protected Port', description: 'Strategic location with natural protection' },
            { icon: MapPin, title: 'Backup Areas', description: 'Ample space for logistics operations' },
            { icon: Navigation, title: 'Route 9 Access', description: 'Direct connection to main transportation corridor' },
            { icon: Factory, title: 'Outside Urban Area', description: 'Industrial zone with room for expansion' },
            { icon: Zap, title: 'Suitable for Energy Projects', description: 'Ideal location for green hydrogen infrastructure' },
            { icon: Factory, title: 'Regulatory Update Zone', description: 'Industrial area under regulatory modernization' }
          ]
        },
        commercial: {
          title: 'Commercial Focus',
          description: 'The terminal is designed to handle various types of cargo and operations:',
          items: [
            'Project Cargo',
            'Containers',
            'Bulk Cargo',
            'H2V Logistics',
            'Antarctic Operations'
          ]
        },
        timeline: {
          title: 'Project Timeline',
          description: 'Key milestones from 2021 to 2028',
          readyToBuild: 'Ready to Build',
          events: {
            '2021': 'Project Initiation',
            '2022': 'Feasibility Studies',
            '2023': 'Design Phase',
            '2024': 'Permits and Approvals',
            '2025': 'Construction Start',
            '2026': 'Phase 1 Completion',
            '2027': 'Phase 2 Development',
            '2028': 'Ready to Build (RtB)'
          }
        },
        map: {
          title: 'Global Connections',
          comingSoon: 'Interactive Map Coming Soon'
        },
        contact: {
          title: 'Get in Touch',
          description: 'Interested in the Maritime Terminal? Contact us for more information.',
          contactBtn: 'Contact',
          scheduleBtn: 'Schedule Meeting',
          downloadBtn: 'Download Fact Sheet'
        }
      },
      es: {
        back: 'Volver',
        hero: {
          title: 'Terminal Marítimo Cabo Negro',
          subtitle: 'Infraestructura Portuaria Estratégica en el Estrecho de Magallanes'
        },
        vision: {
          title: 'Visión del Proyecto',
          description: 'El Terminal Marítimo Cabo Negro representa un proyecto de infraestructura portuaria estratégica en el Estrecho de Magallanes, diseñado para servir como un nodo logístico y marítimo clave para la región más austral del mundo. El terminal facilitará operaciones de carga, apoyará proyectos de hidrógeno verde y servirá como puerta de entrada para operaciones antárticas.'
        },
        developedBy: {
          title: 'Desarrollado Por',
          description: 'Este proyecto está siendo desarrollado por empresas líderes en el sector marítimo y logístico:',
          compasDescription: 'Compas Marine es una empresa líder en servicios marítimos con amplia experiencia en operaciones portuarias y logística en la región sur de Chile.'
        },
        advantages: {
          title: 'Ventajas del Puerto',
          items: [
            { icon: Shield, title: 'Puerto Protegido', description: 'Ubicación estratégica con protección natural' },
            { icon: MapPin, title: 'Áreas de Respaldo', description: 'Amplio espacio para operaciones logísticas' },
            { icon: Navigation, title: 'Acceso Ruta 9', description: 'Conexión directa al corredor principal de transporte' },
            { icon: Factory, title: 'Fuera del Área Urbana', description: 'Zona industrial con espacio para expansión' },
            { icon: Zap, title: 'Apto para Proyectos Energéticos', description: 'Ubicación ideal para infraestructura de hidrógeno verde' },
            { icon: Factory, title: 'Zona en Actualización Regulatoria', description: 'Área industrial bajo modernización regulatoria' }
          ]
        },
        commercial: {
          title: 'Enfoque Comercial',
          description: 'El terminal está diseñado para manejar diversos tipos de carga y operaciones:',
          items: [
            'Carga de Proyectos',
            'Contenedores',
            'Graneles',
            'Logística H2V',
            'Operación Antártica'
          ]
        },
        timeline: {
          title: 'Línea de Tiempo del Proyecto',
          description: 'Hitos clave desde 2021 hasta 2028',
          readyToBuild: 'Listo para Construir',
          events: {
            '2021': 'Inicio del Proyecto',
            '2022': 'Estudios de Factibilidad',
            '2023': 'Fase de Diseño',
            '2024': 'Permisos y Aprobaciones',
            '2025': 'Inicio de Construcción',
            '2026': 'Finalización Fase 1',
            '2027': 'Desarrollo Fase 2',
            '2028': 'Listo para Construir (RtB)'
          }
        },
        map: {
          title: 'Conexiones Globales',
          comingSoon: 'Mapa Interactivo Próximamente'
        },
        contact: {
          title: 'Contáctanos',
          description: '¿Interesado en el Terminal Marítimo? Contáctanos para más información.',
          contactBtn: 'Contacto',
          scheduleBtn: 'Agendar Reunión',
          downloadBtn: 'Descargar Fact Sheet'
        }
      },
      zh: {
        back: '返回',
        hero: {
          title: '卡波内格罗海运码头',
          subtitle: '麦哲伦海峡的战略港口基础设施'
        },
        vision: {
          title: '项目愿景',
          description: '卡波内格罗海运码头是麦哲伦海峡的战略港口基础设施项目，旨在作为世界最南端地区的关键物流和海运枢纽。该码头将促进货物运营，支持绿色氢能项目，并作为南极运营的门户。'
        },
        developedBy: {
          title: '开发方',
          description: '该项目由海运和物流行业的领先公司开发：',
          compasDescription: 'Compas Marine是一家领先的海运服务公司，在智利南部地区的港口运营和物流方面拥有丰富经验。'
        },
        advantages: {
          title: '港口优势',
          items: [
            { icon: Shield, title: '受保护港口', description: '具有自然保护的战略位置' },
            { icon: MapPin, title: '备用区域', description: '充足的物流运营空间' },
            { icon: Navigation, title: '9号公路通道', description: '直接连接主要交通走廊' },
            { icon: Factory, title: '城市外区域', description: '有扩展空间的工业区' },
            { icon: Zap, title: '适合能源项目', description: '绿色氢能基础设施的理想位置' },
            { icon: Factory, title: '监管更新区', description: '正在监管现代化的工业区' }
          ]
        },
        commercial: {
          title: '商业重点',
          description: '该码头设计用于处理各种类型的货物和运营：',
          items: [
            '项目货物',
            '集装箱',
            '散货',
            'H2V物流',
            '南极运营'
          ]
        },
        timeline: {
          title: '项目时间线',
          description: '2021年至2028年的关键里程碑',
          readyToBuild: '准备建设',
          events: {
            '2021': '项目启动',
            '2022': '可行性研究',
            '2023': '设计阶段',
            '2024': '许可和批准',
            '2025': '建设开始',
            '2026': '第一阶段完成',
            '2027': '第二阶段开发',
            '2028': '准备建设 (RtB)'
          }
        },
        map: {
          title: '全球连接',
          comingSoon: '交互式地图即将推出'
        },
        contact: {
          title: '联系我们',
          description: '对海运码头感兴趣？联系我们了解更多信息。',
          contactBtn: '联系',
          scheduleBtn: '安排会议',
          downloadBtn: '下载概况表'
        }
      },
      fr: {
        back: 'Retour',
        hero: {
          title: 'Terminal Maritime Cabo Negro',
          subtitle: 'Infrastructure Portuaire Stratégique dans le Détroit de Magellan'
        },
        vision: {
          title: 'Vision du Projet',
          description: 'Le Terminal Maritime Cabo Negro représente un projet d\'infrastructure portuaire stratégique dans le Détroit de Magellan, conçu pour servir de hub logistique et maritime clé pour la région la plus méridionale du monde. Le terminal facilitera les opérations de fret, soutiendra les projets d\'hydrogène vert et servira de porte d\'entrée pour les opérations antarctiques.'
        },
        developedBy: {
          title: 'Développé Par',
          description: 'Ce projet est développé par des entreprises leaders du secteur maritime et logistique :',
          compasDescription: 'Compas Marine est une entreprise leader en services maritimes avec une vaste expérience dans les opérations portuaires et la logistique dans la région sud du Chili.'
        },
        advantages: {
          title: 'Avantages du Port',
          items: [
            { icon: Shield, title: 'Port Protégé', description: 'Emplacement stratégique avec protection naturelle' },
            { icon: MapPin, title: 'Zones de Repli', description: 'Espace ample pour les opérations logistiques' },
            { icon: Navigation, title: 'Accès Route 9', description: 'Connexion directe au corridor de transport principal' },
            { icon: Factory, title: 'Hors Zone Urbaine', description: 'Zone industrielle avec espace d\'expansion' },
            { icon: Zap, title: 'Adapté aux Projets Énergétiques', description: 'Emplacement idéal pour l\'infrastructure d\'hydrogène vert' },
            { icon: Factory, title: 'Zone de Mise à Jour Réglementaire', description: 'Zone industrielle sous modernisation réglementaire' }
          ]
        },
        commercial: {
          title: 'Focus Commercial',
          description: 'Le terminal est conçu pour gérer divers types de cargaison et d\'opérations :',
          items: [
            'Fret de Projet',
            'Conteneurs',
            'Vrac',
            'Logistique H2V',
            'Opérations Antarctiques'
          ]
        },
        timeline: {
          title: 'Calendrier du Projet',
          description: 'Jalons clés de 2021 à 2028',
          readyToBuild: 'Prêt à Construire',
          events: {
            '2021': 'Initiation du Projet',
            '2022': 'Études de Faisabilité',
            '2023': 'Phase de Conception',
            '2024': 'Permis et Approbations',
            '2025': 'Début de la Construction',
            '2026': 'Finalisation Phase 1',
            '2027': 'Développement Phase 2',
            '2028': 'Prêt à Construire (RtB)'
          }
        },
        map: {
          title: 'Connexions Mondiales',
          comingSoon: 'Carte Interactive Bientôt Disponible'
        },
        contact: {
          title: 'Contactez-nous',
          description: 'Intéressé par le Terminal Maritime ? Contactez-nous pour plus d\'informations.',
          contactBtn: 'Contact',
          scheduleBtn: 'Planifier une Réunion',
          downloadBtn: 'Télécharger la Fiche Technique'
        }
      }
    }
    return texts[locale] || texts.en
  }

  const localizedText = getLocalizedText()
  const homePath = locale === 'en' ? '/en' : `/${locale}`

  // Get appropriate Navbar component
  const getNavbar = () => {
    if (locale === 'es') return <NavbarEs />
    if (locale === 'zh') return <NavbarZh />
    if (locale === 'fr') return <Navbar /> // French uses default Navbar for now
    return <Navbar />
  }

  const contactPath = `/${locale}/contact?from=terminal-maritimo`

  // Timeline data for RulerCarousel - localized
  const timelineCarouselItems: CarouselItem[] = [
    { id: 1, title: '2021', date: '2021', description: localizedText.timeline.events['2021'] },
    { id: 2, title: '2022', date: '2022', description: localizedText.timeline.events['2022'] },
    { id: 3, title: '2023', date: '2023', description: localizedText.timeline.events['2023'] },
    { id: 4, title: '2024', date: '2024', description: localizedText.timeline.events['2024'] },
    { id: 5, title: '2025', date: '2025', description: localizedText.timeline.events['2025'] },
    { id: 6, title: '2026', date: '2026', description: localizedText.timeline.events['2026'] },
    { id: 7, title: '2027', date: '2027', description: localizedText.timeline.events['2027'] },
    { id: 8, title: '2028', date: '2028', description: localizedText.timeline.events['2028'] }
  ]

  // Light mode for Spanish version
  const isLightMode = locale === 'es'
  const mainBgClass = isLightMode ? 'bg-white' : 'bg-black'
  const mainTextClass = isLightMode ? 'text-gray-900' : 'text-white'

  return (
    <div className={`min-h-screen ${mainBgClass} ${mainTextClass}`}>
      {/* Navigation - Fixed at top with high z-index, always visible on this page */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          {getNavbar()}
        </div>
      </div>

      {/* Hero Section with Animated Video on Scroll */}
      <section data-hero-section="true" className="relative overflow-hidden mb-0">
        <ContainerScroll className="h-[110vh] md:h-[110vh]">
          <ContainerSticky
            style={{
              background:
                "radial-gradient(40% 40% at 50% 20%, #0e19ae 0%, #0b1387 22.92%, #080f67 42.71%, #030526 88.54%)",
              height: '110vh',
            }}
            className="px-6 py-10 text-slate-50 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <ContainerAnimated 
                className="space-y-4 text-center"
                initial="visible"
                animate="visible"
              >
                <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4 mt-24 md:mt-28">
                  {localizedText.hero.title}
                </h1>
                <p className="mx-auto max-w-[42ch] text-xl md:text-2xl opacity-80">
                  {localizedText.hero.subtitle}
                </p>
              </ContainerAnimated>

              <ContainerInset className="max-h-[450px] w-auto py-6">
                <HeroVideo
                  src="https://res.cloudinary.com/dezm9avsj/video/upload/v1764433234/cabonegro_slide2_vktkza.mp4"
                  className="w-full h-auto"
                />
              </ContainerInset>

              <ContainerAnimated
                transition={{ delay: 0 }}
                outputRange={[-120, 0]}
                inputRange={[0, 0.7]}
                className="mx-auto mt-2 w-fit"
                initial="visible"
                animate="visible"
              >
                <HeroButton
                  onClick={() => router.push(contactPath)}
                  className="border-blue-400 bg-gray-950/10 px-6 py-3 shadow-[0px_4px_24px_rgba(59,130,246,0.5)] hover:bg-slate-950/50 text-white"
                >
                  <Mail className="w-5 h-5 mr-2 inline" />
                  {localizedText.contact.contactBtn}
                </HeroButton>
              </ContainerAnimated>
            </div>
          </ContainerSticky>
        </ContainerScroll>
      </section>

      {/* Vision Section - Right after hero */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.vision.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} max-w-4xl leading-relaxed`}>
            {localizedText.vision.description}
          </p>
        </div>
      </section>

      {/* Timeline Section - RulerCarousel */}
      <section data-white-background="true" className={`py-20 px-6 min-h-[150vh] ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.timeline.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-12`}>
            {localizedText.timeline.description}
          </p>
          <div className="min-h-[100vh]">
            <RulerCarousel originalItems={timelineCarouselItems} lightMode={isLightMode} />
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-12 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.advantages.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedText.advantages.items.map((item: any, index: number) => {
              const IconComponent = item.icon
              return (
                <Card 
                  key={index} 
                  className={`${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}
                >
                  <CardContent className="p-6">
                    <IconComponent className={`w-8 h-8 mb-4 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                    <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : ''}`}>{item.title}</h3>
                    <p className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Commercial Focus Section */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.commercial.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-8`}>
            {localizedText.commercial.description}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {localizedText.commercial.items.map((item: string, index: number) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-4 ${isLightMode ? 'bg-white border border-gray-200' : 'bg-white/5'} rounded-lg`}
              >
                <Ship className={`w-5 h-5 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                <span className={`text-lg ${isLightMode ? 'text-gray-900' : ''}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.contact.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-8`}>
            {localizedText.contact.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              asChild 
              className={isLightMode 
                ? "bg-blue-600 text-white hover:bg-blue-700 font-semibold px-8 py-6" 
                : "bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6"
              }
            >
              <Link href={contactPath}>
                <Mail className="w-5 h-5 mr-2" />
                {localizedText.contact.contactBtn}
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className={isLightMode
                ? "border-gray-900 text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6"
                : "border-white text-white hover:bg-white/10 font-semibold px-8 py-6"
              }
            >
              <Link href={`${contactPath}&action=schedule`}>
                <Calendar className="w-5 h-5 mr-2" />
                {localizedText.contact.scheduleBtn}
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className={isLightMode
                ? "border-gray-900 text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6"
                : "border-white text-white hover:bg-white/10 font-semibold px-8 py-6"
              }
            >
              <Link href="#">
                <Download className="w-5 h-5 mr-2" />
                {localizedText.contact.downloadBtn}
              </Link>
            </Button>
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

