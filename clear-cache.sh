#!/bin/bash
echo "Clearing Next.js and Turbopack caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo "Cache cleared! Now restart your dev server with: npm run dev"
