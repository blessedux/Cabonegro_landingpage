'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

interface ParallaxFooterProps {
  locale?: 'en' | 'es' | 'zh' | 'fr'
}

export function ParallaxFooter({ locale = 'en' }: ParallaxFooterProps) {
  const parallaxRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]')
    let scrollTriggerInstance: ScrollTrigger | null = null

    if (triggerElement) {
      const layers = [
        { layer: "1", yPercent: 80 },
        { layer: "2", yPercent: 60 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 20 }
      ]

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onRefresh: () => {
            ScrollTrigger.refresh()
          }
        }
      })

      scrollTriggerInstance = tl.scrollTrigger || null

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        )
      })

      // Refresh ScrollTrigger after setup to ensure proper calculations
      ScrollTrigger.refresh()
    }

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }
      if (triggerElement) {
        gsap.killTweensOf(triggerElement)
      }
    }
  }, [])

  // Footer content based on locale
  const footerContent = {
    en: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Cabo Negro Industrial Park',
      links: [
        { href: '/explore', text: 'Explore Terrain' },
        { href: '/deck', text: 'View Deck' },
        { href: '/#FAQ', text: 'FAQ' }
      ]
    },
    es: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Parque Industrial Cabo Negro',
      links: [
        { href: '/es/explore', text: 'Explorar Terreno' },
        { href: '/es/deck', text: 'Ver Deck' },
        { href: '/es#FAQ', text: 'Preguntas Frecuentes' }
      ]
    },
    zh: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Cabo Negro Industrial Park',
      links: [
        { href: '/zh/explore', text: '探索地形' },
        { href: '/zh/deck', text: '查看甲板' },
        { href: '/zh#FAQ', text: '常见问题' }
      ]
    },
    fr: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Parc Industriel Cabo Negro',
      links: [
        { href: '/fr/explore', text: 'Explorer le Terrain' },
        { href: '/fr/deck', text: 'Voir le Deck' },
        { href: '/fr#FAQ', text: 'FAQ' }
      ]
    }
  }

  const content = footerContent[locale]

  return (
    <footer className="parallax-footer" ref={parallaxRef}>
      <section className="parallax-footer__header min-h-[120vh] relative overflow-hidden">
        <div className="parallax-footer__visuals absolute inset-0">
          <div className="parallax-footer__black-line-overflow absolute top-0 left-0 right-0 h-1 bg-black z-50"></div>
          <div data-parallax-layers className="parallax-footer__layers absolute inset-0">
            {/* Layer 1 - Background gradient */}
            <div 
              data-parallax-layer="1" 
              className="parallax-footer__layer absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black"
            />
            
            {/* Layer 2 - Pattern overlay */}
            <div 
              data-parallax-layer="2" 
              className="parallax-footer__layer absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}
            />
            
            {/* Layer 3 - Title */}
            <div 
              data-parallax-layer="3" 
              className="parallax-footer__layer-title absolute inset-0 flex items-center justify-center z-10"
            >
              <h2 className="parallax-footer__title text-6xl md:text-8xl font-bold text-white tracking-tight">
                {content.title}
              </h2>
            </div>
            
            {/* Layer 4 - Accent elements */}
            <div 
              data-parallax-layer="4" 
              className="parallax-footer__layer absolute inset-0"
            >
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          </div>
          <div className="parallax-footer__fade absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </div>
      </section>
      
      <section className="parallax-footer__content bg-black border-t-2 border-black shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] rounded-t-lg relative z-30">
        <div className="container mx-auto py-16 px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="text-2xl font-bold mb-2 text-white">{content.title}</div>
              <p className={`text-sm ${locale === 'es' ? 'text-gray-500' : 'text-gray-400'}`}>
                {content.copyright}
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              {content.links.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href} 
                  className={`text-sm uppercase hover:opacity-80 transition-opacity ${
                    locale === 'es' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}

