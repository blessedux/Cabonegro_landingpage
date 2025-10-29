import Link from 'next/link'

export default function PartnersPageEn() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                Trusted Partners
              </h2>
            </div>
            
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white">
                Strategic Alliances
              </h1>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-400 text-lg">
                Working with industry leaders to build Chile's premier industrial and maritime hub
              </p>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-white/10 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Coming Soon
              </h3>
              <p className="text-gray-400 mb-6">
                We're working on a complete partners page. In the meantime, you can see our partners on the main page.
              </p>
              <Link 
                href="/en"
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}