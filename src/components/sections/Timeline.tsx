'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, useSpring } from 'framer-motion'
import { Calendar, Ship, Shield, Anchor, Zap, Building2, Globe2 } from 'lucide-react'
import TimelineRail, { TimelineItem } from '@/components/ui/timeline-rail'

// Timeline data structure
const timelineData = [
  {
    id: 'engineering-phase',
    year: '2021-2025',
    title: 'Engineering & Regulatory',
    subtitle: 'Foundation Phase',
    description: 'Comprehensive engineering studies, environmental assessments, and regulatory approvals.',
    icon: Shield,
    color: 'blue',
    position: { x: 20, y: 15 },
    details: [
      'Environmental impact studies',
      'Regulatory framework development',
      'Engineering conceptual design',
      'Permit applications and approvals'
    ]
  },
  {
    id: 'ready-build',
    year: '2026',
    title: 'Ready-to-Build',
    subtitle: 'Investment Phase',
    description: 'All permits secured, engineering complete, ready for construction investment.',
    icon: Zap,
    color: 'green',
    position: { x: 50, y: 35 },
    details: [
      'All regulatory approvals secured',
      'Final engineering designs complete',
      'Investment capital raised',
      'Construction contracts awarded'
    ]
  },
  {
    id: 'construction',
    year: '2027-2030',
    title: 'Construction & Launch',
    subtitle: 'Implementation Phase',
    description: 'Dual-phase port construction and operational launch serving the hydrogen economy.',
    icon: Ship,
    color: 'purple',
    position: { x: 80, y: 55 },
    details: [
      'Phase 1: 350m platform + ramp (4.5m depth)',
      'Phase 2: 350m bridge + 300m pier (16m depth)',
      'Operational testing and certification',
      'Commercial operations launch'
    ]
  },
  {
    id: 'operations',
    year: '2030+',
    title: 'Full Operations',
    subtitle: 'Growth Phase',
    description: 'Serving Chile\'s hydrogen economy with protected port infrastructure.',
    icon: Anchor,
    color: 'orange',
    position: { x: 20, y: 75 },
    details: [
      'Full hydrogen export operations',
      'Atlantic-Pacific maritime corridor',
      'Antarctic logistics hub',
      'Regional economic multiplier effect'
    ]
  }
]

// Color mapping
const colorMap = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-400/50'
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-400/30',
    text: 'text-green-400',
    glow: 'shadow-green-400/50'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/50'
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/30',
    text: 'text-orange-400',
    glow: 'shadow-orange-400/50'
  }
}


export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activePhase, setActivePhase] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Transform scroll progress to phase index
  const phaseProgress = useTransform(smoothProgress, [0, 1], [0, timelineData.length - 1])
  
  // Update active phase based on scroll
  useEffect(() => {
    const unsubscribe = phaseProgress.on('change', (latest) => {
      // Ensure we handle the progress correctly with better bounds checking
      const clampedProgress = Math.max(0, Math.min(latest, timelineData.length - 1))
      const newActivePhase = Math.round(clampedProgress)
      // Only update if phase actually changed to prevent unnecessary re-renders
      setActivePhase(prev => {
        const clamped = Math.max(0, Math.min(newActivePhase, timelineData.length - 1))
        return prev !== clamped ? clamped : prev
      })
      setScrollProgress(clampedProgress)
    })
    
    return unsubscribe
  }, [phaseProgress])

  // Convert timeline data to TimelineItem format
  const timelineItems: TimelineItem[] = timelineData.map((phase, index) => ({
    label: phase.title,
    caption: phase.year,
    active: index <= activePhase,
    onClick: () => {
      setActivePhase(index)
      // Scroll to bring timeline into view when clicked
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }))

  return (
    <section 
      ref={containerRef}
      className="relative px-6 min-h-[150vh] overflow-hidden border-4 border-red-500"
      id="MaritimeTerminal"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black border-4 border-red-400" />
      

      <div className="container mx-auto relative z-10 border-4 border-red-600">
        {/* Header */}
        <div className="text-center border-4 border-red-300">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white border-4 border-red-200">
            The Port of the Southern Wind
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto border-4 border-red-200">
            Cabo Negro Terminal: A private port for public use — designed to serve Chile's hydrogen economy. 
            A protected port with minimal impact from tides, waves, or currents.
          </p>
        </div>

        {/* Timeline Content */}
        <div className="relative min-h-[120vh] flex flex-col items-center justify-center border-4 border-red-400">
          {/* Main Timeline Rail */}
          <div className="w-full max-w-6xl border-4 border-red-300">
            <TimelineRail
              items={timelineItems}
              size="md"
              labelAngle={45}
              gapClassName="gap-8 md:gap-16"
              lineColorClass="bg-gray-600"
              lineThickness={4}
              dotClass="bg-gray-500"
              dotActiveClass="bg-cyan-400"
              className="text-white border-4 border-red-200"
              labelClassName="text-cyan-400 font-semibold"
              captionClassName="text-gray-300 font-medium"
            />
          </div>

          {/* Active Phase Content */}
          <div className="w-full max-w-4xl border-4 border-red-300">
            {timelineData[activePhase] && (
              <div className="text-center border-4 border-red-200">
                <div className="p-8 bg-white/5 rounded-xl border border-white/10 border-4 border-red-200">
                  <div className="flex items-center justify-center gap-4 mb-6 border-4 border-red-300">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center border-4 border-red-200 ${
                      colorMap[timelineData[activePhase].color as keyof typeof colorMap].bg
                    } ${colorMap[timelineData[activePhase].color as keyof typeof colorMap].border}`}>
                      {React.createElement(timelineData[activePhase].icon, {
                        className: `w-8 h-8 ${colorMap[timelineData[activePhase].color as keyof typeof colorMap].text}`
                      })}
                    </div>
                    <div className="border-4 border-red-200">
                      <h3 className="text-3xl font-bold text-white mb-2 border-4 border-red-300">
                        {timelineData[activePhase].title}
                      </h3>
                      <div className={`text-lg font-medium border-4 border-red-300 ${
                        colorMap[timelineData[activePhase].color as keyof typeof colorMap].text
                      }`}>
                        {timelineData[activePhase].subtitle}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto border-4 border-red-200">
                    {timelineData[activePhase].description}
                  </p>
                  
                  {/* Details grid */}
                  <div className="grid md:grid-cols-2 gap-4 border-4 border-red-300">
                    {timelineData[activePhase].details.map((detail, detailIndex) => (
                      <div
                        key={detailIndex}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border-4 border-red-200"
                      >
                        <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          colorMap[timelineData[activePhase].color as keyof typeof colorMap].text.replace('text-', 'bg-')
                        }`} />
                        <span className="text-gray-300 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
