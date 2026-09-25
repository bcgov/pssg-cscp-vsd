// Load profiles shared by every scenario.
//
// Select one on the command line with:
//   k6 run -e PROFILE=load scenarios/lookups-read.js
//
// VUS/duration numbers are deliberately conservative starting points for a
// public-facing government form backed by Dataverse - tune them once you
// have a baseline (see MANUAL.md "Tuning profiles").
const profiles = {
  // Single VU, a handful of iterations. Use for pipeline sanity checks and
  // whenever you touch a script - confirms the API contract still matches.
  smoke: {
    executor: 'shared-iterations',
    vus: 1,
    iterations: 5,
    maxDuration: '1m',
  },

  // Steady, expected day-to-day traffic.
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },
      { duration: '3m', target: 10 },
      { duration: '1m', target: 0 },
    ],
  },

  // Push past expected traffic to find the breaking point / degradation curve.
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 80 },
      { duration: '5m', target: 80 },
      { duration: '3m', target: 0 },
    ],
  },

  // Sudden burst of traffic (e.g. a news story or reminder email blast).
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 5 },
      { duration: '30s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 5 },
      { duration: '1m', target: 0 },
    ],
  },

  // Long-running moderate load to catch memory leaks / connection exhaustion.
  soak: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 15 },
      { duration: '30m', target: 15 },
      { duration: '2m', target: 0 },
    ],
  },
};

export function getProfile() {
  const name = __ENV.PROFILE || 'smoke';
  const profile = profiles[name];

  if (!profile) {
    throw new Error(`Unknown PROFILE "${name}". Valid options: ${Object.keys(profiles).join(', ')}`);
  }

  // Note: `name` is returned alongside the scenario config (used by callers
  // as the scenario's key), but must NOT be spread into the config object
  // itself - k6 rejects unknown fields like "name" inside a scenario config.
  return { name, config: profile };
}
