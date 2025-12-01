'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import dynamic from 'next/dynamic'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'

// Code-split preloaders - only load when needed
const PreloaderEn = dynamic(() => import('@/components/ui/preloader-en'), { ssr: false })
const PreloaderEs = dynamic(() => import('@/components/ui/preloader-es'), { ssr: false })
const PreloaderZh = dynamic(() => import('@/components/ui/preloader-zh'), { ssr: false })
const PreloaderFr = dynamic(() => import('@/components/ui/preloader-fr'), { ssr: false })

// Code-split world maps - only load when needed (named exports)
const WorldMapDemo = dynamic(() => import('@/components/ui/world-map-demo').then(mod => ({ default: mod.WorldMapDemo })), { ssr: false })
const WorldMapDemoEs = dynamic(() => import('@/components/ui/world-map-demo-es').then(mod => ({ default: mod.WorldMapDemoEs })), { ssr: false })
const WorldMapDemoZh = dynamic(() => import('@/components/ui/world-map-demo-zh').then(mod => ({ default: mod.WorldMapDemoZh })), { ssr: false })
const WorldMapDemoFr = dynamic(() => import('@/components/ui/world-map-demo-fr').then(mod => ({ default: mod.WorldMapDemoFr })), { ssr: false })

// Code-split main sections - only load when needed
const AboutUs = dynamic(() => import('@/components/sections/AboutUs'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})
const Stats = dynamic(() => import('@/components/sections/Stats'), { 
  ssr: false,
  loading: () => <div className="min-h-[300px]" />
})
const Press = dynamic(() => import('@/components/sections/Press'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})
const Footer = dynamic(() => import('@/components/sections/Footer'), { 
  ssr: false,
  loading: () => <div className="min-h-[200px]" />
})

// Code-split Partners components - locale-specific
const Partners = dynamic(() => import('@/components/sections/Partners'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})
const PartnersEs = dynamic(() => import('@/components/sections/Partners-es'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})

// Code-split Hero components - load when needed
const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false })
const HeroEs = dynamic(() => import('@/components/sections/Hero-es'), { ssr: false })
const HeroZh = dynamic(() => import('@/components/sections/Hero-zh'), { ssr: false })
const HeroFr = dynamic(() => import('@/components/sections/Hero-fr'), { ssr: false })

// Code-split Navbar components - load when needed
const Navbar = dynamic(() => import('@/components/sections/Navbar'), { ssr: false })
const NavbarEs = dynamic(() => import('@/components/sections/Navbar-es'), { ssr: false })
const NavbarZh = dynamic(() => import('@/components/sections/Navbar-zh'), { ssr: false })

// Code-split FAQ components - load when needed
const FAQ = dynamic(() => import('@/components/sections/FAQ'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})
const FAQEs = dynamic(() => import('@/components/sections/FAQ-es'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})
const FAQZh = dynamic(() => import('@/components/sections/FAQ-zh'), { 
  ssr: false,
  loading: () => <div className="min-h-[400px]" />
})

interface LocaleHomePageProps {
  locale: string
}

export default function LocaleHomePage({ locale }: LocaleHomePageProps) {
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [contentPreRendered, setContentPreRendered] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete, isPreloaderBVisible, isLanguageSwitch, setLanguageSwitch } = usePreloader()

  // Get locale-specific components
  const getLocaleComponents = () => {
    switch (locale) {
      case 'es':
        return {
          Preloader: PreloaderEs,
          Hero: HeroEs,
          Navbar: NavbarEs,
          Partners: PartnersEs,
          FAQ: FAQEs,
          WorldMap: WorldMapDemoEs,
        }
      case 'zh':
        return {
          Preloader: PreloaderZh,
          Hero: HeroZh,
          Navbar: NavbarZh,
          Partners: Partners,
          FAQ: FAQZh,
          WorldMap: WorldMapDemoZh,
        }
      case 'fr':
        return {
          Preloader: PreloaderFr,
          Hero: HeroFr,
          Navbar: Navbar,
          Partners: Partners,
          FAQ: FAQ,
          WorldMap: WorldMapDemoFr,
        }
      default: // 'en'
        return {
          Preloader: PreloaderEn,
          Hero: Hero,
          Navbar: Navbar,
          Partners: Partners,
          FAQ: FAQ,
          WorldMap: WorldMapDemo,
        }
    }
  }

  const { Preloader, Hero: HeroComponent, Navbar: NavbarComponent, Partners: PartnersComponent, FAQ: FAQComponent, WorldMap: WorldMapComponent } = getLocaleComponents()

  // Reset language switch flag after locale change completes
  useEffect(() => {
    if (isLanguageSwitch && contentPreRendered && preloaderFadeComplete) {
      // Reset flag after a short delay to ensure everything is rendered
      const resetTimer = setTimeout(() => {
        setLanguageSwitch(false)
      }, 100)
      return () => clearTimeout(resetTimer)
    }
  }, [isLanguageSwitch, contentPreRendered, preloaderFadeComplete, setLanguageSwitch])

  // Preload critical assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Preload Spline scene
        const splineLink = document.createElement('link')
        splineLink.rel = 'preload'
        splineLink.href = 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/'
        splineLink.as = 'document'
        document.head.appendChild(splineLink)

        // Preload critical fonts
        const fontLink = document.createElement('link')
        fontLink.rel = 'preload'
        fontLink.href = '/_next/static/media/83afe278b6a6bb3c-s.p.3a6ba036.woff2'
        fontLink.as = 'font'
        fontLink.type = 'font/woff2'
        fontLink.crossOrigin = 'anonymous'
        document.head.appendChild(fontLink)

        setAssetsPreloaded(true)
      } catch (error) {
        console.warn('Asset preloading failed:', error)
        setAssetsPreloaded(true)
      }
    }

    preloadAssets()
  }, [])

  // Pre-render content early when preloader is visible
  useEffect(() => {
    // On language switch, render immediately for instant switching
    if (isLanguageSwitch) {
      setContentPreRendered(true)
      return
    }
    
    // If PreloaderB is visible, wait for it to complete before rendering
    // PreloaderB completion is handled by PageTransitionWrapper
    if (isPreloaderBVisible) {
      // Still pre-render content but keep it hidden until PreloaderB completes
      setContentPreRendered(true)
      return
    }
    
    // If PreloaderB is NOT visible (e.g., coming from project pages), render immediately
    // This makes navigation from project pages to home instant
    if (!isPreloaderBVisible) {
      setContentPreRendered(true)
      return
    }
    
    if (isPreloaderVisible && !isPreloaderBVisible) {
      // Pre-render immediately - no delay needed
      setContentPreRendered(true)
    } else if (!isPreloaderVisible) {
      setContentPreRendered(true)
    }
  }, [isPreloaderVisible, isPreloaderBVisible, isLanguageSwitch])

  // Handle preloader visibility logic
  useEffect(() => {
    // Skip preloader entirely on language switches for instant switching
    if (isLanguageSwitch) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
      return
    }
    
    const assetsCached = localStorage.getItem('cabonegro-assets-cached') === 'true'
    
    // When PreloaderB is visible, wait for it to complete (handled by PageTransitionWrapper)
    // Don't set preloaderFadeComplete until PreloaderB is hidden
    if (isPreloaderBVisible) {
      setPreloaderVisible(false)
      // Keep content hidden until PreloaderB completes
      setPreloaderFadeComplete(false)
      setContentReady(false)
      // But still pre-render content
      setContentPreRendered(true)
      return
    }
    
    // FAST PATH: If PreloaderB is NOT visible (e.g., navigating from project pages)
    // AND user has seen preloader OR assets are cached, show content immediately
    // This makes navigation from project pages to home instant
    if (!isPreloaderBVisible && !isPreloaderVisible && (hasSeenPreloader || assetsCached)) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
      return
    }
    
    // Once PreloaderB is hidden and content is pre-rendered, show it immediately
    if (!isPreloaderBVisible && contentPreRendered && !preloaderFadeComplete) {
      setPreloaderFadeComplete(true)
      setContentReady(true)
      return
    }
    
    if (isPreloaderVisible) {
      setPreloaderFadeComplete(false)
      return
    }
    
    // Fallback: If user has seen preloader and no preloaders are visible, show content
    if (hasSeenPreloader && !isPreloaderVisible && !isPreloaderBVisible) {
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
    }
  }, [hasSeenPreloader, isPreloaderBVisible, isPreloaderVisible, isLanguageSwitch, setPreloaderVisible, contentPreRendered, preloaderFadeComplete])

  // Handle hash navigation
  useEffect(() => {
    if (preloaderFadeComplete && typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        const timer = setTimeout(() => {
          const element = document.getElementById(hash.substring(1))
          if (element) {
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - 20
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [preloaderFadeComplete])

  // Handle content fade-in animation
  useEffect(() => {
    if (preloaderFadeComplete && contentRef.current && contentPreRendered) {
      // Skip animation for instant display when:
      // 1. Language switch
      // 2. Coming from project pages (no PreloaderB)
      const skipAnimation = isLanguageSwitch || (!isPreloaderBVisible && !isPreloaderVisible && hasSeenPreloader)
      
      if (skipAnimation) {
        gsap.set(contentRef.current, { opacity: 1 })
      } else {
        gsap.to(contentRef.current, { 
          opacity: 1, 
          duration: 0.6,
          ease: 'power2.out',
          delay: 0
        })
      }
    }
  }, [preloaderFadeComplete, contentPreRendered, isLanguageSwitch, isPreloaderBVisible, isPreloaderVisible, hasSeenPreloader])

  // Ensure contentReady is set
  useEffect(() => {
    if (preloaderFadeComplete && !contentReady) {
      setContentReady(true)
    }
  }, [preloaderFadeComplete, contentReady])

  // Watch for PreloaderB completion - when it hides, show content immediately
  useEffect(() => {
    if (!isPreloaderBVisible && contentPreRendered && !preloaderFadeComplete) {
      // PreloaderB just completed, show content immediately
      setPreloaderFadeComplete(true)
      setContentReady(true)
    }
  }, [isPreloaderBVisible, contentPreRendered, preloaderFadeComplete])


  // Safety fallback - skip on language switches
  useEffect(() => {
    if (isLanguageSwitch) return // Skip safety fallback on language switches
    
    if (isPreloaderVisible && !isPreloaderBVisible) {
      const duration = isLanguageSwitch ? 1.5 : 6
      const safetyTimeout = setTimeout(() => {
        setPreloaderFadeComplete(true)
        setContentReady(true)
        setPreloaderVisible(false)
        setPreloaderComplete(true)
      }, (duration + 1) * 1000)

      return () => clearTimeout(safetyTimeout)
    }
  }, [isPreloaderVisible, isPreloaderBVisible, isLanguageSwitch, setPreloaderVisible, setPreloaderComplete])

  const handlePreloaderFadeOutStart = () => {
    setContentPreRendered(true)
    setContentReady(true)
    setPreloaderFadeComplete(true)
  }

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    setPreloaderFadeComplete(true)
    setContentReady(true)
  }

  return (
    <>
      {/* Preloader - Code split, only loads when needed */}
      {isPreloaderVisible && !isPreloaderBVisible && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          onFadeOutStart={handlePreloaderFadeOutStart}
          duration={isLanguageSwitch ? 1.5 : 6}
        />
      )}

      {/* Hero - Pre-render early but keep hidden until preloader fades */}
      {contentPreRendered && (
        <div 
          style={{ 
            opacity: preloaderFadeComplete ? 1 : 0,
            pointerEvents: preloaderFadeComplete ? 'auto' : 'none',
            // Skip transition when coming from project pages for instant display
            transition: (preloaderFadeComplete && !isPreloaderBVisible && !isPreloaderVisible && hasSeenPreloader) ? 'none' : (preloaderFadeComplete ? 'opacity 0.6s ease-out' : 'none'),
            position: 'relative',
            zIndex: preloaderFadeComplete ? 1 : 0
          }}
        >
          <HeroComponent />
        </div>
      )}

      {/* Main Content - Pre-render early but hidden, fade in when ready */}
      {contentPreRendered && (
        <div 
          ref={contentRef}
          className={`min-h-screen bg-white text-foreground overflow-x-hidden max-w-full ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            opacity: preloaderFadeComplete ? 1 : 0,
            pointerEvents: preloaderFadeComplete ? 'auto' : 'none',
            // Skip transition when coming from project pages for instant display
            transition: (preloaderFadeComplete && !isPreloaderBVisible && !isPreloaderVisible && hasSeenPreloader) ? 'none' : (preloaderFadeComplete ? 'opacity 0.6s ease-out' : 'none')
          }}
        >
          {/* Navigation */}
          <NavbarComponent />
        
          {/* Main Sections */}
          <main style={{ pointerEvents: 'auto' }}>
            <AboutUs />
            <Stats />
            <PartnersComponent />
            <WorldMapComponent />
            <Press />
            <FAQComponent />
          </main>

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner />

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </div>
      )}
    </>
  )
}

