# DST Scan Report — COAST VSD Application

**Date:** 2026-08-11  
**Branch:** `remove_stale_code`  
**Scope:** BC abolishing daylight saving time (moving to permanent UTC-8 / Pacific Standard Time)

---

## Executive Summary

All OpenShift containers run in UTC (Alpine/UBI8 base images default to UTC, no override is needed). Because of this the application was **already effectively DST-safe** in production, but only by accident: `DateTime.Now` and `.ToLocalTime()` were used throughout the payment and scheduling services with no explicit timezone anchor. This scan identified and remediated those implicit timezone dependencies so the code is explicit and correct regardless of future OS tz-database updates.

The Angular frontend uses `moment-timezone` with the IANA identifier `'America/Vancouver'` for outage-banner logic. This library bundles timezone rules; the bundled version will become stale once BC officially removes DST. A library update will be required at that time.

---

## Scan Coverage

| Area                                | Files examined                                                         | DST-sensitive items found         |
| ----------------------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| Payment scheduling (.NET)           | `Utilities/PaymentScheduleService.cs`                                  | 11                                |
| CAS payment dispatch (.NET)         | `Utilities/PaymentService.cs`                                          | 4                                 |
| CAS AP invoice formatting (.NET)    | `Utilities/Client/CasApTransactionInvoices.cs`                         | 8                                 |
| COLA / income support params (.NET) | `Resources/IncomeSupportParameter/IncomeSupportParameterRepository.cs` | 1                                 |
| Application model mapping (.NET)    | `vsd-app/Models.Extensions/ApplicationModelExtensions.cs`              | 1                                 |
| Container image                     | `vsd-app/Dockerfile`                                                   | 0 — Alpine defaults to UTC        |
| Frontend timezone logic             | `vsd-app/ClientApp/src/app/store/config.store.ts`                      | 1                                 |
| Frontend package                    | `vsd-app/ClientApp/package.json`                                       | 1 (version floor)                 |
| OpenShift deploy templates          | `vsd-app/openshift/templates/vsd/vsd-deploy.json`                      | 0 (relies on Dockerfile default)  |
| GitHub Actions CI cron              | `.github/workflows/ci-vsd.yml`                                         | 0 — UTC already                   |
| Dynamics CRM entity model           | `Database/Model/Entities/*.cs`                                         | 0 — managed by Microsoft/Dynamics |

---

## Issues Found and Remediated

### ISSUE-1 — `DateTime.Now` in financial services (HIGH)

**Files:** `PaymentScheduleService.cs`, `PaymentService.cs`, `ApplicationModelExtensions.cs`

`DateTime.Now` returns the **host's local time**. In a UTC container this equals UTC, but any container timezone change would silently offset invoice dates, payment dates, GL dates, and schedule-run-date comparisons.

**Remediation:** Replaced all `DateTime.Now` with `DateTime.UtcNow` in non-test production code.

---

### ISSUE-2 — `.ToLocalTime()` date conversions in financial and scheduling code (HIGH)

**Files:** `PaymentScheduleService.cs`, `PaymentService.cs`, `CasApTransactionInvoices.cs`, `IncomeSupportParameterRepository.cs`

`.ToLocalTime()` converts a `DateTime` to the container's configured local timezone. In a UTC container this is a no-op, but the intent was ambiguous and the behaviour would change if the container timezone were ever set (e.g. to `America/Vancouver`). For CAS AP transaction invoices this could shift date-only fields (`invoiceDate`, `glDate`, `dateInvoiceReceived`) by one calendar day near UTC midnight — a financial correctness issue.

**Remediation:** Replaced all `.ToLocalTime()` with `.ToUniversalTime()`, making UTC intent explicit. Because Dynamics CRM returns `DateTimeKind.Utc` values, `.ToUniversalTime()` is an identity operation on those values, preserving existing runtime behaviour while removing the implicit timezone dependency.

---

### ISSUE-3 — `moment-timezone` bundled IANA data with `'America/Vancouver'` (MEDIUM — future action)

**File:** `vsd-app/ClientApp/src/app/store/config.store.ts`

The outage-announcement banner computes whether to display using:

```typescript
const current = moment().tz('America/Vancouver');
const start = moment(startDate).tz('America/Vancouver');
const end = moment(endDate).tz('America/Vancouver');
return current.isBetween(start, end, null, '[]');
```

`moment-timezone` bundles a snapshot of the IANA tz database. After BC permanently removes DST the IANA database will update `America/Vancouver` to a fixed UTC-8 offset. Until `moment-timezone` is updated to bundle that new data the library will continue applying the old DST rules, causing the banner logic to be off by up to 1 hour during what would previously have been a DST transition window.

**Remediation applied:** Raised the minimum version floor in `package.json` from `^0.5.46` to `^0.5.48` (the version already resolved in `package-lock.json`). This ensures the install baseline is current.

**Residual risk / future action required:** When IANA officially publishes an updated `America/Vancouver` zone without DST, update `moment-timezone` to the first release that bundles that new data, then re-run `npm install` and redeploy. Monitor https://github.com/nicolo-ribaudo/tc39-proposal-temporal and https://www.iana.org/time-zones for the release. An alternative is to replace `moment-timezone` with the native `Intl.DateTimeFormat` API (e.g. using `Temporal` from TC39) which delegates timezone resolution to the V8 engine / ICU data that the container OS keeps current.

---

## Issues Assessed but Not Requiring Code Change

### Dynamics CRM timezone fields

`Vsd_VictimServiceDraft.TimeZoneRuleVersionNumber` and `Vsd_VictimServiceDraft.UtcConversionTimeZoneCode` are standard Dataverse system fields managed by Microsoft. All datetime storage in Dynamics is UTC. Dynamics CRM timezone conversions for display are handled by the CRM platform, not by this application. **No action needed.**

### GitHub Actions CI cron schedule

```yaml
schedule:
  - cron: '0 3 1,15 * *'
```

GitHub Actions cron expressions execute in UTC. The 03:00 UTC trigger is unaffected by BC's timezone change. **No action needed.**

### OpenShift CronJob / Kubernetes Job objects

No `CronJob` or `Job` Kubernetes objects were found in the OpenShift templates. Payment scheduling is driven by HTTP POST endpoints (`POST /api/paymentschedule/schedule-cvap`, `POST /api/payment/send-to-cas`) which are expected to be called by an external scheduler (e.g. Dynamics scheduled workflow or an external cron runner). The timing of those external callers is outside this repository's scope but should be reviewed separately.

---

## Files Changed

| File                                                                   | Change                                                                                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Utilities/PaymentScheduleService.cs`                                  | `DateTime.Now` → `DateTime.UtcNow`, `DateTime.Today` → `DateTime.UtcNow.Date`, `.ToLocalTime()` → `.ToUniversalTime()` (11 occurrences) |
| `Utilities/PaymentService.cs`                                          | `DateTime.Now` → `DateTime.UtcNow`, `.ToLocalTime()` → `.ToUniversalTime()`, `DateTime.Today` → `DateTime.UtcNow.Date` (4 occurrences)  |
| `Utilities/Client/CasApTransactionInvoices.cs`                         | `.ToLocalTime()` → `.ToUniversalTime()` (8 occurrences — both EFT and non-EFT branches)                                                 |
| `Resources/IncomeSupportParameter/IncomeSupportParameterRepository.cs` | `.ToLocalTime().Date` → `.ToUniversalTime().Date` (1 occurrence)                                                                        |
| `vsd-app/Models.Extensions/ApplicationModelExtensions.cs`              | `DateTime.Now` → `DateTime.UtcNow` (1 occurrence)                                                                                       |
| `vsd-app/ClientApp/package.json`                                       | `moment-timezone` floor raised from `^0.5.46` to `^0.5.48`                                                                              |

---

## Residual Risks

| Risk                                                                                        | Likelihood                            | Impact                               | Mitigation                                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `moment-timezone` stale IANA data post-DST-abolition                                        | High (certain after BC abolishes DST) | Low (banner display off by ≤1 hr)    | Update package when IANA data is published; consider native `Intl` API                                                                           |
| External scheduler (Dynamics / cron) calls payment endpoints at wrong time after DST change | Medium                                | High (payments triggered early/late) | Review Dynamics scheduled workflows and any external cron configurations; ensure trigger times are expressed in UTC or use a DST-aware scheduler |
| Dynamics CRM tenant timezone settings                                                       | Low                                   | Medium                               | Verify the Dynamics 365 organization timezone setting is updated when BC finalises the DST change                                                |

---

## Testing Guidance

To confirm correct behaviour before, during, and after the affected time transition:

1. **Unit tests**: Ensure `PaymentScheduleService.GetNextRuntime` tests cover dates near the former DST transition boundary (second Sunday in March and first Sunday in November) and confirm next-run dates are calculated in UTC.
2. **Integration tests**: Run `PaymentScheduleTests` and `PaymentTests` against a test Dynamics environment. The container defaults to UTC via the Alpine base image, which is sufficient.
3. **CAS invoice date test**: Verify `CasApTransactionInvoices.ToJSONString()` with `InvoiceDate = new DateTime(2025, 3, 9, 0, 0, 0, DateTimeKind.Utc)` formats as `"09-MAR-2025"` (not `"08-MAR-2025"` as would happen with UTC-8 local conversion).
4. **Frontend banner test**: After a `moment-timezone` package update, verify the outage banner appears and disappears at the correct UTC times by setting `outageStartDate` / `outageEndDate` to straddle a formerly-DST transition boundary.
