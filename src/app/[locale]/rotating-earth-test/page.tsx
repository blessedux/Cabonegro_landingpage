'use client'

import dynamic from 'next/dynamic'

// Code-split RotatingEarth component (includes D3.js ~200KB) - only load when needed
const RotatingEarth = dynamic(() => import('@/components/ui/rotating-earth'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-black">Loading globe...</div>
    </div>
  )
})

export default function RotatingEarthTestPage() {
  return (
    <div 
      className="w-screen h-screen flex items-center justify-center bg-white"
      style={{ 
        minHeight: '100vh',
        padding: '2rem'
      }}
    >
      <div className="w-full max-w-6xl h-full flex items-center justify-center">
        <RotatingEarth 
          width={1200} 
          height={800} 
          vectorColor="#000000"
          backgroundColor="#ffffff"
          showInfoPanel={false}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
