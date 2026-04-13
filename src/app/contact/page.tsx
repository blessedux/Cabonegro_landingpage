import Contact from '@/components/sections/Contact'
import ContactTopographicBackground from '@/components/ui/ContactTopographicBackground'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <ContactTopographicBackground />
      <main className="relative z-10">
        <Contact />
      </main>
    </div>
  )
}
