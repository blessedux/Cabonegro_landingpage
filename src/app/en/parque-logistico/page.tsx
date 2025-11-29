'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, Mail, Warehouse, Truck, Factory, Zap, Wrench } from 'lucide-react'
import Image from 'next/image'
import Navbar from '@/components/sections/Navbar'
import NavbarEs from '@/components/sections/Navbar-es'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function ParqueLogisticoPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale as string || 'en'

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
          size: 'Extensive hectares available for development'
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
        contact: {
          title: 'Get in Touch',
          description: 'Interested in the Logistics Park? Contact us for more information.',
          contactBtn: 'Contact',
          scheduleBtn: 'Schedule Meeting',
          downloadBtn: 'Download Fact Sheet'
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
          size: 'Extensas hectáreas disponibles para desarrollo'
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
        contact: {
          title: 'Contáctanos',
          description: '¿Interesado en el Parque Logístico? Contáctanos para más información.',
          contactBtn: 'Contacto',
          scheduleBtn: 'Agendar Reunión',
          downloadBtn: 'Descargar Fact Sheet'
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
          size: '大量公顷土地可供开发'
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
        contact: {
          title: '联系我们',
          description: '对物流园区感兴趣？联系我们了解更多信息。',
          contactBtn: '联系',
          scheduleBtn: '安排会议',
          downloadBtn: '下载概况表'
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
          size: 'Vastes hectares disponibles pour le développement'
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
        contact: {
          title: 'Contactez-nous',
          description: 'Intéressé par le Parc Logistique ? Contactez-nous pour plus d\'informations.',
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

  const contactPath = `/${locale}/contact?from=parque-logistico`

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
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-black to-black z-0">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
          </div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <Warehouse className="w-16 h-16 mx-auto mb-6 text-green-400" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {localizedText.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
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
          <p className="text-xl text-gray-300 mb-8 max-w-4xl leading-relaxed">
            {localizedText.terrain.description}
          </p>
          <div className="bg-white/5 rounded-lg p-8 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Warehouse className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400 mb-2">
                  {localizedText.terrain.size}
                </p>
                <p className="text-gray-400">
                  Ready for immediate development and investment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Uses Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {localizedText.uses.title}
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-4xl">
            {localizedText.uses.description}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedText.uses.items.map((item: any, index: number) => {
              const IconComponent = item.icon
              return (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-6">
                    <IconComponent className="w-10 h-10 mb-4 text-green-400" />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Strategic Location</h3>
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                The logistics park is strategically positioned to serve as a support hub for the maritime terminal and surrounding industrial projects. Its proximity to Route 9 and the port provides excellent connectivity for logistics operations.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Direct access to Route 9 North</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Close proximity to maritime terminal</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Industrial zone with expansion potential</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Supporting infrastructure ready</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-green-900/20 to-emerald-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <Truck className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-gray-400 text-lg">Industrial Development Zone</p>
              </div>
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

