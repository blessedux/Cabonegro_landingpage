import { Button } from '@/components/ui/button'

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2">VINODE</div>
            <p className="text-sm text-gray-500">© 2025 Prographers. House App</p>
          </div>

          <div className="flex flex-wrap gap-8">
            <a href="#About" className="text-sm text-gray-400 hover:text-white uppercase">About</a>
            <a href="#Projects" className="text-sm text-gray-400 hover:text-white uppercase">Projects</a>
            <a href="#FAQ" className="text-sm text-gray-400 hover:text-white uppercase">FAQ</a>
            <a href="#Blog" className="text-sm text-gray-400 hover:text-white uppercase">Blog</a>
          </div>
        </div>
      </div>
    </footer>
  )
}