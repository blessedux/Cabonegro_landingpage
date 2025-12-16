'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Globe2, Zap, Building2, Anchor, FileCheck, TrendingUp } from 'lucide-react'
import { MagicText } from '@/components/ui/magic-text'
import { 
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
  useHoverSliderContext
} from '@/components/ui/animated-slideshow'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Features will be created dynamically using translations

interface Feature {
  id: string;
  title: string;
  titleLine1: string;
  titleLine2: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  image: string;
  highlights: string[];
}

// Custom component to handle conditional overlay
function FeatureImageWithOverlay({ feature, index }: { feature: Feature, index: number }) {
  const { activeSlide } = useHoverSliderContext()
  const isActive = activeSlide === index
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Trigger mobile overlay when this image becomes active
  useEffect(() => {
    if (isActive && isMobile) {
      setShowMobileOverlay(true)
    }
  }, [isActive, isMobile])
  
  return (
    <div className="relative rounded-3xl overflow-hidden">
      <HoverSliderImage
        index={index}
        imageUrl={feature.image}
        src={feature.image}
        alt={feature.title}
        className="size-full max-h-96 object-cover rounded-3xl"
        loading="eager"
        decoding="async"
      />
      
      {/* Mobile Overlay - only covers this specific image, behind text */}
      {isMobile && showMobileOverlay && (
        <motion.div
          className="absolute inset-0 bg-[#2D1B1B] bg-opacity-30 z-5 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
      {/* Overlay with feature info - only visible when image is active */}
      {isActive && (
        <motion.div 
          className="absolute inset-0 text-foreground z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Full-width gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
          {/* Progressive blur effect with smooth gradient layers */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            {/* Layer 1: Light blur with gradient mask */}
            <div 
              className="absolute inset-0 backdrop-blur-[1px]"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
              }}
            />
            {/* Layer 2: Medium blur with gradient mask */}
            <div 
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 20%, black 60%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 20%, black 60%, black 100%)',
              }}
            />
            {/* Layer 3: Strong blur with gradient mask */}
            <div 
              className="absolute inset-0 backdrop-blur-[4px]"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, black 100%)',
              }}
            />
          </div>
          
          {/* Text content at bottom */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4 pb-12 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h4 className="text-base text-foreground mb-3 mt-4 font-bold drop-shadow-lg uppercase tracking-tight">{feature.title}</h4>
            <p className="text-sm text-gray-700 mb-4 font-bold drop-shadow-lg">{feature.description}</p>
            <ul className="space-y-1">
              {(Array.isArray(feature.highlights) ? feature.highlights : []).slice(0, 2).map((highlight: string, highlightIndex: number) => (
                <li key={highlightIndex} className="text-xs text-gray-700 flex items-start font-semibold drop-shadow-md">
                  <span className="text-accent mr-2 font-bold drop-shadow-lg">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default function Features() {
  const t = useTranslations('features')
  const featuresRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Scroll-based animations scoped to Features component
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  })
  // const galleryWidth = useTransform(scrollYProgress, [0, 1], ['60%', '80%'])
  const galleryWidth = '80%' // Fixed width for now
  const galleryTranslateY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const galleryTranslateX = useTransform(scrollYProgress, [0, 1], [0, -20])

  // Create features array using translations
  const features = [
    {
      id: 'strategic-gateway',
      title: t('strategicGateway.title'),
      titleLine1: t('strategicGateway.title').split(' ')[0],
      titleLine2: t('strategicGateway.title').split(' ').slice(1).join(' '),
      icon: Globe2,
      description: t('strategicGateway.description'),
      image: '/stretegicgateway.webp',
      highlights: Array.isArray(t.raw('strategicGateway.highlights')) ? t.raw('strategicGateway.highlights') : []
    },
    {
      id: 'maritime-terminal',
      title: t('maritimeTerminal.title'),
      titleLine1: t('maritimeTerminal.title').split(' ')[0],
      titleLine2: t('maritimeTerminal.title').split(' ').slice(1).join(' '),
      icon: Anchor,
      description: t('maritimeTerminal.description'),
      image: '/cabonegro_astillero.webp',
      highlights: Array.isArray(t.raw('maritimeTerminal.highlights')) ? t.raw('maritimeTerminal.highlights') : []
    },
    {
      id: 'wind-potential',
      title: t('windPotential.title'),
      titleLine1: t('windPotential.title').split(' ')[0],
      titleLine2: t('windPotential.title').split(' ').slice(1).join(' '),
      icon: TrendingUp,
      description: t('windPotential.description'),
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop&crop=center',
      highlights: Array.isArray(t.raw('windPotential.highlights')) ? t.raw('windPotential.highlights') : []
    },
    {
      id: 'industrial-park',
      title: t('industrialReady.title'),
      titleLine1: t('industrialReady.title').split(' ')[0],
      titleLine2: t('industrialReady.title').split(' ').slice(1).join(' '),
      icon: Building2,
      description: t('industrialReady.description'),
      image: '/model4.png',
      highlights: Array.isArray(t.raw('industrialReady.highlights')) ? t.raw('industrialReady.highlights') : []
    },
    {
      id: 'regulatory-advantage',
      title: t('regulatoryAdvantage.title'),
      titleLine1: t('regulatoryAdvantage.title').split(' ')[0],
      titleLine2: t('regulatoryAdvantage.title').split(' ').slice(1).join(' '),
      icon: FileCheck,
      description: t('regulatoryAdvantage.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&crop=center',
      highlights: Array.isArray(t.raw('regulatoryAdvantage.highlights')) ? t.raw('regulatoryAdvantage.highlights') : []
    },
    {
      id: 'h2v-opportunity',
      title: t('h2vOpportunity.title'),
      titleLine1: t('h2vOpportunity.title').split(' ')[0],
      titleLine2: t('h2vOpportunity.title').split(' ').slice(1).join(' '),
      icon: Zap,
      description: t('h2vOpportunity.description'),
      image: '/h2_hydrogen.png',
      highlights: Array.isArray(t.raw('h2vOpportunity.highlights')) ? t.raw('h2vOpportunity.highlights') : []
    }
  ]

  // Handle slide changes on mobile (triggered by title hover)
  const handleSlideChange = (index: number) => {
    if (isMobile) {
      setActiveSlide(index)
    }
  }

  return (
    <section ref={featuresRef} className="py-20 px-3 md:px-6 overflow-visible bg-white relative z-10">
        <div className="container mx-auto overflow-visible">
          {/* Rounded Card Container */}
          <div className="relative overflow-visible">
            {/* Card with border and subtle background */}
            <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-0 sm:p-6 md:p-12 shadow-xl overflow-visible">
              {/* Section Header */}
              <div className="text-center mb-16 px-4 sm:px-0 pt-8 md:pt-0">
                <motion.h2 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ margin: "-10% 0px -10% 0px" }}
                  className="text-4xl md:text-5xl font-bold mb-4 text-foreground mt-6 md:mt-0"
                >
                  {t('title')}
                </motion.h2>
                <div className="max-w-3xl mx-auto mt-4 md:mt-0">
                  <MagicText 
                    text={t('subtitle')}
                    className="text-xl text-gray-600"
                  />
                </div>
              </div>

              {/* Animated Slideshow */}
              {isMobile ? (
                /* Mobile Layout: Full width background with titles */
                <HoverSlider className="min-h-[80vh] place-content-center bg-transparent text-foreground">
                  <div className="px-0 sm:px-3 md:px-12 py-6">
                    <h3 className="mb-6 ml-4 text-accent text-xs font-medium capitalize tracking-wide">
                      / strategic advantages
                    </h3>
                  </div>
                  
                  {/* Background container constrained to card boundaries */}
                  <div className="relative min-h-[60vh] mx-0 md:mx-12 overflow-hidden rounded-2xl">
                    {/* Image Gallery Container */}
                    <div className="absolute inset-0 rounded-2xl">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.id}
                          className="absolute inset-0 rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: isMobile ? (activeSlide === index ? 1 : 0) : 0 
                          }}
                          transition={{ 
                            duration: 0.4, 
                            ease: "easeInOut" 
                          }}
                        >
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover rounded-2xl"
                            loading="lazy"
                          />
                          
                          {/* Progressive blur overlay */}
                          <div className="absolute inset-0 rounded-2xl">
                            {/* Center clear area */}
                            <div className="absolute inset-8 bg-transparent" />
                            
                            {/* Progressive blur borders - more subtle */}
                            <div 
                              className="absolute inset-0 backdrop-blur-[1px] rounded-2xl"
                              style={{
                                maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 60%)',
                                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 60%)',
                              }}
                            />
                            <div 
                              className="absolute inset-0 backdrop-blur-[2px] rounded-2xl"
                              style={{
                                maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 70%)',
                                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 70%)',
                              }}
                            />
                            <div 
                              className="absolute inset-0 backdrop-blur-[4px] rounded-2xl"
                              style={{
                                maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)',
                                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)',
                              }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Titles overlay */}
                    <div className="relative z-10 p-3 md:p-6 flex flex-col space-y-4">
                      {features.map((feature, index) => (
                        <div 
                          key={feature.id} 
                          className="flex flex-col min-w-0 text-left"
                          onMouseEnter={() => handleSlideChange(index)}
                          onTouchStart={() => handleSlideChange(index)}
                        >
                          <TextStaggerHover
                            index={index}
                            className="cursor-pointer text-2xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight text-left text-foreground hover:text-accent transition-colors duration-300"
                            text={feature.titleLine1}
                          />
                          <TextStaggerHover
                            index={index}
                            className="cursor-pointer text-2xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight text-left text-foreground hover:text-accent transition-colors duration-300"
                            text={feature.titleLine2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverSlider>
              ) : (
                /* Desktop Layout: Original gallery + titles */
                <HoverSlider className="min-h-[80vh] place-content-center p-6 md:px-12 bg-transparent text-foreground">
                  <h3 className="mb-6 ml-4 text-accent text-xs font-medium capitalize tracking-wide">
                    / strategic advantages
                  </h3>
                  {/* Desktop Layout: Original gallery + titles */}
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12">
                     {/* Desktop: Images first, then titles */}
                     <motion.div
                       style={{
                         width: galleryWidth,
                         marginLeft: 'auto',
                         marginRight: '0',
                         transform: `translateX(${galleryTranslateX}%) translateY(${galleryTranslateY}px)`,
                         overflow: 'visible',
                         transformOrigin: 'right center'
                       }}
                       className="order-1 lg:order-2 rounded-3xl"
                     >
                       <HoverSliderImageWrap className="w-full max-w-none overflow-visible rounded-3xl">
                       {features.map((feature, index) => (
                         <FeatureImageWithOverlay 
                           key={feature.id} 
                           feature={feature} 
                           index={index} 
                         />
                       ))}
                     </HoverSliderImageWrap>
                     </motion.div>
                     {/* Desktop: Titles second */}
                     <div className="flex flex-col space-y-2 lg:space-y-4 order-2 lg:order-1 min-w-0 flex-shrink-0 w-full lg:w-auto">
                       {features.map((feature, index) => (
                         <div key={feature.id} className="flex flex-col min-w-0 text-left">
                           <TextStaggerHover
                             index={index}
                             className="cursor-pointer text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight whitespace-nowrap text-left text-foreground hover:text-accent transition-colors"
                             text={feature.titleLine1}
                           />
                           <TextStaggerHover
                             index={index}
                             className="cursor-pointer text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight whitespace-nowrap text-left text-foreground hover:text-accent transition-colors"
                             text={feature.titleLine2}
                           />
                         </div>
                       ))}
                     </div>
                   </div>
                </HoverSlider>
              )}
            </div>
          </div>
        </div>
      </section>
  )
}