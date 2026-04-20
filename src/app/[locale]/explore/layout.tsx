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
        Ensure Cesium can resolve Workers/Assets/Widgets deterministically in production.
        This must run before Cesium.js executes.
      */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: "window.CESIUM_BASE_URL='/_next/static/cesium/';",
        }}
      />
      {/*
        Load the pre-built Cesium.js from our static directory.
        NOTE: strategy="beforeInteractive" only works in the root layout;
        in a route layout Next.js ignores it. We use "afterInteractive" here
        and poll for window.Cesium in useCesiumViewerRuntime before proceeding.
      */}
      <Script
        id="cesium-js"
        src="/_next/static/cesium/Cesium.js"
        strategy="afterInteractive"
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
