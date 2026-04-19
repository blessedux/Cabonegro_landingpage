import type { ExploreCardLocales } from './exploreCardText'

export interface Waypoint {
  id: string
  labelEn: string
  labelEs: string
  labelZh: string
  labelFr: string
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  guide: {
    hoverLongitudeRange: number
    hoverLatitudeRange: number
    headingRange: number
    pitchMin: number
    pitchMax: number
  }
  /** Collapsed = summary; expanded adds detail (investor-oriented). */
  description: ExploreCardLocales
}

/** ~π/2 — straight-down view for Vista General (radians). */
const NADIR = -1.5707963267948966

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'overview',
    labelEn: 'Overview',
    labelEs: 'Vista General',
    labelZh: '概览',
    labelFr: 'Vue d\'ensemble',
    longitude: -70.867435,
    latitude: -52.929151,
    height: 17500,
    heading: 0,
    pitch: NADIR,
    guide: {
      hoverLongitudeRange: 0.035,
      hoverLatitudeRange: 0.028,
      headingRange: 0.25,
      pitchMin: -1.58,
      pitchMax: -1.35,
    },
    description: {
      en: {
        summary:
          'Regional pass over Cabo Negro — ~1,200+ ha of developable land where the Strait of Magellan meets Pacific and Atlantic shipping logic.',
        detail:
          'From here you see why Patagonia is not “remote” in maritime terms: vessels can approach the Magellan corridor as a year-round alternative to longer routes, linking markets in Asia, North America, and Europe with the southern cone. Cabo Negro is the project layer on that geography — industrial, port, logistics, and technology zoning designed to capture value from trade, energy, and Antarctic support traffic. Land sales fund and accompany the masterplan (terminal spine, parks, utilities); timing is phased with permits and infrastructure, not a single speculative flip. For an overseas buyer, this is the entry frame: cold-water deep access, Chilean institutional context, and a workforce/services anchor in Punta Arenas up Ruta 9.',
      },
      es: {
        summary:
          'Pasada regional sobre Cabo Negro — ~1.200+ ha desarrollables donde el Estrecho de Magallanes se cruza con la lógica marítima Pacífico–Atlántico.',
        detail:
          'Desde aquí se entiende por qué Patagonia no es “lejana” en términos marítimos: el corredor de Magallanes ofrece navegación todo el año como alternativa a rutas más largas, conectando mercados de Asia, Norteamérica y Europa con el cono sur. Cabo Negro es la capa de proyecto sobre esa geografía — zonificación industrial, portuaria, logística y tecnológica para capturar valor de comercio, energía y tráfico de soporte antártico. La venta de suelo financia y acompaña el plan maestro (eje portuario, parques, servicios); los plazos son escalonados con permisos e infraestructura, no un único evento especulativo. Para un comprador en el exterior: acceso a aguas frías profundas, marco institucional chileno y polo de servicios y mano de obra en Punta Arenas por la Ruta 9.',
      },
      zh: {
        summary:
          '卡沃内格罗区域掠过——约 1,200+ 公顷可开发用地，麦哲伦海峡与太平洋、大西洋航运逻辑在此交汇。',
        detail:
          '从这里可以理解巴塔哥尼亚在海运意义上并非“偏远”：船可选择麦哲伦走廊作为全年替代更长航线，连接亚洲、北美、欧洲与南锥体市场。卡沃内格罗是在这一地理之上的项目层——工业、港口、物流与科技分区，旨在从贸易、能源与南极保障交通中捕获价值。土地出让服务于并配套总体规划（港区主轴、园区、公用设施）；节奏随许可与基建分期，而非单次投机。对海外买家而言：冷水深水通达、智利制度环境，以及经 9 号公路连接的蓬塔阿雷纳斯服务与劳动力支点。',
      },
      fr: {
        summary:
          'Passage régional sur Cabo Negro — ~1 200+ ha développables où le détroit de Magellan croise la logistique maritime Pacifique–Atlantique.',
        detail:
          'D’ici, la Patagonie n’est pas « lointaine » pour le maritime : le corridor de Magellan offre une navigation à l’année comme alternative à des routes plus longues, reliant Asie, Amérique du Nord et Europe au cône sud. Cabo Negro est la couche projet sur cette géographie — zonage industriel, portuaire, logistique et technologique pour capter valeur commerce, énergie et trafic de soutien antarctique. Les ventes de foncier financent et accompagnent le schéma directeur (axe portuaire, parcs, services) ; le calendrier est phasé avec permis et infrastructures, pas un pari unique. Pour un acquéreur étranger : accès eaux froides profondes, cadre institutionnel chilien et ancrage services / main-d’œuvre à Punta Arenas via la Ruta 9.',
      },
    },
  },
  {
    id: 'terminal-maritimo',
    labelEn: 'Maritime Terminal',
    labelEs: 'Terminal Marítimo',
    labelZh: '海运码头',
    labelFr: 'Terminal Maritime',
    longitude: -70.842343,
    latitude: -52.916083,
    height: 794,
    heading: -0.885598653589793,
    pitch: -0.448934,
    guide: {
      hoverLongitudeRange: 0.04,
      hoverLatitudeRange: 0.03,
      headingRange: 0.35,
      pitchMin: -1.0,
      pitchMax: -0.15,
    },
    description: {
      en: {
        summary:
          'Multipurpose maritime terminal — protected berths, heavy logistics, and a platform for green molecules and Antarctic-linked traffic.',
        detail:
          'This waypoint is the water-side engine of the project: deep enough draft envelope for modern ocean shipping, sheltered operations relative to open-ocean exposure, and staging yards that can feed import/export corridors across the southern cone. Commercially, it is where cargo owners save distance and risk by using the Strait as a hub rather than sailing extra days. The business case ties to hydrogen derivatives, bulk, breakbulk, and specialty logistics — sectors that care about energy, land behind the quay, and reliable routing between Atlantic and Pacific narratives. Sales of adjacent land (lots and parks) are meant to lock in tenants whose throughput justifies the terminal capex; timeframe follows port concessions, environmental licensing, and market uptake in waves.',
      },
      es: {
        summary:
          'Terminal marítimo multipropósito — muelles resguardados, logística pesada y plataforma para moléculas verdes y tráfico vinculado a la Antártica.',
        detail:
          'Este punto es el motor costero del proyecto: envolvente de calado para navegación oceánica moderna, operación más resguardada que en mar abierto y patios de staging que alimentan corredores import/export en el cono sur. Comercialmente, es donde el cargador ahorra distancia y riesgo usando el Estrecho como eje en lugar de días extra de navegación. El caso de negocio se liga a derivados de hidrógeno, granel, multipropósito y logística especializada — sectores que valoran energía, suelo tras el muelle y rutas fiables entre narrativas Atlántico y Pacífico. La venta de franjas lindantes (lotes y parques) busca asegurar ocupación cuyo flujo justifique el capex portuario; los plazos siguen concesiones, permisos ambientales y adopción de mercado por oleadas.',
      },
      zh: {
        summary:
          '多用途海运码头——避风泊位、重载物流，以及绿氢分子与南极关联流量的平台。',
        detail:
          '该航点是项目的水侧引擎：满足现代远洋船舶吃水包络，相对外海更具遮蔽，后方堆场可向南锥体进出口走廊喂给。商业上，货主可把海峡当枢纽以减少航程与风险，而非多绕数日。商业逻辑绑定氢衍生物、散货、件杂货与专业物流——这些行业关注能源、码头后方用地以及大西洋与太平洋航线叙事下的可靠性。相邻土地（地块与园区）出让旨在锁定能以吞吐量支撑码头资本开支的租户；时间线与港口特许、环境许可及分波市场接受度一致。',
      },
      fr: {
        summary:
          'Terminal maritime multipurpose — postes abrités, logistique lourde et plateforme pour molécules vertes et trafic lié à l’Antarctique.',
        detail:
          'Ce point d’intérêt est le moteur côté mer : enveloppe de tirant d’eau pour le transport océanique moderne, opérations plus abritées que pleine mer, et cours de staging alimentant les corridors import/export du cône sud. Commercialement, c’est là que les chargeurs réduisent distance et risque en utilisant le détroit comme hub plutôt que des jours de navigation supplémentaires. Le cas business relie dérivés hydrogène, vrac, polyvalence et logistique spécialisée — secteurs sensibles à l’énergie, au foncier derrière quai et à la fiabilité des routes Atlantique / Pacifique. Les ventes de parcelles voisines visent des occupants dont le débit justifie le capex portuaire ; calendrier aligné sur concessions, autorisations environnementales et adoption marché par vagues.',
      },
    },
  },
  {
    id: 'parque-logistico',
    labelEn: 'Logistic Park',
    labelEs: 'Parque Logístico',
    labelZh: '物流园区',
    labelFr: 'Parc Logistique',
    longitude: -70.911794,
    latitude: -52.916795,
    height: 1250,
    heading: -1.442758653589793,
    pitch: -0.450194,
    guide: {
      hoverLongitudeRange: 0.05,
      hoverLatitudeRange: 0.035,
      headingRange: 0.4,
      pitchMin: -1.0,
      pitchMax: -0.12,
    },
    description: {
      en: {
        summary:
          'Logistics park — back-of-port warehousing, distribution, and bonded-style flows tied to Ruta 9 and the Strait corridor.',
        detail:
          'Investors should read this as the buffer between ship and shelf: consolidation, deconsolidation, cold chain, and project logistics that cannot live on the quay line alone. Punta Arenas supplies services, customs expertise, and air connectivity for urgent cargo; the park supplies hectares and truck circulation for everything else. The commercial logic is southern-cone import/export — Chile, Argentina, and regional trade — with Cabo Negro acting as a maritime gateway where Atlantic and Pacific routing options meet Patagonian demand. Parcels here are sold to anchor 3PL, commodity traders, and industrial tenants who need predictable hand-offs from vessel to inland transport; phasing tracks terminal throughput and highway upgrades.',
      },
      es: {
        summary:
          'Parque logístico — almacenamiento tras puerto, distribución y flujos tipo bajo custodia ligados a la Ruta 9 y al corredor del Estrecho.',
        detail:
          'Inversores: piensen el buffer entre barco y góndola — consolidación, desconsolidación, frío y logística de proyecto que no caben solo en línea de muelle. Punta Arenas aporta servicios, experiencia aduanera y conectividad aérea para cargas urgentes; el parque aporta hectáreas y circulación camionera para el resto. La lógica comercial es import/export del cono sur — Chile, Argentina y comercio regional — con Cabo Negro como puerta marítima donde convergen opciones Atlántico/Pacífico y demanda patagónica. Los lotes se venden para anclar 3PL, trading de commodities e industria que requiere transferencias predecibles de buque a transporte interior; el phasing sigue el throughput portuario y mejoras de ruta.',
      },
      zh: {
        summary:
          '物流园——港后仓储分拨与类保税流，衔接 9 号公路与海峡走廊。',
        detail:
          '投资者应将其理解为船与货架之间的缓冲：拼拆箱、冷链与项目物流，无法全部放在岸线。蓬塔阿雷纳斯提供服务、关务经验与急货空运；园区提供公顷级用地与重卡动线。商业逻辑是南锥体进出口——智利、阿根廷与区域贸易——卡沃内格罗作为海运门户，大西洋与太平洋航线选择与巴塔哥尼亚需求交汇。此地出让旨在吸引第三方物流、大宗商品贸易商与需要船到内陆可靠交接的工业租户；分期与码头吞吐量及公路升级同步。',
      },
      fr: {
        summary:
          'Parc logistique — entrepôts arrière-port, distribution et flux type entrepôt liés à la Ruta 9 et au corridor du détroit.',
        detail:
          'À lire comme tampon navire → rayon : consolidation, déconsolidation, froid et logistique projet impossible sur seule la ligne de quai. Punta Arenas apporte services, expertise douanière et lien aérien pour l’urgent ; le parc apporte hectares et circulation poids lourds pour le reste. La logique commerciale est import/export cône sud — Chili, Argentine, commerce régional — avec Cabo Negro comme porte maritime où options Atlantique / Pacifique croisent la demande patagonienne. Les lots visent ancrer 3PL, négociants et industriels qui veulent des transferts prévisibles du navire au transport intérieur ; phasing aligné sur débit terminal et upgrades routiers.',
      },
    },
  },
  {
    id: 'parque-tecnologico',
    labelEn: 'Technology Park',
    labelEs: 'Parque Tecnológico',
    labelZh: '科技园区',
    labelFr: 'Parc Technologique',
    longitude: -70.860034,
    latitude: -52.948507,
    height: 1037,
    heading: -2.675401653589793,
    pitch: -0.468321,
    guide: {
      hoverLongitudeRange: 0.05,
      hoverLatitudeRange: 0.035,
      headingRange: 0.4,
      pitchMin: -1.0,
      pitchMax: -0.12,
    },
    description: {
      en: {
        summary:
          'Patagon Valley technology park — ~33 ha cluster for R&D, light manufacturing, and digital operations powered by southern renewables.',
        detail:
          'This zone is where “Magallanes energy meets industry”: wind-rich grids, future hydrogen molecules, and space for data-heavy or process-light plants that still need port proximity. For global investors, the pitch is not generic tech — it is location-specific advantage in power price and carbon narrative, plus access to the same maritime corridor that serves world trade. Land is sold to assemble a tenant mix (suppliers, service firms, advanced manufacturing) that reinforces the port and logistics parks rather than competing with them. Expect phased building rights and design guidelines that keep the campus coherent; timeframe aligns with power purchase availability and anchor tenants.',
      },
      es: {
        summary:
          'Parque tecnológico Patagon Valley — cluster ~33 ha para I+D, manufactura ligera y operaciones digitales con renovables austral.',
        detail:
          'Aquí converge “energía de Magallanes e industria”: redes con mucho viento, futuras moléculas de hidrógeno y espacio para plantas data-heavy o de proceso ligero que aún requieren proximidad portuaria. Para inversores globales, no es “tech genérico” — es ventaja local en precio de energía y narrativa de carbono, más acceso al mismo corredor marítimo del comercio mundial. El suelo se vende para componer un mix de ocupantes (proveedores, servicios, manufactura avanzada) que refuerce terminal y parques logísticos en lugar de competir. Espere derechos de edificación por fases y normas de diseño que mantengan coherencia de campus; plazos alineados a disponibilidad de PPA y tenants ancla.',
      },
      zh: {
        summary:
          '巴塔哥尼亚谷科技园区——约 33 公顷集群，面向研发、轻制造与数字运营，依托南部可再生能源。',
        detail:
          '这里是“麦哲伦能源与工业交汇”之处：高风电并网、未来氢分子，以及仍需港区邻近的数据重或流程轻厂房。对全球投资者，卖点不是泛科技——而是电价与碳叙事上的区位红利，加上通达全球贸易的同一海运走廊。土地出让旨在组合租户（供应商、服务商、先进制造）以强化港口与物流园而非内耗。建设权与导则分期释放以保持园区一致性；时间线与购电协议可得性及龙头租户一致。',
      },
      fr: {
        summary:
          'Parc technologique Patagon Valley — cluster ~33 ha pour R&D, fabrication légère et ops digitales alimentées par le renouvelable austral.',
        detail:
          'Ici se rencontrent « énergie de Magellan et industrie » : réseaux éoliens, molécules hydrogène futures, et espace pour sites data-heavy ou procédés légers tout en restant proches du port. Pour investisseurs mondiaux, ce n’est pas de la tech générique — c’est un avantage local sur prix de l’électricité et récit carbone, plus accès au même corridor maritime du commerce mondial. Les terrains visent un mix locataires (fournisseurs, services, fabrication avancée) qui renforce terminal et parcs logistiques plutôt que de les concurrencer. Attendez droits de construction phasés et règles de design pour garder un campus cohérent ; calendrier aligné sur disponibilité PPA et ancres.',
      },
    },
  },
  {
    id: 'punta-arenas',
    labelEn: 'Punta Arenas',
    labelEs: 'Punta Arenas',
    labelZh: '蓬塔阿雷纳斯',
    labelFr: 'Punta Arenas',
    longitude: -70.878,
    latitude: -53.098,
    height: 17500,
    heading: 0,
    pitch: NADIR,
    guide: {
      hoverLongitudeRange: 0.035,
      hoverLatitudeRange: 0.028,
      headingRange: 0.25,
      pitchMin: -1.58,
      pitchMax: -1.35,
    },
    description: {
      en: {
        summary:
          'Punta Arenas — regional capital on the Strait: historic maritime hub, Ruta 9 gateway, and service base for Cabo Negro.',
        detail:
          'Founded as a maritime supply point, the city is still the human and institutional interface for Magellan traffic — ship agencies, cold storage, repairs, crew change, and government services. For trade, Punta Arenas sits where southbound Atlantic routes and Pacific-bound scheduling decisions meet Patagonian producers and importers. Investors use it as the workforce, housing, education, and healthcare anchor for anything built at Cabo Negro ~45–60 minutes north by road. The commercial story for Asia or global capital is straightforward: you are not buying only hectares — you are buying access to a functioning port city with air links and a labor pool accustomed to logistics, fishing, energy, and Antarctic programs.',
      },
      es: {
        summary:
          'Punta Arenas — capital regional sobre el Estrecho: polo marítimo histórico, puerta Ruta 9 y base de servicios para Cabo Negro.',
        detail:
          'Nacida como punto de abastecimiento marítimo, la ciudad sigue siendo la interfaz humana e institucional del tráfico de Magallanes — agencias, frío, reparaciones, relevos de tripulación y servicios públicos. En comercio, Punta Arenas es donde convergen rutas atlánticas hacia el sur y decisiones de programación hacia el Pacífico con productores e importadores patagónicos. Los inversores la usan como ancla de mano de obra, vivienda, educación y salud para lo que se construye en Cabo Negro (~45–60 min al norte por ruta). Para capital asiático o global: no solo hectáreas — acceso a una ciudad portuaria operativa, con enlace aéreo y mano de obra habituada a logística, pesca, energía y programas antárticos.',
      },
      zh: {
        summary:
          '蓬塔阿雷纳斯——海峡上的大区首府：历史海运枢纽、9 号公路门户与卡沃内格罗服务基地。',
        detail:
          '城市源于海运补给点，至今仍是麦哲伦流量的制度与服务界面——船代、冷库、维修、换班与政府服务。贸易上，蓬塔阿雷纳斯处在大西洋南下航线与太平洋班期决策与巴塔哥尼亚产消交汇之处。投资者将其作为卡沃内格罗（公路向北约 45–60 分钟）项目的劳动力、居住、教育与医疗支点。对亚洲或全球资本：买的不仅是公顷——还有具备空运、熟悉物流/渔业/能源与南极项目的港口城市配套。',
      },
      fr: {
        summary:
          'Punta Arenas — capitale régionale sur le détroit : hub maritime historique, porte Ruta 9 et base de services pour Cabo Negro.',
        detail:
          'Née comme relais maritime d’approvisionnement, la ville reste l’interface humaine et institutionnelle du trafic de Magellan — agences, froid, réparations, équipages et services publics. Pour le commerce, Punta Arenas est le point où routes atlantiques vers le sud et arbitrages de planning Pacifique croisent producteurs et importateurs patagoniens. Les investisseurs l’utilisent comme ancrage emploi, logement, santé et éducation pour tout ce qui se construit à Cabo Negro (~45–60 min au nord par route). Pour capitaux asiatiques ou globaux : on n’achète pas seulement des hectares — on achète l’accès à une ville portuaire fonctionnelle, avec lien aérien et main-d’œuvre habituée logistique, pêche, énergie et programmes antarctiques.',
      },
    },
  },
]
