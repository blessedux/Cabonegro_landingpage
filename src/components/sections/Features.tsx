'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Globe2, Zap, Building2, Anchor, FileCheck, TrendingUp } from 'lucide-react'

const features = [
  {
    id: 'strategic-gateway',
    title: 'Strategic Gateway',
    icon: Globe2,
    description: 'Panama Canal alternative connecting Atlantic and Pacific Oceans',
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
    highlights: [
      'Massive wind potential in region',
      'Low hosting and maintenance costs',
      'Sustainable energy infrastructure'
    ]
  }
]

export default function Features() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Strategic Investment Opportunity</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cabo Negro represents a unique convergence of strategic location, renewable energy potential, and ready-to-build infrastructure
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={feature.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-white/10 rounded-full">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2 text-left w-full">
                      {feature.highlights.map((highlight, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-start">
                          <span className="text-white mr-2">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}