'use client'

import { useEffect } from 'react'

/**
 * Explore route error boundary.
 *
 * Chunk-load errors ("Loading chunk N failed") mean the browser has a cached
 * HTML page that references JS chunks from an older deployment.  The only fix
 * is a hard reload so the browser fetches the latest HTML and the matching
 * chunk hashes.  We detect this case and reload automatically; all other
 * errors surface a manual refresh prompt.
 */
export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    /loading chunk/i.test(error?.message ?? '') ||
    /missing:/i.test(error?.message ?? '')

  useEffect(() => {
    if (isChunkError) {
      // New deployment — reload once to pick up the latest chunk hashes.
      // Guard with sessionStorage so we don't loop if the reload also fails.
      const key = 'explore-chunk-reload'
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.location.reload()
      }
    }
  }, [isChunkError])

  if (isChunkError) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          fontFamily: 'sans-serif',
          gap: 12,
        }}
      >
        <p style={{ color: '#555', fontSize: 14 }}>Updating to latest version…</p>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        fontFamily: 'sans-serif',
        gap: 16,
      }}
    >
      <p style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>
        Unable to load the 3D globe.
      </p>
      <p style={{ color: '#777', fontSize: 13 }}>
        Check your connection, then try again.
      </p>
      <button
        onClick={() => {
          sessionStorage.removeItem('explore-chunk-reload')
          reset()
        }}
        style={{
          marginTop: 8,
          padding: '8px 20px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  )
}
