import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2">CABO NEGRO</div>
            <p className="text-sm text-gray-500">© 2025 Cabo Negro Industrial Park</p>
          </div>

          <div className="flex flex-wrap gap-8">
            <Link href="/explore" className="text-sm text-gray-400 hover:text-white uppercase">Explore Terrain</Link>
            <Link href="/deck" className="text-sm text-gray-400 hover:text-white uppercase">View Deck</Link>
            <Link href="/partners" className="text-sm text-gray-400 hover:text-white uppercase">Partners</Link>
            <Link href="/#FAQ" className="text-sm text-gray-400 hover:text-white uppercase">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}