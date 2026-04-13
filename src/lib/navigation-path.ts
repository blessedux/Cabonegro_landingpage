/**
 * Path helpers for App Router navigation + transition overlay.
 * `router.push` to the same pathname does not update `usePathname()`, which left the preloader stuck.
 */

import { routing } from '@/i18n/routing'

export function normalizePathname(path: string): string {
  if (!path || path === '') return '/'
  let p = path.split('#')[0].split('?')[0] || '/'
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1)
  }
  return p || '/'
}

export function pathnameFromHref(href: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  try {
    const u = new URL(href, base)
    return normalizePathname(u.pathname)
  } catch {
    return normalizePathname(href.split('#')[0].split('?')[0])
  }
}

/** True if `href` targets the same route pathname as the current segment (locale-aware paths included). */
export function pathsMatch(currentPathname: string, href: string): boolean {
  return normalizePathname(currentPathname) === pathnameFromHref(href)
}

/** Path after locale prefix, e.g. `/en/contact` → `/contact`, `/en` → `` */
export function stripLocalePrefix(pathname: string): string {
  const n = normalizePathname(pathname)
  for (const loc of routing.locales) {
    if (n === `/${loc}`) return ''
    if (n.startsWith(`/${loc}/`)) return n.slice(`/${loc}`.length)
  }
  return n
}

export function localeFromPathname(pathname: string): string | null {
  const n = normalizePathname(pathname)
  const seg = n.split('/').filter(Boolean)[0]
  if (seg && (routing.locales as readonly string[]).includes(seg)) return seg
  return null
}

/** `/es/foo` from current path `/en/foo` */
export function buildLocaleHref(targetLocale: string, pathname: string): string {
  const rest = stripLocalePrefix(pathname)
  return `/${targetLocale}${rest}`
}

export function isLocaleHomePath(pathname: string): boolean {
  return stripLocalePrefix(pathname) === ''
}
