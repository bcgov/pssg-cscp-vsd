# Pretty-prints a k6 --summary-export JSON file without needing k6 (or jq)
# installed - just PowerShell, which you already have.
#
# Usage:
#   ./report.ps1 results/application-submit-20260924-151549.summary.json
#   ./report.ps1 results/*.summary.json          # latest match if multiple
#
# If no path is given, shows the most recently modified file in results/.
param(
    [Parameter(Position = 0)]
    [string]$Path
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $Path) {
    $latest = Get-ChildItem (Join-Path $ScriptDir 'results') -Filter '*.summary.json' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) {
        Write-Host "No summary files found in results/. Pass a path explicitly."
        exit 1
    }
    $Path = $latest.FullName
}

$resolved = Get-Item $Path -ErrorAction SilentlyContinue
if (-not $resolved) {
    Write-Host "File not found: $Path"
    exit 1
}

$summary = Get-Content $resolved.FullName -Raw | ConvertFrom-Json

Write-Host "=== $($resolved.Name) ===" -ForegroundColor Cyan
Write-Host ""

# --- Thresholds (pass/fail gate for the whole run) ---
# Note: k6's summary JSON uses `true` to mean the threshold was BREACHED
# (failed), and `false` to mean it held (passed) - the opposite of what
# you'd naively expect from a boolean named after the threshold condition.
Write-Host "-- Thresholds --" -ForegroundColor Yellow
foreach ($metricName in $summary.metrics.PSObject.Properties.Name) {
    $metric = $summary.metrics.$metricName
    if ($metric.thresholds) {
        foreach ($t in $metric.thresholds.PSObject.Properties) {
            $breached = $t.Value
            $status = if ($breached) { "FAIL" } else { "PASS" }
            $color = if ($breached) { "Red" } else { "Green" }
            Write-Host ("  [{0}] {1}: {2}" -f $status, $metricName, $t.Name) -ForegroundColor $color
        }
    }
}

# --- Error rate ---
Write-Host ""
Write-Host "-- HTTP errors --" -ForegroundColor Yellow
$failed = $summary.metrics.http_req_failed
if ($failed) {
    $pct = [math]::Round($failed.value * 100, 2)
    Write-Host "  http_req_failed: $pct% (0% is healthy)"
}

# --- Latency ---
Write-Host ""
Write-Host "-- Latency (http_req_duration, ms) --" -ForegroundColor Yellow
$dur = $summary.metrics.http_req_duration
if ($dur) {
    "  avg={0:N0}  min={1:N0}  med={2:N0}  p90={3:N0}  p95={4:N0}  max={5:N0}" -f `
        $dur.avg, $dur.min, $dur.med, $dur.'p(90)', $dur.'p(95)', $dur.max | Write-Host
}

# --- Checks (pass/fail per assertion, by name) ---
Write-Host ""
Write-Host "-- Checks --" -ForegroundColor Yellow
$checks = $summary.root_group.checks
if ($checks) {
    foreach ($checkName in $checks.PSObject.Properties.Name) {
        $c = $checks.$checkName
        $status = if ($c.fails -gt 0) { "FAIL" } else { "PASS" }
        $color = if ($c.fails -gt 0) { "Red" } else { "Green" }
        Write-Host ("  [{0}] {1}: {2} passed, {3} failed" -f $status, $checkName, $c.passes, $c.fails) -ForegroundColor $color
    }
}

# --- Volume ---
Write-Host ""
Write-Host "-- Volume --" -ForegroundColor Yellow
$iters = $summary.metrics.iterations
$vus = $summary.metrics.vus_max
if ($iters) { Write-Host "  iterations: $($iters.count)" }
if ($vus) { Write-Host "  max VUs: $($vus.value)" }
