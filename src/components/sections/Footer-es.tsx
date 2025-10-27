import { Button } from '@/components/ui/button'

export default function FooterEs() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2">CABO NEGRO</div>
            <p className="text-sm text-gray-500">© 2025 Parque Industrial Cabo Negro</p>
          </div>

          <div className="flex flex-wrap gap-8">
            <a href="#Explore" className="text-sm text-gray-400 hover:text-white uppercase">Explorar Terreno</a>
            <a href="#Deck" className="text-sm text-gray-400 hover:text-white uppercase">Ver Deck</a>
            <a href="#Partners" className="text-sm text-gray-400 hover:text-white uppercase">Socios</a>
            <a href="#FAQ" className="text-sm text-gray-400 hover:text-white uppercase">Preguntas Frecuentes</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
