'use client';

import { useState } from "react";
import Link from "next/link";
import SketchfabHero from "../components/SketchfabHero";

export default function Home() {
  const [isExploreMode, setIsExploreMode] = useState(false);
  return (
    <div className="min-h-screen relative">
      {/* Full Screen 3D Background */}
      <SketchfabHero 
        className="w-full h-full"
        isExploreMode={isExploreMode}
        onExploreModeChange={setIsExploreMode}
      />

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

      {/* Hero Section Content - Only visible when not in explore mode */}
      {!isExploreMode && (
        <section className="relative h-screen flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-2 drop-shadow-2xl">
              <span className="text-white">Cabo</span>
              <span className="text-cyan-400">Negro</span>
            </h1>
            <p className="text-lg md:text-xl text-white tracking-[0.3em] uppercase drop-shadow-lg">
              PARQUE INDUSTRIAL
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-auto">
            <div className="flex gap-4">
              <button
                onClick={() => setIsExploreMode(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-cyan-400/30"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">Explorar</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </button>
              
              <Link href="/scroll-test">
                <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">Porque Cabo Negro?</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {!isExploreMode && (
        <section className="relative py-20 z-40">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
                <h2 className="text-sm md:text-base text-gray-600 mb-4 uppercase tracking-wider">
                  EL FUTURO DEL DESARROLLO
                </h2>
                <h3 className="text-5xl md:text-7xl font-bold mb-12">INDUSTRIAL</h3>

                <div className="grid md:grid-cols-2 gap-12 items-center">
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
      )}

      {/* Project Section */}
      {!isExploreMode && (
        <section id="proyecto" className="relative py-20 z-40">
          <div className="container mx-auto px-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">PROYECTO</h2>

              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
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
      )}

      {/* Location Strategic Section */}
      {!isExploreMode && (
        <section className="relative py-20 z-40">
          <div className="container mx-auto px-6 text-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">UBICACIÓN</h2>
              <h3 className="text-5xl md:text-7xl font-bold mb-20">ESTRATÉGICA</h3>
            </div>
          </div>
        </section>
      )}

      {/* Location Details Section */}
      {!isExploreMode && (
        <section id="ubicacion" className="relative py-20 z-40">
          <div className="container mx-auto px-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">UBICACIÓN</h2>

              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
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
      )}

      {/* Map Section */}
      {!isExploreMode && (
        <section className="relative py-20 z-40">
          <div className="container mx-auto px-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">
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
      )}

      {/* Clients Section */}
      {!isExploreMode && (
        <section className="relative py-20 z-40">
          <div className="container mx-auto px-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
                NUESTROS<br />CLIENTES
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto items-center">
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
      )}

      {/* Footer */}
      {!isExploreMode && (
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

          <div className="bg-black/90 backdrop-blur-md text-white text-center py-6">
            <p className="text-xl font-bold">WWW.CABONEGRO.CL</p>
          </div>
        </footer>
      )}
    </div>
  );
}
