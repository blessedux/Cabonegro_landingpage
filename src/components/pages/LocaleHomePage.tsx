'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'
import { GradientBlurBg } from '@/components/ui/gradient-blur-bg'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { getPathnameBeforeLastCommit } from '@/lib/client-pathname-sync'

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

// Code-split Hero — reserve viewport height while chunk loads (avoids About jumping above the fold)
const heroLoading = () => <div className="min-h-[90vh] w-full shrink-0" aria-hidden />
const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false, loading: heroLoading })
const HeroEs = dynamic(() => import('@/components/sections/Hero-es'), { ssr: false, loading: heroLoading })
const HeroZh = dynamic(() => import('@/components/sections/Hero-zh'), { ssr: false, loading: heroLoading })
const HeroFr = dynamic(() => import('@/components/sections/Hero-fr'), { ssr: false, loading: heroLoading })

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

/** Persist only after first-load preloader completes — early writes break DeferredHomeWhileOverlay (home unmounts mid-boot). */
function markHomepageFirstVisitPersisted() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('cabonegro-homepage-visited', 'true')
  } catch {
    /* quota / private mode */
  }
}

function isLocaleHomePath(path: string, loc: string): boolean {
  const p = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path
  return p === `/${loc}`
}

export default function LocaleHomePage({ locale }: LocaleHomePageProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { isFadingOut } = useAnimation()
  const {
    isPreloaderBVisible,
    hidePreloaderB,
    hasSeenPreloader,
    isNavigating,
    setPreloaderComplete,
    navigationStartTime,
    isLanguageSwitch,
  } = usePreloader()
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
  const firstLoadHidePollStarted = useRef(false)

  /**
   * Before first paint: show the page shell under the route overlay so there is never a white
   * gap after the preloader (return visits + first visit). Syncs isFirstLoad with localStorage.
   */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const visited = localStorage.getItem('cabonegro-homepage-visited')
    setShouldShowContent(true)
    setContentOpacity(1)
    setIsFirstLoad(!visited)
  }, [pathname, locale])

  const checkContentReady = useCallback(() => {
    if (isFirstLoad && contentRef.current) {
      const computedStyle = window.getComputedStyle(contentRef.current)
      const isContentVisible = parseFloat(computedStyle.opacity) > 0.5
      if (!isContentVisible) {
        return false
      }
    }

    if (!contentRef.current) {
      return false
    }

    const hasChildren = contentRef.current.children.length > 0

    const navbarRendered =
      contentRef.current.querySelector('nav') !== null || contentRef.current.children.length > 0

    const mainRendered = contentRef.current.querySelector('main') !== null

    const hasContent = contentRef.current.innerHTML.trim().length > 1000

    const contentIsVisible = isFirstLoad ? contentOpacity >= 0.9 : true

    const allSectionsRendered = navbarRendered && mainRendered
    const heroRendered =
      document.querySelector('section[class*="fixed"]') !== null ||
      document.querySelector('section') !== null ||
      document.querySelector('main') !== null

    const isReady = isFirstLoad
      ? (heroRendered || hasChildren) && allSectionsRendered && hasContent && contentIsVisible
      : (heroRendered || hasChildren) && allSectionsRendered && hasContent

    if (process.env.NODE_ENV === 'development' && !isReady) {
      const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
      console.log('⏱️ [PERF] Content not ready', {
        hasContent,
        contentVisible: contentIsVisible,
        timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A'
      })
    }

    return isReady
  }, [isFirstLoad, contentOpacity, navigationStartTime])

  /**
   * SPA navigations remount this page with fresh state. The shell commits pathname
   * first; `getPathnameBeforeLastCommit()` is the in-app route we left (e.g. `/en/contact`).
   */
  useLayoutEffect(() => {
    if (!isLocaleHomePath(pathname, locale) || isLanguageSwitch) return
    // Only during an active in-app navigation — avoids re-applying when `pathnameBeforeLastCommit`
    // is still stale from an older transition after `isNavigating` is already false.
    if (!isNavigating) return
    const prev = getPathnameBeforeLastCommit()
    if (!prev || prev === pathname) return

    setShouldShowContent(true)
    setContentOpacity(1)
    setIsFirstLoad(false)
    setPreloaderComplete(true)
    // Hiding stays in usePageTransition (MIN_NAV_PRELOADER_MS) — do not hide here.
  }, [pathname, locale, isLanguageSwitch, isNavigating, setPreloaderComplete])
  
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

      // Defer chunk preloads so route transition + preloader animations stay on the main thread first
      const runPreload = () => {
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
      }
      if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => runPreload(), { timeout: 2500 })
      } else {
        setTimeout(runPreload, 400)
      }
    } else if (isCurrentLocaleLoaded) {
      // Locale already loaded, just mark as ready
      setComponentsLoaded(true)
    }
    
    // Keep locale preloading scoped to the current locale only.
    // Prefetching adjacent locales caused large background downloads.
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
    
    // If preloader is hidden but content isn't shown yet, recover — only for return visitors.
    // On first visit (no localStorage flag yet), never force content here or we skip the first-load preloader.
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!isPreloaderBVisible && !shouldShowContent && hasVisited) {
        setShouldShowContent(true)
        setContentOpacity(1)
        setPreloaderComplete(true)
      }
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

  // Handle preloader completion - show content and hide preloader only when content is ready
  // ALWAYS verify content is ready before hiding PreloaderB to prevent blank screens
  useEffect(() => {
      // CRITICAL FIX: For language switches, skip ALL readiness checks
      // Content is already rendered, just show it immediately
      // Note: Language switch handling is done in other effects, so we can skip this effect
      if (isLanguageSwitch) {
        return // Early return - skip readiness checks for language switches
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

  // First load only: poll until sections hydrate, then hide boot PreloaderB (useLayoutEffect already showed the shell)
  useEffect(() => {
    if (isLanguageSwitch) return
    if (!isFirstLoad || !isPreloaderBVisible || firstLoadHidePollStarted.current) return

    firstLoadHidePollStarted.current = true
    setPreloaderComplete(true)

    let checkInterval: ReturnType<typeof setInterval> | null = null
    let safetyTimer: ReturnType<typeof setTimeout> | null = null
    const rafId = requestAnimationFrame(() => {
      let checkCount = 0
      checkInterval = setInterval(() => {
        checkCount++
        const isReady = checkContentReady()

        if (process.env.NODE_ENV === 'development' && checkCount % 5 === 0) {
          const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
          console.log(`⏱️ [PERF] First load check #${checkCount}`, {
            ready: isReady,
            timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A',
          })
        }

        if (isReady && checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
          setIsFirstLoad(false)
          setContentOpacity(1)
          if (process.env.NODE_ENV === 'development') {
            const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
            console.log('⏱️ [PERF] First load - Content ready', {
              timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A',
            })
          }
          requestAnimationFrame(() => {
            markHomepageFirstVisitPersisted()
            hidePreloaderB()
            setPreloaderComplete(true)
          })
        }
      }, 50)

      safetyTimer = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
        if (isPreloaderBVisible) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] First load - Safety timer (1.5s)')
          }
          setContentOpacity(1)
          setPreloaderComplete(true)
          setIsFirstLoad(false)
          requestAnimationFrame(() => {
            markHomepageFirstVisitPersisted()
            hidePreloaderB()
          })
        }
      }, 1500)
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (checkInterval) clearInterval(checkInterval)
      if (safetyTimer) clearTimeout(safetyTimer)
    }
  }, [
    isFirstLoad,
    isPreloaderBVisible,
    isLanguageSwitch,
    checkContentReady,
    hidePreloaderB,
    setPreloaderComplete,
    navigationStartTime,
  ])

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
          if (isFirstLoad) {
            markHomepageFirstVisitPersisted()
          }
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
          markHomepageFirstVisitPersisted()
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
      {/* PreloaderB is rendered once in PageTransitionWrapper (above page tree) so topographic + globe stay visible on all navigations */}

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
            className="min-h-screen bg-transparent text-foreground max-w-full"
            style={{ 
              position: 'relative', 
              zIndex: 1, // Above gradient background (-1)
              opacity: contentOpacity, // Use contentOpacity state for smooth crossfade
              // CRITICAL: For language switches, disable transition to prevent flicker
              // Content should stay visible instantly, no fade
              transition: isLanguageSwitch ? 'none' : 'opacity 0.6s ease-out'
            }}
          >
        {/* overflow-x-hidden only on hero + main: it breaks position:sticky on descendants (footer) */}
        <div className="overflow-x-hidden">
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
        </div>

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

