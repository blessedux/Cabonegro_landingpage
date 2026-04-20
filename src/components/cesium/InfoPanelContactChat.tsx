'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'

type Tone = 'parcel' | 'waypoint'

type QuickSuggestion = { label: string; draft: string }

type Message =
  | { id: number; role: 'bot'; text: string; suggestions?: QuickSuggestion[]; variant?: 'error' }
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

/** Button label + fuller email draft (context = lot/area name; sub = optional line e.g. ha + coords). */
function buildQuickSuggestions(
  locale: string,
  contextLabel: string,
  contextSubline?: string,
): QuickSuggestion[] {
  const tail = contextSubline ? `\n${contextSubline}` : ''
  const en: QuickSuggestion[] = [
    {
      label: 'Availability',
      draft: `I'm writing from the Cabo Negro explore map about: ${contextLabel}.${tail}

I'd like to understand current availability for this area or lot—whether it is open, reserved, or in process, and what the next realistic window would be if it is not immediately free.

Please share the status, any conditions we should know, and the best way to move forward if it fits our plans.`,
    },
    {
      label: 'Pricing',
      draft: `I'm writing from the Cabo Negro explore map about: ${contextLabel}.${tail}

I'm interested in indicative pricing or a commercial range for this selection, and what is included (or excluded) in that figure.

If you need more detail on our intended use or timeline to refine the numbers, I'm happy to follow up.`,
    },
    {
      label: 'Request a visit',
      draft: `I'm writing from the Cabo Negro explore map about: ${contextLabel}.${tail}

I'd like to schedule an on-site or virtual visit to review this location with your team.

Please suggest a few suitable time slots and any access, safety, or logistics we should plan for.`,
    },
  ]
  const es: QuickSuggestion[] = [
    {
      label: 'Disponibilidad',
      draft: `Les escribo desde el mapa interactivo de Cabo Negro, consultando por: ${contextLabel}.${tail}

Quisiera entender la disponibilidad actual de esta zona o lote—si está libre, reservado o en proceso, y cuál sería la ventana más realista si no está disponible de inmediato.

Por favor indiquen el estado, condiciones relevantes y cómo podemos avanzar si encaja con nuestros planes.`,
    },
    {
      label: 'Precio',
      draft: `Les escribo desde el mapa interactivo de Cabo Negro, consultando por: ${contextLabel}.${tail}

Me interesa conocer un rango de precios orientativo o referencial para esta selección, y qué incluye (o no) esa cifra.

Si necesitan más detalle sobre nuestro uso previsto o plazos para afinar la propuesta, puedo ampliar la información.`,
    },
    {
      label: 'Agendar visita',
      draft: `Les escribo desde el mapa interactivo de Cabo Negro, consultando por: ${contextLabel}.${tail}

Me gustaría coordinar una visita presencial o virtual para revisar esta ubicación con su equipo.

Por favor sugieran algunos horarios posibles y cualquier requisito de acceso, seguridad o logística que debamos considerar.`,
    },
  ]
  const zh: QuickSuggestion[] = [
    {
      label: '可用性',
      draft: `我通过 Cabo Negro 探索地图联系，咨询：${contextLabel}。${tail}

希望了解该地块或区域目前的可用性——是否可洽谈、预留或流程中，以及若暂不可用的预计时间窗口。

请告知当前状态、需要注意的条件，以及若符合我方计划，后续推进方式。`,
    },
    {
      label: '价格',
      draft: `我通过 Cabo Negro 探索地图联系，咨询：${contextLabel}。${tail}

希望了解该选择的参考价格区间或报价范围，以及价格包含与不包含的内容。

若需补充用途或时间线以便细化方案，我可进一步说明。`,
    },
    {
      label: '预约考察',
      draft: `我通过 Cabo Negro 探索地图联系，咨询：${contextLabel}。${tail}

希望安排现场或线上考察，与贵团队一同查看该位置。

请提供若干可行时段，以及需要预留的准入、安全或后勤安排。`,
    },
  ]
  const fr: QuickSuggestion[] = [
    {
      label: 'Disponibilité',
      draft: `Je vous contacte depuis la carte interactive Cabo Negro au sujet de : ${contextLabel}.${tail}

Je souhaite connaître la disponibilité actuelle de ce terrain ou secteur — libre, réservé ou en cours — et la fenêtre réaliste si ce n’est pas immédiatement disponible.

Merci d’indiquer le statut, les conditions éventuelles et la meilleure façon d’avancer si cela correspond à notre projet.`,
    },
    {
      label: 'Prix',
      draft: `Je vous contacte depuis la carte interactive Cabo Negro au sujet de : ${contextLabel}.${tail}

Je suis intéressé par une fourchette de prix indicative ou une fourchette commerciale pour cette sélection, et par ce qui est inclus (ou non) dans ce montant.

Si vous avez besoin de précisions sur notre usage ou notre calendrier pour affiner, je peux détailler.`,
    },
    {
      label: 'Planifier une visite',
      draft: `Je vous contacte depuis la carte interactive Cabo Negro au sujet de : ${contextLabel}.${tail}

Je souhaite planifier une visite sur site ou virtuelle pour examiner ce lieu avec votre équipe.

Merci de proposer quelques créneaux possibles ainsi que les contraintes d’accès, sécurité ou logistique à prévoir.`,
    },
  ]

  const map: Record<string, QuickSuggestion[]> = { en, es, zh, fr }
  return map[locale] ?? en
}

/** Shown only after HTTP 200 — confirms delivery pipeline succeeded. */
const THANKS_BOT: Record<string, (userEmail: string) => string> = {
  en: (userEmail) =>
    `Your message was sent successfully. Our team will reply to ${userEmail} within one business day.`,
  es: (userEmail) =>
    `Tu mensaje se envió correctamente. El equipo te responderá a ${userEmail} en un día hábil.`,
  zh: (userEmail) =>
    `消息已成功发送。我们将在一个工作日内回复您填写的邮箱：${userEmail}。`,
  fr: (userEmail) =>
    `Votre message a bien été envoyé. Notre équipe vous répondra à ${userEmail} sous un jour ouvré.`,
}

const SEND_FAILED_BOT: Record<string, string> = {
  en: 'We could not send this through the form. Use “Email sales” below or try Send again.',
  es: 'No pudimos enviar desde el formulario. Usa «Escribir a ventas» abajo o reintenta Enviar.',
  zh: '表单未能发送。请使用下方「发邮件」或重试发送。',
  fr: 'Envoi impossible depuis le formulaire. Utilisez « Écrire aux ventes » ci-dessous ou réessayez.',
}

const SEND_FAILED_NETWORK: Record<string, string> = {
  en: 'Network error — check your connection and try again.',
  es: 'Error de red — revisa tu conexión e inténtalo de nuevo.',
  zh: '网络错误，请检查连接后重试。',
  fr: 'Erreur réseau — vérifiez la connexion et réessayez.',
}

const EMAIL_FALLBACK_LINK: Record<string, string> = {
  en: 'Email ventas@cabonegro.cl',
  es: 'Escribir a ventas@cabonegro.cl',
  zh: '发邮件至 ventas@cabonegro.cl',
  fr: 'Écrire à ventas@cabonegro.cl',
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

  const quickSuggestions = useMemo(
    () => buildQuickSuggestions(locale, contextLabel, contextSubline),
    [locale, contextLabel, contextSubline],
  )

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      role: 'bot',
      text: (GREETING[locale] ?? GREETING.en)(contextLabel),
      suggestions: buildQuickSuggestions(locale, contextLabel, contextSubline),
    },
  ])
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset conversation if context changes.
  useEffect(() => {
    setMessages([{ id: 1, role: 'bot', text: initialGreeting, suggestions: quickSuggestions }])
    setInput('')
    setEmail('')
    setError(null)
    setSubmitted(false)
  }, [initialGreeting, locale, quickSuggestions])

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
    const userId = messages.length + 1
    const replyId = userId + 1
    const userEmail = email.trim()

    setMessages((prev) => [...prev, { id: userId, role: 'user', text: trimmed }])
    setInput('')
    setSending(true)

    const payload = {
      context: { label: contextLabel, subline: contextSubline, tone, locale },
      email: userEmail,
      message: trimmed,
      page: typeof window !== 'undefined' ? window.location.href : undefined,
      ts: new Date().toISOString(),
    }

    const endpoint = process.env.NEXT_PUBLIC_EXPLORE_LEAD_ENDPOINT || '/api/explore-lead'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      type ErrBody = { error?: string; code?: string }
      let data: ErrBody = {}
      try {
        const ct = res.headers.get('content-type') ?? ''
        if (ct.includes('application/json')) data = (await res.json()) as ErrBody
      } catch {
        /* ignore parse errors */
      }

      if (!res.ok) {
        const serverMsg = typeof data.error === 'string' ? data.error : null
        setError(serverMsg || t(SEND_FAILED_NETWORK, locale))
        setMessages((prev) => [
          ...prev,
          { id: replyId, role: 'bot', variant: 'error', text: t(SEND_FAILED_BOT, locale) },
        ])
        setInput(trimmed)
        return
      }

      const thanks = (THANKS_BOT[locale] ?? THANKS_BOT.en)(userEmail)
      setMessages((prev) => [...prev, { id: replyId, role: 'bot', text: thanks }])
      setSubmitted(true)
    } catch {
      console.warn('[InfoPanelContactChat] lead submission failed', payload)
      setError(t(SEND_FAILED_NETWORK, locale))
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'bot', variant: 'error', text: t(SEND_FAILED_BOT, locale) },
      ])
      setInput(trimmed)
    } finally {
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
                style={
                  m.variant === 'error'
                    ? {
                        background: 'rgba(127, 29, 29, 0.28)',
                        border: '1px solid rgba(251, 113, 133, 0.38)',
                        color: 'rgba(254, 226, 230, 0.92)',
                      }
                    : {
                        background: accentSoft,
                        border: `1px solid ${accentBorder}`,
                        color: 'rgba(255,255,255,0.78)',
                      }
                }
              >
                {m.text}
              </div>
              {m.suggestions && !submitted ? (
                <div className="flex flex-wrap gap-1.5 pl-0.5">
                  {m.suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setInput(s.draft)}
                      className="rounded-full px-2.5 py-1 text-[10.5px] tracking-wide transition-colors"
                      style={{
                        border: `1px solid ${accentBorder}`,
                        color: accent,
                        background: 'transparent',
                      }}
                    >
                      {s.label}
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
            <div className="mt-2 pl-1 space-y-1.5">
              <p className="text-[10.5px] text-rose-300/80">{error}</p>
              <a
                href={`mailto:ventas@cabonegro.cl?subject=${encodeURIComponent(`Explore — ${contextLabel}`)}&body=${encodeURIComponent(`${input}\n\n— ${email.trim()}`)}`}
                className="inline-block text-[10.5px] text-cyan-300/90 underline underline-offset-2 hover:text-cyan-200/95"
              >
                {t(EMAIL_FALLBACK_LINK, locale)}
              </a>
            </div>
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
