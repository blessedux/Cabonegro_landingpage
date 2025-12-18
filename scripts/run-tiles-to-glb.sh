#!/bin/bash
# Helper script to run tiles-to-glb.py with the virtual environment

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if virtual environment exists
if [ -d "$PROJECT_DIR/venv" ]; then
    echo "✅ Using virtual environment..."
    "$PROJECT_DIR/venv/bin/python" "$SCRIPT_DIR/tiles-to-glb.py" "$@"
else
    echo "⚠️  Virtual environment not found. Using system Python..."
    echo "   To create venv: python3 -m venv venv && ./venv/bin/pip install pygltflib Pillow numpy"
    python3 "$SCRIPT_DIR/tiles-to-glb.py" "$@"
fi
