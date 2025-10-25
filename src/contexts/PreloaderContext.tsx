'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PreloaderContextType {
  isPreloaderVisible: boolean
  setPreloaderVisible: (visible: boolean) => void
  isPreloaderComplete: boolean
  setPreloaderComplete: (complete: boolean) => void
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined)

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)

  const setPreloaderVisible = (visible: boolean) => {
    setIsPreloaderVisible(visible)
  }

  const setPreloaderComplete = (complete: boolean) => {
    setIsPreloaderComplete(complete)
  }

  return (
    <PreloaderContext.Provider
      value={{
        isPreloaderVisible,
        setPreloaderVisible,
        isPreloaderComplete,
        setPreloaderComplete,
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
