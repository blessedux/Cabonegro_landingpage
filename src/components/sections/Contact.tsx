'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Contact() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const searchParams = useSearchParams()
  
  // Read origin from query params (e.g., ?from=patagon-valley)
  const origin = searchParams.get('from') || undefined
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    interest: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // WhatsApp message based on locale
  const whatsappMessage = locale === 'es' 
    ? 'Hola%2C%20estoy%20interesado%20en%20adquirir%20terrenos%20o%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20inmobiliario%20de%20Cabo%20Negro.%20%C2%BFPodr%C3%ADan%20proporcionarme%20informaci%C3%B3n%20sobre%20lotes%20disponibles%2C%20parcelas%20industriales%20y%20oportunidades%20de%20desarrollo%3F%20Gracias.'
    : locale === 'en'
    ? 'Hello%2C%20I%27m%20interested%20in%20acquiring%20land%20or%20scheduling%20a%20meeting%20with%20the%20Cabo%20Negro%20real%20estate%20team.%20Could%20you%20please%20provide%20me%20with%20information%20about%20available%20lots%2C%20industrial%20parcels%2C%20and%20development%20opportunities%3F%20Thank%20you.'
    : locale === 'fr'
    ? 'Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20l%27acquisition%20de%20terrains%20ou%20la%20planification%20d%27une%20r%C3%A9union%20avec%20l%27%C3%A9quipe%20immobili%C3%A8re%20de%20Cabo%20Negro.%20Pourriez-vous%20me%20fournir%20des%20informations%20sur%20les%20parcelles%20disponibles%2C%20les%20parcelles%20industrielles%20et%20les%20opportunit%C3%A9s%20de%20d%C3%A9veloppement%20%3F%20Merci.'
    : locale === 'zh'
    ? '%E4%BD%A0%E5%A5%BD%2C%20%E6%88%91%E6%84%9F%E5%85%B4%E8%B6%A3%E4%BA%8E%E8%B4%AD%E4%B9%B0%E5%9C%9F%E5%9C%B0%E6%88%96%E5%AE%89%E6%8E%92%E4%B8%8E%E5%8D%A1%E6%B3%A2%E5%86%85%E6%A0%BC%E7%BD%97%E4%B8%8D%E5%8A%A8%E4%BA%A7%E5%9B%A2%E9%98%9F%E7%9A%84%E4%BC%9A%E8%AE%AE%E3%80%82%E8%83%BD%E5%90%A6%E6%8F%90%E4%BE%9B%E6%9C%89%E5%85%B3%E5%8F%AF%E7%94%A8%E5%9C%B0%E5%9D%97%E3%80%81%E5%B7%A5%E4%B8%9A%E5%9C%B0%E5%9D%97%E5%92%8C%E5%BC%80%E5%8F%91%E6%9C%BA%E4%BC%9A%E7%9A%84%E4%BF%A1%E6%81%AF%EF%BC%9F%E8%B0%A2%E8%B0%A2%E3%80%82'
    : 'Hola%2C%20estoy%20interesado%20en%20adquirir%20terrenos%20o%20programar%20una%20reuni%C3%B3n%20con%20el%20equipo%20inmobiliario%20de%20Cabo%20Negro.%20%C2%BFPodr%C3%ADan%20proporcionarme%20informaci%C3%B3n%20sobre%20lotes%20disponibles%2C%20parcelas%20industriales%20y%20oportunidades%20de%20desarrollo%3F%20Gracias.'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      // Send form data to API with origin information
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          origin, // Include origin from query params
        }),
      })

      // Parse response - handle both JSON and non-JSON responses
      let data: any
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          data = await response.json()
        } else {
          const text = await response.text()
          // Try to parse as JSON if it looks like JSON
          try {
            data = JSON.parse(text)
          } catch {
            // If not JSON, create error object
            data = { error: text || t('errorMessage') }
          }
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error(t('errorMessage'))
      }

      if (!response.ok) {
        // Always log error details in development
        console.error('Contact form API error:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        })
        
        // In development, log the full error details
        if (data.details) {
          console.error('Contact form API error details:', data.details)
        }
        if (data.debug) {
          console.error('Contact form API debug info:', data.debug)
        }
        
        throw new Error(data.error || t('errorMessage'))
      }

      // Success - reset form and show success message
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        interest: 'general'
      })
      setSubmitStatus('success')
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : t('errorMessage'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear status messages after 5 seconds
  useEffect(() => {
    if (submitStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle')
        setErrorMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [submitStatus])

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="pt-20 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('title')}
            </h1>
            <p className="text-white text-lg max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-100">{t('successMessage')}</p>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-100">{errorMessage || t('errorMessage')}</p>
            </div>
          )}

          {/* Contact Form */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">{t('sendMessage')}</h2>
              {origin && (
                <p className="text-sm text-white/70 mb-4">
                  {locale === 'es' && 'Origen: '}
                  {locale === 'en' && 'Source: '}
                  {locale === 'fr' && 'Source: '}
                  {locale === 'zh' && '来源: '}
                  {origin === 'patagon-valley' && (locale === 'es' ? 'Patagon Valley' : locale === 'zh' ? '巴塔哥尼亚谷' : 'Patagon Valley')}
                  {origin === 'terminal-maritimo' && (locale === 'es' ? 'Terminal Marítimo' : locale === 'zh' ? '海上码头' : 'Maritime Terminal')}
                  {origin === 'parque-logistico' && (locale === 'es' ? 'Parque Logístico' : locale === 'zh' ? '物流园区' : 'Logistics Park')}
                  {origin === 'macro-lote' && (locale === 'es' ? 'Parque Logístico (Macro Lote)' : locale === 'zh' ? '物流园区（大地块）' : 'Logistics Park (Macro Lot)')}
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                        {t('form.fullName')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/60"
                        placeholder={t('form.placeholders.fullName')}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                        {t('form.email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/60"
                        placeholder={t('form.placeholders.email')}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2 text-white">
                        {t('form.company')}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/60"
                        placeholder={t('form.placeholders.company')}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2 text-white">
                        {t('form.phone')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/60"
                        placeholder={t('form.placeholders.phone')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium mb-2 text-white">
                      {t('form.areaOfInterest')}
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white"
                      style={{ color: 'white' }}
                    >
                      <option value="general" style={{ background: '#030526', color: 'white' }}>{t('form.interests.general')}</option>
                      <option value="investment" style={{ background: '#030526', color: 'white' }}>{t('form.interests.investment')}</option>
                      <option value="joint-venture" style={{ background: '#030526', color: 'white' }}>{t('form.interests.joint-venture')}</option>
                      <option value="technical" style={{ background: '#030526', color: 'white' }}>{t('form.interests.technical')}</option>
                      <option value="media" style={{ background: '#030526', color: 'white' }}>{t('form.interests.media')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
                      {t('form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors resize-none text-white placeholder:text-white/60"
                      placeholder={t('form.placeholders.message')}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('form.sending')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        {t('form.send')}
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
