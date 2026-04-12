import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MobileLanguageSelector from './MobileLanguageSelector'
import type { Locale } from '@/constants/navbarTexts'

interface MobileMenuProps {
  isOpen: boolean
  isOverWhiteBackground: boolean
  currentLocale: Locale
  localizedText: {
    maritimeTerminal: string
    technologyPark: string
    logisticsPark: string
    faq: string
    contactUs: string
    language: string
  }
  onClose: () => void
  onProjectNavigation: (route: string) => void
  onFAQClick: (e: React.MouseEvent) => void
  onContactClick: () => void
  onLanguageChange: (locale: string) => void
}

function MobileMenu({
  isOpen,
  isOverWhiteBackground,
  currentLocale,
  localizedText,
  onClose,
  onProjectNavigation,
  onFAQClick,
  onContactClick,
  onLanguageChange,
}: MobileMenuProps) {
  const router = useRouter()

  const textColor = isOverWhiteBackground ? 'text-black' : 'text-white'
  const hoverColor = isOverWhiteBackground
    ? 'hover:text-gray-700'
    : 'hover:text-gray-300'

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div
        className="px-6 pb-6 border-t"
        style={{
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          backgroundColor: isOverWhiteBackground
            ? 'rgba(255, 255, 255, 0.75)'
            : 'rgba(0, 0, 0, 0.65)',
          borderColor: isOverWhiteBackground
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.3)',
          isolation: 'isolate',
        }}
      >
        <div className="flex flex-col gap-4 pt-4">
          <MobileLanguageSelector
            currentLocale={currentLocale}
            isOverWhiteBackground={isOverWhiteBackground}
            onLanguageChange={(locale) => {
              onLanguageChange(locale)
              onClose()
            }}
            languageText={localizedText.language}
          />
          <button
            onClick={() => {
              onClose()
              onProjectNavigation('/terminal-maritimo')
            }}
            onMouseEnter={() =>
              router.prefetch(`/${currentLocale}/terminal-maritimo`)
            }
            className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
          >
            {localizedText.maritimeTerminal}
          </button>
          <button
            onClick={() => {
              onClose()
              onProjectNavigation('/parque-tecnologico')
            }}
            onMouseEnter={() =>
              router.prefetch(`/${currentLocale}/parque-tecnologico`)
            }
            className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
          >
            {localizedText.technologyPark}
          </button>
          <button
            onClick={() => {
              onClose()
              onProjectNavigation('/parque-logistico')
            }}
            onMouseEnter={() =>
              router.prefetch(`/${currentLocale}/parque-logistico`)
            }
            className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
          >
            {localizedText.logisticsPark}
          </button>
          <button
            onClick={onFAQClick}
            className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
          >
            {localizedText.faq}
          </button>

          <Button
            onClick={() => {
              onClose()
              onContactClick()
            }}
            variant="outline"
            className={`uppercase transition-all duration-300 w-full mt-2 ${
              isOverWhiteBackground
                ? 'border-black text-black bg-transparent hover:bg-black hover:text-white'
                : 'border-white text-white bg-transparent hover:bg-white hover:text-black'
            }`}
          >
            {localizedText.contactUs}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(MobileMenu)
