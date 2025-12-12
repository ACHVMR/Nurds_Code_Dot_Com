# NurdsCode + Intelligent Internet Stack Runner
# PowerShell script to manage the full Docker stack

param(
    [switch]$Build,
    [switch]$Down,
    [switch]$Logs,
    [switch]$Tunnel,
    [string]$Service
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot -replace "\\scripts$", ""
Push-Location $projectRoot

# Check for Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Check for .env file
if (-not (Test-Path ".env")) {
    if (Test-Path "docker/env.docker.example") {
        Write-Host "Creating .env from template..." -ForegroundColor Yellow
        Copy-Item "docker/env.docker.example" ".env"
        Write-Host "Please edit .env and fill in your API keys, then run this script again." -ForegroundColor Red
        exit 0
    }
}

# Build frontend first if needed
if ($Build) {
    Write-Host "`n[1/4] Building frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        exit 1
    }
}

# Command logic
if ($Down) {
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    docker compose down
} elseif ($Logs) {
    if ($Service) {
        docker compose logs -f $Service
    } else {
        docker compose logs -f
    }
} else {
    # Start the stack
    Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     NurdsCode + Intelligent Internet Docker Stack        ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    $composeArgs = @("compose", "up")
    if ($Build) { $composeArgs += "--build" }
    if ($Tunnel) { $composeArgs += "--profile", "tunnel" }
    $composeArgs += "-d"
    
    Write-Host "`n[2/4] Starting Docker stack..." -ForegroundColor Cyan
    docker @composeArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[3/4] Waiting for services to be healthy..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        Write-Host "`n[4/4] Stack is running!" -ForegroundColor Green
        Write-Host "`n═══════════════════════════════════════════════════════════"
        Write-Host "Service URLs:" -ForegroundColor Yellow
        Write-Host "  Frontend:     http://localhost:$($env:FRONTEND_PORT ?? 80)"
        Write-Host "  API Gateway:  http://localhost:8787"
        Write-Host "  II-Agent:     http://localhost:$($env:BACKEND_PORT ?? 8000)"
        Write-Host "  Sandbox:      http://localhost:$($env:SANDBOX_SERVER_PORT ?? 8100)"
        Write-Host "  Tools:        http://localhost:$($env:TOOL_SERVER_PORT ?? 1236)"
        Write-Host "═══════════════════════════════════════════════════════════"
        Write-Host "`nUseful commands:"
        Write-Host "  View logs:    ./scripts/run_stack.ps1 -Logs"
        Write-Host "  Stop stack:   ./scripts/run_stack.ps1 -Down"
        Write-Host "  Rebuild:      ./scripts/run_stack.ps1 -Build"
    } else {
        Write-Error "Failed to start Docker stack"
        docker compose logs
    }
}

Pop-Location
