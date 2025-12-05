import { NextRequest, NextResponse } from 'next/server'
import emailjs from '@emailjs/nodejs'

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
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '' // Required for strict mode

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

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
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

    // Check if private key is needed (for strict mode)
    if (!EMAILJS_PRIVATE_KEY) {
      console.warn('⚠️  EMAILJS_PRIVATE_KEY not set. If EmailJS is in strict mode, emails will fail.')
      console.warn('   Get your private key from: https://dashboard.emailjs.com/admin/account/security')
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
Este mensaje fue enviado desde el formulario de contacto de www.cabonegro.cl
      `.trim(),
    }

    // ADMIN: Send email using EmailJS Node.js SDK
    // RECEIVER: The email will be delivered to the address in to_email parameter
    // Note: You must enable "Allow EmailJS API for non-browser applications" in EmailJS dashboard
    // Go to: https://dashboard.emailjs.com/admin -> Account -> Security
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending EmailJS request:', {
        serviceId: EMAILJS_SERVICE_ID ? 'SET' : 'MISSING',
        templateId: EMAILJS_TEMPLATE_ID ? 'SET' : 'MISSING',
        publicKey: EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING',
        receiverEmail,
        templateParamsKeys: Object.keys(templateParams),
      })
    }
    
    try {
      // Initialize EmailJS with public key and private key (if available)
      // Note: init() can be called multiple times safely
      // Private key is required when EmailJS is in "strict mode"
      const initConfig: { publicKey: string; privateKey?: string } = {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
      
      if (EMAILJS_PRIVATE_KEY) {
        initConfig.privateKey = EMAILJS_PRIVATE_KEY
      }
      
      emailjs.init(initConfig)

      // Log the request being sent (in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('EmailJS sending email with params:', {
          serviceId: EMAILJS_SERVICE_ID,
          templateId: EMAILJS_TEMPLATE_ID,
          publicKey: EMAILJS_PUBLIC_KEY.substring(0, 10) + '...',
          templateParamsCount: Object.keys(templateParams).length,
        })
      }

      // Send email using EmailJS SDK
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )

      // Log successful submission (for admin tracking)
      if (process.env.NODE_ENV === 'development') {
        console.log('EmailJS response:', response)
      }
      console.log(`Contact form submitted successfully. Receiver: ${receiverEmail}, Origin: ${body.origin || 'general'}`)

      return NextResponse.json(
        { 
          success: true, 
          message: 'Your message has been sent successfully!',
        },
        { status: 200 }
      )
    } catch (emailjsError: any) {
      // Handle EmailJS errors - log the full error object for debugging
      console.error('EmailJS error (full object):', JSON.stringify(emailjsError, null, 2))
      console.error('EmailJS error (raw):', emailjsError)
      
      // Extract error information from various possible formats
      const errorMessage = emailjsError instanceof Error 
        ? emailjsError.message 
        : emailjsError?.message || String(emailjsError)
      const errorText = emailjsError?.text || emailjsError?.response?.text || ''
      const errorStatus = emailjsError?.status || emailjsError?.response?.status || 'UNKNOWN'
      const errorCode = emailjsError?.code || emailjsError?.response?.code
      
      const errorDetails = {
        error: errorMessage,
        status: errorStatus,
        code: errorCode,
        text: errorText,
        fullError: emailjsError,
        serviceId: EMAILJS_SERVICE_ID ? 'SET' : 'MISSING',
        templateId: EMAILJS_TEMPLATE_ID ? 'SET' : 'MISSING',
        publicKey: EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING',
        privateKey: EMAILJS_PRIVATE_KEY ? 'SET' : 'MISSING',
      }
      console.error('EmailJS error (parsed):', errorDetails)
      
      // Check if it's the "private key required" error (strict mode)
      const isPrivateKeyError = 
        errorText.includes('private key') ||
        errorText.includes('strict mode') ||
        (errorStatus === 403 && errorText.includes('private key'))
      
      // Check if it's the "non-browser applications" error
      const isNonBrowserError = 
        errorMessage.includes('non-browser') || 
        errorText.includes('non-browser') ||
        (errorStatus === 403 && !isPrivateKeyError && errorText.includes('disabled'))
      
      if (isNonBrowserError) {
        console.error('')
        console.error('⚠️  ============================================')
        console.error('⚠️  EmailJS server-side API is DISABLED or NOT YET PROPAGATED')
        console.error('⚠️  ============================================')
        console.error('')
        console.error('Error Status:', errorStatus)
        console.error('Error Message:', errorMessage)
        console.error('Error Text:', errorText)
        console.error('')
        console.error('To fix this issue:')
        console.error('')
        console.error('1. Go to: https://dashboard.emailjs.com/admin')
        console.error('2. Navigate to: Account → Security')
        console.error('3. Verify "Allow EmailJS API for non-browser applications" is ENABLED')
        console.error('4. If it was just enabled, wait 1-2 minutes for propagation')
        console.error('5. Try logging out and back into EmailJS dashboard')
        console.error('6. Clear your browser cache and try again')
        console.error('7. Try submitting the form again')
        console.error('')
        console.error('If the setting is already enabled, it may take a few minutes to propagate.')
        console.error('')
      } else if (errorStatus === 400 || errorMessage.includes('Bad Request')) {
        console.error('')
        console.error('⚠️  EmailJS Bad Request - Possible issues:')
        console.error('   - Template parameters don\'t match your EmailJS template')
        console.error('   - Service ID or Template ID is incorrect')
        console.error('   - Missing required template parameters')
        console.error('')
      } else if (errorStatus === 401 || errorMessage.includes('Unauthorized')) {
        console.error('')
        console.error('⚠️  EmailJS Unauthorized - Check your Public Key:')
        console.error('   - Verify EMAILJS_PUBLIC_KEY in your .env.local file')
        console.error('   - Get your Public Key from: https://dashboard.emailjs.com/admin')
        console.error('')
      } else if (errorStatus === 404 || errorMessage.includes('Not Found')) {
        console.error('')
        console.error('⚠️  EmailJS Not Found - Check your IDs:')
        console.error('   - Verify EMAILJS_SERVICE_ID matches your service')
        console.error('   - Verify EMAILJS_TEMPLATE_ID matches your template')
        console.error('   - Check: https://dashboard.emailjs.com/admin')
        console.error('')
      } else if (errorStatus === 429 || errorMessage.includes('rate limit')) {
        console.error('')
        console.error('⚠️  EmailJS Rate Limit Exceeded:')
        console.error('   - Free tier: 200 emails/month')
        console.error('   - Wait a moment and try again')
        console.error('   - Or upgrade your EmailJS plan')
        console.error('')
      }
      
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      // Provide more helpful error message based on error type
      let userFriendlyError = 'Failed to send email. Please try again later.'
      if (isPrivateKeyError) {
        userFriendlyError = 'Email service requires additional configuration. Please contact support.'
      } else if (isNonBrowserError) {
        userFriendlyError = 'Email service configuration issue. Please contact support or try again in a few minutes.'
      } else if (errorStatus === 400) {
        userFriendlyError = 'Invalid email configuration. Please contact support.'
      } else if (errorStatus === 401) {
        userFriendlyError = 'Email service authentication failed. Please contact support.'
      } else if (errorStatus === 404) {
        userFriendlyError = 'Email service not found. Please contact support.'
      } else if (errorStatus === 429) {
        userFriendlyError = 'Email service rate limit exceeded. Please try again later.'
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          ...(isDevelopment && { 
            details: errorDetails,
            debug: {
              status: errorStatus,
              message: errorMessage,
              text: errorText,
            }
          })
        },
        { status: 500 }
      )
    }

  } catch (error) {
    // Handle JSON parsing errors or other unexpected errors
    console.error('Contact form error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
