'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import LoadingScreen from '@/components/scenes/LoadingScreen'
import ErrorBoundary from '@/components/scenes/ErrorBoundary'

const Experience3D = dynamic(() => import('@/components/scenes/Experience3D'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function MapPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Experience3D />
      </Suspense>
      </ErrorBoundary>
    </div>
  )
}
