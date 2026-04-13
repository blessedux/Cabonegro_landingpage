import CesiumExplorerLoader from '@/components/cesium/CesiumExplorerLoader'

interface ExplorePageProps {
  params: Promise<{ locale: string }>
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <CesiumExplorerLoader locale={locale} />
    </div>
  )
}
