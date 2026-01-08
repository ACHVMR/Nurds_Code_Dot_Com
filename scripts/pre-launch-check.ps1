# ============================================
# NurdsCode Pre-Launch Verification Script
# Run before deploying to production
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NurdsCode Pre-Launch Check              " -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# ----------------------------------------
# 1. Git Status
# ----------------------------------------
Write-Host "[1/9] Checking Git Status..." -ForegroundColor Yellow
try {
    $uncommitted = git status --porcelain 2>$null
    if ($uncommitted) {
        $warnings += "Uncommitted changes detected - commit before deploy"
        Write-Host "  ⚠️  Uncommitted changes:" -ForegroundColor Yellow
        git status --short
    } else {
        Write-Host "  ✅ Git working tree clean" -ForegroundColor Green
    }
} catch {
    $warnings += "Git not available or not a git repository"
    Write-Host "  ⚠️  Git check failed" -ForegroundColor Yellow
}

# ----------------------------------------
# 2. Node.js Version
# ----------------------------------------
Write-Host "`n[2/9] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$Matches[1]
        if ($majorVersion -ge 18) {
            Write-Host "  ✅ Node.js $nodeVersion" -ForegroundColor Green
        } else {
            $errors += "Node.js 18+ required, found $nodeVersion"
            Write-Host "  ❌ Node.js 18+ required, found $nodeVersion" -ForegroundColor Red
        }
    }
} catch {
    $errors += "Node.js not installed"
    Write-Host "  ❌ Node.js not installed" -ForegroundColor Red
}

# ----------------------------------------
# 3. Dependencies
# ----------------------------------------
Write-Host "`n[3/9] Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $packageCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "  ✅ node_modules exists ($packageCount packages)" -ForegroundColor Green
} else {
    $errors += "node_modules missing - run: npm install"
    Write-Host "  ❌ node_modules missing - run: npm install" -ForegroundColor Red
}

# ----------------------------------------
# 4. Environment File
# ----------------------------------------
Write-Host "`n[4/9] Checking Environment File..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @(
        "VITE_STRIPE_PUBLISHABLE_KEY",
        "VITE_CLERK_PUBLISHABLE_KEY"
    )
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            Write-Host "    ✅ $var configured" -ForegroundColor Green
        } else {
            $warnings += "$var not set in .env"
            Write-Host "    ⚠️  $var not set" -ForegroundColor Yellow
        }
    }
} else {
    $warnings += ".env file missing - copy from .env.example"
    Write-Host "  ⚠️  .env file missing" -ForegroundColor Yellow
    Write-Host "      Run: Copy-Item .env.example .env" -ForegroundColor Gray
}

# ----------------------------------------
# 5. Wrangler Configuration
# ----------------------------------------
Write-Host "`n[5/9] Checking Wrangler Config..." -ForegroundColor Yellow
if (Test-Path "wrangler.toml") {
    $wranglerContent = Get-Content "wrangler.toml" -Raw
    Write-Host "  ✅ wrangler.toml exists" -ForegroundColor Green
    
    # Check for production environment
    if ($wranglerContent -match '\[env\.production\]') {
        Write-Host "    ✅ Production environment defined" -ForegroundColor Green
    } else {
        $warnings += "Production environment not defined in wrangler.toml"
        Write-Host "    ⚠️  Production environment not defined" -ForegroundColor Yellow
    }
    
    # Check for D1 database
    if ($wranglerContent -match 'database_id\s*=\s*"YOUR_D1_DATABASE_ID"') {
        $errors += "D1 database_id placeholder not replaced in wrangler.toml"
        Write-Host "    ❌ D1 database_id needs to be configured" -ForegroundColor Red
        Write-Host "       Run: npx wrangler d1 create nurdscode_db" -ForegroundColor Gray
    } elseif ($wranglerContent -match 'database_id\s*=\s*"[a-f0-9-]+"') {
        Write-Host "    ✅ D1 database configured" -ForegroundColor Green
    } else {
        $warnings += "D1 database not configured"
        Write-Host "    ⚠️  D1 database not configured" -ForegroundColor Yellow
    }
} else {
    $errors += "wrangler.toml missing"
    Write-Host "  ❌ wrangler.toml missing" -ForegroundColor Red
}

# ----------------------------------------
# 6. Workers Structure
# ----------------------------------------
Write-Host "`n[6/9] Checking Workers Structure..." -ForegroundColor Yellow
$requiredWorkerFiles = @(
    "workers/index.js"
)
$optionalWorkerFiles = @(
    "workers/api.js",
    "workers/middleware/auth.js",
    "workers/middleware/cors.js",
    "workers/routes/chat.js",
    "workers/routes/billing.js"
)

$missingRequired = @()
$missingOptional = @()

foreach ($file in $requiredWorkerFiles) {
    if (-not (Test-Path $file)) {
        $missingRequired += $file
    }
}

foreach ($file in $optionalWorkerFiles) {
    if (-not (Test-Path $file)) {
        $missingOptional += $file
    }
}

if ($missingRequired.Count -eq 0) {
    Write-Host "  ✅ Required worker files present" -ForegroundColor Green
} else {
    $errors += "Missing required worker files: $($missingRequired -join ', ')"
    Write-Host "  ❌ Missing: $($missingRequired -join ', ')" -ForegroundColor Red
}

if ($missingOptional.Count -gt 0 -and $missingOptional.Count -lt $optionalWorkerFiles.Count) {
    Write-Host "  ℹ️  Optional files missing: $($missingOptional -join ', ')" -ForegroundColor Gray
}

# ----------------------------------------
# 7. Build Test
# ----------------------------------------
Write-Host "`n[7/9] Testing Build..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Build successful" -ForegroundColor Green
        
        # Check dist folder
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "    Output size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
        }
    } else {
        $errors += "Build failed"
        Write-Host "  ❌ Build failed" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    $errors += "Build error: $_"
    Write-Host "  ❌ Build error: $_" -ForegroundColor Red
}

# ----------------------------------------
# 8. GitHub Workflows
# ----------------------------------------
Write-Host "`n[8/9] Checking GitHub Workflows..." -ForegroundColor Yellow
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "  ✅ deploy.yml exists" -ForegroundColor Green
} else {
    $warnings += "deploy.yml missing - CI/CD may not work"
    Write-Host "  ⚠️  deploy.yml missing" -ForegroundColor Yellow
}

if (Test-Path ".github/workflows/docker-build-push.yml") {
    Write-Host "  ✅ docker-build-push.yml exists" -ForegroundColor Green
}

# ----------------------------------------
# 9. Wrangler Authentication
# ----------------------------------------
Write-Host "`n[9/9] Checking Wrangler Auth..." -ForegroundColor Yellow
try {
    $whoami = npx wrangler whoami 2>&1
    if ($LASTEXITCODE -eq 0 -and $whoami -notmatch "not authenticated") {
        Write-Host "  ✅ Authenticated with Cloudflare" -ForegroundColor Green
    } else {
        $warnings += "Not authenticated with Cloudflare"
        Write-Host "  ⚠️  Not authenticated - run: npx wrangler login" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Could not check Wrangler authentication"
    Write-Host "  ⚠️  Could not check auth status" -ForegroundColor Yellow
}

# ----------------------------------------
# Summary
# ----------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Summary                                 " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! Ready to deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. git add ." -ForegroundColor White
    Write-Host "  2. git commit -m 'Launch: NurdsCode v1.0'" -ForegroundColor White
    Write-Host "  3. git push origin main" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Errors ($($errors.Count)) - Must fix before deploy:" -ForegroundColor Red
        foreach ($e in $errors) {
            Write-Host "   • $e" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Warnings ($($warnings.Count)) - Should address:" -ForegroundColor Yellow
        foreach ($w in $warnings) {
            Write-Host "   • $w" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# ----------------------------------------
# Quick Reference
# ----------------------------------------
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Quick Reference                         " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Create D1 Database:" -ForegroundColor Yellow
Write-Host "  npx wrangler d1 create nurdscode_db" -ForegroundColor White
Write-Host ""
Write-Host "Set Worker Secrets:" -ForegroundColor Yellow
Write-Host "  pwsh -File scripts/setup-secrets.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Local Development:" -ForegroundColor Yellow
Write-Host "  npm run dev          # Frontend (Terminal 1)" -ForegroundColor White
Write-Host "  npm run worker:dev   # Workers (Terminal 2)" -ForegroundColor White
Write-Host ""
Write-Host "Deploy Manually:" -ForegroundColor Yellow
Write-Host "  npx wrangler pages deploy dist --project-name=nurdscode" -ForegroundColor White
Write-Host "  npx wrangler deploy --env production" -ForegroundColor White
Write-Host ""
Write-Host "Monitor Actions:" -ForegroundColor Yellow
Write-Host "  https://github.com/ACHVMR/Nurds_Code_Dot_Com/actions" -ForegroundColor White
Write-Host ""
