import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Route, Zap, Droplets, Building2 } from 'lucide-react'

export default function IndustrialParkEs() {
  return (
    <section className="py-20 px-6 bg-white/5" id="IndustrialPark">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Parque Industrial Cabo Negro
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto">
            Un ecosistema industrial listo para construir diseñado para la era del hidrógeno. 
            Más de <span className="text-white font-bold">300 hectáreas</span> de tierra estratégicamente ubicada 
            con infraestructura de clase mundial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-green-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Ubicación Estratégica</h3>
                <p className="text-gray-300">
                  Ubicado en Punta Arenas, en el corazón de la Región de Magallanes
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Tierra y Propiedad</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Área Total:</span>
                  <span className="text-white font-semibold">300+ hectáreas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Propietarios:</span>
                  <span className="text-white font-semibold">J&P, Patagon Valley, A&J, PPG S.A.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado:</span>
                  <span className="text-green-400 font-semibold">Listo para construir</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-orange-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <Route className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Infraestructura</h3>
                <p className="text-gray-300">
                  Conectado a la Ruta 9N - corredor logístico principal de Magallanes
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Red de Carreteras</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Carreteras Internas:</span>
                  <span className="text-white font-semibold">6 carreteras (33% construidas)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ancho de Carretera Principal:</span>
                  <span className="text-white font-semibold">40m con radio de giro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conexión:</span>
                  <span className="text-white font-semibold">Acceso a Ruta 9N</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Capacidad Eléctrica</h3>
            <p className="text-3xl font-bold text-white mb-2">13 MW</p>
            <p className="text-gray-400 text-sm">Capacidad de infraestructura actual</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sistema de Agua</h3>
            <p className="text-3xl font-bold text-white mb-2">3 Pozos</p>
            <p className="text-gray-400 text-sm">Pozos profundos + tanque elevado de 20m</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Matriz de Agua</h3>
            <p className="text-3xl font-bold text-white mb-2">HDPE 110</p>
            <p className="text-gray-400 text-sm">Con conexiones domésticas</p>
          </div>
        </div>
      </div>
    </section>
  )
}
