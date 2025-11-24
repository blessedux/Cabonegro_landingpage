'use client'

import { Button } from '@/components/ui/button'
import { useCookieBanner } from '@/contexts/CookieBannerContext'

export default function CookieBanner() {
  const { showCookieBanner, acceptCookies, rejectCookies } = useCookieBanner()

  if (!showCookieBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-sm border-t border-white/10 p-4 md:p-6 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
        <p className="text-sm md:text-base text-gray-300 leading-relaxed">
          We use cookies to ensure you get the best experience on our website. Cookies keep our site secure and reliable, and help us analyze how the site is used.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="uppercase border-white text-white hover:bg-white hover:text-black transition-colors"
            onClick={acceptCookies}
          >
            Accept All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="uppercase text-white hover:text-gray-300 transition-colors"
            onClick={rejectCookies}
          >
            Reject Non-Essential
          </Button>
        </div>
      </div>
    </div>
  )
}