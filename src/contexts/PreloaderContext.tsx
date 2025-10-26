'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  isPreloaderComplete: boolean
  showPreloader: () => void
  hidePreloader: () => void
  completePreloader: () => void
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)

  const showPreloader = () => {
    setIsPreloaderVisible(true)
    setIsPreloaderComplete(false)
  }

  const hidePreloader = () => {
    setIsPreloaderVisible(false)
  }

  const completePreloader = () => {
    setIsPreloaderComplete(true)
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
