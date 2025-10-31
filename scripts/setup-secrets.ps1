#!/usr/bin/env pwsh
# ============================================
# Wrangler Secrets Configuration Script
# Sets all secrets from .env file to Cloudflare Workers
# ============================================

Write-Host "🔐 Configuring Cloudflare Workers Secrets..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please create it first." -ForegroundColor Red
    exit 1
}

# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "📋 Setting Cloudflare Workers secrets..." -ForegroundColor Yellow
Write-Host ""

# Secret names to set (sensitive values only)
$secrets = @(
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "JWT_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GROQ_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENROUTER_API_KEY",
    "DEEPGRAM_API_KEY",
    "ELEVENLABS_API_KEY",
    "DEEPSEEK_API_KEY",
    "GEMINI_API_KEY",
    "PERPLEXITY_API_KEY",
    "TAVILY_API_KEY",
    "RESEND_API_KEY",
    "GITHUB_TOKEN"
)

$successCount = 0
$failCount = 0

foreach ($secret in $secrets) {
    $value = [Environment]::GetEnvironmentVariable($secret, "Process")
    
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "⚠️  Skipping $secret (not found in .env)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔑 Setting $secret..." -NoNewline
    
    try {
        # Use heredoc to avoid escaping issues
        $value | npx wrangler secret put $secret 2>&1 | Out-Null
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Secrets Configuration Complete!" -ForegroundColor Green
Write-Host "   ✅ Success: $successCount" -ForegroundColor Green
Write-Host "   ❌ Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🚀 Ready to deploy! Run: npm run worker:deploy" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some secrets failed to set. Review errors above." -ForegroundColor Yellow
}
