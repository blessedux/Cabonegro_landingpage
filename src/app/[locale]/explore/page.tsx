'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function ExplorePage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string || 'en'

  // Get localized text based on locale
  const getLocalizedText = () => {
    const texts: Record<string, { back: string; underConstruction: string }> = {
      en: { back: 'Back', underConstruction: 'Under Construction' },
      es: { back: 'Volver', underConstruction: 'En Construcción' },
      zh: { back: '返回', underConstruction: '建设中' },
      fr: { back: 'Retour', underConstruction: 'En Construction' }
    }
    return texts[locale] || texts.en
  }

  const localizedText = getLocalizedText()
  const homePath = locale === 'en' ? '/en' : `/${locale}`

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      {/* Back Button - Top Left */}
      <button
        onClick={() => router.push(homePath)}
        className="absolute top-6 left-6 flex items-center gap-2 text-black hover:text-gray-700 transition-colors z-10"
        aria-label={localizedText.back}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">{localizedText.back}</span>
      </button>

      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Cabo Negro Icon */}
        <div className="relative">
          <Image
            src="/BNWCRANE_preloaderB.png"
            alt="Cabo Negro"
            width={300}
            height={300}
            className="w-auto h-auto max-w-[300px] max-h-[300px] object-contain"
            priority
          />
        </div>

        {/* Under Construction Text */}
        <h2 className="text-2xl md:text-3xl font-semibold text-black">
          {localizedText.underConstruction}
        </h2>
      </div>
    </div>
  )
}
