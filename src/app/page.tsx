export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-600/30 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-8">
            {/* Navbar buttons removed - keeping transparent navbar structure */}
          </div>
          <div className="text-white text-sm">
            www.cabonegro.cl
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2 drop-shadow-2xl leading-tight">
            <span className="text-white">Cabo</span>
            <span className="text-cyan-400">Negro</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white tracking-[0.2em] sm:tracking-[0.3em] uppercase drop-shadow-lg">
            PARQUE INDUSTRIAL
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 z-40">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl">
              <h2 className="text-sm md:text-base text-gray-600 mb-4 uppercase tracking-wider">
                EL FUTURO DEL DESARROLLO
              </h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-8 sm:mb-12 leading-tight">INDUSTRIAL</h3>

              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="bg-black aspect-video rounded-lg overflow-hidden">
                  {/* Video placeholder */}
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4">
                    Qué es Parque Industrial<br />Cabo Negro?
                  </h4>
                  <p className="text-sm text-gray-600 uppercase tracking-wider mb-4">SOBRE NOSOTROS</p>
                  <p className="text-gray-700 leading-relaxed">
                    Parque Industrial Cabo Negro, es el primer parque industrial de alto estándar que permitirá la instalación de diferentes actividades industriales, logísticas, de almacenamiento y productivas, en 179 hectáreas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Section */}
      <section id="proyecto" className="relative py-20 z-40">
        <div className="container mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 leading-tight">PROYECTO</h2>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-8 sm:mb-12">
              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/3418025861.png"
                    alt="Cabo Negro Parque Industrial"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">CABO NEGRO PARQUE INDUSTRIAL:</h3>
                <p className="text-sm px-4">
                  LA MEJOR ZONA LOGÍSTICA Y DE RESPALDO PARA PROYECTOS INDUSTRIALES SOSTENIBLES
                </p>
              </div>

              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/1012233949.png"
                    alt="Hidrógeno Verde"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">HIDRÓGENO VERDE:</h3>
                <p className="text-sm px-4">
                  LA MEJOR ZONA LOGÍSTICA Y DE RESPALDO PARA PROYECTOS DE HIDRÓGENO VERDE EN MAGALLANES
                </p>
              </div>

              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/1383045803.png"
                    alt="Fibra Óptica"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">FIBRA ÓPTICA:</h3>
                <p className="text-sm px-4">
                  CONEXIÓN 5G Y TRANSPORTE DE 6 TERABITS POR SEGUNDO
                </p>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                VER PROYECTO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Location Strategic Section */}
      <section className="relative py-20 z-40">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">UBICACIÓN</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-12 sm:mb-20 leading-tight">ESTRATÉGICA</h3>
          </div>
        </div>
      </section>

      {/* Location Details Section */}
      <section id="ubicacion" className="relative py-20 z-40">
        <div className="container mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 leading-tight">UBICACIÓN</h2>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-8 sm:mb-12">
              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/2936504262.png"
                    alt="Ubicación Estratégica"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">UBICACION ESTRATÉGICA:</h3>
                <p className="text-sm px-4">
                  A 22 MINUTOS DE PUNTA ARENAS A 8 MINUTOS DEL AEROPUERTO INTERNACIONAL
                </p>
              </div>

              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/663826360.png"
                    alt="Futuro Puerto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">FUTURO PUERTO:</h3>
                <p className="text-sm px-4">
                  CONSTRUCCIÓN DE UN PUERTO MARÍTIMO EN EL ESTRECHO DE MAGALLANES
                </p>
              </div>

              <div className="text-center">
                <div className="aspect-[4/3] relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src="https://ext.same-assets.com/1355652569/759252511.png"
                    alt="Conexión Satelital"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-2">CONEXIÓN SATELITAL:</h3>
                <p className="text-sm px-4">
                  LA ZONA MÁS AUSTRAL DEL MUNDO POSEE UNA CERCANÍA ÚNICA A LA ÓRBITA
                </p>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                VER UBICACION
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative py-20 z-40">
        <div className="container mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight">
                  LA MEJOR ZONA LOGÍSTICA DE RESPALDO
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  A pesar de que la extensión territorial es enorme, hay una baja infraestructura pública y privada para recibir dichos proyectos.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Cabo Negro Parque Industrial es la mejor zona logística y de respaldo para proyectos de industrias sostenibles.
                </p>
              </div>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src="https://ext.same-assets.com/1355652569/542139700.png"
                  alt="Mapa de ubicación"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="relative py-20 z-40">
        <div className="container mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 leading-tight">
              NUESTROS<br />CLIENTES
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto items-center">
              <div className="flex items-center justify-center">
                <img
                  src="https://ext.same-assets.com/1355652569/247720957.png"
                  alt="Patagón Valley"
                  className="max-w-[150px] h-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://ext.same-assets.com/1355652569/3502029075.png"
                  alt="Amazon"
                  className="max-w-[150px] h-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://ext.same-assets.com/1355652569/4061695208.png"
                  alt="GTD"
                  className="max-w-[150px] h-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://ext.same-assets.com/1355652569/171760707.png"
                  alt="Circular Protein"
                  className="max-w-[150px] h-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="relative z-40">
        <div className="container mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="flex justify-center mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Dirección</h3>
                <p className="text-sm text-gray-600">
                  Ruta 9, KM. 28 Punta Arenas<br />
                  Región de Magallanes, Chile.
                </p>
              </div>

              <div>
                <div className="flex justify-center mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Phone</h3>
                <p className="text-sm text-gray-600">
                  +56 9 9309 1951<br />
                  +56 2 27702700
                </p>
              </div>

              <div>
                <div className="flex justify-center mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-sm text-gray-600">
                  pyaconi@ylmv.cl<br />
                  venta@cabonegro.cl
                </p>
              </div>

              <div>
                <div className="flex justify-center mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Comercializan</h3>
                <p className="text-sm text-gray-600">
                  Inmobiliaria Cabo Negro Spa
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
