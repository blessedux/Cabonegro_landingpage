'use client'

import { useEffect } from 'react'

export default function FontLoader() {
  useEffect(() => {
    // Load fonts asynchronously to avoid blocking render
    const loadFont = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.media = 'print'
      link.onload = () => {
        link.media = 'all'
      }
      document.head.appendChild(link)
    }

    // Load fonts asynchronously
    loadFont('https://fonts.cdnfonts.com/css/thegoodmonolith')
    loadFont('https://fonts.cdnfonts.com/css/pp-neue-montreal')
    loadFont('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap')
  }, [])

  return null
}
