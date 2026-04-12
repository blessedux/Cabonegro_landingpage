export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
] as const

export const NAVBAR_TEXTS = {
  en: {
    maritimeTerminal: 'Maritime Terminal',
    technologyPark: 'Technology Park',
    logisticsPark: 'Logistics Park',
    faq: 'FAQ',
    contactUs: 'Contact Us',
    language: 'Language:'
  },
  es: {
    maritimeTerminal: 'Terminal Marítimo',
    technologyPark: 'Parque Tecnológico',
    logisticsPark: 'Parque Logístico',
    faq: 'FAQ',
    contactUs: 'Contáctanos',
    language: 'Idioma:'
  },
  zh: {
    maritimeTerminal: '海运码头',
    technologyPark: '科技园',
    logisticsPark: '物流园',
    faq: '常见问题',
    contactUs: '联系我们',
    language: '语言:'
  },
  fr: {
    maritimeTerminal: 'Terminal Maritime',
    technologyPark: 'Parc Technologique',
    logisticsPark: 'Parc Logistique',
    faq: 'FAQ',
    contactUs: 'Nous Contacter',
    language: 'Langue:'
  }
} as const

export type Locale = 'en' | 'es' | 'zh' | 'fr'
