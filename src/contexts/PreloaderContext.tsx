'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  hasSeenPreloader: boolean
  isPreloaderBVisible: boolean
  isPreloaderSimpleVisible: boolean
  isLanguageSwitch: boolean
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
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  // Always skip preloader - render content immediately
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(false)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(true)
  const [hasSeenPreloader, setHasSeenPreloader] = useState(true)
  const [isPreloaderBVisible, setIsPreloaderBVisible] = useState(false)
  const [isPreloaderSimpleVisible, setIsPreloaderSimpleVisible] = useState(false)
  const [isLanguageSwitch, setIsLanguageSwitch] = useState(false)

  // Preloader is disabled - content loads immediately
  useEffect(() => {
    // Mark as seen and complete immediately
    setHasSeenPreloader(true)
    setIsPreloaderVisible(false)
    setIsPreloaderComplete(true)
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
    console.log('🔵 showPreloaderB called - setting isPreloaderBVisible to true')
    setIsPreloaderBVisible(true)
  }

  const hidePreloaderB = () => {
    setIsPreloaderBVisible(false)
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
