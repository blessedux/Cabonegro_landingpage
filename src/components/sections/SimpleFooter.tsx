'use client'

import { CaboFooter } from '@/components/ui/footer'

interface SimpleFooterProps {
  locale?: 'en' | 'es' | 'zh' | 'fr'
}

export function SimpleFooter({ locale = 'es' }: SimpleFooterProps) {
  return <CaboFooter locale={locale} />
}
