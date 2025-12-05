'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  hasSeenPreloader: boolean
  isPreloaderBVisible: boolean
  isPreloaderSimpleVisible: boolean
  isLanguageSwitch: boolean
  isNavigating: boolean
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

  // Initialize preloader state on mount (after hydration)
  // Only set initial state - let LocaleHomePage control PreloaderB visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Skip preloader initialization if this is a language switch
      // Language switches use showPreloaderB() directly
      if (isLanguageSwitch) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 PreloaderContext: Language switch detected, skipping initialization')
        }
        return
      }

      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!hasVisited) {
        // First visit - show PreloaderB (LocaleHomePage will handle visibility and auto-hide)
        setHasSeenPreloader(false)
        setIsPreloaderComplete(false)
        setIsPreloaderBVisible(true) // Show PreloaderB on first visit
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 PreloaderContext: First visit detected, showing PreloaderB (LocaleHomePage will control)')
        }
      } else {
        // Return visit - let LocaleHomePage decide when to show PreloaderB
        // Don't auto-show or auto-hide - let component control it
        setHasSeenPreloader(true)
        setIsPreloaderComplete(false)
        // Don't set isPreloaderBVisible here - let LocaleHomePage control it
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 PreloaderContext: Return visit, LocaleHomePage will control PreloaderB visibility')
        }
      }
    }
  }, [isLanguageSwitch])

  const showPreloader = () => {
    setIsPreloaderVisible(true)
    setIsPreloaderComplete(false)
    // Reset language switch flag when showing preloader normally
    setIsLanguageSwitch(false)
  }

  const hidePreloader = () => {
    setIsPreloaderVisible(false)
  }

  const completePreloader = () => {
    setIsPreloaderComplete(true)
    setHasSeenPreloader(true)
    // Store in localStorage that user has seen preloader and assets are cached
    // Only store on first load, not on language switches
    if (!isLanguageSwitch) {
      localStorage.setItem('cabonegro-preloader-seen', 'true')
      localStorage.setItem('cabonegro-assets-cached', 'true')
    }
    // Auto-hide after completion
    setTimeout(() => {
      setIsPreloaderVisible(false)
      // Reset language switch flag after preloader completes
      setIsLanguageSwitch(false)
    }, 1000)
  }

  const showPreloaderB = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 PreloaderContext: showPreloaderB called', {
        wasVisible: isPreloaderBVisible,
        wasNavigating: isNavigating
      })
    }
    setIsPreloaderBVisible(true)
    setIsNavigating(true)
  }

  const hidePreloaderB = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 PreloaderContext: hidePreloaderB called', {
        wasVisible: isPreloaderBVisible,
        wasNavigating: isNavigating
      })
    }
    setIsPreloaderBVisible(false)
    // Delay resetting navigation state to prevent white screen flash
    setTimeout(() => {
      setIsNavigating(false)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ PreloaderContext: Navigation state reset')
      }
    }, 100)
  }

  const showPreloaderSimple = () => {
    console.log('🟢 showPreloaderSimple called - setting isPreloaderSimpleVisible to true')
    setIsPreloaderSimpleVisible(true)
  }

  const hidePreloaderSimple = () => {
    setIsPreloaderSimpleVisible(false)
  }

  return (
    <PreloaderContext.Provider
      value={{
        isPreloaderVisible,
        isPreloaderComplete,
        hasSeenPreloader,
        isPreloaderBVisible,
        isPreloaderSimpleVisible,
        isLanguageSwitch,
        isNavigating,
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
      }}
    >
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
