// Environment registry for K6 load tests.
//
// Select an environment on the command line with:
//   k6 run -e ENV=dev scenarios/lookups-read.js
//
// `local` assumes `dotnet run` from vsd-app (default Kestrel port 5000,
// with BASE_PATH unset). `dev`/`test`/`prod` match the deployed OpenShift
// routes documented in the repo root README.md, which mount the app under
// the `/cvapwebform` base path.
export const environments = {
  local: {
    baseUrl: 'http://localhost:5000',
    apiPath: '/api',
    healthPath: '/hc',
  },
  dev: {
    baseUrl: 'https://dev.justice.gov.bc.ca',
    apiPath: '/cvapwebform/api',
    healthPath: '/cvapwebform/hc',
  },
  test: {
    baseUrl: 'https://test.justice.gov.bc.ca',
    apiPath: '/cvapwebform/api',
    healthPath: '/cvapwebform/hc',
  },
  prod: {
    baseUrl: 'https://justice.gov.bc.ca',
    apiPath: '/cvapwebform/api',
    healthPath: '/cvapwebform/hc',
  },
};

// Environments where it is safe to run scenarios that WRITE data to Dataverse.
// Prod is intentionally excluded - see MANUAL.md "Safety rules".
export const writeEnabledEnvironments = ['local', 'dev', 'test'];

export function getEnvironment() {
  const name = __ENV.ENV || 'local';
  const env = environments[name];

  if (!env) {
    throw new Error(`Unknown ENV "${name}". Valid options: ${Object.keys(environments).join(', ')}`);
  }

  // Optional override so `local` can be reached when k6 itself is running
  // inside a container (Podman/Docker), where "localhost" refers to the
  // container, not the host. Example: -e ENV=local -e BASE_URL=http://host.containers.internal:5000
  const baseUrl = __ENV.BASE_URL || env.baseUrl;

  return {
    name,
    ...env,
    baseUrl,
    apiUrl: `${baseUrl}${env.apiPath}`,
    healthUrl: `${baseUrl}${env.healthPath}`,
  };
}

export function assertWritesAllowed(envName) {
  if (!writeEnabledEnvironments.includes(envName)) {
    throw new Error(`Refusing to run a write scenario against "${envName}". ` + `Write scenarios are only permitted against: ${writeEnabledEnvironments.join(', ')}. ` + `See MANUAL.md "Safety rules" if this environment should be added.`);
  }
}
