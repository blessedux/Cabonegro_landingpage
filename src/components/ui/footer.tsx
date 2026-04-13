"use client"

import Link from "next/link"
import { LinkWithPreloader } from "@/components/ui/LinkWithPreloader"
import { ArrowRight, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FooterBackground } from "@/components/ui/background-components"
import { RevealText } from "@/components/ui/reveal-text"

type Locale = "en" | "es" | "zh" | "fr"

interface CaboFooterProps {
  locale?: Locale
}

const FOOTER_CONTENT = {
  en: {
    investment: {
      title: "INVESTMENT",
    },
    contact: {
      title: "CONTACT",
      question: "Want to know more about the project?",
      description: "Contact us for more information.",
      meetingButton: "Schedule Meeting",
    },
    location: {
      title: "LOCATION",
      virtualTour: "Virtual Tour",
      privacy: "Privacy policy",
      copyright: "Copyright",
    },
    about: {
      title: "ABOUT US",
      whoWeAre: "Who we are",
      projects: "Projects",
      viewDeck: "View Deck",
    },
    title: "CABO NEGRO",
    copyright: "© 2026 Cabo Negro Industrial Park",
    allRightsReserved: "All rights reserved.",
    email: "ventas@cabonegro.cl",
    faq: "FAQ",
  },
  es: {
    investment: {
      title: "INVERSIÓN",
    },
    contact: {
      title: "CONTACTO",
      question: "¿Quieres conocer más sobre el proyecto?",
      description: "Contáctanos para más información.",
      meetingButton: "Agenda Reunión",
    },
    location: {
      title: "UBICACIÓN",
      virtualTour: "Recorrido virtual",
      privacy: "Política de privacidad",
      copyright: "Derechos de autor",
    },
    about: {
      title: "SOBRE NOSOTROS",
      whoWeAre: "Quiénes somos",
      projects: "Proyectos",
      viewDeck: "Ver Deck",
    },
    title: "CABO NEGRO",
    copyright: "© 2026 Parque Industrial Cabo Negro",
    allRightsReserved: "Todos los derechos reservados.",
    email: "ventas@cabonegro.cl",
    faq: "Preguntas Frecuentes",
  },
  zh: {
    investment: {
      title: "投资",
    },
    contact: {
      title: "联系",
      question: "想了解更多关于项目的信息？",
      description: "联系我们获取更多信息。",
      meetingButton: "安排会议",
    },
    location: {
      title: "位置",
      virtualTour: "虚拟游览",
      privacy: "隐私政策",
      copyright: "版权",
    },
    about: {
      title: "关于我们",
      whoWeAre: "我们是谁",
      projects: "项目",
      viewDeck: "查看甲板",
    },
    title: "CABO NEGRO",
    copyright: "© 2026 Cabo Negro Industrial Park",
    allRightsReserved: "保留所有权利。",
    email: "ventas@cabonegro.cl",
    faq: "常见问题",
  },
  fr: {
    investment: {
      title: "INVESTISSEMENT",
    },
    contact: {
      title: "CONTACT",
      question: "Vous voulez en savoir plus sur le projet ?",
      description: "Contactez-nous pour plus d'informations.",
      meetingButton: "Planifier une Réunion",
    },
    location: {
      title: "EMPLACEMENT",
      virtualTour: "Visite virtuelle",
      privacy: "Politique de confidentialité",
      copyright: "Droits d’auteur",
    },
    about: {
      title: "À PROPOS DE NOUS",
      whoWeAre: "Qui nous sommes",
      projects: "Projets",
      viewDeck: "Voir le Deck",
    },
    title: "CABO NEGRO",
    copyright: "© 2026 Parc Industriel Cabo Negro",
    allRightsReserved: "Tous droits réservés.",
    email: "ventas@cabonegro.cl",
    faq: "FAQ",
  },
} as const

const WHATSAPP_MESSAGES = {
  es: "Hola%2C%20estoy%20interesado%20en%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20del%20proyecto%20Cabo%20Negro.%20Gracias.",
  en: "Hello%2C%20I%27m%20interested%20in%20scheduling%20a%20meeting%20with%20the%20Cabo%20Negro%20project%20team.%20Thank%20you.",
  fr: "Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20%C3%A0%20planifier%20une%20r%C3%A9union%20avec%20l%27%C3%A9quipe%20du%20projet%20Cabo%20Negro.%20Merci.",
  zh: "%E4%BD%A0%E5%A5%BD%2C%20%E6%88%91%E6%84%9F%E5%85%B4%E8%B6%A3%E4%BA%8E%E5%AE%89%E6%8E%92%E4%B8%8E%E5%8D%A1%E6%B3%A2%E5%86%85%E6%A0%BC%E7%BD%97%E9%A1%B9%E7%9B%AE%E5%9B%A2%E9%98%9F%E7%9A%84%E4%BC%9A%E8%AE%AE%E3%80%82%E8%B0%A2%E8%B0%A2%E3%80%82",
} as const

const localeHref = (locale: Locale, path: string) => {
  if (locale === "en") return path
  return `/${locale}${path}`
}

export function CaboFooter({ locale = "es" }: CaboFooterProps) {
  const content = FOOTER_CONTENT[locale]
  const whatsappMessage = WHATSAPP_MESSAGES[locale] ?? WHATSAPP_MESSAGES.es

  return (
    <div
      className="relative z-30 h-[72vh]"
      data-keep-navbar-black="true"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="relative -top-[100vh] h-[calc(100vh+72vh)]">
        <footer className="sticky top-[calc(100vh-72vh)] relative z-0 h-[72vh] w-full overflow-hidden">
          <FooterBackground />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-10 md:px-8 md:py-14">
            <div className="grid gap-8 border-b border-black/20 pb-10 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-widest text-black/70 uppercase">{content.investment.title}</h3>
                <div className="space-y-1">
                  <p className="text-base text-black">{content.contact.question}</p>
                  <p className="text-sm text-black/70">{content.contact.description}</p>
                </div>
                <Button asChild className="bg-black text-white hover:bg-black/85">
                  <a href={`https://wa.me/56974766174?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                    {content.contact.meetingButton}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-widest text-black/70 uppercase">{content.contact.title}</h3>
                <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black">
                  <Mail className="size-4" />
                  {content.email}
                </a>
                <a
                  href={`https://wa.me/56974766174?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black"
                >
                  <Phone className="size-4" />
                  +56 9 7476 6174
                </a>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-widest text-black/70 uppercase">{content.location.title}</h3>
                <LinkWithPreloader href={localeHref(locale, "/explore")} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.location.virtualTour}
                </LinkWithPreloader>
                <Link href={`/${locale}/privacy`} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.location.privacy}
                </Link>
                <Link href={`/${locale}/copyright`} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.location.copyright}
                </Link>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-widest text-black/70 uppercase">{content.about.title}</h3>
                <Link href={localeHref(locale, "/#about")} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.about.whoWeAre}
                </Link>
                <Link href={localeHref(locale, "/#partners")} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.about.projects}
                </Link>
                <Link href={localeHref(locale, "/deck")} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.about.viewDeck}
                </Link>
                <Link href={localeHref(locale, "/#FAQ")} className="block text-sm text-black/80 transition-colors hover:text-black">
                  {content.faq}
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 max-w-full flex-1">
                <h2 className="sr-only">{content.title}</h2>
                <RevealText
                  text={content.title}
                  textColor="text-black"
                  fontSize="text-[clamp(2.85rem,12vw,7rem)] font-black tracking-tight"
                  className="max-w-full"
                />
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
                <p className="text-sm text-black/70">{content.copyright}</p>
                <p className="text-xs text-black/60">{content.allRightsReserved}</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
