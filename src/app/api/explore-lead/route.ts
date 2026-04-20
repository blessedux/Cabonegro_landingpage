import { NextRequest, NextResponse } from 'next/server'
import emailjs from '@emailjs/nodejs'

const DEFAULT_RECEIVER_EMAIL = process.env.CONTACT_EMAIL_DEFAULT || 'ventas@cabonegro.cl'

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || ''
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || ''

const EXPLORE_LEAD_ERROR_CODES = {
  EMAIL_SERVICE_NOT_CONFIGURED: 'EMAIL_SERVICE_NOT_CONFIGURED',
} as const

interface ExploreLeadBody {
  context?: { label?: string; subline?: string; tone?: string; locale?: string }
  email: string
  message: string
  page?: string
  ts?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(request: NextRequest) {
  try {
    const body: ExploreLeadBody = await request.json()
    const email = body.email?.trim() ?? ''
    const message = body.message?.trim() ?? ''
    const ctx = body.context

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error(
        '[explore-lead] EmailJS not configured (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY)',
      )
      return NextResponse.json(
        {
          error:
            'Email delivery is not configured on the server. Please email ventas@cabonegro.cl directly or try again later.',
          code: EXPLORE_LEAD_ERROR_CODES.EMAIL_SERVICE_NOT_CONFIGURED,
        },
        { status: 503 },
      )
    }

    const label = ctx?.label?.trim() || 'Explore selection'
    const subline = ctx?.subline?.trim()
    const tone = ctx?.tone || 'unknown'
    const locale = ctx?.locale || 'en'
    const receiverEmail = process.env.CONTACT_EMAIL_EXPLORE || DEFAULT_RECEIVER_EMAIL

    const contextBlock = [
      `Map / explore inquiry`,
      `Context: ${label}`,
      subline ? `Detail: ${subline}` : null,
      `Tone: ${tone} · Locale: ${locale}`,
      body.page ? `Page: ${body.page}` : null,
      body.ts ? `Sent: ${body.ts}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const formattedMessage = `${contextBlock}

Message:
${message}

---
Sent from Cabo Negro explore experience (cabonegro.cl)
`.trim()

    const templateParams = {
      to_email: receiverEmail,
      from_name: `Explore — ${label}`,
      from_email: email,
      reply_to: email,
      subject: `Consulta explore — ${label}`,
      message,
      company: '',
      phone: '',
      interest: 'explore-map',
      origin: 'Explore map',
      origin_info: `\n\nOrigen: mapa interactivo Explore`,
      company_info: '',
      phone_info: '',
      interest_info: `\nÁrea: consulta desde mapa`,
      formatted_message: formattedMessage,
    }

    const initConfig: { publicKey: string; privateKey?: string } = { publicKey: EMAILJS_PUBLIC_KEY }
    if (EMAILJS_PRIVATE_KEY) initConfig.privateKey = EMAILJS_PRIVATE_KEY
    emailjs.init(initConfig)

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[explore-lead] sent ok → ${receiverEmail}, context: ${label}`)
    }

    return NextResponse.json(
      { success: true, message: 'Lead received.', deliveredTo: receiverEmail },
      { status: 200 },
    )
  } catch (err) {
    console.error('[explore-lead]', err)
    return NextResponse.json(
      {
        error:
          'We could not deliver your message. Check your connection and try again, or write to ventas@cabonegro.cl.',
        code: 'EMAIL_SEND_FAILED',
      },
      { status: 500 },
    )
  }
}
