'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { routing } from '@/i18n/routing'
import { buildLocaleHref } from '@/lib/navigation-path'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import { warmAlternateLocalesForPath } from '@/lib/prefetch-alternate-locales-client'
import { EXPLORE_UI_Z } from '@/lib/cesium/exploreUiLayers'
import type { Waypoint } from '@/lib/cesium/waypoints'

function getLabel(wp: Waypoint, locale: string): string {
  switch (locale) {
    case 'es':
      return wp.labelEs
    case 'zh':
      return wp.labelZh
    case 'fr':
      return wp.labelFr
    default:
      return wp.labelEn
  }
}

const LOCALE_LABELS: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'Explore', subtitle: 'Choose a location — the camera flies to the pin' },
  es: { title: 'Explorar', subtitle: 'Elige un lugar — la cámara vuela al punto' },
  zh: { title: '探索', subtitle: '选择地点 — 相机飞向该航点' },
  fr: { title: 'Explorer', subtitle: 'Choisissez un lieu — la caméra vole vers le point' },
}

const COMPASS_HINTS: Record<string, string> = {
  en: 'One finger: pan · Two fingers: rotate & tilt · Pinch: zoom · Desktop: left-drag pan, right-drag look, scroll menu for waypoints',
  es: 'Un dedo: desplazar · Dos dedos: girar e inclinar · Pellizco: zoom',
  zh: '单指：平移 · 双指：旋转与俯仰 · 双指捏合：缩放',
  fr: 'Un doigt : panoramique · Deux doigts : rotation & inclinaison · Pincement : zoom',
}

const LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

const LANGUAGE_SECTION_TITLE: Record<string, string> = {
  en: 'Language',
  es: 'Idioma',
  zh: '语言',
  fr: 'Langue',
}

type ExplorerMobileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  waypoints: Waypoint[]
  activeWaypoint: Waypoint | null
  isFlying: boolean
  locale: string
  onSelectWaypoint: (waypoint: Waypoint) => void
  onBackToSite: () => void
  backAriaLabel: string
}

export default function ExplorerMobileDrawer({
  open,
  onOpenChange,
  waypoints,
  activeWaypoint,
  isFlying,
  locale,
  onSelectWaypoint,
  onBackToSite,
  backAriaLabel,
}: ExplorerMobileDrawerProps) {
  const labels = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en
  const compassHint = COMPASS_HINTS[locale] ?? COMPASS_HINTS.en
  const languageSectionTitle = LANGUAGE_SECTION_TITLE[locale] ?? LANGUAGE_SECTION_TITLE.en
  const pathname = usePathname()
  const router = useRouter()
  const activeLocale = useLocale()
  const { push } = useNavigateWithPreloader()

  useEffect(() => {
    if (!open) return
    warmAlternateLocalesForPath(pathname, router, { forceHeavy: true })
  }, [open, pathname, router])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  const changeLanguage = (code: string) => {
    if (code === activeLocale || !(routing.locales as readonly string[]).includes(code)) return
    const targetPath = buildLocaleHref(code, pathname)
    router.prefetch(targetPath)
    onOpenChange(false)
    push(targetPath, { languageSwitch: true })
  }

  const [bodyMount, setBodyMount] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setBodyMount(document.body)
  }, [])

  const sheet = (
    <AnimatePresence mode="sync">
      {open ? (
        <>
          <motion.button
            key="explore-m-backdrop"
            type="button"
            aria-label="Close menu"
            className={`fixed inset-0 ${EXPLORE_UI_Z.mobileDrawerBackdrop} bg-black/55 backdrop-blur-sm md:hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="explore-m-panel"
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            className={`fixed inset-y-0 left-0 ${EXPLORE_UI_Z.mobileDrawerPanel} flex w-full max-w-md flex-col md:hidden`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              background: 'rgba(10, 15, 26, 0.97)',
              boxShadow: '8px 0 48px rgba(0,0,0,0.55)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  onBackToSite()
                  onOpenChange(false)
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 active:bg-white/10"
                aria-label={backAriaLabel}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Cabo Negro</p>
                <h2 className="text-white text-lg font-medium tracking-wide">{labels.title}</h2>
                <p className="text-white/45 text-xs mt-1 leading-snug max-w-[240px]">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80"
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {waypoints.map((wp) => {
                const isActive = activeWaypoint?.id === wp.id
                return (
                  <button
                    type="button"
                    key={wp.id}
                    onClick={() => {
                      onSelectWaypoint(wp)
                      onOpenChange(false)
                    }}
                    className={[
                      'w-full text-left px-5 py-4 transition-colors duration-200 flex items-center gap-3 border-b border-white/5',
                      isActive ? 'bg-white/12 text-white' : 'text-white/65 active:bg-white/8',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-2 h-2 rounded-full flex-shrink-0',
                        isActive ? 'bg-cyan-300 scale-110' : 'bg-white/35',
                      ].join(' ')}
                    />
                    <span className="text-[15px] font-light leading-tight">{getLabel(wp, locale)}</span>
                  </button>
                )
              })}
            </nav>

            {isFlying ? (
              <div className="border-t border-white/10 px-5 py-3 flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                <span className="text-white/40 text-[11px]">Scene…</span>
              </div>
            ) : null}

            <div className="border-t border-white/10 px-5 py-4 shrink-0">
              <p className="text-white/35 text-[11px] leading-relaxed">{compassHint}</p>
            </div>

            <div className="border-t border-white/10 px-5 py-4 shrink-0">
              <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-3">{languageSectionTitle}</p>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => {
                  const active = lang.code === activeLocale
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      className={[
                        'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 px-1 text-[11px] transition-colors min-h-[72px]',
                        active
                          ? 'border-cyan-400/50 bg-white/12 text-white'
                          : 'border-white/10 bg-white/[0.04] text-white/70 active:bg-white/10',
                      ].join(' ')}
                      aria-pressed={active}
                      aria-label={lang.name}
                    >
                      <span className="text-xl leading-none" aria-hidden>
                        {lang.flag}
                      </span>
                      <span className="font-medium tracking-wide uppercase text-[10px] opacity-90">
                        {lang.code}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-white/10 px-5 py-5 shrink-0">
              <p className="text-center text-white/45 text-[13px] font-medium tracking-[0.35em] uppercase">
                Cabonegro
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )

  if (!bodyMount) return null
  return createPortal(sheet, bodyMount)
}
