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
  description: {
    en: string
    es: string
    zh: string
    fr: string
  }
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
    // 52°55′50.6″S 70°50′47.2″W — Cabo Negro project footprint (top-down ~20 km patch).
    longitude: -70.84644444444444,
    latitude: -52.93072222222222,
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
      en: 'Cabo Negro — wide view over the project area (52°55′50.6″S 70°50′47.2″W), Strait of Magellan and Patagonia.',
      es: 'Cabo Negro — vista amplia sobre el área del proyecto (52°55′50.6″S 70°50′47.2″O), Estrecho de Magallanes y Patagonia.',
      zh: '卡沃内格罗——项目区俯瞰（52°55′50.6″S 70°50′47.2″W），麦哲伦海峡与巴塔哥尼亚。',
      fr: 'Cabo Negro — vue large sur la zone du projet (52°55′50.6″S 70°50′47.2″O), détroit de Magellan et Patagonie.',
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
    /** Orbit heading: camera heading − π (matches `keyframeFromWaypoint`). */
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
      en: 'The maritime terminal provides direct access to international shipping routes across the Strait of Magellan.',
      es: 'El terminal marítimo ofrece acceso directo a rutas de transporte marítimo internacional a través del Estrecho de Magallanes.',
      zh: '海运码头提供通过麦哲伦海峡国际航运航线的直接通道。',
      fr: 'Le terminal maritime offre un accès direct aux routes de transport maritime international à travers le Détroit de Magellan.',
    },
  },
  {
    id: 'parque-logistico',
    labelEn: 'Logistics Park',
    labelEs: 'Parque Logístico',
    labelZh: '物流园区',
    labelFr: 'Parc Logistique',
    longitude: -70.832,
    latitude: -52.934,
    height: 1900,
    heading: -0.15,
    pitch: -0.36,
    guide: {
      hoverLongitudeRange: 0.05,
      hoverLatitudeRange: 0.035,
      headingRange: 0.4,
      pitchMin: -1.0,
      pitchMax: -0.12,
    },
    description: {
      en: 'A world-class logistics park designed to serve as the distribution gateway for southern South America.',
      es: 'Un parque logístico de clase mundial diseñado para servir como puerta de distribución para el sur de América del Sur.',
      zh: '世界级物流园区，旨在成为南美洲南部的分销门户。',
      fr: 'Un parc logistique de classe mondiale conçu pour servir de porte de distribution pour le sud de l\'Amérique du Sud.',
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
      en: 'An innovation hub for green hydrogen, renewable energy, and advanced manufacturing industries of the future.',
      es: 'Un hub de innovación para hidrógeno verde, energías renovables e industrias de manufactura avanzada del futuro.',
      zh: '绿色氢能、可再生能源和未来先进制造业的创新中心。',
      fr: 'Un hub d\'innovation pour l\'hydrogène vert, les énergies renouvelables et les industries manufacturières avancées du futur.',
    },
  },
  {
    id: 'coastline',
    labelEn: 'Coastline',
    labelEs: 'Costa',
    labelZh: '海岸线',
    labelFr: 'Littoral',
    longitude: -70.699709,
    latitude: -52.895605,
    height: 3015,
    heading: 4.191594,
    pitch: -0.3,
    guide: {
      hoverLongitudeRange: 0.06,
      hoverLatitudeRange: 0.04,
      headingRange: 0.5,
      pitchMin: -0.95,
      pitchMax: -0.1,
    },
    description: {
      en: 'The dramatic Patagonian coastline — rugged terrain meeting the icy waters of the Strait of Magellan.',
      es: 'El dramático litoral patagónico — terreno escarpado que se une a las aguas heladas del Estrecho de Magallanes.',
      zh: '壮观的巴塔哥尼亚海岸线——崎岖地形与麦哲伦海峡冰冷水域相遇。',
      fr: 'Le littoral spectaculaire de Patagonie — un terrain escarpé rencontrant les eaux glacées du Détroit de Magellan.',
    },
  },
  {
    id: 'punta-arenas',
    labelEn: 'Punta Arenas',
    labelEs: 'Punta Arenas',
    labelZh: '蓬塔阿雷纳斯',
    labelFr: 'Punta Arenas',
    // Ruta 9 norte / sector María Olivia — city “explore” style overview (what Vista General showed before).
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
      en: 'Punta Arenas — Ruta 9 and the María Olivia area, gateway to the Strait of Magellan and the Cabo Negro corridor.',
      es: 'Punta Arenas — Ruta 9 y sector María Olivia, puerta al Estrecho de Magallanes y al corredor de Cabo Negro.',
      zh: '蓬塔阿雷纳斯——9号公路与玛丽亚·奥利维亚一带，通往麦哲伦海峡与卡沃内格罗走廊的门户。',
      fr: 'Punta Arenas — Ruta 9 et secteur María Olivia, porte vers le détroit de Magellan et le corridor Cabo Negro.',
    },
  },
]
