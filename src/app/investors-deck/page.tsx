import { Suspense } from 'react'
import InvestorsDeckRedirectClient from './InvestorsDeckRedirectClient'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preparing Download...</h1>
          <p className="text-gray-400 mb-8">Please wait while we prepare your investor deck download.</p>
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/BNWCRANE_preloaderB.png" 
                alt="Cabo Negro Industrial Infrastructure" 
                className="max-h-[200px] w-auto object-contain animate-pulse opacity-80 hover:opacity-100 transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src="/logos/cabonegro_logo.png" 
              alt="Cabo Negro Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    }>
      <InvestorsDeckRedirectClient />
    </Suspense>
  )
}
