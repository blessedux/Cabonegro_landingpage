'use client'

import { Button } from '@/components/ui/button'

interface CookieBannerProps {
  showCookieBanner: boolean
  setShowCookieBanner: (show: boolean) => void
}

export default function CookieBanner({ showCookieBanner, setShowCookieBanner }: CookieBannerProps) {
  if (!showCookieBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 p-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          We are using cookies to ensure you get the best experience on our website. Cookies keep our site secure and reliable. They let us personalize vinode.com to you and help us analyze how the site is used.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            className="uppercase border-white text-white hover:bg-white hover:text-black"
            onClick={() => setShowCookieBanner(false)}
          >
            Accept All
          </Button>
          <Button
            variant="ghost"
            className="uppercase text-white hover:text-gray-300"
            onClick={() => setShowCookieBanner(false)}
          >
            Reject Non-Essential
          </Button>
        </div>
      </div>
    </div>
  )
}