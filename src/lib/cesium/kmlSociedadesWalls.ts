/**
 * Converts KML polylines into terrain-aligned cyan walls (extruded by `wallHeightM`).
 * Batches terrain sampling for performance on large KMZs (~2k LineStrings).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCesium = any

const TERRAIN_CHUNK = 4096

function chunkSampleTerrain(
  Cesium: AnyCesium,
  terrainProvider: AnyCesium,
  cartos: AnyCesium[],
): Promise<void> {
  if (cartos.length === 0) return Promise.resolve()
  const chunks: Promise<void>[] = []
  for (let i = 0; i < cartos.length; i += TERRAIN_CHUNK) {
    const slice = cartos.slice(i, i + TERRAIN_CHUNK)
    chunks.push(
      Cesium.sampleTerrainMostDetailed(terrainProvider, slice).catch(() => undefined),
    )
  }
  return Promise.all(chunks).then(() => undefined)
}

/**
 * Style polygons (cyan, alpha from getter) and replace polylines with `WallGraphics`
 * from sampled terrain up to terrain + wallHeightM.
 */
export async function applySociedadesKmlStyling(
  viewer: AnyCesium,
  Cesium: AnyCesium,
  dataSource: AnyCesium,
  getAlpha: () => number,
  wallHeightM: number,
): Promise<void> {
  const t = viewer.clock.currentTime
  const fill = Cesium.Color.fromCssColorString('#00e5ff')
  const line = Cesium.Color.fromCssColorString('#00fff0')
  const outline = Cesium.Color.fromCssColorString('#00d4ff')

  type Job = { entity: AnyCesium; cartos: AnyCesium[] }
  const jobs: Job[] = []

  for (const entity of dataSource.entities.values) {
    if (entity.polygon) {
      entity.polygon.material = new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(
          () => fill.withAlpha(0.34 * getAlpha()),
          false,
        ),
      )
      entity.polygon.outline = new Cesium.ConstantProperty(true)
      entity.polygon.outlineColor = new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(
          () => outline.withAlpha(0.95 * getAlpha()),
          false,
        ),
      )
    }

    if (!entity.polyline?.positions) continue
    const positions = entity.polyline.positions.getValue(t)
    if (!positions?.length || positions.length < 2) continue

    const cartos = positions.map((p: AnyCesium) =>
      Cesium.Cartographic.fromCartesian(p),
    )
    jobs.push({ entity, cartos })
  }

  const flat: AnyCesium[] = []
  const ranges: { entity: AnyCesium; start: number; len: number }[] = []
  for (const j of jobs) {
    const start = flat.length
    flat.push(...j.cartos)
    ranges.push({ entity: j.entity, start, len: j.cartos.length })
  }

  try {
    await chunkSampleTerrain(Cesium, viewer.terrainProvider, flat)
  } catch {
    /* ellipsoid fallback — heights stay 0 */
  }

  for (const r of ranges) {
    try {
      const cartos = flat.slice(r.start, r.start + r.len)
      const minH = cartos.map((c: AnyCesium) => c.height)
      const maxH = minH.map((h: number) => h + wallHeightM)
      const wallPositions = cartos.map((c: AnyCesium) =>
        Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height),
      )

      r.entity.polyline = undefined

      r.entity.wall = new Cesium.WallGraphics({
        positions: new Cesium.ConstantProperty(wallPositions),
        minimumHeights: new Cesium.ConstantProperty(minH),
        maximumHeights: new Cesium.ConstantProperty(maxH),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(
            () => line.withAlpha(0.88 * getAlpha()),
            false,
          ),
        ),
      })
    } catch {
      /* skip invalid ring */
    }
  }
}
