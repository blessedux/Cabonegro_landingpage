# Terrain Assets

## Heightmap Requirements

Place the heightmap image for Cabo Negro terrain here.

### Specifications:

- **Format**: PNG (grayscale)
- **Resolution**: 1024x1024 pixels (recommended)
- **Coverage**: ~10-20km radius around coordinates (-52.937139, -70.849639)
- **Data Source**: Copernicus GLO-30 DEM or GMTED2010

### How to Create:

1. **Download DEM Data:**

   - Register at scihub.copernicus.eu
   - Search for tiles covering 52°S, 70°W
   - Or use OpenTopography.org for GMTED2010/SRTM data

2. **Convert to Heightmap:**

   - Use QGIS (free) to process GeoTIFF
   - Export as grayscale PNG
   - Or use online tools like terrain.party

3. **File Name:**
   - Save as `cabonegro-heightmap.png` in this directory

### Fallback:

If no heightmap is provided, the system will use a flat terrain fallback automatically.
