# Convenience wrapper around `k6 run` that saves a JSON summary per run
# under results/, named by scenario and timestamp.
#
# Usage:
#   ./run.ps1 <scenario> [k6 args...]
#   ./run.ps1 <scenario> -Container [k6 args...]   # run via Podman, no local k6 install needed
#
# Examples:
#   ./run.ps1 smoke -e ENV=local
#   ./run.ps1 smoke -Container -e ENV=local
#   ./run.ps1 lookups-read -e ENV=dev -e PROFILE=load
#   ./run.ps1 application-submit -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=ifm
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Scenario,

    [switch]$Container,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$K6Args
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScenarioFile = Join-Path $ScriptDir "scenarios\$Scenario.js"

if (-not (Test-Path $ScenarioFile)) {
    Write-Host "Unknown scenario '$Scenario'. Available scenarios:"
    Get-ChildItem (Join-Path $ScriptDir 'scenarios') -Filter '*.js' | ForEach-Object {
        Write-Host "  - $($_.BaseName)"
    }
    exit 1
}

$ResultsDir = Join-Path $ScriptDir 'results'
New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$SummaryFile = "$Scenario-$Timestamp.summary.json"
$OutJson = Join-Path $ResultsDir $SummaryFile

if ($Container) {
    Write-Host "Running scenario '$Scenario' in container (podman) -> results/$SummaryFile"
    podman run --rm -i `
        -v "${ScriptDir}:/scripts:Z" `
        -w /scripts `
        grafana/k6 run --summary-export "results/$SummaryFile" @K6Args "scenarios/$Scenario.js"
} else {
    Write-Host "Running scenario '$Scenario' -> $OutJson"
    k6 run --summary-export $OutJson @K6Args $ScenarioFile
}
