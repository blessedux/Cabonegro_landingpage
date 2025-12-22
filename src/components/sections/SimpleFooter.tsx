'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SimpleFooterProps {
  locale?: 'en' | 'es' | 'zh' | 'fr'
}

export function SimpleFooter({ locale = 'es' }: SimpleFooterProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Smooth scroll handler for homepage sections
  const handleSmoothScroll = (sectionId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Check if we're on the homepage
    const isHomePage = pathname === '/' || 
                       pathname === `/${locale}` || 
                       pathname === '/en' || 
                       pathname === '/es' || 
                       pathname === '/zh' || 
                       pathname === '/fr'
    
    if (isHomePage) {
      // If on homepage, scroll directly
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - 80 // Offset for navbar
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        }
      }, 50)
    } else {
      // If not on homepage, navigate to homepage with hash
      const homePath = locale === 'en' ? '/en' : `/${locale}`
      router.push(`${homePath}#${sectionId}`)
      
      // Wait for navigation and then scroll
      // Use a longer timeout to ensure page has loaded
      setTimeout(() => {
        const scrollToSection = () => {
          const element = document.getElementById(sectionId)
          if (element) {
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - 80
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          } else {
            // Retry if element not found yet
            setTimeout(scrollToSection, 100)
          }
        }
        scrollToSection()
      }, 300)
    }
  }

  const footerContent = {
    en: {
      contact: {
        title: 'CONTACT',
        question: 'Want to know more about the project?',
        description: 'Contact us for more information.',
        formPlaceholder: 'Your email',
        formButton: 'Subscribe',
        meetingButton: 'Schedule Meeting',
        newsletter: 'Get informed about all our news'
      },
      location: {
        title: 'LOCATION',
        virtualTour: 'Virtual Tour'
      },
      about: {
        title: 'ABOUT US',
        whoWeAre: 'Who we are',
        projects: 'Projects',
        viewDeck: 'View Deck'
      },
      email: 'ventas@cabonegro.cl'
    },
    es: {
      contact: {
        title: 'CONTACTO',
        question: '¿Quieres conocer más sobre el proyecto?',
        description: 'Contáctanos para más información.',
        formPlaceholder: 'Tu correo',
        formButton: 'Suscribirse',
        meetingButton: 'Agenda Reunión',
        newsletter: 'Infórmate sobre todas nuestras novedades'
      },
      location: {
        title: 'UBICACIÓN',
        virtualTour: 'Recorrido virtual'
      },
      about: {
        title: 'SOBRE NOSOTROS',
        whoWeAre: 'Quiénes somos',
        projects: 'Proyectos',
        viewDeck: 'Ver Deck'
      },
      email: 'ventas@cabonegro.cl'
    },
    zh: {
      contact: {
        title: '联系',
        question: '想了解更多关于项目的信息？',
        description: '联系我们获取更多信息。',
        formPlaceholder: '您的邮箱',
        formButton: '订阅',
        meetingButton: '安排会议',
        newsletter: '了解我们的所有新闻'
      },
      location: {
        title: '位置',
        virtualTour: '虚拟游览'
      },
      about: {
        title: '关于我们',
        whoWeAre: '我们是谁',
        projects: '项目',
        viewDeck: '查看甲板'
      },
      email: 'ventas@cabonegro.cl'
    },
    fr: {
      contact: {
        title: 'CONTACT',
        question: 'Vous voulez en savoir plus sur le projet ?',
        description: 'Contactez-nous pour plus d\'informations.',
        formPlaceholder: 'Votre email',
        formButton: 'S\'abonner',
        meetingButton: 'Planifier une Réunion',
        newsletter: 'Restez informé de toutes nos nouveautés'
      },
      location: {
        title: 'EMPLACEMENT',
        virtualTour: 'Visite virtuelle'
      },
      about: {
        title: 'À PROPOS DE NOUS',
        whoWeAre: 'Qui nous sommes',
        projects: 'Projets',
        viewDeck: 'Voir le Deck'
      },
      email: 'ventas@cabonegro.cl'
    }
  }

  const content = footerContent[locale]
  const basePath = locale === 'en' ? '' : `/${locale}`
  const whatsappMessage = locale === 'es' 
    ? 'Hola%2C%20estoy%20interesado%20en%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20del%20proyecto%20Cabo%20Negro.%20Gracias.'
    : locale === 'en'
    ? 'Hello%2C%20I%27m%20interested%20in%20scheduling%20a%20meeting%20with%20the%20Cabo%20Negro%20project%20team.%20Thank%20you.'
    : locale === 'fr'
    ? 'Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20%C3%A0%20planifier%20une%20r%C3%A9union%20avec%20l%27%C3%A9quipe%20du%20projet%20Cabo%20Negro.%20Merci.'
    : locale === 'zh'
    ? '%E4%BD%A0%E5%A5%BD%2C%20%E6%88%91%E6%84%9F%E5%85%B4%E8%B6%A3%E4%BA%8E%E5%AE%89%E6%8E%92%E4%B8%8E%E5%8D%A1%E6%B3%A2%E5%86%85%E6%A0%BC%E7%BD%97%E9%A1%B9%E7%9B%AE%E5%9B%A2%E9%98%9F%E7%9A%84%E4%BC%9A%E8%AE%AE%E3%80%82%E8%B0%A2%E8%B0%A2%E3%80%82'
    : 'Hola%2C%20estoy%20interesado%20en%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20del%20proyecto%20Cabo%20Negro.%20Gracias.'


  return (
    <footer className="w-full bg-white relative z-30" data-keep-navbar-black="true">
      {/* CTA Section - Above Footer Navigation */}
      <section className="bg-white py-12 md:py-16 px-6 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-8">
            {/* Left Side - Contact Heading and Description */}
            <div className="flex-1">
              <h3 className="text-black font-bold text-xl md:text-2xl mb-3 uppercase">
                {content.contact.title}
              </h3>
              <p className="text-gray-600 italic text-base md:text-lg leading-relaxed">
                {content.contact.question}
              </p>
              <p className="text-gray-600 italic text-base md:text-lg leading-relaxed">
                {content.contact.description}
              </p>
            </div>
            
            {/* Right Side - Schedule Meeting Button */}
            <div className="flex-shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-black text-white hover:bg-gray-800 transition-colors font-semibold px-8 py-6 rounded-md shadow-lg"
              >
                <a 
                  href={`https://wa.me/56974766174?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {content.contact.meetingButton}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - Navigation Menu (Light Grey Background) */}
      <section className="bg-gray-200 py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Column 1: UBICACIÓN */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">
                {content.location.title}
              </h3>
              <Link 
                href={`${basePath}/explore`}
                className="text-gray-700 hover:text-black transition-colors block mb-4"
              >
                {content.location.virtualTour}
              </Link>
              {/* Map image - clickable */}
              <a 
                href="https://maps.app.goo.gl/qYqfHZmW4uVFpKJZ7"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-32 rounded-lg mt-4 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer relative"
              >
                <Image
                  src="/Screenshot.webp"
                  alt="Cabo Negro Location Map"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </a>
            </div>

            {/* Column 2: SOBRE NOSOTROS */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">
                {content.about.title}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href={`${basePath}#about`}
                    onClick={(e) => handleSmoothScroll('about', e)}
                    className="text-gray-700 hover:text-black transition-colors block cursor-pointer"
                  >
                    {content.about.whoWeAre}
                  </a>
                </li>
                <li>
                  <a 
                    href={`${basePath}#stats`}
                    onClick={(e) => handleSmoothScroll('stats', e)}
                    className="text-gray-700 hover:text-black transition-colors block cursor-pointer"
                  >
                    {content.about.projects}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: NEWSLETTER */}
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {content.contact.newsletter}
              </p>
            </div>

            {/* Column 4: CONTACTO */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">
                {content.contact.title}
              </h3>
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-black" />
                  <a 
                    href={`mailto:${content.email}`}
                    className="text-gray-700 hover:text-black transition-colors"
                  >
                    {content.email}
                  </a>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-black" />
                  <a
                    href={`https://wa.me/56974766174?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-black transition-colors"
                  >
                    +56 9 7476 6174
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}
