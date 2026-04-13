'use client'

import { useState, useRef, memo, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useNavbarBackgroundDetection } from '@/hooks/useNavbarBackgroundDetection'
import { useNavbarVisibility } from '@/hooks/useNavbarVisibility'
import { useNavbarLocalization } from '@/hooks/useNavbarLocalization'
import { useNavbarNavigation } from '@/hooks/useNavbarNavigation'
import NavbarLogo from './navbar/NavbarLogo'
import LanguageDropdown from './navbar/LanguageDropdown'
import MobileMenu from './navbar/MobileMenu'
import NavbarContainer from './navbar/NavbarContainer'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const navbarRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Custom hooks
  const isOverWhiteBackground = useNavbarBackgroundDetection(
    navbarRef,
    pathname
  )
  const { isVisible, isNavbarHidden, isPreloaderVisible } =
    useNavbarVisibility()
  const { currentLocale, currentLanguage, localizedText } =
    useNavbarLocalization()
  const {
    handleProjectNavigation,
    handleHomeClick,
    handleFAQClick,
    handleLanguageChange,
    handleContactClick,
    prefetchLanguageRoute,
    getHomePath,
  } = useNavbarNavigation(currentLocale)

  // Memoize style classes
  const textColor = useMemo(
    () => (isOverWhiteBackground ? 'text-black' : 'text-white'),
    [isOverWhiteBackground]
  )
  const hoverColor = useMemo(
    () =>
      isOverWhiteBackground ? 'hover:text-gray-700' : 'hover:text-gray-300',
    [isOverWhiteBackground]
  )

  // Memoize header className
  const headerClassName = useMemo(() => {
    const isSpecialPage =
      pathname.includes('/deck') ||
      pathname.includes('/explore') ||
      pathname.includes('/terminal-maritimo')

    if (isSpecialPage) {
      return isNavbarHidden
        ? '-translate-y-full opacity-0'
        : 'translate-y-0 opacity-100'
    }

    if (isNavbarHidden || isPreloaderVisible) {
      return '-translate-y-full opacity-0'
    }

    return isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
  }, [pathname, isNavbarHidden, isPreloaderVisible, isVisible])

  // Memoize header style
  const headerStyle = useMemo(
    () => ({
      pointerEvents: (isNavbarHidden || isPreloaderVisible || !isVisible
        ? 'none'
        : 'auto') as React.CSSProperties['pointerEvents'],
      zIndex: 100000,
      position: 'fixed' as const,
      isolation: 'isolate' as const,
      willChange: 'transform, opacity' as const,
    }),
    [isNavbarHidden, isPreloaderVisible, isVisible]
  )

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header
      ref={navbarRef}
      className={`fixed left-0 right-0 top-0 z-[100000] p-4 transition-all duration-500 ease-out ${headerClassName}`}
      style={headerStyle}
    >
      <nav className="container mx-auto">
        <NavbarContainer
          isOverWhiteBackground={isOverWhiteBackground}
          mobileMenuRef={mobileMenuRef}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <NavbarLogo
              currentLocale={currentLocale}
              isOverWhiteBackground={isOverWhiteBackground}
              onHomeClick={handleHomeClick}
              onPrefetch={() => {
                // Prefetch is handled by router in the component
              }}
            />

            {/* Right side: Language Dropdown + Hamburger Button */}
            <div className="flex items-center gap-3">
              <LanguageDropdown
                currentLocale={currentLocale}
                currentLanguage={currentLanguage}
                isOverWhiteBackground={isOverWhiteBackground}
                isOpen={languageDropdownOpen}
                onToggle={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                onLanguageChange={handleLanguageChange}
                onPrefetch={prefetchLanguageRoute}
              />

              {/* Menu Button - Desktop and Mobile */}
              <button
                className={`p-2 rounded-lg transition-colors ${textColor} ${
                  isOverWhiteBackground
                    ? 'hover:bg-black/10'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          <MobileMenu
            isOpen={mobileMenuOpen}
            isOverWhiteBackground={isOverWhiteBackground}
            currentLocale={currentLocale}
            localizedText={localizedText}
            onClose={() => setMobileMenuOpen(false)}
            onProjectNavigation={handleProjectNavigation}
            onFAQClick={handleFAQClick}
            onContactClick={handleContactClick}
            onLanguageChange={handleLanguageChange}
          />
        </NavbarContainer>
      </nav>
    </header>
  )
}

// Properly memoize Navbar - only re-render when pathname changes
// Since Navbar uses hooks internally, we can't prevent all re-renders,
// but we can prevent parent-triggered re-renders
export default memo(Navbar)
