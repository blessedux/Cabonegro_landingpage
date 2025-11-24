'use client'

import Link from 'next/link'

interface SimpleFooterProps {
  locale?: 'en' | 'es' | 'zh' | 'fr'
}

export function SimpleFooter({ locale = 'en' }: SimpleFooterProps) {
  const footerContent = {
    en: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Cabo Negro Industrial Park',
      links: [
        { href: '/explore', text: 'Explore Terrain' },
        { href: '/deck', text: 'View Deck' },
        { href: '/#FAQ', text: 'FAQ' }
      ]
    },
    es: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Parque Industrial Cabo Negro',
      links: [
        { href: '/es/explore', text: 'Explorar Terreno' },
        { href: '/es/deck', text: 'Ver Deck' },
        { href: '/es#FAQ', text: 'Preguntas Frecuentes' }
      ]
    },
    zh: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Cabo Negro Industrial Park',
      links: [
        { href: '/zh/explore', text: '探索地形' },
        { href: '/zh/deck', text: '查看甲板' },
        { href: '/zh#FAQ', text: '常见问题' }
      ]
    },
    fr: {
      title: 'CABO NEGRO',
      copyright: '© 2025 Parc Industriel Cabo Negro',
      links: [
        { href: '/fr/explore', text: 'Explorer le Terrain' },
        { href: '/fr/deck', text: 'Voir le Deck' },
        { href: '/fr#FAQ', text: 'FAQ' }
      ]
    }
  }

  const content = footerContent[locale]

  return (
    <footer className="pt-0 pb-16 px-6 bg-white relative z-30 w-full flex flex-col justify-center border-t-2 border-black shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] rounded-t-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-2xl font-bold mb-2 text-foreground">{content.title}</div>
            <p className="text-sm text-gray-600">{content.copyright}</p>
          </div>

          <div className="flex flex-wrap gap-8">
            {content.links.map((link, index) => (
              <Link 
                key={index}
                href={link.href} 
                className="text-sm text-gray-600 hover:text-accent uppercase transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

