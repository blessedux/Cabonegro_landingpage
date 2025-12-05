import { NextRequest, NextResponse } from 'next/server'

// RECEIVER: This is the email address that will receive contact form submissions
// Default: ventas@cabonegro.cl (can be overridden via CONTACT_EMAIL_DEFAULT env var)
// Can be overridden based on origin (from query param)
const DEFAULT_RECEIVER_EMAIL = process.env.CONTACT_EMAIL_DEFAULT || 'ventas@cabonegro.cl'

// Email mapping based on origin (from query param)
// ADMIN: Configure different receiver emails for different project origins
const ORIGIN_EMAIL_MAP: Record<string, string> = {
  'patagon-valley': process.env.CONTACT_EMAIL_PATAGON_VALLEY || DEFAULT_RECEIVER_EMAIL,
  'terminal-maritimo': process.env.CONTACT_EMAIL_TERMINAL || DEFAULT_RECEIVER_EMAIL,
  'parque-logistico': process.env.CONTACT_EMAIL_PARQUE_LOGISTICO || DEFAULT_RECEIVER_EMAIL,
  'macro-lote': process.env.CONTACT_EMAIL_MACRO_LOTE || DEFAULT_RECEIVER_EMAIL,
}

// ADMIN: EmailJS configuration
// Get these from https://dashboard.emailjs.com/admin
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || ''

interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  interest: string
  origin?: string // Source of the contact form (from query param)
}

/**
 * Determines the receiver email based on the origin
 * ADMIN: This function routes emails to different addresses based on where the form was submitted from
 */
function getReceiverEmail(origin?: string): string {
  if (!origin) {
    return DEFAULT_RECEIVER_EMAIL
  }
  
  // Normalize origin to lowercase
  const normalizedOrigin = origin.toLowerCase()
  
  // Return mapped email or default
  return ORIGIN_EMAIL_MAP[normalizedOrigin] || DEFAULT_RECEIVER_EMAIL
}

/**
 * Formats the origin name for display in email
 */
function formatOriginName(origin?: string): string {
  if (!origin) return 'General'
  
  const originMap: Record<string, string> = {
    'patagon-valley': 'Patagon Valley',
    'terminal-maritimo': 'Terminal Marítimo',
    'parque-logistico': 'Parque Logístico',
    'macro-lote': 'Parque Logístico (Macro Lote)',
  }
  
  return originMap[origin.toLowerCase()] || origin
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY environment variables.')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // ADMIN: Determine who receives this email based on origin
    const receiverEmail = getReceiverEmail(body.origin)
    
    // Format origin info for email
    const originName = formatOriginName(body.origin)
    const originInfo = body.origin ? `\n\n📍 Origen del contacto: ${originName}` : ''
    
    const companyInfo = body.company ? `\n🏢 Empresa: ${body.company}` : ''
    const phoneInfo = body.phone ? `\n📞 Teléfono: ${body.phone}` : ''
    const interestInfo = body.interest && body.interest !== 'general' 
      ? `\n🎯 Área de interés: ${body.interest}` 
      : ''

    // Prepare email template parameters for EmailJS
    // ADMIN: These parameters will be used in your EmailJS template
    const templateParams = {
      to_email: receiverEmail, // RECEIVER: The email address that receives the contact form
      from_name: body.name,
      from_email: body.email,
      reply_to: body.email, // Allows replying directly to the sender
      subject: `Nuevo contacto desde Cabo Negro${body.origin ? ` - ${originName}` : ''}`,
      message: body.message,
      company: body.company || '',
      phone: body.phone || '',
      interest: body.interest || 'general',
      origin: originName,
      origin_info: originInfo,
      company_info: companyInfo,
      phone_info: phoneInfo,
      interest_info: interestInfo,
      // Full formatted message for email body
      formatted_message: `
Nuevo mensaje de contacto desde el sitio web de Cabo Negro

👤 Nombre: ${body.name}
📧 Email: ${body.email}${companyInfo}${phoneInfo}${interestInfo}${originInfo}

💬 Mensaje:
${body.message}

---
Este mensaje fue enviado desde el formulario de contacto de cabonegro.com
      `.trim(),
    }

    // ADMIN: Send email using EmailJS REST API
    // RECEIVER: The email will be delivered to the address in to_email parameter
    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`
    
    const emailjsResponse = await fetch(emailjsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    })

    if (!emailjsResponse.ok) {
      const errorData = await emailjsResponse.text()
      console.error('EmailJS error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      )
    }

    // Log successful submission (for admin tracking)
    console.log(`Contact form submitted successfully. Receiver: ${receiverEmail}, Origin: ${body.origin || 'general'}`)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully!',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
