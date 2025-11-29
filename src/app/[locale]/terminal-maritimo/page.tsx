'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, Mail, Ship, Shield, Navigation, MapPin, Zap, Factory } from 'lucide-react'
import Image from 'next/image'
import Navbar from '@/components/sections/Navbar'
import NavbarEs from '@/components/sections/Navbar-es'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function TerminalMaritimoPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale as string || 'en'

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
          description: 'This project is being developed by leading companies in the maritime and logistics sector:'
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
          description: 'Key milestones from 2021 to 2028'
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
          description: 'Este proyecto está siendo desarrollado por empresas líderes en el sector marítimo y logístico:'
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
          description: 'Hitos clave desde 2021 hasta 2028'
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
          description: '该项目由海运和物流行业的领先公司开发：'
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
          description: '2021年至2028年的关键里程碑'
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
          description: 'Ce projet est développé par des entreprises leaders du secteur maritime et logistique :'
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
          description: 'Jalons clés de 2021 à 2028'
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
    return <Navbar />
  }

  const contactPath = `/${locale}/contact?from=terminal-maritimo`

  // Timeline data
  const timelineData = [
    { year: '2021', event: 'Project Initiation' },
    { year: '2022', event: 'Feasibility Studies' },
    { year: '2023', event: 'Design Phase' },
    { year: '2024', event: 'Permits and Approvals' },
    { year: '2025', event: 'Construction Start' },
    { year: '2026', event: 'Phase 1 Completion' },
    { year: '2027', event: 'Phase 2 Development' },
    { year: '2028', event: 'Ready to Build (RtB)' }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      {getNavbar()}

      {/* Back Button */}
      <button
        onClick={() => router.push(homePath)}
        className="fixed top-24 left-6 z-50 flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        aria-label={localizedText.back}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">{localizedText.back}</span>
      </button>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black to-black z-0">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]" />
          </div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <Ship className="w-16 h-16 mx-auto mb-6 text-blue-400" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {localizedText.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {localizedText.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.vision.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl leading-relaxed">
            {localizedText.vision.description}
          </p>
        </div>
      </section>

      {/* Developed By Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.developedBy.title}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {localizedText.developedBy.description}
          </p>
          <div className="flex flex-wrap justify-start items-center gap-8">
            <div className="flex items-center justify-center h-24 w-48 bg-white/5 rounded-lg p-6">
              <span className="text-xl font-bold text-gray-300">J&P Ltda.</span>
            </div>
            <div className="flex items-center justify-center h-24 w-48 bg-white/5 rounded-lg p-6">
              <span className="text-xl font-bold text-gray-300">PPG SpA</span>
            </div>
            <div className="flex items-center justify-center h-24 w-48 bg-white/5 rounded-lg p-6">
              <a href="https://compasmarine.com" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-gray-300 hover:text-white transition-colors">
                Compas Marine
              </a>
            </div>
          </div>
          <div className="mt-8 p-6 bg-white/5 rounded-lg">
            <p className="text-gray-300 leading-relaxed">
              Compas Marine is a leading maritime services company with extensive experience in port operations and logistics in the southern region of Chile.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.timeline.title}
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            {localizedText.timeline.description}
          </p>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-500/50" />
            <div className="space-y-12">
              {timelineData.map((item, index) => (
                <div key={index} className="relative pl-20">
                  <div className="absolute left-6 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-black" />
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="text-2xl font-bold text-blue-400 mb-2">{item.year}</div>
                    <div className="text-lg text-gray-300">{item.event}</div>
                    {item.year === '2028' && (
                      <div className="mt-4 inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                        Ready to Build
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Global Connections
          </h2>
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/20 to-cyan-900/20 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400 text-lg">Interactive Map Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            {localizedText.advantages.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedText.advantages.items.map((item: any, index: number) => {
              const IconComponent = item.icon
              return (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <IconComponent className="w-8 h-8 mb-4 text-blue-400" />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Commercial Focus Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.commercial.title}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {localizedText.commercial.description}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {localizedText.commercial.items.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <Ship className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.contact.title}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {localizedText.contact.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6">
              <Link href={contactPath}>
                <Mail className="w-5 h-5 mr-2" />
                {localizedText.contact.contactBtn}
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6">
              <Link href={`${contactPath}&action=schedule`}>
                <Calendar className="w-5 h-5 mr-2" />
                {localizedText.contact.scheduleBtn}
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6">
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

