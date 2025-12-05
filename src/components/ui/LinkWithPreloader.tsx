'use client'

import { useRouter } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { ReactNode, MouseEvent } from 'react'

interface LinkWithPreloaderProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LinkWithPreloader({ href, children, className, onClick }: LinkWithPreloaderProps) {
  const router = useRouter()
  const { showPreloaderB } = usePreloader()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }

    // Show preloader immediately
    showPreloaderB()
    
    // Navigate immediately - no startTransition to avoid delays
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

