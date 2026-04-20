'use client'

import dynamic from 'next/dynamic'
import ExploreLoadingSurface from '@/components/ui/ExploreLoadingSurface'

const CesiumExplorer = dynamic(
  () => import(/* webpackChunkName: "cesium-explorer" */ './CesiumExplorer'),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: 'absolute', inset: 0, background: '#ffffff' }}>
        <ExploreLoadingSurface suspended />
      </div>
    ),
  }
)

export default function CesiumExplorerLoader({ locale }: { locale: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100vh' }}>
      <CesiumExplorer locale={locale} />
    </div>
  )
}
