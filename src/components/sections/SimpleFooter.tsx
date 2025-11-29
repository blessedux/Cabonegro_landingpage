'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, ArrowRight } from 'lucide-react'

interface SimpleFooterProps {
  locale?: 'en' | 'es' | 'zh' | 'fr'
}

export function SimpleFooter({ locale = 'es' }: SimpleFooterProps) {

  const footerContent = {
    en: {
      contact: {
        title: 'CONTACT',
        description: 'Want to know more about the project? Contact us for more information.',
        formPlaceholder: 'Your email',
        formButton: 'Subscribe',
        meetingButton: 'Schedule Meeting',
        newsletter: 'Get informed about all our news'
      },
      partners: {
        title: 'PARTNERS AND ASSOCIATED ENTITIES'
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
      contactMenu: {
        title: 'CONTACT',
        faq: 'Frequently Asked Questions',
        scheduleMeeting: 'Schedule Meeting',
        contactForm: 'Contact Form'
      },
      email: 'contacto@cabonegro.cl'
    },
    es: {
      contact: {
        title: 'CONTACTO',
        description: '¿Quieres conocer más sobre el proyecto? Contáctanos para más información.',
        formPlaceholder: 'Tu correo',
        formButton: 'Suscribirse',
        meetingButton: 'Agenda Reunión',
        newsletter: 'Infórmate sobre todas nuestras novedades'
      },
      partners: {
        title: 'PARTNERS Y ENTIDADES ASOCIADAS'
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
      contactMenu: {
        title: 'CONTACTO',
        faq: 'Preguntas frecuentes',
        scheduleMeeting: 'Agenda reunion',
        contactForm: 'Formulario contacto'
      },
      email: 'contacto@cabonegro.cl'
    },
    zh: {
      contact: {
        title: '联系',
        description: '想了解更多关于项目的信息？联系我们获取更多信息。',
        formPlaceholder: '您的邮箱',
        formButton: '订阅',
        meetingButton: '安排会议',
        newsletter: '了解我们的所有新闻'
      },
      partners: {
        title: '合作伙伴和关联实体'
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
      contactMenu: {
        title: '联系',
        faq: '常见问题',
        scheduleMeeting: '安排会议',
        contactForm: '联系表单'
      },
      email: 'contacto@cabonegro.cl'
    },
    fr: {
      contact: {
        title: 'CONTACT',
        description: 'Vous voulez en savoir plus sur le projet ? Contactez-nous pour plus d\'informations.',
        formPlaceholder: 'Votre email',
        formButton: 'S\'abonner',
        meetingButton: 'Planifier une Réunion',
        newsletter: 'Restez informé de toutes nos nouveautés'
      },
      partners: {
        title: 'PARTENAIRES ET ENTITÉS ASSOCIÉES'
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
      contactMenu: {
        title: 'CONTACT',
        faq: 'Questions fréquentes',
        scheduleMeeting: 'Planifier une réunion',
        contactForm: 'Formulaire de contact'
      },
      email: 'contacto@cabonegro.cl'
    }
  }

  const content = footerContent[locale]
  const basePath = locale === 'en' ? '' : `/${locale}`
  const whatsappMessage = locale === 'es' 
    ? 'Hola%2C%20estoy%20interesado%20en%20adquirir%20terrenos%20o%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20inmobiliario%20de%20Cabo%20Negro.%20%C2%BFPodr%C3%ADan%20proporcionarme%20informaci%C3%B3n%20sobre%20lotes%20disponibles%2C%20parcelas%20industriales%20y%20oportunidades%20de%20desarrollo%3F%20Gracias.'
    : locale === 'en'
    ? 'Hello%2C%20I%27m%20interested%20in%20acquiring%20land%20or%20scheduling%20a%20meeting%20with%20the%20Cabo%20Negro%20real%20estate%20team.%20Could%20you%20please%20provide%20me%20with%20information%20about%20available%20lots%2C%20industrial%20parcels%2C%20and%20development%20opportunities%3F%20Thank%20you.'
    : 'Hola%2C%20estoy%20interesado%20en%20adquirir%20terrenos%20o%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20inmobiliario%20de%20Cabo%20Negro.%20%C2%BFPodr%C3%ADan%20proporcionarme%20informaci%C3%B3n%20sobre%20lotes%20disponibles%2C%20parcelas%20industriales%20y%20oportunidades%20de%20desarrollo%3F%20Gracias.'


  return (
    <footer className="w-full bg-white relative z-30" data-keep-navbar-black="true">
      {/* Top Section - Contact Form & Meeting Button (White Background) */}
      <section className="bg-white py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.contact.title}
              </h2>
              <p className="text-lg text-gray-600 italic mb-6">
                {content.contact.description}
              </p>
            </div>

            {/* Right: Single CTA Button */}
            <div className="flex justify-end">
              <a
                href={`https://wa.me/56993091951?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-neutral-950 shadow-lg shadow-neutral-900 border border-neutral-700 flex w-fit gap-2 hover:gap-4 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-lg cursor-pointer font-semibold"
              >
                {content.contact.meetingButton} <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section - Partners (Grey Background) */}
      <section className="bg-gray-100 py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center uppercase">
            {content.partners.title}
          </h2>
          
          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center">
            {/* COMPAS marine */}
            <div className="flex flex-col items-center">
              <div className="text-black text-4xl md:text-5xl font-bold">
                COMPAS
                <span className="text-xl md:text-2xl block text-right">marine</span>
              </div>
            </div>

            {/* PATAGON VALLEY */}
            <div className="flex flex-col items-center">
              <Image
                src="/logos/patagon_white.png"
                alt="PATAGON VALLEY"
                width={100}
                height={100}
                className="mb-3"
                style={{ filter: 'brightness(0)' }}
              />
            </div>

            {/* yLMV ABOGADOS */}
            <div className="flex flex-col items-center">
              <Image
                src="/logos/ylmv_blanco.png"
                alt="yLMV ABOGADOS"
                width={120}
                height={60}
                className="mb-2"
                style={{ filter: 'brightness(0)' }}
              />
              <div className="text-gray-700 text-sm uppercase">ABOGADOS</div>
            </div>

            {/* CaboNegro Logo */}
            <div className="flex flex-col items-center">
              <Image
                src="/cabonegro_logo.png"
                alt="Cabo Negro"
                width={140}
                height={60}
                className="mb-2"
                style={{ filter: 'brightness(0)' }}
              />
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
              {/* Map placeholder - clickable */}
              <Link 
                href={`${basePath}/explore`}
                className="block w-full h-32 bg-gray-700 rounded-lg mt-4 flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <MapPin className="w-8 h-8 text-gray-400" />
              </Link>
            </div>

            {/* Column 2: SOBRE NOSOTROS */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">
                {content.about.title}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href={`${basePath}#about`}
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.about.whoWeAre}
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`${basePath}/industrial-park`}
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.about.projects}
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`${basePath}/deck`}
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.about.viewDeck}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: NEWSLETTER */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">NEWSLETTER</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {content.contact.newsletter}
              </p>
            </div>

            {/* Column 4: CONTACTO */}
            <div>
              <h3 className="text-black font-bold text-lg mb-4 uppercase">
                {content.contactMenu.title}
              </h3>
              <ul className="space-y-2 mb-4">
                <li>
                  <Link 
                    href={`${basePath}#FAQ`}
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.contactMenu.faq}
                  </Link>
                </li>
                <li>
                  <a
                    href={`https://wa.me/56993091951?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.contactMenu.scheduleMeeting}
                  </a>
                </li>
                <li>
                  <Link 
                    href={`${basePath}/contact`}
                    className="text-gray-700 hover:text-black transition-colors block"
                  >
                    {content.contactMenu.contactForm}
                  </Link>
                </li>
              </ul>
              
              {/* Email */}
              <div className="flex items-center gap-2 mt-4">
                <Mail className="w-5 h-5 text-black" />
                <a 
                  href={`mailto:${content.email}`}
                  className="text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  {content.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}
