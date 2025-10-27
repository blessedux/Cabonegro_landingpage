export default function PartnersPageEs() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                Socios de Confianza
              </h2>
            </div>
            
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white">
                Alianzas Estratégicas
              </h1>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-400 text-lg">
                Trabajando con líderes de la industria para construir el principal centro industrial y marítimo de Chile
              </p>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-white/10 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Próximamente
              </h3>
              <p className="text-gray-400 mb-6">
                Estamos trabajando en una página completa de socios. Mientras tanto, puedes ver nuestros socios en la página principal.
              </p>
              <a 
                href="/es"
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Volver al Inicio
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}