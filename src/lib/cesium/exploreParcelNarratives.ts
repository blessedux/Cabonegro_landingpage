/**
 * Investor-facing copy for subdivision parcels (SUBDIVISIÓN VIGENTE KMZ placemark names).
 * Summary = collapsed card; detail = expanded. Keys must match KML `<name>` exactly.
 */

import type { ExploreCardLocales } from './exploreCardText'

const GENERIC_PV: ExploreCardLocales = {
  en: {
    summary:
      'Patagon Valley lot — developable slice within the ~33 ha technology-park fabric next to the Cabo Negro corridor.',
    detail:
      'This parcel is part of the current Cabo Negro subdivision and is positioned for port-linked innovation uses: R&D, light manufacturing, data and control rooms, and services that benefit from Magallanes’ renewable power story. Plots are offered to bring forward a coordinated technology district beside the maritime terminal and logistics stack, shortening time-to-operation for tenants who need power, space, and access to the Strait. Commercially, it is a land play in a region where energy-intensive industry is actively recruiting capacity — with phased delivery tied to the wider master development rather than a distant speculative horizon.',
  },
  es: {
    summary:
      'Lote Patagon Valley — fracción desarrollable dentro del tejido ~33 ha del parque tecnológico junto al corredor Cabo Negro.',
    detail:
      'Esta parcela forma parte de la subdivisión vigente de Cabo Negro y se orienta a usos de innovación vinculados al puerto: I+D, manufactura ligera, salas de datos y control, y servicios que se benefician de la matriz energética renovable de Magallanes. Los lotes se comercializan para acelerar un distrito tecnológico coordinado junto al terminal marítimo y la pila logística, acortando plazos para operadores que requieren energía, superficie y acceso al Estrecho. Comercialmente, es una apuesta de suelo en una región donde la industria intensiva en energía busca capacidad activamente — con entregas escalonadas al ritmo del desarrollo maestro, no un horizonte especulativo lejano.',
  },
  zh: {
    summary:
      '巴塔哥尼亚谷地块——紧邻卡沃内格罗走廊、约 33 公顷科技园区可开发用地中的一块。',
    detail:
      '该地块属于卡沃内格罗现行分区，面向与港区联动的创新用途：研发、轻制造、数据与中控室，以及受益于麦哲伦地区可再生能源叙事的配套服务。出让旨在推动海运码头与物流集群旁协同发展的科技片区，缩短需要电力、用地与海峡通达的租户投产周期。从投资逻辑看，这是能源密集型产业积极扩能地区的土地机会；交付节奏与整体总体规划分期挂钩，而非遥远不确定的预期。',
  },
  fr: {
    summary:
      'Lot Patagon Valley — parcelle développable dans le tissu ~33 ha du parc technologique longeant le corridor Cabo Negro.',
    detail:
      'Cette parcelle relève du plan de subdivision en vigueur à Cabo Negro et vise des usages d’innovation liés au port : R&D, fabrication légère, salles de données et de contrôle, et services tirant parti du récit énergétique renouvelable de Magellan. Les lots sont cédés pour faire émerger un district technologique coordonné près du terminal maritime et de la pile logistique, réduisant les délais pour des opérateurs qui ont besoin de puissance, de surface et d’accès au détroit. Commercialement, il s’agit d’un positionnement foncier dans une région où l’industrie intensive en énergie recrute de la capacité — avec une livraison phasée alignée sur le schéma directeur, plutôt qu’un horizon spéculatif lointain.',
  },
}

export const PARCEL_EXPLORE_CARDS: Record<string, ExploreCardLocales> = {
  'LOTE A (CN2)': {
    en: {
      summary:
        'Cabo Negro Dos (~173 ha) — large-format industrial and logistics platform at the heart of the Strait sector.',
      detail:
        'This is the flagship land block for heavy footprint uses: port-related industry, bulk and container back-up, energy conversion plants, and staging that needs depth and distance from urban centers. It is being sold to secure anchor investment for the Cabo Negro complex — linking Punta Arenas’ workforce and services to a greenfield site with room for quay-aligned supply chains. For an Asian or global investor, the value is geographic: you sit on the Magellan corridor where Atlantic and Pacific routing options converge, with year-round navigation and a political narrative around hydrogen and southern logistics. Timing follows project infrastructure phasing; the lot is priced as strategic land bank for multi-year industrial rollout.',
    },
    es: {
      summary:
        'Cabo Negro Dos (~173 ha) — plataforma industrial y logística de gran formato en el corazón del sector del Estrecho.',
      detail:
        'Es el bloque insignia para usos de gran huella: industria portuaria, respaldo de granel y contenedores, plantas de conversión energética y staging que requiere profundidad y alejamiento de núcleos urbanos. Se comercializa para asegurar inversión ancla en el complejo Cabo Negro —conectando la mano de obra y servicios de Punta Arenas con un sitio greenfield con espacio para cadenas abastecidas desde el muelle. Para un inversor asiático o global, el valor es geográfico: ubicación en el corredor de Magallanes donde convergen opciones de ruteo Atlántico y Pacífico, navegación todo el año y narrativa política en hidrógeno y logística austral. Los plazos siguen la fase de infraestructura del proyecto; el lote se posiciona como banco de suelo industrial multi-anual.',
    },
    zh: {
      summary:
        '卡沃内格罗二号（约 173 公顷）——海峡段核心位置的大体量工业与物流用地平台。',
      detail:
        '该地块面向重资产用途：港航关联工业、散货与集装箱后方作业、能源转化装置及需要纵深、远离城区的集散。出让旨在为卡沃内格罗综合体锁定龙头投资——把蓬塔阿雷纳斯的劳动力与服务接到可与码头供应链对齐的绿地区块。对亚洲或全球投资者而言，价值在于区位：地处麦哲伦走廊，大西洋与太平洋航线选择在此交汇，全年可航，并叠加绿氢与南部物流的政策叙事。节奏随项目基建分期；土地定价对应多年期工业滚动的战略储备。',
    },
    fr: {
      summary:
        'Cabo Negro Dos (~173 ha) — grande plateforme industrielle et logistique au cœur du secteur du détroit.',
      detail:
        'Il s’agit du bloc phare pour les usages lourds : industrie portuaire, secours vrac et conteneurs, conversion énergétique et aires de staging nécessitant profondeur et éloignement des centres urbains. La vente vise à ancrer l’investissement dans le complexe Cabo Negro — reliant la main-d’œuvre et les services de Punta Arenas à un site vert avec place pour des chaînes d’approvisionnement alignées quai. Pour un investisseur asiatique ou mondial, la valeur est géographique : position sur le corridor de Magellan où se croisent options de routage Atlantique et Pacifique, navigation à l’année et récit politique hydrogène / logistique australe. Le calendrier suit le phasing des infrastructures ; le lot est positionné comme réserve foncière industrielle pluriannuelle.',
    },
  },

  'Sitio 7': {
    en: {
      summary:
        'J&P (~24 ha) — waterfront-facing parcel sized for port-linked industry and high-visibility logistics.',
      detail:
        'This lot is marketed as the premium shoreline slice in the offering: closer visual and operational coupling to the maritime terminal and coastal circulation. It suits investors who want their asset story tied directly to the Strait — cold chain, fuels and chemicals under modern safety regimes, marshalling for project cargo, or advanced manufacturing that feeds ship operations. Sales are part of the current Cabo Negro land release to fund parallel port and park works; expect alignment with concession timelines and environmental permitting rather than immediate small-lot retail subdivision.',
    },
    es: {
      summary:
        'J&P (~24 ha) — frente costero, dimensionado para industria vinculada al puerto y logística de alta visibilidad.',
      detail:
        'Es la fracción premium de costa en la oferta: mayor acoplamiento visual y operacional al terminal marítimo y a la circulación costera. Apunta a inversores que quieren que su activo narre el Estrecho — frío, combustibles y químicos bajo normas de seguridad, acopio de carga proyecto o manufactura avanzada que alimente operaciones navales. La venta forma parte de la liberación de suelo actual de Cabo Negro para cofinanciar obras portuarias y de parque; el calendonar se alinea a concesiones y permisos ambientales, no a un loteo menor inmediato.',
    },
    zh: {
      summary:
        'J&P（约 24 公顷）——滨水朝向、适合港航关联产业与高可见度物流的规模地块。',
      detail:
        '该出让强调岸线价值：与海运码头及沿岸交通在视觉与运营上更紧密。适合希望资产叙事与海峡直接绑定的投资者——冷链、现代安全体系下的燃料与化工、项目货集散，或服务船舶作业的先进制造。销售属于卡沃内格罗当前土地释放，用于配套港口与园区建设；节奏与特许与环境许可衔接，而非即时小块零售式分割。',
    },
    fr: {
      summary:
        'J&P (~24 ha) — parcelle front de mer pour industrie liée au port et logistique très visible.',
      detail:
        'C’est la tranche côtière premium : couplage visuel et opérationnel plus fort avec le terminal maritime et les circulations littorales. Elle s’adresse aux investisseurs qui veulent un actif explicitement lié au détroit — froid, carburants et chimie sous normes de sécurité, groupage de cargaisons projet ou fabrication avancée alimentant les opérations portuaires. La vente s’inscrit dans la libération foncière actuelle de Cabo Negro pour cofinancer infrastructures portuaires et parcs ; calendrier aligné sur concessions et permis environnementaux, pas sur un lotissement retail immédiat.',
    },
  },

  'J&P Continuadora': {
    en: {
      summary:
        'J&P II — port-side extension of J&P (Sitio 7), adding operational depth and internal-access frontage to the waterfront industrial line.',
      detail:
        'This polygon extends the J&P lot toward the port-side interior: sold to investors who want the combined waterfront + back-of-quay depth, or who prefer the back-parcel access story independently. It shares the same strategic envelope as Sitio 7 — industrial and logistics uses tied to the maritime terminal, the Strait corridor, and the Magallanes energy narrative — but sits at the seam between coastal circulation and the wider site. Due diligence should review both J&P and J&P II together; phasing, permits, and pricing follow the same project timeline.',
    },
    es: {
      summary:
        'J&P II — extensión portuaria de J&P (Sitio 7), agregando profundidad operacional y frente de acceso interior a la línea industrial costera.',
      detail:
        'Este polígono amplía el lote J&P hacia el interior del lado portuario: se vende a inversores que quieren profundidad combinada frente costa + tras muelle, o que prefieren la historia de acceso trasero de forma independiente. Comparte el mismo encuadre estratégico que Sitio 7 — usos industriales y logísticos ligados al terminal marítimo, el corredor del Estrecho y la narrativa energética de Magallanes — pero se ubica en la unión entre la circulación costera y el resto del sitio. En due diligence se recomienda revisar J&P y J&P II en conjunto; phasing, permisos y precios siguen el mismo calendario del proyecto.',
    },
    zh: {
      summary:
        'J&P II——J&P（7 号地块）的港区延伸，为滨水工业线增加运营纵深与内侧通道。',
      detail:
        '该地块将 J&P 地块向港区内侧延伸：面向希望获得岸线加码头后方综合纵深的投资者，也可独立作为后方通道价值。与 Sitio 7 共用相同战略框架——与海运码头、海峡走廊及麦哲伦能源叙事挂钩的工业与物流用途——但位于沿岸流线与更大用地之间的衔接处。尽调建议 J&P 与 J&P II 一并审视；分期、许可与定价遵循同一项目时间线。',
    },
    fr: {
      summary:
        "J&P II — prolongement côté port de J&P (site 7), ajoutant profondeur opérationnelle et façade d'accès interne à la ligne industrielle littorale.",
      detail:
        "Ce polygone étend le lot J&P vers l'intérieur côté port : cédé aux investisseurs qui veulent la profondeur combinée front mer + arrière quai, ou qui préfèrent la thèse d'accès arrière de manière indépendante. Il partage la même enveloppe stratégique que le site 7 — usages industriels et logistiques liés au terminal maritime, au corridor du détroit et au récit énergétique de Magellan — mais se situe à la jonction entre la circulation littorale et le reste du site. La due diligence devrait examiner J&P et J&P II ensemble ; phasing, permis et prix suivent le même calendrier projet.",
    },
  },

  'Sitio 6': {
    en: {
      summary:
        'Patagon Valley (Sitio 6) — interior segment of the ~33 ha fabric, suited to campus buildings and service yards away from the coastal edge.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Sitio 6) — segmento interior del tejido ~33 ha, apto para edificios campus y patios de servicio alejados del frente costero.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（6 号地块）——约 33 公顷用地中靠内的区段，适合校园式建筑与远离岸线的服务场地。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (site 6) — segment intérieur du tissu ~33 ha, adapté aux bâtiments campus et cours de service hors front littoral.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'Sitio 5': {
    en: {
      summary:
        'Patagon Valley (Sitio 5) — mid-parcel slice for light manufacturing, labs, or control rooms with shared access to the technology-park circulation.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Sitio 5) — fracción central para manufactura ligera, laboratorios o salas de control con acceso compartido a la circulación del parque.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（5 号地块）——中部条带，适合轻制造、实验室或中控室，共享科技园区内部交通。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (site 5) — bande centrale pour fabrication légère, laboratoires ou salles de contrôle avec accès partagé à la circulation du parc.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'Sitio 4': {
    en: {
      summary:
        'Patagon Valley (Sitio 4) — parcel oriented to internal grid connectivity — useful for modular halls and logistics support feeding the wider site.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Sitio 4) — lote orientado a la conectividad de la grilla interna — útil para naves modulares y soporte logístico al resto del sitio.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（4 号地块）——面向内部路网衔接，适合模块化厂房与向全片区补给的物流支持。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (site 4) — parcelle tournée vers la connectivité de la grille interne — utile pour halls modulaires et support logistique au reste du site.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'Sitio N°3': {
    en: {
      summary:
        'Patagon Valley (Sitio N°3) — anchor-style segment within the 33 ha outline for an operator who wants visible presence inside the Patagon Valley cluster.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Sitio N°3) — segmento tipo ancla dentro del contorno 33 ha para un operador que busca presencia visible en el cluster Patagon Valley.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（3 号地块）——33 公顷轮廓内偏“锚点”角色的区段，适合希望在园区内具辨识度的运营商。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (site n°3) — segment « ancrage » dans le contour 33 ha pour un opérateur qui veut une présence visible dans le cluster Patagon Valley.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'Sitio N°2 Lote C1': {
    en: {
      summary:
        'Patagon Valley (Sitio N°2 Lote C1) — C1-line parcel for tenants aligning with the first-phase technology-park subdivision and utility corridors.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Sitio N°2 Lote C1) — lote línea C1 para arrendatarios alineados a la primera fase de subdivisión del parque y corredores de servicios.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（2 号地块 C1）——C1 线地块，面向与科技园区首期分区及公用走廊对齐的租户。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (site n°2 lot C1) — parcelle ligne C1 pour des locataires alignés sur la première tranche de subdivision du parc et les corridors de services.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'C1-7': {
    en: {
      summary:
        'Patagon Valley — C1-7 umbrella parcel within the consolidated ~33 ha technology-park outline.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley — parcela marco C1-7 dentro del contorno ~33 ha del parque tecnológico consolidado.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary: '巴塔哥尼亚谷——约 33 公顷科技园区合并轮廓内的 C1-7 框架地块。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley — parcelle-cadre C1-7 dans le contour consolidé ~33 ha du parc technologique.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  'Lote C1-7-2': {
    en: {
      summary:
        'Patagon Valley (Lote C1-7-2) — secondary subdivision slice for a smaller tenant or phased build within the C1-7 planning line.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (Lote C1-7-2) — fracción secundaria para un ocupante menor o obra por fases dentro de la línea de planificación C1-7.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（C1-7-2 地块）——C1-7 规划线下的次级分块，适合较小租户或分期建设。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (lot C1-7-2) — tranche secondaire pour un occupant plus petit ou une construction phasée dans la ligne de planification C1-7.',
      detail: GENERIC_PV.fr.detail,
    },
  },

  /**
   * Synthetic key used when the entire Patagon Valley small-lot cluster is selected
   * together (clicking any individual lot highlights the whole group).
   */
  PATAGON_VALLEY_GROUP: {
    en: {
      summary:
        'Patagon Valley (~33 ha) — consolidated technology-park block of individually purchasable lots along the Cabo Negro corridor.',
      detail: GENERIC_PV.en.detail,
    },
    es: {
      summary:
        'Patagon Valley (~33 ha) — bloque de parque tecnológico consolidado, con lotes individuales adquiribles a lo largo del corredor Cabo Negro.',
      detail: GENERIC_PV.es.detail,
    },
    zh: {
      summary:
        '巴塔哥尼亚谷（约 33 公顷）——卡沃内格罗走廊沿线的科技园区综合地块，可分宗独立购入。',
      detail: GENERIC_PV.zh.detail,
    },
    fr: {
      summary:
        'Patagon Valley (~33 ha) — bloc de parc technologique consolidé composé de lots achetables individuellement le long du corridor Cabo Negro.',
      detail: GENERIC_PV.fr.detail,
    },
  },
}

const FALLBACK: ExploreCardLocales = {
  en: {
    summary: 'Developable parcel in the current Cabo Negro subdivision overlay.',
    detail:
      'This lot appears on the master subdivision layer for the Cabo Negro project. It is offered as part of the regional strategy to monetize strategic land beside the Strait of Magellan — connecting Atlantic and Pacific shipping, Punta Arenas services, and the emerging hydrogen and logistics cluster. Ask the project team for the latest parcel-specific business terms and infrastructure schedule.',
  },
  es: {
    summary: 'Parcela desarrollable en la subdivisión vigente de Cabo Negro.',
    detail:
      'Este lote figura en la capa maestra de subdivisión del proyecto Cabo Negro. Se ofrece en el marco de la estrategia regional de capitalizar suelo estratégico junto al Estrecho de Magallanes —conectando navegación Atlántico y Pacífico, servicios de Punta Arenas y el cluster emergente de hidrógeno y logística. Solicite al equipo del proyecto los términos comerciales y el calendario de infraestructura actualizados.',
  },
  zh: {
    summary: '卡沃内格罗现行分区图层中的可开发地块。',
    detail:
      '该地块出现在卡沃内格罗项目的分区主图层上，属于在麦哲伦海峡旁将战略土地资产化的区域策略的一部分——连接大西洋与太平洋航运、蓬塔阿雷纳斯服务以及新兴的氢能与物流集群。请向项目组索取最新商务条件与基建时间表。',
  },
  fr: {
    summary: 'Parcelle développable dans le plan de subdivision en vigueur à Cabo Negro.',
    detail:
      'Ce lot figure sur la couche maîtresse de subdivision du projet Cabo Negro. Il est proposé dans la stratégie régionale de valoriser le foncier stratégique près du détroit de Magellan — reliant routage Atlantique et Pacifique, services de Punta Arenas et le cluster hydrogène / logistique émergent. Demandez à l’équipe projet les derniers termes commerciaux et le calendrier d’infrastructure.',
  },
}

export function getParcelExploreCard(kmlRawName: string | undefined): ExploreCardLocales {
  if (!kmlRawName) return FALLBACK
  const k = kmlRawName.trim()
  return PARCEL_EXPLORE_CARDS[k] ?? FALLBACK
}
