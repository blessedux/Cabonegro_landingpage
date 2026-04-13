"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import Navbar from "@/components/sections/Navbar"
import NavbarEs from "@/components/sections/Navbar-es"
import NavbarZh from "@/components/sections/Navbar-zh"
import { getLegalPageContent, type LegalPageKind } from "@/lib/legal-pages-content"
import type { Locale } from "@/i18n/routing"

const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: true })
const CookieBanner = dynamic(() => import("@/components/sections/CookieBanner"), { ssr: false })

function localeFromPathname(pathname: string | null): Locale {
  if (!pathname) return "en"
  if (pathname.startsWith("/es")) return "es"
  if (pathname.startsWith("/zh")) return "zh"
  if (pathname.startsWith("/fr")) return "fr"
  return "en"
}

function NavbarForLocale({ locale }: { locale: Locale }) {
  if (locale === "es") return <NavbarEs />
  if (locale === "zh") return <NavbarZh />
  if (locale === "fr") return <Navbar />
  return <Navbar />
}

export function LegalShell({ kind }: { kind: LegalPageKind }) {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const { title, paragraphs } = getLegalPageContent(kind, locale)

  return (
    <div
      className="min-h-screen text-zinc-900"
      style={{
        background: "radial-gradient(40% 40% at 50% 20%, #f4f4f5 0%, #e4e4e7 45%, #d4d4d8 100%)",
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <NavbarForLocale locale={locale} />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{title}</h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}
