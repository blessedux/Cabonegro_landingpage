'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MagicText } from "@/components/ui/magic-text"
import { usePathname } from 'next/navigation'


const getFAQs = (locale: string) => {
  const faqs = {
    en: [
      {
        question: 'What is the investment structure for Cabo Negro Terminal?',
        answer: 'The project follows a structured 3-phase development timeline designed to minimize risk while maximizing returns. Phase 1 focuses on capital raising and initial studies (6 months), Phase 2 involves comprehensive engineering and regulatory approvals (24 months), and Phase 3 covers project sale or construction partnerships (12 months). This staged approach allows investors to participate in Chile\'s industrial transformation with clear milestones and exit opportunities.'
      },
      {
        question: 'Who are the key partners in this project?',
        answer: 'The project is developed by J&P S.A. (landowners), PPG S.A. (maritime concession holders), and Compas Marine (JV and terminal expertise). These partnerships provide the necessary land, regulatory approvals, and maritime expertise.'
      },
      {
        question: 'What makes Cabo Negro strategically important?',
        answer: 'Cabo Negro is positioned as the primary gateway to Antarctica and serves as an alternative route to the Panama Canal, free of tolls and geopolitical risks. It\'s located at the heart of the Magallanes Region, connecting Atlantic and Pacific Oceans.'
      },
      {
        question: 'What is the regulatory status of the project?',
        answer: 'The new Plan Regulador 2024-2026 extends urban limits to include Cabo Negro (3,258 hectares) and declares the area as the future industrial nucleus. This allows orderly growth and zoning for large-scale industrial projects.'
      },
      {
        question: 'How does this project support Chile\'s hydrogen economy?',
        answer: 'The terminal reduces CAPEX for H₂V companies by providing shared port infrastructure, enables faster project deployment, and reduces environmental footprint. It\'s designed specifically to serve Chile\'s growing hydrogen export industry.'
      },
      {
        question: 'What are the environmental considerations?',
        answer: 'The port has independent environmental impact vs. full hydrogen plants, is protected from tides/waves/currents, and enables reduced environmental footprint through shared infrastructure. All development follows Chile\'s environmental regulations.'
      }
    ],
    es: [
      {
        question: '¿Cuál es la estructura de inversión para el Terminal Cabo Negro?',
        answer: 'El proyecto sigue una línea de tiempo estructurada de desarrollo en 3 fases diseñada para minimizar riesgos mientras maximiza retornos. La Fase 1 se enfoca en recaudación de capital y estudios iniciales (6 meses), la Fase 2 involucra ingeniería integral y aprobaciones regulatorias (24 meses), y la Fase 3 cubre venta del proyecto o asociaciones de construcción (12 meses). Este enfoque por etapas permite a los inversionistas participar en la transformación industrial de Chile con hitos claros y oportunidades de salida.'
      },
      {
        question: '¿Quiénes son los socios clave en este proyecto?',
        answer: 'El proyecto es desarrollado por J&P S.A. (propietarios de tierras), PPG S.A. (titulares de concesión marítima), y Compas Marine (JV y experiencia en terminales). Estas asociaciones proporcionan la tierra necesaria, aprobaciones regulatorias y experiencia marítima.'
      },
      {
        question: '¿Qué hace estratégicamente importante a Cabo Negro?',
        answer: 'Cabo Negro está posicionado como la puerta de entrada principal a la Antártida y sirve como ruta alternativa al Canal de Panamá, libre de peajes y riesgos geopolíticos. Está ubicado en el corazón de la Región de Magallanes, conectando los Océanos Atlántico y Pacífico.'
      },
      {
        question: '¿Cuál es el estado regulatorio del proyecto?',
        answer: 'El nuevo Plan Regulador 2024-2026 extiende los límites urbanos para incluir Cabo Negro (3,258 hectáreas) y declara el área como el futuro núcleo industrial. Esto permite crecimiento ordenado y zonificación para proyectos industriales a gran escala.'
      },
      {
        question: '¿Cómo apoya este proyecto la economía del hidrógeno de Chile?',
        answer: 'El terminal reduce CAPEX para empresas H₂V al proporcionar infraestructura portuaria compartida, permite despliegue más rápido de proyectos y reduce la huella ambiental. Está diseñado específicamente para servir la creciente industria de exportación de hidrógeno de Chile.'
      },
      {
        question: '¿Cuáles son las consideraciones ambientales?',
        answer: 'El puerto tiene impacto ambiental independiente vs. plantas completas de hidrógeno, está protegido de mareas/olas/corrientes, y permite huella ambiental reducida a través de infraestructura compartida. Todo el desarrollo sigue las regulaciones ambientales de Chile.'
      }
    ],
    zh: [
      {
        question: '卡波内格罗终端的投资结构是什么？',
        answer: '该项目遵循结构化的3阶段开发时间表，旨在最小化风险同时最大化回报。第一阶段专注于资本筹集和初步研究（6个月），第二阶段涉及综合工程和监管批准（24个月），第三阶段涵盖项目销售或建设合作伙伴关系（12个月）。这种分阶段方法使投资者能够参与智利的工业转型，具有明确的里程碑和退出机会。'
      },
      {
        question: '这个项目的主要合作伙伴是谁？',
        answer: '该项目由J&P S.A.（土地所有者）、PPG S.A.（海事特许权持有者）和Compas Marine（合资企业和终端专业知识）开发。这些合作伙伴关系提供了必要的土地、监管批准和海事专业知识。'
      },
      {
        question: '什么使卡波内格罗具有战略重要性？',
        answer: '卡波内格罗被定位为通往南极洲的主要门户，并作为巴拿马运河的替代路线，免收通行费且无地缘政治风险。它位于麦哲伦地区的中心，连接大西洋和太平洋。'
      },
      {
        question: '项目的监管状况如何？',
        answer: '新的2024-2026年规划条例将城市边界扩展到包括卡波内格罗（3,258公顷），并将该地区宣布为未来的工业核心。这允许有序增长和大型工业项目的分区。'
      },
      {
        question: '这个项目如何支持智利的氢经济？',
        answer: '该终端通过提供共享港口基础设施来减少H₂V公司的资本支出，实现更快的项目部署，并减少环境足迹。它专门设计用于服务智利不断增长的氢出口行业。'
      },
      {
        question: '环境考虑因素是什么？',
        answer: '该港口与完整的氢工厂相比具有独立的环境影响，受到潮汐/波浪/洋流的保护，并通过共享基础设施实现减少的环境足迹。所有开发都遵循智利的环境法规。'
      }
    ],
    fr: [
      {
        question: 'Quelle est la structure d\'investissement pour le Terminal Cabo Negro?',
        answer: 'Le projet suit un calendrier de développement structuré en 3 phases conçu pour minimiser les risques tout en maximisant les rendements. La Phase 1 se concentre sur la levée de capitaux et les études initiales (6 mois), la Phase 2 implique l\'ingénierie complète et les approbations réglementaires (24 mois), et la Phase 3 couvre la vente du projet ou les partenariats de construction (12 mois). Cette approche par étapes permet aux investisseurs de participer à la transformation industrielle du Chili avec des jalons clairs et des opportunités de sortie.'
      },
      {
        question: 'Qui sont les partenaires clés de ce projet?',
        answer: 'Le projet est développé par J&P S.A. (propriétaires fonciers), PPG S.A. (titulaires de concession maritime), et Compas Marine (coentreprise et expertise en terminaux). Ces partenariats fournissent les terres nécessaires, les approbations réglementaires et l\'expertise maritime.'
      },
      {
        question: 'Qu\'est-ce qui rend Cabo Negro stratégiquement important?',
        answer: 'Cabo Negro est positionné comme la porte d\'entrée principale vers l\'Antarctique et sert de route alternative au Canal de Panama, sans péages et sans risques géopolitiques. Il est situé au cœur de la Région de Magallanes, reliant les océans Atlantique et Pacifique.'
      },
      {
        question: 'Quel est le statut réglementaire du projet?',
        answer: 'Le nouveau Plan Régulateur 2024-2026 étend les limites urbaines pour inclure Cabo Negro (3 258 hectares) et déclare la zone comme le futur noyau industriel. Cela permet une croissance ordonnée et un zonage pour les projets industriels à grande échelle.'
      },
      {
        question: 'Comment ce projet soutient-il l\'économie de l\'hydrogène du Chili?',
        answer: 'Le terminal réduit le CAPEX pour les entreprises H₂V en fournissant une infrastructure portuaire partagée, permet un déploiement plus rapide des projets et réduit l\'empreinte environnementale. Il est conçu spécifiquement pour servir l\'industrie croissante d\'exportation d\'hydrogène du Chili.'
      },
      {
        question: 'Quelles sont les considérations environnementales?',
        answer: 'Le port a un impact environnemental indépendant par rapport aux usines complètes d\'hydrogène, est protégé des marées/vagues/courants, et permet une empreinte environnementale réduite grâce à une infrastructure partagée. Tout le développement suit les réglementations environnementales du Chili.'
      }
    ]
  }
  
  return faqs[locale as keyof typeof faqs] || faqs.en
}


export default function FAQ() {
  const pathname = usePathname()
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const faqs = getFAQs(locale)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // Get localized text
  const title = locale === 'es' 
    ? 'Estrategia de Inversión y Joint Venture' 
    : locale === 'zh' 
    ? '投资与合资战略' 
    : locale === 'fr'
    ? 'Stratégie d\'Investissement et Coentreprise'
    : 'Investment & Joint Venture Strategy'
  
  const subtitle = locale === 'es'
    ? 'De la Visión a Listo para Construir: Buscando capital para llevar el Terminal Cabo Negro a la etapa Listo para Construir'
    : locale === 'zh'
    ? '从愿景到准备建设：寻求资金将卡波内格罗终端带到准备建设阶段'
    : locale === 'fr'
    ? 'De la Vision au Prêt à Construire : Recherche de capitaux pour amener le Terminal Cabo Negro au stade Prêt à Construire'
    : 'From Vision to Ready-to-Build: Seeking capital to bring Cabo Negro Terminal to Ready-to-Build stage'
  
  const downloadText = locale === 'es' ? 'Descargar Propuesta de Inversión' : locale === 'zh' ? '下载投资提案' : locale === 'fr' ? 'Télécharger la Proposition d\'Investissement' : 'Download Investment Proposal'
  const scheduleText = locale === 'es' ? 'Programar Reunión de Inversionistas' : locale === 'zh' ? '安排投资者会议' : locale === 'fr' ? 'Planifier une Réunion d\'Investisseurs' : 'Schedule Investor Meeting'
  
  const deckPath = locale === 'en' ? '/deck' : `/${locale}/deck`

  return (
    <section className="pt-20 pb-20 px-6 bg-white relative z-20" id="FAQ" data-white-background="true">
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          {title}
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text={subtitle}
            className="text-gray-600 text-lg"
          />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-white border-gray-200 cursor-pointer hover:border-accent transition-colors shadow-sm"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold pr-4 text-foreground">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform text-gray-600 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === index && (
                  <p className="text-gray-700 mt-4 leading-relaxed">{faq.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center group">
          <Button
            asChild
            variant="default"
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
          >
            <Link href={deckPath}>{downloadText}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:bg-white hover:text-black transition-colors"
          >
            <Link href="https://calendly.com/" target="_blank" rel="noopener noreferrer">{scheduleText}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}