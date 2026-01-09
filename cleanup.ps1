# cleanup.ps1 - Fixes Windows node_modules deletion issues (long paths)
# Run as Administrator:
#   powershell -ExecutionPolicy Bypass -File .\cleanup.ps1

$ErrorActionPreference = 'Stop'

Write-Host "🧹 Cleaning up node_modules..." -ForegroundColor Cyan

# Stop all node processes (ignore if none)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Enable long paths in Windows (requires admin). If not admin, this will fail; script will warn and continue.
try {
  Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1
  Write-Host "✅ Long paths enabled." -ForegroundColor Green
} catch {
  Write-Host "⚠️ Could not enable long paths (run as Administrator). Continuing..." -ForegroundColor Yellow
}

function Remove-NodeModulesPath([string]$path) {
  if (-not (Test-Path $path)) { return }

  Write-Host "Removing $path..." -ForegroundColor Yellow

  $tempDir = Join-Path $PWD "empty_temp"
  New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

  # Robocopy mirror trick: mirror empty dir into target (fast delete)
  robocopy $tempDir $path /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

  # Remove leftover directory
  Remove-Item $path -Force -Recurse -ErrorAction SilentlyContinue
  Remove-Item $tempDir -Force -Recurse -ErrorAction SilentlyContinue
}

$paths = @(
  ".\node_modules",
  ".\workers\node_modules"
)

foreach ($p in $paths) {
  Remove-NodeModulesPath $p
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run worker:dev" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
