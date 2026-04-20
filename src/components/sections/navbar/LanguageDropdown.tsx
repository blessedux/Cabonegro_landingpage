import { memo, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Locale } from '@/constants/navbarTexts'
import { LANGUAGES } from '@/constants/navbarTexts'

interface LanguageDropdownProps {
  currentLocale: Locale
  currentLanguage: { code: string; name: string; flag: string }
  isOverWhiteBackground: boolean
  isOpen: boolean
  onToggle: () => void
  onLanguageChange: (locale: string) => void
  onPrefetch: (locale: string) => void
}

function LanguageDropdown({
  currentLocale,
  currentLanguage,
  isOverWhiteBackground,
  isOpen,
  onToggle,
  onLanguageChange,
  onPrefetch,
}: LanguageDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 text-xs px-3 py-2 rounded transition-colors ${
          isOverWhiteBackground
            ? 'text-black bg-white/80 border border-black/20 hover:bg-white'
            : 'text-white bg-white/5 border border-white/20 hover:bg-white/10'
        }`}
      >
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 min-w-[120px] rounded-lg shadow-lg z-50 border"
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
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onMouseEnter={() => onPrefetch(lang.code)}
              onClick={() => {
                // OPTIMIZED: Close dropdown immediately for instant UI feedback
                onToggle()
                // Then trigger language change (non-blocking)
                onLanguageChange(lang.code)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                currentLocale === lang.code
                  ? isOverWhiteBackground
                    ? 'bg-accent text-black'
                    : 'bg-accent text-white'
                  : isOverWhiteBackground
                    ? 'text-black hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
              } ${lang.code === LANGUAGES[0]?.code ? 'rounded-t-lg' : ''} ${
                lang.code === LANGUAGES[LANGUAGES.length - 1]?.code
                  ? 'rounded-b-lg'
                  : ''
              }`}
            >
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(LanguageDropdown)
