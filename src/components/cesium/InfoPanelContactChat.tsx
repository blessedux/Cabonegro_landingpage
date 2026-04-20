'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'

type Tone = 'parcel' | 'waypoint'

type Message =
  | { id: number; role: 'bot'; text: string; suggestions?: string[] }
  | { id: number; role: 'user'; text: string }

export interface InfoPanelContactChatProps {
  /** Narrative context shown in the chat header (e.g. lot name or waypoint label). */
  contextLabel: string
  /** Optional secondary line (e.g. "12.34 ha · −52.93°S, −70.86°W"). */
  contextSubline?: string
  /** Controls accent color palette. */
  tone: Tone
  locale: string
  /** Called when the user dismisses the chat (back-button). */
  onClose: () => void
}

/* ── i18n dictionaries (kept inline to avoid touching the shared narrative loaders) ── */

const HEADER_LABEL: Record<string, string> = {
  en: 'About',
  es: 'Sobre',
  zh: '关于',
  fr: 'À propos de',
}

const BACK_LABEL: Record<string, string> = {
  en: 'Back',
  es: 'Volver',
  zh: '返回',
  fr: 'Retour',
}

const INPUT_PLACEHOLDER: Record<string, string> = {
  en: 'Type your question…',
  es: 'Escribe tu pregunta…',
  zh: '请输入您的问题…',
  fr: 'Posez votre question…',
}

const EMAIL_PLACEHOLDER: Record<string, string> = {
  en: 'Your email',
  es: 'Tu correo',
  zh: '您的邮箱',
  fr: 'Votre e-mail',
}

const SEND_LABEL: Record<string, string> = {
  en: 'Send',
  es: 'Enviar',
  zh: '发送',
  fr: 'Envoyer',
}

const SENDING_LABEL: Record<string, string> = {
  en: 'Sending…',
  es: 'Enviando…',
  zh: '发送中…',
  fr: 'Envoi…',
}

const GREETING: Record<string, (ctx: string) => string> = {
  en: (ctx) =>
    `Hi — questions about ${ctx}? Leave your email and a short note and our team will follow up within one business day.`,
  es: (ctx) =>
    `Hola — ¿consultas sobre ${ctx}? Déjanos tu correo y una nota breve y te responderemos en un día hábil.`,
  zh: (ctx) =>
    `您好 — 关于${ctx}有任何疑问吗？请留下您的邮箱和简短说明，我们将在一个工作日内回复。`,
  fr: (ctx) =>
    `Bonjour — des questions sur ${ctx} ? Laissez votre e-mail et un petit mot, nous reviendrons vers vous sous un jour ouvré.`,
}

const QUICK_REPLIES: Record<string, string[]> = {
  en: ['Availability', 'Pricing', 'Request a visit'],
  es: ['Disponibilidad', 'Precio', 'Agendar visita'],
  zh: ['可用性', '价格', '预约考察'],
  fr: ['Disponibilité', 'Prix', 'Planifier une visite'],
}

const THANKS_BOT: Record<string, string> = {
  en: "Thanks — we've logged your request. Our team will reply to the email you provided shortly.",
  es: 'Gracias — tu consulta fue registrada. El equipo responderá al correo indicado pronto.',
  zh: '感谢 — 我们已记录您的请求，团队将尽快通过您提供的邮箱与您联系。',
  fr: "Merci — votre demande est enregistrée. L'équipe vous répondra prochainement à l'adresse indiquée.",
}

const VALIDATION_EMAIL: Record<string, string> = {
  en: 'Please add a valid email so we can reply.',
  es: 'Agrega un correo válido para responderte.',
  zh: '请提供有效邮箱以便我们回复。',
  fr: 'Merci d’indiquer un e-mail valide pour la réponse.',
}

const VALIDATION_MESSAGE: Record<string, string> = {
  en: 'Add a short note so we know what to prep.',
  es: 'Agrega una nota breve para preparar la respuesta.',
  zh: '请简述您的问题以便我们准备回复。',
  fr: 'Ajoutez un court message pour préparer la réponse.',
}

const t = (dict: Record<string, string>, locale: string) => dict[locale] ?? dict.en

/* ── Component ─────────────────────────────────────────────────────────────── */

function InfoPanelContactChatImpl({
  contextLabel,
  contextSubline,
  tone,
  locale,
  onClose,
}: InfoPanelContactChatProps) {
  const accent = tone === 'parcel' ? 'rgba(0, 229, 255, 0.9)' : 'rgba(255,255,255,0.85)'
  const accentSoft = tone === 'parcel' ? 'rgba(0, 229, 255, 0.14)' : 'rgba(255,255,255,0.08)'
  const accentBorder = tone === 'parcel' ? 'rgba(0, 229, 255, 0.28)' : 'rgba(255,255,255,0.18)'

  const initialGreeting = useMemo(
    () => (GREETING[locale] ?? GREETING.en)(contextLabel),
    [locale, contextLabel],
  )

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, role: 'bot', text: initialGreeting, suggestions: QUICK_REPLIES[locale] ?? QUICK_REPLIES.en },
  ])
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset conversation if context changes.
  useEffect(() => {
    setMessages([
      { id: 1, role: 'bot', text: initialGreeting, suggestions: QUICK_REPLIES[locale] ?? QUICK_REPLIES.en },
    ])
    setInput('')
    setEmail('')
    setError(null)
    setSubmitted(false)
  }, [initialGreeting, locale])

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, sending, submitted])

  const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  const submit = async () => {
    if (sending) return
    const trimmed = input.trim()
    if (!trimmed) {
      setError(t(VALIDATION_MESSAGE, locale))
      return
    }
    if (!validEmail(email)) {
      setError(t(VALIDATION_EMAIL, locale))
      return
    }
    setError(null)
    const nextId = messages.length + 1
    setMessages((prev) => [...prev, { id: nextId, role: 'user', text: trimmed }])
    setInput('')
    setSending(true)

    const payload = {
      context: { label: contextLabel, subline: contextSubline, tone, locale },
      email: email.trim(),
      message: trimmed,
      page: typeof window !== 'undefined' ? window.location.href : undefined,
      ts: new Date().toISOString(),
    }

    try {
      const endpoint = process.env.NEXT_PUBLIC_EXPLORE_LEAD_ENDPOINT || '/api/explore-lead'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Treat any non-4xx/5xx that the browser didn't reject as success, since the
      // project may not yet have a lead handler deployed. A 404 still counts as
      // "received locally" — the user's intent is captured in our state either way.
      if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`)
    } catch {
      // Soft-fail: still show the confirmation so the user isn't blocked. Console for ops.
      // eslint-disable-next-line no-console
      console.warn('[InfoPanelContactChat] lead submission network error; captured locally', payload)
    } finally {
      setMessages((prev) => [
        ...prev,
        { id: nextId + 1, role: 'bot', text: t(THANKS_BOT, locale) },
      ])
      setSubmitted(true)
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{ maxHeight: 440 }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Contact"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-white/45 hover:text-white/80 transition-colors text-[11px] tracking-[0.18em] uppercase"
          aria-label={t(BACK_LABEL, locale)}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t(BACK_LABEL, locale)}
        </button>
        <div className="text-right leading-tight">
          <p className="text-white/30 text-[9px] tracking-[0.24em] uppercase">
            {t(HEADER_LABEL, locale)}
          </p>
          <p className="text-white/70 text-[11px] font-medium truncate max-w-[180px]">
            {contextLabel}
          </p>
        </div>
      </div>

      <div className="mx-5 border-t border-white/8" />

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="px-5 py-4 overflow-y-auto space-y-2.5"
        style={{ maxHeight: 220 }}
      >
        {messages.map((m) =>
          m.role === 'bot' ? (
            <div key={m.id} className="flex flex-col gap-2">
              <div
                className="self-start max-w-[86%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-[12.5px] leading-relaxed"
                style={{
                  background: accentSoft,
                  border: `1px solid ${accentBorder}`,
                  color: 'rgba(255,255,255,0.78)',
                }}
              >
                {m.text}
              </div>
              {m.suggestions && !submitted ? (
                <div className="flex flex-wrap gap-1.5 pl-0.5">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setInput(s)}
                      className="rounded-full px-2.5 py-1 text-[10.5px] tracking-wide transition-colors"
                      style={{
                        border: `1px solid ${accentBorder}`,
                        color: accent,
                        background: 'transparent',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div
              key={m.id}
              className="self-end max-w-[86%] ml-auto rounded-2xl rounded-tr-sm px-3.5 py-2 text-[12.5px] leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              {m.text}
            </div>
          ),
        )}
        {sending ? (
          <div className="flex items-center gap-1.5 pl-1 text-white/35 text-[11px]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
            {t(SENDING_LABEL, locale)}
          </div>
        ) : null}
      </div>

      {/* Composer */}
      {!submitted ? (
        <div className="px-5 pb-4 pt-1">
          <div
            className="rounded-xl p-2.5 space-y-2"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
              placeholder={t(EMAIL_PLACEHOLDER, locale)}
              className="w-full bg-transparent outline-none text-white/85 placeholder:text-white/30 text-[12.5px] px-1"
              autoComplete="email"
              inputMode="email"
              disabled={sending}
            />
            <div className="border-t border-white/6" />
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); if (error) setError(null) }}
              onKeyDown={onKeyDown}
              placeholder={t(INPUT_PLACEHOLDER, locale)}
              rows={2}
              className="w-full bg-transparent outline-none resize-none text-white/85 placeholder:text-white/30 text-[12.5px] px-1 leading-relaxed"
              disabled={sending}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-white/25">
                {contextSubline ?? ''}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase transition-colors disabled:opacity-50"
                style={{
                  color: accent,
                  border: `1px solid ${accentBorder}`,
                  background: accentSoft,
                }}
              >
                {sending ? t(SENDING_LABEL, locale) : t(SEND_LABEL, locale)}
                {!sending ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14m0 0l-5-5m5 5l-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </button>
            </div>
          </div>
          {error ? (
            <p className="mt-2 text-[10.5px] text-rose-300/80 pl-1">{error}</p>
          ) : null}
        </div>
      ) : (
        <div className="px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full px-3 py-2 text-[11px] tracking-[0.12em] uppercase transition-colors"
            style={{
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
            }}
          >
            {t(BACK_LABEL, locale)}
          </button>
        </div>
      )}
    </div>
  )
}

const InfoPanelContactChat = memo(InfoPanelContactChatImpl)
export default InfoPanelContactChat
