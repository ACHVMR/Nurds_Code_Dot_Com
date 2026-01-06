# Background Coding Agent Framework
## Enterprise Implementation Guide for Large-Scale Code Migrations

**Document Version:** 1.0  
**Adapted from:** Spotify Engineering Blog (Parts 1-3)  
**Organization Focus:** ACHIEVEMOR / SmelterOS / Nurds Code  
**Last Updated:** January 2026

---

## Executive Summary

This framework enables autonomous code modifications across multiple repositories using AI agents. Based on Spotify's proven approach, it balances **predictability** with **scalability**, addressing three critical failure modes:

1. PR generation failure (recoverable)
2. PR fails CI (workflow disruption)
3. PR passes CI but is functionally wrong (trust erosion)

**Success metric:** Mergeable PRs with high confidence, minimal manual review burden.

---

## Part 1: Agent Architecture Decision

### Which Agent to Use?

| Agent Type | Best For | Tradeoff |
|-----------|----------|----------|
| **Claude Code** (Recommended) | Complex, multi-file changes; interpretation of high-level goals | Higher cost, less transparent |
| **Custom Agentic Loop** | Simple, deterministic changes (config, flags, single-file) | Limited context window, gets lost easily |
| **Open-source (Goose/Aider)** | Proof of concept, limited scope | Doesn't scale; unreliable at scale |

**Recommendation for ACHIEVEMOR:**
- **Primary:** Claude Code (for SmelterOS migrations, OpenKlass curriculum updates)
- **Secondary:** Custom loop (for repetitive config migrations across Locale/Karocel)
- Use Claude's SDK for enterprise control

### Agent Capabilities & Constraints

**What the agent CAN do:**
- Read and modify code files
- Run verification suite (tests, linters, formatters)
- Commit changes and push PRs
- Iterate based on feedback

**What the agent CANNOT/SHOULD NOT do:**
- Search codebases (provide context in prompt)
- Read documentation (embed examples in prompt)
- Push directly to production
- Interact with users (managed by orchestration layer)
- Have unrestricted file system or bash access

**Security model:**
- Container with limited permissions
- Strict allowlist for bash commands
- No production credentials
- Read-only access to most systems
- Git commands sandboxed (no push origin changes)

---

## Part 2: Context Engineering & Prompt Design

### The Problem Space
Writing effective prompts is harder than it appears. Two common anti-patterns:

1. **Overly generic** ("Make this better", expects telepathy)
2. **Overly specific** (covers every case, breaks on first edge case)

### Solution: The Spotify Prompt Framework

#### 2.1 Core Principles

**Principle 1: Define verifiable end states, not process steps**

❌ **Bad prompt:**
```
1. Find all UsageAnalytics classes
2. Create new telemetry base class
3. Refactor each class to inherit from it
4. Update imports everywhere
```

✅ **Good prompt:**
```
Migrate UsageAnalytics classes to use new TelemetryBase abstraction.
Verify: All tests pass, no compilation errors, class hierarchy is correct.
```

**Principle 2: State preconditions (when NOT to act)**

Example: "If the target Java version is < 11, do not attempt migration."

Example: "If there are no tests in src/test, report why and don't modify."

**Principle 3: Use concrete code examples**

Heavily influences agent output. Include 2-3 before/after code blocks.

**Principle 4: One change at a time**

❌ Don't combine: "Update dependencies AND refactor API AND migrate config"  
✅ Do: Single focused migration per prompt/session

**Principle 5: Code examples > verbose explanations**

```java
// BEFORE
public class Foo {
    private String bar;
    public String getBar() { return bar; }
}

// AFTER  
public record Foo(String bar) {}
```

#### 2.2 Prompt Template Structure

```
# Migration: [Clear Name]

## Goal
[One sentence describing verifiable end state]

## What to change
[Specific scope - file patterns, class names, etc.]

## What NOT to change
[Preconditions - when to abort]

## Examples

### Example 1: [Scenario]
// Before code
// After code

### Example 2: [Different scenario]
// Before code
// After code

## Edge cases to handle
1. [Condition A] → [expected behavior]
2. [Condition B] → [expected behavior]

## Build system notes
[How to run tests for this repo type]

## Success criteria
- All tests pass
- No compilation errors
- [Specific assertion about code structure]

```

#### 2.3 Example Prompt: Migrate Firebase Realtime to Firestore

```
# Migration: Firebase Realtime DB to Firestore

## Goal
Migrate data reading from Firebase Realtime Database (RTDB) to Firestore collections,
ensuring existing tests pass and query semantics are preserved.

## What to change
- All files using `FirebaseDatabase.getInstance().getReference()`
- Replace with `FirebaseFirestore.getInstance().collection()`
- Update listener callbacks to use Firestore DocumentSnapshot API

## What NOT to change
- Do NOT migrate if project uses `google-services.json` version < 4.3.8
- Do NOT change authentication logic
- Do NOT modify test setup files (firebase-test-config.json)
- If a path contains ".json" files, SKIP that branch

## Examples

### Example 1: Simple read operation
// Before
DatabaseReference ref = FirebaseDatabase.getInstance()
    .getReference("users/" + userId);
ref.addListenerForSingleValueEvent(new ValueEventListener() {
    @Override
    public void onDataChange(DataSnapshot snapshot) {
        User user = snapshot.getValue(User.class);
    }
});

// After
FirebaseFirestore db = FirebaseFirestore.getInstance();
db.collection("users").document(userId)
    .get().addOnSuccessListener(snapshot -> {
        User user = snapshot.toObject(User.class);
    });

### Example 2: Query with filtering
// Before
DatabaseReference ref = FirebaseDatabase.getInstance()
    .getReference("products");
ref.orderByChild("status").equalTo("active")
    .addListenerForSingleValueEvent(new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot snapshot) {
            for (DataSnapshot child : snapshot.getChildren()) {
                Product p = child.getValue(Product.class);
            }
        }
    });

// After
FirebaseFirestore db = FirebaseFirestore.getInstance();
db.collection("products")
    .whereEqualTo("status", "active")
    .get().addOnSuccessListener(snapshot -> {
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            Product p = doc.toObject(Product.class);
        }
    });

## Edge cases to handle
1. **RTDB child listeners** → Use Firestore `SnapshotListenOptions` for real-time updates
2. **Transactions** → Migrate to Firestore's batched writes pattern
3. **Array operations** → Use FieldValue.arrayUnion() instead of setValue(ServerValue.increment())
4. **Missing error handlers** → Add consistent error callbacks (.addOnFailureListener)

## Build system notes
- Run tests: `./gradlew test -Dfirebse.emulator.host=localhost:9199`
- Start emulator: `firebase emulators:start`
- Schema validation: Check `firestore.indexes.json`

## Success criteria
- All unit tests pass (firebase emulator tests)
- No `FirebaseDatabase` imports remain in migrated files
- No `ValueEventListener` implementations remain
- All `.get()` calls have error handlers
- Query logic produces identical result sets as before

```

#### 2.4 Prompt Anti-Patterns (What NOT to Do)

❌ **Anti-pattern 1: Vague end state**
```
"Update the authentication system to be more secure."
```
✅ **Fix it:**
```
"Migrate from custom JWT handling to Firebase Auth with 2FA enabled.
Tests should verify: token validation, 2FA enforcement, session timeout."
```

❌ **Anti-pattern 2: Missing preconditions**
```
"Migrate all Python 2 code to Python 3."
```
✅ **Fix it:**
```
"Migrate to Python 3.9+. Do NOT attempt if:
- Python 2 dependencies are unforkable
- Project uses __future__ imports that won't translate
- sys.version checks exist (leave as-is)"
```

❌ **Anti-pattern 3: Combining multiple migrations**
```
"Update dependencies, refactor API, migrate database, add monitoring."
```
✅ **Fix it:**
```
# Run separately:
1. Prompt: Update dependencies (with specific versions)
2. Prompt: Refactor API endpoints (with examples)
3. Prompt: Migrate database (with schema)
4. Prompt: Add observability (with metrics)
```

---

## Part 3: Tool Design & Verification Loops

### 3.1 Tool Architecture

**Principle:** Minimal tools = predictable agent

**Allowed tools:**
1. **Verify tool** - format, lint, test in one call
2. **Git tool** - restricted subcommands
3. **Bash tool** - strict allowlist (ripgrep, find, grep only)

**NOT allowed:**
- Code search (include relevant context in prompt)
- Documentation fetchers (embed examples in prompt)
- Package managers (handle dependencies upfront)

### 3.2 Verify Tool Implementation

**Purpose:** Single tool that abstracts all validation into one call

**What it does:**
```
1. Detect project type (Maven, Gradle, Node, Python, etc.)
2. Run appropriate formatter (prettier, black, spotless, etc.)
3. Run linter (eslint, pylint, checkstyle)
4. Run test suite
5. Parse output and return summarized result
```

**What it returns:**
```
{
  "status": "success" | "failure",
  "formatter": "✓ No issues" | "✗ 5 files reformatted",
  "linter": "✓ No violations" | "✗ 3 errors: [extracted relevant only]",
  "test": "✓ 42 tests passed" | "✗ 2 tests failed:\n  - test_firebase_read [exact error]",
  "suggestion": "Check line 87 in FirebaseService.java"
}
```

**Implementation for GCP projects:**

```yaml
# verify-tool.mcp.json (Model Context Protocol definition)
name: verify
description: "Format, lint, and test code changes"

tools:
  - name: format_lint_test
    input:
      properties:
        repo_path:
          type: string
          description: "Repository root path"
        build_system:
          type: string
          enum: ["maven", "gradle", "npm", "python", "bazel"]
    returns:
      status: "success" | "failure"
      details: string
```

**Key feature:** Agent doesn't need to know HOW verification works, only THAT it works.

This abstracts away:
- Different build tools
- Different test frameworks
- Environment setup
- Output parsing complexity

### 3.3 Git Tool Implementation

**Principle:** Restrict dangerous git operations, standardize safe ones

```yaml
# git-tool.mcp.json
name: git
allowed_commands:
  - "git add" → standardized file patterns only
  - "git commit" → standard message format enforced
  - "git checkout" → existing branches only
  - "git diff" → read-only
  
forbidden_commands:
  - "git push" (handled by orchestration layer)
  - "git reset --hard" (destructive)
  - "git clone" (handled externally)
```

**Standard commit format:**
```
[Migration] <Type>: <Description>

- Change 1
- Change 2

Verified with tests.
```

### 3.4 Bash Tool Implementation

**Principle:** Strict allowlist, only readonly + search operations

```yaml
# bash-tool.mcp.json
allowed_commands:
  - rg (ripgrep) - code search
  - find - file search
  - grep - pattern search
  - cat - view files
  
forbidden_commands:
  - rm, mv, cp - file operations (use file edit tool)
  - curl, wget - network access
  - sudo, su - privilege escalation
  - export, source - environment manipulation
```

### 3.5 Verification Loop Pattern

**When it activates:**
- After every agent edit (continuous feedback)
- Before opening PR (final validation)

**Flow:**
```
Agent makes change
    ↓
Agent calls Verify tool
    ↓
Verify returns: ✓ or ✗ (with reason)
    ↓
If ✗: Agent iterates (tries fix, up to 10 turns)
    ↓
If ✓: Continue to next change
    ↓
Before PR: Run full verify again
    ↓
If ✗: Abort PR, return to user with error
    ↓
If ✓: Open PR automatically
```

### 3.6 Judge Pattern (LLM Verification)

**Purpose:** Prevent agent "mission creep" (solving problems outside prompt scope)

**How it works:**
```
Agent proposes change (diff)
    ↓
Judge receives: original_prompt + diff
    ↓
Judge LLM evaluates: "Does this diff implement exactly what was asked?"
    ↓
Result: APPROVE or VETO with reason
    ↓
If VETO: Agent can try again (50% course-correct rate)
    ↓
If still fails: Escalate to human
```

**Judge system prompt:**

```
You are a senior engineer performing code review.

Your task: Verify the proposed change strictly follows the migration instructions.

Evaluate ONLY:
1. Does the diff implement EXACTLY what the prompt asked?
2. Did the agent go outside the scope (refactoring, optimizations, etc.)?
3. Are all preconditions respected (version checks, skip conditions)?

Be very strict - if ANY part of the instructions is missing or incomplete, veto.

Score: 0-1 (0 = reject, 1 = approve)

Return concise feedback focusing on what was missed.
```

**Typical veto triggers (~25% of sessions):**
- Agent refactored unrelated code
- Agent disabled tests instead of fixing them
- Agent made changes in files marked "don't touch"
- Agent optimized instead of just migrating

---

## Part 4: Orchestration Layer (Outside Agent)

### 4.1 Pre-Agent Setup

**Orchestration responsibilities (NOT agent):**

1. **Gather context**
   - Read workflow MCPs (Slack, Jira, GitHub)
   - Build complete prompt from templates
   - Include necessary examples and preconditions

2. **Validate preconditions**
   - Check Java version, Python version, etc.
   - Verify test coverage exists
   - Confirm build system is supported

3. **Prepare environment**
   - Clone repository
   - Install dependencies
   - Set up emulators (Firebase, databases)

4. **Manage agent session**
   - Start agent with prompt + file context
   - Handle retries (3 session retries max)
   - Enforce turn limits (10 turns per session)

### 4.2 Post-Agent Handling

**After agent completes:**

1. **Analyze results**
   - If failure: categorize (no_change, error, judge_veto, iteration_limit)
   - If success: extract metrics (files changed, tests run, time taken)

2. **Create/update PR**
   - Title: `[Automated] Migration: [Type]`
   - Description: Summary + metrics + verification results
   - Label: `automated`, `needs-review`, migration type

3. **Notify user**
   - Slack: ✓ Success or ✗ Failure with reason
   - GitHub: Auto-assign to migration lead
   - Include metrics and any manual work needed

4. **Feedback loop** (future)
   - Track which prompts succeed/fail
   - Build eval harness
   - Iterate prompt quality

---

## Part 5: Failure Modes & Mitigations

### 5.1 Failure Mode 1: No PR Generated

**Symptoms:** Agent reaches iteration limit without producing change

**Why it happens:**
- Too broad file scope (context window overflow)
- Preconditions prevent action (correct behavior)
- Prompt ambiguity

**Mitigation:**
```yaml
Before running agent:
  - Validate file scope (max 20 files, max 50KB total)
  - Verify preconditions are possible (version checks work)
  - Have pair review prompt for clarity

Agent limits:
  - 10 turns per session
  - 3 session retries (different seeds/approaches)
  - Fallback: human manual migration
```

### 5.2 Failure Mode 2: PR Fails CI

**Symptoms:** PR created but tests fail, linter errors, etc.

**Why it happens:**
- Verify tool didn't catch edge case
- Agent "forgot" the original task mid-session
- Build system complexity not abstracted

**Mitigation:**
```yaml
Before PR: Always run full verify
  - Format check
  - Lint check
  - Full test suite (not just quick checks)
  
Verify tool improvements:
  - Regex parsing to extract only relevant errors
  - Return actionable messages
  - Include line numbers for failures

If still happens:
  - Add to eval data
  - Improve verify tool detection
  - Refine prompt examples
```

### 5.3 Failure Mode 3: PR Passes CI but is Functionally Wrong

**Symptoms:** Tests pass but behavior changed subtly (most serious)

**Why it happens:**
- Tests don't cover all cases
- Agent misunderstood semantics
- Silent regressions

**Mitigation:**
```yaml
First line: Judge LLM verification
  - Catches scope violations
  - ~25% veto rate, prevents major mistakes

Second line: Require test coverage
  - Precondition: "If coverage < 70%, report and skip"
  - Examples include happy path + edge cases
  
Third line: Human review
  - Flag migrations with low test coverage for detailed review
  - Require approval before merge
  
Fourth line: Staged rollout
  - Don't merge to main immediately
  - Deploy to staging first
  - Monitor for issues before production
```

---

## Part 6: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Select agent (Claude Code via SDK)
- [ ] Build verify tool (at least for GCP/Java projects)
- [ ] Create prompt template
- [ ] Test on 1-2 safe migrations (non-critical repos)

### Phase 2: Operationalization (Weeks 5-8)
- [ ] Build orchestration layer
- [ ] Set up PR automation
- [ ] Create Slack integration
- [ ] Document runbooks

### Phase 3: Scaling (Weeks 9-12)
- [ ] Add judge verification
- [ ] Extend verify tool to all build systems
- [ ] Build eval harness
- [ ] Run 10+ migrations in parallel

### Phase 4: Refinement (Ongoing)
- [ ] Collect metrics on success rates
- [ ] Iterate prompt library
- [ ] Improve error categorization
- [ ] Expand to different migration types

---

## Part 7: Prompt Library

### Template 1: Config File Migration

```
# Migration: Update [Config Type]

## Goal
Update all [config-type] files from [old-version] to [new-version],
ensuring application behavior is unchanged.

## What to change
- Files matching: [pattern]
- Old key: [old-key] → New key: [new-key]
- Old value format: [format] → New format: [format]

## What NOT to change
- Do NOT modify comments
- Do NOT change unrelated configs
- If file has been manually edited, add note to PR

## Examples
[Before/after blocks]

## Success criteria
- All configs updated
- Application starts successfully
- Tests pass
```

### Template 2: Dependency Upgrade

```
# Migration: Upgrade [Library] to [Version]

## Goal
Upgrade [library] from X.Y to A.B and update all usages
to use new API.

## What to change
- Build file: update version to A.B
- All imports: old.package.Old → new.package.New
- API calls: oldMethod() → newMethod() [with examples]

## Breaking changes handled
[List specific API breaks]

## Success criteria
- No old imports remain
- All tests pass
- Binary size doesn't increase >2%
```

### Template 3: Database Schema Migration

```
# Migration: Add field [name] to table [table]

## Goal
Add nullable column [name] of type [type] to [table].

## Preconditions
- If no migrations directory exists, skip
- If table is in shared database, skip

## Example
[Before/after schema]

## Success criteria
- Migration script created
- Backward compatible (nullable)
- Tests verify field exists and is queryable
```

---

## Part 8: Monitoring & Metrics

### Key Metrics to Track

```
Migration success rate = (PRs merged) / (PRs created)
Agent efficiency = (files modified) / (files read)
Context utilization = (tokens used) / (tokens available)
Judge accuracy = (vetoed PRs with actual issues) / (total vetoes)
Time to merge = hours from PR creation to merge

Target: >80% success rate, <2 hour merge time
```

### Dashboard View (Weekly)

```
Week of Jan 6, 2026
- Total migrations run: 12
- Successful PRs merged: 10 (83%)
- Failed PRs: 2 (judge veto: 1, CI failure: 1)
- Judge veto correctness: 95% (correct rejection)
- Avg time to merge: 1.8 hours
- Cost per migration: ~$2.40 (Claude 3.5 Sonnet)
```

---

## Part 9: Security & Compliance

### Agent Sandbox Requirements

```
Container isolation:
  ✓ Read-only access except for working directory
  ✓ No network access (except to git server)
  ✓ No access to: credentials, databases, production systems
  ✓ Resource limits: 2 CPU, 4GB RAM, 10min timeout

Audit trail:
  ✓ All agent actions logged
  ✓ Prompt stored with each run
  ✓ Diff captured before approval
  ✓ User who approved change tracked

Code review:
  ✓ All agent PRs require human review before merge
  ✓ Critical repos: 2 approvals required
  ✓ Non-critical: 1 approval sufficient
```

---

## Part 10: Adaptation for ACHIEVEMOR Products

### SmelterOS Infrastructure Migrations
- **Primary migration:** Update service configurations
- **Prompt template:** Config file migration (Part 7, Template 1)
- **Verify tool:** GCP/Bazel specific
- **Success criteria:** Deployment tests pass

### OpenKlass AI Curriculum Updates
- **Primary migration:** Update learning paths, add new modules
- **Prompt template:** Data schema migration (Part 7, Template 3)
- **Verify tool:** Node.js + Firestore specific
- **Success criteria:** Curriculum integrity tests pass

### Nurds Code Platform
- **Primary migration:** Update code generation templates, examples
- **Prompt template:** Template file migration (create custom)
- **Verify tool:** JavaScript/TypeScript linting + execution
- **Success criteria:** Generated code compiles and produces correct output

### Locale Service Directory
- **Primary migration:** Update Firecrawl integration, schema
- **Prompt template:** API integration migration (create custom)
- **Verify tool:** Integration tests with mock services
- **Success criteria:** Service discovery returns correct results

---

## Quick Start Checklist

- [ ] **Week 1:** Read all three Spotify blog posts (embedded links in this doc)
- [ ] **Week 2:** Design your first prompt (use template)
- [ ] **Week 3:** Build verify tool for your primary build system
- [ ] **Week 4:** Run agent on 3 test repos
- [ ] **Week 5:** Measure success rate, iterate
- [ ] **Week 6:** Deploy orchestration layer
- [ ] **Week 7:** Run first production migration batch
- [ ] **Week 8+:** Monitor metrics, refine prompts, scale

---

## References & Resources

**Spotify Engineering Blog:**
1. [Part 1: Introduction](https://engineering.spotify.com/blog/background-coding-agents-at-spotify/)
2. [Part 2: Context Engineering](https://lnkd.in/dsth8x4w)
3. [Part 3: Verification & Reliability](https://engineering.spotify.com/blog/background-coding-agents-part-3/)

**Key Tools:**
- Claude Code / Claude 3.5 Sonnet
- Claude Agent SDK
- Model Context Protocol (MCP)

**Related Frameworks:**
- Anthropic's [Prompt Engineering Guide](https://docs.anthropic.com/guides)
- OpenHands (AI development agent for reference)
- Perplexity AI (context gathering)

