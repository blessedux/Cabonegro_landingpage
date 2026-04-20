'use client'

import { useRouter } from 'next/navigation'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import { ReactNode, MouseEvent } from 'react'

interface LinkWithPreloaderProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LinkWithPreloader({ href, children, className, onClick }: LinkWithPreloaderProps) {
  const router = useRouter()
  const { push } = useNavigateWithPreloader()

  const handlePrefetch = () => {
    router.prefetch(href)
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }

    push(href)
  }

  return (
    <a href={href} onClick={handleClick} onMouseEnter={handlePrefetch} className={className}>
      {children}
    </a>
  )
}

