'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  hasSeenPreloader: boolean
  setPreloaderVisible: (visible: boolean) => void
  setPreloaderComplete: (complete: boolean) => void
  showPreloader: () => void
  hidePreloader: () => void
  completePreloader: () => void
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(false)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)
  const [hasSeenPreloader, setHasSeenPreloader] = useState(false)

  // Check if user has seen preloader before on mount
  useEffect(() => {
    const hasSeenBefore = localStorage.getItem('cabonegro-preloader-seen')
    if (hasSeenBefore === 'true') {
      setHasSeenPreloader(true)
      setIsPreloaderVisible(false)
      setIsPreloaderComplete(true)
    } else {
      setIsPreloaderVisible(true)
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
    // Store in localStorage that user has seen preloader
    localStorage.setItem('cabonegro-preloader-seen', 'true')
    // Auto-hide after completion
    setTimeout(() => {
      setIsPreloaderVisible(false)
    }, 1000)
  }

  return (
    <PreloaderContext.Provider
      value={{
        isPreloaderVisible,
        isPreloaderComplete,
        hasSeenPreloader,
        setPreloaderVisible: setIsPreloaderVisible,
        setPreloaderComplete: setIsPreloaderComplete,
        showPreloader,
        hidePreloader,
        completePreloader,
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
