'use client'

import { useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import PreloaderB from '@/components/ui/preloader-b'
import { usePageTransition } from '@/hooks/usePageTransition'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isPreloaderBVisible, hidePreloaderB } = usePreloader()
  usePageTransition() // This hook will trigger PreloaderB on route changes

  const handlePreloaderBComplete = () => {
    hidePreloaderB()
  }

  return (
    <>
      {isPreloaderBVisible && (
        <PreloaderB 
          onComplete={handlePreloaderBComplete}
          duration={1.2}
        />
      )}
      {children}
    </>
  )
}

