# Redeploys MyLeadsMap on the production DigitalOcean droplet: SSHs in, pulls the latest main,
# and rebuilds/restarts the Docker Compose stack (base + prod override, which adds Caddy for
# HTTPS and stops publishing the frontend's port directly -- see docker-compose.prod.yml).
#
# Reads connection details from .env.deploy in the repo root (gitignored, since the droplet's
# IP has no business being in this public repo) -- copy .env.deploy.example to .env.deploy and
# fill in your droplet's real IP first.
#
# Prerequisites this script cannot do for you:
#   - The droplet must already exist, have Docker installed, and have this repo cloned to
#     DROPLET_PATH with its own .env (DOMAIN, JWT_SECRET, POSTGRES_PASSWORD, etc.) already set up
#     -- see README.md's Production deployment section for first-time setup.
#   - The SSH public key (~/.ssh/myleadsmap_droplet.pub) must already be in the droplet's
#     ~/.ssh/authorized_keys -- either added during droplet creation in the DO console, or via
#     `ssh-copy-id -i ~/.ssh/myleadsmap_droplet.pub root@<droplet-ip>` afterward.
#
# Usage:
#   .\scripts\deploy_to_droplet.ps1

$RepoRoot = Split-Path -Parent $PSScriptRoot
$DeployEnvFile = Join-Path $RepoRoot ".env.deploy"

if (-not (Test-Path $DeployEnvFile)) {
    Write-Error ".env.deploy not found at $DeployEnvFile. Copy .env.deploy.example to .env.deploy and fill in your droplet's real details first."
    exit 1
}

$deployVars = @{}
Get-Content $DeployEnvFile | Where-Object { $_ -match "=" -and $_ -notmatch "^\s*#" } | ForEach-Object {
    $key, $value = $_ -split "=", 2
    $deployVars[$key.Trim()] = $value.Trim()
}

$DropletHost = $deployVars["DROPLET_HOST"]
$DropletUser = if ($deployVars["DROPLET_USER"]) { $deployVars["DROPLET_USER"] } else { "root" }
$DropletPath = if ($deployVars["DROPLET_PATH"]) { $deployVars["DROPLET_PATH"] } else { "/opt/myleadsmap" }
$SshKeyPath = if ($deployVars["SSH_KEY_PATH"]) { $deployVars["SSH_KEY_PATH"] } else { "~/.ssh/myleadsmap_droplet" }

if (-not $DropletHost -or $DropletHost -eq "203.0.113.10") {
    Write-Error "DROPLET_HOST in .env.deploy is missing or still the placeholder value. Set it to your droplet's real IP."
    exit 1
}

Write-Output "--- Deploying to $DropletUser@$DropletHost`:$DropletPath ---"
ssh -i $SshKeyPath "$DropletUser@$DropletHost" "cd $DropletPath && git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deploy failed (ssh exited with code $LASTEXITCODE). See output above."
    exit 1
}

Write-Output ""
Write-Output "Deploy complete. Tail logs with:"
Write-Output "  ssh -i $SshKeyPath $DropletUser@$DropletHost 'cd $DropletPath && docker compose logs -f'"
