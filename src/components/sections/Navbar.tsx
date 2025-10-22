'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('EN')

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'PT', name: 'Português' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="container mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-2xl font-bold tracking-tight">Cabo Negro</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#Explore" className="text-sm hover:text-gray-300 transition-colors uppercase">Explore Terrain</a>
              <a href="#Deck" className="text-sm hover:text-gray-300 transition-colors uppercase">View Deck</a>
              <a href="#Partners" className="text-sm hover:text-gray-300 transition-colors uppercase">Partners</a>
              <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">FAQ</a>
              
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedLanguage === lang.code
                        ? 'text-white bg-white/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>

              <a href="/contact">
                <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
                  Contact Us
                </Button>
              </a>
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
                <a 
                  href="#Explore" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Terrain
                </a>
                <a 
                  href="#Deck" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Deck
                </a>
                <a 
                  href="#Partners" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Partners
                </a>
                <a 
                  href="#FAQ" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                
                {/* Mobile Language Toggle */}
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm text-gray-400 uppercase">Language:</span>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        selectedLanguage === lang.code
                          ? 'text-white bg-white/20'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang.code}
                    </button>
                  ))}
                </div>

                <a href="/contact" className="w-full mt-2">
                  <Button
                    variant="outline"
                    className="uppercase border-white text-white hover:bg-white hover:text-black w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}