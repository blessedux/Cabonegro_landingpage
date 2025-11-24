'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

export default function FooterEs() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollBottom = scrollTop + windowHeight
      
      // Calculate how close we are to the bottom
      // Start animating when within 300px of the bottom
      const triggerDistance = 300
      const distanceFromBottom = documentHeight - scrollBottom
      
      if (distanceFromBottom <= triggerDistance) {
        // Calculate progress from 0 to 1 (0 = 300px from bottom, 1 = at bottom)
        const progress = 1 - (distanceFromBottom / triggerDistance)
        setScrollProgress(Math.min(1, Math.max(0, progress)))
      } else {
        setScrollProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate translateY based on scroll progress (slides up more as you scroll down)
  // Max slide up is -12px when at bottom
  const translateY = scrollProgress * -12

  return (
    <footer 
      ref={footerRef}
      // eslint-disable-next-line react/forbid-dom-props
      style={{ transform: `translateY(${translateY}px)` }}
      className="py-16 px-6 border-t-2 border-black shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] rounded-t-lg transition-transform duration-300 ease-out"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2">CABO NEGRO</div>
            <p className="text-sm text-gray-500">© 2025 Parque Industrial Cabo Negro</p>
          </div>

          <div className="flex flex-wrap gap-8">
            <Link href="/es/explore" className="text-sm text-gray-400 hover:text-white uppercase">Explorar Terreno</Link>
            <Link href="/es/deck" className="text-sm text-gray-400 hover:text-white uppercase">Ver Deck</Link>
            <Link href="/es#FAQ" className="text-sm text-gray-400 hover:text-white uppercase">Preguntas Frecuentes</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
