import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="pt-0 pb-12 px-6 bg-white relative z-30 w-full flex flex-col justify-center">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2 text-foreground">CABO NEGRO</div>
            <p className="text-sm text-gray-600">© 2025 Cabo Negro Industrial Park</p>
          </div>

          <div className="flex flex-wrap gap-8">
            <Link href="/explore" className="text-sm text-gray-600 hover:text-accent uppercase">Explore Terrain</Link>
            <Link href="/deck" className="text-sm text-gray-600 hover:text-accent uppercase">View Deck</Link>
            <Link href="/#FAQ" className="text-sm text-gray-600 hover:text-accent uppercase">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}