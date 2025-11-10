"""
Boomer_Ang Task Executor - Modal GPU Worker

This module executes Boomer_Ang specialist tasks on A10G GPUs with
Charter-Ledger separation and comprehensive cost tracking.

Security Tier: Enhanced (≥90% V.I.B.E. score)
"""

import traceback
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
import modal

from modal_config import (
    app,
    gpu_image,
    REQUIRED_SECRETS,
    GPU_CONFIG,
    BOOMER_ANG_CONFIGS,
)
from charter_ledger import (
    log_to_charter,
    log_to_ledger,
    log_dual,
    calculate_gpu_cost,
    calculate_llm_cost,
    update_engagement_status,
)

# =============================================================================
# MODAL FUNCTION - BOOMER_ANG TASK EXECUTOR
# =============================================================================

@app.function(
    image=gpu_image,
    gpu=GPU_CONFIG["gpu"],
    cpu=GPU_CONFIG["cpu"],
    memory=GPU_CONFIG["memory"],
    timeout=GPU_CONFIG["timeout"],
    secrets=REQUIRED_SECRETS,
    container_idle_timeout=GPU_CONFIG.get("container_idle_timeout", 300),
)
async def execute_boomer_ang_task(
    engagement_id: str,
    boomer_ang_id: str,
    task_type: str,
    task_payload: Dict[str, Any],
    webhook_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Execute Boomer_Ang task on A10G GPU.
    
    Task Types:
        - code_generation: Generate code with Code_Ang
        - research: Conduct research with Scout_Ang
        - design: Create visuals with Paint_Ang
        - data_analysis: Analyze data with Crunch_Ang
        - security_audit: Security scan with Guard_Ang
    
    Args:
        engagement_id: Unique engagement identifier
        boomer_ang_id: Boomer_Ang specialist identifier
        task_type: Type of task to execute
        task_payload: Task-specific parameters
        webhook_url: Optional webhook URL for completion notification
    
    Returns:
        Dict with status, result, and execution metrics
    """
    
    start_time = datetime.utcnow()
    
    try:
        # Log task start to Ledger (internal)
        await log_to_ledger(engagement_id, "gpu_task_started", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "gpu_type": GPU_CONFIG["gpu"],
            "cpu_cores": GPU_CONFIG["cpu"],
            "memory_mb": GPU_CONFIG["memory"],
            "start_time": start_time.isoformat(),
        })
        
        # Log task start to Charter (customer-facing - no GPU details)
        await log_to_charter(engagement_id, "task_started", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "processing",
        })
        
        # Update engagement status
        await update_engagement_status(engagement_id, "task_running")
        
        # Execute task based on type
        result = await _execute_by_type(
            boomer_ang_id=boomer_ang_id,
            task_type=task_type,
            task_payload=task_payload,
        )
        
        # Calculate execution time and costs
        end_time = datetime.utcnow()
        execution_seconds = (end_time - start_time).total_seconds()
        
        # Calculate GPU cost (INTERNAL ONLY)
        gpu_cost = calculate_gpu_cost(execution_seconds, GPU_CONFIG["gpu"])
        
        # Calculate LLM cost if available (INTERNAL ONLY)
        llm_cost = 0.0
        if "llm_usage" in result:
            llm_cost = calculate_llm_cost(
                model=result["llm_usage"].get("model", "unknown"),
                input_tokens=result["llm_usage"].get("input_tokens", 0),
                output_tokens=result["llm_usage"].get("output_tokens", 0),
            )
        
        total_cost = gpu_cost + llm_cost
        
        # Dual logging: Charter (customer) + Ledger (internal)
        charter_metadata = {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "success",
            "execution_time": f"{execution_seconds:.2f}s",
            "result_summary": result.get("summary", "Task completed successfully"),
        }
        
        ledger_metadata = {
            **charter_metadata,
            "gpu_cost": round(gpu_cost, 6),
            "llm_cost": round(llm_cost, 6),
            "total_cost": round(total_cost, 6),
            "gpu_type": GPU_CONFIG["gpu"],
            "cpu_cores": GPU_CONFIG["cpu"],
            "memory_mb": GPU_CONFIG["memory"],
            "llm_model": result.get("llm_usage", {}).get("model", "N/A"),
            "input_tokens": result.get("llm_usage", {}).get("input_tokens", 0),
            "output_tokens": result.get("llm_usage", {}).get("output_tokens", 0),
        }
        
        await log_dual(
            engagement_id=engagement_id,
            event="task_completed",
            charter_metadata=charter_metadata,
            ledger_metadata=ledger_metadata,
        )
        
        # Update engagement status
        await update_engagement_status(engagement_id, "task_completed", {
            "execution_time": execution_seconds,
        })
        
        # Send webhook if URL provided
        if webhook_url:
            await _send_webhook(webhook_url, {
                "engagement_id": engagement_id,
                "boomer_ang_id": boomer_ang_id,
                "status": "completed",
                "execution_time": execution_seconds,
                "result": result,
            })
        
        return {
            "status": "success",
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "execution_time": execution_seconds,
            "result": result,
        }
        
    except Exception as e:
        # Calculate execution time for failed task
        end_time = datetime.utcnow()
        execution_seconds = (end_time - start_time).total_seconds()
        
        error_message = str(e)
        error_trace = traceback.format_exc()
        
        # Log failure to Charter (customer-facing - minimal details)
        await log_to_charter(engagement_id, "task_failed", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "failed",
            "error": error_message,
        })
        
        # Log failure to Ledger (internal - full details)
        await log_to_ledger(engagement_id, "task_failed", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "failed",
            "error": error_message,
            "traceback": error_trace,
            "execution_time": execution_seconds,
            "gpu_type": GPU_CONFIG["gpu"],
        })
        
        # Update engagement status
        await update_engagement_status(engagement_id, "task_failed", {
            "error": error_message,
        })
        
        # Send webhook for failure if URL provided
        if webhook_url:
            await _send_webhook(webhook_url, {
                "engagement_id": engagement_id,
                "boomer_ang_id": boomer_ang_id,
                "status": "failed",
                "error": error_message,
            })
        
        raise

# =============================================================================
# TASK TYPE EXECUTION ROUTER
# =============================================================================

async def _execute_by_type(
    boomer_ang_id: str,
    task_type: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Route task to appropriate execution handler based on type.
    """
    
    if task_type == "code_generation":
        return await _execute_code_generation(boomer_ang_id, task_payload)
    
    elif task_type == "research":
        return await _execute_research(boomer_ang_id, task_payload)
    
    elif task_type == "design":
        return await _execute_design(boomer_ang_id, task_payload)
    
    elif task_type == "data_analysis":
        return await _execute_data_analysis(boomer_ang_id, task_payload)
    
    elif task_type == "security_audit":
        return await _execute_security_audit(boomer_ang_id, task_payload)
    
    else:
        raise ValueError(f"Unknown task type: {task_type}")

# =============================================================================
# TASK TYPE HANDLERS
# =============================================================================

async def _execute_code_generation(
    boomer_ang_id: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute code generation task with Code_Ang.
    """
    import os
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY"),
    )
    
    prompt = task_payload.get("prompt", "")
    language = task_payload.get("language", "python")
    
    response = await client.chat.completions.create(
        model="anthropic/claude-3.5-haiku",  # Using Haiku for cost efficiency
        messages=[
            {
                "role": "system",
                "content": f"You are Code_Ang, an expert {language} developer. Generate clean, production-ready code."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        max_tokens=4000,
    )
    
    code = response.choices[0].message.content
    
    return {
        "summary": f"Generated {language} code successfully",
        "code": code,
        "language": language,
        "llm_usage": {
            "model": "claude-3.5-haiku",
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
        }
    }

async def _execute_research(
    boomer_ang_id: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute research task with Scout_Ang.
    """
    import os
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY"),
    )
    
    query = task_payload.get("query", "")
    
    response = await client.chat.completions.create(
        model="openai/gpt-4.1-nano",  # GPT-4.1 nano for research
        messages=[
            {
                "role": "system",
                "content": "You are Scout_Ang, an expert researcher. Provide comprehensive, accurate research."
            },
            {
                "role": "user",
                "content": f"Research: {query}",
            }
        ],
        max_tokens=2000,
    )
    
    research = response.choices[0].message.content
    
    return {
        "summary": "Research completed successfully",
        "findings": research,
        "query": query,
        "llm_usage": {
            "model": "gpt-4.1-nano",
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
        }
    }

async def _execute_design(
    boomer_ang_id: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute design task with Paint_Ang.
    """
    # Placeholder for image generation
    # In production, integrate with SuperDesign API or Stable Diffusion
    
    description = task_payload.get("description", "")
    
    return {
        "summary": "Design task queued (image generation not yet implemented)",
        "description": description,
        "status": "placeholder",
        "llm_usage": {
            "model": "N/A",
            "input_tokens": 0,
            "output_tokens": 0,
        }
    }

async def _execute_data_analysis(
    boomer_ang_id: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute data analysis task with Crunch_Ang.
    """
    # Placeholder for data processing
    # In production, use Polars/Pandas for data analysis
    
    dataset = task_payload.get("dataset", [])
    analysis_type = task_payload.get("analysis_type", "summary")
    
    return {
        "summary": "Data analysis task queued (not yet implemented)",
        "analysis_type": analysis_type,
        "dataset_size": len(dataset),
        "status": "placeholder",
        "llm_usage": {
            "model": "N/A",
            "input_tokens": 0,
            "output_tokens": 0,
        }
    }

async def _execute_security_audit(
    boomer_ang_id: str,
    task_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute security audit task with Guard_Ang.
    """
    # Placeholder for security scanning
    # In production, integrate with Snyk/OWASP tools
    
    target = task_payload.get("target", "")
    
    return {
        "summary": "Security audit task queued (not yet implemented)",
        "target": target,
        "status": "placeholder",
        "llm_usage": {
            "model": "N/A",
            "input_tokens": 0,
            "output_tokens": 0,
        }
    }

# =============================================================================
# WEBHOOK DELIVERY
# =============================================================================

async def _send_webhook(
    webhook_url: str,
    payload: Dict[str, Any],
) -> None:
    """
    Send webhook notification to ACHEEVY Orchestrator.
    """
    import os
    
    webhook_secret = os.environ.get("WEBHOOK_SECRET", "")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Webhook-Secret": webhook_secret,
                },
                timeout=30.0,
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Webhook delivery failed: {e}")
            # Don't raise - webhook failure shouldn't fail the task

# =============================================================================
# LOCAL ENTRY POINT (for testing)
# =============================================================================

@app.local_entrypoint()
def main():
    """
    Local entry point for testing Modal functions.
    
    Usage:
        modal run boomer_ang_executor.py
    """
    
    # Test execution
    result = execute_boomer_ang_task.remote(
        engagement_id="test-eng-001",
        boomer_ang_id="code_ang_001",
        task_type="code_generation",
        task_payload={
            "prompt": "Create a FastAPI health check endpoint",
            "language": "python",
        },
    )
    
    print("Test execution result:")
    print(result)
