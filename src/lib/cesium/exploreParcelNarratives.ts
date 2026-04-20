/**
 * Investor-facing copy for subdivision parcels (SUBDIVISIÓN VIGENTE + Sociedades CN KMZ names).
 * Summary = collapsed card; detail = expanded. Keys must match KML `<name>` exactly,
 * or be a synthetic key assigned by code (e.g. PATAGON_VALLEY_GROUP, PPG CM61260).
 */

import type { ExploreCardLocales } from './exploreCardText'

const GENERIC_PV: ExploreCardLocales = {
  en: {
    summary:
      'Patagon Valley lot — developable slice within the ~33 ha technology-park fabric next to the Cabo Negro corridor.',
    detail:
      'This parcel is part of the current Cabo Negro subdivision and is positioned for port-linked innovation uses: R&D, light manufacturing, data and control rooms, and services that benefit from Magallanes\' renewable power story. Plots are offered to bring forward a coordinated technology district beside the maritime terminal and logistics stack, shortening time-to-operation for tenants who need power, space, and access to the Strait. Commercially, it is a land play in a region where energy-intensive industry is actively recruiting capacity — with phased delivery tied to the wider master development rather than a distant speculative horizon.',
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
      "Cette parcelle relève du plan de subdivision en vigueur à Cabo Negro et vise des usages d'innovation liés au port : R&D, fabrication légère, salles de données et de contrôle, et services tirant parti du récit énergétique renouvelable de Magellan. Les lots sont cédés pour faire émerger un district technologique coordonné près du terminal maritime et de la pile logistique, réduisant les délais pour des opérateurs qui ont besoin de puissance, de surface et d'accès au détroit. Commercialement, il s'agit d'un positionnement foncier dans une région où l'industrie intensive en énergie recrute de la capacité — avec une livraison phasée alignée sur le schéma directeur, plutôt qu'un horizon spéculatif lointain.",
  },
}

export const PARCEL_EXPLORE_CARDS: Record<string, ExploreCardLocales> = {
  'LOTE A (CN2)': {
    en: {
      summary:
        'Cabo Negro Dos (~173 ha) — large-format industrial and logistics platform at the heart of the Strait sector.',
      detail:
        'This is the flagship land block for heavy footprint uses: port-related industry, bulk and container back-up, energy conversion plants, and staging that needs depth and distance from urban centers. It is being sold to secure anchor investment for the Cabo Negro complex — linking Punta Arenas\' workforce and services to a greenfield site with room for quay-aligned supply chains. For an Asian or global investor, the value is geographic: you sit on the Magellan corridor where Atlantic and Pacific routing options converge, with year-round navigation and a political narrative around hydrogen and southern logistics. Timing follows project infrastructure phasing; the lot is priced as strategic land bank for multi-year industrial rollout.',
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
        "Il s'agit du bloc phare pour les usages lourds : industrie portuaire, secours vrac et conteneurs, conversion énergétique et aires de staging nécessitant profondeur et éloignement des centres urbains. La vente vise à ancrer l'investissement dans le complexe Cabo Negro — reliant la main-d'œuvre et les services de Punta Arenas à un site vert avec place pour des chaînes d'approvisionnement alignées quai. Pour un investisseur asiatique ou mondial, la valeur est géographique : position sur le corridor de Magellan où se croisent options de routage Atlantique et Pacifique, navigation à l'année et récit politique hydrogène / logistique australe. Le calendrier suit le phasing des infrastructures ; le lot est positionné comme réserve foncière industrielle pluriannuelle.",
    },
  },

  // ── Patagon Valley lots ────────────────────────────────────────────────────
  'Sitio 7': {
    en: { summary: GENERIC_PV.en.summary, detail: GENERIC_PV.en.detail },
    es: { summary: GENERIC_PV.es.summary, detail: GENERIC_PV.es.detail },
    zh: { summary: GENERIC_PV.zh.summary, detail: GENERIC_PV.zh.detail },
    fr: { summary: GENERIC_PV.fr.summary, detail: GENERIC_PV.fr.detail },
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
        '巴塔哥尼亚谷（3 号地块）——33 公顷轮廓内偏"锚点"角色的区段，适合希望在园区内具辨识度的运营商。',
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

  /** Synthetic key — entire PV small-lot cluster selected together. */
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

  // ── J&P lots ────────────────────────────────────────────────────────────────
  /** Main J&P waterfront lot — lives in Subdivision KMZ as 'J&P Continuadora'. */
  'J&P Continuadora': {
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
        "C'est la tranche côtière premium : couplage visuel et opérationnel plus fort avec le terminal maritime et les circulations littorales. Elle s'adresse aux investisseurs qui veulent un actif explicitement lié au détroit — froid, carburants et chimie sous normes de sécurité, groupage de cargaisons projet ou fabrication avancée alimentant les opérations portuaires. La vente s'inscrit dans la libération foncière actuelle de Cabo Negro pour cofinancer infrastructures portuaires et parcs ; calendrier aligné sur concessions et permis environnementaux, pas sur un lotissement retail immédiat.",
    },
  },

  /** J&P III — Sociedades CN KMZ polygon 'J&P Dos'. */
  'J&P Dos': {
    en: {
      summary:
        'J&P III — third J&P parcel completing the waterfront industrial corridor adjacent to J&P and J&P II.',
      detail:
        'J&P III closes the J&P corridor on the outer side, providing a third parcel of similar scale in the same maritime-industrial zone. It shares the strategic positioning of J&P and J&P II — direct coupling to the Strait of Magellan shipping lane, the Cabo Negro port infrastructure, and the Punta Arenas logistics hub — and is marketed for the same class of heavy industrial, energy, and logistics end-uses. It can be acquired as a standalone lot or as the third leg of a corridor package with J&P and J&P II.',
    },
    es: {
      summary:
        'J&P III — tercera parcela J&P que completa el corredor industrial costero junto a J&P y J&P II.',
      detail:
        'J&P III cierra el corredor J&P por el lado exterior, aportando una tercera parcela de escala similar en la misma zona marítimo-industrial. Comparte el posicionamiento estratégico de J&P y J&P II — acoplamiento directo al canal de navegación del Estrecho de Magallanes, la infraestructura portuaria de Cabo Negro y el hub logístico de Punta Arenas — y se comercializa para la misma clase de usos finales industriales pesados, energéticos y logísticos. Puede adquirirse como lote independiente o como tercer tramo de un paquete de corredor con J&P y J&P II.',
    },
    zh: {
      summary:
        'J&P III——第三块 J&P 地块，与 J&P 及 J&P II 共同完成滨水工业走廊布局。',
      detail:
        'J&P III 从外侧收尾 J&P 走廊，在同一海运工业区提供第三块规模相近的地块。与 J&P 及 J&P II 共享战略定位——与麦哲伦海峡航道、卡沃内格罗港口基础设施及蓬塔阿雷纳斯物流枢纽的直接衔接——面向同类重工业、能源与物流最终用途。可作为独立地块购入，也可作为 J&P 与 J&P II 走廊整包的第三段。',
    },
    fr: {
      summary:
        'J&P III — troisième parcelle J&P complétant le corridor industriel littoral aux côtés de J&P et J&P II.',
      detail:
        "J&P III ferme le corridor J&P côté extérieur, apportant une troisième parcelle de taille similaire dans la même zone maritime-industrielle. Elle partage le positionnement stratégique de J&P et J&P II — couplage direct au chenal de navigation du détroit de Magellan, l'infrastructure portuaire de Cabo Negro et le hub logistique de Punta Arenas — et est commercialisée pour la même classe d'usages finaux industriels lourds, énergétiques et logistiques. Elle peut être acquise comme lot autonome ou comme troisième volet d'un package de corridor avec J&P et J&P II.",
    },
  },

  /** J&P II — Sociedades CN KMZ polygon 'J&P Tres'. */
  'J&P Tres': {
    en: {
      summary:
        'J&P II — second J&P parcel forming the mid-section of the waterfront industrial line alongside J&P.',
      detail:
        'J&P II extends the J&P land package with a contiguous parcel of comparable scale positioned between the main J&P lot and J&P III. Suited to the same range of maritime and industrial uses — deep-sea logistics, energy infrastructure, advanced manufacturing — it offers an investor the ability to take a larger combined footprint or an independent stake in the Cabo Negro shoreline strategy. Phasing and permitting follow the same project timeline as J&P; the lots can be acquired separately or as part of a consolidated J&P corridor purchase.',
    },
    es: {
      summary:
        'J&P II — segunda parcela J&P que forma la sección central de la línea industrial costera junto a J&P.',
      detail:
        'J&P II amplía el paquete de suelo J&P con una parcela contigua de escala comparable, ubicada entre el lote principal J&P y J&P III. Apta para los mismos usos marítimos e industriales —logística de gran calado, infraestructura energética, manufactura avanzada— permite a un inversor acceder a una huella combinada mayor o una participación independiente en la estrategia costera de Cabo Negro. Plazos y permisos siguen el mismo calendario del proyecto que J&P; los lotes pueden adquirirse por separado o como parte de una compra consolidada del corredor J&P.',
    },
    zh: {
      summary:
        'J&P II——第二块 J&P 地块，构成滨水工业线 J&P 旁的中段。',
      detail:
        'J&P II 以规模相近的毗邻地块延伸 J&P 土地包，位于主 J&P 地块与 J&P III 之间。适合相同的海运与工业用途——深水物流、能源基础设施、先进制造——使投资者既可获得更大的联合体量，也可作为卡沃内格罗岸线战略中的独立持股。分期与许可遵循与 J&P 相同的项目时间线；各地块可独立购入，也可作为 J&P 走廊整体收购的一部分。',
    },
    fr: {
      summary:
        'J&P II — deuxième parcelle J&P formant la section médiane de la ligne industrielle littorale aux côtés de J&P.',
      detail:
        "J&P II prolonge le package foncier J&P avec une parcelle contiguë de taille comparable, positionnée entre le lot J&P principal et J&P III. Adaptée aux mêmes usages maritimes et industriels — logistique hauturière, infrastructure énergétique, fabrication avancée — elle permet à un investisseur de prendre une empreinte combinée plus large ou une participation indépendante dans la stratégie littorale de Cabo Negro. Phasage et permis suivent le même calendrier projet que J&P ; les lots peuvent être acquis séparément ou dans le cadre d'un achat consolidé du corridor J&P.",
    },
  },

  // ── Maritime terminal ──────────────────────────────────────────────────────
  /**
   * PPG CM61260 — boundary polygons of the maritime terminal.
   * Entity names assigned in code to unnamed polygon entities in the PPG dataset.
   */
  'PPG CM61260': {
    en: {
      summary:
        'PPG CM61260 — maritime terminal boundary at the heart of the Cabo Negro port complex.',
      detail:
        'PPG CM61260 marks the concession boundary of the Cabo Negro maritime terminal — the operational core of the port infrastructure fronting the Strait of Magellan. This is where ship movements, quay allocation, and cargo handling intersect with the broader project logistics. The terminal footprint defines the interface between the land parcels (J&P corridor, Patagon Valley, CN2) and the navigable waterway; its concession status and phasing directly govern the timing of adjacent land development. Any investor evaluating the surrounding lots should assess PPG CM61260 as the anchor infrastructure around which the Cabo Negro masterplan is structured.',
    },
    es: {
      summary:
        'PPG CM61260 — límite del terminal marítimo en el corazón del complejo portuario Cabo Negro.',
      detail:
        'PPG CM61260 delimita la concesión del terminal marítimo de Cabo Negro — el núcleo operacional de la infraestructura portuaria frente al Estrecho de Magallanes. Aquí convergen los movimientos de naves, la asignación de muelles y la manipulación de carga con la logística global del proyecto. La huella del terminal define la interfaz entre los lotes terrestres (corredor J&P, Patagon Valley, CN2) y la vía navegable; su estado concesional y su phasing gobiernan directamente el calendario del desarrollo de suelo adyacente. Todo inversor que evalúe los lotes circundantes debe considerar PPG CM61260 como la infraestructura ancla en torno a la cual se estructura el plan maestro de Cabo Negro.',
    },
    zh: {
      summary:
        'PPG CM61260——卡沃内格罗港口综合体核心的海运码头边界。',
      detail:
        'PPG CM61260 标示卡沃内格罗海运码头特许经营边界——面向麦哲伦海峡的港口基础设施的运营核心。船舶动态、泊位分配与货物装卸在此与整体项目物流交汇。码头用地界定了陆地地块（J&P 走廊、巴塔哥尼亚谷、CN2）与可航水道之间的接口；其特许状态与分期节奏直接决定毗邻土地的开发时序。评估周边地块的投资者应将 PPG CM61260 视为卡沃内格罗总体规划围绕其构建的锚定基础设施。',
    },
    fr: {
      summary:
        'PPG CM61260 — périmètre du terminal maritime au cœur du complexe portuaire Cabo Negro.',
      detail:
        "PPG CM61260 délimite la concession du terminal maritime de Cabo Negro — le noyau opérationnel de l'infrastructure portuaire face au détroit de Magellan. C'est ici que se croisent les mouvements de navires, l'affectation des quais et la manutention des marchandises avec la logistique globale du projet. L'empreinte du terminal définit l'interface entre les parcelles terrestres (corridor J&P, Patagon Valley, CN2) et la voie navigable ; son statut de concession et son phasage gouvernent directement le calendrier de développement des terrains adjacents. Tout investisseur évaluant les lots environnants devrait considérer PPG CM61260 comme l'infrastructure d'ancrage autour de laquelle le schéma directeur de Cabo Negro est structuré.",
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
      "Ce lot figure sur la couche maîtresse de subdivision du projet Cabo Negro. Il est proposé dans la stratégie régionale de valoriser le foncier stratégique près du détroit de Magellan — reliant routage Atlantique et Pacifique, services de Punta Arenas et le cluster hydrogène / logistique émergent. Demandez à l'équipe projet les derniers termes commerciaux et le calendrier d'infrastructure.",
  },
}

export function getParcelExploreCard(kmlRawName: string | undefined): ExploreCardLocales {
  if (!kmlRawName) return FALLBACK
  const k = kmlRawName.trim()
  return PARCEL_EXPLORE_CARDS[k] ?? FALLBACK
}
