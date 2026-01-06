# AchieveMore Engineering Operations Manual
## Custom Instructions & Terminal Reference Guide v1.0

**Last Updated:** January 5, 2026  
**Distribution:** Engineering Team Only  
**Refresh Cycle:** Monthly (1st Wednesday)

---

## TABLE OF CONTENTS

1. Daily Operations Commands
2. Emergency Procedures
3. Code Generation Workflow (Vibe Coding)
4. Agent Testing & Debugging
5. Oracle Routing Decisions
6. Cost Optimization Checklist
7. Common Troubleshooting
8. Performance Profiling
9. Security & Compliance Checks
10. Team Communication Protocols

---

## 1. DAILY OPERATIONS COMMANDS

### 1.1 Morning Standup (8am Daily)

Run this every morning to understand system state:

```bash
#!/bin/bash
# /scripts/morning-standup.sh

echo "🌅 AchieveMore Morning Standup Report"
echo "======================================="
echo "Generated: $(date)"
echo ""

# 1. Check all services are up
echo "📊 Service Health:"
achievemore status

echo ""
echo "📈 Metrics (Last 24 hours):"
achievemore metrics

echo ""
echo "🔴 Recent Errors:"
achievemore logs all 50 | grep ERROR | head -20

echo ""
echo "💰 Cost Analysis:"
echo "Today's run cost: $(curl -s http://localhost:8081/metrics | grep 'model_cost_total' | awk '{print $2}')"
echo "Monthly projected: $(($(curl -s http://localhost:8081/metrics | grep 'model_cost_total' | awk '{print $2}') * 30))"

echo ""
echo "🚀 Deployment Status:"
git log --oneline -5

echo ""
echo "⚠️  Critical Alerts (if any):"
gcloud monitoring alerts list --filter="state=VIOLATION" --format="table(displayName, state)"

echo ""
echo "✅ Ready for the day!"
```

**Run it:**
```bash
chmod +x /scripts/morning-standup.sh
./scripts/morning-standup.sh > standup-$(date +%Y%m%d).log

# Share with team
cat standup-$(date +%Y%m%d).log | mail engineering@achievemore.com
```

### 1.2 Code Deployment Workflow

**Standard deployment procedure (every code push):**

```bash
# Step 1: Create feature branch
git checkout -b feature/resume-optimizer-v2

# Step 2: Make changes
vim /opt/achievemore/ii-agent/config/system_prompts.yaml
# (Edit resume optimizer prompt)

# Step 3: Test locally
cd /opt/achievemore/ii-agent
source venv/bin/activate
python -m pytest tests/test_resume_optimizer.py -v

# Step 4: Build & push
docker build -t achievemore/ii-agent:resume-optimizer-v2 .
docker tag achievemore/ii-agent:resume-optimizer-v2 gcr.io/$GCP_PROJECT_ID/ii-agent:resume-optimizer-v2
docker push gcr.io/$GCP_PROJECT_ID/ii-agent:resume-optimizer-v2

# Step 5: Deploy to staging first
gcloud run deploy ii-agent-staging \
    --image gcr.io/$GCP_PROJECT_ID/ii-agent:resume-optimizer-v2 \
    --region us-central1

# Step 6: Run integration tests
sleep 10  # Wait for deployment
curl -X POST https://ii-agent-staging-xxx.run.app/test/resume-optimizer \
    -H "Authorization: Bearer ${STAGING_API_KEY}" \
    -d '{"resume_url":"test.pdf","job_desc":"Senior Engineer"}'

# Step 7: Deploy to production (via CLI)
achievemore deploy production

# Step 8: Verify
achievemore status | grep ii-agent

# Step 9: Commit code
git add -A
git commit -m "Improve resume optimizer prompt for ATS compatibility"
git push origin feature/resume-optimizer-v2

# Step 10: Create pull request
# (GitHub/GitLab - link to deployment)
```

### 1.3 Emergency Incident Response

**Someone reports: "Resume optimizer is broken!"**

```bash
#!/bin/bash
# INCIDENT RESPONSE PLAN

# Step 1: Assess severity
echo "🚨 INCIDENT: Resume optimizer failures"
echo "Severity: $(curl http://localhost:8081/metrics | grep 'error_rate' | head -1)"

# Step 2: Check logs
achievemore logs ii-agent 100 | grep "resume" | tail -20

# Step 3: Identify issue
# Is it:
# - Code bug? (check recent commits)
# - Model failure? (check LLM quota)
# - Database? (check Postgres health)
# - Network? (check connectivity)

# Step 4: Quick fix options
# Option A: Rollback to previous version
gcloud run deploy ii-agent \
    --image gcr.io/$GCP_PROJECT_ID/ii-agent:previous-stable \
    --region us-central1

# Option B: Update config (if not code issue)
kubectl set env deployment/ii-agent \
    MODEL_OVERRIDE=gpt-3.5-turbo  # Fallback to cheaper model
    
# Option C: Scale down & up (refresh state)
achievemore scale 10  # Reduce load
sleep 30
achievemore scale 50  # Bring back to normal

# Step 5: Document
cat > /incidents/incident-$(date +%Y%m%d-%H%M%S).md << EOF
## Incident Report: Resume Optimizer Failure

**Time:** $(date)
**Severity:** P1 (Critical)
**Duration:** X minutes
**Root Cause:** [Your diagnosis]
**Fix Applied:** [What you did]
**Prevention:** [How to avoid next time]
EOF

# Step 6: Notify team
echo "🔔 Incident documented at /incidents/"
```

---

## 2. EMERGENCY PROCEDURES

### 2.1 Database Connection Lost

```bash
# Symptoms: All requests timeout, database unavailable

# Step 1: Check database status
sudo systemctl status postgresql
sudo -u postgres pg_isready

# Step 2: If Postgres crashed, restart it
sudo systemctl restart postgresql

# Step 3: Check connection pool
echo "SELECT count(*) FROM pg_stat_activity;" | sudo -u postgres psql

# Step 4: If connection pool exhausted, restart app
docker restart achievemore-ii-agent
achievemore scale 0 && sleep 5 && achievemore scale 50

# Step 5: Verify
curl http://localhost:8000/health
```

### 2.2 Temporal Server Down

```bash
# Symptoms: New workflows can't be created, but existing ones might continue

# Step 1: Check Temporal
curl http://localhost:8081/health

# Step 2: If down, restart
docker restart temporal

# Step 3: Wait for recovery
sleep 30

# Step 4: Verify it's responsive
curl -X POST http://localhost:8081/api/v1/namespaces

# Step 5: If still broken, use backup Temporal (multi-region)
# (This should be automatic, but manual fallback:)
export TEMPORAL_ENDPOINT="temporal-backup.region2.achievemore.com:7233"
# Restart workers
achievemore scale 0 && sleep 5 && achievemore scale 50
```

### 2.3 Out of Memory (OOM) Killer

```bash
# Symptoms: Worker pods dying, error: "OOMKilled"

# Step 1: Check memory usage
free -h
docker stats achievemore-ii-agent | head -20

# Step 2: Increase memory limit
gcloud run deploy ii-agent \
    --memory 4Gi \  # Increase from 2Gi to 4Gi
    --region us-central1

# Step 3: Or reduce concurrent workers
achievemore scale 25  # Reduce load

# Step 4: Investigate what's using memory
docker exec achievemore-ii-agent top -b -n 1 | head -20

# Step 5: File bug if process is leaking memory
# (Add to: /bugs/memory-leak-investigation.md)
```

### 2.4 API Rate Limit Hit

```bash
# Symptoms: Getting 429 Too Many Requests

# Step 1: Check which API is rate-limited
curl -v https://api.openai.com/v1/models 2>&1 | grep "x-ratelimit"

# Step 2: If OpenAI: request quota increase
# Go to: https://platform.openai.com/account/billing/limits

# Step 3: Temporary fallback: use cheaper model
achievemore oracle "optimize" resume-optimizer  # Should auto-route to fallback

# Step 4: Monitor usage
gcloud monitoring dashboards list
# Create alert if approaching limits

# Step 5: Implement caching to reduce calls (if not already done)
# Check /backend/cache/ directory
```

---

## 3. CODE GENERATION WORKFLOW (VIBE CODING)

### 3.1 The Vibe Coding Mindset

**Vibe Coding** = Using AI to generate code, but with structure and governance.

**NOT:** Ask ChatGPT to build an app, take output, ship it  
**YES:** Use Cursor/Claude with clear architecture, test, validate, deploy

### 3.2 Typical Vibe Coding Session

```bash
# Open Cursor IDE
cursor /opt/achievemore

# Or use terminal with gpt-cli (if installed)
gpt "Generate a Python function that validates resume PDF format" \
    --instructions "Use pypdf2 library, return {valid: bool, errors: list}"
```

**Better approach: Use Cursor's Composer + Codebase Context**

1. Open Cursor → Click "Composer" (CMD+I on Mac, CTRL+I on Linux)
2. Type your request with context:

```
I need to add a new agent capability to ii-agent for analyzing contract templates.

CONTEXT:
- Look at: /ii-agent/agents/
- Follow pattern from: /ii-agent/agents/resume_optimizer.py
- Use: ii-agent.Activity decorator
- Return: structured JSON with fields: {contract_type, risk_level, recommendations}

REQUIREMENTS:
- Max latency: 2 seconds
- Must handle PDF + DOCX + TXT files
- Fallback model if primary fails
- Log all invocations to audit trail

Generate the complete implementation.
```

3. Cursor reads your codebase and generates code specific to YOUR patterns
4. Review, modify if needed, merge

### 3.3 Validation Checklist for AI-Generated Code

Before merging any code generated by AI:

```bash
#!/bin/bash
# /scripts/validate-ai-code.sh

echo "✅ AI-Generated Code Validation"
echo "================================"

# Step 1: Type checking
echo "Step 1: Type checking..."
mypy /opt/achievemore/ii-agent --strict
if [ $? -ne 0 ]; then
    echo "❌ Type errors found. Fix them."
    exit 1
fi

# Step 2: Linting
echo "Step 2: Linting..."
flake8 /opt/achievemore/ii-agent --max-line-length=100
pylint /opt/achievemore/ii-agent --fail-under=8.0

# Step 3: Security scanning
echo "Step 3: Security scan..."
bandit /opt/achievemore/ii-agent -r -ll  # Only show HIGH severity

# Step 4: Unit tests
echo "Step 4: Running tests..."
pytest /opt/achievemore/ii-agent/tests -v --cov

# Step 5: Manual code review (YOU must do this)
echo "Step 5: Manual review checklist:"
echo "  [ ] Does this follow existing patterns?"
echo "  [ ] Are error cases handled?"
echo "  [ ] Is there logging?"
echo "  [ ] Are secrets NOT hardcoded?"
echo "  [ ] Will this scale to 1M users?"

# Step 6: Integration test
echo "Step 6: Integration test..."
docker build -t achievemore/test:latest .
docker run --rm achievemore/test:latest pytest tests/integration/

echo "✅ All validations passed!"
```

---

## 4. AGENT TESTING & DEBUGGING

### 4.1 Test an Agent Locally

```bash
# Navigate to agent directory
cd /opt/achievemore/ii-agent
source venv/bin/activate

# Create test script
cat > test_resume_optimizer.py << 'EOF'
import asyncio
from ii_agent import IIAgent

async def test_resume_optimizer():
    agent = IIAgent(
        type="resume_optimizer",
        system_prompt="You are a resume optimization expert"
    )
    
    response = await agent.run(
        user_request="Optimize this resume for ATS",
        context={"resume_content": "John Doe..."},
        timeout=30
    )
    
    print(f"Response: {response}")
    assert response.success, "Agent failed"
    assert "improvements" in response.data, "Missing improvements"
    
    print("✅ Test passed!")

if __name__ == "__main__":
    asyncio.run(test_resume_optimizer())
EOF

# Run test
python test_resume_optimizer.py

# If it fails:
# Add debugging
cat > test_resume_optimizer_debug.py << 'EOF'
import asyncio
import logging
from ii_agent import IIAgent

logging.basicConfig(level=logging.DEBUG)

async def test():
    # Same as above, but logs will show what's happening
    ...

asyncio.run(test())
EOF
```

### 4.2 Debug a Live Agent

```bash
# 1. Check agent logs
achievemore logs ii-agent 100 | grep "resume-optimizer" | tail -20

# 2. Check which model was chosen
achievemore logs ii-agent 100 | grep "oracle_decision" | tail -5

# 3. Check LLM response time
achievemore logs ii-agent 100 | grep "model_latency" | tail -10

# 4. Check for errors
achievemore logs ii-agent 100 | grep "ERROR\|EXCEPTION" | tail -20

# 5. Trace a specific workflow
WORKFLOW_ID="wf_abc123"
curl http://localhost:8081/api/v1/workflows/$WORKFLOW_ID \
    -H "Content-Type: application/json" | jq .

# 6. See what activities executed
curl http://localhost:8081/api/v1/workflows/$WORKFLOW_ID/history \
    -H "Content-Type: application/json" | jq '.events[] | {type, id}'

# 7. Check activity retry history
curl http://localhost:8081/api/v1/workflows/$WORKFLOW_ID \
    | jq '.activities[] | {name, attempts, lastError}'
```

### 4.3 Load Test an Agent

```bash
#!/bin/bash
# Simulate 1000 concurrent resume optimization requests

# Use 'ab' (Apache Bench) or 'wrk' (more sophisticated)
# Install: brew install wrk

wrk -t4 -c1000 -d30s \
    -s script.lua \
    http://localhost:8000/api/resume/optimize

# Create script.lua for realistic payloads
cat > script.lua << 'EOF'
request = function()
    body = '{"resume_url": "http://example.com/resume.pdf", "job_desc": "Senior Engineer"}'
    wrk.method = "POST"
    wrk.body = body
    wrk.headers["Content-Type"] = "application/json"
    wrk.headers["Authorization"] = "Bearer test-token"
    return wrk.format(nil, "/api/resume/optimize")
end
EOF

# Results show:
# - Requests/sec
# - Latency (average, p50, p99)
# - Errors
# - If p99 > 5s or errors > 1%, you have a performance issue
```

---

## 5. ORACLE ROUTING DECISIONS

### 5.1 How Oracle Makes Decisions

**Flowchart:**

```
User: "Optimize my resume for the Google job"
           ↓
Oracle Phase 1: Classify Intent
├─ Keywords: "optimize" → Intent = "optimize"
├─ Complexity: Token count + task type → "moderate"
└─ Cache key: "optimize:resume_optimizer:pro" → Check Redis
           ↓
Oracle Phase 2: Template Assembly
├─ Load: /oracle/prompts/resume_optimizer/system.md
├─ Load: /oracle/examples/resume_optimizer/optimize/
└─ Build final prompt
           ↓
Oracle Phase 3: Cost Optimization
├─ gpt-3.5-turbo: success_rate=91%, cost=$0.001
├─ gemini-3-pro: success_rate=94%, cost=$0.005
├─ gpt-4-turbo: success_rate=98%, cost=$0.01
├─ Decision: threshold=90% for moderate task
└─ Choice: gemini-3-pro (best value)
           ↓
Oracle Phase 4: Execution
├─ Call Gemini 3 Pro with full prompt
└─ Return response
           ↓
Oracle Phase 5: Result Caching
├─ Cache in Redis: 7-day TTL
├─ Log to database
└─ Update success metrics
```

### 5.2 View & Modify Oracle Decisions

```bash
# View current routing for an app
cat /oracle/routing/resume_optimizer.json | jq .

# Structure:
{
  "intents": {
    "optimize": {
      "simple": "gpt-3.5-turbo",
      "moderate": "gemini-3-pro",
      "complex": "gpt-4-turbo"
    },
    "analyze": {
      "simple": "gemini-3-flash",
      "moderate": "gpt-4-turbo",
      "complex": "claude-4"
    }
  },
  "model_config": {
    "gpt-3.5-turbo": {"temp": 0.3, "tokens": 500, "cost": 0.001},
    "gpt-4-turbo": {"temp": 0.5, "tokens": 1000, "cost": 0.01}
  }
}

# Test Oracle decision
achievemore oracle "improve my resume" resume-optimizer

# Output:
{
  "model": "gemini-3-pro",
  "temperature": 0.4,
  "max_tokens": 800,
  "estimated_cost": 0.0045,
  "success_rate": 0.94,
  "from_cache": false
}

# Manually override (for testing)
export ORACLE_MODEL_OVERRIDE=gpt-4-turbo
# Now all routes will use GPT-4 (for debugging)
unset ORACLE_MODEL_OVERRIDE  # Reset

# Update routing rules (after thorough testing!)
cat > /oracle/routing/resume_optimizer.json << 'EOF'
{
  "intents": {
    "optimize": {
      "simple": "gpt-3.5-turbo",
      "moderate": "gemini-3-pro",  # Changed from gpt-4
      "complex": "gpt-4-turbo"
    }
  }
}
EOF

# Verify change took effect
curl -X POST http://localhost:8000/oracle/reload  # Force cache refresh
```

### 5.3 Monitor Oracle Performance

```bash
#!/bin/bash
# Oracle Performance Dashboard

echo "🔮 Oracle Decision Analytics (Last 24 hours)"
echo "=============================================="

# Query database for Oracle metrics
sudo -u postgres psql -d achievemore_db << EOF

-- Most used models
SELECT model, COUNT(*) as usage_count 
FROM oracle_decisions 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY model 
ORDER BY usage_count DESC;

-- Average cost by model
SELECT model, ROUND(AVG(estimated_cost)::numeric, 4) as avg_cost
FROM oracle_decisions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY model;

-- Success rate by model & intent
SELECT intent, model, 
    ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as success_rate,
    COUNT(*) as sample_size
FROM oracle_decisions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY intent, model
ORDER BY intent, success_rate DESC;

-- Cache hit rate
SELECT 
    COUNT(*) FILTER (WHERE from_cache) as cache_hits,
    COUNT(*) FILTER (WHERE NOT from_cache) as cache_misses,
    ROUND((COUNT(*) FILTER (WHERE from_cache)::numeric / COUNT(*)) * 100, 1) as cache_hit_rate
FROM oracle_decisions
WHERE created_at > NOW() - INTERVAL '24 hours';

EOF
```

---

## 6. COST OPTIMIZATION CHECKLIST

### 6.1 Daily Cost Review

```bash
#!/bin/bash
# Run every evening to understand daily costs

echo "💰 Daily Cost Report - $(date +%Y-%m-%d)"
echo "======================================"

# Total LLM cost
LLM_COST=$(sudo -u postgres psql -d achievemore_db -t -c \
    "SELECT ROUND(SUM(cost)::numeric, 2) FROM model_invocations WHERE created_at > NOW() - INTERVAL '1 day';")

echo "LLM costs today: \$$LLM_COST"
echo "Monthly projection: \$$(echo "$LLM_COST * 30" | bc)"

# Breakdown by model
echo ""
echo "Cost breakdown by model:"
sudo -u postgres psql -d achievemore_db << 'EOF'
SELECT model, ROUND(SUM(cost)::numeric, 2) as daily_cost
FROM model_invocations
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY model
ORDER BY daily_cost DESC;
EOF

# Cost per app
echo ""
echo "Cost by application:"
sudo -u postgres psql -d achievemore_db << 'EOF'
SELECT app_id, ROUND(SUM(cost)::numeric, 2) as daily_cost
FROM workflows
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY app_id
ORDER BY daily_cost DESC;
EOF

# Cache hit rate (higher = better, saves money)
CACHE_HIT_RATE=$(sudo -u postgres psql -d achievemore_db -t -c \
    "SELECT ROUND((COUNT(*) FILTER (WHERE from_cache)::numeric / COUNT(*)) * 100, 1) FROM oracle_decisions WHERE created_at > NOW() - INTERVAL '1 day';")

echo ""
echo "Cache hit rate: ${CACHE_HIT_RATE}%"
if (( $(echo "$CACHE_HIT_RATE < 25" | bc -l) )); then
    echo "⚠️  Low cache hit rate! Consider optimizing cache strategy."
fi

# Most expensive request (outlier detection)
echo ""
echo "Most expensive requests:"
sudo -u postgres psql -d achievemore_db << 'EOF'
SELECT workflow_id, app_id, cost, model_used, created_at
FROM workflows
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY cost DESC
LIMIT 5;
EOF
```

### 6.2 Weekly Cost Optimization Review

```bash
# 1. Analyze models used
# If gpt-4-turbo is being used for simple tasks, change routing
achievemore oracle "extract text" resume-optimizer
# If it returns gpt-4, that's inefficient - should be gpt-3.5

# 2. Check cache stats
curl http://localhost:6379/info | grep "hits\|misses"
# Aim for >30% hit rate

# 3. Review expensive workflows
achievemore logs all 1000 | grep "cost" | sort -t: -k2 -rn | head -20

# 4. If cost is rising, check:
# - Are there new apps causing increases?
# - Did model prices change?
# - Are users making more requests?

# 5. Cost reduction actions:
# Option A: Adjust temperature (0.3 = more predictable, faster)
# Option B: Reduce token limits (max_tokens: 1000 → 500)
# Option C: Increase cache TTL (7 days → 14 days)
# Option D: Route more requests to cheaper models
# Option E: Batch similar requests together

# 6. Track cost per revenue dollar
# Your metric: cost should be <10% of revenue
# If spending $283K on $2.8M revenue, you're at 10% (good)
# If spending $283K on $1M revenue, you're at 28% (bad, need to optimize)
```

---

## 7. COMMON TROUBLESHOOTING

### 7.1 "Workflow stuck/hanging"

```bash
# Symptom: Request submitted 10 minutes ago, still "running"

# Check workflow status
WORKFLOW_ID="wf_abc123"
curl http://localhost:8081/api/v1/workflows/$WORKFLOW_ID | jq .

# If stuck, check last activity
curl http://localhost:8081/api/v1/workflows/$WORKFLOW_ID/history | jq '.events[-1]'

# Possible causes:
# 1. Activity timeout (default 5 min) - increase timeout
# 2. Worker crashed - check logs
# 3. Deadlock in database - check Postgres locks
# 4. External API hanging - check network

# Fix:
# Option A: Cancel & retry
curl -X POST http://localhost:8081/api/v1/workflows/$WORKFLOW_ID/terminate \
    -H "Content-Type: application/json" \
    -d '{"reason": "Manual termination for debugging"}'

# Option B: Increase timeout
# Edit workflow definition, set start_to_close_timeout = 600 seconds

# Option C: Restart workers
achievemore scale 0 && sleep 5 && achievemore scale 50
```

### 7.2 "Workers constantly crashing"

```bash
# Check worker logs
docker logs achievemore-ii-agent | tail -100

# Common causes:
# 1. Out of memory - increase memory limit
# 2. Segfault in Python - check for C extension issues
# 3. Uncaught exception - add better error handling

# Diagnosis:
# Check memory
docker stats achievemore-ii-agent

# Check CPU
top | grep achievemore

# Check for segfaults
dmesg | tail -50

# Solution:
# Temporarily reduce workers to prevent cascading failures
achievemore scale 10

# Investigate & fix
# Then scale back up
achievemore scale 50
```

### 7.3 "Unexpected high latency"

```bash
# Symptom: p99 latency jumped from 2s to 8s

# Step 1: Check system resources
free -h        # Memory
df -h          # Disk
top            # CPU

# Step 2: Check database performance
sudo -u postgres psql -d achievemore_db << 'EOF'
-- Slow queries
SELECT query, calls, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Current locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Connection count
SELECT count(*) FROM pg_stat_activity;
EOF

# Step 3: Check network
# Is there packet loss? Check from worker container:
docker exec achievemore-ii-agent ping -c 10 8.8.8.8

# Step 4: Check model providers
# Are OpenAI/Google/Anthropic APIs slow?
# Check their status pages

# Step 5: Profile a single request
# Add detailed timing logging
curl -v -H "X-Debug: true" \
    http://localhost:8000/api/resume/optimize \
    -d '...' | tee request.log

# Step 6: Fix
# If database: add index
# If memory: reduce cache size
# If network: use local fallback model
# If model: switch to faster provider
```

---

## 8. PERFORMANCE PROFILING

### 8.1 Profile a Workflow

```python
# /backend/profiling/profile_resume_optimizer.py

import cProfile
import pstats
from io import StringIO
from ii_agent import IIAgent

def profile_resume_optimizer():
    agent = IIAgent(type="resume_optimizer")
    
    # What to profile
    def work():
        response = agent.run(
            user_request="Optimize my resume",
            context={"resume_content": "..."},
            timeout=30
        )
        return response
    
    # Run profiler
    profiler = cProfile.Profile()
    profiler.enable()
    
    result = work()
    
    profiler.disable()
    
    # Print results
    s = StringIO()
    ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
    ps.print_stats(20)  # Top 20 functions
    
    print(s.getvalue())
    
    # Analyze:
    # - Which function takes longest?
    # - Is it your code or library code?
    # - Can it be optimized?

if __name__ == "__main__":
    profile_resume_optimizer()
```

Run it:

```bash
cd /opt/achievemore
python /backend/profiling/profile_resume_optimizer.py > profile-$(date +%s).txt
cat profile-$(date +%s).txt | head -30
```

### 8.2 Memory Profiling

```python
# /backend/profiling/memory_profile.py

from memory_profiler import profile
from ii_agent import IIAgent

@profile
def process_resume():
    agent = IIAgent(type="resume_optimizer")
    
    for i in range(100):  # Process 100 resumes
        response = agent.run(
            user_request="Optimize resume",
            context={"resume": f"resume_{i}.pdf"}
        )
        # Does memory grow? If yes, memory leak!
    
    return response

if __name__ == "__main__":
    process_resume()
```

Install & run:

```bash
pip install memory_profiler
python -m memory_profiler /backend/profiling/memory_profile.py
```

Output shows line-by-line memory usage. If it grows over time, you have a leak.

---

## 9. SECURITY & COMPLIANCE CHECKS

### 9.1 Daily Security Checklist

```bash
#!/bin/bash
# /scripts/security-check.sh

echo "🔐 Security Check - $(date)"
echo "============================"

# 1. Check for hardcoded secrets
echo "1. Scanning for hardcoded secrets..."
git log -p -S "api_key\|password\|secret" --all --oneline | head -20
# If any found, you have a breach!

# 2. Check dependencies for vulnerabilities
echo "2. Checking dependencies..."
cd /opt/achievemore/ii-agent
pip install safety
safety check  # Shows vulnerable packages

# 3. Check IAM permissions
echo "3. Checking IAM..."
gcloud projects get-iam-policy $GCP_PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" | sort | uniq -c
# Should not see "roles/editor" or "roles/owner" (too permissive)

# 4. Verify SSL certificates
echo "4. Checking SSL certificates..."
echo | openssl s_client -servername api.achievemore.com -connect api.achievemore.com:443 2>/dev/null | grep -A 5 "Certificate:"

# 5. Check data encryption
echo "5. Verifying encryption..."
# Postgres?
sudo -u postgres psql -d achievemore_db -c "SHOW ssl;"  # Should be 'on'

# Redis?
redis-cli INFO security | grep requirepass  # Should be set

# 6. Check audit logs
echo "6. Recent audit activity..."
sudo -u postgres psql -d achievemore_db << 'EOF'
SELECT user_id, action, timestamp FROM audit_log
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC LIMIT 20;
EOF

# 7. Check for unusual access
echo "7. Checking for anomalies..."
gcloud logging read \
    "severity=ERROR AND resource.type=cloud_run_revision" \
    --limit=20 \
    --format=json | jq '.[] | {severity, message}'
```

### 9.2 PII Data Handling

```bash
# Check if any PII is being logged (it shouldn't be)

# Resume content = PII (don't log!)
achievemore logs ii-agent 1000 | grep -i "john doe\|john@example\|123-45-6789"
# If any results, that's a violation!

# What SHOULD be logged:
# ✓ Workflow ID, status, duration
# ✓ Model used, tokens, cost
# ✓ Error messages (generic)

# What SHOULD NOT be logged:
# ✗ User name, email, address
# ✗ Document content
# ✗ Detailed resume text
# ✗ API responses (if they contain PII)

# Verify compliance:
cat /opt/achievemore/ii-agent/config/logging.yaml | grep "exclude\|mask"
```

---

## 10. TEAM COMMUNICATION PROTOCOLS

### 10.1 Daily Standup Report

Send this to #engineering-standup Slack channel every morning:

```markdown
## AchieveMore Daily Standup
**Date:** January 5, 2026

### System Status
- ✅ All services operational
- Uptime: 99.97% (24h)
- Requests processed: 9.8M
- Success rate: 99.3%

### Costs (Last 24h)
- LLM: $847.23
- Compute: $205.40
- Total: $1,052.63
- Monthly projection: $31.6K

### Incidents
- None critical
- 2 auto-healed errors (retried successfully)

### Deployments
- Resume Optimizer: v2.1 → v2.2 (5min deployment)
- No rollbacks

### Priority Tasks for Today
1. [ ] Code review: PR #142 (Oracle routing optimization)
2. [ ] Performance test: New legal analyzer agent
3. [ ] Database maintenance window (2pm UTC)

### On-Call Handoff
- Current: Alice (alice@achievemore.com)
- Tomorrow: Bob (bob@achievemore.com)

### Blockers
- None
```

### 10.2 Incident Communication

When something breaks:

```markdown
## 🚨 INCIDENT: Resume Optimizer - High Latency

**Time Detected:** 2026-01-05 14:32 UTC
**Duration:** 8 minutes
**Impact:** 12K users affected
**Status:** RESOLVED ✅

### What Happened
- Load spike (300 req/sec, normal 115)
- Worker pool auto-scaled but took 2 minutes
- Users saw 15s+ latency during this window

### Root Cause
- SomeCompany.com shared resume optimizer on Twitter
- Unexpected traffic spike

### Fix Applied
- Scaled workers from 50 → 100 manually
- Latency returned to normal in 2 minutes
- Auto-scaling now configured for higher thresholds

### Prevention
- Set alerts for traffic spikes >2x normal
- Implement gradual auto-scaling (1 worker/sec) instead of sudden jumps
- Consider rate limiting for free tier

### Timeline
- 14:32: Alert triggered (latency > 5s)
- 14:34: Team engaged
- 14:36: Cause identified (traffic spike)
- 14:38: Workers scaled up
- 14:40: Service recovered
```

---

## QUICK REFERENCE CARDS

### API Endpoints (all require Bearer token)

```bash
# Health
GET /health → {status: "healthy"}

# Resume Optimizer
POST /api/resume/optimize
{
  "resume_url": "https://...",
  "job_description": "...",
  "user_id": "user_123"
}
→ {workflow_id: "wf_abc"}

# Check workflow status
GET /workflow/{workflow_id}
→ {status: "completed", result: {...}}

# List user's workflows
GET /user/{user_id}/workflows
→ [{workflow_id, created_at, status, ...}]

# Oracle decision
POST /oracle/decide
{
  "request": "optimize my resume",
  "app_id": "resume-optimizer",
  "user_context": {}
}
→ {model: "gpt-4", temperature: 0.5, ...}
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
GCP_PROJECT_ID=your-project

# Database
POSTGRES_HOST=localhost
POSTGRES_USER=achievemore_user
POSTGRES_PASSWORD=...
POSTGRES_DB=achievemore_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Temporal
TEMPORAL_HOST=localhost
TEMPORAL_PORT=7233

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Optional
SENTRY_DSN=...  # Error tracking
DATADOG_API_KEY=...  # Monitoring
```

### File Locations

```bash
# Source code
/opt/achievemore/ii-agent/
/opt/achievemore/CommonGround/
/opt/achievemore/ii-researcher/

# Configuration
/oracle/routing/                   # Routing rules
/oracle/prompts/                   # System prompts
/oracle/examples/                  # Few-shot examples

# Logs
/var/log/achievemore/             # Application logs
/var/log/postgresql/              # Database logs

# Data
/data/backups/                     # Database backups
/tmp/achievemore/                  # Temporary files
gs://bucket-name/                  # Cloud storage
```

---

**Last Updated:** January 5, 2026  
**Next Review:** February 5, 2026  
**Contact:** engineering-lead@achievemore.com

**Version History:**
- v1.0 (Jan 5, 2026): Initial creation
- v1.1 (Jan 12, 2026): Added more troubleshooting steps [planned]
- v2.0 (Feb 5, 2026): Updated for 1M+ users scale [planned]
