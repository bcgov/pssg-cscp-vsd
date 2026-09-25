// Shared pass/fail thresholds. Keep these in one place so every scenario is
// judged the same way and CI can fail the build consistently.
//
// Read endpoints (lookups, configuration, health) are cheap Dataverse
// queries with no writes, so we hold them to a tighter bar than the
// application submission endpoint, which performs a synchronous Dataverse
// action (vsd_CreateCvapClaim) plus related record writes.
export const readThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<800', 'p(99)<1500'],
};

export const writeThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<2000', 'p(99)<4000'],
};

// Merge a base threshold set with per-scenario custom thresholds/tags.
export function withThresholds(base, overrides = {}) {
  return { ...base, ...overrides };
}
