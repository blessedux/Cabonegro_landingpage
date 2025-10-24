'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Globe2, Zap, Building2, Anchor, FileCheck, TrendingUp } from 'lucide-react'
import { MagicText } from '@/components/ui/magic-text'

const features = [
  {
    id: 'strategic-gateway',
    title: 'Strategic Gateway',
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
    title: 'Industrial Park Ready',
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

export default function Features() {
  const [featureItems, setFeatureItems] = useState(features)
  const [isDragging, setIsDragging] = useState(false)

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

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {featureItems.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.id}
                layoutId={`feature-${feature.id}`}
                className="relative overflow-hidden rounded-xl cursor-move"
                variants={{
                  hidden: { y: 50, scale: 0.9, opacity: 0 },
                  visible: {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                      delay: index * 0.05
                    }
                  }
                }}
                whileHover={{ scale: isDragging ? 1 : 1.02 }}
                whileDrag={{ 
                  scale: 1.05,
                  rotate: 2,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  zIndex: 10
                }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                  setIsDragging(false)
                  const moveDistance = info.offset.x + info.offset.y
                  if (Math.abs(moveDistance) > 50) {
                    const newItems = [...featureItems]
                    const draggedItem = newItems[index]
                    const targetIndex = moveDistance > 0 ?
                      Math.min(index + 1, featureItems.length - 1) :
                      Math.max(index - 1, 0)
                    newItems.splice(index, 1)
                    newItems.splice(targetIndex, 0, draggedItem)
                    setFeatureItems(newItems)
                  }
                }}
              >
                <Card className="bg-white/5 border-2 border-white/20 hover:bg-white/10 transition-all duration-300 relative overflow-hidden h-full">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover opacity-20"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
                  </div>
                  
                  <CardContent className="p-8 relative z-10 h-full flex flex-col">
                    <div className="flex flex-col items-center text-center space-y-4 flex-1">
                      <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-2 text-left w-full mt-auto">
                        {feature.highlights.map((highlight, highlightIndex) => (
                          <li key={highlightIndex} className="text-gray-300 text-sm flex items-start">
                            <span className="text-white mr-2">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}