import { setRequestLocale } from 'next-intl/server'
import CesiumExplorerLoader from '@/components/cesium/CesiumExplorerLoader'

interface ExplorePageProps {
  params: Promise<{ locale: string }>
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
      }}
    >
      <CesiumExplorerLoader locale={locale} />
    </div>
  )
}
