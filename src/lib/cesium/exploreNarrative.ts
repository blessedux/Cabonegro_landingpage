/**
 * Explore /scene narrative lines for the bottom-right terminal (Cesium).
 * Keys are referenced as `narr:<key>` from orbitMath captions and CesiumExplorer.
 */

export type ExploreLocale = 'en' | 'es' | 'zh' | 'fr'

const NARR: Record<string, Record<ExploreLocale, string[]>> = {
  'overview-0': {
    en: [
      '> scene: regional pass — vista general',
      '  framing patagonia & the magallanes corridor',
      '  live terrain + imagery — hold for orbit / click to advance',
    ],
    es: [
      '> escena: paso regional — vista general',
      '  encuadre patagonia y corredor de magallanes',
      '  terreno + imágenes en vivo — mantén órbita / clic para avanzar',
    ],
    zh: [
      '> 场景：区域掠过 — 总览',
      '  取景巴塔哥尼亚与麦哲伦走廊',
      '  实时地形与影像 — 保持轨道 / 点击前进',
    ],
    fr: [
      '> scène : passage régional — vue générale',
      '  cadrage patagonie & corridor de magellan',
      '  terrain + imagerie temps réel — maintien orbite / clic pour avancer',
    ],
  },
  'overview-1': {
    en: [
      '> fix: cabo negro — coastal terrain (estrecho sector)',
      '  bridge between atlantic & pacific shipping lanes',
      '  deep-water access · year-round navigation · antarctic gateway',
    ],
    es: [
      '> fix: cabo negro — terreno costero (sector estrecho)',
      '  puente entre rutas atlántico ↔ pacífico',
      '  acceso aguas profundas · navegación todo el año · puerta antártica',
    ],
    zh: [
      '> 定位：卡沃内格罗 — 海岸带（海峡段）',
      '  连接大西洋与太平洋航运通道的支点',
      '  深水通达 · 全年可航 · 南极门户',
    ],
    fr: [
      '> fix : cabo negro — terrain côtier (secteur détroit)',
      '  trait d’union routes atlantique ↔ pacifique',
      '  accès eaux profondes · navigation à l’année · porte antarctique',
    ],
  },
  'overview-2': {
    en: [
      '> detail: subdivisión vigente — developable fabric',
      '  parcel lots · road + utility corridors (kmz overlay)',
      '  ~1,200+ ha developable (site) · industrial / logistics / energy fit',
    ],
    es: [
      '> detalle: subdivisión vigente — tejido desarrollable',
      '  lotes · corredores vial y de servicios (capa kmz)',
      '  ~1.200+ ha desarrollables (sitio) · uso industrial / logístico / energía',
    ],
    zh: [
      '> 细节：现行分区 — 可开发用地',
      '  地块 · 道路与公用走廊（KMZ 图层）',
      '  约 1,200+ 公顷可开发（项目区）· 适配工业 / 物流 / 能源',
    ],
    fr: [
      '> détail : subdivision en vigueur — tissu développable',
      '  lots · corridors routiers & services (calque kmz)',
      '  ~1 200+ ha développables (site) · industriel / logistique / énergie',
    ],
  },
  'site1-flight': {
    en: [
      '> transition: descent — cabo negro site orbit',
      '  ~16 km asl · westward survey pass',
    ],
    es: [
      '> transición: descenso — órbita sitio cabo negro',
      '  ~16 km asl · pasada de reconocimiento oeste',
    ],
    zh: [
      '> 过渡：下降 — 卡沃内格罗场地轨道',
      '  约 16 km 海拔 · 向西勘测掠过',
    ],
    fr: [
      '> transition : descente — orbite site cabo negro',
      '  ~16 km asl · passage reconnaissance ouest',
    ],
  },
  'punta-arenas': {
    en: [
      '> waypoint: punta arenas — regional capital',
      '  ruta 9 spine · services · workforce hub for the strait',
      '  click-drag orbit · shift shortcuts per help',
    ],
    es: [
      '> waypoint: punta arenas — capital regional',
      '  eje ruta 9 · servicios · polo laboral del estrecho',
      '  órbita clic-arrastrar · atajos shift según ayuda',
    ],
    zh: [
      '> 航点：蓬塔阿雷纳斯 — 大区首府',
      '  9 号公路主轴 · 服务 · 海峡劳动力与服务枢纽',
      '  拖拽轨道 · 快捷键见帮助',
    ],
    fr: [
      '> waypoint : punta arenas — capitale régionale',
      '  axe ruta 9 · services · hub emploi pour le détroit',
      '  orbite clic-glisser · raccourcis shift selon aide',
    ],
  },
  'terminal-maritimo': {
    en: [
      '> project: maritime terminal — cabo negro',
      '  multipurpose protected port · green h₂ & heavy logistics',
      '  antarctic support · ship-handling aligned to rotterdam-class ops',
    ],
    es: [
      '> proyecto: terminal marítimo — cabo negro',
      '  puerto multipropósito protegido · h₂ verde y logística pesada',
      '  soporte antártico · manejo de naves tipo operaciones rotterdam',
    ],
    zh: [
      '> 项目：海运码头 — 卡沃内格罗',
      '  多用途避风港 · 绿氢与重载物流',
      '  南极保障 · 船舶作业对标鹿特丹级运营',
    ],
    fr: [
      '> projet : terminal maritime — cabo negro',
      '  port multipropose abrité · h₂ vert & logistique lourde',
      '  soutien antarctique · manutention type opérations rotterdam',
    ],
  },
  'parque-logistico': {
    en: [
      '> zone: logistic park — distribution gateway',
      '  bonded flow · cold chain · back-of-port staging',
      '  sized for southern cone import/export corridors',
    ],
    es: [
      '> zona: parque logístico — puerta de distribución',
      '  flujo bajo custodia · cadena de frío · staging tras puerto',
      '  dimensionado para corredores import/export cono sur',
    ],
    zh: [
      '> 片区：物流园 — 分拨门户',
      '  保税流 · 冷链 · 港后集散',
      '  面向南锥体进出口走廊',
    ],
    fr: [
      '> zone : parc logistique — porte distribution',
      '  flux sous douane · froid · staging arrière-port',
      '  dimensionné pour corridors import/export cône sud',
    ],
  },
  'parque-tecnologico': {
    en: [
      '> zone: patagon valley — technology park',
      '  adjacency to terminal corridor · data / r&d / light mfg',
      '  renewables + advanced industry stack for magallanes',
    ],
    es: [
      '> zona: patagon valley — parque tecnológico',
      '  proximidad corredor portuario · datos / i+d / manufactura ligera',
      '  renovables + industria avanzada para magallanes',
    ],
    zh: [
      '> 片区：patagon valley — 科技园区',
      '  毗邻港区走廊 · 数据 / 研发 / 轻制造',
      '  可再生能源与麦哲伦先进产业组合',
    ],
    fr: [
      '> zone : patagon valley — parc technologique',
      '  proximité corridor portuaire · données / r&d / fabrication légère',
      '  renouvelables + industrie avancée pour magellan',
    ],
  },
  'punta-kf-0': {
    en: [
      '> sweep: punta arenas — oblique orbit',
      '  urban fabric vs strait opening',
    ],
    es: [
      '> barrido: punta arenas — órbita oblicua',
      '  tejido urbano vs boca del estrecho',
    ],
    zh: [
      '> 扫掠：蓬塔阿雷纳斯 — 倾斜轨道',
      '  城市肌理与海峡开口',
    ],
    fr: [
      '> balayage : punta arenas — orbite oblique',
      '  tissu urbain vs embouchure du détroit',
    ],
  },
  'punta-kf-1': {
    en: [
      '> sweep: strait corridor — traffic & fetch',
      '  magellan as interocean shortcut',
    ],
    es: [
      '> barrido: corredor del estrecho — tráfico y fetch',
      '  magallanes como atajo interoceánico',
    ],
    zh: [
      '> 扫掠：海峡走廊 — 交通与风区',
      '  麦哲伦作为跨洋捷径',
    ],
    fr: [
      '> balayage : corridor détroit — trafic & fetch',
      '  magellan comme raccourci interocéanique',
    ],
  },
  'terminal-kf-0': {
    en: [
      '> shot: berth approach — maritime terminal',
      '  quay alignment · draft envelope',
    ],
    es: [
      '> toma: aproximación muelle — terminal marítimo',
      '  alineación de muelle · envolvente de calado',
    ],
    zh: [
      '> 镜头：泊位进近 — 海运码头',
      '  岸线对齐 · 吃水包络',
    ],
    fr: [
      '> plan : approche quai — terminal maritime',
      '  alignement quai · enveloppe tirant d’eau',
    ],
  },
  'terminal-kf-1': {
    en: [
      '> shot: operations stack — staging & backup yards',
      '  h₂-ready logistics footprint',
    ],
    es: [
      '> toma: stack operacional — patios de respaldo',
      '  huella logística preparada h₂',
    ],
    zh: [
      '> 镜头：作业堆栈 — 后备场地',
      '  面向绿氢的物流占地',
    ],
    fr: [
      '> plan : pile opérationnelle — cours de stockage',
      '  emprise logistique prête h₂',
    ],
  },
  'logistico-kf-0': {
    en: [
      '> orbit: logistic park — yard grid',
      '  highway + port tributary flows',
    ],
    es: [
      '> órbita: parque logístico — grilla de patios',
      '  flujos ruta 9 + tributarios al puerto',
    ],
    zh: [
      '> 轨道：物流园 — 堆场网格',
      '  公路与港区支线流量',
    ],
    fr: [
      '> orbite : parc logistique — grille de cours',
      '  flux route 9 + affluents port',
    ],
  },
  'logistico-kf-1': {
    en: [
      '> orbit: gateway framing — southern cone',
      '  import/export staging for patagonia',
    ],
    es: [
      '> órbita: encuadre gateway — cono sur',
      '  staging import/export para patagonia',
    ],
    zh: [
      '> 轨道：门户取景 — 南锥体',
      '  巴塔哥尼亚进出口集散',
    ],
    fr: [
      '> orbite : cadrage gateway — cône sud',
      '  staging import/export patagonie',
    ],
  },
  'tecnologico-kf-0': {
    en: [
      '> orbit: technology park — campus fabric',
      '  proximity to energy + port stack',
    ],
    es: [
      '> órbita: parque tecnológico — tejido campus',
      '  proximidad stack energía + puerto',
    ],
    zh: [
      '> 轨道：科技园区 — 园区肌理',
      '  靠近能源与港口集群',
    ],
    fr: [
      '> orbite : parc technologique — tissu campus',
      '  proximité pile énergie + port',
    ],
  },
  'tecnologico-kf-1': {
    en: [
      '> orbit: innovation loop — r&d adjacency',
      '  patagon valley positioning',
    ],
    es: [
      '> órbita: loop innovación — adyacencia i+d',
      '  posicionamiento patagon valley',
    ],
    zh: [
      '> 轨道：创新回路 — 研发邻接',
      '  patagon valley 区位',
    ],
    fr: [
      '> orbite : boucle innovation — proximité r&d',
      '  positionnement patagon valley',
    ],
  },
  'coast-0': {
    en: [
      '> coast: patagonian littoral',
      '  fetch · exposure · deep-water interface',
    ],
    es: [
      '> costa: litoral patagónico',
      '  fetch · exposición · interfaz aguas profundas',
    ],
    zh: [
      '> 海岸：巴塔哥尼亚滨海带',
      '  浪涌 · 朝向 · 深水界面',
    ],
    fr: [
      '> côte : littoral patagonien',
      '  fetch · exposition · interface eaux profondes',
    ],
  },
  'coast-1': {
    en: [
      '> coast: strait of magellan',
      '  cold-water channel · routing density',
    ],
    es: [
      '> costa: estrecho de magallanes',
      '  canal de agua fría · densidad de rutas',
    ],
    zh: [
      '> 海岸：麦哲伦海峡',
      '  冷水通道 · 航线密度',
    ],
    fr: [
      '> côte : détroit de magellan',
      '  chenal d’eau froide · densité de routes',
    ],
  },
}

function normalizeLocale(locale: string): ExploreLocale {
  if (locale === 'es' || locale === 'zh' || locale === 'fr') return locale
  return 'en'
}

export function getExploreNarrativeLines(locale: string, key: string): string[] {
  const loc = normalizeLocale(locale)
  const block = NARR[key]
  if (!block) return [`> narr missing: ${key}`]
  return block[loc] ?? block.en
}

/** Raw caption from keyframes: `narr:<key>` or plain legacy text. */
export function resolveExploreCaption(locale: string, raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null
  if (raw.startsWith('narr:')) {
    const key = raw.slice(5)
    return getExploreNarrativeLines(locale, key).join('\n')
  }
  return raw
}
