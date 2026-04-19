/** Copy for explore InfoPanel cards: short lead + expanded investor context. */

export type ExploreLocale = 'en' | 'es' | 'zh' | 'fr'

export type ExploreCardLocaleText = {
  summary: string
  detail: string
}

export type ExploreCardLocales = Record<ExploreLocale, ExploreCardLocaleText>

export function normalizeExploreLocale(locale: string): ExploreLocale {
  if (locale === 'es' || locale === 'zh' || locale === 'fr') return locale
  return 'en'
}

export function pickExploreCard(loc: ExploreCardLocales, locale: string): ExploreCardLocaleText {
  const key = normalizeExploreLocale(locale)
  return loc[key] ?? loc.en
}
