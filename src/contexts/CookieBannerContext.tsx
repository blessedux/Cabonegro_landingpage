'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface CookieBannerContextType {
  showCookieBanner: boolean
  setShowCookieBanner: (show: boolean) => void
  acceptCookies: () => void
  rejectCookies: () => void
}

const CookieBannerContext = createContext<CookieBannerContextType | undefined>(undefined)

export function CookieBannerProvider({ children }: { children: ReactNode }) {
  const [showCookieBanner, setShowCookieBanner] = useState(false)

  // Check if user has already made a cookie choice on mount
  useEffect(() => {
    const cookieChoice = localStorage.getItem('cabonegro-cookie-choice')
    if (!cookieChoice) {
      setShowCookieBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cabonegro-cookie-choice', 'accepted')
    setShowCookieBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('cabonegro-cookie-choice', 'rejected')
    setShowCookieBanner(false)
  }

  return (
    <CookieBannerContext.Provider
      value={{
        showCookieBanner,
        setShowCookieBanner,
        acceptCookies,
        rejectCookies,
      }}
    >
      {children}
    </CookieBannerContext.Provider>
  )
}

export function useCookieBanner() {
  const context = useContext(CookieBannerContext)
  if (context === undefined) {
    throw new Error('useCookieBanner must be used within a CookieBannerProvider')
  }
  return context
}
