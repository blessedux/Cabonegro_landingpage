#!/bin/bash
# Complete workflow to generate high-resolution 3D terrain GLB
# Usage: ./scripts/generate-terrain-glb.sh [API_KEY] [QUALITY]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get API key
API_KEY="${1:-${OPENTOPOGRAPHY_API_KEY}}"
QUALITY="${2:-high}"

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ Error: OpenTopography API key required!${NC}"
    echo ""
    echo "Usage:"
    echo "  ./scripts/generate-terrain-glb.sh YOUR_API_KEY [quality]"
    echo ""
    echo "Or set environment variable:"
    echo "  export OPENTOPOGRAPHY_API_KEY=your_key"
    echo "  ./scripts/generate-terrain-glb.sh"
    echo ""
    echo "Quality options: ultra, high (default), medium, low"
    echo ""
    echo "Get your API key from: https://portal.opentopography.org/apidocs/"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🗺️  3D Terrain GLB Generator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Coordinates: ${GREEN}-52.937139, -70.849639${NC}"
echo -e "Radius: ${GREEN}20km${NC}"
echo -e "Quality: ${GREEN}${QUALITY}${NC}"
echo ""

# Step 1: Download terrain data
echo -e "${BLUE}Step 1: Downloading terrain data...${NC}"
python3 scripts/download-terrain-for-glb.py "$API_KEY" 20

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to download terrain data${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Terrain data downloaded successfully!${NC}"
echo ""

# Step 2: Generate GLB
echo -e "${BLUE}Step 2: Generating 3D GLB...${NC}"
python3 scripts/create-terrain-glb.py "$QUALITY"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate GLB${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📦 Output file: ${BLUE}public/assets/models/terrain-3d.glb${NC}"
echo ""
echo -e "💡 Next steps:"
echo -e "  1. Load the GLB in your 3D application"
echo -e "  2. Use in Three.js: ${YELLOW}useGLTF('/assets/models/terrain-3d.glb')${NC}"
echo ""

