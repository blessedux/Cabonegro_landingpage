'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, Mail } from 'lucide-react'
import Image from 'next/image'
import Navbar from '@/components/sections/Navbar'
import NavbarEs from '@/components/sections/Navbar-es'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function ParqueTecnologicoPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale as string || 'en'

  // Get localized text based on locale
  const getLocalizedText = () => {
    const texts: Record<string, any> = {
      en: {
        back: 'Back',
        hero: {
          title: 'Patagon Valley',
          subtitle: 'Technological & Logistics Park'
        },
        vision: {
          title: 'Vision and Advantages',
          description: 'Patagon Valley offers unique connectivity advantages in the southernmost region of the world:',
          items: [
            'Austral Fiber Optic: High-speed connectivity infrastructure',
            'Route 9 North: Direct access to main transportation corridor',
            'LEO Orbit: Strategic location for satellite and space technology',
            'Port Proximity: Close connection to maritime terminal'
          ]
        },
        commercial: {
          title: 'Commercial Focus',
          description: 'Patagon Valley is designed for cutting-edge technology sectors:',
          sectors: [
            'Artificial Intelligence',
            'Marine Robotics',
            'Green Hydrogen',
            'Satellite and Space Technology',
            'Data Centers',
            'Telecommunications',
            'Logistics and Industry'
          ]
        },
        clients: {
          title: 'Our Clients',
          subtitle: 'Leading companies trust Patagon Valley'
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
          title: 'Patagon Valley',
          subtitle: 'Parque Tecnológico & Logístico'
        },
        vision: {
          title: 'Visión y Ventajas',
          description: 'Patagon Valley ofrece ventajas únicas de conectividad en el extremo sur del mundo:',
          items: [
            'Fibra Óptica Austral: Infraestructura de conectividad de alta velocidad',
            'Ruta 9 Norte: Acceso directo al corredor principal de transporte',
            'Órbita LEO: Ubicación estratégica para tecnología satelital y espacial',
            'Proximidad al puerto: Conexión cercana al terminal marítimo'
          ]
        },
        commercial: {
          title: 'Enfoque Comercial',
          description: 'Patagon Valley está diseñado para sectores tecnológicos de vanguardia:',
          sectors: [
            'Inteligencia Artificial',
            'Robótica Marina',
            'Hidrógeno Verde',
            'Tecnología Satelital y Espacial',
            'Centros de Datos',
            'Telecomunicaciones',
            'Logística e Industria'
          ]
        },
        clients: {
          title: 'Nuestros Clientes',
          subtitle: 'Empresas líderes confían en Patagon Valley'
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
          subtitle: '科技与物流园区'
        },
        vision: {
          title: '愿景与优势',
          description: 'Patagon Valley 在世界最南端提供独特的连接优势：',
          items: [
            '南方光纤：高速连接基础设施',
            '9号公路北段：直接通往主要交通走廊',
            '低地球轨道：卫星和空间技术的战略位置',
            '港口邻近：与海运码头的紧密连接'
          ]
        },
        commercial: {
          title: '商业重点',
          description: 'Patagon Valley 专为前沿技术领域设计：',
          sectors: [
            '人工智能',
            '海洋机器人',
            '绿色氢能',
            '卫星与空间技术',
            '数据中心',
            '电信',
            '物流与工业'
          ]
        },
        clients: {
          title: '我们的客户',
          subtitle: '领先企业信任 Patagon Valley'
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
          subtitle: 'Parc Technologique & Logistique'
        },
        vision: {
          title: 'Vision et Avantages',
          description: 'Patagon Valley offre des avantages de connectivité uniques dans la région la plus méridionale du monde :',
          items: [
            'Fibre Optique Australe : Infrastructure de connectivité haute vitesse',
            'Route 9 Nord : Accès direct au corridor de transport principal',
            'Orbite LEO : Emplacement stratégique pour la technologie satellitaire et spatiale',
            'Proximité du port : Connexion étroite au terminal maritime'
          ]
        },
        commercial: {
          title: 'Focus Commercial',
          description: 'Patagon Valley est conçu pour les secteurs technologiques de pointe :',
          sectors: [
            'Intelligence Artificielle',
            'Robotique Marine',
            'Hydrogène Vert',
            'Technologie Satellitaire et Spatiale',
            'Centres de Données',
            'Télécommunications',
            'Logistique et Industrie'
          ]
        },
        clients: {
          title: 'Nos Clients',
          subtitle: 'Les entreprises leaders font confiance à Patagon Valley'
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
  const homePath = locale === 'en' ? '/en' : `/${locale}`

  // Get appropriate Navbar component
  const getNavbar = () => {
    if (locale === 'es') return <NavbarEs />
    if (locale === 'zh') return <NavbarZh />
    return <Navbar />
  }

  const contactPath = `/${locale}/contact?from=patagon-valley`

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
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-0">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
          </div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {localizedText.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {localizedText.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Vision and Advantages Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {localizedText.vision.title}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              {localizedText.vision.description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {localizedText.vision.items.map((item: string, index: number) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <p className="text-lg">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Focus Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {localizedText.commercial.title}
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                {localizedText.commercial.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {localizedText.commercial.sectors.map((sector: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-lg">{sector}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-gray-400">Technological Innovation Hub</p>
              </div>
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
            <p className="text-xl text-gray-300">
              {localizedText.clients.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="flex items-center justify-center h-24 w-48 bg-white/5 rounded-lg p-6">
              <span className="text-2xl font-bold text-gray-300">AWS</span>
            </div>
            <div className="flex items-center justify-center h-24 w-48 bg-white/5 rounded-lg p-6">
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

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white/5">
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

