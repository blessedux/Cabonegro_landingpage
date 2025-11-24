'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  hasSeenPreloader: boolean
  isPreloaderBVisible: boolean
  setPreloaderVisible: (visible: boolean) => void
  setPreloaderComplete: (complete: boolean) => void
  showPreloader: () => void
  hidePreloader: () => void
  completePreloader: () => void
  showPreloaderB: () => void
  hidePreloaderB: () => void
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(false)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)
  const [hasSeenPreloader, setHasSeenPreloader] = useState(false)
  const [isPreloaderBVisible, setIsPreloaderBVisible] = useState(false)

  // Check if user has seen preloader before and if assets are cached
  useEffect(() => {
    const hasSeenBefore = localStorage.getItem('cabonegro-preloader-seen')
    const assetsCached = localStorage.getItem('cabonegro-assets-cached')
    
    // Check if critical assets are likely cached by checking if fonts are loaded
    const checkAssetsCached = () => {
      if (typeof window !== 'undefined' && document.fonts && document.fonts.ready) {
        return document.fonts.check('1em Inter') || assetsCached === 'true'
      }
      return assetsCached === 'true'
    }

    if (hasSeenBefore === 'true' && checkAssetsCached()) {
      // User has seen preloader and assets are cached - skip preloader
      setHasSeenPreloader(true)
      setIsPreloaderVisible(false)
      setIsPreloaderComplete(true)
    } else if (!hasSeenBefore) {
      // First visit - show preloader to load assets
      setIsPreloaderVisible(true)
    } else {
      // Has seen before but assets might not be cached - show briefly or skip
      setHasSeenPreloader(true)
      setIsPreloaderVisible(false)
      setIsPreloaderComplete(true)
    }
  }, [])

  const showPreloader = () => {
    setIsPreloaderVisible(true)
    setIsPreloaderComplete(false)
  }

  const hidePreloader = () => {
    setIsPreloaderVisible(false)
  }

  const completePreloader = () => {
    setIsPreloaderComplete(true)
    setHasSeenPreloader(true)
    // Store in localStorage that user has seen preloader and assets are cached
    localStorage.setItem('cabonegro-preloader-seen', 'true')
    localStorage.setItem('cabonegro-assets-cached', 'true')
    // Auto-hide after completion
    setTimeout(() => {
      setIsPreloaderVisible(false)
    }, 1000)
  }

  const showPreloaderB = () => {
    console.log('🔵 showPreloaderB called - setting isPreloaderBVisible to true')
    setIsPreloaderBVisible(true)
  }

  const hidePreloaderB = () => {
    setIsPreloaderBVisible(false)
  }

  return (
    <PreloaderContext.Provider
      value={{
        isPreloaderVisible,
        isPreloaderComplete,
        hasSeenPreloader,
        isPreloaderBVisible,
        setPreloaderVisible: setIsPreloaderVisible,
        setPreloaderComplete: setIsPreloaderComplete,
        showPreloader,
        hidePreloader,
        completePreloader,
        showPreloaderB,
        hidePreloaderB,
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
