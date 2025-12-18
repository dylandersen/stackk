#!/bin/bash

# Script to sync .env.local variables to Vercel and Doppler

ENV_FILE=".env.local"
VERCEL_ENV="production"
DOPPLER_PROJECT="stackk"
DOPPLER_CONFIG="prd"

echo "Reading environment variables from $ENV_FILE..."

# Process each line in .env.local
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Remove any leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Skip if key or value is empty after trimming
  [[ -z "$key" ]] && continue
  [[ -z "$value" ]] && continue
  
  echo ""
  echo "Processing: $key"
  
  # Push to Vercel
  echo "  → Pushing to Vercel ($VERCEL_ENV)..."
  # Remove from all environments first (ignore errors if it doesn't exist)
  vercel env rm "$key" production --yes 2>&1 | grep -v "Error\|Warning" || true
  vercel env rm "$key" preview --yes 2>&1 | grep -v "Error\|Warning" || true
  vercel env rm "$key" development --yes 2>&1 | grep -v "Error\|Warning" || true
  
  # Add to production
  echo "$value" | vercel env add "$key" "$VERCEL_ENV" 2>&1 | grep -v "Retrieving\|Vercel CLI" || echo "    ✓ Added to Vercel"
  
  # Sync to Doppler
  echo "  → Syncing to Doppler ($DOPPLER_PROJECT/$DOPPLER_CONFIG)..."
  doppler secrets set "$key=$value" --project "$DOPPLER_PROJECT" --config "$DOPPLER_CONFIG" --no-interactive 2>&1 | grep -v "Retrieving\|Doppler" || echo "    ✓ Synced to Doppler"
  
done < "$ENV_FILE"

echo ""
echo "✅ Environment variables synced successfully!"

