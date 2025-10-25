'use client'

import { motion } from 'framer-motion'
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

const features = [
  {
    id: 'strategic-gateway',
    title: 'Strategic Gateway',
    titleLine1: 'Strategic',
    titleLine2: 'Gateway',
    icon: Globe2,
    description: 'Panama Canal alternative connecting Atlantic and Pacific Oceans',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    highlights: [
      'Primary gateway to Antarctica',
      'Free of tolls and geopolitical risks',
      'Atlantic-Pacific maritime corridor'
    ]
  },
  {
    id: 'h2v-opportunity',
    title: 'H₂V Opportunity',
    titleLine1: 'H₂V',
    titleLine2: 'Opportunity',
    icon: Zap,
    description: 'Magallanes could produce 13% of the world\'s green hydrogen',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop&crop=center',
    highlights: [
      '200+ projects filed or under review',
      'Expected to double regional GDP',
      'EDF entering by end of 2025'
    ]
  },
  {
    id: 'industrial-park',
    title: 'Industrial Ready',
    titleLine1: 'Industrial',
    titleLine2: 'Ready',
    icon: Building2,
    description: '300+ hectares of ready-to-build industrial infrastructure',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    highlights: [
      'Connected to Route 9N main corridor',
      '6 internal roads (33% built)',
      '13 MW electrical capacity'
    ]
  },
  {
    id: 'maritime-terminal',
    title: 'Maritime Terminal',
    titleLine1: 'Maritime',
    titleLine2: 'Terminal',
    icon: Anchor,
    description: 'Dual-phase port construction ready-to-build by 2026',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
    highlights: [
      'Protected port location',
      'Phase 1: 350m platform + ramp',
      'Phase 2: 350m bridge + 300m pier'
    ]
  },
  {
    id: 'regulatory-advantage',
    title: 'Regulatory Advantage',
    titleLine1: 'Regulatory',
    titleLine2: 'Advantage',
    icon: FileCheck,
    description: 'New urban plan includes Cabo Negro as industrial nucleus',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&crop=center',
    highlights: [
      '3,258 hectares added to urban limits',
      'Industrial zoning approved',
      'Orderly growth framework'
    ]
  },
  {
    id: 'wind-potential',
    title: 'Wind Power Potential',
    titleLine1: 'Wind Power',
    titleLine2: 'Potential',
    icon: TrendingUp,
    description: '7× Chile\'s current power generation capacity',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop&crop=center',
    highlights: [
      'Massive wind potential in region',
      'Low hosting and maintenance costs',
      'Sustainable energy infrastructure'
    ]
  }
]

// Custom component to handle conditional overlay
function FeatureImageWithOverlay({ feature, index }: { feature: any, index: number }) {
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
    <div className="relative">
      <HoverSliderImage
        index={index}
        imageUrl={feature.image}
        src={feature.image}
        alt={feature.title}
        className="size-full max-h-96 object-cover rounded-lg"
        loading="eager"
        decoding="async"
      />
      
      {/* Mobile Overlay - only covers this specific image, behind text */}
      {isMobile && showMobileOverlay && (
        <motion.div
          className="absolute inset-0 bg-[#2D1B1B] bg-opacity-30 z-5 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
      {/* Overlay with feature info - only visible when image is active */}
      {isActive && (
        <motion.div 
          className="absolute inset-0 text-white z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Full-width gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
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
            className="absolute bottom-0 left-0 right-0 p-4 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-sm text-white mb-2 font-bold drop-shadow-lg">{feature.description}</p>
            <ul className="space-y-1">
              {feature.highlights.slice(0, 2).map((highlight: string, highlightIndex: number) => (
                <li key={highlightIndex} className="text-xs text-gray-100 flex items-start font-semibold drop-shadow-md">
                  <span className="text-cyan-400 mr-2 font-bold drop-shadow-lg">•</span>
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

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ margin: "-10% 0px -10% 0px" }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Strategic Investment Opportunity
          </motion.h2>
          <div className="max-w-3xl mx-auto">
            <MagicText 
              text="Cabo Negro represents a unique convergence of strategic location, renewable energy potential, and ready-to-build infrastructure"
              className="text-xl text-gray-400"
            />
          </div>
          
        </div>

        {/* Animated Slideshow */}
        <HoverSlider className="min-h-[80vh] place-content-center p-6 md:px-12 bg-transparent text-white">
          <h3 className="mb-6 text-cyan-400 text-xs font-medium capitalize tracking-wide">
            / strategic advantages
          </h3>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12">
            {/* Mobile: Images first, then titles */}
            <HoverSliderImageWrap className="w-full max-w-lg order-1 lg:order-2">
              {features.map((feature, index) => (
                <FeatureImageWithOverlay 
                  key={feature.id} 
                  feature={feature} 
                  index={index} 
                />
              ))}
            </HoverSliderImageWrap>
            {/* Mobile: Titles second */}
            <div className="flex flex-col space-y-2 lg:space-y-4 order-2 lg:order-1 min-w-0 flex-shrink-0 w-full lg:w-auto">
              {features.map((feature, index) => (
                <div key={feature.id} className="flex flex-col min-w-0 text-left">
                  <TextStaggerHover
                    index={index}
                    className="cursor-pointer text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight whitespace-nowrap text-left"
                    text={feature.titleLine1}
                  />
                  <TextStaggerHover
                    index={index}
                    className="cursor-pointer text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tighter break-words hyphens-none leading-tight whitespace-nowrap text-left"
                    text={feature.titleLine2}
                  />
                </div>
              ))}
            </div>
          </div>
        </HoverSlider>
      </div>
    </section>
  )
}