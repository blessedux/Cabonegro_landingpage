'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">Cabo Negro</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#About" className="text-sm hover:text-gray-300 transition-colors uppercase">About</a>
            <a href="#Projects" className="text-sm hover:text-gray-300 transition-colors uppercase">Projects</a>
            <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">FAQ</a>
            <a href="#Blog" className="text-sm hover:text-gray-300 transition-colors uppercase">Blog</a>
            <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a href="#About" className="text-sm hover:text-gray-300 transition-colors uppercase">About</a>
              <a href="#Projects" className="text-sm hover:text-gray-300 transition-colors uppercase">Projects</a>
              <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">FAQ</a>
              <a href="#Blog" className="text-sm hover:text-gray-300 transition-colors uppercase">Blog</a>
              <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black w-full">
                Contact Us
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}