'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'
import PreloaderB from '@/components/ui/preloader-b'
import { GradientBlurBg } from '@/components/ui/gradient-blur-bg'
import ErrorBoundary from '@/components/scenes/ErrorBoundary'

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
// Enable SSR for footer - it's lightweight and should render immediately
const Footer = dynamic(() => import('@/components/sections/Footer'), { 
  ssr: true
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
  const { isPreloaderBVisible, hidePreloaderB, hasSeenPreloader, isNavigating, setPreloaderComplete, isVideoReady, navigationStartTime, isLanguageSwitch } = usePreloader()
  const pathname = usePathname()
  // Always initialize to false to prevent hydration mismatch
  // We'll set the correct value in useEffect after hydration
  const [shouldShowContent, setShouldShowContent] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(false) // Track if this is the first load (not navigation)
  const [statsKey, setStatsKey] = useState(0) // Key to force Stats remount on navigation
  const [contentOpacity, setContentOpacity] = useState(0) // Control content fade-in for crossfade - start at 0, set to 1 before preloader fades
  const [componentsLoaded, setComponentsLoaded] = useState(false) // Track if all components are loaded
  // Track which locales have their components loaded for smart preloading
  const loadedLocalesRef = useRef<Set<string>>(new Set([locale]))
  // Track previous locale to detect language changes
  const prevLocaleRef = useRef(locale)
  
  // OPTIMIZED: Smart preloading - track loaded locales and preload current + adjacent locales
  useEffect(() => {
    // For language switches, mark current locale as loaded immediately
    if (isLanguageSwitch) {
      loadedLocalesRef.current.add(locale)
      setComponentsLoaded(true)
      return
    }
    
    // Check if current locale is already loaded
    const isCurrentLocaleLoaded = loadedLocalesRef.current.has(locale)
    
    if (!isCurrentLocaleLoaded && !componentsLoaded) {
      // Preload current locale's components
      const preloadPromises = [
        import('@/components/sections/AboutUs'),
        import('@/components/sections/Stats'),
        import('@/components/sections/Press'),
        import('@/components/sections/Footer'),
        // Preload current locale's components
        locale === 'es' ? import('@/components/sections/Partners-es') : import('@/components/sections/Partners'),
        locale === 'es' ? import('@/components/sections/Hero-es') : 
        locale === 'zh' ? import('@/components/sections/Hero-zh') :
        locale === 'fr' ? import('@/components/sections/Hero-fr') : import('@/components/sections/Hero'),
        locale === 'es' ? import('@/components/sections/Navbar-es') :
        locale === 'zh' ? import('@/components/sections/Navbar-zh') : import('@/components/sections/Navbar'),
        locale === 'es' ? import('@/components/sections/FAQ-es') :
        locale === 'zh' ? import('@/components/sections/FAQ-zh') : import('@/components/sections/FAQ'),
        // World maps load on-demand - don't preload
      ]
      
      // Mark as loaded immediately (components load on-demand)
      setComponentsLoaded(true)
      loadedLocalesRef.current.add(locale)
      
      // Preload in background (non-blocking)
      Promise.all(preloadPromises)
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] Components preloaded for locale:', locale)
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('⏱️ [PERF] Component preload error', error)
          }
        })
    } else if (isCurrentLocaleLoaded) {
      // Locale already loaded, just mark as ready
      setComponentsLoaded(true)
    }
    
    // OPTIMIZED: Preload adjacent locales in background for faster switching
    // Preload next/previous locales (e.g., if on 'en', preload 'es' and 'fr')
    const adjacentLocales: string[] = []
    if (locale === 'en') {
      adjacentLocales.push('es', 'fr')
    } else if (locale === 'es') {
      adjacentLocales.push('en', 'zh')
    } else if (locale === 'zh') {
      adjacentLocales.push('es', 'fr')
    } else if (locale === 'fr') {
      adjacentLocales.push('en', 'zh')
    }
    
    // Preload adjacent locales in background (non-blocking)
    adjacentLocales.forEach((adjLocale) => {
      if (!loadedLocalesRef.current.has(adjLocale)) {
        // Preload adjacent locale's components in background
        const adjPreloadPromises = [
          adjLocale === 'es' ? import('@/components/sections/Partners-es') : 
          adjLocale === 'zh' ? import('@/components/sections/Partners') : 
          adjLocale === 'fr' ? import('@/components/sections/Partners') : 
          import('@/components/sections/Partners'),
          adjLocale === 'es' ? import('@/components/sections/Hero-es') : 
          adjLocale === 'zh' ? import('@/components/sections/Hero-zh') :
          adjLocale === 'fr' ? import('@/components/sections/Hero-fr') : 
          import('@/components/sections/Hero'),
          adjLocale === 'es' ? import('@/components/sections/Navbar-es') :
          adjLocale === 'zh' ? import('@/components/sections/Navbar-zh') : 
          import('@/components/sections/Navbar'),
          adjLocale === 'es' ? import('@/components/sections/FAQ-es') :
          adjLocale === 'zh' ? import('@/components/sections/FAQ-zh') : 
          import('@/components/sections/FAQ'),
        ]
        
        Promise.all(adjPreloadPromises)
          .then(() => {
            loadedLocalesRef.current.add(adjLocale)
            if (process.env.NODE_ENV === 'development') {
              console.log('⏱️ [PERF] Adjacent locale preloaded:', adjLocale)
            }
          })
          .catch(() => {
            // Silently fail - components will load on-demand
          })
      }
    })
  }, [locale, componentsLoaded, isLanguageSwitch])
  
  // Initialize content visibility after hydration and reset on locale change
  useEffect(() => {
    // Reset content visibility on locale change to ensure preloader shows
    if (prevLocaleRef.current !== locale) {
      // CRITICAL FIX: For language switches, KEEP content visible
      // Don't hide content - just update it with new language
      // This prevents flash of missing content during language switch
      if (!isLanguageSwitch) {
        // Only hide content for non-language-switch navigations
        setShouldShowContent(false)
        setContentOpacity(0) // Reset opacity for new transition
      } else {
        // For language switches, keep content visible and just update locale
        // Content will smoothly transition to new language without disappearing
        setShouldShowContent(true)
        setContentOpacity(1) // Keep content visible
      }
      
      // CRITICAL FIX: Don't reset componentsLoaded on locale change
      // Components are already loaded in memory - resetting causes re-preloading
      // Only reset if it's actually the first mount
      if (!componentsLoaded) {
        setComponentsLoaded(false)
      }
      prevLocaleRef.current = locale
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ [PERF] Locale changed', { from: prevLocaleRef.current, to: locale, isLanguageSwitch })
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
      
      // CRITICAL FIX: Language switches are NEVER first loads
      // This prevents the 2-second minimum display timer from triggering
      if (isLanguageSwitch) {
        setIsFirstLoad(false)
        // For language switches, show content immediately when preloader hides
        if (!isPreloaderBVisible) {
          setShouldShowContent(true)
          setContentOpacity(1)
        }
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
  }, [locale, isPreloaderBVisible, isNavigating, isLanguageSwitch]) // Only depend on locale and preloader state, not shouldShowContent/contentOpacity to avoid loops

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
      // CRITICAL FIX: For language switches, skip ALL readiness checks
      // Content is already rendered, just show it immediately
      // Note: Language switch handling is done in other effects, so we can skip this effect
      if (isLanguageSwitch) {
        return // Early return - skip readiness checks for language switches
      }
      
      // Check if content is actually rendered and ready AND VISIBLE
      const checkContentReady = () => {
      // OPTIMIZED: For navigation (not first load), skip strict opacity checks
      // Content will be visible immediately, no need to wait for opacity transitions
      if (isFirstLoad && contentRef.current) {
        const computedStyle = window.getComputedStyle(contentRef.current)
        const isContentVisible = parseFloat(computedStyle.opacity) > 0.5
        if (!isContentVisible) {
          return false
        }
      }
      
      // OPTIMIZED: Skip video checks entirely for navigation (not first load)
      // Video can load in background - don't block navigation
      // Only check video on first load for smooth playback
      const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr' || pathname === '/'
      if (isHomePage && isFirstLoad && !isVideoReady) {
        // Only check video on first load
        const videoElement = document.querySelector('video') as HTMLVideoElement
        if (videoElement) {
          // For first load, require readyState >= 3 (HAVE_FUTURE_DATA) for smoother playback
          if (videoElement.readyState < 3) {
            return false
          }
        } else {
          // Video element doesn't exist yet - wait only on first load
          return false
        }
      }
      // For navigation or non-home pages, skip video check entirely
      
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
      
      // OPTIMIZED: For navigation, skip strict opacity check - content is shown immediately
      // Only check opacity on first load
      const contentIsVisible = isFirstLoad ? contentOpacity >= 0.9 : true
      
      // Comprehensive check: All major components must be rendered
      const allSectionsRendered = navbarRendered && mainRendered
      const heroRendered = document.querySelector('section[class*="fixed"]') !== null ||
                           document.querySelector('section') !== null ||
                           document.querySelector('main') !== null
      
      // OPTIMIZED: Video readiness only required on home page AND first load
      // For navigation, skip video check entirely
      const videoReady = (isHomePage && isFirstLoad) ? isVideoReady : true
      
      // Simplified check for navigation: just verify content exists
      // For first load, do comprehensive check
      const isReady = isFirstLoad
        ? (heroRendered || hasChildren) && 
          allSectionsRendered && 
          hasContent &&
          contentIsVisible &&
          videoReady
        : (heroRendered || hasChildren) && allSectionsRendered && hasContent // Simplified for navigation
      
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
    
    // CRITICAL FIX: For language switches, show content IMMEDIATELY
    // Component keys ensure React properly remounts components with new locale
    // Content should stay visible and update smoothly
    if (isLanguageSwitch && isPreloaderBVisible && !shouldShowContent) {
      // Ensure content is visible immediately - components will remount with keys
      setShouldShowContent(true)
      setContentOpacity(1)
      setPreloaderComplete(true)
      setIsFirstLoad(false) // Ensure it's not treated as first load
      return // Skip all other checks
    }
    
    // OPTIMIZED: For navigation (not first load), show content faster
    // When navigating to home, show content immediately when preloader is visible
    if (!isFirstLoad && !isLanguageSwitch && isNavigating && isPreloaderBVisible && !shouldShowContent) {
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
        
        // OPTIMIZED: Start checking immediately - no artificial delay
        // Use requestAnimationFrame for immediate check on next frame
        requestAnimationFrame(() => {
          let checkCount = 0
          // OPTIMIZED: Poll for content readiness - check every 50ms (faster than 100ms)
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
              // OPTIMIZED: Hide immediately when content is ready - no artificial delay
              requestAnimationFrame(() => {
                hidePreloaderB()
                setPreloaderComplete(true)
              })
            }
          }, 50) // Check every 50ms (faster than 100ms)
          
          // Safety: Force hide after 1.5 seconds if content check fails (reduced from 2s)
          const safetyTimer = setTimeout(() => {
            clearInterval(checkInterval)
            if (isPreloaderBVisible) {
              if (process.env.NODE_ENV === 'development') {
                console.log('⏱️ [PERF] First load - Safety timer (1.5s)')
              }
              setContentOpacity(1)
              setPreloaderComplete(true)
              // OPTIMIZED: Hide immediately - no artificial delay
              requestAnimationFrame(() => {
                hidePreloaderB()
              })
            }
          }, 1500) // 1.5 seconds max (reduced from 2s)
          
          return () => {
            clearInterval(checkInterval)
            clearTimeout(safetyTimer)
          }
        })
      }, 2000) // Minimum 2 seconds display for first load
      
      return () => clearTimeout(minDisplayTimer)
    }
    
    // CRITICAL FIX: For language switches, ensure content stays visible
    // Component keys ensure React properly remounts components with new locale
    // Content visibility should be maintained throughout the switch
    if (isLanguageSwitch) {
      // Ensure content is visible and at full opacity
      // Component keys will force proper remounting, so content updates smoothly
      setShouldShowContent(true)
      setContentOpacity(1) // Keep at full opacity - no fade needed
      setPreloaderComplete(true)
      setIsFirstLoad(false) // Ensure it's not treated as first load
      
      // With locale-based keys, React will:
      // 1. Unmount old locale's components
      // 2. Mount new locale's components
      // 3. Content stays visible throughout (opacity stays at 1)
      // This creates smooth language switch without content disappearing
    }
    
    // For regular navigation: when content should be shown
    // usePageTransition handles preloader hiding, so we just ensure content is visible
    if (!isFirstLoad && !isLanguageSwitch && shouldShowContent && isPreloaderBVisible) {
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
  }, [isPreloaderBVisible, shouldShowContent, isNavigating, isFirstLoad, hidePreloaderB, locale, componentsLoaded, isLanguageSwitch])
  
  // CRITICAL: Set content opacity to 1 BEFORE preloader starts fading
  // This ensures content is visible when preloader fades out, preventing white gaps
  // Content should be fully visible (opacity 1) while preloader is still fading
  useEffect(() => {
    if (shouldShowContent && contentOpacity < 1) {
      // Set opacity to 1 immediately when content should be shown
      // Don't wait for preloader to hide - this creates the crossfade effect
      setContentOpacity(1)
      setPreloaderComplete(true)
    }
  }, [shouldShowContent, contentOpacity, setPreloaderComplete])
  
  // Force Stats component to remount on navigation to homepage or locale change
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    if (isHomePage) {
      // Increment key to force Stats remount, which resets scroll tracking
      // This triggers on both pathname and locale changes to ensure complete reset
      setStatsKey(prev => prev + 1)
    }
  }, [pathname, locale])

  // CRITICAL FIX: Aggressive safety timer for language switches
  // If preloader is stuck, show content after max time
  useEffect(() => {
    if (isPreloaderBVisible && !shouldShowContent) {
      // CRITICAL: Language switches get very short timeout (200ms) to prevent getting stuck
      // First load gets 3.5 seconds, regular navigation gets 800ms (reduced from 1500ms)
      const timeoutDuration = isLanguageSwitch ? 200 : (isFirstLoad ? 3500 : 800)
      
      const safetyTimer = setTimeout(() => {
        if (isPreloaderBVisible && !shouldShowContent) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] Safety timer - Preloader stuck, forcing completion', {
              isFirstLoad,
              timeoutDuration,
              isPreloaderBVisible,
              shouldShowContent
            })
          }
          // Force show content and hide preloader
          setShouldShowContent(true)
          setContentOpacity(1)
          setPreloaderComplete(true)
          hidePreloaderB()
          
          // If still stuck after timeout, mark first load as complete to prevent loops
          if (isFirstLoad) {
            setIsFirstLoad(false)
          }
        }
      }, timeoutDuration)
      
      return () => clearTimeout(safetyTimer)
    }
  }, [isPreloaderBVisible, shouldShowContent, hidePreloaderB, setPreloaderComplete, isFirstLoad, isLanguageSwitch])

  // Additional first-load fallback: Force show content after 3.5 seconds regardless of readiness
  // This ensures users never get stuck on preloader on first visit
  useEffect(() => {
    if (isFirstLoad && isPreloaderBVisible) {
      const firstLoadFallbackTimer = setTimeout(() => {
        if (isPreloaderBVisible) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] First load fallback - Forcing content display after 3.5s')
          }
          // Force show content regardless of readiness checks
          setShouldShowContent(true)
          setContentOpacity(1)
          setPreloaderComplete(true)
          setIsFirstLoad(false)
          hidePreloaderB()
        }
      }, 3500) // 3.5 seconds - user requested 3-4 seconds
      
      return () => clearTimeout(firstLoadFallbackTimer)
    }
  }, [isFirstLoad, isPreloaderBVisible, hidePreloaderB, setPreloaderComplete])

  // Get locale-specific components - MEMOIZED to prevent unnecessary re-renders
  // Only recalculates when locale changes
  const localeComponents = useMemo(() => {
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
  }, [locale])

  const { Hero: HeroComponent, Navbar: NavbarComponent, Partners: PartnersComponent, FAQ: FAQComponent, WorldMap: WorldMapComponent } = localeComponents

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
        if (process.env.NODE_ENV === 'development') {
          console.warn('Asset preloading failed:', error)
        }
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
        // CRITICAL: Show preloader if explicitly visible
        // Content opacity is set to 1 BEFORE preloader fades, creating smooth crossfade
        // Preloader will fade out while content is already visible (opacity 1)
        // This prevents white gaps between preloader and content
        const shouldShowPreloader = isPreloaderBVisible
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
              // CRITICAL: For language switches, disable transition to prevent flicker
              // Content should stay visible instantly, no fade
              transition: isLanguageSwitch ? 'none' : 'opacity 0.6s ease-out'
            }}
          >
        {/* Navigation - Render FIRST to ensure it's above Hero */}
        {/* CRITICAL: Add locale-based key to force proper remounting on locale change */}
        <ErrorBoundary fallback={<div className="p-4 text-center text-red-500">Navigation error. Please refresh the page.</div>}>
          <NavbarComponent key={`navbar-${locale}`} />
        </ErrorBoundary>
        
        {/* Hero - Render after Navbar to ensure proper stacking */}
        {/* Hero wrapper - no z-index, let Hero section control its own z-index */}
        {/* CRITICAL: Add locale-based key to force proper remounting on locale change */}
        <ErrorBoundary fallback={<div className="p-8 text-center text-white bg-black/80">Hero section error. Please refresh the page.</div>}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <HeroComponent key={`hero-${locale}`} />
          </div>
        </ErrorBoundary>
      
        {/* Main Sections */}
        <main style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">About section error. Please refresh the page.</div>}>
            <AboutUs />
          </ErrorBoundary>
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">Stats section error. Please refresh the page.</div>}>
            <Stats key={`stats-${locale}-${statsKey}`} />
          </ErrorBoundary>
          {/* CRITICAL: Add locale-based key to force proper remounting on locale change */}
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">Partners section error. Please refresh the page.</div>}>
            <PartnersComponent key={`partners-${locale}`} />
          </ErrorBoundary>
          {/* CRITICAL: Add locale-based key to force proper remounting on locale change */}
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">World map error. Please refresh the page.</div>}>
            <WorldMapComponent key={`worldmap-${locale}`} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">Press section error. Please refresh the page.</div>}>
            <Press />
          </ErrorBoundary>
          {/* CRITICAL: Add locale-based key to force proper remounting on locale change */}
          <ErrorBoundary fallback={<div className="p-8 text-center text-gray-700">FAQ section error. Please refresh the page.</div>}>
            <FAQComponent key={`faq-${locale}`} />
          </ErrorBoundary>
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

