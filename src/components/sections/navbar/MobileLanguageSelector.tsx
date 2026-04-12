import { memo } from 'react'
import type { Locale } from '@/constants/navbarTexts'
import { LANGUAGES } from '@/constants/navbarTexts'

interface MobileLanguageSelectorProps {
  currentLocale: Locale
  isOverWhiteBackground: boolean
  onLanguageChange: (locale: string) => void
  languageText: string
}

function MobileLanguageSelector({
  currentLocale,
  isOverWhiteBackground,
  onLanguageChange,
  languageText,
}: MobileLanguageSelectorProps) {
  return (
    <div className="md:hidden mb-2">
      <div
        className="text-xs uppercase mb-2 opacity-70"
        style={{ color: isOverWhiteBackground ? '#000' : '#fff' }}
      >
        {languageText}
      </div>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              currentLocale === lang.code
                ? isOverWhiteBackground
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
                : isOverWhiteBackground
                  ? 'bg-gray-100 text-black hover:bg-gray-200'
                  : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(MobileLanguageSelector)
