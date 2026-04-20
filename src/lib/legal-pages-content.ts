import type { Locale } from "@/i18n/routing"

export type LegalPageKind = "privacy" | "copyright"

type LegalBlock = {
  title: string
  paragraphs: string[]
}

const PRIVACY: Record<Locale, LegalBlock> = {
  en: {
    title: "Privacy policy",
    paragraphs: [
      "This page describes how Cabo Negro Industrial Park (“we”, “us”) handles information when you use our website.",
      "We may collect technical data such as browser type, device category, and approximate region to improve performance and security. We do not sell your personal data.",
      "Contact us at ventas@cabonegro.cl if you have questions about this policy.",
    ],
  },
  es: {
    title: "Política de privacidad",
    paragraphs: [
      "Esta página describe cómo Parque Industrial Cabo Negro (“nosotros”) trata la información cuando utiliza nuestro sitio web.",
      "Podemos recopilar datos técnicos como tipo de navegador, categoría de dispositivo y región aproximada para mejorar el rendimiento y la seguridad. No vendemos sus datos personales.",
      "Escríbanos a ventas@cabonegro.cl si tiene preguntas sobre esta política.",
    ],
  },
  zh: {
    title: "隐私政策",
    paragraphs: [
      "本页说明卡波内格罗工业园（“我们”）在您使用本网站时如何处理信息。",
      "我们可能会收集浏览器类型、设备类别和大致地区等技术数据，以改进性能和安全性。我们不会出售您的个人数据。",
      "若对本政策有疑问，请联系 ventas@cabonegro.cl。",
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    paragraphs: [
      "Cette page décrit comment le Parc industriel Cabo Negro (« nous ») traite les informations lorsque vous utilisez notre site.",
      "Nous pouvons collecter des données techniques telles que le type de navigateur, la catégorie d’appareil et la région approximative pour améliorer les performances et la sécurité. Nous ne vendons pas vos données personnelles.",
      "Pour toute question, contactez ventas@cabonegro.cl.",
    ],
  },
}

const COPYRIGHT: Record<Locale, LegalBlock> = {
  en: {
    title: "Copyright",
    paragraphs: [
      "All content on this website—including text, graphics, logos, and layout—is owned by Cabo Negro Industrial Park or its licensors unless otherwise stated.",
      "You may not copy, modify, or redistribute site materials without prior written permission, except for fair use or sharing permitted by law.",
      "For licensing requests, contact ventas@cabonegro.cl.",
    ],
  },
  es: {
    title: "Derechos de autor",
    paragraphs: [
      "Todo el contenido de este sitio—incluidos textos, gráficos, logotipos y maquetación—pertenece a Parque Industrial Cabo Negro o a sus licenciantes, salvo indicación contraria.",
      "No puede copiar, modificar ni redistribuir materiales del sitio sin autorización previa por escrito, salvo usos permitidos por la ley.",
      "Para solicitudes de licencia, escriba a ventas@cabonegro.cl.",
    ],
  },
  zh: {
    title: "版权",
    paragraphs: [
      "本网站上的全部内容（包括文字、图形、标识与版式）除另有说明外，均归卡波内格罗工业园或其许可方所有。",
      "未经许可，不得复制、修改或再传播网站材料，法律允许的合理使用除外。",
      "许可事宜请联系 ventas@cabonegro.cl。",
    ],
  },
  fr: {
    title: "Droits d’auteur",
    paragraphs: [
      "Tout le contenu de ce site—textes, graphismes, logos et mise en page—appartient au Parc industriel Cabo Negro ou à ses concédants, sauf mention contraire.",
      "Vous ne pouvez pas copier, modifier ou redistribuer les éléments du site sans autorisation écrite préalable, sauf exceptions légales.",
      "Pour les demandes de licence : ventas@cabonegro.cl.",
    ],
  },
}

export function getLegalPageContent(kind: LegalPageKind, locale: Locale): LegalBlock {
  const map = kind === "privacy" ? PRIVACY : COPYRIGHT
  return map[locale] ?? map.en
}
