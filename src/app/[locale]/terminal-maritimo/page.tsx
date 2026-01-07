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
import { MagicText } from '@/components/ui/magic-text'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useScroll, useTransform } from 'framer-motion'

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

// Word component with bold support - must be separate component to use hooks
function BoldWord({ word, progress, range, isBold }: { word: string; progress: any; range: number[]; isBold: boolean }) {
  const opacity = useTransform(progress, range, [0, 1])
  
  return (
    <span className="relative mr-1">
      <span className="absolute opacity-20">{isBold ? <strong>{word}</strong> : word}</span>
      <motion.span style={{ opacity: opacity }}>
        {isBold ? <strong>{word}</strong> : word}
      </motion.span>
    </span>
  )
}

// Custom MagicText component with bold words support
function MagicTextWithBold({ text, className = "", boldWords = [] }: { text: string; className?: string; boldWords?: string[] }) {
  const container = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.3"],
  })
  
  const words = text.split(" ")
  
  const isBold = (word: string, index: number) => {
    const cleanWord = word.replace(/[.,;:!?]/g, '').toLowerCase()
    
    // Check each bold word/phrase
    for (const boldPhrase of boldWords) {
      const phraseWords = boldPhrase.toLowerCase().split(' ')
      
      // For single words like "Chile" or "Patagonia" - exact match only
      if (phraseWords.length === 1) {
        if (cleanWord === phraseWords[0]) {
          return true
        }
      }
      // For multi-word phrases like "Cabo Negro Maritime Terminal"
      else if (phraseWords.length > 1) {
        // Check if current word is part of the phrase and we're in the right position
        const phraseStartIndex = index
        let matches = true
        for (let i = 0; i < phraseWords.length; i++) {
          const checkIndex = phraseStartIndex + i
          if (checkIndex >= words.length) {
            matches = false
            break
          }
          const checkWord = words[checkIndex].replace(/[.,;:!?]/g, '').toLowerCase()
          if (checkWord !== phraseWords[i]) {
            matches = false
            break
          }
        }
        if (matches) {
          return true
        }
      }
    }
    
    return false
  }
  
  // Pre-process to identify which words should be bold
  const boldIndices = new Set<number>()
  const wordsLower = words.map(w => w.replace(/[.,;:!?]/g, '').toLowerCase())
  
  // Check for "Cabo Negro Maritime Terminal" phrase
  const terminalPhrase = ['cabo', 'negro', 'maritime', 'terminal']
  for (let i = 0; i <= wordsLower.length - terminalPhrase.length; i++) {
    let matches = true
    for (let j = 0; j < terminalPhrase.length; j++) {
      if (wordsLower[i + j] !== terminalPhrase[j]) {
        matches = false
        break
      }
    }
    if (matches) {
      for (let j = 0; j < terminalPhrase.length; j++) {
        boldIndices.add(i + j)
      }
    }
  }
  
  // Check for exact matches: "Chile" and "Patagonia"
  wordsLower.forEach((word, i) => {
    if (word === 'chile' || word === 'patagonia') {
      boldIndices.add(i)
    }
  })
  
  return (
    <p ref={container} className={`flex flex-wrap leading-relaxed ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        const shouldBeBold = boldIndices.has(i)
        
        return (
          <BoldWord 
            key={i}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
            isBold={shouldBeBold}
          />
        )
      })}
    </p>
  )
}

export default function TerminalMaritimoPage() {
  const pathname = usePathname()
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  
  const heroVideo = 'https://storage.reimage.dev/mente-files/vid-2d88fd081208/original.mp4'

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
            { icon: Navigation, title: 'Route 9 Access', description: 'Direct connection to main transportation corridor' }
          ]
        },
        timeline: {
          title: 'Project Timeline',
          description: 'Key milestones from 2021 to 2028',
          readyToBuild: 'Ready to Build',
          events: {
            '2021': 'May: Beach line fixation\nJuly: Maritime concession application',
            '2022': 'March: Admissibility processing CM61260\nSeptember: Oceanographic studies (UMAG)\nNovember: Conglomerate and Technical Report',
            '2023': 'January: Conceptual Engineering PRDW\nMay: Favorable pronouncement DIFROL',
            '2024': 'June: Favorable cartographic report',
            '2025': 'April: Unanimous Approval CRUBC\nApril: Favorable pronouncement DOP\nJuly: Favorable pronouncement MTT\nAugust: Decree granting Maritime Concession',
            '2026': 'Environmental studies\nRCA processing\nBasic and detailed engineering\nManeuverability studies',
            '2027': 'Continuation of studies and processing',
            '2028': 'Ready-to-Build (RtB)'
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
        },
        strategicCollaboration: {
          name: 'Felipe Morales Peralta',
          title: 'General Manager\nTerminal Maritimo Cabo Negro',
          scheduleBtn: 'Schedule Meeting',
          partnerTitle: 'Strategic Partner of the Port Project',
          description: 'Compas Marine is the partner responsible for the management and development of the Cabo Negro Maritime Terminal. With extensive experience in the design, construction, operation, and administration of maritime terminals in Chilean Patagonia, the company brings technical expertise, high-level operational standards, and a solid focus on efficiency, safety, and port innovation. Their participation ensures development aligned with industry best practices and the logistical and energy needs of the region.'
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
        },
        strategicCollaboration: {
          name: 'Felipe Morales Peralta',
          title: 'Gerente General\nTerminal Maritimo Cabo Negro',
          scheduleBtn: 'Agendar Reunión',
          partnerTitle: 'Socio Estratégico del Proyecto Portuario',
          description: 'Compas Marine es el socio responsable de la gestión y desarrollo del Terminal Marítimo Cabo Negro. Con una amplia trayectoria en el diseño, construcción, operación y administración de terminales marítimos en la Patagonia Chilena, la compañía aporta experiencia técnica, estándares operacionales de alto nivel y un enfoque sólido en eficiencia, seguridad e innovación portuaria. Su participación garantiza un desarrollo alineado con las mejores prácticas de la industria y con las necesidades logísticas y energéticas de la región.'
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
            '2021': '5月：海滩线固定\n7月：海事特许权申请',
            '2022': '3月：CM61260处理受理\n9月：海洋学研究（UMAG）\n11月：集合体和技术报告',
            '2023': '1月：概念工程设计 PRDW\n5月：DIFROL 有利声明',
            '2024': '6月：有利制图报告',
            '2025': '4月：CRUBC 一致批准\n4月：DOP 有利声明\n7月：MTT 有利声明\n8月：授予海事特许权法令',
            '2026': '环境研究\nRCA 处理\n基础和详细工程设计\n可操作性研究',
            '2027': '研究和处理的继续',
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
        },
        strategicCollaboration: {
          name: 'Felipe Morales Peralta',
          title: '总经理\n海运码头卡波内格罗',
          scheduleBtn: '安排会议',
          partnerTitle: '港口项目的战略合作伙伴',
          description: 'Compas Marine 是负责卡波内格罗海运码头管理和开发的合作伙伴。该公司在智利巴塔哥尼亚地区海运码头的设计、建设、运营和管理方面拥有丰富经验，提供专业技术、高水平的运营标准，并专注于效率、安全和港口创新。他们的参与确保了与行业最佳实践以及该地区物流和能源需求相一致的发展。'
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
            { icon: Navigation, title: 'Accès Route 9', description: 'Connexion directe au corridor de transport principal' }
          ]
        },
        timeline: {
          title: 'Calendrier du Projet',
          description: 'Jalons clés de 2021 à 2028',
          readyToBuild: 'Prêt à Construire',
          events: {
            '2021': 'Mai : Fixation de la ligne de plage\nJuillet : Demande de concession maritime',
            '2022': 'Mars : Admissibilité du traitement CM61260\nSeptembre : Études océanographiques (UMAG)\nNovembre : Conglomérat et Rapport Technique',
            '2023': 'Janvier : Ingénierie Conceptuelle PRDW\nMai : Prononcé favorable DIFROL',
            '2024': 'Juin : Rapport cartographique favorable',
            '2025': 'Avril : Approbation Unanime CRUBC\nAvril : Prononcé favorable DOP\nJuillet : Prononcé favorable MTT\nAoût : Décret d\'octroi de la Concession Maritime',
            '2026': 'Études environnementales\nTraitement RCA\nIngénierie de base et détaillée\nÉtudes de maniabilité',
            '2027': 'Poursuite des études et du traitement',
            '2028': 'Ready-to-Build (RtB)'
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
        },
        strategicCollaboration: {
          name: 'Felipe Morales Peralta',
          title: 'Directeur Général\nTerminal Maritime Cabo Negro',
          scheduleBtn: 'Planifier une Réunion',
          partnerTitle: 'Partenaire Stratégique du Projet Portuaire',
          description: 'Compas Marine est le partenaire responsable de la gestion et du développement du Terminal Maritime Cabo Negro. Avec une vaste expérience dans la conception, la construction, l\'exploitation et l\'administration de terminaux maritimes en Patagonie chilienne, l\'entreprise apporte une expertise technique, des normes opérationnelles de haut niveau et un solide focus sur l\'efficacité, la sécurité et l\'innovation portuaire. Leur participation garantit un développement aligné avec les meilleures pratiques de l\'industrie et les besoins logistiques et énergétiques de la région.'
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
    const phaseTitles: Record<string, Record<string, string>> = {
      es: {
        '2021': '2021 - Inicio del Proyecto',
        '2022': '2022 - Estudios y Tramitación',
        '2023': '2023 - Ingeniería y Pronunciamientos',
        '2024': '2024 - Informe Cartográfico',
        '2025': '2025 - Aprobaciones y Concesión',
        '2026': '2026-2028 - Estudios y Desarrollo',
        '2027': '2026-2028 - Estudios y Desarrollo',
        '2028': '2028 - Ready-to-Build'
      },
      en: {
        '2021': '2021 - Project Initiation',
        '2022': '2022 - Studies and Processing',
        '2023': '2023 - Engineering and Pronouncements',
        '2024': '2024 - Cartographic Report',
        '2025': '2025 - Approvals and Concession',
        '2026': '2026-2028 - Studies and Development',
        '2027': '2026-2028 - Studies and Development',
        '2028': '2028 - Ready-to-Build'
      },
      fr: {
        '2021': '2021 - Initiation du Projet',
        '2022': '2022 - Études et Traitement',
        '2023': '2023 - Ingénierie et Prononcés',
        '2024': '2024 - Rapport Cartographique',
        '2025': '2025 - Approbations et Concession',
        '2026': '2026-2028 - Études et Développement',
        '2027': '2026-2028 - Études et Développement',
        '2028': '2028 - Ready-to-Build'
      },
      zh: {
        '2021': '2021 - 项目启动',
        '2022': '2022 - 研究和处理',
        '2023': '2023 - 工程和声明',
        '2024': '2024 - 制图报告',
        '2025': '2025 - 批准和特许权',
        '2026': '2026-2028 - 研究和开发',
        '2027': '2026-2028 - 研究和开发',
        '2028': '2028 - 准备建设'
      }
    }

    const titles = phaseTitles[locale] || phaseTitles.en

    if (locale === 'es') {
      return [
        { 
          id: 1, 
          title: '2021', 
          date: '2021', 
          phaseTitle: titles['2021'],
          description: localizedText.timeline.events['2021']
        },
        { 
          id: 2, 
          title: '2022', 
          date: '2022', 
          phaseTitle: titles['2022'],
          description: localizedText.timeline.events['2022']
        },
        { 
          id: 3, 
          title: '2023', 
          date: '2023', 
          phaseTitle: titles['2023'],
          description: localizedText.timeline.events['2023']
        },
        { 
          id: 4, 
          title: '2024', 
          date: '2024', 
          phaseTitle: titles['2024'],
          description: localizedText.timeline.events['2024']
        },
        { 
          id: 5, 
          title: '2025', 
          date: '2025', 
          phaseTitle: titles['2025'],
          description: localizedText.timeline.events['2025']
        },
        { 
          id: 6, 
          title: '2026-2028', 
          date: '2026-2028', 
          phaseTitle: titles['2026'],
          description: localizedText.timeline.events['2026']
        },
        { 
          id: 7, 
          title: '2028', 
          date: '2028', 
          phaseTitle: titles['2028'],
          description: localizedText.timeline.events['2028']
        }
      ]
    }
    
    // For other languages, use the same structure as Spanish
    return [
      { 
        id: 1, 
        title: '2021', 
        date: '2021', 
        phaseTitle: titles['2021'],
        description: localizedText.timeline.events['2021']
      },
      { 
        id: 2, 
        title: '2022', 
        date: '2022', 
        phaseTitle: titles['2022'],
        description: localizedText.timeline.events['2022']
      },
      { 
        id: 3, 
        title: '2023', 
        date: '2023', 
        phaseTitle: titles['2023'],
        description: localizedText.timeline.events['2023']
      },
      { 
        id: 4, 
        title: '2024', 
        date: '2024', 
        phaseTitle: titles['2024'],
        description: localizedText.timeline.events['2024']
      },
      { 
        id: 5, 
        title: '2025', 
        date: '2025', 
        phaseTitle: titles['2025'],
        description: localizedText.timeline.events['2025']
      },
      { 
        id: 6, 
        title: '2026-2028', 
        date: '2026-2028', 
        phaseTitle: titles['2026'],
        description: localizedText.timeline.events['2026']
      },
      { 
        id: 7, 
        title: '2028', 
        date: '2028', 
        phaseTitle: titles['2028'],
        description: localizedText.timeline.events['2028']
      }
    ]
  }

  const timelineCarouselItems: CarouselItem[] = getTimelineItems()

  // Light mode for all language versions - white background across all locales
  const isLightMode = true // Always use white background for all languages
  const mainBgClass = 'bg-white'
  const mainTextClass = 'text-gray-900'

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
        {/* Lazy Loading Placeholder Image - fades out smoothly when video is ready */}
        <div 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            zIndex: 1,
            opacity: videoLoaded ? 0 : 1,
            transition: 'opacity 0.8s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <Image
            src="/cabonegro_slide2.webp"
            alt="Cabo Negro Maritime Terminal"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>
        
        {/* Background Video - fades in smoothly when ready */}
        <video
          ref={videoRef}
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
            transition: 'opacity 0.8s ease-in-out',
            backgroundColor: '#000000' // Black background while loading to prevent white flash
          }}
          onLoadedData={() => {
            // Only set loaded when video has enough data to play smoothly
            if (videoRef.current && videoRef.current.readyState >= 3) {
              setVideoLoaded(true)
            }
          }}
          onCanPlay={() => {
            setVideoLoaded(true)
          }}
          onCanPlayThrough={() => {
            // Best indicator that video is fully ready
            setVideoLoaded(true)
          }}
          onLoadedMetadata={() => {
            // Video metadata loaded
          }}
          onStalled={() => {
            // Video stalled - handled silently
          }}
          onWaiting={() => {
            // Video waiting for data - handled silently
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
            
            console.error('❌ Terminal Maritimo video loading error:', {
              message: errorMessage,
              error: error,
              src: heroVideo,
              networkState: video.networkState,
              readyState: video.readyState
            })
            setVideoError(true)
          }}
          onLoadStart={() => {
            setVideoLoaded(false)
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" style={{ zIndex: 3 }} />
        
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
            <p className="mt-4 text-sm italic text-white/70">
              {locale === 'es' && 'Conoce mas sobre nuestros socios estrategicos.'}
              {locale === 'en' && 'Learn more about our strategic partners.'}
              {locale === 'fr' && 'En savoir plus sur nos partenaires stratégiques.'}
              {locale === 'zh' && '了解更多关于我们的战略合作伙伴。'}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section - Right after hero */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ margin: "-10% 0px -10% 0px" }}
            className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}
          >
            {localizedText.vision.title}
          </motion.h2>
          <MagicText 
            text={localizedText.vision.description}
            className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} max-w-4xl leading-relaxed`}
          />
        </div>
      </section>

      {/* Strategic Collaboration Section - Compas Marine */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Side: Image and Logo */}
            <div className="flex flex-col items-start gap-6">
              {/* Image Container for Project Manager - Clickable LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/felipe-morales-p-2071aa6/?originalSubdomain=cl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-[300px] aspect-square transition-opacity hover:opacity-90 cursor-pointer"
              >
                <Image
                  src="/felipemoraleshighres.webp"
                  alt={`${localizedText.strategicCollaboration.name} - ${locale === 'es' ? 'Jefe de Proyecto Compas Marine' : locale === 'en' ? 'Project Manager Compas Marine' : locale === 'fr' ? 'Chef de Projet Compas Marine' : '项目经理 Compas Marine'}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded-full"
                />
              </a>
              {/* Felipe Morales Name and Title */}
              <div className="flex flex-col gap-1">
                <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {localizedText.strategicCollaboration.name}
                </h3>
                <p className={`text-lg ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  {localizedText.strategicCollaboration.title.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                      {line}
                      {i < localizedText.strategicCollaboration.title.split('\n').length - 1 && <br />}
                    </span>
                  ))}
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
                {localizedText.strategicCollaboration.scheduleBtn}
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
                    style={{ filter: isLightMode ? 'brightness(0)' : 'brightness(0) invert(1)', alignItems: 'right' }}
                  />
                </a>
              </div>
              <h3 className={`text-xl md:text-2xl font-semibold mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                {localizedText.strategicCollaboration.partnerTitle}
              </h3>
              {/* Use MagicText with bold words for English and Spanish locales, regular paragraph for others */}
              {locale === 'en' || locale === 'es' ? (
                <div className="ml-8 md:ml-12">
                  <MagicTextWithBold 
                    text={localizedText.strategicCollaboration.description}
                    className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} leading-relaxed`}
                    boldWords={[]}
                  />
                </div>
              ) : (
                <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} leading-relaxed`}>
                  {localizedText.strategicCollaboration.description}
                </p>
              )}
            </div>
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

      {/* Timeline Section - RulerCarousel */}
      <section data-white-background="true" className={`py-20 px-6 ${isLightMode ? 'bg-white' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : ''}`}>
            {localizedText.timeline.title}
          </h2>
          <p className={`text-xl ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-12`}>
            {localizedText.timeline.description}
          </p>
          <div style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}>
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

