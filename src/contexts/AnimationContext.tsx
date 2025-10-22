'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AnimationContextType {
  isFadingOut: boolean
  setIsFadingOut: (value: boolean) => void
  startFadeOut: () => void
  isNavbarHidden: boolean
  setIsNavbarHidden: (value: boolean) => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isNavbarHidden, setIsNavbarHidden] = useState(false)

  const startFadeOut = () => {
    setIsFadingOut(true)
    setIsNavbarHidden(true)
  }

  return (
    <AnimationContext.Provider value={{ isFadingOut, setIsFadingOut, startFadeOut, isNavbarHidden, setIsNavbarHidden }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}
