'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { MagicText } from "@/components/ui/magic-text"
import { usePathname } from 'next/navigation'


const getFAQs = (locale: string) => {
  const faqs = {
    en: [
      {
        question: 'What is Cabo Negro and how is the project structured?',
        answer: 'Cabo Negro is a territorial platform composed of three independent projects, each with distinct purposes, scales, and opportunities:\n\n1. Cabo Negro Maritime Terminal,\n2. Technology & Logistics Park – Patagon Valley,\n3. Cabo Negro II Macro Lot.\n\nCompanies can be interested in one, two, or all three projects, depending on their needs. There is no dependency between them, although their proximity generates high-value logistical, technological, and operational synergies.'
      },
      {
        question: 'Where is Cabo Negro located?',
        answer: 'The project is located north of Punta Arenas, on the Strait of Magellan, at a strategic point for logistics, energy, and technology.\n\nKey distances:\n\n· 5 km from Punta Arenas International Airport (SCCI)\n· 28.5 km from downtown Punta Arenas\n· Direct connection to Route 9, international highway to Argentina.\n· Connection to Strait of Magellan'
      },
      {
        question: 'What is the main objective of the Cabo Negro project?',
        answer: 'To create an integrated hub in Magallanes that combines port, technology, and logistics infrastructure, offering a unique environment for companies seeking connectivity, access to the Strait of Magellan and Chilean Antarctica, and availability of industrial and technological land.'
      },
      {
        question: 'Why is this location considered strategically important at the international level?',
        answer: 'Because it combines advantages that rarely exist in the same territory:\n\n· Strategic route to Antarctica and natural base for Antarctic operations.\n· Location on the Strait of Magellan, a key maritime corridor of the southern hemisphere.\n· High-quality connectivity: Austral Fiber Optic + LEO satellite signal.\n· Proximity to green hydrogen zones and world-class energy industry.\n· Environment suitable for large-scale logistical, industrial, and technological developments.'
      },
      {
        question: 'What types of companies can establish themselves in Cabo Negro?',
        answer: 'The territory is prepared to receive projects from:\n\n· logistics and transportation,\n· energy and green hydrogen,\n· satellite industry and telecommunications,\n· technology, AI, robotics, data centers,\n· industrial suppliers,\n· Antarctic operations and support,\n· scientific bases,\n· large industries and macro developments.'
      },
      {
        question: 'What benefits does the Cabo Negro Maritime Terminal offer?',
        answer: 'The Cabo Negro Maritime Terminal is born to become the new entry point to the southern end of the continent. A protected multipurpose port, designed to receive the projects that are transforming Magallanes: energy, industry, technology, exploration, and Antarctic supply.\n\nIts strategic location, backup areas, and direct accessibility from Route 9 make it a next-generation logistics center.\n\nDeveloped together with Compas Marine, recognized experts in maritime terminal management in Chile, the project incorporates efficiency, security, and operational continuity standards that respond to current industry needs.\n\nIt is a port designed for the present, but prepared for the future growth of the region.'
      },
      {
        question: 'What advantages does Patagon Valley (technology and logistics park) offer?',
        answer: 'Patagon Valley is designed for companies that require:\n\n· energy availability,\n· low latency and fiber optic connectivity,\n· LEO satellite communications,\n· operational proximity to a port,\n· scalable land for technological or logistical facilities.\n\nIt is ideal for technology, data centers, telecommunications, satellite, AI, marine robotics, and companies associated with green hydrogen.'
      },
      {
        question: 'What are the characteristics of the Cabo Negro II Macro Lot?',
        answer: 'The Cabo Negro II Macro Lot is a 173-hectare plot ready to be configured according to the specific needs of each project, offering maximum flexibility for industrial, logistical, technological, or energy developments.\n\nIt is a plot without prior interventions, which allows companies to design their infrastructure completely customized: internal layouts, subdivisions, accesses, facilities, systems, and expansion plans.\n\nThanks to its scale and design freedom, it is ideal for projects that require large surfaces or specialized infrastructure.\n\nIn addition, its direct connection to Route 9 and its proximity to the port and Patagon Valley allow integrating logistical or technological operations if a company requires it, without this being mandatory.'
      },
      {
        question: 'How can I obtain more information, coordinate a meeting, or visit the project?',
        answer: 'Through the website contact form or using the "Schedule meeting" option.\n\nThe commercial team can provide:\n\n· General presentation,\n· Specific information on each pillar,\n· Virtual tours,\n· On-site visits.'
      }
    ],
    es: [
      {
        question: '¿Qué es Cabo Negro y cómo se estructura el proyecto?',
        answer: 'Cabo Negro es una plataforma territorial compuesta por tres proyectos independientes, cada uno con propósitos, escalas y oportunidades distintas:\n\n1. Terminal Marítimo Cabo Negro,\n2. Parque Tecnológico & Logístico – Patagon Valley,\n3. Macro Lote Cabo Negro II.\n\nLas empresas pueden interesarse en uno, dos o los tres proyectos, según sus necesidades. No existe dependencia entre ellos, aunque su cercanía genera sinergias logísticas, tecnológicas y operativas de alto valor.'
      },
      {
        question: '¿Dónde está ubicado Cabo Negro?',
        answer: 'El proyecto se encuentra al norte de Punta Arenas, sobre el Estrecho de Magallanes, en un punto estratégico para logística, energía y tecnología.\n\nDistancias clave:\n\n· 5 km del Aeropuerto Internacional de Punta Arenas (SCCI)\n· 28,5 km del centro de Punta Arenas\n· Conexión directa a Ruta 9, carretera internacional hacia Argentina.\n· Conexión a Estrecho de Magallanes'
      },
      {
        question: '¿Cuál es el objetivo principal del proyecto Cabo Negro?',
        answer: 'Crear un polo integrado en Magallanes que combine infraestructura portuaria, tecnológica y logística, ofreciendo un entorno único para empresas que buscan conectividad, acceso al Estrecho de Magallanes y la Antártica Chilena y disponibilidad de terrenos industriales y tecnológicos.'
      },
      {
        question: '¿Por qué esta ubicación es considerada estratégica a nivel internacional?',
        answer: 'Porque combina ventajas que rara vez existen en un mismo territorio:\n\n· Ruta estratégica hacia la Antártica y base natural para operaciones antárticas.\n· Ubicación en el Estrecho de Magallanes, corredor marítimo clave del hemisferio sur.\n· Conectividad de alta calidad: Fibra Óptica Austral + señal LEO satelital.\n· Proximidad a zonas de hidrógeno verde e industria energética de clase mundial.\n· Entorno apto para desarrollos logísticos, industriales y tecnológicos de gran escala.'
      },
      {
        question: '¿Qué tipo de empresas pueden instalarse en Cabo Negro?',
        answer: 'El territorio está preparado para recibir proyectos de:\n\n· logística y transporte,\n· energía e hidrógeno verde,\n· industria satelital y telecomunicaciones,\n· tecnología, IA, robótica, data centers,\n· proveedores industriales,\n· operaciones y soporte antártico,\n· bases científicas,\n· grandes industrias y macro desarrollos.'
      },
      {
        question: '¿Qué beneficios ofrece el Terminal Marítimo Cabo Negro?',
        answer: 'El Terminal Marítimo Cabo Negro nace para convertirse en el nuevo punto de entrada al extremo sur del continente. Un puerto multipropósito protegido, pensado para recibir los proyectos que están transformando Magallanes: energía, industria, tecnología, exploración y abastecimiento antártico.\n\nSu ubicación estratégica, sus áreas de respaldo y su accesibilidad directa desde Ruta 9 lo convierten en un centro logístico de nueva generación.\n\nDesarrollado junto a Compas Marine, expertos reconocidos en la gestión de terminales marítimos en Chile, el proyecto incorpora estándares de eficiencia, seguridad y continuidad operativa que responden a las necesidades actuales de la industria.\n\nEs un puerto diseñado para el presente, pero preparado para el crecimiento futuro de la región.'
      },
      {
        question: '¿Qué ventajas ofrece Patagon Valley (parque tecnológico y logístico)?',
        answer: 'Patagon Valley está diseñado para empresas que requieren:\n\n· disponibilidad de energía,\n· baja latencia y conectividad de fibra óptica,\n· comunicaciones satelitales LEO,\n· proximidad operativa a un puerto,\n· terrenos escalables para instalaciones tecnológicas o logísticas.\n\nEs ideal para tecnología, data centers, telecomunicaciones, satelital, IA, robótica marina y empresas asociadas al hidrógeno verde.'
      },
      {
        question: '¿Qué características tiene el Macro Lote Cabo Negro II?',
        answer: 'El Macro Lote Cabo Negro II es un terreno de 173 hectáreas listo para configurarse según las necesidades específicas de cada proyecto, ofreciendo máxima flexibilidad para desarrollos industriales, logísticos, tecnológicos o energéticos.\n\nSe trata de un terreno sin intervenciones previas, lo que permite a las empresas diseñar su infraestructura completamente a medida: trazados internos, subdivisiones, accesos, instalaciones, sistemas y planes de expansión.\n\nGracias a su escala y libertad de diseño, es ideal para proyectos que requieren grandes superficies o infraestructura especializada.\n\nAdemás, su conexión directa a Ruta 9 y su proximidad al puerto y a Patagon Valley permiten integrar operaciones logísticas o tecnológicas si una empresa lo requiere, sin que ello sea obligatorio.'
      },
      {
        question: '¿Cómo puedo obtener más información, coordinar una reunión o visitar el proyecto?',
        answer: 'A través del formulario de contacto del sitio web o utilizando la opción "Agendar reunión".\n\nEl equipo comercial puede entregar:\n\n· Presentación general,\n· Información específica de cada pilar,\n· Recorridos virtuales,\n· Visitas presenciales a terreno.'
      }
    ],
    zh: [
      {
        question: '什么是卡波内格罗，项目是如何构建的？',
        answer: '卡波内格罗是一个由三个独立项目组成的领土平台，每个项目都有不同的目的、规模和机会：\n\n1. 卡波内格罗海运码头\n2. 科技与物流园 – 巴塔哥尼亚谷\n3. 卡波内格罗二号大区\n\n公司可以根据其需求对一个、两个或所有三个项目感兴趣。它们之间没有依赖关系，尽管它们的邻近性产生了高价值的物流、技术和运营协同效应。'
      },
      {
        question: '卡波内格罗位于哪里？',
        answer: '该项目位于蓬塔阿雷纳斯北部，位于麦哲伦海峡上，是物流、能源和技术的战略要地。\n\n关键距离：\n\n· 距离蓬塔阿雷纳斯国际机场（SCCI）5公里\n· 距离蓬塔阿雷纳斯市中心28.5公里\n· 直接连接9号公路，通往阿根廷的国际高速公路。\n· 连接麦哲伦海峡'
      },
      {
        question: '卡波内格罗项目的主要目标是什么？',
        answer: '在麦哲伦创建一个综合中心，结合港口、技术和物流基础设施，为寻求连接性、麦哲伦海峡和智利南极通道以及工业和科技土地可用性的公司提供独特的环境。'
      },
      {
        question: '为什么这个位置在国际层面被认为是战略性的？',
        answer: '因为它结合了在同一领土上很少存在的优势：\n\n· 通往南极的战略路线和南极行动的自然基地。\n· 位于麦哲伦海峡，南半球的关键海上走廊。\n· 高质量连接：南方光纤 + LEO卫星信号。\n· 靠近绿色氢区和世界级能源工业。\n· 适合大规模物流、工业和技术发展的环境。'
      },
      {
        question: '哪些类型的公司可以在卡波内格罗设立？',
        answer: '该领土已准备好接收来自以下领域的项目：\n\n· 物流和运输\n· 能源和绿色氢能\n· 卫星工业和电信\n· 技术、人工智能、机器人、数据中心\n· 工业供应商\n· 南极运营和支持\n· 科学基地\n· 大型工业和宏观发展'
      },
      {
        question: '卡波内格罗海运码头提供哪些好处？',
        answer: '卡波内格罗海运码头旨在成为大陆南端的新入口点。一个受保护的多用途港口，旨在接收正在改变麦哲伦的项目：能源、工业、技术、勘探和南极供应。\n\n其战略位置、备用区域和从9号公路的直接可达性使其成为新一代物流中心。\n\n与智利公认的海运码头管理专家Compas Marine共同开发，该项目整合了效率、安全性和运营连续性标准，满足当前行业需求。\n\n这是一个为现在而设计的港口，但为地区的未来增长做好了准备。'
      },
      {
        question: '巴塔哥尼亚谷（科技与物流园）提供哪些优势？',
        answer: '巴塔哥尼亚谷专为需要以下条件的企业设计：\n\n· 能源可用性\n· 低延迟和光纤连接\n· LEO卫星通信\n· 靠近港口的运营位置\n· 可扩展的科技或物流设施用地\n\n它非常适合技术、数据中心、电信、卫星、人工智能、海洋机器人和与绿色氢相关的公司。'
      },
      {
        question: '卡波内格罗二号大区有哪些特点？',
        answer: '卡波内格罗二号大区是一个173公顷的地块，可根据每个项目的具体需求进行配置，为工业、物流、技术或能源发展提供最大灵活性。\n\n这是一个没有前期干预的地块，允许公司完全定制设计其基础设施：内部布局、细分、通道、设施、系统和扩张计划。\n\n由于其规模和设计自由度，它非常适合需要大面积或专业基础设施的项目。\n\n此外，其与9号公路的直接连接以及靠近港口和巴塔哥尼亚谷的位置，如果公司需要，可以整合物流或技术运营，但这不是强制性的。'
      },
      {
        question: '我如何获得更多信息、协调会议或参观项目？',
        answer: '通过网站联系表或使用"安排会议"选项。\n\n商业团队可以提供：\n\n· 一般介绍\n· 每个支柱的具体信息\n· 虚拟参观\n· 现场访问'
      }
    ],
    fr: [
      {
        question: 'Qu\'est-ce que Cabo Negro et comment le projet est-il structuré?',
        answer: 'Cabo Negro est une plateforme territoriale composée de trois projets indépendants, chacun avec des objectifs, des échelles et des opportunités distincts:\n\n1. Terminal Maritime Cabo Negro,\n2. Parc Technologique & Logistique – Patagon Valley,\n3. Macro Lot Cabo Negro II.\n\nLes entreprises peuvent être intéressées par un, deux ou les trois projets, selon leurs besoins. Il n\'y a pas de dépendance entre eux, bien que leur proximité génère des synergies logistiques, technologiques et opérationnelles de grande valeur.'
      },
      {
        question: 'Où se trouve Cabo Negro?',
        answer: 'Le projet est situé au nord de Punta Arenas, sur le détroit de Magellan, à un point stratégique pour la logistique, l\'énergie et la technologie.\n\nDistances clés:\n\n· 5 km de l\'aéroport international de Punta Arenas (SCCI)\n· 28,5 km du centre de Punta Arenas\n· Connexion directe à la Route 9, autoroute internationale vers l\'Argentine.\n· Connexion au détroit de Magellan'
      },
      {
        question: 'Quel est l\'objectif principal du projet Cabo Negro?',
        answer: 'Créer un pôle intégré à Magallanes qui combine infrastructure portuaire, technologique et logistique, offrant un environnement unique aux entreprises recherchant la connectivité, l\'accès au détroit de Magellan et à l\'Antarctique chilienne, et la disponibilité de terrains industriels et technologiques.'
      },
      {
        question: 'Pourquoi cet emplacement est-il considéré comme stratégique au niveau international?',
        answer: 'Parce qu\'il combine des avantages qui existent rarement dans un même territoire:\n\n· Route stratégique vers l\'Antarctique et base naturelle pour les opérations antarctiques.\n· Emplacement sur le détroit de Magellan, corridor maritime clé de l\'hémisphère sud.\n· Connectivité de haute qualité: Fibre Optique Australe + signal satellite LEO.\n· Proximité des zones d\'hydrogène vert et de l\'industrie énergétique de classe mondiale.\n· Environnement adapté aux développements logistiques, industriels et technologiques à grande échelle.'
      },
      {
        question: 'Quels types d\'entreprises peuvent s\'installer à Cabo Negro?',
        answer: 'Le territoire est préparé pour recevoir des projets de:\n\n· logistique et transport,\n· énergie et hydrogène vert,\n· industrie satellitaire et télécommunications,\n· technologie, IA, robotique, centres de données,\n· fournisseurs industriels,\n· opérations et soutien antarctiques,\n· bases scientifiques,\n· grandes industries et macro-développements.'
      },
      {
        question: 'Quels sont les avantages du Terminal Maritime Cabo Negro?',
        answer: 'Le Terminal Maritime Cabo Negro est né pour devenir le nouveau point d\'entrée à l\'extrémité sud du continent. Un port polyvalent protégé, conçu pour recevoir les projets qui transforment Magallanes: énergie, industrie, technologie, exploration et approvisionnement antarctique.\n\nSon emplacement stratégique, ses zones de secours et son accessibilité directe depuis la Route 9 en font un centre logistique de nouvelle génération.\n\nDéveloppé avec Compas Marine, experts reconnus dans la gestion de terminaux maritimes au Chili, le projet intègre des normes d\'efficacité, de sécurité et de continuité opérationnelle qui répondent aux besoins actuels de l\'industrie.\n\nC\'est un port conçu pour le présent, mais préparé pour la croissance future de la région.'
      },
      {
        question: 'Quels avantages offre Patagon Valley (parc technologique et logistique)?',
        answer: 'Patagon Valley est conçu pour les entreprises qui nécessitent:\n\n· disponibilité d\'énergie,\n· faible latence et connectivité par fibre optique,\n· communications satellitaires LEO,\n· proximité opérationnelle d\'un port,\n· terrains évolutifs pour installations technologiques ou logistiques.\n\nIl est idéal pour la technologie, les centres de données, les télécommunications, le satellite, l\'IA, la robotique marine et les entreprises associées à l\'hydrogène vert.'
      },
      {
        question: 'Quelles sont les caractéristiques du Macro Lot Cabo Negro II?',
        answer: 'Le Macro Lot Cabo Negro II est un terrain de 173 hectares prêt à être configuré selon les besoins spécifiques de chaque projet, offrant une flexibilité maximale pour les développements industriels, logistiques, technologiques ou énergétiques.\n\nIl s\'agit d\'un terrain sans interventions préalables, ce qui permet aux entreprises de concevoir leur infrastructure entièrement sur mesure: tracés internes, subdivisions, accès, installations, systèmes et plans d\'expansion.\n\nGrâce à son échelle et sa liberté de conception, il est idéal pour les projets nécessitant de grandes surfaces ou une infrastructure spécialisée.\n\nDe plus, sa connexion directe à la Route 9 et sa proximité du port et de Patagon Valley permettent d\'intégrer des opérations logistiques ou technologiques si une entreprise le requiert, sans que cela soit obligatoire.'
      },
      {
        question: 'Comment puis-je obtenir plus d\'informations, coordonner une réunion ou visiter le projet?',
        answer: 'Via le formulaire de contact du site Web ou en utilisant l\'option "Planifier une réunion".\n\nL\'équipe commerciale peut fournir:\n\n· Présentation générale,\n· Informations spécifiques sur chaque pilier,\n· Visites virtuelles,\n· Visites sur site.'
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
  const [isExpanded, setIsExpanded] = useState(false)

  // Get localized text
  const title = locale === 'es' 
    ? 'Preguntas Frecuentes' 
    : locale === 'zh' 
    ? '常见问题' 
    : locale === 'fr'
    ? 'Questions Fréquentes'
    : 'Frequently Asked Questions'
  
  const subtitle = locale === 'es'
    ? 'Conoce más sobre Cabo Negro y sus tres proyectos integrados'
    : locale === 'zh'
    ? '了解更多关于卡波内格罗及其三个综合项目的信息'
    : locale === 'fr'
    ? 'En savoir plus sur Cabo Negro et ses trois projets intégrés'
    : 'Learn more about Cabo Negro and its three integrated projects'
  
  const expandText = locale === 'es' 
    ? 'Ver más preguntas' 
    : locale === 'zh' 
    ? '查看更多问题' 
    : locale === 'fr'
    ? 'Voir plus de questions'
    : 'View more questions'

  // Show first 6 questions initially, all when expanded
  const visibleFAQs = isExpanded ? faqs : faqs.slice(0, 6)
  const hasMoreQuestions = faqs.length > 6

  return (
    <section className="pt-8 md:pt-20 pb-20 px-6 bg-white relative" id="FAQ" data-white-background="true" style={{ zIndex: 20 }}>
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          className="text-4xl md:text-5xl font-bold mb-6 font-primary"
        >
          {title}
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text={subtitle}
            className="text-gray-600 text-lg"
          />
        </div>

        <div className="relative">
          <div className="space-y-4">
            {visibleFAQs.map((faq, index) => (
              <Card
                key={index}
                className="bg-white border-gray-200 cursor-pointer hover:border-accent transition-colors shadow-sm"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4 text-foreground font-primary">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform text-gray-600 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {openFaq === index && (
                    <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fade out gradient and expand chevron */}
          {!isExpanded && hasMoreQuestions && (
            <>
              {/* Fade out gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              
              {/* Expand chevron button */}
              <div className="flex justify-center mt-6 relative z-10">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span className="text-sm font-medium">{expandText}</span>
                  <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}