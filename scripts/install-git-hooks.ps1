# Install Git hooks from scripts/git-hooks into .git/hooks (removes Cursor co-author line from commits).
# Run from repo root: .\scripts\install-git-hooks.ps1   OR from backend: ..\scripts\install-git-hooks.ps1
$scriptDir = $PSScriptRoot
$repoRoot = $scriptDir
while ($repoRoot -and -not (Test-Path (Join-Path $repoRoot ".git"))) { $repoRoot = Split-Path -Parent $repoRoot }
if (-not $repoRoot) { Write-Error "Repo root (.git) not found. Run from repo root or scripts folder."; exit 1 }
$hooksSrc = Join-Path $repoRoot "scripts\git-hooks"
$hooksDest = Join-Path $repoRoot ".git\hooks"
$hookName = "prepare-commit-msg"
$src = Join-Path $hooksSrc $hookName
$dest = Join-Path $hooksDest $hookName
if (-not (Test-Path $src)) { Write-Error "Hook not found: $src"; exit 1 }
Copy-Item -Force $src $dest
Write-Host "Installed $hookName -> .git/hooks/"
