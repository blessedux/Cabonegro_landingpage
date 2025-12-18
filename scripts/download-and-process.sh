#!/bin/bash
# Complete workflow: Download and process DEM data
# Usage: ./scripts/download-and-process.sh [YOUR_API_KEY]
# Or set environment variable: export OPENTOPOGRAPHY_API_KEY=your_key
# Or add to .env.local: OPENTOPOGRAPHY_API_KEY=your_key

set -e  # Exit on error

# Source .env.local if it exists (for API key)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    # Export variables from .env.local (simple parsing, no comments)
    export $(grep -v '^#' "$PROJECT_ROOT/.env.local" | grep OPENTOPOGRAPHY_API_KEY | xargs)
fi

# Activate virtual environment if it exists
if [ -d "$SCRIPT_DIR/venv" ]; then
    source "$SCRIPT_DIR/venv/bin/activate"
fi

# Try to get API key from environment variable first, then command line
API_KEY=${OPENTOPOGRAPHY_API_KEY:-$1}

if [ -z "$API_KEY" ]; then
    echo "Error: API key not found!"
    echo ""
    echo "Options:"
    echo "  1. Set environment variable: export OPENTOPOGRAPHY_API_KEY=your_key"
    echo "  2. Or pass as argument: ./scripts/download-and-process.sh YOUR_API_KEY"
    echo ""
    echo "Get your API key from: https://portal.opentopography.org/apidocs/"
    exit 1
fi

echo "=========================================="
echo "DEM Download and Processing Workflow"
echo "=========================================="
echo ""

# Step 1: Download DEM
echo "Step 1: Downloading DEM from OpenTopography..."
python3 scripts/download-dem-opentopography.py "$API_KEY"

if [ $? -ne 0 ]; then
    echo "✗ Download failed. Exiting."
    exit 1
fi

echo ""
echo "Step 2: Processing DEM to heightmap PNG..."
python3 scripts/process-dem-to-heightmap.py

if [ $? -ne 0 ]; then
    echo "✗ Processing failed. Exiting."
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Complete! Heightmap is ready."
echo "=========================================="
echo ""
echo "The heightmap is located at:"
echo "  public/assets/terrain/punta-arenas-cabonegro-heightmap.png"
echo ""
echo "The LowPolyTerrain component will automatically load it when you"
echo "navigate to the 3D map page."
