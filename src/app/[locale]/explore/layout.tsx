import type { Metadata } from 'next'
import Script from 'next/script'
// Cesium widget CSS — scoped to explore route, required for the viewer canvas to fill its container
import 'cesium/Build/Cesium/Widgets/widgets.css'

export const metadata: Metadata = {
  title: 'Explore Cabo Negro | 3D Interactive Map',
  description:
    'Explore Cabo Negro in an immersive 3D environment. Discover the Maritime Terminal, Logistic Park, Technology Park and the dramatic Patagonian coastline.',
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        Load the pre-built Cesium.js from our static directory.
        This replaces the 4 MB webpack chunk — the file is served at a
        stable path (/_next/static/cesium/Cesium.js) that never changes
        between deployments, so it can be cached indefinitely by the browser.
        strategy="beforeInteractive" ensures window.Cesium is defined before
        any client-side React effects run.
      */}
      <Script
        src="/_next/static/cesium/Cesium.js"
        strategy="beforeInteractive"
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </>
  )
}
