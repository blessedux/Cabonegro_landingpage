'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  hasSeenPreloader: boolean
  isPreloaderBVisible: boolean
  isPreloaderSimpleVisible: boolean
  isLanguageSwitch: boolean
  isNavigating: boolean
  isVideoReady: boolean
  navigationStartTime: number | null
  /** False until the first client useLayoutEffect runs (localStorage + first-visit preloader). */
  isBootLayoutDone: boolean
  /**
   * True for the last ~120ms before nav overlay hides: AmCharts + heavy topo work is stopped
   * so the fade-out can run without main-thread stalls.
   */
  preloaderDrainHeavy: boolean
  setPreloaderDrainHeavy: (drain: boolean) => void
  setPreloaderVisible: (visible: boolean) => void
  setPreloaderComplete: (complete: boolean) => void
  showPreloader: () => void
  hidePreloader: () => void
  completePreloader: () => void
  showPreloaderB: () => void
  hidePreloaderB: () => void
  showPreloaderSimple: () => void
  hidePreloaderSimple: () => void
  setLanguageSwitch: (isSwitch: boolean) => void
  setNavigating: (navigating: boolean) => void
  setVideoReady: (ready: boolean) => void
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  // Check if first visit on initial state
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(false)
  // Always initialize to false to prevent hydration mismatch
  // We'll set the correct value in useEffect after hydration
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false) // Start as false, will be set in useEffect
  const [hasSeenPreloader, setHasSeenPreloader] = useState(false)
  const [isPreloaderBVisible, setIsPreloaderBVisible] = useState(false)
  const [isPreloaderSimpleVisible, setIsPreloaderSimpleVisible] = useState(false)
  const [isLanguageSwitch, setIsLanguageSwitch] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null)
  const [isBootLayoutDone, setIsBootLayoutDone] = useState(false)
  const [preloaderDrainHeavy, setPreloaderDrainHeavy] = useState(false)

  const showPreloaderB = useCallback(() => {
    setPreloaderDrainHeavy(false)
    setIsPreloaderBVisible(true)
    setIsNavigating(true)
    setIsVideoReady(false)
    setNavigationStartTime(performance.now())

    if (process.env.NODE_ENV === 'development') {
      console.log('⏱️ [PERF] Navigation started', {
        timestamp: performance.now(),
      })
    }
  }, [])

  // First-visit preloader: run in useLayoutEffect so state updates before first paint (no empty flash)
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    if (!isLanguageSwitch) {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!hasVisited) {
        setHasSeenPreloader(false)
        setIsPreloaderComplete(false)
        showPreloaderB()
      } else {
        setHasSeenPreloader(true)
        setIsPreloaderComplete(false)
      }
    }

    setIsBootLayoutDone(true)
  }, [isLanguageSwitch, showPreloaderB])

  // Non-layout follow-up (logging only) — keep out of paint-critical path
  useEffect(() => {
    if (typeof window === 'undefined' || isLanguageSwitch) return
    if (process.env.NODE_ENV === 'development') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      console.log(hasVisited ? '🔄 PreloaderContext: return visit' : '🔄 PreloaderContext: first visit → PreloaderB on')
    }
  }, [isLanguageSwitch])

  const showPreloader = useCallback(() => {
    setIsPreloaderVisible(true)
    setIsPreloaderComplete(false)
    setIsLanguageSwitch(false)
  }, [])

  const hidePreloader = useCallback(() => {
    setIsPreloaderVisible(false)
  }, [])

  const completePreloader = useCallback(() => {
    setIsPreloaderComplete(true)
    setHasSeenPreloader(true)
    if (!isLanguageSwitch) {
      localStorage.setItem('cabonegro-preloader-seen', 'true')
      localStorage.setItem('cabonegro-assets-cached', 'true')
    }
    setTimeout(() => {
      setIsPreloaderVisible(false)
      setIsLanguageSwitch(false)
    }, 1000)
  }, [isLanguageSwitch])

  const hidePreloaderB = useCallback(() => {
    const navigationTime = navigationStartTime ? performance.now() - navigationStartTime : null
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 hidePreloaderB called', {
        wasVisible: isPreloaderBVisible,
        timestamp: Date.now(),
        navigationTime: navigationTime ? `${navigationTime.toFixed(2)}ms` : 'N/A',
        isLanguageSwitch
      })
    }
    setPreloaderDrainHeavy(false)
    setIsPreloaderBVisible(false)
    setIsNavigating(false)
    setNavigationStartTime(null)
    if (isLanguageSwitch) {
      setIsLanguageSwitch(false)
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 hidePreloaderB state updated', {
        isPreloaderBVisible: false,
        isNavigating: false,
        isLanguageSwitch: false
      })
    }
  }, [navigationStartTime, isPreloaderBVisible, isLanguageSwitch])

  const setVideoReady = useCallback((ready: boolean) => {
    setIsVideoReady(ready)
    if (ready && process.env.NODE_ENV === 'development') {
      const timeSinceNav = navigationStartTime ? performance.now() - navigationStartTime : null
      console.log('⏱️ [PERF] Video ready', {
        timeSinceNav: timeSinceNav ? `${timeSinceNav.toFixed(2)}ms` : 'N/A',
        timestamp: performance.now()
      })
    }
  }, [navigationStartTime])

  const showPreloaderSimple = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 showPreloaderSimple called')
    }
    setIsPreloaderSimpleVisible(true)
  }, [])

  const hidePreloaderSimple = useCallback(() => {
    setIsPreloaderSimpleVisible(false)
  }, [])

  const contextValue = useMemo(
    () => ({
      isPreloaderVisible,
      isPreloaderComplete,
      hasSeenPreloader,
      isPreloaderBVisible,
      isPreloaderSimpleVisible,
      isLanguageSwitch,
      isNavigating,
      isVideoReady,
      navigationStartTime,
      isBootLayoutDone,
      preloaderDrainHeavy,
      setPreloaderDrainHeavy,
      setPreloaderVisible: setIsPreloaderVisible,
      setPreloaderComplete: setIsPreloaderComplete,
      showPreloader,
      hidePreloader,
      completePreloader,
      showPreloaderB,
      hidePreloaderB,
      showPreloaderSimple,
      hidePreloaderSimple,
      setLanguageSwitch: setIsLanguageSwitch,
      setNavigating: setIsNavigating,
      setVideoReady,
    }),
    [
      isPreloaderVisible,
      isPreloaderComplete,
      hasSeenPreloader,
      isPreloaderBVisible,
      isPreloaderSimpleVisible,
      isLanguageSwitch,
      isNavigating,
      isVideoReady,
      navigationStartTime,
      isBootLayoutDone,
      preloaderDrainHeavy,
      setPreloaderDrainHeavy,
      showPreloader,
      hidePreloader,
      completePreloader,
      showPreloaderB,
      hidePreloaderB,
      showPreloaderSimple,
      hidePreloaderSimple,
      setVideoReady,
    ]
  )

  return (
    <PreloaderContext.Provider value={contextValue}>
      {children}
    </PreloaderContext.Provider>
  )
}

export function usePreloader() {
  const context = useContext(PreloaderContext)
  if (context === undefined) {
    throw new Error('usePreloader must be used within a PreloaderProvider')
  }
  return context
}
