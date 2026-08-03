# Exposes the local MyLeadsMap Docker Compose stack (frontend on localhost:8080 by default) to the
# public internet via `tailscale funnel` -- deliberately funnel (public), not `tailscale serve`
# (tailnet-private), matching the Owner's decision to promote this low-stakes app to people outside
# their own tailnet.
#
# Prerequisites this script cannot do for you:
#   - Install Tailscale (https://tailscale.com/download/windows) and run `tailscale up` to log in
#     -- that's a credentialed action only you can perform.
#   - Enable Funnel for this device, one time: https://login.tailscale.com/admin/machines -> your
#     device -> Funnel. `tailscale funnel` will fail with a clear error naming this if it's off.
#   - Copy .env.example to .env in the repo root and fill in real values (see README.md) --
#     the stack won't start without it.
#
# Usage:
#   .\scripts\serve_via_tailscale_funnel.ps1          # start the stack + expose it publicly
#   .\scripts\serve_via_tailscale_funnel.ps1 -Stop    # remove the funnel mapping (leaves the Docker Compose stack running -- `docker compose down` separately if you want it down too)
#   .\scripts\serve_via_tailscale_funnel.ps1 -Status  # show current tailnet funnel mappings

param(
    [switch]$Stop,
    [switch]$Status
)

$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $RepoRoot ".env"
$ComposeFile = Join-Path $RepoRoot "docker-compose.yml"

if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
    Write-Error "tailscale CLI not found on PATH. Install it first: https://tailscale.com/download/windows, then run 'tailscale up' and complete login in the browser."
    exit 1
}

# Read FRONTEND_PORT from .env (defaults to 8080, matching docker-compose.yml's default).
$frontendPort = 8080
if (Test-Path $EnvFile) {
    $portLine = Get-Content $EnvFile | Where-Object { $_ -match "^FRONTEND_PORT=" }
    if ($portLine) {
        $frontendPort = ($portLine -split "=", 2)[1].Trim()
    }
}

if ($Status) {
    tailscale funnel status
    return
}

if ($Stop) {
    tailscale funnel --https=443 off
    Write-Output "Funnel mapping removed. The Docker Compose stack is still running --"
    Write-Output "stop it separately with 'docker compose down' if you want it down too."
    return
}

$tsStatus = tailscale status --json | ConvertFrom-Json
if (-not $tsStatus -or $tsStatus.BackendState -ne "Running") {
    Write-Error "Tailscale isn't logged in yet. Run 'tailscale up' and complete login in the browser, then re-run this script."
    exit 1
}
$dnsName = $tsStatus.Self.DNSName.TrimEnd('.')
$publicBaseUrl = "https://$dnsName"

if (-not (Test-Path $EnvFile)) {
    Write-Error ".env not found at $EnvFile. Copy .env.example to .env and fill in real values, then re-run this script."
    exit 1
}

Write-Output "--- Starting the Docker Compose stack (db + backend + frontend) ---"
docker compose -f $ComposeFile up -d --build

Write-Output "--- Exposing localhost:$frontendPort publicly via Tailscale Funnel ---"
tailscale funnel --bg --https=443 "http://127.0.0.1:$frontendPort"

Write-Output ""
Write-Output "MyLeadsMap is now public at: $publicBaseUrl/"
Write-Output ""
Write-Output "Anyone with this URL can reach it -- there's no IP allowlist in front of it. Access is"
Write-Output "controlled entirely by MyLeadsMap's own login (admin-provisioned accounts only -- create"
Write-Output "them from Profile -> Manage Users after logging in as the bootstrap admin)."
