'use client'

import { usePathname } from 'next/navigation'
import { Shield, Navigation, MapPin, Zap, Factory, Calendar } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { Card, CardContent } from '@/components/ui/card'

// Type declaration for spline-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        url?: string
      }, HTMLElement>
    }
  }
}
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
            { icon: Navigation, title: 'Acceso Ruta 9', description: 'Conexión directa al corredor principal de transporte' }
          ]
        },
        timeline: {
          title: 'Línea de Tiempo del Proyecto',
          description: 'Hitos clave desde 2021 hasta 2028',
          readyToBuild: 'Listo para Construir',
          events: {
            '2021': 'Mayo: Fijación de línea de playa\nJulio: Solicitud de concesión marítima',
            '2022': 'Marzo: Admisibilidad tramitación CM61260\nSeptiembre: Estudios oceanográficos (UMAG)\nNoviembre: Conglomerado e Informe Técnico',
            '2023': 'Enero: Ingeniería Conceptual PRDW\nMayo: Pronunciamiento favorable DIFROL',
            '2024': 'Junio: Informe cartográfico favorable',
            '2025': 'Abril: Aprobación Unánime CRUBC\nAbril: Pronunciamiento favorable DOP\nJulio: Pronunciamiento favorable MTT\nAgosto: Decreto otorgamiento Concesión Marítima',
            '2026': 'Estudios ambientales\nTramitación RCA\nIngeniería básica y de detalle\nEstudios de maniobrabilidad',
            '2027': 'Continuación de estudios y tramitación',
            '2028': 'Ready-to-Build (RtB)'
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
            { icon: Navigation, title: '9号公路通道', description: '直接连接主要交通走廊' }
          ]
        },
        timeline: {
          title: '项目时间线',
          description: '2021年至2028年的关键里程碑',
          readyToBuild: '准备建设',
          events: {
            '2021': '五月：确定海岸线\n七月：申请海运特许权',
            '2022': '三月：CM61260处理受理\n九月：海洋学研究（UMAG）\n十一月：综合报告和技术报告',
            '2023': '一月：PRDW概念工程\n五月：DIFROL有利声明',
            '2024': '六月：有利的制图报告',
            '2025': '四月：CRUBC一致批准\n四月：DOP有利声明\n七月：MTT有利声明\n八月：授予海运特许权法令',
            '2026': '环境研究\nRCA处理\n基础和详细工程\n可操作性研究',
            '2027': '继续研究和处理',
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

  // Get appropriate Navbar component
  const getNavbar = () => {
    if (locale === 'es') return <NavbarEs />
    if (locale === 'zh') return <NavbarZh />
    if (locale === 'fr') return <Navbar /> // French uses default Navbar for now
    return <Navbar />
  }

  // Timeline data for RulerCarousel - localized
  const getTimelineItems = (): CarouselItem[] => {
    if (locale === 'es') {
      // Spanish version with detailed milestones
      return [
        { 
          id: 1, 
          title: '2021', 
          date: '2021', 
          phaseTitle: '2021 - Inicio del Proyecto',
          description: 'Mayo: Fijación de línea de playa\nJulio: Solicitud de concesión marítima'
        },
        { 
          id: 2, 
          title: '2022', 
          date: '2022', 
          phaseTitle: '2022 - Estudios y Tramitación',
          description: 'Marzo: Admisibilidad tramitación CM61260\nSeptiembre: Estudios oceanográficos (UMAG)\nNoviembre: Conglomerado e Informe Técnico'
        },
        { 
          id: 3, 
          title: '2023', 
          date: '2023', 
          phaseTitle: '2023 - Ingeniería y Pronunciamientos',
          description: 'Enero: Ingeniería Conceptual PRDW\nMayo: Pronunciamiento favorable DIFROL'
        },
        { 
          id: 4, 
          title: '2024', 
          date: '2024', 
          phaseTitle: '2024 - Informe Cartográfico',
          description: 'Junio: Informe cartográfico favorable'
        },
        { 
          id: 5, 
          title: '2025', 
          date: '2025', 
          phaseTitle: '2025 - Aprobaciones y Concesión',
          description: 'Abril: Aprobación Unánime CRUBC\nAbril: Pronunciamiento favorable DOP\nJulio: Pronunciamiento favorable MTT\nAgosto: Decreto otorgamiento Concesión Marítima'
        },
        { 
          id: 6, 
          title: '2026-2028', 
          date: '2026-2028', 
          phaseTitle: '2026-2028 - Estudios y Desarrollo',
          description: 'Estudios ambientales\nTramitación RCA\nIngeniería básica y de detalle\nEstudios de maniobrabilidad'
        },
        { 
          id: 7, 
          title: '2028', 
          date: '2028', 
          phaseTitle: '2028 - Ready-to-Build',
          description: 'Ready-to-Build (RtB): 2028'
        }
      ]
    }
    if (locale === 'zh') {
      // Chinese version with detailed milestones matching Spanish structure
      return [
        { 
          id: 1, 
          title: '2021', 
          date: '2021', 
          phaseTitle: '2021 - 项目启动',
          description: '五月：确定海岸线\n七月：申请海运特许权'
        },
        { 
          id: 2, 
          title: '2022', 
          date: '2022', 
          phaseTitle: '2022 - 研究和处理',
          description: '三月：CM61260处理受理\n九月：海洋学研究（UMAG）\n十一月：综合报告和技术报告'
        },
        { 
          id: 3, 
          title: '2023', 
          date: '2023', 
          phaseTitle: '2023 - 工程和声明',
          description: '一月：PRDW概念工程\n五月：DIFROL有利声明'
        },
        { 
          id: 4, 
          title: '2024', 
          date: '2024', 
          phaseTitle: '2024 - 制图报告',
          description: '六月：有利的制图报告'
        },
        { 
          id: 5, 
          title: '2025', 
          date: '2025', 
          phaseTitle: '2025 - 批准和特许权',
          description: '四月：CRUBC一致批准\n四月：DOP有利声明\n七月：MTT有利声明\n八月：授予海运特许权法令'
        },
        { 
          id: 6, 
          title: '2026-2028', 
          date: '2026-2028', 
          phaseTitle: '2026-2028 - 研究和开发',
          description: '环境研究\nRCA处理\n基础和详细工程\n可操作性研究'
        },
        { 
          id: 7, 
          title: '2028', 
          date: '2028', 
          phaseTitle: '2028 - 准备建设',
          description: '准备建设 (RtB): 2028'
        }
      ]
    }
    // Default for other languages
    return [
      { id: 1, title: '2021', date: '2021', description: localizedText.timeline.events['2021'] },
      { id: 2, title: '2022', date: '2022', description: localizedText.timeline.events['2022'] },
      { id: 3, title: '2023', date: '2023', description: localizedText.timeline.events['2023'] },
      { id: 4, title: '2024', date: '2024', description: localizedText.timeline.events['2024'] },
      { id: 5, title: '2025', date: '2025', description: localizedText.timeline.events['2025'] },
      { id: 6, title: '2026', date: '2026', description: localizedText.timeline.events['2026'] },
      { id: 7, title: '2027', date: '2027', description: localizedText.timeline.events['2027'] },
      { id: 8, title: '2028', date: '2028', description: localizedText.timeline.events['2028'] }
    ]
  }

  const timelineCarouselItems: CarouselItem[] = getTimelineItems()

  // Light mode for Spanish and Chinese versions
  const isLightMode = locale === 'es' || locale === 'zh'
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

      {/* Hero Section with Full Background Video */}
      <section data-hero-section="true" className="relative h-screen w-full overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="https://res.cloudinary.com/dezm9avsj/video/upload/v1764433234/cabonegro_slide2_vktkza.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" style={{ zIndex: 1 }} />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center text-white" style={{ zIndex: 2 }}>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4">
            {localizedText.hero.title}
          </h1>
          <p className="mx-auto max-w-[42ch] text-xl md:text-2xl opacity-90 mb-6">
            {localizedText.hero.subtitle}
          </p>
          {/* COMPAS Marine Logo */}
          <div className="mt-24">
            <a
              href="https://compasmarine.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image
                src="/logos/COMPAS_MARINE.png"
                alt="COMPAS Marine"
                width={220}
                height={110}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </a>
            {locale === 'es' && (
              <p className="mt-4 text-sm italic text-white/70">
                Conoce mas sobre nuestros socios estrategicos. 
              </p>
            )}
            {locale === 'zh' && (
              <p className="mt-4 text-sm italic text-white/70">
                了解更多关于我们的战略合作伙伴。
              </p>
            )}
          </div>
        </div>
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

      {/* Strategic Collaboration Section - Compas Marine */}
      {(locale === 'es' || locale === 'zh') && (
        <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Side: Image and Logo */}
              <div className="flex flex-col items-start gap-6">
                {/* Image Container for Project Manager */}
                <div className="w-full max-w-[300px] aspect-square">
                  <Image
                    src="/felipe_morales_perfil.jpeg"
                    alt={locale === 'zh' ? 'Felipe Morales - 卡波内格罗海运码头总经理' : 'Felipe Morales - Jefe de Proyecto Compas Marine'}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {/* Felipe Morales Name and Title */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Felipe Morales
                  </h3>
                  <p className="text-lg text-gray-600">
                    {locale === 'zh' ? (
                      <>
                        总经理 <br></br> 海运码头 <br></br> 卡波内格罗
                      </>
                    ) : (
                      <>
                        Gerente General <br></br> Terminal Maritimo <br></br> Cabo Negro
                      </>
                    )}
                  </p>
                </div>
                {/* CTA Button - Schedule Meeting */}
                <a
                  href="https://calendly.com/fmorales-cabonegro/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full"
                >
                  <Calendar className="w-5 h-5" />
                  {locale === 'zh' ? '安排会议' : 'Agendar Reunión'}
                </a>
              </div>
              
              {/* Right Side: Title and Paragraph */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                 
                  {/* Compas Marine Logo */}
                  <a
                    href="https://compasmarine.cl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-opacity hover:opacity-80 flex-shrink-0"
                  >
                    <Image
                      src="/logos/COMPAS_MARINE.png"
                      alt="COMPAS Marine"
                      width={240}
                      height={120}
                      className="object-contain"
                      style={{ filter: 'brightness(0)', alignItems: 'right' }}
                    />
                  </a>
                </div>
                <h3 className={`text-xl md:text-2xl font-semibold mb-4 ${isLightMode ? 'text-gray-900' : ''}`}>
                  {locale === 'zh' ? '港口项目的战略合作伙伴' : 'Socio Estratégico del Proyecto Portuario'}
                </h3>
                <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} leading-relaxed`}>
                  {locale === 'zh' ? (
                    'Compas Marine是负责卡波内格罗海运码头管理和开发的合作伙伴。凭借在智利巴塔哥尼亚地区海运码头的设计、建设、运营和管理方面的丰富经验，该公司提供技术专长、高水平的运营标准以及对效率、安全和港口创新的坚定承诺。其参与确保了与行业最佳实践以及该地区物流和能源需求相一致的发展。'
                  ) : (
                    'Compas Marine es el socio responsable de la gestión y desarrollo del Terminal Marítimo Cabo Negro. Con una amplia trayectoria en el diseño, construcción, operación y administración de terminales marítimos en la Patagonia Chilena, la compañía aporta experiencia técnica, estándares operacionales de alto nivel y un enfoque sólido en eficiencia, seguridad e innovación portuaria. Su participación garantiza un desarrollo alineado con las mejores prácticas de la industria y con las necesidades logísticas y energéticas de la región.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* Timeline Section - RulerCarousel */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.timeline.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-12`}>
            {localizedText.timeline.description}
          </p>
          <div>
            <RulerCarousel originalItems={timelineCarouselItems} lightMode={isLightMode} />
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

