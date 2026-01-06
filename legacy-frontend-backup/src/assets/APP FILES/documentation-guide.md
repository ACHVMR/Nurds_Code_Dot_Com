# AchieveMore Documentation Ecosystem
## How to Use This Complete Guidance System

**Document Date:** January 5, 2026  
**For:** Engineering, DevOps, and Platform Teams  
**Status:** Production Ready

---

## OVERVIEW

You now have **THREE COMPREHENSIVE DOCUMENTS** that work together as an integrated system:

### Document 1: Platform DevOps Guide (80 pages)
**File:** `platform-devops-guide.md`

**Purpose:** Understanding the complete architecture and how to design systems for 1M+ concurrent users

**Contains:**
- Central Development Machine (CDM) architecture
- The Oracle Framework for intelligent code generation
- Request processing pipeline
- Multi-region sharding
- Temporal workflow orchestration
- Cost modeling
- Security & isolation strategies
- Disaster recovery planning

**Who Should Read:** 
- Architecture leads
- Senior engineers designing new systems
- DevOps engineers planning infrastructure
- Anyone new to the platform

**When to Use:**
- During design phase of new features
- Planning infrastructure scaling
- Understanding why we built things a certain way
- Training new team members

**Time to Read:** 90 minutes (skim) / 4 hours (deep dive)

---

### Document 2: Terminal Operations Manual (40 pages)
**File:** `terminal-ops-manual.md`

**Purpose:** Day-to-day operational commands and emergency procedures

**Contains:**
- Daily standup script
- Code deployment workflow
- Emergency incident response procedures
- Agent testing & debugging commands
- Oracle routing decision visualization
- Cost optimization tracking
- Troubleshooting guides
- Performance profiling
- Security compliance checks

**Who Should Read:**
- On-call engineers (CRITICAL)
- DevOps team members
- Incident responders
- QA/Testing team

**When to Use:**
- Every single day (morning standup)
- When something breaks (emergency procedures)
- When deploying code (deployment workflow)
- When optimizing costs (cost checklist)

**Time to Read:** 40 minutes (once) / 5 minutes (quick reference)

---

### Document 3: Intelligent Internet Ecosystem Guide (Original)
**File:** Previous document in thread

**Purpose:** Deep dive into the II ecosystem components (ii-agent, CommonGround, ii-researcher, etc.)

**Contains:**
- Component specifications
- Setup instructions per role
- UI customization
- Integration architecture
- Monetization framework

**Who Should Read:**
- All engineers (foundation knowledge)
- Product leads
- Customer success team

**When to Use:**
- First week onboarding
- Understanding component capabilities
- Planning new features using existing components

**Time to Read:** 2 hours (deep dive)

---

## HOW TO USE THIS SYSTEM

### Week 1: Onboarding Path

```
DAY 1: Read the Big Picture
├─ Read: Platform DevOps Guide → Section 1 (Architecture Overview)
├─ Time: 30 minutes
└─ Goal: Understand why we built things this way

DAY 2: Understand the Components  
├─ Read: Original II Ecosystem Guide → Sections 1-3
├─ Time: 1 hour
└─ Goal: Know what ii-agent, CommonGround, Oracle do

DAY 3: Learn Daily Operations
├─ Read: Terminal Operations Manual → Sections 1-3
├─ Time: 1 hour
└─ Goal: Know how to deploy, monitor, handle incidents

DAY 4: Deep Dive on Oracle Framework
├─ Read: Platform DevOps Guide → Section 3
├─ Read: Terminal Operations Manual → Section 5
├─ Time: 1.5 hours
└─ Goal: Understand routing decisions and cost optimization

DAY 5: Hands-On Practice
├─ Follow: Terminal Operations Manual → Section 1.2 (Code Deployment)
├─ Run: terminal-ops-manual.sh (morning-standup)
├─ Time: 2 hours
└─ Goal: Deploy something to staging, practice operations
```

**After Week 1 Checklist:**
- [ ] Can describe the CDM architecture to a colleague
- [ ] Understand the request processing pipeline
- [ ] Can run the morning standup script
- [ ] Know where to find emergency procedures
- [ ] Know how to deploy code safely

---

### Ongoing: Daily Usage Patterns

**Every Morning (5 minutes):**
```bash
/scripts/morning-standup.sh
# Review: uptime, errors, costs, deployments
# Share results with team
```

**When Deploying Code (15 minutes):**
```
Reference: Terminal Operations Manual → Section 1.2
└─ Follow the exact steps (they're battle-tested)
```

**When Something Breaks (urgent):**
```
1. Determine severity
2. Look up symptom in: Terminal Operations Manual → Section 2 (Emergency)
3. Follow steps exactly
4. Document in incident report
```

**Weekly Cost Review (15 minutes):**
```
Reference: Terminal Operations Manual → Section 6
└─ Run the cost analysis script
└─ Share findings with team
```

**When Planning New Features (1-2 hours):**
```
1. Read: Platform DevOps Guide → Section relevant to change
2. Understand: How this impacts architecture
3. Model: Cost, latency, scaling implications
4. Design: Following established patterns
```

**Monthly/Quarterly Planning (4-8 hours):**
```
1. Re-read: Platform DevOps Guide → Sections 6-11 (Scaling, HA, DR)
2. Assess: Current bottlenecks
3. Plan: Infrastructure upgrades needed
4. Design: Solutions following Oracle Framework principles
```

---

## QUICK LOOKUP REFERENCE

### "How do I...?"

| Task | Location | Time |
|------|----------|------|
| Deploy code to production | Terminal Manual § 1.2 | 15 min |
| Respond to incident | Terminal Manual § 2 | 5-60 min |
| Scale system up | Terminal Manual § 1.3 | 5 min |
| Optimize costs | Terminal Manual § 6 | 15 min |
| Debug a workflow | Terminal Manual § 4 | 10-30 min |
| Understand Oracle decisions | Terminal Manual § 5 | 10 min |
| Profile performance issue | Terminal Manual § 8 | 20 min |
| Handle database issue | Terminal Manual § 2.1 | 5-30 min |
| Review security | Terminal Manual § 9 | 15 min |
| Design new architecture | Platform DevOps § 2-3 | 1-2 hours |
| Plan for 10M users | Platform DevOps § 6-7 | 2-4 hours |
| Implement multi-region | Platform DevOps § 6 | 3-5 hours |
| Set up disaster recovery | Platform DevOps § 11 | 2-3 hours |
| Understand cost model | Platform DevOps § 8 | 1 hour |
| Add new agent type | II Ecosystem § 3.1 | 1-2 days |
| Create new Spoke app | II Ecosystem § 5 | 1-3 days |

---

## DECISION TREE: WHICH DOCUMENT?

```
START: "I need to understand/do something"
│
├─ Is it urgent/operational? (happens daily)
│  └─ YES → Terminal Operations Manual
│     ├─ Something broken? → Section 2 (Emergency)
│     ├─ Deploying code? → Section 1.2
│     ├─ Cost optimization? → Section 6
│     ├─ Agent testing? → Section 4
│     ├─ Performance issue? → Section 8
│     └─ Security concern? → Section 9
│
├─ Is it about how things work? (understanding)
│  ├─ How does the system handle requests?
│  │  └─ Platform DevOps § 1-5
│  │
│  ├─ What are the components?
│  │  └─ II Ecosystem § 1-3
│  │
│  ├─ How does Oracle routing work?
│  │  └─ Platform DevOps § 3
│  │
│  └─ How does caching/scaling/DR work?
│     └─ Platform DevOps § 6-11
│
└─ Is it about implementing/designing? (building)
   ├─ Building new Spoke app?
   │  └─ II Ecosystem § 5 + Terminal Manual § 1.2
   │
   ├─ Adding new agent type?
   │  └─ II Ecosystem § 3.1 + Terminal Manual § 4
   │
   ├─ Scaling infrastructure?
   │  └─ Platform DevOps § 6-8
   │
   └─ Implementing disaster recovery?
      └─ Platform DevOps § 11
```

---

## INFORMATION ARCHITECTURE

### How the documents connect:

```
┌─────────────────────────────────────────────────────────────┐
│ NEW TEAM MEMBER                                              │
│ ├─ Week 1: Read this file + Platform DevOps § 1             │
│ ├─ Week 2: Read II Ecosystem § 1-3                          │
│ ├─ Week 3: Read Terminal Manual + practice                  │
│ └─ Week 4: Hands-on deployment/operations                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ON-CALL ENGINEER (Responding to incidents)                  │
│ ├─ Check: Terminal Manual § 2 (Emergency)                   │
│ ├─ Execute: Steps exactly as written                        │
│ ├─ Unclear: Jump to Platform DevOps § 1-5 for context      │
│ └─ Document: Incident with lessons learned                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ARCHITECT (Designing new systems)                           │
│ ├─ Phase 1: Read Platform DevOps § 2-3 (understand Oracle) │
│ ├─ Phase 2: Read Platform DevOps § 6-8 (cost/scaling)      │
│ ├─ Phase 3: Read Platform DevOps § 9-11 (security/HA)      │
│ ├─ Phase 4: Design document (reference all sections)        │
│ └─ Phase 5: Implement using Terminal Manual § 1.2           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRODUCT MANAGER (Understanding capabilities)                │
│ ├─ Read: This file + II Ecosystem § 1-3                     │
│ ├─ Understand: What each component does                     │
│ ├─ Reference: Platform DevOps § 8 (cost model)              │
│ └─ Use: To plan feature prioritization                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DEVOPS ENGINEER (Managing infrastructure)                   │
│ ├─ Foundation: Read Platform DevOps § 1-2                   │
│ ├─ Daily: Use Terminal Manual § 1-3                         │
│ ├─ Planning: Platform DevOps § 6-11                         │
│ └─ Cost: Terminal Manual § 6 + Platform DevOps § 8          │
└─────────────────────────────────────────────────────────────┘
```

---

## KEEPING THESE DOCS UPDATED

### Document Maintenance Schedule

**Weekly (Every Monday):**
- Review: Terminal Manual § 1.1 (standup script)
- Update: If any commands changed
- Check: Are all service ports still correct?

**Monthly (1st Wednesday):**
- Review: All sections for accuracy
- Update: Metrics/numbers with latest data
- Add: New procedures discovered
- Remove: Deprecated commands

**Quarterly (Every 3 months):**
- Major review of all documents
- Update: Architecture if changed
- Refresh: Code examples
- Redistribute: To team

**When Something Significant Changes:**
- If new component added: Update Platform DevOps § 2
- If new emergency discovered: Update Terminal Manual § 2
- If cost model changes: Update both § 8
- If we change to new region: Update Platform DevOps § 6

### How to Contribute Updates

```bash
# 1. Edit the document
vim platform-devops-guide.md

# 2. Add version note
# Change "Document Version: 2.0" to "2.1"
# Add note: "## Changes in v2.1"
# - Added section on multi-cloud deployment
# - Updated cost estimates (Jan 2026)
# - Clarified Temporal terminology

# 3. Get review
git checkout -b docs/update-platform-guide-v2.1
git add platform-devops-guide.md
git commit -m "docs: update platform guide with Jan 2026 metrics"
git push origin docs/update-platform-guide-v2.1

# 4. Create PR, get 2 approvals, merge
# (Same process as code changes)

# 5. Distribute to team
echo "Updated documentation at: docs/platform-devops-guide.md" \
  | mail engineering@achievemore.com

# 6. Update this file's "Last Updated" date
```

---

## COMMON SCENARIOS & HOW TO FIND ANSWERS

### Scenario 1: "New engineer joining the team"

**What they need to know (in order):**

1. Read this file (How to use the docs)
2. Read Platform DevOps § 1 (Why we built it this way)
3. Read II Ecosystem § 1-3 (What the components are)
4. Read Terminal Manual § 1-2 (How to operate daily)
5. Hands-on: Run morning standup script
6. Hands-on: Deploy a test Spoke to staging (Terminal Manual § 1.2)

**Total time:** 8 hours (spread over 1 week)

### Scenario 2: "Everything is down, we're losing money"

**What to do:**

1. **IMMEDIATELY:** Follow Terminal Manual § 2.1-2.4 (Emergency Procedures)
2. Start with most likely cause based on error messages
3. If unclear: Check Platform DevOps § 1-5 to understand architecture
4. Fix using suggested remedies
5. Once fixed: Document in Terminal Manual § 7 (Troubleshooting)
6. Schedule post-mortem with team

**Time to resolution:** 5-60 minutes depending on cause

### Scenario 3: "We want to support 10M users (10x growth)"

**What to do:**

1. Read: Platform DevOps § 6 (Multi-Region Sharding)
2. Read: Platform DevOps § 8 (Cost Analysis - recalculate for 10M users)
3. Read: Platform DevOps § 11 (Disaster Recovery needs)
4. Create design document referencing all sections
5. Present to team with cost/architecture trade-offs
6. Implement using Terminal Manual § 1.2 (deployment procedures)

**Time to plan:** 8-16 hours  
**Time to implement:** 2-4 weeks

### Scenario 4: "We spent $500K on LLM this month, need to reduce"

**What to do:**

1. Read: Terminal Manual § 6 (Cost Optimization)
2. Run: Daily cost script to identify which apps/models are expensive
3. Read: Platform DevOps § 3 (Oracle Framework) - understand how routing works
4. Read: Platform DevOps § 8 (Cost breakdown) - understand economics
5. Propose changes to Oracle routing rules
6. A/B test changes in staging
7. Deploy carefully using Terminal Manual § 1.2
8. Monitor results daily using Terminal Manual § 6

**Time to cost reduction:** 1-2 weeks

---

## TROUBLESHOOTING THIS DOCUMENTATION

### "I can't find answer to my question"

**Step 1:** Check if it's in the Quick Lookup Reference (above)  
**Step 2:** Check the Decision Tree (above)  
**Step 3:** Search documents with grep:
```bash
grep -r "your search term" *.md
```

**Step 4:** If still not found:
- Is this a new type of problem? Add it to Terminal Manual § 7
- Is this about architecture? Add it to Platform DevOps
- Is this a procedure? Add it to Terminal Manual § 1-3

**Step 5:** Update this file to help future engineers

### "The document says to do X, but X is broken"

**Step 1:** Verify the command actually is broken
```bash
# Example: If Terminal Manual says "achievemore status"
achievemore status  # Does this work?
which achievemore   # Is the CLI installed?
```

**Step 2:** Check if the docs are out of date
- Check: "Last Updated" date on document
- Check: Git log for recent changes
- Check: Is this documented in "v2.1" or later?

**Step 3:** Fix the issue, then update docs
- Fix the command/process
- Update relevant document section
- Add version note explaining the change
- Test the new command yourself
- Update this file with the fix

### "I found an error in the documentation"

**What to do:**

1. **Don't assume:** Verify the error with a colleague
2. **Document:** Where the error is, what's wrong, what should it be?
3. **Fix:** Update the document with correct information
4. **Test:** Verify the fix works
5. **Distribute:** Share corrected version with team
6. **Track:** Add to "Known Issues" section (below)

---

## KNOWN ISSUES & FIXES

As of January 5, 2026:

| Issue | Document | Section | Status | Fix |
|-------|----------|---------|--------|-----|
| `achievemore scale` command sometimes times out | Terminal Manual | 1.3 | KNOWN | Increase timeout to 120s (already in docs) |
| Cost projections assume 30 days; leap years off by 1% | Platform DevOps | 8 | KNOWN | Will fix in v2.1 |
| Temporal health check sometimes returns 503 on startup | Terminal Manual | 2.2 | KNOWN | Wait 30sec after restart (already in docs) |
| PostgreSQL replication lag shown as N/A in metrics | Terminal Manual | 1.3 | INVESTIGATING | Check replication slot status |

---

## APPENDIX: DOCUMENT STATISTICS

**Platform DevOps Guide (v2.0):**
- Pages: ~80
- Sections: 12
- Code examples: 45+
- Diagrams: 20+
- Total words: ~35,000

**Terminal Operations Manual (v1.0):**
- Pages: ~40
- Sections: 10
- Code examples: 60+
- Commands: 100+
- Total words: ~18,000

**Original II Ecosystem Guide:**
- Pages: ~50
- Sections: 10
- Code examples: 30+
- Total words: ~22,000

**Total Documentation:** ~150 pages, ~75,000 words, 135+ code examples

---

## FEEDBACK & SUGGESTIONS

Have ideas to improve this documentation?

**Process:**

1. File an issue: `/feedback/documentation-improvements.txt`
2. Include:
   - Document name
   - Section
   - What's unclear
   - Suggested improvement
3. Tag: `@documentation-lead`
4. Gets reviewed in monthly doc sync

**Monthly Doc Sync (2nd Thursday, 2pm UTC):**
- Discuss improvements
- Assign updates
- Plan major revisions
- Review feedback

---

## LICENSING & DISTRIBUTION

**Classification:** Internal Use Only  
**Distribution:** Engineering team + approved partners only  
**Sharing:** Use version control, not email attachments  

**If sharing externally:**
- Remove security-sensitive sections (API keys, specific IPs, etc.)
- Add confidentiality notice at top
- Get legal approval first
- Version control access (know who has latest version)

---

## SUMMARY: HOW TO SUCCEED WITH THIS SYSTEM

✅ **DO:**
- Read the right document for your task
- Use Terminal Manual § 1.2 for every deployment
- Check Terminal Manual § 2 when something breaks  
- Update docs when you discover new procedures
- Share learnings with the team
- Ask questions during weekly syncs

❌ **DON'T:**
- Memorize commands; reference the docs
- Skip security checks (Terminal Manual § 9)
- Deploy without testing on staging first
- Ignore warnings about cost
- Leave incidents undocumented
- Assume docs are up to date without checking "Last Updated"

🎯 **Success Metrics:**
- All deployments follow Terminal Manual § 1.2 (100%)
- Incidents documented in 24 hours (100%)
- Cost reviews run weekly (100%)
- Documentation updated when procedures change (100%)
- New team members productive in 1 week (success metric: can deploy independently)

---

**Last Updated:** January 5, 2026  
**Next Major Review:** April 5, 2026  
**Contact:** engineering-lead@achievemore.com

**Document Links:**
1. `platform-devops-guide.md` - Architecture & Infrastructure
2. `terminal-ops-manual.md` - Daily Operations
3. Original II Ecosystem Guide - Component Reference

---

## QUICK START (TL;DR)

**For New Engineers:**
```
Day 1-2: Read this file + Platform DevOps § 1
Day 3-5: Read Terminal Manual, practice operations
Week 2+: Use as daily reference
```

**For Operations:**
```
Every morning: Run ./scripts/morning-standup.sh
Before deployment: Check Terminal Manual § 1.2
In incident: Check Terminal Manual § 2
For optimization: Check Terminal Manual § 6
```

**For Architecture:**
```
Design phase: Read Platform DevOps § 2-3
Cost modeling: Read Platform DevOps § 8
Scaling: Read Platform DevOps § 6
HA/DR: Read Platform DevOps § 11
```

**For Everything Else:**
Use the Decision Tree above, or email: engineering-lead@achievemore.com
