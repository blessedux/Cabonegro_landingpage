'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import PreloaderB from '@/components/ui/preloader-b'
import { usePageTransition } from '@/hooks/usePageTransition'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isPreloaderBVisible, hidePreloaderB } = usePreloader()
  usePageTransition() // This hook will trigger PreloaderB on route changes

  // Debug logging
  useEffect(() => {
    console.log('🟢 PageTransitionWrapper - isPreloaderBVisible:', isPreloaderBVisible, 'pathname:', pathname)
  }, [isPreloaderBVisible, pathname])

  const handlePreloaderBComplete = () => {
    console.log('🟣 PreloaderB complete - hiding')
    hidePreloaderB()
  }

  return (
    <>
      {isPreloaderBVisible && (
        <PreloaderB 
          key={`preloader-b-${pathname}`}
          onComplete={handlePreloaderBComplete}
          duration={0.8}
        />
      )}
      {children}
    </>
  )
}

