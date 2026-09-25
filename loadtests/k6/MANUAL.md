# VSD (CVAP) k6 Load Testing Suite

This is the third of four planned load-test suites (Restitution done, VSU done, VSD here, CPU still to come). Same concept, same profiles, same environments as the other two - see `pssg-cscp-restitution/loadtests/k6/MANUAL.md` and `pssg-cscp-vsu/loadtests/k6/MANUAL.md` for the original design rationale.

## Overview

VSD (`vsd-app`) is the Victim Services Directory / CVAP (Crime Victim Assistance Program) claim application portal. Unlike Restitution and VSU, **most of the API requires authentication** - `dev`/`test`/`prod` all run with `FEATURE_USE_AUTHENTICATION=true` (confirmed live via `GET /api/configuration` → `featureFlags.useAuthentication: true`). Only a subset of controllers are `[AllowAnonymous]`, and this suite is scoped to exactly that subset.

### What's tested

**Reads** (`scenarios/lookups-read.js`) - every anonymous GET endpoint the Angular client calls while filling out a CVAP application:

- `GET /hc` (health check)
- `GET /api/configuration`, `GET /api/configuration/keycloak`
- `GET /api/lookup/cvap-emails`
- `GET /api/lookup/countries`, `/provinces`, `/cities`, `/cities/search`, `/country/{id}/cities`, `/country/{id}/province/{id}/cities`
- `GET /api/lookup/relationships`, `/auth_relationships`, `/representative_relationships`, `/imf_representative_relationships`
- `GET /api/lookup/police_detachments`, `/courts`

**Writes** (`scenarios/application-submit.js`) - submits a CVAP claim application via `JusticeController.SaveApplication`:

- `POST /api/justice/saveapplication` - the only anonymous write endpoint. `CASE_TYPE` selects the `ApplicationType`/payload shape: `victim` (default), `ifm`, `witness`, or `all` (rotates evenly through all three).

### Out of scope (and why)

- **`ApplicationDraftsController`, `InvoicesController`, `PaymentController`, `PaymentScheduleController`** - all require `[Authorize]`. With `FEATURE_USE_AUTHENTICATION=true` in dev/test/prod, these can't be exercised without a real user JWT (Keycloak login flow). Out of scope for this anonymous-only suite.
- **`AEMController`'s `/api/aem/victim`, `/ifm`, `/witness`, `/authorization`** - `[AllowAnonymous]`, but each call generates a PDF via an external AEM service. Repeatedly hammering that external dependency at load-test volumes isn't appropriate for this suite (same reasoning as excluding VSU's `ReimbursementController`). If you need to load test AEM PDF generation specifically, do it deliberately and in coordination with the AEM team.
- **`JusticeController`'s `validate_vendor` / `validate_vendor_and_counsellor`** - `[AllowAnonymous]` GET endpoints, but they call an external CAS-like Dynamics action (`vsd_CheckVendorStatus`) keyed on a real vendor number/postal code. Synthetic/made-up values would just exercise the failure path, not a representative load. Excluded.

### Folder layout

```
loadtests/k6/
  config/environments.js   # local/dev/test/prod base URLs
  lib/profiles.js          # smoke/load/stress/spike/soak - identical to Restitution/VSU
  lib/thresholds.js        # read/write pass-fail thresholds - identical to Restitution/VSU
  lib/data.js              # payload builders for victim/ifm/witness applications
  scenarios/smoke.js
  scenarios/lookups-read.js
  scenarios/application-submit.js
  run.ps1 / run.sh         # convenience wrappers around `k6 run`
  report.ps1               # pretty-print a summary JSON without installing k6
  results/                 # gitignored - k6 --summary-export output lands here
```

## Prerequisites

Install k6, or run it via Podman/Docker with the `grafana/k6` image (no local install needed) - both `run.ps1`/`run.sh` support `-Container`/`--container`.

`local` assumes `dotnet run` from `vsd-app` (default Kestrel port 5000, `BASE_PATH` unset). If k6 itself is running inside a container and `local` needs to reach the host, override with `-e BASE_URL=http://host.containers.internal:5000`.

| Environment | Base URL                       | API path         |
| ----------- | ------------------------------ | ---------------- |
| local       | http://localhost:5000          | /api             |
| dev         | https://dev.justice.gov.bc.ca  | /cvapwebform/api |
| test        | https://test.justice.gov.bc.ca | /cvapwebform/api |
| prod        | https://justice.gov.bc.ca      | /cvapwebform/api |

### How to run tests

With a local k6 install, `run.ps1`/`run.sh` invoke `k6` directly:

```powershell
# Smoke test (always run this first)
./run.ps1 smoke -e ENV=dev

# Read-only load test
./run.ps1 lookups-read -e ENV=dev -e PROFILE=load

# Write journey smoke test, single case type
./run.ps1 application-submit -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=victim

# Write journey, all case types rotated evenly
./run.ps1 application-submit -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=all
```

### Running via container (Podman/Docker) - no local k6 install needed

Pass `-Container` (PowerShell) / `--container` (bash) to run the same scenarios through the `grafana/k6` image instead:

```powershell
./run.ps1 smoke -Container -e ENV=dev
./run.ps1 lookups-read -Container -e ENV=dev -e PROFILE=load
./run.ps1 application-submit -Container -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=all
```

**PowerShell note**: when passing multiple `-e` flags in container mode, insert `--%` (the stop-parsing token) right before them so PowerShell doesn't try to interpret `-e`/`-E` as one of its own common parameters:

```powershell
./run.ps1 application-submit -Container --% -e ENV=dev -e PROFILE=load -e CASE_TYPE=all -e RUN_MARKER=vsd-load-20260924
./run.ps1 lookups-read -Container --% -e ENV=dev -e PROFILE=load
```

If you need to bypass `run.ps1` entirely (e.g. for one-off debugging with extra k6 CLI flags like `--vus`/`--duration`), call `podman run` directly from the `loadtests/k6` folder - this is also how the wrapper scripts invoke the container under the hood:

```powershell
cd loadtests/k6
podman run --rm -i -v "${PWD}:/scripts:Z" -w /scripts grafana/k6 run `
  -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=all scenarios/application-submit.js

# One-off override of VUs/duration (bypassing lib/profiles.js), useful for
# reproducing a failure at a specific concurrency level:
podman run --rm -i -v "${PWD}:/scripts:Z" -w /scripts grafana/k6 run `
  --vus 10 --duration 45s -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=all `
  -e DEBUG_BODY=1 scenarios/application-submit.js
```

On Linux/macOS (bash), drop the trailing `` ` `` line-continuations and use `\` instead, and the `-v "${PWD}:..."` mount syntax is unchanged. Swap `podman` for `docker` if that's what's installed - the `grafana/k6` image and flags are identical.

### Reviewing results without k6 installed

```powershell
./report.ps1 results/application-submit-20260924-160644.summary.json
./report.ps1   # defaults to the most recently modified file in results/
```

**Threshold gotcha**: k6's `--summary-export` JSON uses `true` to mean a threshold was **breached (FAILED)**, and `false` to mean it **held (PASSED)** - the opposite of what the boolean name suggests. `report.ps1` already accounts for this.

## Safety rules

- **Never run write scenarios (`application-submit.js`) against `prod`.** `config/environments.js`'s `assertWritesAllowed()` throws if `ENV` isn't `local`/`dev`/`test`.
- Get sign-off from the team before running `stress`/`spike`/`soak` profiles against a shared dev/test environment - these intentionally push well past normal traffic.
- All synthetic data is tagged with `K6-LOADTEST` and a `RUN_MARKER` (defaults to a timestamp, override with `-e RUN_MARKER=...`) in every free-text field, so records can be found and purged from Dataverse afterwards. Never reuse a real person's information.
- No PII. Ever.
- Respect downstream systems - avoid hammering AEM PDF generation or the CAS vendor-validation action (see "Out of scope").

## Interpreting results

Same shape as Restitution/VSU: check `checks_succeeded` (should be ~100%), `http_req_failed` rate (should be <1%), and `http_req_duration` percentiles against `readThresholds`/`writeThresholds` in `lib/thresholds.js`. A 0% error rate with a latency-only threshold breach is a legitimate capacity/degradation finding, not a script bug - see the Restitution and VSU MANUAL.md's for worked examples of this distinction.

## Support & maintenance

### Known gotchas

- **Auth boundary**: this suite can only reach `[AllowAnonymous]` endpoints. If a controller/action you want to test gets an `[Authorize]` attribute added (or removed), re-check `Program.cs`'s `FEATURE_USE_AUTHENTICATION` behavior and the controller's attributes before assuming it's reachable.
- **Minimal-but-valid payloads**: `ApplicationFormModel`'s top-level section properties (`PersonalInformation`, `CrimeInformation`, etc.) are NOT themselves `[Required]` - if a section is left `null`, ASP.NET's model binder never recurses into it, so that section's internal `[Required]` fields are never checked. `lib/data.js`'s builders exploit this deliberately to keep payloads small (e.g. `VictimInformation` is omitted entirely for `ifm`/`witness` case types, even though the C# `Validate()` method has logic for it - that logic only runs `if (vi != null)`). If validation rules change, re-derive the minimal required field set directly from `vsd-app/ViewModels/ApplicationFormModel.cs`'s `Validate()` methods rather than guessing.
- **CRM option-set integers**: `ApplicationType`, `maritalStatus`, `wasReportMadeToPolice`, `offenderBeenCharged`, `haveYouSuedOffender`, etc. are Dataverse/CRM option-set integers, not booleans or free-form ints - see `vsd-app/ViewModels/CrmConstants.cs` (`Crm.AppTypeVictim = 100000002`, `Crm.BoolTrue = 100000001`, etc.). `lib/data.js` mirrors these constants; keep them in sync if `CrmConstants.cs` changes.
- **Real bug found while building this suite: unguarded null dereferences in `ApplicationModelExtensions.ToVsdVictimsModel()`** (`vsd-app/Models.Extensions/ApplicationModelExtensions.cs`). Model-state validation happily accepts a payload with `CrimeInformation.crimeLocations`/`additionalOffenders` omitted, or `MedicalInformation` omitted entirely - but the Dynamics-mapping code that runs _after_ validation dereferences them unconditionally and throws:
  - `model.CrimeInformation.crimeLocations.Count()` and `model.CrimeInformation.additionalOffenders.Length` are called with no null-guard and outside any try/catch → `ArgumentNullException`/`NullReferenceException` → the endpoint 500s with `{"success":false,"error":"Value cannot be null. (Parameter 'source')"}` or `"Object reference not set to an instance of an object."`.
  - `model.MedicalInformation.familyDoctorClinic/FirstName/LastName` are dereferenced with no `if (model.MedicalInformation != null)` guard around that specific block (even though every other `MedicalInformation` access earlier in the same method IS guarded) → NRE if `MedicalInformation` is omitted, which `ApplicationFormModel.Validate()` never requires.
  - Workaround baked into `lib/data.js`: always send `crimeLocations: []`, `additionalOffenders: []`, `documents: []`, `policeReports: []`, `courtFiles: []` inside `CrimeInformation`, and always send a (minimal, all-"no") `MedicalInformation` object. Worth reporting to the VSD team as a real Angular-client bug risk (any real user who leaves the "other treatments"/"additional offenders" pickers untouched, or somehow skips the medical section, would hit this same 500).
- **`application-submit.js` has a `DEBUG_BODY=1` escape hatch**: when set, the scenario `console.log`s the full response status/body for any non-200 `saveapplication` submission (see the `if (submitRes.status !== 200 && __ENV.DEBUG_BODY === '1')` block near the bottom of the file). Use this with the direct `podman run` invocation above (not `run.ps1`, which doesn't pipe extra `-e` flags through cleanly for one-off debugging) whenever a write-path failure needs its exact error message inspected instead of just a pass/fail check.
- **Observed sustained-load write failures did not reproduce on demand**: one `PROFILE=load` run against `dev` (5 min, ramping 0→10→10→0 VUs) saw a 22.51% `http_req_failed` rate across all 3 case types evenly; two follow-up flat-10-VU repro attempts (45s and 3min, with `DEBUG_BODY=1` on) both came back at 0% errors with only a latency-threshold miss (p95 ~2.2-2.8s vs the 2s budget). This points to a transient dev-environment/Dataverse capacity issue rather than a payload defect, but treat any high write error rate as worth a second run before reporting it as a hard finding - the backend is close to its latency budget at ~10 concurrent VUs regardless.

### When the API changes

Re-read `vsd-app/Controllers/JusticeController.cs` and `vsd-app/ViewModels/ApplicationFormModel.cs` (particularly the `IValidatableObject.Validate()` implementations scattered across nested classes) before assuming `lib/data.js`'s payloads are still valid. A 400 response with `ModelState` errors in the smoke test output tells you exactly which field changed.

### Keeping payloads in sync

`SAMPLE_COUNTRY_ID`/`SAMPLE_PROVINCE_ID` in `scenarios/lookups-read.js` are placeholder GUIDs. For a fully representative read test, capture real lookup ids from a browser/HAR trace against the target environment and pass them via `-e SAMPLE_COUNTRY_ID=... -e SAMPLE_PROVINCE_ID=...`.

### Tuning profiles

See `lib/profiles.js` - identical definitions to Restitution/VSU (`smoke`/`load`/`stress`/`spike`/`soak`). Adjust VU counts/durations there if VSD's expected traffic profile differs materially from the other two portals.

### Cleaning up test data

Search Dataverse for the `RUN_MARKER` value used in a given run (visible in the console output and embedded in every tagged free-text field: `crimeDetails`, `crimeInjuries`, signatures, names) to find and remove synthetic CVAP claim records afterwards.

### Adding a new profile or scenario

Follow the same pattern as `scenarios/lookups-read.js` (read-only, safe everywhere) or `scenarios/application-submit.js` (write, gated by `assertWritesAllowed`). Add new payload builders to `lib/data.js`, tagging every free-text field with `LOAD_TEST_TAG`/`RUN_MARKER`.

## CI/CD integration

Not yet wired up. Suggested next step: run `smoke` on every PR against `local`/`dev` as a pipeline gate, and schedule `load` runs against `dev` periodically (e.g. nightly) with results archived as build artifacts.
