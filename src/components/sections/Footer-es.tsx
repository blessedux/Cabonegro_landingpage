import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
            <Link href="/es/explore" className="text-sm text-gray-400 hover:text-white uppercase">Explorar Terreno</Link>
            <Link href="/es/deck" className="text-sm text-gray-400 hover:text-white uppercase">Ver Deck</Link>
            <Link href="/es#FAQ" className="text-sm text-gray-400 hover:text-white uppercase">Preguntas Frecuentes</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
