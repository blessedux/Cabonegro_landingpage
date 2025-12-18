'use client'

import { useEffect, useState } from 'react'

/**
 * Simple test component to verify heightmap is accessible
 */
export default function HeightmapTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png'
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[HeightmapTest] Testing heightmap accessibility:', testUrl)
    }

    const img = new Image()
    img.onload = () => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[HeightmapTest] ✓ Heightmap accessible:', {
          url: testUrl,
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        })
      }
      setStatus('success')
    }
    img.onerror = (e) => {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[HeightmapTest] ✗ Heightmap not accessible:', testUrl, e)
      }
      setError(`Failed to load ${testUrl}`)
      setStatus('error')
    }
    img.src = testUrl
  }, [])

  if (status === 'loading') {
    return <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', zIndex: 9999 }}>Testing heightmap...</div>
  }

  if (status === 'error') {
    return (
      <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(255,0,0,0.9)', color: 'white', padding: '10px', zIndex: 9999 }}>
        <strong>Heightmap Error:</strong> {error}
        <br />
        <small>Check console for details</small>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,255,0,0.8)', color: 'black', padding: '10px', zIndex: 9999 }}>
      ✓ Heightmap accessible
    </div>
  )
}
