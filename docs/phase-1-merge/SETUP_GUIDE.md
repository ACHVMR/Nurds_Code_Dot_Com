# 🚀 QUICK SETUP GUIDE
## Nurds Code + Deploy Platform Integration

**Last Updated:** November 10, 2025  
**Sprint:** 12 Foundation - Phase 1 Complete

---

## 📋 PREREQUISITES

### Required Software
- ✅ **Node.js 18+** (check: `node --version`)
- ✅ **npm 9+** (check: `npm --version`)
- ✅ **Docker Desktop** (check: `docker --version`)
- ✅ **Docker Compose** (check: `docker-compose --version`)
- ✅ **Git** (check: `git --version`)
- ✅ **Python 3.11+** (for backend only) (check: `python --version`)

### Optional Tools
- **wrangler CLI** (`npm install -g wrangler`) - Cloudflare Workers
- **PostgreSQL client** (`psql`) - Database debugging
- **Redis client** (`redis-cli`) - Cache debugging

---

## ⚡ 5-MINUTE QUICK START

### 1. Clone Repository
```bash
git clone https://github.com/ACHVMR/Nurds_Code_Dot_Com.git nurdscode-platform
cd nurdscode-platform
git checkout integration/deploy-merge
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys
# Minimum required:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Full Stack (Docker Compose)
```bash
# Start all 6 services in background
npm run docker:dev

# Or with rebuild
npm run docker:dev:build

# View logs
npm run docker:logs
```

### 5. Verify Services
```bash
# Frontend (Next.js)
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# ACHEEVY Orchestrator
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"acheevy-orchestrator"}

# Boomer_Angs Specialists
curl http://localhost:8001/health
# Expected: {"status":"healthy","service":"boomer-angs"}

# PostgreSQL
docker exec -it nurdscode-postgres psql -U nurdscode -d nurdscode_db -c "SELECT 1;"
# Expected: 1 row returned

# Redis
docker exec -it nurdscode-redis redis-cli ping
# Expected: PONG
```

### 6. Open Application
```
Frontend:  http://localhost:3000
ACHEEVY:   http://localhost:8000/docs  (FastAPI Swagger)
Boomer:    http://localhost:8001/docs
```

**Total Time:** ~5 minutes (excluding dependency download)

---

## 🛠️ DEVELOPMENT WORKFLOWS

### Option 1: Docker Compose (Recommended)

**Start all services:**
```bash
npm run docker:dev
```

**Stop all services:**
```bash
npm run docker:down
```

**Rebuild and restart:**
```bash
npm run docker:dev:build
```

**View logs:**
```bash
npm run docker:logs

# Or for specific service
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f acheevy
```

**Pros:**
- ✅ Matches production environment
- ✅ All services isolated
- ✅ Easy multi-service debugging
- ✅ One command to rule them all

**Cons:**
- ❌ Slower hot reload
- ❌ More resource intensive

---

### Option 2: Local Development (Faster Iteration)

**Terminal 1 - Frontend:**
```bash
npm run dev
# Next.js on http://localhost:3000
```

**Terminal 2 - ACHEEVY:**
```bash
npm run backend:acheevy
# FastAPI on http://localhost:8000
```

**Terminal 3 - Boomer_Angs:**
```bash
npm run backend:boomer-angs
# FastAPI on http://localhost:8001
```

**Terminal 4 - Database (Docker only):**
```bash
docker run -d --name nurdscode-postgres \
  -e POSTGRES_USER=nurdscode \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=nurdscode_db \
  -p 5432:5432 \
  postgres:16-alpine
```

**Terminal 5 - Redis (Docker only):**
```bash
docker run -d --name nurdscode-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Pros:**
- ✅ Faster hot reload
- ✅ Direct debugging
- ✅ Lower resource usage

**Cons:**
- ❌ 5 terminal windows
- ❌ Manual service management

---

### Option 3: Hybrid (Best of Both Worlds)

**Start only databases in Docker:**
```bash
docker-compose -f docker-compose.dev.yml up postgres redis
```

**Run services locally:**
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run backend:acheevy

# Terminal 3
npm run backend:boomer-angs
```

**Pros:**
- ✅ Fast frontend iteration
- ✅ Isolated databases
- ✅ Balanced resource usage

---

## 🧪 TESTING

### Unit Tests (Vitest)
```bash
npm run test
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test:e2e

# Run tests with UI
npm run test:e2e -- --ui

# Debug mode
npm run test:e2e -- --debug
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

---

## 🔧 COMMON TASKS

### Reset Database
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up postgres redis
```

### Clear Redis Cache
```bash
docker exec -it nurdscode-redis redis-cli FLUSHALL
```

### View Container Logs
```bash
# All containers
docker-compose -f docker-compose.dev.yml logs -f

# Specific container
docker logs -f nurdscode-frontend
docker logs -f acheevy-orchestrator
docker logs -f boomer-angs
```

### Rebuild Specific Service
```bash
docker-compose -f docker-compose.dev.yml up --build frontend
docker-compose -f docker-compose.dev.yml up --build acheevy
```

### Access Container Shell
```bash
docker exec -it nurdscode-frontend sh
docker exec -it acheevy-orchestrator bash
docker exec -it nurdscode-postgres psql -U nurdscode -d nurdscode_db
```

---

## 📊 HEALTH CHECK ENDPOINTS

| Service | URL | Expected Response |
|---------|-----|-------------------|
| **Frontend** | `http://localhost:3000/api/health` | `{"status":"ok"}` |
| **ACHEEVY** | `http://localhost:8000/health` | `{"status":"healthy","service":"acheevy-orchestrator"}` |
| **Boomer_Angs** | `http://localhost:8001/health` | `{"status":"healthy","service":"boomer-angs"}` |
| **PostgreSQL** | `docker exec nurdscode-postgres pg_isready` | `accepting connections` |
| **Redis** | `docker exec nurdscode-redis redis-cli ping` | `PONG` |

---

## 🌐 PORT REFERENCE

| Port | Service | Purpose |
|------|---------|---------|
| **3000** | Next.js Frontend | Main UI |
| **8000** | ACHEEVY Orchestrator | AI orchestration API |
| **8001** | Boomer_Angs | Specialist agents API |
| **8002** | Testing Lab | Playwright E2E tests |
| **5432** | PostgreSQL | Primary database |
| **6379** | Redis | Cache + sessions |

---

## 🔐 SECURITY NOTES

1. **Never commit `.env.local`** - Already in .gitignore
2. **Rotate secrets regularly** - Recommended 90 days
3. **Use strong passwords** - Minimum 32 characters
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Review Cloudflare logs** - Check for suspicious activity

---

## 📞 TROUBLESHOOTING

**Port already in use:**
```bash
# Find process using port
lsof -i :3000
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

**Docker out of space:**
```bash
docker system prune -a --volumes
```

**npm install fails:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Backend won't start:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Recreate virtual environment
cd backend/acheevy-orchestrator
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

For more troubleshooting, see: `/docs/phase-1-merge/TROUBLESHOOTING.md`

---

## 🎯 NEXT STEPS

Once setup is complete:

1. ✅ Verify all services running (`npm run docker:logs`)
2. ✅ Run health checks (see Health Check Endpoints above)
3. ✅ Test authentication flow (Clerk + Supabase)
4. ✅ Create first Deploy workflow (Guide Me)
5. ✅ Review Phase 2 tasks (Auth & Multi-Tenancy)

---

**Setup Time:** ~5 minutes  
**Support:** See TROUBLESHOOTING.md for common issues  
**Last Updated:** November 10, 2025
