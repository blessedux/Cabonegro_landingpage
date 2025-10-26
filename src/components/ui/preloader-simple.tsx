'use client'

import { useEffect, useRef } from 'react'

interface PreloaderProps {
  onComplete?: () => void
  duration?: number
}

export default function Preloader({ onComplete, duration = 6 }: PreloaderProps) {
  const preloaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate preloader animation
    const timer = setTimeout(() => {
      onComplete?.()
    }, duration * 1000)

    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div 
      ref={preloaderRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Cabo Negro</h1>
        <p className="text-gray-300">Loading...</p>
      </div>
    </div>
  )
}
