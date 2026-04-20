'use client'

import React, { useRef, useState, useEffect } from 'react'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { VerticalCutReveal, VerticalCutRevealRef } from '@/components/ui/vertical-cut-reveal'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import { usePathname } from 'next/navigation'

interface PressArticle {
  id: number
  title: string
  description: string
  image: string
  link: string
  source: string
  date: string
}

const getPressArticles = (locale: string): PressArticle[] => {
  const articles = {
    en: [
      {
        id: 1,
        title: 'Cabo Negro: Strategic Gateway to the South',
        description: 'New industrial complex set to transform maritime logistics in Patagonia',
        image: '/article_1_cabonegro.jpeg',
        link: 'https://www.goremagallanes.cl/comision-regional-de-uso-del-borde-costero-aprueba-concesion-maritima-para-nuevo-puerto-en-punta-arenas/',
        source: 'Maritime News',
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Patagon Valley, the project that unites Amazon and SpaceX in southern Chile',
        description: 'Those familiar with the terrain explain that the weather conditions are so harsh that construction work resembles a film by German director Werner Herzog. Strong winds that force workers to secure themselves with ropes for fear of falling on the sandy steppe and freezing cold are the main barriers facing a group of entrepreneurs who decided to build Latin America\'s first technology and energy park: Patagon Valley.',
        image: '/patagon_valley.webp',
        link: 'https://www.latercera.com/pulso-pm/noticia/patagon-valley-el-proyecto-que-une-a-amazon-y-spacex-al-sur-de-chile/EFPIMV6M6VGLHFFXOXNWDC5RXU/',
        source: 'La Tercera',
        date: '2022-05-13'
      },
      {
        id: 3,
        title: 'Ambitious industrial park project in Cabo Negro',
        description: 'The idea is to create a new industrial park on a 179-hectare extension that will stretch between the highway and the sea, starting at kilometer 28 of Route 9 Norte. This initiative arises from the need to have a properly enabled space for the installation of industrial projects, especially those involving the use of chemical products, due to the new urban regulations established by the latest modification to the Punta Arenas Regulatory Plan.',
        image: '/cabonegro_astillero.webp',
        link: 'https://elpinguino.com/noticia/2018/12/20/ambicioso-proyecto-de-parque-industrial-en-cabo-negro',
        source: 'El Pingüino',
        date: '2018-12-20'
      },
      {
        id: 4,
        title: 'Patagon Valley, the project that unites Amazon and SpaceX in southern Chile',
        description: 'The project that was born in 2019 considers an investment of US$400 million and contemplates the construction of a port in order to take advantage of the booming green hydrogen market, a cornerstone of the efforts of large multinationals to curb CO2 emissions that cause climate change. The port they seek to build in Cabo Negro takes the Rotterdam maritime terminal in the Netherlands as its inspiration model.',
        image: '/PCORL3V6UJHZPEXYERJXVDM7UQ.webp',
        link: 'https://www.chileenergias.cl/2022/05/18/patagon-valley-proyecto-une-amazon-spacex-al-sur-chile/',
        source: 'Chile Energías',
        date: '2022-05-18'
      }
    ],
    es: [
      {
        id: 1,
        title: 'Se aprueba concesión marítima para nuevo puerto en Punta Arenas',
        description: 'La Comisión Regional de Uso del Borde Costero (CRUBC) aprobó por unanimidad la concesión de uso de borde costero para el proyecto "Cabo Negro", impulsado por Inversiones PPG SpA. El proyecto contempla 20.519 metros de concesión marítima, un muelle de 700 metros y más de 100 hectáreas terrestres de respaldo, posicionándose como el primer puerto privado de uso público en Magallanes.',
        image: '/article_1_cabonegro.jpeg',
        link: 'https://www.goremagallanes.cl/comision-regional-de-uso-del-borde-costero-aprueba-concesion-maritima-para-nuevo-puerto-en-punta-arenas/',
        source: 'Gobierno Regional de Magallanes',
        date: '2025-04-03'
      },
      {
        id: 2,
        title: 'Patagon Valley, el proyecto que une a Amazon y SpaceX al sur de Chile',
        description: 'Quienes conocen el terreno explican que las condiciones climáticas son tan duras que los trabajos de edificación se asemejan a una película del alemán Werner Herzog. Fuertes vientos que obligan a afirmarse a una cuerda por temor a caídas sobre la estepa arenosa y un gélido frío son las principales barreras que enfrenta un grupo de emprendedores que decidió levantar el primer parque tecnológico y energético de América Latina: Patagon Valley.',
        image: '/patagon_valley.webp',
        link: 'https://www.latercera.com/pulso-pm/noticia/patagon-valley-el-proyecto-que-une-a-amazon-y-spacex-al-sur-de-chile/EFPIMV6M6VGLHFFXOXNWDC5RXU/',
        source: 'La Tercera',
        date: '2022-05-13'
      },
      {
        id: 3,
        title: 'Ambicioso proyecto de parque industrial en Cabo Negro',
        description: 'La idea es crear un nuevo parque industrial en una extensión de 179 hectáreas y que se extenderá entre la carretera y el mar, a contar del kilómetro 28 de la ruta 9 Norte. Esta iniciativa surge debido a la necesidad de contar con un espacio debidamente habilitado para la instalación de proyectos industriales, especialmente, aquellos que involucran el uso de productos químicos, debido a las nuevas normativas urbanas establecidas por la última modificación al Plano Regulador de Punta Arenas.',
        image: '/cabonegro_astillero.webp',
        link: 'https://elpinguino.com/noticia/2018/12/20/ambicioso-proyecto-de-parque-industrial-en-cabo-negro',
        source: 'El Pingüino',
        date: '2018-12-20'
      },
      {
        id: 4,
        title: 'Patagon Valley, el proyecto que une a Amazon y SpaceX al sur de Chile',
        description: 'El proyecto que nació en 2019 considera una inversión de US$400 millones y contempla la construcción de un puerto a fin de aprovechar el pujante mercado del hidrógeno verde, piedra angular de los esfuerzos de grandes transnacionales para frenar las emisiones de CO2 que provocan el cambio climático. El puerto que buscan construir en Cabo Negro lleva como modelo de inspiración el terminal marítimo de Rotterdam, en Países Bajos.',
        image: '/PCORL3V6UJHZPEXYERJXVDM7UQ.webp',
        link: 'https://www.chileenergias.cl/2022/05/18/patagon-valley-proyecto-une-amazon-spacex-al-sur-chile/',
        source: 'Chile Energías',
        date: '2022-05-18'
      }
    ],
    zh: [
      {
        id: 1,
        title: '卡波内格罗：通往南方的战略门户',
        description: '新工业综合体将改变巴塔哥尼亚的海事物流',
        image: '/article_1_cabonegro.jpeg',
        link: 'https://www.goremagallanes.cl/comision-regional-de-uso-del-borde-costero-aprueba-concesion-maritima-para-nuevo-puerto-en-punta-arenas/',
        source: '海事新闻',
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Patagon Valley，将亚马逊和SpaceX连接在智利南部的项目',
        description: '了解这片土地的人解释说，气候条件如此恶劣，以至于建设工作就像德国导演Werner Herzog的电影一样。强风迫使人们必须用绳索固定以防在沙质草原上摔倒，以及严寒是决定建设拉丁美洲第一个技术和能源园区的一群企业家面临的主要障碍：Patagon Valley。',
        image: '/patagon_valley.webp',
        link: 'https://www.latercera.com/pulso-pm/noticia/patagon-valley-el-proyecto-que-une-a-amazon-y-spacex-al-sur-de-chile/EFPIMV6M6VGLHFFXOXNWDC5RXU/',
        source: 'La Tercera',
        date: '2022-05-13'
      },
      {
        id: 3,
        title: '卡波内格罗雄心勃勃的工业园区项目',
        description: '该计划是在179公顷的土地上创建一个新的工业园区，从9号公路北段28公里处开始，延伸至公路与海洋之间。这一倡议源于需要拥有一个适当启用的空间来安装工业项目，特别是那些涉及化学品使用的项目，这是由于对蓬塔阿雷纳斯监管计划的最后修改所建立的新城市规范。',
        image: '/cabonegro_astillero.webp',
        link: 'https://elpinguino.com/noticia/2018/12/20/ambicioso-proyecto-de-parque-industrial-en-cabo-negro',
        source: 'El Pingüino',
        date: '2018-12-20'
      },
      {
        id: 4,
        title: 'Patagon Valley，将亚马逊和SpaceX连接在智利南部的项目',
        description: '该项目于2019年启动，考虑投资4亿美元，并计划建设一个港口，以利用蓬勃发展的绿色氢市场，这是大型跨国公司努力遏制导致气候变化的CO2排放的基石。他们寻求在卡波内格罗建造的港口以荷兰鹿特丹的海上码头为灵感模型。',
        image: '/PCORL3V6UJHZPEXYERJXVDM7UQ.webp',
        link: 'https://www.chileenergias.cl/2022/05/18/patagon-valley-proyecto-une-amazon-spacex-al-sur-chile/',
        source: 'Chile Energías',
        date: '2022-05-18'
      }
    ],
    fr: [
      {
        id: 1,
        title: 'Cabo Negro : Porte d\'Entrée Stratégique vers le Sud',
        description: 'Nouveau complexe industriel destiné à transformer la logistique maritime en Patagonie',
        image: '/article_1_cabonegro.jpeg',
        link: 'https://www.goremagallanes.cl/comision-regional-de-uso-del-borde-costero-aprueba-concesion-maritima-para-nuevo-puerto-en-punta-arenas/',
        source: 'Actualités Maritimes',
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Patagon Valley, le projet qui unit Amazon et SpaceX au sud du Chili',
        description: 'Ceux qui connaissent le terrain expliquent que les conditions climatiques sont si difficiles que les travaux de construction ressemblent à un film du réalisateur allemand Werner Herzog. Des vents forts qui obligent à s\'attacher à une corde par crainte de chutes sur la steppe sablonneuse et un froid glacial sont les principaux obstacles auxquels fait face un groupe d\'entrepreneurs qui a décidé de construire le premier parc technologique et énergétique d\'Amérique latine : Patagon Valley.',
        image: '/patagon_valley.webp',
        link: 'https://www.latercera.com/pulso-pm/noticia/patagon-valley-el-proyecto-que-une-a-amazon-y-spacex-al-sur-de-chile/EFPIMV6M6VGLHFFXOXNWDC5RXU/',
        source: 'La Tercera',
        date: '2022-05-13'
      },
      {
        id: 3,
        title: 'Projet ambitieux de parc industriel à Cabo Negro',
        description: 'L\'idée est de créer un nouveau parc industriel sur une superficie de 179 hectares qui s\'étendra entre la route et la mer, à partir du kilomètre 28 de la route 9 Norte. Cette initiative naît de la nécessité de disposer d\'un espace correctement aménagé pour l\'installation de projets industriels, en particulier ceux impliquant l\'utilisation de produits chimiques, en raison des nouvelles normes urbaines établies par la dernière modification du Plan Régulateur de Punta Arenas.',
        image: '/cabonegro_astillero.webp',
        link: 'https://elpinguino.com/noticia/2018/12/20/ambicioso-proyecto-de-parque-industrial-en-cabo-negro',
        source: 'El Pingüino',
        date: '2018-12-20'
      },
      {
        id: 4,
        title: 'Patagon Valley, le projet qui unit Amazon et SpaceX au sud du Chili',
        description: 'Le projet né en 2019 prévoit un investissement de 400 millions de dollars US et comprend la construction d\'un port afin d\'exploiter le marché florissant de l\'hydrogène vert, pierre angulaire des efforts des grandes multinationales pour freiner les émissions de CO2 qui provoquent le changement climatique. Le port qu\'ils cherchent à construire à Cabo Negro s\'inspire du terminal maritime de Rotterdam, aux Pays-Bas.',
        image: '/PCORL3V6UJHZPEXYERJXVDM7UQ.webp',
        link: 'https://www.chileenergias.cl/2022/05/18/patagon-valley-proyecto-une-amazon-spacex-al-sur-chile/',
        source: 'Chile Energías',
        date: '2022-05-18'
      }
    ]
  }
  
  return articles[locale as keyof typeof articles] || articles.en
}

export default function Press() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleAnimationRef = useRef<VerticalCutRevealRef>(null)
  const pathname = usePathname()
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const pressArticles = getPressArticles(locale)
  const [currentArticle, setCurrentArticle] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  // Get localized text
  const pressLabel = locale === 'es' ? 'PRENSA Y MEDIOS' : locale === 'zh' ? '新闻与媒体' : locale === 'fr' ? 'PRESSE & MÉDIAS' : 'PRESS & MEDIA'
  const pressCoverage = locale === 'es' ? 'Cobertura de Prensa y Medios' : locale === 'zh' ? '新闻与媒体报道' : locale === 'fr' ? 'Couverture Presse et Médias' : 'Press & Media Coverage'
  const readFullArticle = locale === 'es' ? 'Lea el artículo completo para más detalles' : locale === 'zh' ? '阅读完整文章了解更多详情' : locale === 'fr' ? 'Lisez l\'article complet pour plus de détails' : 'Read the full article for more details'
  const readArticle = locale === 'es' ? 'LEER ARTÍCULO' : locale === 'zh' ? '阅读文章' : locale === 'fr' ? 'LIRE L\'ARTICLE' : 'READ ARTICLE'

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      y: -20,
      opacity: 0,
    },
  }

  const scaleVariants = {
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      opacity: 0,
    },
  }

  const nextArticle = () => {
    setCurrentArticle((prev) => (prev + 1) % pressArticles.length)
  }

  const prevArticle = () => {
    setCurrentArticle((prev) => (prev - 1 + pressArticles.length) % pressArticles.length)
  }

  const goToArticle = (index: number) => {
    setCurrentArticle(index)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextArticle()
    }
    if (isRightSwipe) {
      prevArticle()
    }
  }

  const currentArticleData = pressArticles[currentArticle]

  // Trigger title animation when slide changes or on mount
  useEffect(() => {
    if (titleAnimationRef.current) {
      // Reset and restart animation on slide change
      titleAnimationRef.current.reset()
      // Small delay to ensure reset completes before starting
      const timer = setTimeout(() => {
        titleAnimationRef.current?.startAnimation()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [currentArticle])

  return (
    <section className="py-8 px-4 bg-white relative min-h-screen md:mb-0 mb-4" ref={heroRef} data-keep-navbar-black="true" style={{ zIndex: 20 }}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="text-cyan-500 animate-spin">✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-2xl sm:text-sm font-medium text-gray-600"
              >
                {pressLabel}
              </TimelineContent>
            </div>
          </div>

          {/* Image Frame with Slider */}
          <figure className="relative group pt-12 md:pt-0">
            <div
              className="relative w-full overflow-visible"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg
                className="w-full"
                width="100%"
                height="100%"
                viewBox="0 0 100 40"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <clipPath
                    id="clip-inverted"
                    clipPathUnits="objectBoundingBox"
                  >
                    <path
                      d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
                <AnimatePresence mode="wait">
                  <motion.image
                    key={currentArticle}
                    clipPath="url(#clip-inverted)"
                    preserveAspectRatio="xMidYMid slice"
                    width="100%"
                    height="100%"
                    xlinkHref={currentArticleData.image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </svg>

              {/* Navigation Arrows */}
              <button
                onClick={prevArticle}
                className="absolute left-4 bottom-16 md:top-[80%] md:bottom-auto p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Previous article"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextArticle}
                className="absolute right-4 bottom-16 md:top-[80%] md:bottom-auto p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Next article"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slider Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {pressArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToArticle(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentArticle
                        ? 'bg-white w-8'
                        : 'bg-white/30 hover:bg-white/50 w-2'
                    }`}
                    aria-label={`Go to article ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </figure>

          {/* Article Info */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-cyan-500 font-bold">{currentArticleData.source}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{currentArticleData.date}</span>
              </div>
            </TimelineContent>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
              <VerticalCutReveal
                key={currentArticle}
                ref={titleAnimationRef}
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                reverse={true}
                autoStart={false}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 30,
                  delay: 0,
                }}
              >
                {currentArticleData.title}
              </VerticalCutReveal>
            </h1>

            <div className="text-gray-600">
              <div className="sm:text-base text-xs">
                <p className="leading-relaxed text-justify mb-6">
                  {currentArticleData.description}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="text-right">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-cyan-500 text-2xl font-bold mb-2"
              >
                CABO NEGRO
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-sm mb-8"
              >
                {pressCoverage}
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6"
              >
                <p className="text-gray-900 font-medium mb-4">
                  {readFullArticle}
                </p>
              </TimelineContent>

              <TimelineContent
                as="a"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={currentArticleData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-neutral-950 shadow-lg shadow-neutral-900 border border-neutral-700 flex w-fit ml-auto gap-2 hover:gap-4 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-lg cursor-pointer font-semibold"
              >
                {readArticle} <ArrowRight className="" />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
