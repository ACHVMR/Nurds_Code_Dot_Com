-- =====================================================
-- Intelligent Internet (II Agent) System Schema
-- Migration 0005
-- Based on II-Agent v0.4 (Apache-2.0 License)
-- Repository: https://github.com/Intelligent-Internet/ii-agent
-- =====================================================

-- =====================================================
-- Agent Registry Table
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('code', 'task', 'data', 'monitor', 'orchestrator')),
    repo_url TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'paused', 'deploying')),
    config JSONB DEFAULT '{}'::jsonb,
    capabilities JSONB DEFAULT '[]'::jsonb,
    dependencies TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    last_heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Agent Tasks Queue
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 300,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Agent Events Log
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    version INTEGER DEFAULT 1,
    owner_id TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Workflow Executions
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB,
    execution_log JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    started_by TEXT NOT NULL
);

-- =====================================================
-- Agent Performance Metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Agent Dependencies Junction Table
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    depends_on_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    dependency_type TEXT NOT NULL DEFAULT 'required' CHECK (dependency_type IN ('required', 'optional', 'suggested')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, depends_on_agent_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_last_heartbeat ON agents(last_heartbeat_at);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_scheduled_at ON agent_tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_by ON agent_tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent_id ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_timestamp ON agent_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_severity ON agent_events(severity);

CREATE INDEX IF NOT EXISTS idx_workflows_owner_id ON workflows(owner_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_by ON workflow_executions(started_by);

CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_recorded_at ON agent_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_type ON agent_metrics(metric_type);

-- =====================================================
-- Views for Monitoring
-- =====================================================

-- View: Agent Health Summary
CREATE OR REPLACE VIEW agent_health_summary AS
SELECT
    a.id,
    a.name,
    a.type,
    a.status,
    a.last_heartbeat_at,
    CASE 
        WHEN a.last_heartbeat_at > NOW() - INTERVAL '5 minutes' THEN 'healthy'
        WHEN a.last_heartbeat_at > NOW() - INTERVAL '15 minutes' THEN 'degraded'
        ELSE 'unhealthy'
    END AS health_status,
    COUNT(DISTINCT at.id) FILTER (WHERE at.status = 'running') AS active_tasks,
    COUNT(DISTINCT at.id) FILTER (WHERE at.status = 'pending') AS pending_tasks,
    COUNT(DISTINCT at.id) FILTER (WHERE at.status = 'failed') AS failed_tasks_24h,
    a.updated_at
FROM agents a
LEFT JOIN agent_tasks at ON a.id = at.agent_id AND at.created_at > NOW() - INTERVAL '24 hours'
GROUP BY a.id, a.name, a.type, a.status, a.last_heartbeat_at, a.updated_at;

-- View: Task Queue Statistics
CREATE OR REPLACE VIEW task_queue_stats AS
SELECT
    agent_id,
    a.name AS agent_name,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'running') AS running_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE status = 'completed') AS avg_duration_seconds
FROM agent_tasks at
JOIN agents a ON at.agent_id = a.id
WHERE at.created_at > NOW() - INTERVAL '24 hours'
GROUP BY agent_id, a.name;

-- View: Workflow Performance
CREATE OR REPLACE VIEW workflow_performance AS
SELECT
    w.id,
    w.name,
    w.status,
    COUNT(DISTINCT we.id) AS total_executions,
    COUNT(DISTINCT we.id) FILTER (WHERE we.status = 'completed') AS successful_executions,
    COUNT(DISTINCT we.id) FILTER (WHERE we.status = 'failed') AS failed_executions,
    AVG(EXTRACT(EPOCH FROM (we.completed_at - we.started_at))) FILTER (WHERE we.status = 'completed') AS avg_duration_seconds,
    MAX(we.started_at) AS last_execution_at
FROM workflows w
LEFT JOIN workflow_executions we ON w.id = we.workflow_id
WHERE we.started_at > NOW() - INTERVAL '30 days' OR we.started_at IS NULL
GROUP BY w.id, w.name, w.status;

-- =====================================================
-- Functions for Agent Management
-- =====================================================

-- Function: Update agent heartbeat
CREATE OR REPLACE FUNCTION update_agent_heartbeat(agent_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE agents
    SET last_heartbeat_at = NOW(),
        status = CASE 
            WHEN status = 'inactive' THEN 'active'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = agent_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-retry failed tasks
CREATE OR REPLACE FUNCTION retry_failed_tasks()
RETURNS INTEGER AS $$
DECLARE
    retried_count INTEGER;
BEGIN
    UPDATE agent_tasks
    SET status = 'pending',
        retry_count = retry_count + 1,
        scheduled_at = NOW() + INTERVAL '5 minutes'
    WHERE status = 'failed'
        AND retry_count < max_retries
        AND completed_at > NOW() - INTERVAL '1 hour'
    RETURNING id INTO retried_count;
    
    RETURN COALESCE(retried_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Cleanup old events
CREATE OR REPLACE FUNCTION cleanup_old_agent_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM agent_events
        WHERE timestamp < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update agent updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_timestamp();

CREATE TRIGGER workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_timestamp();

-- Trigger: Log agent status changes
CREATE OR REPLACE FUNCTION log_agent_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO agent_events (agent_id, event_type, event_data, severity, message)
        VALUES (
            NEW.id,
            'status_changed',
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
            CASE 
                WHEN NEW.status = 'error' THEN 'error'
                WHEN NEW.status = 'active' THEN 'info'
                ELSE 'debug'
            END,
            format('Agent status changed from %s to %s', OLD.status, NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_status_change_log
    AFTER UPDATE ON agents
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_agent_status_change();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

-- Agents: All authenticated users can read
CREATE POLICY agents_select ON agents
    FOR SELECT
    USING (true);

-- Agents: Only superadmins can modify
CREATE POLICY agents_modify ON agents
    FOR ALL
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'superadmin'
    );

-- Tasks: Users can see their own tasks
CREATE POLICY agent_tasks_select ON agent_tasks
    FOR SELECT
    USING (
        created_by = current_setting('request.jwt.claims', true)::json->>'sub'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superadmin'
    );

-- Tasks: Users can create tasks
CREATE POLICY agent_tasks_insert ON agent_tasks
    FOR INSERT
    WITH CHECK (
        created_by = current_setting('request.jwt.claims', true)::json->>'sub'
    );

-- Events: All authenticated users can read (for monitoring)
CREATE POLICY agent_events_select ON agent_events
    FOR SELECT
    USING (true);

-- Workflows: Users can see their own workflows
CREATE POLICY workflows_select ON workflows
    FOR SELECT
    USING (
        owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superadmin'
    );

-- Workflows: Users can create their own workflows
CREATE POLICY workflows_insert ON workflows
    FOR INSERT
    WITH CHECK (
        owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

-- =====================================================
-- Grant Permissions
-- =====================================================

GRANT SELECT ON agents TO authenticated;
GRANT SELECT ON agent_tasks TO authenticated;
GRANT SELECT, INSERT ON agent_tasks TO authenticated;
GRANT SELECT ON agent_events TO authenticated;
GRANT SELECT ON workflows TO authenticated;
GRANT SELECT, INSERT ON workflows TO authenticated;
GRANT SELECT ON workflow_executions TO authenticated;
GRANT SELECT ON agent_metrics TO authenticated;
GRANT SELECT ON agent_health_summary TO authenticated;
GRANT SELECT ON task_queue_stats TO authenticated;
GRANT SELECT ON workflow_performance TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- Seed Data: Intelligent Internet Agents (17 Total)
-- Based on II-Agent v0.4 framework (monorepo architecture)
-- Main repo: https://github.com/Intelligent-Internet/ii-agent
-- All agents are modules within the main framework
-- =====================================================

-- Core II-Agent Framework (Main Orchestrator)
INSERT INTO agents (name, type, repo_url, version, status, capabilities, metadata) VALUES
('ii-agent-core', 'orchestrator', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active', 
 '["research", "content_generation", "data_analysis", "software_development", "web_development", "workflow_automation", "problem_solving", "websocket_server", "browser_automation", "file_operations", "command_execution", "multimodal_processing", "orchestration", "llm_integration"]'::jsonb,
 '{"description": "Main II-Agent framework - Core orchestrator with LLM integration", "priority": "critical", "license": "Apache-2.0", "features": ["CLI interface", "WebSocket server", "React frontend", "Docker runtime", "E2B runtime", "NeonDB integration", "Vercel deployment"], "runtime_modes": ["Local", "Docker", "E2B"], "llm_providers": ["Claude Sonnet 4", "Gemini 2.5 Pro", "GPT-4.1", "Vertex AI"], "gaia_benchmark": "evaluated", "module": "core", "latest_update": "2025-07-29"}'::jsonb),

-- Orchestration Layer (4 agents)
('ii-agent-registry', 'orchestrator', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["agent_discovery", "registration", "health_monitoring", "capability_indexing"]'::jsonb,
 '{"description": "Agent discovery and registration system", "priority": "critical", "module": "src/ii_agent/registry", "parent": "ii-agent-core"}'::jsonb),

('ii-task-queue', 'orchestrator', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["task_distribution", "scheduling", "priority_management", "deadlock_prevention"]'::jsonb,
 '{"description": "Task distribution and scheduling engine with priority queues", "priority": "critical", "module": "src/ii_agent/queue", "parent": "ii-agent-core", "max_concurrent_tasks": 50}'::jsonb),

('ii-state-manager', 'orchestrator', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["state_persistence", "synchronization", "recovery", "context_management"]'::jsonb,
 '{"description": "Persistent state management across agents with token optimization", "priority": "critical", "module": "src/ii_agent/state", "parent": "ii-agent-core", "storage": "file_based_archival"}'::jsonb),

('ii-event-bus', 'orchestrator', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["message_routing", "pub_sub", "event_streaming", "websocket_communication"]'::jsonb,
 '{"description": "Inter-agent communication bus with WebSocket support", "priority": "critical", "module": "ws_server.py", "parent": "ii-agent-core", "protocol": "websocket"}'::jsonb),

-- Code Intelligence Agents (4 agents)
('ii-code-analyzer', 'code', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["code_analysis", "ast_parsing", "complexity_calculation", "pattern_detection", "security_scanning"]'::jsonb,
 '{"description": "Code analysis and understanding with AST parsing", "module": "src/ii_agent/tools/code_analyzer", "parent": "ii-agent-core", "language_support": ["javascript", "python", "typescript", "rust", "go"], "based_on": "AugmentCode SWE-bench components"}'::jsonb),

('ii-code-generator', 'code', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["code_generation", "template_engine", "ai_integration", "full_stack_dev", "framework_templates"]'::jsonb,
 '{"description": "AI-powered code generation with full-stack web app creation", "module": "src/ii_agent/tools/code_generator", "parent": "ii-agent-core", "ai_models": ["claude-sonnet-4", "gemini-2.5-pro", "gpt-4.1"], "features": ["live_hosting", "neondb_integration", "vercel_deployment"]}'::jsonb),

('ii-code-refactor', 'code', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["refactoring", "code_optimization", "pattern_detection", "technical_debt_analysis"]'::jsonb,
 '{"description": "Intelligent code refactoring and optimization", "module": "src/ii_agent/tools/refactor", "parent": "ii-agent-core", "refactor_types": ["extract_method", "rename", "move", "inline", "extract_class"]}'::jsonb),

('ii-dependency-resolver', 'code', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["dependency_analysis", "version_resolution", "conflict_detection", "security_audit"]'::jsonb,
 '{"description": "Dependency management and resolution with security auditing", "module": "src/ii_agent/tools/dependencies", "parent": "ii-agent-core", "package_managers": ["npm", "pip", "cargo", "maven", "poetry"]}'::jsonb),

-- Task Automation Agents (4 agents)
('ii-workflow-engine', 'task', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["workflow_execution", "step_coordination", "error_handling", "planning", "reflection"]'::jsonb,
 '{"description": "Complex workflow orchestration with planning and reflection capabilities", "module": "src/ii_agent/workflow", "parent": "ii-agent-core", "max_concurrent_workflows": 100, "features": ["problem_decomposition", "sequential_thinking", "hypothesis_testing"]}'::jsonb),

('ii-deployment-agent', 'task', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["deployment", "rollback", "environment_management", "ci_cd", "containerization"]'::jsonb,
 '{"description": "Automated deployment with Docker and E2B runtime support", "module": "src/ii_agent/deployment", "parent": "ii-agent-core", "platforms": ["cloudflare", "vercel", "aws", "docker", "e2b"], "container_support": "docker_compose"}'::jsonb),

('ii-testing-agent', 'task', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["test_execution", "coverage_analysis", "regression_testing", "test_generation"]'::jsonb,
 '{"description": "Automated testing and validation with coverage analysis", "module": "tests/", "parent": "ii-agent-core", "test_frameworks": ["jest", "pytest", "vitest", "playwright"], "gaia_benchmark": "integrated"}'::jsonb),

('ii-monitoring-agent', 'monitor', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["health_monitoring", "alerting", "log_aggregation", "performance_tracking"]'::jsonb,
 '{"description": "Real-time monitoring and alerting system", "module": "src/ii_agent/monitoring", "parent": "ii-agent-core", "metrics_collected": ["cpu", "memory", "latency", "token_usage", "llm_costs"]}'::jsonb),

-- Data & Integration Agents (4 agents)
('ii-data-pipeline', 'data', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["data_ingestion", "transformation", "validation", "etl", "multimodal_processing"]'::jsonb,
 '{"description": "Data ingestion and transformation with multimodal support", "module": "src/ii_agent/data", "parent": "ii-agent-core", "data_sources": ["api", "database", "file", "web_scraping"], "multimodal": ["pdf", "audio", "image", "video", "slides"]}'::jsonb),

('ii-api-gateway', 'data', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["api_routing", "authentication", "rate_limiting", "request_validation"]'::jsonb,
 '{"description": "Unified API access layer with multiple protocol support", "module": "src/ii_agent/api", "parent": "ii-agent-core", "protocols": ["rest", "graphql", "websocket"], "integrations": ["neondb", "vercel", "openrouter"]}'::jsonb),

('ii-webhook-handler', 'data', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["webhook_processing", "event_validation", "retry_logic", "signature_verification"]'::jsonb,
 '{"description": "Webhook processing and routing with retry logic", "module": "src/ii_agent/webhooks", "parent": "ii-agent-core", "max_payload_mb": 10, "retry_strategy": "exponential_backoff"}'::jsonb),

('ii-plugin-system', 'data', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["plugin_loading", "sandboxing", "lifecycle_management", "dynamic_capability_extension"]'::jsonb,
 '{"description": "Extensibility framework for custom agents and tools", "module": "src/ii_agent/plugins", "parent": "ii-agent-core", "plugin_api_version": "1.0", "sandbox": "isolated_execution"}'::jsonb),

-- Browser & Research Agents (1 agent)
('ii-browser-automation', 'task', 'https://github.com/Intelligent-Internet/ii-agent', '0.4.0', 'active',
 '["browser_automation", "web_scraping", "form_filling", "screenshot_capture", "web_interaction"]'::jsonb,
 '{"description": "Advanced browser automation and web interaction", "module": "src/ii_agent/browser", "parent": "ii-agent-core", "based_on": "Index Browser Use", "browser_engine": "playwright", "features": ["multistep_search", "source_triangulation", "dynamic_content"]}'::jsonb);

-- =====================================================
-- Seed Data: Agent Dependencies
-- All 16 agents depend on the core orchestrator
-- =====================================================

-- All non-core agents depend on ii-agent-core
INSERT INTO agent_dependencies (agent_id, depends_on_agent_id, dependency_type)
SELECT 
    a1.id as agent_id,
    a2.id as depends_on_agent_id,
    'required' as dependency_type
FROM agents a1
CROSS JOIN agents a2
WHERE a2.name = 'ii-agent-core'
    AND a1.name != 'ii-agent-core'
ON CONFLICT DO NOTHING;

-- Orchestration agents depend on each other
INSERT INTO agent_dependencies (agent_id, depends_on_agent_id, dependency_type)
SELECT a1.id, a2.id, 'required'
FROM agents a1, agents a2
WHERE a1.name IN ('ii-task-queue', 'ii-state-manager')
    AND a2.name = 'ii-agent-registry'
ON CONFLICT DO NOTHING;

-- Code generator depends on code analyzer (optional optimization)
INSERT INTO agent_dependencies (agent_id, depends_on_agent_id, dependency_type)
SELECT a1.id, a2.id, 'optional'
FROM agents a1, agents a2
WHERE a1.name = 'ii-code-generator' AND a2.name = 'ii-code-analyzer'
ON CONFLICT DO NOTHING;

-- Deployment agent depends on testing agent (best practice)
INSERT INTO agent_dependencies (agent_id, depends_on_agent_id, dependency_type)
SELECT a1.id, a2.id, 'suggested'
FROM agents a1, agents a2
WHERE a1.name = 'ii-deployment-agent' AND a2.name = 'ii-testing-agent'
ON CONFLICT DO NOTHING;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE agents IS 'Registry of all Intelligent Internet agents with configuration and status';
COMMENT ON TABLE agent_tasks IS 'Task queue for agent execution with priority and retry logic';
COMMENT ON TABLE agent_events IS 'Event log for agent lifecycle and operational events';
COMMENT ON TABLE workflows IS 'Workflow definitions with multi-agent orchestration';
COMMENT ON TABLE workflow_executions IS 'Runtime execution state of workflows';
COMMENT ON TABLE agent_metrics IS 'Performance metrics for agent monitoring and optimization';
COMMENT ON TABLE agent_dependencies IS 'Agent dependency graph for orchestration planning';

-- =====================================================
-- Migration Complete
-- =====================================================

SELECT 'II Agent System migration completed successfully. 17 agents seeded.' AS status;
