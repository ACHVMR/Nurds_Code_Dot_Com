-- Verification: each statement should succeed (0 rows) if the table exists.
SELECT 1 FROM orchestrator_sessions LIMIT 0;
SELECT 1 FROM orchestrator_executions LIMIT 0;

SELECT 1 FROM circuit_plugs LIMIT 0;
SELECT 1 FROM agent_tasks_v2 LIMIT 0;
SELECT 1 FROM model_usage_v2 LIMIT 0;
SELECT 1 FROM workflow_steps_v2 LIMIT 0;
SELECT 1 FROM kingmode_context LIMIT 0;
SELECT 1 FROM session_artifacts LIMIT 0;
