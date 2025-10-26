'use client'

import { useEffect, useRef } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const { completePreloader } = usePreloader()
  const preloaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate preloader animation
    const timer = setTimeout(() => {
      completePreloader()
      onComplete?.()
    }, 3000) // 3 second preloader

    return () => clearTimeout(timer)
  }, [completePreloader, onComplete])

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="text-center">
        <div className="text-6xl font-bold text-white mb-8">
          CABO NEGRO
        </div>
        <div className="text-xl text-gray-300 mb-8">
          Industrial Development
        </div>
        <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse" />
        </div>
        <div className="text-sm text-gray-400 mt-4">
          Loading...
        </div>
      </div>
    </div>
  )
}
