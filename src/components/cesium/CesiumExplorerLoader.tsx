'use client'

import dynamic from 'next/dynamic'
import ExploreLoadingSurface from '@/components/ui/ExploreLoadingSurface'

const CesiumExplorer = dynamic(() => import('./CesiumExplorer'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'absolute', inset: 0, background: '#ffffff' }}>
      <ExploreLoadingSurface />
    </div>
  ),
})

export default function CesiumExplorerLoader({ locale }: { locale: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CesiumExplorer locale={locale} />
    </div>
  )
}
