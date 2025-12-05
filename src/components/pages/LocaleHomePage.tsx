'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'
import PreloaderB from '@/components/ui/preloader-b'

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
  const contentRef = useRef<HTMLDivElement>(null)
  const { isFadingOut } = useAnimation()
  const { isPreloaderBVisible, hidePreloaderB, hasSeenPreloader, isNavigating, setPreloaderComplete } = usePreloader()
  const pathname = usePathname()
  // Always initialize to false to prevent hydration mismatch
  // We'll set the correct value in useEffect after hydration
  const [shouldShowContent, setShouldShowContent] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(false) // Track if this is the first load (not navigation)
  const [statsKey, setStatsKey] = useState(0) // Key to force Stats remount on navigation
  // Track previous locale to detect language changes
  const prevLocaleRef = useRef(locale)
  
  // Initialize content visibility after hydration and reset on locale change
  useEffect(() => {
    // Reset content visibility on locale change to ensure preloader shows
    if (prevLocaleRef.current !== locale) {
      setShouldShowContent(false)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 LocaleHomePage: Locale changed, resetting content visibility', { from: prevLocaleRef.current, to: locale })
      }
      prevLocaleRef.current = locale
    }
    
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!hasVisited) {
        // First visit - mark as first load and DON'T show content yet
        // PreloaderB will cover content until it completes (PreloaderContext sets isPreloaderBVisible=true)
        setIsFirstLoad(true)
        setShouldShowContent(false) // Keep content hidden until preloader completes
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 LocaleHomePage: First visit detected, setting isFirstLoad=true, PreloaderB will show')
        }
      } else {
        // Return visit - show PreloaderB briefly, then show content
        // Ensure PreloaderB shows even if PreloaderContext didn't set it
        setIsFirstLoad(false)
        setShouldShowContent(false) // Don't show content immediately - this ensures PreloaderB shows via condition
        // PreloaderB will show via condition: (isPreloaderBVisible || !shouldShowContent)
        // Since shouldShowContent is false, PreloaderB will show
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 LocaleHomePage: Return visit detected, PreloaderB will show briefly', { 
            isPreloaderBVisible, 
            isNavigating,
            shouldShowContent: false 
          })
        }
      }
    }
  }, [locale, isPreloaderBVisible, isNavigating]) // Include isPreloaderBVisible and isNavigating to track state

  // Mark as visited when preloader shows (first load)
  useEffect(() => {
    if (isPreloaderBVisible && typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!hasVisited) {
        localStorage.setItem('cabonegro-homepage-visited', 'true')
      }
    }
  }, [isPreloaderBVisible])

  // Handle preloader completion - show content and hide preloader only when content is ready
  // ALWAYS verify content is ready before hiding PreloaderB to prevent blank screens
  useEffect(() => {
    // Check if content is actually rendered and ready
    const checkContentReady = () => {
      // Check if Hero is rendered (Hero is rendered separately, before contentRef)
      // Hero typically has a video or image element
      const heroRendered = document.querySelector('video[autoplay]') !== null ||
                           document.querySelector('section') !== null ||
                           document.querySelector('main') !== null
      
      // Check if contentRef div exists and has content
      if (!contentRef.current) return false
      
      // Check if content has children (Navbar, main sections, etc.)
      const hasChildren = contentRef.current.children.length > 0
      
      // Check if Navbar is rendered (should be first child)
      const navbarRendered = contentRef.current.querySelector('nav') !== null ||
                             contentRef.current.children.length > 0
      
      // Check if main content sections are rendered
      const mainRendered = contentRef.current.querySelector('main') !== null
      
      // Check if content has meaningful HTML (more than just whitespace)
      const hasContent = contentRef.current.innerHTML.trim().length > 500 // At least 500 chars of content
      
      // All checks must pass: Hero rendered, contentRef has children, Navbar rendered, main rendered, and has content
      const isReady = heroRendered && hasChildren && navbarRendered && mainRendered && hasContent
      
      if (process.env.NODE_ENV === 'development' && isReady) {
        console.log('✅ Content readiness check passed:', {
          heroRendered,
          hasChildren,
          navbarRendered,
          mainRendered,
          hasContent,
          childrenCount: contentRef.current.children.length
        })
      }
      
      return isReady
    }

    // For return visits (not first load, not navigating): show PreloaderB briefly then verify content
    if (!isFirstLoad && !isNavigating && !shouldShowContent) {
      // Show content first, then verify it's ready before hiding PreloaderB
      setShouldShowContent(true)
      
      // Poll for content readiness - check every 50ms until content is ready
      const checkInterval = setInterval(() => {
        if (checkContentReady()) {
          clearInterval(checkInterval)
          // Content is ready - hide PreloaderB smoothly
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  hidePreloaderB()
                  setPreloaderComplete(true) // Mark preloader as complete
                  if (process.env.NODE_ENV === 'development') {
                    console.log('✅ LocaleHomePage: Return visit - Content confirmed ready, hiding PreloaderB and marking complete')
                  }
                })
              })
        }
      }, 50) // Check every 50ms
      
      // Safety: Force hide after 2 seconds even if content check fails
      const safetyTimer = setTimeout(() => {
        clearInterval(checkInterval)
        if (isPreloaderBVisible) {
          hidePreloaderB()
          setPreloaderComplete(true) // Mark preloader as complete
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ LocaleHomePage: Return visit - Safety timer triggered, hiding PreloaderB and marking complete')
          }
        }
      }, 2000)
      
      return () => {
        clearInterval(checkInterval)
        clearTimeout(safetyTimer)
      }
    }
    
    // For first load: show content, then verify it's ready before hiding PreloaderB
    if (isFirstLoad && isPreloaderBVisible && !shouldShowContent) {
      // Minimum display time for first load (2 seconds) - show content after this
      const minDisplayTimer = setTimeout(() => {
        setShouldShowContent(true)
        setIsFirstLoad(false)
        
        // Now poll for content readiness
        const checkInterval = setInterval(() => {
          if (checkContentReady()) {
            clearInterval(checkInterval)
            // Content is ready - hide PreloaderB smoothly
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                hidePreloaderB()
                setPreloaderComplete(true) // Mark preloader as complete
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ LocaleHomePage: First load - Content confirmed ready, hiding PreloaderB and marking complete')
                }
              })
            })
          }
        }, 50) // Check every 50ms
        
        // Safety: Force hide after additional 1 second if content check fails
        const safetyTimer = setTimeout(() => {
          clearInterval(checkInterval)
          if (isPreloaderBVisible) {
            hidePreloaderB()
            setPreloaderComplete(true) // Mark preloader as complete
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ LocaleHomePage: First load - Safety timer triggered, hiding PreloaderB and marking complete')
            }
          }
        }, 3000) // 2s min display + 1s safety = 3s total
        
        return () => {
          clearInterval(checkInterval)
          clearTimeout(safetyTimer)
        }
      }, 2000) // Minimum 2 seconds display for first load
      
      return () => clearTimeout(minDisplayTimer)
    }
    
    // For language switches/navigation: when content should be shown, verify it's ready before hiding preloader
    if (!isFirstLoad && shouldShowContent && isPreloaderBVisible) {
      // Poll for content readiness
      const checkInterval = setInterval(() => {
        if (checkContentReady()) {
          clearInterval(checkInterval)
          // Content is confirmed ready - hide preloader after ensuring it's painted
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              hidePreloaderB()
              setPreloaderComplete(true) // Mark preloader as complete
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ LocaleHomePage: Language switch - Content confirmed ready, hiding PreloaderB and marking complete')
              }
            })
          })
        }
      }, 50) // Check every 50ms
      
      // Safety: Force hide after 2 seconds if content check fails
      const safetyTimer = setTimeout(() => {
        clearInterval(checkInterval)
        if (isPreloaderBVisible) {
          hidePreloaderB()
          setPreloaderComplete(true) // Mark preloader as complete
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ LocaleHomePage: Language switch - Safety timer triggered, hiding PreloaderB and marking complete')
          }
        }
      }, 2000)
      
      return () => {
        clearInterval(checkInterval)
        clearTimeout(safetyTimer)
      }
    }
  }, [isPreloaderBVisible, shouldShowContent, isNavigating, isFirstLoad, hidePreloaderB, locale])
  
  // Force Stats component to remount on navigation to homepage or locale change
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    if (isHomePage) {
      // Increment key to force Stats remount, which resets scroll tracking
      // This triggers on both pathname and locale changes to ensure complete reset
      setStatsKey(prev => prev + 1)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 LocaleHomePage: Navigation to homepage or locale change, forcing Stats remount', { locale, pathname })
      }
    }
  }, [pathname, locale])

  // Safety: If preloader is stuck, show content after max time
  useEffect(() => {
    if (isPreloaderBVisible && !shouldShowContent) {
      const safetyTimer = setTimeout(() => {
        if (isPreloaderBVisible) {
          // Preloader stuck, force show content
          hidePreloaderB()
          setPreloaderComplete(true) // Mark preloader as complete
          setShouldShowContent(true)
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ LocaleHomePage: Safety timer - Preloader stuck, forcing completion')
          }
        }
      }, 3000) // Max 3 seconds
      return () => clearTimeout(safetyTimer)
    }
  }, [isPreloaderBVisible, shouldShowContent, hidePreloaderB])

  // Get locale-specific components
  const getLocaleComponents = () => {
    switch (locale) {
      case 'es':
        return {
          Hero: HeroEs,
          Navbar: NavbarEs,
          Partners: PartnersEs,
          FAQ: FAQEs,
          WorldMap: WorldMapDemoEs,
        }
      case 'zh':
        return {
          Hero: HeroZh,
          Navbar: NavbarZh,
          Partners: Partners,
          FAQ: FAQZh,
          WorldMap: WorldMapDemoZh,
        }
      case 'fr':
        return {
          Hero: HeroFr,
          Navbar: Navbar,
          Partners: Partners,
          FAQ: FAQ,
          WorldMap: WorldMapDemoFr,
        }
      default: // 'en'
        return {
          Hero: Hero,
          Navbar: Navbar,
          Partners: Partners,
          FAQ: FAQ,
          WorldMap: WorldMapDemo,
        }
    }
  }

  const { Hero: HeroComponent, Navbar: NavbarComponent, Partners: PartnersComponent, FAQ: FAQComponent, WorldMap: WorldMapComponent } = getLocaleComponents()

  // Preload critical assets in background (non-blocking)
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
        fontLink.rel = 'preload'
        fontLink.as = 'font'
        fontLink.type = 'font/woff2'
        fontLink.crossOrigin = 'anonymous'
        fontLink.crossOrigin = 'anonymous'
        document.head.appendChild(fontLink)
      } catch (error) {
        console.warn('Asset preloading failed:', error)
      }
    }

    preloadAssets()
  }, [])

  // Remove console logs in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Suppress console logs in production
      const originalLog = console.log
      console.log = () => {}
      return () => {
        console.log = originalLog
      }
    }
  }, [])

  // Handle hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, [])

  return (
    <>
      {/* PreloaderB - ONLY preloader used throughout the app */}
      {/* Show while loading or navigating, hide only when content is ready */}
      {/* Keep preloader visible until content is ready to prevent white screen */}
      {/* Show preloader if: explicitly visible OR content not ready (prevents white screen) */}
      {(isPreloaderBVisible || !shouldShowContent) ? (
        <PreloaderB 
          key={isFirstLoad ? "preloader-first-load" : "preloader-content-loading"} // Key to ensure it remounts
          shouldAutoHide={false} // NEVER auto-hide - always wait for explicit hide when content is confirmed ready
          onComplete={() => {
            // onComplete is called by PreloaderB's safety timer (5s max)
            // But we don't use it to hide - we only hide when content is ready
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ LocaleHomePage: PreloaderB onComplete called (safety timer), but waiting for content to be ready', { 
                isFirstLoad, 
                shouldShowContent, 
                isNavigating,
                isPreloaderBVisible 
              })
            }
            // Don't hide here - wait for content readiness check
          }}
          duration={isFirstLoad ? 2 : 0.5} // Duration only used for safety timer, not auto-hide
        />
      ) : null}

      {/* Content - Show when ready, but keep preloader visible until content is confirmed rendered */}
      {/* Preloader will hide automatically when content is confirmed ready */}
      {/* Content is rendered and visible (opacity 1) - PreloaderB overlays it with z-index 99999 */}
      {/* When PreloaderB fades out, content is already there, preventing blank screen */}
      {shouldShowContent && (
        <>
          {/* Hero - Render after preloader */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <HeroComponent />
          </div>

          {/* Main Content - Render after preloader, content loads progressively */}
          <div 
            ref={contentRef}
            className={`min-h-screen bg-white text-foreground overflow-x-hidden max-w-full ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          >
        {/* Navigation */}
        <NavbarComponent />
      
        {/* Main Sections */}
        <main style={{ pointerEvents: 'auto' }}>
          <AboutUs />
          <Stats key={`stats-${locale}-${statsKey}`} />
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
        </>
      )}
    </>
  )
}

