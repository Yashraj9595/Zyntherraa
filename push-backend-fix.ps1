# Run this script to push the backend fix so Coolify build succeeds.
# Fix: invalidateCache import in backend/src/routes/products.ts

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Remove stale lock so git can run
if (Test-Path ".git\index.lock") { Remove-Item -Force ".git\index.lock" }

# Stage only the files needed for backend deploy
git add backend/src/routes/products.ts backend/package.json backend/nixpacks.toml backend/src/config/db.ts
git status

# Commit and push
git commit -m "fix: add invalidateCache import in products.ts for backend build"
git push origin main

Write-Host "Done. Redeploy the backend in Coolify (clear build cache if it still fails)."
