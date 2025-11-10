"""
Modal GPU Configuration for Deploy Platform Boomer_Angs

This module defines the Modal app configuration, GPU image, and secrets
for executing Boomer_Ang tasks on A10G GPUs.

Security Tier: Enhanced (≥90% V.I.B.E. score)
Charter-Ledger Separation: ENFORCED
"""

import modal
from typing import Optional

# =============================================================================
# MODAL APP DEFINITION
# =============================================================================

app = modal.App("deploy-boomer-angs")

# =============================================================================
# GPU IMAGE CONFIGURATION
# =============================================================================

gpu_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        # AI/LLM SDKs
        "openai>=1.0.0",
        "anthropic>=0.25.0",
        
        # HTTP clients
        "httpx>=0.27.0",
        "requests>=2.31.0",
        
        # Data validation
        "pydantic>=2.0.0",
        
        # Database
        "psycopg2-binary>=2.9.9",
        "asyncpg>=0.29.0",
        
        # Cache
        "redis>=5.0.0",
        
        # Utilities
        "python-dotenv>=1.0.0",
        "tenacity>=8.0.0",  # Retry logic
    ])
)

# =============================================================================
# SECRETS CONFIGURATION
# =============================================================================

# Modal secrets must be created via Modal dashboard or CLI:
# modal secret create openrouter-api-key OPENROUTER_API_KEY=<key>
# modal secret create database-url DATABASE_URL=<url>
# modal secret create redis-url REDIS_URL=<url>
# modal secret create webhook-secret WEBHOOK_SECRET=<secret>

REQUIRED_SECRETS = [
    modal.Secret.from_name("openrouter-api-key"),
    modal.Secret.from_name("database-url"),
    modal.Secret.from_name("redis-url"),
    modal.Secret.from_name("webhook-secret"),
]

# =============================================================================
# GPU SPECIFICATIONS
# =============================================================================

GPU_CONFIG = {
    "gpu": "A10G",  # NVIDIA A10G Tensor Core GPU
    "cpu": 4,  # CPU cores
    "memory": 16384,  # 16GB RAM (in MB)
    "timeout": 3600,  # 1 hour max execution
    "container_idle_timeout": 300,  # 5 minutes keep-alive
}

# =============================================================================
# COST TRACKING (INTERNAL - LEDGER ONLY)
# =============================================================================

# CRITICAL: These costs are for internal Ledger logging ONLY
# NEVER expose these values in Charter logs (customer-facing)

INTERNAL_COSTS = {
    "gpu_a10g_per_second": 0.0004,  # $0.0004/second = $1.44/hour
    "cpu_4_core": 0.0,  # Included with GPU
    "memory_16gb": 0.0,  # Included with GPU
    "storage_per_gb_hour": 0.000111,  # $0.10/GB/month
}

LLM_COSTS = {
    "gpt-4.1-nano": {
        "input": 0.00000025,  # $0.25/1M tokens
        "output": 0.000002,  # $2.00/1M tokens
    },
    "claude-3.5-haiku": {
        "input": 0.00000025,  # $0.25/1M tokens
        "output": 0.00000125,  # $1.25/1M tokens
    },
    "deepseek-v3.2": {
        "input": 0.000000028,  # $0.028/1M tokens
        "output": 0.0000001,  # $0.10/1M tokens
    },
}

# =============================================================================
# BOOMER_ANG SPECIALIST CONFIGURATIONS
# =============================================================================

BOOMER_ANG_CONFIGS = {
    "code_ang": {
        "name": "Code_Ang",
        "role": "Software Development",
        "preferred_models": ["gpt-4.1-nano", "claude-3.5-haiku"],
        "tools": ["git", "docker", "fastapi", "nextjs"],
        "max_tokens": 16000,
    },
    "scout_ang": {
        "name": "Scout_Ang",
        "role": "Research & Intelligence",
        "preferred_models": ["gpt-4.1-nano"],
        "tools": ["tavily", "serpapi", "ii-researcher"],
        "max_tokens": 8000,
    },
    "paint_ang": {
        "name": "Paint_Ang",
        "role": "Visual Design",
        "preferred_models": ["flux-schnell", "stable-diffusion-xl"],
        "tools": ["superdesign-api", "figma-api"],
        "max_tokens": 4000,
    },
    "crunch_ang": {
        "name": "Crunch_Ang",
        "role": "Data Processing",
        "preferred_models": ["gpt-4.1-nano"],
        "tools": ["polars", "pandas", "duckdb"],
        "max_tokens": 8000,
    },
    "guard_ang": {
        "name": "Guard_Ang",
        "role": "Security & Compliance",
        "preferred_models": ["gpt-4.1-nano"],
        "tools": ["snyk", "owasp", "trivy"],
        "max_tokens": 8000,
    },
}

# =============================================================================
# CHARTER-LEDGER SEPARATION RULES
# =============================================================================

# Fields that MUST BE BLOCKED from Charter logs (customer-facing)
CHARTER_BLOCKED_FIELDS = {
    "internal_cost",
    "gpu_cost",
    "llm_cost",
    "total_cost",
    "margin",
    "markup",
    "provider",
    "cost_basis",
    "llm_model",
    "model_name",
    "token_count",
    "internal_rate",
}

# Fields that ARE ALLOWED in Charter logs (customer-facing)
CHARTER_ALLOWED_FIELDS = {
    "event",
    "status",
    "execution_time",
    "boomer_ang_id",
    "task_type",
    "result_summary",
    "quality_score",
    "vibe_score",
}

def sanitize_for_charter(data: dict) -> dict:
    """
    Remove internal cost fields from data before logging to Charter.
    
    This enforces Charter-Ledger separation at the application level.
    """
    sanitized = {}
    for key, value in data.items():
        if key not in CHARTER_BLOCKED_FIELDS:
            sanitized[key] = value
    return sanitized

# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "app",
    "gpu_image",
    "REQUIRED_SECRETS",
    "GPU_CONFIG",
    "INTERNAL_COSTS",
    "LLM_COSTS",
    "BOOMER_ANG_CONFIGS",
    "CHARTER_BLOCKED_FIELDS",
    "CHARTER_ALLOWED_FIELDS",
    "sanitize_for_charter",
]
