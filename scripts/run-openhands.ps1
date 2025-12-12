# OpenHands Container Runner Script
# This script starts the OpenHands AI coding assistant container

param(
    [string]$Port = "3000",
    [string]$WorkspaceDir = (Get-Location).Path
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   OpenHands Container Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/4] Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        Write-Host "   Open Docker Desktop and wait for it to fully start." -ForegroundColor Gray
        exit 1
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check for existing OpenHands container
Write-Host "[2/4] Checking for existing OpenHands containers..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=openhands" --format "{{.Names}}" 2>&1
if ($existingContainer -eq "openhands") {
    Write-Host "   Found existing container. Removing..." -ForegroundColor Gray
    docker stop openhands 2>&1 | Out-Null
    docker rm openhands 2>&1 | Out-Null
    Write-Host "✅ Removed existing container" -ForegroundColor Green
} else {
    Write-Host "✅ No existing container found" -ForegroundColor Green
}

# Pull the latest OpenHands image
Write-Host "[3/4] Pulling latest OpenHands image..." -ForegroundColor Yellow
docker pull ghcr.io/all-hands-ai/openhands:main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to pull OpenHands image" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pulled successfully" -ForegroundColor Green

# Start the OpenHands container
Write-Host "[4/4] Starting OpenHands container..." -ForegroundColor Yellow
Write-Host "   Workspace: $WorkspaceDir" -ForegroundColor Gray
Write-Host "   Port: $Port" -ForegroundColor Gray

docker run -d `
    --name openhands `
    -p "${Port}:3000" `
    -v "${WorkspaceDir}:/opt/workspace_base" `
    -v "/var/run/docker.sock:/var/run/docker.sock" `
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE="ghcr.io/all-hands-ai/runtime:main" `
    ghcr.io/all-hands-ai/openhands:main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "   ✅ OpenHands is now running!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Access OpenHands at: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Useful commands:" -ForegroundColor Yellow
    Write-Host "   - View logs:    docker logs -f openhands" -ForegroundColor Gray
    Write-Host "   - Stop:         docker stop openhands" -ForegroundColor Gray
    Write-Host "   - Restart:      docker restart openhands" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Failed to start OpenHands container" -ForegroundColor Red
    Write-Host "   Check Docker logs for more details" -ForegroundColor Gray
    exit 1
}
