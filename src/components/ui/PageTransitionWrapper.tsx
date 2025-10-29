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

  const handlePreloaderBComplete = () => {
    hidePreloaderB()
  }

  return (
    <>
      {isPreloaderBVisible && (
        <PreloaderB 
          key={`preloader-b-${pathname}`}
          onComplete={handlePreloaderBComplete}
          duration={2.0}
        />
      )}
      {children}
    </>
  )
}

