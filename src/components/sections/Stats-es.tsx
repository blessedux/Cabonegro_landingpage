'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  start?: number
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', className = '', start = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * (end - start) + start
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration, start])

  return (
    <div ref={ref} className={className}>
      {prefix}{end === 2.1 ? count.toFixed(1) : Math.round(count)}{suffix}
    </div>
  )
}

export default function StatsEs() {
  const statsRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  })

  // Animated background pattern based on scroll
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.4])
  const patternScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  return (
    <section 
      ref={statsRef} 
      className="py-20 px-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/cabonegro_wirefram2.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Animated background pattern overlay */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ scale: patternScale, opacity: backgroundOpacity }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
          backgroundSize: '200% 200%',
        }} />
      </motion.div>
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Estructura de Desarrollo de Tierras
          </h2>
          <div className="max-w-3xl mx-auto">
            <MagicText 
              text="Desglose completo del desarrollo de tierras en la zona industrial y marítima estratégica de Cabo Negro"
              className="text-gray-400 text-lg"
            />
          </div>
        </div>

        {/* Total Hectares - Featured */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center p-8 bg-black/50 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl">
            <div className="text-6xl md:text-7xl font-bold mb-4 text-white">
              <AnimatedCounter end={300} suffix="+" />
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2">Hectáreas Totales</p>
            <p className="text-gray-400 text-sm">Zona de Desarrollo Industrial y Marítimo</p>
          </div>
        </div>

        {/* Company/Area Breakdown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PPG */}
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-3">PPG</h3>
            <p className="text-gray-400 text-xs mb-3">Inversiones PPG SpA</p>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Solicitud de concesión marítima en trámite</p>
              <p className="text-blue-400 text-xs font-mono">CM61260</p>
              <p className="text-gray-400 text-xs mt-3">Desarrollo de zona portuaria con J&P</p>
            </div>
          </div>

          {/* Patagon Valley */}
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-3">Patagon Valley</h3>
            <p className="text-gray-400 text-xs mb-3">Inmobiliaria Patagon Valley SpA</p>
            <div className="mb-3">
              <div className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter end={33} suffix=" ha" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Propiedad de fondo de inversión privado</p>
              <p className="text-gray-300 text-sm">Instalado: AWS y GTD</p>
              <p className="text-gray-400 text-xs mt-2">Originalmente planificado como parque tecnológico</p>
            </div>
          </div>

          {/* A&J */}
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-3">A&J</h3>
            <p className="text-gray-400 text-xs mb-3">Inversiones A&J Limitada</p>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Lotes subdivididos disponibles</p>
              <p className="text-2xl font-bold text-white mb-2">5,000 m²+</p>
              <p className="text-gray-400 text-xs">Tamaño mínimo de lote</p>
            </div>
          </div>

          {/* J&P */}
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-3">Zona Portuaria J&P</h3>
            <p className="text-gray-400 text-xs mb-3">Inversiones J&P Limitada</p>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Desarrollo de zona portuaria</p>
              <p className="text-gray-300 text-sm">Vinculado al proyecto portuario PPG</p>
              <p className="text-gray-400 text-xs mt-3">Dividido en sociedades separadas:</p>
              <p className="text-gray-300 text-xs">• J&P (continuadora) - Desarrollo portuario</p>
              <p className="text-gray-300 text-xs">• J&P 2 y J&P 3 - Opciones de ampliación</p>
            </div>
          </div>

          {/* CN2 */}
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-3">Cabo Negro Dos</h3>
            <p className="text-gray-400 text-xs mb-3">Inmobiliaria Cabo Negro Dos</p>
            <div className="mb-3">
              <div className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter end={173} suffix=" ha" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Resultante de la subdivisión de J&P</p>
              <p className="text-gray-400 text-xs">Área única unificada (sin subdivisión)</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
