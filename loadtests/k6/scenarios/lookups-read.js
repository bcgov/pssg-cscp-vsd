// Read-only "public visitor" journey: exercises every anonymous GET
// endpoint the Angular client calls while a user fills out a CVAP
// application (country/province/city cascades, relationship/police
// detachment/court lookups, configuration flags, health check). No data is
// written, so this scenario is safe to run against any environment,
// including prod, once you've cleared it with the team (see MANUAL.md
// "Safety rules").
//
// Note: JusticeController's `validate_vendor` / `validate_vendor_and_
// counsellor` GET endpoints are NOT covered here - they call an external
// vendor-status Dynamics action keyed on a real CAS vendor number/postal
// code, which this synthetic-data suite can't fabricate meaningfully (see
// MANUAL.md "Known gotchas").
//
//   k6 run -e ENV=dev -e PROFILE=load scenarios/lookups-read.js
import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { getEnvironment } from '../config/environments.js';
import { getProfile } from '../lib/profiles.js';
import { readThresholds } from '../lib/thresholds.js';

const env = getEnvironment();
const profile = getProfile();

export const options = {
  scenarios: {
    [profile.name]: profile.config,
  },
  thresholds: readThresholds,
};

// A few real-looking GUIDs are needed for the cascading city lookups. These
// are placeholders - swap in real lookup ids captured from a browser/HAR
// trace against the target environment for a representative test (see
// MANUAL.md "Keeping payloads in sync").
const SAMPLE_COUNTRY_ID = __ENV.SAMPLE_COUNTRY_ID || '00000000-0000-0000-0000-000000000001';
const SAMPLE_PROVINCE_ID = __ENV.SAMPLE_PROVINCE_ID || '00000000-0000-0000-0000-000000000002';

export default function () {
  group('health + configuration', function () {
    const hcRes = http.get(env.healthUrl, { tags: { name: 'GET /hc' } });
    check(hcRes, { 'hc is 200': (r) => r.status === 200 });

    const configRes = http.get(`${env.apiUrl}/configuration`, {
      tags: { name: 'GET /api/configuration' },
    });
    check(configRes, { 'configuration is 200': (r) => r.status === 200 });

    const keycloakRes = http.get(`${env.apiUrl}/configuration/keycloak`, {
      tags: { name: 'GET /api/configuration/keycloak' },
    });
    check(keycloakRes, { 'keycloak config is 200': (r) => r.status === 200 });

    const cvapEmailsRes = http.get(`${env.apiUrl}/lookup/cvap-emails`, {
      tags: { name: 'GET /api/lookup/cvap-emails' },
    });
    check(cvapEmailsRes, { 'cvap-emails is 200': (r) => r.status === 200 });
  });

  group('address lookups', function () {
    const countriesRes = http.get(`${env.apiUrl}/lookup/countries`, {
      tags: { name: 'GET /api/lookup/countries' },
    });
    check(countriesRes, { 'countries is 200': (r) => r.status === 200 });

    const provincesRes = http.get(`${env.apiUrl}/lookup/provinces`, {
      tags: { name: 'GET /api/lookup/provinces' },
    });
    check(provincesRes, { 'provinces is 200': (r) => r.status === 200 });

    const citiesRes = http.get(`${env.apiUrl}/lookup/cities`, {
      tags: { name: 'GET /api/lookup/cities' },
    });
    check(citiesRes, { 'cities is 200': (r) => r.status === 200 });

    const citySearchRes = http.get(`${env.apiUrl}/lookup/cities/search?country=Canada&province=BC&searchVal=Vic&limit=10`, { tags: { name: 'GET /api/lookup/cities/search' } });
    check(citySearchRes, { 'city search is 200': (r) => r.status === 200 });

    const citiesByCountryRes = http.get(`${env.apiUrl}/lookup/country/${SAMPLE_COUNTRY_ID}/cities`, {
      tags: { name: 'GET /api/lookup/country/{id}/cities' },
    });
    check(citiesByCountryRes, { 'cities by country is 200 or 400': (r) => [200, 400].includes(r.status) });

    const citiesByProvinceRes = http.get(`${env.apiUrl}/lookup/country/${SAMPLE_COUNTRY_ID}/province/${SAMPLE_PROVINCE_ID}/cities`, { tags: { name: 'GET /api/lookup/country/{id}/province/{id}/cities' } });
    check(citiesByProvinceRes, { 'cities by province is 200 or 400': (r) => [200, 400].includes(r.status) });
  });

  group('relationship + detachment + court lookups', function () {
    const relationshipsRes = http.get(`${env.apiUrl}/lookup/relationships`, {
      tags: { name: 'GET /api/lookup/relationships' },
    });
    check(relationshipsRes, { 'relationships is 200': (r) => r.status === 200 });

    const authRelationshipsRes = http.get(`${env.apiUrl}/lookup/auth_relationships`, {
      tags: { name: 'GET /api/lookup/auth_relationships' },
    });
    check(authRelationshipsRes, { 'auth_relationships is 200': (r) => r.status === 200 });

    const repRelationshipsRes = http.get(`${env.apiUrl}/lookup/representative_relationships`, {
      tags: { name: 'GET /api/lookup/representative_relationships' },
    });
    check(repRelationshipsRes, { 'representative_relationships is 200': (r) => r.status === 200 });

    const imfRepRelationshipsRes = http.get(`${env.apiUrl}/lookup/imf_representative_relationships`, {
      tags: { name: 'GET /api/lookup/imf_representative_relationships' },
    });
    check(imfRepRelationshipsRes, { 'imf_representative_relationships is 200': (r) => r.status === 200 });

    const policeDetachmentsRes = http.get(`${env.apiUrl}/lookup/police_detachments`, {
      tags: { name: 'GET /api/lookup/police_detachments' },
    });
    check(policeDetachmentsRes, { 'police_detachments is 200': (r) => r.status === 200 });

    const courtsRes = http.get(`${env.apiUrl}/lookup/courts`, {
      tags: { name: 'GET /api/lookup/courts' },
    });
    check(courtsRes, { 'courts is 200': (r) => r.status === 200 });
  });

  // Think time: mimics a real applicant reading/typing between steps.
  sleep(Math.random() * 2 + 1);
}
