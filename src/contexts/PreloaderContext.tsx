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
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('cabonegro-homepage-visited')
      if (!hasVisited) {
        // First visit - show preloader to cover content loading
        setHasSeenPreloader(false)
        setIsPreloaderComplete(false)
        setIsPreloaderBVisible(true) // Show preloader on first visit
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 PreloaderContext: First visit detected, showing preloader')
        }
      } else {
        // Not first visit - still show preloader briefly to cover content
        // This ensures smooth loading experience
        setHasSeenPreloader(true)
        setIsPreloaderComplete(false) // Keep as false until content loads
        setIsPreloaderBVisible(true) // Show preloader briefly even on return visits
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 PreloaderContext: Return visit, showing preloader to cover content')
        }
        // Hide after brief moment to allow content to load
        const timer = setTimeout(() => {
          setIsPreloaderBVisible(false)
          setIsPreloaderComplete(true)
        }, 500) // Brief preloader to cover initial content load
        return () => clearTimeout(timer)
      }
    }
  }, [])

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
    setIsPreloaderBVisible(true)
    setIsNavigating(true)
  }

  const hidePreloaderB = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 hidePreloaderB called')
    }
    setIsPreloaderBVisible(false)
    // Delay resetting navigation state to prevent white screen flash
    setTimeout(() => {
      setIsNavigating(false)
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
