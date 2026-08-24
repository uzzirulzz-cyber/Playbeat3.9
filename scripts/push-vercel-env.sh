#!/usr/bin/env bash
#
# Push environment variables from local .env to Vercel.
#
# SECURITY:
#  - Reads the local .env file (gitignored) line by line.
#  - Pushes each non-empty, non-comment variable to Vercel via the CLI
#    using stdin piping so the value NEVER appears in shell history,
#    process arguments (ps aux), or logs.
#  - Targets the "production" environment by default (also pushes to
#    preview + development if --all-envs is passed).
#
# USAGE:
#   bash scripts/push-vercel-env.sh              # push to production only
#   bash scripts/push-vercel-env.sh --all-envs   # push to all 3 environments
#   bash scripts/push-vercel-env.sh --dry-run    # show what would be pushed
#
# PREREQUISITES:
#   1. vercel CLI installed:  bun add -g vercel
#   2. Logged in:             vercel login
#   3. Project linked:        vercel link   (run once in the project root)

set -euo pipefail

ENV_FILE=".env"
ALL_ENVS=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --all-envs) ALL_ENVS=1 ;;
    --dry-run)  DRY_RUN=1 ;;
    -h|--help)
      cat <<'EOF'
Push .env variables to Vercel.

Usage: bash scripts/push-vercel-env.sh [--all-envs] [--dry-run]

Options:
  --all-envs   Push to production, preview, AND development environments
  --dry-run    Show what would be pushed without actually pushing
EOF
      exit 0 ;;
    *) echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

# Pre-flight checks
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Create it first (see .env.example)."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: vercel CLI not installed. Run: bun add -g vercel"
  exit 1
fi

# Check if logged in
WHOAMI=$(vercel whoami 2>&1 || true)
if [[ "$WHOAMI" == *"not"* || -z "$WHOAMI" ]]; then
  echo "ERROR: Not logged in to Vercel. Run: vercel login"
  exit 1
fi
echo "✓ Logged in as: $WHOAMI"

# Check if project is linked
if [[ ! -d ".vercel" ]]; then
  echo "ERROR: Project not linked. Run: vercel link"
  exit 1
fi
echo "✓ Project linked"

# Determine target environments
ENVS=("production")
if [[ $ALL_ENVS -eq 1 ]]; then
  ENVS=("production" "preview" "development")
fi

echo ""
echo "Target environments: ${ENVS[*]}"
[[ $DRY_RUN -eq 1 ]] && echo "DRY RUN — no changes will be made"
echo ""

# Read .env line by line, skip comments and blanks
PUSHED=0
SKIPPED=0
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Parse KEY="value" or KEY=value
  KEY=$(echo "$line" | sed -E 's/^([A-Za-z_][A-Za-z0-9_]*)=.*/\1/')
  VALUE=$(echo "$line" | sed -E 's/^[A-Za-z_][A-Za-z0-9_]*=//' | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/")

  # Skip if empty value
  [[ -z "$VALUE" ]] && { echo "  ⊘ $KEY (empty — skipped)"; ((SKIPPED++)); continue; }

  # Mask the value in the output (show first 3 + last 2 chars)
  if [[ ${#VALUE} -gt 8 ]]; then
    MASKED="${VALUE:0:3}•••••${VALUE: -2}"
  elif [[ ${#VALUE} -gt 0 ]]; then
    MASKED="••••"
  else
    MASKED=""
  fi

  if [[ $DRY_RUN -eq 1 ]]; then
    echo "  → $KEY=$MASKED  (would push to: ${ENVS[*]})"
    ((PUSHED++))
    continue
  fi

  # Push to each target environment
  for ENV_NAME in "${ENVS[@]}"; do
    # Remove existing var if present (so we don't get duplicates)
    echo "$KEY" | vercel env rm "$ENV_NAME" 2>/dev/null || true
    # Push the new value via stdin (no shell history leak)
    printf '%s' "$VALUE" | vercel env add "$KEY" "$ENV_NAME" 2>/dev/null && \
      echo "  ✓ $KEY=$MASKED → $ENV_NAME" || \
      echo "  ✗ $KEY → $ENV_NAME (failed)"
  done
  ((PUSHED++))
done < "$ENV_FILE"

echo ""
echo "Done. Pushed $PUSHED variables, skipped $SKIPPED (empty)."
if [[ $DRY_RUN -eq 0 ]]; then
  echo ""
  echo "Next steps:"
  echo "  1. Deploy:     vercel --prod"
  echo "  2. Verify:     curl https://YOUR-DOMAIN.vercel.app/api/health/db"
fi
