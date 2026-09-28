// Smoke test: the fastest possible confidence check that the deployed API
// is up and answering correctly. Run this first, always, before any bigger
// profile - and after every change to a scenario script.
//
//   k6 run -e ENV=dev scenarios/smoke.js
import { check } from 'k6';
import http from 'k6/http';
import { getEnvironment } from '../config/environments.js';

const env = getEnvironment();

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const hcRes = http.get(env.healthUrl);
  check(hcRes, { 'GET /hc is 200': (r) => r.status === 200 });

  const configRes = http.get(`${env.apiUrl}/configuration`);
  check(configRes, { 'GET /api/configuration is 200': (r) => r.status === 200 });

  const countriesRes = http.get(`${env.apiUrl}/lookup/countries`);
  check(countriesRes, { 'GET /api/lookup/countries is 200': (r) => r.status === 200 });
}
