# Tile Positioning Guide

This guide explains how to correctly position a specific geographical location (latitude/longitude) to a tile in the ProceduralTileTerrain system.

## Quick Answer

For the location **52°56'13.7"S 70°50'58.7"W**:

- **Decimal degrees**: `-52.937139, -70.849639`
- **Tile coordinates (zoom 13)**: `x: 2483, y: 5521`
- **Tile key**: `13_2483_5521`
- **World position**: `X: 0.00m, Z: -45.94m` (relative to terrain center)
- **Tile offset from center**: `dx: 0, dy: -4` (4 tiles north of center)

## How It Works

The ProceduralTileTerrain system uses Web Mercator tile coordinates (same as Google Maps, OpenStreetMap, etc.). Each tile at zoom level 13 covers approximately **11.48 meters** at the latitude of Cabo Negro (-53°).

### Coordinate Systems

1. **Geographic (Lat/Lng)**: Real-world coordinates in degrees
2. **Tile Coordinates**: Web Mercator tile grid (x, y) at a specific zoom level
3. **World Position**: 3D coordinates in meters relative to terrain center

## Usage Examples

### Method 1: Using the Helper Function (Recommended)

```typescript
import { getTileForLocation } from "@/lib/terrain/coordinates";

// Your location: 52°56'13.7"S 70°50'58.7"W
const lat = -52.937139;
const lng = -70.849639;
const zoom = 13;

const tileInfo = getTileForLocation(lat, lng, zoom);

console.log("Tile:", tileInfo.tile); // { x: 2483, y: 5521 }
console.log("World position:", tileInfo.worldPosition); // [0.00, 0, -45.94]
console.log("Tile key:", tileInfo.tileKey); // "13_2483_5521"
```

### Method 2: Step-by-Step Conversion

```typescript
import {
  latLngToTileCoords,
  tileCoordsToWorldPosition,
} from "@/lib/terrain/coordinates";

// Step 1: Convert lat/lng to tile coordinates
const tile = latLngToTileCoords(-52.937139, -70.849639, 13);
// Result: { x: 2483, y: 5521 }

// Step 2: Convert tile to world position
const [x, y, z] = tileCoordsToWorldPosition(tile.x, tile.y, 13);
// Result: [0.00, 0, -45.94]
```

### Method 3: Convert DMS (Degrees/Minutes/Seconds) Format

```typescript
import { dmsToDecimal, getTileForLocation } from "@/lib/terrain/coordinates";

// Convert 52°56'13.7"S 70°50'58.7"W to decimal
const lat = dmsToDecimal(52, 56, 13.7, true); // true = South (negative)
const lng = dmsToDecimal(70, 50, 58.7, true); // true = West (negative)

// Then get tile information
const tileInfo = getTileForLocation(lat, lng, 13);
```

## Positioning 3D Objects

To position a 3D object at a specific lat/lng in your React Three Fiber scene:

```tsx
import { getTileForLocation } from "@/lib/terrain/coordinates";

function MyComponent() {
  const lat = -52.937139;
  const lng = -70.849639;
  const tileInfo = getTileForLocation(lat, lng, 13);
  const [x, y, z] = tileInfo.worldPosition;

  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
```

## Understanding Tile Coordinates

### Tile Grid System

- **Zoom level 13**: Used by ProceduralTileTerrain (default)
- **Meters per tile**: ~11.48 meters at latitude -53°
- **Tile size**: 256×256 pixels (in tile images)
- **World size**: ~11.48m × 11.48m per tile

### Tile Naming Convention

Tiles are named: `{zoom}_{x}_{y}.png`

Example: `13_2483_5521.png` is the tile at zoom 13, x=2483, y=5521

### Terrain Center Reference

The terrain center is at:

- **Lat/Lng**: `-53.061222, -70.878388`
- **Tile (zoom 13)**: `x: 2483, y: 5525`
- **World position**: `[0, 0, 0]` (origin)

All world positions are relative to this center point.

## Common Locations

| Location           | Lat        | Lng        | Tile (zoom 13) | World Position    |
| ------------------ | ---------- | ---------- | -------------- | ----------------- |
| **Cabo Negro**     | -52.937139 | -70.849639 | (2483, 5521)   | (0.00, 0, -45.94) |
| **Terrain Center** | -53.061222 | -70.878388 | (2483, 5525)   | (0, 0, 0)         |

## Functions Reference

### `getTileForLocation(lat, lng, zoom?)`

Main function to get complete tile information for a location.

**Parameters:**

- `lat`: Latitude in decimal degrees
- `lng`: Longitude in decimal degrees
- `zoom`: Zoom level (default: 13)

**Returns:**

```typescript
{
  tile: { x: number, y: number },
  worldPosition: [number, number, number],
  metersPerTile: number,
  tileKey: string
}
```

### `latLngToTileCoords(lat, lng, zoom?)`

Convert lat/lng to tile coordinates only.

### `tileCoordsToWorldPosition(tileX, tileY, zoom?)`

Convert tile coordinates to 3D world position.

### `dmsToDecimal(degrees, minutes, seconds, isSouthOrWest?)`

Convert degrees/minutes/seconds to decimal degrees.

## Troubleshooting

### Tile Not Loading

If a tile doesn't load, check:

1. The tile file exists: `/public/assets/tiles/{zoom}_{x}_{y}.png`
2. The tile coordinates are correct (use `getTileForLocation` to verify)
3. The tile is within the `loadDistance` range (default: 5 tiles from camera)

### Object Not Visible

If a positioned object isn't visible:

1. Check the world position is correct (use `getTileForLocation`)
2. Verify the object is within the camera's view frustum
3. Check if the tile containing the location is loaded

### Coordinate Mismatch

If coordinates don't match expected values:

1. Verify lat/lng are in decimal degrees (not DMS)
2. Ensure negative values for South/West
3. Check zoom level matches ProceduralTileTerrain (default: 13)

## See Also

- `/src/lib/terrain/coordinates.ts` - Coordinate conversion utilities
- `/src/lib/terrain/map-tiles.ts` - Tile loading utilities
- `/src/components/scenes/ProceduralTileTerrain.tsx` - Terrain component
- `/src/lib/terrain/tile-positioning-example.ts` - Code examples
