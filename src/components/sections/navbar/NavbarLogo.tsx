import { memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/constants/navbarTexts'

interface NavbarLogoProps {
  currentLocale: Locale
  isOverWhiteBackground: boolean
  onHomeClick: (e: React.MouseEvent) => void
  onPrefetch: (path: string) => void
}

function NavbarLogo({
  currentLocale,
  isOverWhiteBackground,
  onHomeClick,
  onPrefetch,
}: NavbarLogoProps) {
  const router = useRouter()

  const getHomePath = () => {
    switch (currentLocale) {
      case 'es':
        return '/es'
      case 'zh':
        return '/zh'
      case 'fr':
        return '/fr'
      default:
        return '/en'
    }
  }

  const homePath = getHomePath()

  const handleMouseEnter = () => {
    router.prefetch(homePath)
    onPrefetch(homePath)
  }

  return (
    <div className="flex items-center flex-shrink-0">
      <Link
        href={homePath}
        className="cursor-pointer flex-shrink-0"
        onClick={onHomeClick}
        onMouseEnter={handleMouseEnter}
      >
        <img
          src="/logos/CaboNegro_logo_white.png"
          alt="Cabo Negro"
          className="h-[62.4px] w-auto object-contain flex-shrink-0 hover:opacity-80 transition-all duration-300"
          style={{
            filter: isOverWhiteBackground ? 'brightness(0)' : 'brightness(1)',
            transition: 'filter 0.3s ease-in-out',
          }}
        />
      </Link>
    </div>
  )
}

export default memo(NavbarLogo)
