'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'
import PreloaderB from '@/components/ui/preloader-b'
import { GradientBlurBg } from '@/components/ui/gradient-blur-bg'

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
  const { isPreloaderBVisible, hidePreloaderB, hasSeenPreloader, isNavigating, setPreloaderComplete, isVideoReady, navigationStartTime } = usePreloader()
  const pathname = usePathname()
  // Always initialize to false to prevent hydration mismatch
  // We'll set the correct value in useEffect after hydration
  const [shouldShowContent, setShouldShowContent] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(false) // Track if this is the first load (not navigation)
  const [statsKey, setStatsKey] = useState(0) // Key to force Stats remount on navigation
  const [contentOpacity, setContentOpacity] = useState(0) // Control content fade-in for crossfade - start at 0, set to 1 before preloader fades
  const [componentsLoaded, setComponentsLoaded] = useState(false) // Track if all components are loaded
  // Track previous locale to detect language changes
  const prevLocaleRef = useRef(locale)
  
  // Preload all components immediately on mount (don't wait for preloader)
  useEffect(() => {
    if (!componentsLoaded) {
      // Preload all dynamic components based on locale
      const preloadPromises = [
        import('@/components/sections/AboutUs'),
        import('@/components/sections/Stats'),
        import('@/components/sections/Press'),
        import('@/components/sections/Footer'),
        import('@/components/sections/Partners'),
        locale === 'es' ? import('@/components/sections/Partners-es') : Promise.resolve(),
        locale === 'es' ? import('@/components/sections/Hero-es') : Promise.resolve(),
        locale === 'es' ? import('@/components/sections/Navbar-es') : Promise.resolve(),
        locale === 'es' ? import('@/components/sections/FAQ-es') : Promise.resolve(),
        locale === 'zh' ? import('@/components/sections/Hero-zh') : Promise.resolve(),
        locale === 'zh' ? import('@/components/sections/Navbar-zh') : Promise.resolve(),
        locale === 'zh' ? import('@/components/sections/FAQ-zh') : Promise.resolve(),
        locale === 'fr' ? import('@/components/sections/Hero-fr') : Promise.resolve(),
        locale === 'en' ? import('@/components/sections/Hero') : Promise.resolve(),
        locale === 'en' ? import('@/components/sections/Navbar') : Promise.resolve(),
        locale === 'en' ? import('@/components/sections/FAQ') : Promise.resolve(),
        import('@/components/ui/world-map-demo'),
        locale === 'es' ? import('@/components/ui/world-map-demo-es') : Promise.resolve(),
        locale === 'zh' ? import('@/components/ui/world-map-demo-zh') : Promise.resolve(),
        locale === 'fr' ? import('@/components/ui/world-map-demo-fr') : Promise.resolve(),
      ]
      
      Promise.all(preloadPromises)
        .then(() => {
          setComponentsLoaded(true)
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] Components preloaded')
          }
        })
        .catch((error) => {
          // Still mark as loaded to prevent blocking - components will load on demand
          setComponentsLoaded(true)
          if (process.env.NODE_ENV === 'development') {
            console.error('⏱️ [PERF] Component preload error', error)
          }
        })
    }
  }, [locale]) // Only depend on locale, start immediately
  
  // Initialize content visibility after hydration and reset on locale change
  useEffect(() => {
    // Reset content visibility on locale change to ensure preloader shows
    if (prevLocaleRef.current !== locale) {
      setShouldShowContent(false)
      setContentOpacity(0) // Reset opacity for new transition
      setComponentsLoaded(false) // Reset components loaded state
      prevLocaleRef.current = locale
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ [PERF] Locale changed', { from: prevLocaleRef.current, to: locale })
      }
    }
    
    // Ensure contentOpacity doesn't get stuck at 0 after preloader completes
    if (!isPreloaderBVisible && shouldShowContent && contentOpacity === 0) {
      setContentOpacity(1)
    }
    
    // CRITICAL: Set contentOpacity to 1 when content should be shown, BEFORE preloader fades
    if (shouldShowContent && contentOpacity < 1) {
      setContentOpacity(1)
    }
    
    // CRITICAL FIX: If preloader is hidden but content isn't shown yet, show it immediately
    // This handles cases where usePageTransition hides preloader before LocaleHomePage shows content
    if (!isPreloaderBVisible && !shouldShowContent) {
      setShouldShowContent(true)
      setContentOpacity(1)
      setPreloaderComplete(true)
    }
    
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      
      // Don't reset shouldShowContent if it's already true
      if (shouldShowContent) {
        return
      }
      
      if (!hasVisited) {
        setIsFirstLoad(true)
        if (!shouldShowContent) {
          setShouldShowContent(false)
        }
      } else {
        setIsFirstLoad(false)
      }
    }
  }, [locale, isPreloaderBVisible, isNavigating]) // Only depend on locale and preloader state, not shouldShowContent/contentOpacity to avoid loops

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
      // Check if content is actually rendered and ready AND VISIBLE
      const checkContentReady = () => {
      // Check if content is actually visible (opacity > 0)
      if (contentRef.current) {
        const computedStyle = window.getComputedStyle(contentRef.current)
        const isContentVisible = parseFloat(computedStyle.opacity) > 0.5
        if (!isContentVisible) {
          return false
        }
      }
      
      // CRITICAL: Check if video is ready - ONLY on home page (has video)
      // Non-home pages don't have videos, so skip this check for them
      // OPTIMIZED: For navigation (not first load), be less strict about video ready state
      const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr' || pathname === '/'
      if (isHomePage && !isVideoReady) {
        // Check if video element exists and is ready
        const videoElement = document.querySelector('video') as HTMLVideoElement
        if (videoElement) {
          // For navigation (not first load), accept readyState >= 2 (HAVE_CURRENT_DATA) for faster transitions
          // For first load, require readyState >= 3 (HAVE_FUTURE_DATA) for smoother playback
          const minReadyState = isFirstLoad ? 3 : 2
          if (videoElement.readyState < minReadyState) {
            return false
          }
        } else {
          // Video element doesn't exist yet - wait (only on home page)
          // But for navigation, don't wait too long - video might load in background
          if (isFirstLoad) {
            return false
          }
          // For navigation, if video doesn't exist after a short time, proceed anyway
          // This prevents blocking on slow video loads
        }
      }
      // For non-home pages, skip video check (no video exists)
      
      // Check if contentRef div exists and has content
      if (!contentRef.current) {
        return false
      }
      
      // Check if content has children (Navbar, main sections, etc.)
      const hasChildren = contentRef.current.children.length > 0
      
      // Check if Navbar is rendered (should be first child)
      const navbarRendered = contentRef.current.querySelector('nav') !== null ||
                             contentRef.current.children.length > 0
      
      // Check if main content sections are rendered
      const mainRendered = contentRef.current.querySelector('main') !== null
      
      // Check if content has meaningful HTML
      const hasContent = contentRef.current.innerHTML.trim().length > 1000
      
      // CRITICAL: Check if contentOpacity state is 1 (content should be visible)
      const contentIsVisible = contentOpacity >= 0.9
      
      // Comprehensive check: All major components must be rendered AND visible AND video ready
      const allSectionsRendered = navbarRendered && mainRendered
      const heroRendered = document.querySelector('section[class*="fixed"]') !== null ||
                           document.querySelector('section') !== null ||
                           document.querySelector('main') !== null
      
      // Video readiness only required on home page
      const videoReady = isHomePage ? isVideoReady : true // Non-home pages don't have video
      
      const isReady = (heroRendered || hasChildren) && 
                     allSectionsRendered && 
                     hasContent &&
                     contentIsVisible &&
                     videoReady // Video ready only required on home page
      
      if (process.env.NODE_ENV === 'development' && !isReady) {
        const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
        console.log('⏱️ [PERF] Content not ready', {
          isHomePage,
          videoReady: isHomePage ? isVideoReady : 'N/A (not home)',
          hasContent,
          contentVisible: contentIsVisible,
          timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A'
        })
      }
      
      return isReady
    }

    // For return visits (not first load, not navigating): show content immediately
    // usePageTransition handles preloader hiding, so we just need to show content
    if (!isFirstLoad && !isNavigating && !shouldShowContent) {
      // CRITICAL: If preloader is already hidden, show content immediately to prevent white screen
      if (!isPreloaderBVisible) {
        setShouldShowContent(true)
        setContentOpacity(1)
        setPreloaderComplete(true)
        return
      }
      
      // Show content immediately - usePageTransition will handle preloader hiding
      // No delays needed - let usePageTransition control timing
      setShouldShowContent(true)
      setContentOpacity(1)
      setPreloaderComplete(true)
    }
    
    // OPTIMIZED: For navigation (not first load), show content faster
    // When navigating to home, show content immediately when preloader is visible
    if (!isFirstLoad && isNavigating && isPreloaderBVisible && !shouldShowContent) {
      // Show content immediately on navigation - don't wait
      setShouldShowContent(true)
      setContentOpacity(1)
      setPreloaderComplete(true)
    }
    
    // For first load: show content, then verify it's ready before hiding PreloaderB
    if (isFirstLoad && isPreloaderBVisible && !shouldShowContent) {
      // Minimum display time for first load (2 seconds) - show content after this
      const minDisplayTimer = setTimeout(() => {
        setShouldShowContent(true)
        setContentOpacity(1)
        setPreloaderComplete(true)
        
        // Give content a moment to render before checking
        const initialDelay = setTimeout(() => {
          let checkCount = 0
          // Now poll for content readiness - check every 100ms
          const checkInterval = setInterval(() => {
            checkCount++
            const isReady = checkContentReady()
            
            if (process.env.NODE_ENV === 'development' && checkCount % 5 === 0) {
              const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
              console.log(`⏱️ [PERF] First load check #${checkCount}`, {
                ready: isReady,
                timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A'
              })
            }
            
            if (isReady) {
              clearInterval(checkInterval)
              setIsFirstLoad(false)
              setContentOpacity(1)
              const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
              if (process.env.NODE_ENV === 'development') {
                console.log('⏱️ [PERF] First load - Content ready', {
                  timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A'
                })
              }
              setTimeout(() => {
                if (contentRef.current) {
                  const computedStyle = window.getComputedStyle(contentRef.current)
                  const isStillVisible = parseFloat(computedStyle.opacity) >= 0.9
                  if (isStillVisible) {
                    hidePreloaderB()
                    setPreloaderComplete(true)
                  } else {
                    setTimeout(() => {
                      hidePreloaderB()
                      setPreloaderComplete(true)
                    }, 200)
                  }
                } else {
                  hidePreloaderB()
                  setPreloaderComplete(true)
                }
              }, 200) // Reduced delay for faster transitions
            }
          }, 100) // Check every 100ms
          
          // Safety: Force hide after 2 seconds if content check fails
          const safetyTimer = setTimeout(() => {
            clearInterval(checkInterval)
            if (isPreloaderBVisible) {
              if (process.env.NODE_ENV === 'development') {
                console.log('⏱️ [PERF] First load - Safety timer (2s)')
              }
              setContentOpacity(1)
              setPreloaderComplete(true)
              setTimeout(() => {
                hidePreloaderB()
              }, 200)
            }
          }, 2000)
          
          return () => {
            clearInterval(checkInterval)
            clearTimeout(safetyTimer)
          }
        }, 500) // Give content time to render and mount before checking readiness
        
        return () => {
          clearTimeout(initialDelay)
        }
      }, 2000) // Minimum 2 seconds display for first load
      
      return () => clearTimeout(minDisplayTimer)
    }
    
    // For language switches/navigation: when content should be shown
    // usePageTransition handles preloader hiding, so we just ensure content is visible
    if (!isFirstLoad && shouldShowContent && isPreloaderBVisible) {
      // Ensure content opacity is 1 - usePageTransition will handle hiding preloader
      setContentOpacity(1)
      setPreloaderComplete(true)
      // Don't hide preloader here - let usePageTransition handle it
    }
    
    // Safeguard: If preloader is not visible and we're not in first load or navigating,
    // ensure content is shown (fallback for edge cases)
    if (!isFirstLoad && !isNavigating && !isPreloaderBVisible && !shouldShowContent) {
      setShouldShowContent(true)
      setContentOpacity(1)
      setPreloaderComplete(true)
    }
    
    // Additional safeguard: If shouldShowContent is true but contentOpacity is still 0,
    // force it to 1 to ensure content is visible
    // OPTIMIZED: Set immediately, no delay
    if (shouldShowContent && contentOpacity === 0) {
      setContentOpacity(1)
    }
  }, [isPreloaderBVisible, shouldShowContent, isNavigating, isFirstLoad, hidePreloaderB, locale, componentsLoaded])
  
  // Force contentOpacity to 1 when shouldShowContent is true and preloader is gone
  // Also ensure isPreloaderComplete is set so Hero can show
  useEffect(() => {
    if (shouldShowContent && !isPreloaderBVisible && contentOpacity < 1) {
      setContentOpacity(1)
    }
    // If shouldShowContent is true, ensure preloader is marked complete so Hero can show
    // OPTIMIZED: Set immediately, no delay
    if (shouldShowContent) {
      setPreloaderComplete(true)
    }
  }, [shouldShowContent, isPreloaderBVisible, contentOpacity, setPreloaderComplete])
  
  // Force Stats component to remount on navigation to homepage or locale change
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    if (isHomePage) {
      // Increment key to force Stats remount, which resets scroll tracking
      // This triggers on both pathname and locale changes to ensure complete reset
      setStatsKey(prev => prev + 1)
    }
  }, [pathname, locale])

  // Safety: If preloader is stuck, show content after max time
  useEffect(() => {
    if (isPreloaderBVisible && !shouldShowContent) {
      const safetyTimer = setTimeout(() => {
        if (isPreloaderBVisible) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] Safety timer - Preloader stuck, forcing completion')
          }
          setShouldShowContent(true)
          setContentOpacity(1)
          setPreloaderComplete(true)
          hidePreloaderB()
        }
      }, 1500) // Reduced from 2000ms to 1500ms for faster recovery
      return () => clearTimeout(safetyTimer)
    }
  }, [isPreloaderBVisible, shouldShowContent, hidePreloaderB, setPreloaderComplete])

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

  // Keep console logs for debugging - don't suppress them
  // Removed console suppression to help debug preloader issues

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
      {(() => {
        // Show preloader if: explicitly visible OR content not ready
        // Don't keep preloader visible just because contentOpacity < 1 - that blocks content
        // CRITICAL: Keep preloader visible until content is actually visible (opacity >= 0.9)
        // This prevents white screen gap between preloader and content
        const contentIsReady = shouldShowContent && contentOpacity >= 0.9
        const shouldShowPreloader = isPreloaderBVisible || !shouldShowContent || !contentIsReady
        return shouldShowPreloader ? (
          <PreloaderB 
            key={isFirstLoad ? "preloader-first-load" : "preloader-content-loading"} // Key to ensure it remounts
            shouldAutoHide={false} // NEVER auto-hide - always wait for explicit hide when content is confirmed ready
            onComplete={() => {
              // onComplete is called by PreloaderB's safety timer (5s max)
              // But we don't use it to hide - we only hide when content is ready
              // Don't hide here - wait for content readiness check
            }}
            duration={isFirstLoad ? 2 : 0.5} // Duration only used for safety timer, not auto-hide
          />
        ) : null
      })()}

      {/* Shared Gradient Background - Spans Hero and AboutUs sections */}
      {/* Fixed position to stay in viewport, behind all content - OUTSIDE contentRef to avoid stacking issues */}
      {/* Using 'both' variant: top gradient for Hero section, bottom gradient for AboutUs section */}
      {shouldShowContent && (
        <GradientBlurBg 
          height="200vh"
          variant="both"
        />
      )}

      {/* Content - Show when ready, but keep preloader visible until content is confirmed rendered */}
      {/* Preloader will hide automatically when content is confirmed ready */}
      {/* Content is rendered and visible (opacity 1) - PreloaderB overlays it with z-index 99999 */}
      {/* When PreloaderB fades out, content is already there, preventing blank screen */}
      {shouldShowContent && (
        <>
          {/* Hero - Render after preloader */}
          {/* Crossfade: hero fades in as preloader fades out */}
          {/* Hero has its own animations, so we coordinate the fade-in with preloader fade-out */}
          {/* Main Content - Render after preloader, content loads progressively */}
          {/* Crossfade: content fades in as preloader fades out */}
          <div 
            ref={(el) => {
              if (contentRef) {
                (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el
              }
            }}
            className="min-h-screen bg-transparent text-foreground overflow-x-hidden max-w-full"
            style={{ 
              position: 'relative', 
              zIndex: 1, // Above gradient background (-1)
              opacity: contentOpacity, // Use contentOpacity state for smooth crossfade
              transition: 'opacity 0.6s ease-out' // Smooth fade-in transition
            }}
          >
        {/* Navigation - Render FIRST to ensure it's above Hero */}
        <NavbarComponent />
        
        {/* Hero - Render after Navbar to ensure proper stacking */}
        {/* Hero wrapper - no z-index, let Hero section control its own z-index */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <HeroComponent />
        </div>
      
        {/* Main Sections */}
        <main style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
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

