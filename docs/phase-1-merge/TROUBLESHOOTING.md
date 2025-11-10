# 🔧 TROUBLESHOOTING GUIDE
## Nurds Code + Deploy Platform Integration

**Last Updated:** November 10, 2025  
**Sprint:** 12 Foundation - Phase 1 Complete

---

## 🚨 COMMON ISSUES & SOLUTIONS

### 1. Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port (Linux/Mac)
lsof -i :3000
kill -9 <PID>

# Find process using port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env.local
PORT=3001
```

---

### 2. Docker Container Won't Start

**Symptoms:**
```
Error: Cannot start service frontend: driver failed programming external connectivity
```

**Solution 1 - Restart Docker:**
```bash
# Restart Docker Desktop
# Or via CLI
sudo service docker restart  # Linux
# Restart Docker Desktop app on Mac/Windows
```

**Solution 2 - Remove conflicting containers:**
```bash
docker ps -a  # List all containers
docker rm -f <container_name>
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

---

### 3. Database Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed for user "nurdscode"
```

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs nurdscode-postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres

# Verify connection
docker exec -it nurdscode-postgres psql -U nurdscode -d nurdscode_db -c "SELECT 1;"

# Reset database (WARNING: deletes all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up postgres
```

---

### 4. Redis Connection Failed

**Symptoms:**
```
Error: Redis connection to localhost:6379 failed - connect ECONNREFUSED
```

**Solution:**
```bash
# Check if Redis container is running
docker ps | grep redis

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis

# Test connection
docker exec -it nurdscode-redis redis-cli ping
# Expected: PONG

# Clear cache if corrupted
docker exec -it nurdscode-redis redis-cli FLUSHALL
```

---

### 5. npm install Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If still fails, use legacy peer deps
npm install --legacy-peer-deps

# Or use npm ci (faster, production mode)
npm ci
```

---

### 6. TypeScript Errors

**Symptoms:**
```
TS2307: Cannot find module '@/components/...' or its corresponding type declarations.
```

**Solution:**
```bash
# Regenerate TypeScript types
npm run type-check

# Restart TypeScript server (VSCode)
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Check tsconfig.json paths
# Ensure baseUrl is set to "."
# Ensure paths["@/*"] is set to ["./src/*"]
```

---

### 7. Docker Out of Disk Space

**Symptoms:**
```
Error: no space left on device
```

**Solution:**
```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes

# Remove specific images
docker images
docker rmi <image_id>

# Remove dangling volumes
docker volume ls -qf dangling=true | xargs docker volume rm
```

---

### 8. Cloudflare Worker Deployment Fails

**Symptoms:**
```
Error: Authentication error [code: 10000]
Error: API token invalid
```

**Solution:**
```bash
# Re-authenticate with Cloudflare
wrangler logout
wrangler login

# Verify API token
echo $CLOUDFLARE_API_TOKEN

# Deploy with explicit account ID
cd backend/cloudflare-workers
wrangler deploy --account-id 49d710612f9fc6359ac0f067482b5684

# Check wrangler.toml
# Ensure account_id = "49d710612f9fc6359ac0f067482b5684"
```

---

### 9. Python Backend Won't Start

**Symptoms:**
```
ModuleNotFoundError: No module named 'fastapi'
ImportError: cannot import name 'X' from 'Y'
```

**Solution:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Recreate virtual environment
cd backend/acheevy-orchestrator
rm -rf venv
python -m venv venv

# Activate venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Verify installation
pip list | grep fastapi
```

---

### 10. Environment Variables Not Loaded

**Symptoms:**
```
Error: Missing environment variable: SUPABASE_URL
process.env.SUPABASE_URL is undefined
```

**Solution:**
```bash
# Verify .env.local exists
ls -la .env.local

# Check file encoding (must be UTF-8)
file .env.local  # Linux/Mac
Get-Content .env.local -Encoding UTF8  # Windows

# Restart development server
npm run dev

# For Docker, rebuild
docker-compose -f docker-compose.dev.yml up --build frontend

# Verify variables loaded
docker exec -it nurdscode-frontend env | grep SUPABASE_URL
```

---

### 11. Hot Reload Not Working

**Symptoms:**
- Changes to code not reflecting in browser
- Need to manually refresh every time

**Solution (Next.js):**
```bash
# Clear .next cache
rm -rf .next
npm run dev

# Check if file watcher limit exceeded (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Docker hot reload (ensure volumes mounted)
# In docker-compose.dev.yml, check:
volumes:
  - .:/app
  - /app/node_modules  # Important!
```

---

### 12. Supabase Connection Timeout

**Symptoms:**
```
Error: connect ETIMEDOUT
FetchError: request to https://xxx.supabase.co failed
```

**Solution:**
```bash
# Check Supabase project status
# Visit: https://app.supabase.com/projects

# Verify credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection directly
curl https://your-project.supabase.co/rest/v1/

# Check firewall/VPN blocking Supabase
ping your-project.supabase.co
```

---

### 13. Clerk Authentication Error

**Symptoms:**
```
Error: Clerk publishable key not found
Error: Invalid Clerk API key
```

**Solution:**
```bash
# Verify Clerk keys in .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Check Clerk dashboard
# Visit: https://dashboard.clerk.com

# Ensure frontend + backend have keys
# Backend needs CLERK_SECRET_KEY
# Frontend needs NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Restart services after adding keys
npm run docker:dev:build
```

---

### 14. CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```bash
# Update backend CORS settings
# In backend/acheevy-orchestrator/main.py:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-production-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Restart backend
npm run backend:acheevy
```

---

### 15. Playwright Tests Failing

**Symptoms:**
```
Error: browserType.launch: Executable doesn't exist
Error: Test timeout of 30000ms exceeded
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install
npx playwright install-deps

# Run with headed mode for debugging
npm run test:e2e -- --headed

# Increase timeout in playwright.config.ts:
timeout: 60000,  // 60 seconds

# View trace
npx playwright show-trace trace.zip
```

---

## 🔍 DEBUGGING TOOLS

### Check Service Health
```bash
# Frontend
curl http://localhost:3000/api/health

# ACHEEVY
curl http://localhost:8000/health

# Boomer_Angs
curl http://localhost:8001/health

# PostgreSQL
docker exec -it nurdscode-postgres pg_isready -U nurdscode

# Redis
docker exec -it nurdscode-redis redis-cli ping
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker logs -f nurdscode-frontend
docker logs -f acheevy-orchestrator
docker logs -f boomer-angs
docker logs -f nurdscode-postgres
docker logs -f nurdscode-redis

# Last 100 lines
docker logs --tail 100 acheevy-orchestrator
```

### Inspect Container
```bash
# Access shell
docker exec -it nurdscode-frontend sh
docker exec -it acheevy-orchestrator bash

# Check environment variables
docker exec -it nurdscode-frontend env

# Check disk usage
docker exec -it nurdscode-frontend df -h

# Check running processes
docker exec -it acheevy-orchestrator ps aux
```

### Database Debugging
```bash
# Access PostgreSQL
docker exec -it nurdscode-postgres psql -U nurdscode -d nurdscode_db

# List tables
\dt

# Describe table
\d table_name

# Run query
SELECT * FROM users LIMIT 10;

# Exit
\q
```

### Redis Debugging
```bash
# Access Redis CLI
docker exec -it nurdscode-redis redis-cli

# Check keys
KEYS *

# Get value
GET key_name

# Clear cache
FLUSHALL

# Exit
exit
```

---

## 🆘 STILL STUCK?

### 1. Check GitHub Issues
```
https://github.com/ACHVMR/Nurds_Code_Dot_Com/issues
```

### 2. Review Documentation
- Phase 1 Summary: `/docs/phase-1-merge/PHASE_1_COMPLETE.md`
- Setup Guide: `/docs/phase-1-merge/SETUP_GUIDE.md`

### 3. Check Discord/Slack
(Add your team's communication channel)

### 4. Create Detailed Issue Report
Include:
- **Error message** (full stack trace)
- **Steps to reproduce**
- **Environment** (OS, Node version, Docker version)
- **What you've tried** (list solutions attempted)
- **Logs** (relevant container/service logs)

---

## 📋 SYSTEM REQUIREMENTS CHECKLIST

Before reporting issues, verify:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm 9+** installed (`npm --version`)
- [ ] **Docker Desktop** running (`docker ps`)
- [ ] **Docker Compose** available (`docker-compose --version`)
- [ ] **Git** configured (`git --version`)
- [ ] **Python 3.11+** (backend only) (`python --version`)
- [ ] **wrangler CLI** (optional) (`wrangler --version`)
- [ ] **Sufficient disk space** (10GB+ free)
- [ ] **Sufficient RAM** (8GB+ recommended)
- [ ] **Internet connection** (for Docker images, npm packages)
- [ ] **Port availability** (3000, 8000, 8001, 5432, 6379, 8002)
- [ ] **.env.local file** exists and valid
- [ ] **API keys** configured (Supabase, Clerk, Cloudflare)

---

**Last Updated:** November 10, 2025  
**Support:** For urgent issues, see GitHub Issues or team chat
