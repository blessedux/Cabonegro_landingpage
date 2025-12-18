# Quick Debug Guide: Satellite Imagery Not Showing

## Browser Console Debug Scripts

Copy and paste these into your browser console (F12) on the `/map` page:

### 1. Check Material and Uniforms

```javascript
const terrain = window.__terrainMesh;
if (!terrain) {
  console.error("❌ Terrain mesh not found in window.__terrainMesh");
} else {
  console.log("✅ Terrain mesh found");
  console.log("Material type:", terrain.material?.constructor.name);

  if (terrain.material?.uniforms) {
    const u = terrain.material.uniforms;
    console.log("Uniforms:", {
      minHeight: u.minHeight?.value,
      maxHeight: u.maxHeight?.value,
      useSatellite: u.useSatellite?.value,
      hasSatelliteTexture: !!u.satelliteTexture?.value,
    });

    if (u.satelliteTexture?.value) {
      const tex = u.satelliteTexture.value;
      console.log("Satellite texture:", {
        type: tex.constructor.name,
        hasImage: !!tex.image,
        imageType: tex.image?.constructor.name,
        imageSize: tex.image
          ? `${tex.image.width}x${tex.image.height}`
          : "none",
        needsUpdate: tex.needsUpdate,
      });
    }
  }
}
```

### 2. Check Canvas Content

```javascript
const terrain = window.__terrainMesh;
if (terrain?.material?.uniforms?.satelliteTexture?.value) {
  const tex = terrain.material.uniforms.satelliteTexture.value;
  if (tex.image instanceof HTMLCanvasElement) {
    const canvas = tex.image;
    const ctx = canvas.getContext("2d");
    const sample = ctx.getImageData(
      canvas.width / 2,
      canvas.height / 2,
      100,
      100
    );

    let nonBlack = 0;
    let total = 0;
    for (let i = 0; i < sample.data.length; i += 4) {
      total++;
      const r = sample.data[i];
      const g = sample.data[i + 1];
      const b = sample.data[i + 2];
      if (r > 5 || g > 5 || b > 5) {
        nonBlack++;
      }
    }

    console.log(
      `Canvas content: ${((nonBlack / total) * 100).toFixed(
        2
      )}% non-black pixels`
    );
    console.log(
      "Sample pixel (center):",
      `rgb(${sample.data[0]}, ${sample.data[1]}, ${sample.data[2]})`
    );

    if (nonBlack / total < 0.01) {
      console.error("❌ Canvas appears empty - tiles may not have loaded!");
    } else {
      console.log("✅ Canvas has content");
    }
  } else {
    console.error(
      "❌ Texture image is not a canvas:",
      tex.image?.constructor.name
    );
  }
}
```

### 3. Force Enable Satellite Texture

```javascript
const terrain = window.__terrainMesh;
if (terrain?.material?.uniforms) {
  terrain.material.uniforms.useSatellite.value = 1.0;
  if (terrain.material.uniforms.satelliteTexture?.value) {
    terrain.material.uniforms.satelliteTexture.value.needsUpdate = true;
  }
  console.log("✅ Forced satellite texture enabled");
  console.log("useSatellite:", terrain.material.uniforms.useSatellite.value);
}
```

### 4. Test Tile URL

```javascript
// Test ESRI tile for terrain center (zoom 13)
const lat = -53.061222;
const lng = -70.878388;
const zoom = 13;

function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

const tile = latLngToTile(lat, lng, zoom);
const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tile.y}/${tile.x}`;

console.log("Center tile:", tile);
console.log("Tile URL:", url);
console.log("Opening in new tab...");
window.open(url, "_blank");
```

### 5. Check Network Requests

```javascript
// Check if tiles are being requested
const networkEntries = performance
  .getEntriesByType("resource")
  .filter(
    (e) =>
      e.name.includes("arcgis") ||
      e.name.includes("google") ||
      e.name.includes("bing")
  );

console.log(`Found ${networkEntries.length} tile requests`);
networkEntries.slice(0, 10).forEach((e) => {
  console.log(
    `${e.name.includes("arcgis") ? "✅" : "⚠️"} ${e.name.substring(0, 80)}...`
  );
});
```

### 6. Full Diagnostic

```javascript
console.log("=== TERRAIN DIAGNOSTIC ===");
const terrain = window.__terrainMesh;

if (!terrain) {
  console.error("❌ Terrain mesh not found");
} else {
  console.log("✅ Terrain mesh exists");
  console.log(
    "Geometry vertices:",
    terrain.geometry?.attributes?.position?.count || "none"
  );
  console.log("Material:", terrain.material?.constructor.name || "none");

  if (terrain.material?.uniforms) {
    const u = terrain.material.uniforms;
    console.log("\n--- Uniforms ---");
    console.log("minHeight:", u.minHeight?.value);
    console.log("maxHeight:", u.maxHeight?.value);
    console.log(
      "useSatellite:",
      u.useSatellite?.value,
      u.useSatellite?.value === 1.0 ? "✅" : "❌"
    );

    if (u.satelliteTexture?.value) {
      const tex = u.satelliteTexture.value;
      console.log("\n--- Satellite Texture ---");
      console.log("Type:", tex.constructor.name);
      console.log("Has image:", !!tex.image);

      if (tex.image) {
        console.log("Image type:", tex.image.constructor.name);
        if (tex.image instanceof HTMLCanvasElement) {
          console.log("Canvas size:", `${tex.image.width}x${tex.image.height}`);

          // Check content
          const ctx = tex.image.getContext("2d");
          const sample = ctx.getImageData(
            tex.image.width / 2,
            tex.image.height / 2,
            10,
            10
          );
          let hasContent = false;
          for (let i = 0; i < sample.data.length; i += 4) {
            if (
              sample.data[i] > 5 ||
              sample.data[i + 1] > 5 ||
              sample.data[i + 2] > 5
            ) {
              hasContent = true;
              break;
            }
          }
          console.log("Has content:", hasContent ? "✅" : "❌");
        }
      }
    } else {
      console.error("❌ No satellite texture uniform");
    }
  } else {
    console.error("❌ Material has no uniforms");
  }
}
console.log("=== END DIAGNOSTIC ===");
```

---

## Quick Fixes

### If `useSatellite` is 0.0:

```javascript
window.__terrainMesh.material.uniforms.useSatellite.value = 1.0;
```

### If texture exists but is black:

The tiles may not have loaded. Check network tab for failed requests.

### If CORS errors:

The tile provider is blocking requests. ESRI should work, but if not, try:

1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Check if `basemaps.arcgis.com` is still being used (should use `server.arcgisonline.com`)

### If tiles load but don't align:

The terrain center coordinates may be incorrect. Verify:

- Expected: `-53.061222, -70.878388`
- Check `src/lib/terrain/coordinates.ts`
