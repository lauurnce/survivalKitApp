#!/usr/bin/env bash
# Builds scripts/db/consolidated-pending.sql — the paste-ready script for the
# Supabase SQL Editor containing exactly the migrations that have never been
# applied to production, in version order.
#
# Usage:
#   scripts/db/build-consolidated.sh           regenerate the artifact
#   scripts/db/build-consolidated.sh --list    print the pending file list
#
# Single source of truth for "what is still pending" lives in the `pending`
# array below. When a migration has been applied to production, remove it
# from the array and regenerate.
set -euo pipefail

cd "$(dirname "$0")/../.."

pending=(
  supabase/migrations/20260821010000_profiles_school_type.sql
  supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
  supabase/migrations/20260822000000_email_outbox.sql
  supabase/migrations/20260822000003_restrict_privileged_rpcs.sql
  supabase/migrations/20260822000004_server_only_public_writes.sql
  supabase/migrations/20260822000005_server_only_feedback_inserts.sql
)

if [ "${1:-}" = "--list" ]; then
  printf '%s\n' "${pending[@]}"
  exit 0
fi

for f in "${pending[@]}"; do
  if [ ! -f "$f" ]; then
    echo "error: listed pending migration not found: $f" >&2
    exit 1
  fi
done

out="scripts/db/consolidated-pending.sql"

{
  cat <<'HEADER'
-- ============================================================================
-- BSIT Survival Kit — consolidated PENDING migrations (paste-ready)
-- ============================================================================
-- Purpose : one script to paste into the Supabase SQL Editor that applies
--           every migration never yet run against production. Applying it is
--           equivalent to running the six source files below in order.
--
-- Generated : 2026-08-23 by scripts/db/build-consolidated.sh (do not edit by
--             hand; edit the source files and re-run the script).
--
-- Source files, applied in this order:
--   1. supabase/migrations/20260821010000_profiles_school_type.sql
--   2. supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
--   3. supabase/migrations/20260822000000_email_outbox.sql
--   4. supabase/migrations/20260822000003_restrict_privileged_rpcs.sql
--   5. supabase/migrations/20260822000004_server_only_public_writes.sql
--   6. supabase/migrations/20260822000005_server_only_feedback_inserts.sql
--
-- IDEMPOTENCY CONTRACT: the SQL Editor can be re-pasted after a partial or
-- failed attempt, so EVERY statement below must be safe to re-run. Tables and
-- indexes are created IF NOT EXISTS, functions use CREATE OR REPLACE,
-- policies are preceded by DROP POLICY IF EXISTS, and grants/revokes are
-- naturally repeatable. Keep new statements inside this contract.
-- ============================================================================

HEADER

  for f in "${pending[@]}"; do
    printf -- '\n-- ----------------------------------------------------------------\n'
    printf -- '-- Source: %s\n' "$f"
    printf -- '-- ----------------------------------------------------------------\n\n'
    cat "$f"
    printf '\n'
  done
} > "$out"

echo "wrote $out (${#pending[@]} pending migrations)"
