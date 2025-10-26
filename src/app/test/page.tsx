'use client'

import { useState } from 'react'
import Preloader from '@/components/ui/preloader-simple'

export default function TestPage() {
  const [showPreloader, setShowPreloader] = useState(true)

  const handlePreloaderComplete = () => {
    setShowPreloader(false)
  }

  return (
    <>
      {/* Preloader - Always shows first */}
      {showPreloader && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          duration={6}
        />
      )}

      {/* Main Content - Only shows after preloader completes */}
      <div className={`min-h-screen bg-black text-white transition-opacity duration-1000 ${showPreloader ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-4xl font-bold">Test Page - Preloader Working!</h1>
        </div>
      </div>
    </>
  )
}
