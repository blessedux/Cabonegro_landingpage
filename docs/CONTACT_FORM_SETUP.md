# Contact Form Email Setup (EmailJS)

This document explains how the contact form email system works and how to configure it using EmailJS.

## Overview

The contact form sends emails using **EmailJS**, a free email service that doesn't require domain verification or DNS configuration. Perfect for domains managed by Wix DNS or any other hosting provider.

**Benefits:**

- ✅ **Free tier**: 200 emails/month (perfect for contact forms)
- ✅ **No domain verification required**: Works with Wix DNS, any DNS provider
- ✅ **No DNS configuration needed**: Set up in minutes
- ✅ **Simple API**: Easy to integrate
- ✅ **Cost-effective**: Free tier is sufficient for most contact forms

## Architecture

### API Route: `/api/contact`

**Location**: `src/app/api/contact/route.ts`

**Responsibilities**:

- Receives form submissions from the Contact component
- Determines the receiver email based on origin (query param)
- Sends formatted email using EmailJS REST API
- Returns success/error responses

**Key Functions**:

- `getReceiverEmail(origin)`: Determines which email address should receive the submission
- `formatOriginName(origin)`: Formats the origin name for display in email

### Contact Component

**Location**: `src/components/sections/Contact.tsx`

**Features**:

- Reads `?from=` query parameter from URL
- Sends form data to API with origin information
- Displays success/error messages
- Handles form validation and submission states

## Setup Instructions

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (no credit card required)
3. Verify your email address

### Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (recommended for simplicity) or any other email provider
4. Follow the setup instructions:
   - For Gmail: You'll need to enable "Less secure app access" or use an App Password
   - The service will be connected to your email account

### Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

**Template Name**: `Contact Form - Cabo Negro`

**Subject**: `Nuevo contacto desde Cabo Negro - {{origin}}`

**Content** (HTML):

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #0e19ae;">Nuevo mensaje de contacto</h2>
  <p><strong>Nombre:</strong> {{from_name}}</p>
  <p>
    <strong>Email:</strong> <a href="mailto:{{from_email}}">{{from_email}}</a>
  </p>
  {{#company}}
  <p><strong>Empresa:</strong> {{company}}</p>
  {{/company}} {{#phone}}
  <p><strong>Teléfono:</strong> {{phone}}</p>
  {{/phone}} {{#interest}}
  <p><strong>Área de interés:</strong> {{interest}}</p>
  {{/interest}} {{#origin}}
  <p><strong>Origen:</strong> {{origin}}</p>
  {{/origin}}
  <div
    style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;"
  >
    <p><strong>Mensaje:</strong></p>
    <p style="white-space: pre-wrap;">{{message}}</p>
  </div>
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
  <p style="color: #666; font-size: 12px;">
    Este mensaje fue enviado desde el formulario de contacto de
    <a href="https://cabonegro.com">cabonegro.com</a>
  </p>
</div>
```

**To Email**: `{{to_email}}` (this will be set dynamically by the API)

**From Name**: `{{from_name}}`

**From Email**: `{{from_email}}`

**Reply To**: `{{reply_to}}`

4. Save the template and note the **Template ID**

### Step 4: Get Your API Keys

1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (User ID)
3. Note your **Service ID** (from Step 2)
4. Note your **Template ID** (from Step 3)

### Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# EmailJS Configuration
# Get these from: https://dashboard.emailjs.com/admin
EMAILJS_SERVICE_ID=service_xxxxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxx

# Optional: Default receiver email
# Defaults to: ventas@cabonegro.cl
CONTACT_EMAIL_DEFAULT=ventas@cabonegro.cl

# Optional: Origin-specific receiver emails
# If not set, uses the default email above
CONTACT_EMAIL_PATAGON_VALLEY=ventas@cabonegro.cl
CONTACT_EMAIL_TERMINAL=ventas@cabonegro.cl
CONTACT_EMAIL_PARQUE_LOGISTICO=ventas@cabonegro.cl
CONTACT_EMAIL_MACRO_LOTE=ventas@cabonegro.cl
```

### Step 6: Test the Form

1. Start the development server: `npm run dev`
2. Navigate to `/contact` or `/{locale}/contact`
3. Try submitting with different origins:
   - `/contact?from=patagon-valley`
   - `/contact?from=terminal-maritimo`
   - `/contact?from=parque-logistico`
   - `/contact?from=macro-lote`
   - `/contact` (no origin)

## Email Routing

The system routes emails based on the `?from=` query parameter:

| Origin Value        | Default Email         | Can be overridden with           |
| ------------------- | --------------------- | -------------------------------- |
| `patagon-valley`    | `ventas@cabonegro.cl` | `CONTACT_EMAIL_PATAGON_VALLEY`   |
| `terminal-maritimo` | `ventas@cabonegro.cl` | `CONTACT_EMAIL_TERMINAL`         |
| `parque-logistico`  | `ventas@cabonegro.cl` | `CONTACT_EMAIL_PARQUE_LOGISTICO` |
| `macro-lote`        | `ventas@cabonegro.cl` | `CONTACT_EMAIL_MACRO_LOTE`       |
| No origin / General | `ventas@cabonegro.cl` | `CONTACT_EMAIL_DEFAULT`          |

## Email Template Variables

The following variables are available in your EmailJS template:

- `{{to_email}}` - The receiver email address (set dynamically)
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{reply_to}}` - Reply-to email (same as from_email)
- `{{subject}}` - Email subject
- `{{message}}` - The message content
- `{{company}}` - Company name (if provided)
- `{{phone}}` - Phone number (if provided)
- `{{interest}}` - Area of interest
- `{{origin}}` - Origin/source of the contact
- `{{formatted_message}}` - Full formatted message

## Code Documentation

The code includes clear comments indicating:

- **ADMIN**: Configuration for the email service administrator
- **RECEIVER**: The email address that receives the contact form submissions

Example from `route.ts`:

```typescript
// ADMIN: EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";

// RECEIVER: This is the email address that will receive contact form submissions
const DEFAULT_RECEIVER_EMAIL =
  process.env.CONTACT_EMAIL_DEFAULT || "ventas@cabonegro.cl";
```

## Pricing

**Free Tier:**

- 200 emails/month
- Perfect for contact forms
- No credit card required

**Paid Plans:**

- If you need more than 200 emails/month, plans start at $15/month for 1,000 emails
- Still much cheaper than Resend

## Troubleshooting

### Emails not sending

1. Check that all EmailJS environment variables are set correctly
2. Verify your EmailJS service is connected and active
3. Check that the template ID matches your EmailJS template
4. Check server logs for error messages
5. Verify the API route is accessible (check network tab in browser)

### Wrong email receiving submissions

1. Check environment variables are loaded correctly
2. Verify the origin mapping in `ORIGIN_EMAIL_MAP`
3. Check that the query parameter is being passed correctly
4. Verify the `to_email` parameter in your EmailJS template

### Form not submitting

1. Check browser console for errors
2. Verify the API route exists at `/api/contact`
3. Check network tab to see the request/response
4. Verify EmailJS credentials are correct

### Gmail "Less secure app" error

If using Gmail, you may need to:

1. Enable 2-factor authentication
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the App Password instead of your regular password in EmailJS service setup

## Security Notes

- Never commit `.env.local` to version control
- The EmailJS Public Key is safe to expose (it's designed to be public)
- Email addresses in the code are defaults and can be overridden via environment variables
- The form includes basic validation but server-side validation is also performed

## Advantages Over Resend

✅ **No domain verification** - Works with Wix DNS, any DNS provider  
✅ **Free tier** - 200 emails/month free (vs Resend's limited free tier)  
✅ **No DNS configuration** - Set up in minutes  
✅ **Cost-effective** - Much cheaper than Resend for higher volumes  
✅ **Simple setup** - No need to verify domains or configure DNS records
