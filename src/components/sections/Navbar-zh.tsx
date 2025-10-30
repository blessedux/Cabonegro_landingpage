'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function NavbarZh() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { startFadeOut, isNavbarHidden, setIsNavbarHidden } = useAnimation()
  const { isPreloaderVisible, isPreloaderComplete, showPreloaderB, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  // Determine current language from pathname
  const currentLocale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/en') ? 'en' : 'zh'

  // Dropdown animation only after preloader completes
  useEffect(() => {
    // Check if we're on the deck or explore route - show navbar immediately and reset hidden state
    if (pathname.includes('/deck') || pathname.includes('/explore')) {
      // Reset navbar hidden state when navigating to explore/deck pages
      setIsNavbarHidden(false)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100) // Quick delay for deck/explore routes
      return () => clearTimeout(timer)
    }
    
    // Normal preloader logic for other routes
    if (isPreloaderComplete && !isPreloaderVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500) // Delay for smooth entrance after preloader

      return () => clearTimeout(timer)
    }
  }, [isPreloaderComplete, isPreloaderVisible, pathname, setIsNavbarHidden])

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    // Check if we're on a special page (explore, deck, contact)
    const isOnSpecialPage = pathname.includes('/explore') || 
                           pathname.includes('/deck') || 
                           pathname.includes('/contact')
    
    // Check if we're on homepage (or root)
    const isOnHomePage = pathname === '/en' || pathname === '/' || pathname === '/es' || pathname === '/zh'
    
    // If switching language on special page, show PreloaderB
    if (isOnSpecialPage) {
      showPreloaderB()
    }
    
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    if (pathname.startsWith('/es')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/es'
    } else if (pathname.startsWith('/zh')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/zh'
    } else if (pathname.startsWith('/en')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/en'
    }
    
    // Ensure path starts with '/'
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Navigate to the new locale with the same path
    // English routes use /en prefix, Spanish routes use /es prefix, Chinese routes use /zh prefix
    let delay = isOnSpecialPage ? 100 : 0
    
    // If switching language on homepage, show main preloader and delay navigation slightly
    if (isOnHomePage && !isOnSpecialPage) {
      setPreloaderVisible(true)
      setPreloaderComplete(false)
      delay = 50 // Small delay to ensure preloader state is set before navigation
    }
    
    setTimeout(() => {
      if (newLocale === 'en') {
        const targetPath = '/en' + pathWithoutLocale
        router.push(targetPath)
      } else if (newLocale === 'es') {
        const targetPath = '/es' + pathWithoutLocale
        router.push(targetPath)
      } else if (newLocale === 'zh') {
        const targetPath = '/zh' + pathWithoutLocale
        router.push(targetPath)
      }
    }, delay)
  }

  // Handle Explore Terrain click
  const handleExploreTerrain = () => {
    startFadeOut()
    showPreloaderB()
    
    // Navigate to explore route - let usePageTransition handle PreloaderB on route change
    // Small delay to ensure PreloaderB state is set before navigation
    setTimeout(() => {
      router.push('/zh/explore')
    }, 100)
  }

  // Handle Home navigation (logo click)
  const handleHomeClick = (e: React.MouseEvent) => {
    // If on explore page, show PreloaderB before navigating home
    if (pathname.includes('/explore')) {
      e.preventDefault()
      showPreloaderB()
      setTimeout(() => {
        router.push('/zh')
      }, 100)
    }
  }

  // Handle FAQ click
  const handleFAQClick = (e: React.MouseEvent) => {
    const isOnSpecialPage = pathname.includes('/explore') || 
                           pathname.includes('/deck') || 
                           pathname.includes('/contact')
    
    // If on homepage, just scroll to FAQ
    if (!isOnSpecialPage && (pathname === '/zh' || pathname === '/')) {
      e.preventDefault()
      const faqElement = document.getElementById('FAQ')
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setMobileMenuOpen(false)
      return
    }
    
    // If on special page, navigate to homepage with FAQ hash
    e.preventDefault()
    showPreloaderB()
    setMobileMenuOpen(false)
    
    setTimeout(() => {
      router.push('/zh#FAQ')
    }, 100)
  }

  return (
    <header className={`fixed left-0 right-0 z-50 p-4 transition-all duration-500 ease-out ${
      isNavbarHidden ? '-translate-y-full opacity-0' : 'top-0 translate-y-0 opacity-100'
    }`}>
      <nav className="container mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link 
                href="/zh" 
                className="cursor-pointer"
                onClick={handleHomeClick}
              >
                <img 
                  src="/cabonegro_logo.png" 
                  alt="Cabo Negro" 
                  className="h-11 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={handleExploreTerrain}
                className="text-sm hover:text-gray-300 transition-colors uppercase"
              >
                探索地形
              </button>
              <Link href="/zh/deck" className="text-sm hover:text-gray-300 transition-colors uppercase">查看甲板</Link>
              <button 
                onClick={handleFAQClick}
                className="text-sm hover:text-gray-300 transition-colors uppercase"
              >
                常见问题
              </button>
              
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLanguageChange(lang.code)
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      currentLocale === lang.code
                        ? 'text-white bg-white/20 border border-white/30'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link href="/zh/contact">
                <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
                  联系我们
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation with Animation */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleExploreTerrain()
                  }}
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2 text-left"
                >
                  探索地形
                </button>
                <Link 
                  href="/zh/deck" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  查看甲板
                </Link>
                <button 
                  onClick={handleFAQClick}
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2 text-left"
                >
                  常见问题
                </button>
                
                {/* Mobile Language Toggle */}
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm text-gray-400 uppercase">语言:</span>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={(e) => {
                        e.preventDefault()
                        handleLanguageChange(lang.code)
                      }}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        currentLocale === lang.code
                          ? 'text-white bg-white/20 border border-white/30'
                          : 'text-white hover:text-gray-300'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>

                <Link href="/zh/contact" className="w-full mt-2">
                  <Button
                    variant="outline"
                    className="uppercase border-white text-white hover:bg-white hover:text-black w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    联系我们
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
