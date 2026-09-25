#!/usr/bin/env bash
# Convenience wrapper around `k6 run` that saves a JSON summary per run
# under results/, named by scenario/env/profile/timestamp.
#
# Usage:
#   ./run.sh <scenario> [-e ENV=dev] [-e PROFILE=load] [-e CASE_TYPE=ifm]
#   ./run.sh <scenario> --container [k6 args...]   # run via Podman, no local k6 install needed
#
# Examples:
#   ./run.sh smoke -e ENV=local
#   ./run.sh smoke --container -e ENV=local
#   ./run.sh lookups-read -e ENV=dev -e PROFILE=load
#   ./run.sh application-submit -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=ifm
set -euo pipefail

SCENARIO="${1:?Usage: ./run.sh <scenario> [--container] [k6 args...]}"
shift || true

CONTAINER=0
if [[ "${1:-}" == "--container" ]]; then
  CONTAINER=1
  shift || true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCENARIO_FILE="$SCRIPT_DIR/scenarios/$SCENARIO.js"

if [[ ! -f "$SCENARIO_FILE" ]]; then
  echo "Unknown scenario '$SCENARIO'. Available scenarios:"
  ls "$SCRIPT_DIR/scenarios" | sed 's/\.js$//' | sed 's/^/  - /'
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
RESULTS_DIR="$SCRIPT_DIR/results"
mkdir -p "$RESULTS_DIR"

SUMMARY_FILE="${SCENARIO}-${TIMESTAMP}.summary.json"
OUT_JSON="$RESULTS_DIR/$SUMMARY_FILE"

if [[ "$CONTAINER" -eq 1 ]]; then
  echo "Running scenario '$SCENARIO' in container (podman) -> results/$SUMMARY_FILE"
  podman run --rm -i \
    -v "$SCRIPT_DIR:/scripts:Z" \
    -w /scripts \
    grafana/k6 run \
    --summary-export "results/$SUMMARY_FILE" \
    "$@" \
    "scenarios/$SCENARIO.js"
else
  echo "Running scenario '$SCENARIO' -> $OUT_JSON"
  k6 run \
    --summary-export "$OUT_JSON" \
    "$@" \
    "$SCENARIO_FILE"
fi
