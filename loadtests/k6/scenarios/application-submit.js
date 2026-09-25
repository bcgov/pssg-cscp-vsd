// Write journey: submits a CVAP application end-to-end, the same way the
// Angular client does (load lookups, then POST the completed application
// to JusticeController's saveapplication endpoint).
//
// !! THIS SCENARIO CREATES REAL RECORDS IN DATAVERSE !!
// It refuses to run unless ENV is one of config/environments.js's
// `writeEnabledEnvironments` (local/dev/test) - never point it at prod.
//
//   k6 run -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=victim scenarios/application-submit.js
//
// CASE_TYPE selects which ApplicationType/payload shape to exercise: victim
// (default), ifm, witness, or `all` (rotates evenly through all three so a
// single run reports on every case type - each gets its own metric tag,
// e.g. `submit victim is 200`, so the summary breaks down cleanly per case
// type instead of averaging them together).
//
// Note: AEMController's `/api/aem/victim`, `/ifm`, `/witness`, and
// `/authorization` PDF-generation endpoints are NOT covered here - they
// call an external AEM PDF service on every request, and repeatedly
// hammering that external dependency at load-test volumes is out of scope
// for this suite. ApplicationDraftsController, InvoicesController, and
// Payment(Schedule)Controller are also excluded: they require `[Authorize]`,
// and dev/test/prod all run with FEATURE_USE_AUTHENTICATION=true (confirmed
// via GET /api/configuration), so they can't be exercised without a real
// user JWT. See MANUAL.md "Known gotchas".
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';
import { assertWritesAllowed, getEnvironment } from '../config/environments.js';
import { buildIfmApplicationPayload, buildVictimApplicationPayload, buildWitnessApplicationPayload } from '../lib/data.js';
import { getProfile } from '../lib/profiles.js';
import { writeThresholds } from '../lib/thresholds.js';

const env = getEnvironment();
const profile = getProfile();
const caseType = __ENV.CASE_TYPE || 'victim';

assertWritesAllowed(env.name);

const CASE_TYPES = {
  victim: { build: buildVictimApplicationPayload },
  ifm: { build: buildIfmApplicationPayload },
  witness: { build: buildWitnessApplicationPayload },
};
const CASE_TYPE_NAMES = Object.keys(CASE_TYPES);

if (caseType !== 'all' && !CASE_TYPES[caseType]) {
  throw new Error(`Unknown CASE_TYPE "${caseType}". Valid options: ${CASE_TYPE_NAMES.join(', ')}, all`);
}

export const options = {
  scenarios: {
    [profile.name]: profile.config,
  },
  thresholds: writeThresholds,
};

export default function () {
  // Step 1: load a lookup a real user's browser would fetch first.
  const countriesRes = http.get(`${env.apiUrl}/lookup/countries`, {
    tags: { name: 'GET /api/lookup/countries' },
  });
  check(countriesRes, { 'countries is 200': (r) => r.status === 200 });

  sleep(1);

  // Step 2: submit the completed application. In `all` mode, rotate evenly
  // through every case type using the global iteration count so results
  // stay balanced across VUs and profiles.
  const activeType = caseType === 'all' ? CASE_TYPE_NAMES[exec.scenario.iterationInTest % CASE_TYPE_NAMES.length] : caseType;
  const { build } = CASE_TYPES[activeType];
  const payload = build();

  const submitRes = http.post(`${env.apiUrl}/justice/saveapplication`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /api/justice/saveapplication' },
  });

  check(submitRes, {
    [`submit ${activeType} is 200`]: (r) => r.status === 200,
    [`submit ${activeType} is not a server error`]: (r) => r.status < 500,
  });
  if (submitRes.status !== 200 && __ENV.DEBUG_BODY === '1') {
    console.log(`DEBUG ${activeType} status=${submitRes.status} body=${submitRes.body}`);
  }

  sleep(1);
}
