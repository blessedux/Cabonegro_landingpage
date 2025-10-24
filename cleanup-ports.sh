#!/bin/bash

echo "🧹 Cleaning up development ports and processes..."

# Kill common development ports
for port in 3000 3001 3002 3003 4000 5000 8000 8080 9000; do
  if lsof -ti:$port >/dev/null 2>&1; then
    echo "Killing processes on port $port"
    lsof -ti:$port | xargs kill -9 2>/dev/null
  fi
done

# Kill development processes
echo "Killing Next.js processes..."
pkill -f "next" 2>/dev/null

echo "Killing Node.js processes..."
pkill -f "node" 2>/dev/null

echo "Killing npm processes..."
pkill -f "npm" 2>/dev/null

echo "Killing bun processes..."
pkill -f "bun" 2>/dev/null

echo "✅ Cleanup complete!"
