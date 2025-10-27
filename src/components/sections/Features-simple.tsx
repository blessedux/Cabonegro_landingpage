'use client'

import { motion } from 'framer-motion'
import { Globe2, Zap, Building2, Anchor, FileCheck, TrendingUp } from 'lucide-react'
import { MagicText } from '@/components/ui/magic-text'

const features = [
  {
    id: 'strategic-gateway',
    title: 'Strategic Gateway',
    titleLine1: 'Strategic',
    titleLine2: 'Gateway',
    icon: Globe2,
    description: 'Positioned at the southern tip of Chile, Cabo Negro offers unparalleled access to Antarctica and global shipping routes.',
    image: '/stretegicgateway.webp',
    highlights: ['Gateway to Antarctica', 'Global Shipping Routes', 'Strategic Location']
  },
  {
    id: 'h2v-opportunity',
    title: 'H₂V Opportunity',
    titleLine1: 'H₂V',
    titleLine2: 'Opportunity',
    icon: Zap,
    description: 'Strategic positioning for green hydrogen production, contributing to Chile\'s 13% global production target.',
    image: '/h2_hydrogen.png',
    highlights: ['13% Global H₂V', 'Green Hydrogen', 'Sustainable Energy']
  },
  {
    id: 'industrial-park',
    title: 'Industrial Ready',
    titleLine1: 'Industrial',
    titleLine2: 'Ready',
    icon: Building2,
    description: '300+ hectares of industrial land ready for development with world-class infrastructure and logistics.',
    image: '/model4.png',
    highlights: ['300+ Hectares', 'World-Class Infrastructure', 'Ready for Development']
  },
  {
    id: 'maritime-terminal',
    title: 'Maritime Terminal',
    titleLine1: 'Maritime',
    titleLine2: 'Terminal',
    icon: Anchor,
    description: 'Deep-water port facilities designed to handle large vessels and serve as an alternative to the Panama Canal.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
    highlights: ['Deep-Water Port', 'Panama Canal Alternative', 'Large Vessel Ready']
  },
  {
    id: 'regulatory-advantage',
    title: 'Regulatory Advantage',
    titleLine1: 'Regulatory',
    titleLine2: 'Advantage',
    icon: FileCheck,
    description: 'Favorable regulatory environment with government support and streamlined approval processes.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop&crop=center',
    highlights: ['Government Support', 'Streamlined Processes', 'Favorable Regulations']
  },
  {
    id: 'wind-potential',
    title: 'Wind Potential',
    titleLine1: 'Wind',
    titleLine2: 'Potential',
    icon: TrendingUp,
    description: 'Abundant wind resources provide 7x Chile\'s current capacity, powering sustainable industrial development.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=center',
    highlights: ['7x Wind Capacity', 'Abundant Resources', 'Sustainable Power']
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <MagicText text="Strategic Advantages" />
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cabo Negro represents Chile's most transformative industrial development opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-600 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-left">{feature.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 text-left">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-sm text-blue-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
