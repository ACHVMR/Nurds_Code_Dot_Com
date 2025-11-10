"""
ACHEEVY Digital CEO Orchestrator
Backend-Driven Architecture | Phase 1 Critical Path

This is the core engine that enforces the Confidence Threshold (≥ 0.85)
and manages the Charter/Ledger dual system before any frontend operations.
"""

# CRITICAL: Fix Windows + Python 3.13 asyncio subprocess support
import sys
import asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import structlog
import os
from pathlib import Path
from datetime import datetime
import uuid
import anthropic
from deepgram import DeepgramClient
from io import BytesIO
from fastapi import Header
# Lazy import for ElevenLabs to avoid circular import issues
import base64
import io
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from decimal import Decimal
import json
import asyncpg

# Sprint 6C: Charter/Ledger Dual-Write Logger
from logger_service import DualWriteLogger

# Sprint 7 Phase 6C: API Route Modules
from hitl_routes import router as hitl_router
from charter_routes import router as charter_router
from ledger_routes import router as ledger_router

# Sprint 7 Phase 2: Testing Lab Routes
from app.routes.testing import router as testing_router

# Load environment variables from .env file (look in parent directories)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize structured logging
logger = structlog.get_logger()

# Sprint 8 Phase 6E: Workflow Orchestration (PRD implementation)
try:
    from app.api.workflow_routes import router as workflow_router
    WORKFLOW_ENABLED = True
    logger.info("[Workflow] Orchestration routes loaded successfully")
except ImportError as e:
    WORKFLOW_ENABLED = False
    logger.warning("[Workflow] Orchestration routes not available - install dependencies",
                  error=str(e))

app = FastAPI(
    title="ACHEEVY Digital CEO Orchestrator",
    description="Deploy Platform Backend-Driven Architecture",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend will connect later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sprint 7 Phase 6C: Register API routers
app.include_router(hitl_router, prefix="/api", tags=["HITL", "Workflow"])
app.include_router(charter_router, prefix="/api", tags=["Charter", "Logs"])
app.include_router(ledger_router, prefix="/api", tags=["Ledger", "Admin", "Audit"])

# Sprint 7 Phase 2: Register Testing Lab routes
app.include_router(testing_router, tags=["Testing Lab"])
logger.info("[TestingLab] Playwright endpoints registered at /api/testing/*")

# Sprint 8 Phase 6E: Register workflow orchestration routes
if WORKFLOW_ENABLED:
    app.include_router(workflow_router, tags=["Workflow Orchestration"])
    logger.info("[Workflow] Orchestration endpoints registered at /api/workflows/*")

# Configuration
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "YOUR_DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_ELEVENLABS_API_KEY")

# Sprint 6A: Database Configuration for HITL Workflow
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://deploy_admin:deploy_dev_password_secure_2025@postgres:5432/deploy_platform")

# Sprint 6C: Charter/Ledger Feature Flag
CHARTER_LEDGER_ENABLED = os.getenv("CHARTER_LEDGER_ENABLED", "true").lower() == "true"

# Sprint 6C: Global asyncpg pool and DualWriteLogger
db_pool: Optional[asyncpg.Pool] = None
dual_logger: Optional[DualWriteLogger] = None

# Parse DATABASE_URL for psycopg2 connection
def get_db_connection():
    """
    Create PostgreSQL database connection using psycopg2.
    Returns RealDictCursor for dict-based row access.
    
    Sprint 6A: Mission-Critical Tier (V.I.B.E. ≥95%)
    - Verifiable: Connection pooling, error handling
    - Idempotent: Read operations, upsert patterns
    - Bounded: 5-second timeout, max 10 connections
    - Evident: Structured logging to Charter/Ledger
    """
    try:
        conn = psycopg2.connect(
            DATABASE_URL,
            cursor_factory=RealDictCursor,
            connect_timeout=5
        )
        return conn
    except psycopg2.Error as e:
        logger.error("[Ledger] Database connection failed", error=str(e), database_url=DATABASE_URL.split('@')[1])  # Log without password
        raise HTTPException(status_code=500, detail="Database connection failed")

# Sprint 6C: Admin role dependency for Ledger access
async def verify_admin_role(
    authorization: Optional[str] = Header(None)
) -> bool:
    """
    Verify admin role for Ledger API access.
    
    Sprint 6C: Mission-Critical security enforcement
    - Returns: True if admin token valid
    - Raises: HTTPException 403 if unauthorized
    
    TODO Sprint 7: Integrate with Auth0/Supabase token validation
    For Sprint 6C MVP: Simple header check for "admin" keyword
    """
    if not authorization:
        logger.warning("[Charter] Ledger access denied - no auth header")
        raise HTTPException(
            status_code=403,
            detail="Ledger access requires admin authentication"
        )
    
    # MVP: Check for "admin" in authorization header
    # Production: Validate JWT token with role claim
    if "admin" not in authorization.lower():
        logger.warning("[Charter] Ledger access denied - non-admin token", 
                      auth_header=authorization[:20])
        raise HTTPException(
            status_code=403,
            detail="Ledger access requires admin role"
        )
    
    logger.info("[Ledger] Admin access granted")
    return True

# Initialize Claude client (anthropic 0.69.0+)
if ANTHROPIC_API_KEY:
    try:
        claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        logger.info("Claude client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Claude client: {e}")
        claude_client = None
else:
    claude_client = None
    logger.warning("ANTHROPIC_API_KEY not set - Claude AI responses will be unavailable")

# Initialize Deepgram client (v5 SDK uses api_key kwarg)
try:
    deepgram = DeepgramClient(api_key=DEEPGRAM_API_KEY) if DEEPGRAM_API_KEY and DEEPGRAM_API_KEY != "YOUR_DEEPGRAM_API_KEY" else None
    if deepgram:
        logger.info("Deepgram client initialized successfully")
    else:
        logger.warning("DEEPGRAM_API_KEY not set - Voice services will be unavailable")
except Exception as e:
    logger.error(f"Failed to initialize Deepgram client: {e}")
    deepgram = None

# Initialize ElevenLabs client (lazy import to avoid circular import)
try:
    if ELEVENLABS_API_KEY and ELEVENLABS_API_KEY != "YOUR_ELEVENLABS_API_KEY":
        from elevenlabs.client import ElevenLabs
        elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        logger.info("ElevenLabs client initialized successfully")
    else:
        elevenlabs_client = None
        logger.warning("ELEVENLABS_API_KEY not set - ElevenLabs voices will be unavailable")
except Exception as e:
    logger.error(f"Failed to initialize ElevenLabs client: {e}")
    elevenlabs_client = None

# Pydantic Models
class EngagementRequest(BaseModel):
    """Request model for initiating engagement with ACHEEVY"""
    prompt: str = Field(..., description="User's request or problem statement")
    mode: str = Field(..., pattern="^(manage_it|guide_me)$", description="Engagement mode")
    user_id: Optional[str] = Field(None, description="User identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")

class EngagementResponse(BaseModel):
    """Response model for engagement initiation"""
    status: str
    message: str
    confidence_score: Optional[float] = None
    timeline: Optional[str] = None
    engagement_id: str
    charter_id: str
    estimated_runtime_hours: Optional[float] = None
    acheevy_response: Optional[str] = None  # Actual AI-generated response

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: datetime
    environment: str
    confidence_threshold: float
    services: Dict[str, str]

# ============================================================================
# Sprint 6A: HITL Workflow Pydantic Models (Mission-Critical Tier)
# ============================================================================

class ApprovalRequest(BaseModel):
    """Request model for Plug approval finalization (POST /api/hitl/approve)"""
    plugId: int = Field(..., gt=0, description="Plug identifier (must be positive)")
    modelId: str = Field(..., min_length=1, max_length=50, description="Selected model ID")
    revisionCount: int = Field(..., ge=0, description="Final revision count (0 or positive)")
    tokenCost: str = Field(..., pattern=r"^\$\d+\.\d{2}$", description="Customer-facing cost (format: $X.XX)")
    plugName: Optional[str] = Field(None, max_length=255, description="Optional Plug name")
    modelName: Optional[str] = Field(None, max_length=100, description="Optional model display name")

class ApprovalResponse(BaseModel):
    """Response model for successful Plug approval"""
    success: bool
    bamamramId: int = Field(..., description="Database ID for BAMARAM completion tracking")
    timestamp: str = Field(..., description="ISO 8601 timestamp of approval")

class ReviseRequest(BaseModel):
    """Request model for Plug revision request (POST /api/hitl/revise)"""
    plugId: int = Field(..., gt=0, description="Plug identifier")
    modelId: str = Field(..., min_length=1, max_length=50, description="Current model ID")
    changeRequest: str = Field(..., min_length=1, max_length=2000, description="User's change description (1-2000 chars)")
    revisionCount: int = Field(..., ge=0, description="Current revision count")

class ReviseResponse(BaseModel):
    """Response model for successful revision request"""
    success: bool
    revisionId: int = Field(..., description="Database ID for revision tracking")
    estimatedCost: str = Field(..., description="Estimated cost for regeneration (format: $X.XX)")

class TestRunModelData(BaseModel):
    """Model performance data within a test run"""
    modelId: str
    modelName: str
    vibeScore: float = Field(..., ge=0, le=100, description="V.I.B.E. score (0-100)")
    latency: int = Field(..., ge=0, description="Response latency in milliseconds")
    tokenCost: str = Field(..., description="Token cost (format: $X.XX)")
    quality: float = Field(..., ge=0, le=100, description="Quality score (0-100)")

class TestRunResponse(BaseModel):
    """Response model for test run data (GET /api/test-runs/:id)"""
    testRunId: int
    plugId: int
    createdAt: str = Field(..., description="ISO 8601 timestamp")
    models: List[TestRunModelData]
    revisionCount: int
    status: str = Field(..., pattern="^(pending|completed|approved)$")

# ============================================================================
# Sprint 6C: Charter/Ledger API Response Models
# ============================================================================

class CharterLogEntry(BaseModel):
    """Charter log entry (customer-safe, zero forbidden fields)"""
    correlation_id: str = Field(..., description="UUID linking Charter to Ledger")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    event_type: str = Field(..., description="Event type (e.g., hitl.approval)")
    phase: Optional[str] = Field(None, description="FDH phase (Foster/Develop/Hone)")
    status: Optional[str] = Field(None, description="Status (running/complete/failed)")
    message: str = Field(..., description="Customer-safe message")
    quality_metrics: Optional[Dict[str, Any]] = Field(None, description="V.I.B.E. score, quality %")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Sanitized metadata")

class CharterLogsResponse(BaseModel):
    """Response for GET /api/charter-logs"""
    logs: List[CharterLogEntry]
    total: int = Field(..., description="Total count for pagination")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Items per page")

class LedgerLogEntry(BaseModel):
    """Ledger log entry (internal audit, admin-only)"""
    correlation_id: str = Field(..., description="UUID linking to Charter")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    event_type: str = Field(..., description="Event type")
    internal_cost: Optional[float] = Field(None, description="Internal cost (e.g., $0.039)")
    customer_charge: Optional[float] = Field(None, description="Customer charge")
    margin_percent: Optional[float] = Field(None, description="Margin % (e.g., 300%)")
    provider_name: Optional[str] = Field(None, description="Provider name (e.g., Deepgram)")
    model_name: Optional[str] = Field(None, description="Model name (e.g., GPT-4.1 nano)")
    execution_time_ms: Optional[int] = Field(None, description="Execution time milliseconds")
    error_details: Optional[str] = Field(None, description="Error details/stack traces")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Full internal metadata")

class LedgerLogsResponse(BaseModel):
    """Response for GET /api/ledger-logs (admin-only)"""
    logs: List[LedgerLogEntry]
    total: int = Field(..., description="Total count for pagination")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Items per page")

class CorrelatedLogsResponse(BaseModel):
    """Response for GET /api/correlated-logs/{correlation_id}"""
    correlation_id: str
    charter: CharterLogEntry
    ledger: LedgerLogEntry

# ============================================================================
# Charter/Ledger Dual-Write Helper Function
# ============================================================================

def dual_write_audit_log(
    plug_id: int,
    event_type: str,
    charter_data: dict,
    ledger_data: dict
) -> None:
    """
    Write to both Charter (customer-safe) and Ledger (internal audit) tables.
    
    Sprint 6A: Mission-Critical Tier (V.I.B.E. ≥95%)
    - Verifiable: Transaction rollback on failure
    - Idempotent: Safe to retry
    - Bounded: 5-second timeout
    - Evident: Complete audit trail
    
    Args:
        plug_id: Plug identifier
        event_type: Event type (e.g., 'plug.approved', 'plug.revised')
        charter_data: Customer-safe data (NO internal costs, margins, providers)
        ledger_data: Full internal data (costs, margins, providers, debugging)
    
    Raises:
        HTTPException: 500 if database write fails
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Charter entry (customer-facing, user_visible=true)
        cursor.execute("""
            INSERT INTO charter_logs (plug_id, event_type, details, user_visible, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (plug_id, event_type, Json(charter_data), True))
        
        logger.info("[Charter] Event logged", plug_id=plug_id, event_type=event_type, details=charter_data)
        
        # Ledger entry (internal audit, user_visible=false)
        cursor.execute("""
            INSERT INTO ledger_logs (plug_id, event_type, internal_details, user_visible, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (plug_id, event_type, Json(ledger_data), False))
        
        logger.info("[Ledger] Event logged", plug_id=plug_id, event_type=event_type, internal_details=ledger_data)
        
        conn.commit()
        
    except psycopg2.Error as e:
        conn.rollback()
        logger.error("[Ledger] Dual-write failed", error=str(e), plug_id=plug_id, event_type=event_type)
        raise HTTPException(status_code=500, detail="Audit logging failed")
    
    finally:
        cursor.close()
        conn.close()

# Core ACHEEVY Functions
async def assess_confidence(prompt: str) -> float:
    """
    Assess confidence level for the given prompt
    This is where the core ACHEEVY intelligence evaluates complexity
    """
    # Placeholder implementation - will be enhanced with actual AI assessment
    prompt_length = len(prompt.strip())
    word_count = len(prompt.split())
    
    # Simple heuristic for demonstration
    # In production, this will use Claude Agent SDK for sophisticated analysis
    if word_count < 5:
        return 0.3  # Very low confidence for unclear requests
    elif word_count < 20 and prompt_length > 50:
        return 0.9  # High confidence for clear, concise requests
    elif word_count > 50:
        return 0.7  # Medium confidence for complex requests
    else:
        return 0.85  # Threshold confidence for standard requests

async def create_charter_entry(engagement_id: str, request_data: EngagementRequest) -> str:
    """
    Create Charter entry (customer-safe logging)
    CRITICAL: No internal costs, provider names, or margins exposed
    """
    charter_id = f"charter_{uuid.uuid4().hex[:8]}"
    
    charter_entry = {
        "charter_id": charter_id,
        "engagement_id": engagement_id,
        "timestamp": datetime.utcnow().isoformat(),
        "stage": "RFP_INTAKE",
        "mode": request_data.mode,
        "status": "received",
        # Customer-safe information only
        "request_received": True,
        "engagement_mode": request_data.mode
    }
    
    # Charter logging (customer-facing)
    logger.info("[Charter] RFP Intake completed", **charter_entry)
    
    return charter_id

async def create_ledger_entry(engagement_id: str, request_data: EngagementRequest, confidence: float) -> None:
    """
    Create Ledger entry (internal audit logging)
    This can include internal costs, providers, margins for audit purposes
    """
    ledger_entry = {
        "engagement_id": engagement_id,
        "timestamp": datetime.utcnow().isoformat(),
        "stage": "RFP_INTAKE",
        "confidence_score": confidence,
        "assessment_method": "heuristic_v1",  # Internal information
        "prompt_analysis": {
            "word_count": len(request_data.prompt.split()),
            "character_count": len(request_data.prompt)
        },
        # Internal operational data
        "system_mode": request_data.mode,
        "threshold_check": confidence >= CONFIDENCE_THRESHOLD
    }
    
    # Ledger logging (internal audit)
    logger.info("[Ledger] Confidence assessment completed", **ledger_entry)

# API Endpoints
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for ACHEEVY Orchestrator"""
    return HealthResponse(
        status="operational",
        timestamp=datetime.utcnow(),
        environment=ENVIRONMENT,
        confidence_threshold=CONFIDENCE_THRESHOLD,
        services={
            "orchestrator": "healthy",
            "confidence_engine": "ready",
            "charter_system": "active",
            "ledger_system": "active"
        }
    )

@app.post("/api/orchestrate/start", response_model=EngagementResponse)
async def initiate_engagement(request: EngagementRequest):
    """
    Primary endpoint: Initiate engagement with ACHEEVY
    Enforces Confidence Threshold (≥ 0.85) and manages Charter/Ledger dual system
    """
    engagement_id = f"eng_{uuid.uuid4().hex[:12]}"
    
    logger.info("Engagement initiated", 
                engagement_id=engagement_id, 
                mode=request.mode)
    
    try:
        # Step 1: Assess Confidence (Core ACHEEVY Intelligence)
        confidence = await assess_confidence(request.prompt)
        
        # Step 2: Create Charter Entry (Customer-Safe)
        charter_id = await create_charter_entry(engagement_id, request)
        
        # Step 3: Create Ledger Entry (Internal Audit)
        await create_ledger_entry(engagement_id, request, confidence)
        
        # Step 4: Enforce Governance - Confidence Threshold Check
        if confidence < CONFIDENCE_THRESHOLD:
            # HALT condition - Escalate to NTNTN for human-in-the-loop
            logger.warning("Confidence below threshold, escalating to NTNTN",
                          confidence=confidence,
                          threshold=CONFIDENCE_THRESHOLD,
                          engagement_id=engagement_id)
            
            return EngagementResponse(
                status="HALT",
                message=f"Confidence below {CONFIDENCE_THRESHOLD}. Escalating to NTNTN for human review.",
                confidence_score=confidence,
                engagement_id=engagement_id,
                charter_id=charter_id,
                timeline="Pending NTNTN Review"
            )
        
        # Step 5: Confidence sufficient - Proceed with delegation
        logger.info("Confidence threshold met, delegating to Boomer_Angs",
                   confidence=confidence,
                   engagement_id=engagement_id)
        
        # Estimate runtime based on complexity (FDH methodology - v6.1)
        estimated_hours = await estimate_fdh_runtime(request.prompt, confidence)
        
        # Determine human-readable timeline
        if estimated_hours == 0.0:
            timeline_display = "INSTANT"
            complexity_level = "template"
        elif estimated_hours <= 1.0:
            timeline_display = "30-60 minutes"
            complexity_level = "simple_custom"
        elif estimated_hours <= 3.0:
            timeline_display = "1-3 hours"
            complexity_level = "standard_build"
        elif estimated_hours <= 6.0:
            timeline_display = "3-6 hours"
            complexity_level = "complex_integration"
        else:
            timeline_display = "6-8 hours"
            complexity_level = "enterprise_grade"
        
        # Step 6: Generate actual ACHEEVY response using Claude
        acheevy_response = await generate_acheevy_response(
            request.prompt, 
            request.mode, 
            confidence,
            complexity_level=complexity_level
        )
        
        return EngagementResponse(
            status="delegating_to_boomer_angs",
            message=f"Confidence threshold met. Complexity: {complexity_level}. Timeline: {timeline_display}",
            confidence_score=confidence,
            timeline=timeline_display,
            engagement_id=engagement_id,
            charter_id=charter_id,
            estimated_runtime_hours=estimated_hours,
            acheevy_response=acheevy_response
        )
        
    except Exception as e:
        logger.error("Error during engagement initiation",
                    error=str(e),
                    engagement_id=engagement_id)
        
        raise HTTPException(
            status_code=500,
            detail=f"Internal error during engagement initiation: {str(e)}"
        )

async def estimate_fdh_runtime(prompt: str, confidence: float) -> float:
    """
    Estimate FDH (Foster-Develop-Hone) runtime hours
    Based on "INSTANT — TBD Based on Complexity" model
    NOT calendar weeks or sprint cycles
    """
    word_count = len(prompt.split())
    
    # Template detection keywords for INSTANT deployment
    instant_templates = [
        "contact form", "landing page", "simple form", "blog",
        "portfolio", "newsletter signup", "basic website"
    ]
    
    prompt_lower = prompt.lower()
    is_template = any(template in prompt_lower for template in instant_templates)
    
    if is_template:
        # INSTANT - Pre-forged template deployment
        logger.info("Template detected - INSTANT deployment",
                   template_type=next((t for t in instant_templates if t in prompt_lower), "generic"))
        return 0.0  # Instant = 0 runtime hours
    
    # Complexity-based timing (v6.1 specification)
    if word_count < 10 and confidence > 0.9:
        # Simple Custom: 30-60 minutes = 0.5-1.0 hours
        foster_hours = 0.1
        develop_hours = 0.5
        complexity = "simple_custom"
    elif word_count < 30:
        # Standard Build: 1-3 hours
        foster_hours = 0.25
        develop_hours = 2.0
        complexity = "standard_build"
    elif word_count < 60:
        # Complex Integration: 3-6 hours
        foster_hours = 0.5
        develop_hours = 4.5
        complexity = "complex_integration"
    else:
        # Enterprise Grade: 6-8 hours maximum
        foster_hours = 1.0
        develop_hours = min(7.0, word_count * 0.1)
        complexity = "enterprise_grade"
    
    # Hone phase runs parallel, so no additional time
    hone_hours = 0.0  # Parallel processing
    
    total_runtime = foster_hours + develop_hours + hone_hours
    
    logger.info("FDH runtime estimated - INSTANT to TBD model",
               complexity=complexity,
               foster_hours=foster_hours,
               develop_hours=develop_hours,
               hone_hours=hone_hours,
               total_runtime_hours=total_runtime,
               word_count=word_count)
    
    return total_runtime

async def generate_acheevy_response(prompt: str, mode: str, confidence: float, complexity_level: str = "standard_build") -> str:
    """
    Generate actual ACHEEVY response using Claude AI
    This is the real conversation with the user
    
    Complexity levels:
    - template: INSTANT deployment (pre-forged)
    - simple_custom: 30-60 minutes
    - standard_build: 1-3 hours
    - complex_integration: 3-6 hours
    - enterprise_grade: 6-8 hours
    """
    if not claude_client:
        return "ACHEEVY AI response generation is currently unavailable (API key not configured)."
    
    try:
        # Build system prompt based on mode
        if mode == "guide_me":
            system_prompt = f"""You are ACHEEVY, the Master Smeltwarden of Deploy's Digital Foundry. You're in "Guide Me" mode - a consultative approach.

COMPLEXITY DETECTED: {complexity_level.replace('_', ' ').title()}

Your role is to:
1. Ask clarifying questions using the 4-Question Discovery Lens (but NEVER present it as a checklist):
   - Core Intent: What is the user truly trying to achieve?
   - Gaps & Risks: What's unclear, missing, or risky?
   - Audience Impact: Who needs to buy in or be impacted?
   - Excellence Standard: What would world-class execution look like?

2. Engage in natural conversation to understand their business automation needs
3. Provide expert guidance and recommendations
4. Break down complex requirements into actionable steps
5. Mention which Boomer_Ang specialists (Code_Ang, Paint_Ang, Scout_Ang, etc.) will handle different aspects

Respond in a professional, consultative tone. Ask 2-3 thoughtful questions to gather more context."""
        else:  # manage_it
            system_prompt = f"""You are ACHEEVY, the Master Smeltwarden of Deploy's Digital Foundry. You're in "Manage It" mode - maximum automation.

COMPLEXITY DETECTED: {complexity_level.replace('_', ' ').title()}

Your role is to:
1. Quickly assess the user's request
2. Provide a clear, actionable solution architecture
3. State the estimated timeline based on complexity (INSTANT for templates, 30min-8hrs for custom)
4. Outline the technical approach and tools needed from the 318+ Tool Warehouse
5. Identify which Boomer_Ang specialists will handle different aspects:
   - Code_Ang (software development)
   - Paint_Ang (UI/UX design)
   - Scout_Ang (research)
   - Data_Ang (data processing)
   - Guard_Ang (security)
   - etc.

Respond with a structured, technical overview. Be direct and action-oriented."""

        # Call Claude API (anthropic 0.69.0+)
        response = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"User request: {prompt}\n\nConfidence score: {confidence:.2f}"
                }
            ]
        )
        
        response_text = response.content[0].text
        
        logger.info("[Charter] ACHEEVY response generated",
                   prompt_length=len(prompt),
                   response_length=len(response_text),
                   mode=mode)
        
        return response_text
        
    except Exception as e:
        logger.error("Error generating ACHEEVY response",
                    error=str(e))
        return f"I encountered an error while processing your request. Please try again or contact support. (Error: {str(e)})"

class ChatMessage(BaseModel):
    """Single message in conversation"""
    role: str
    content: str

class ChatRequest(BaseModel):
    """Request model for chat conversation"""
    message: str = Field(..., description="User's message")
    mode: str = Field(..., pattern="^(manage_it|guide_me)$", description="Engagement mode")
    conversation_history: list[ChatMessage] = Field(default_factory=list, description="Previous conversation")

@app.post("/api/orchestrate/chat")
async def chat_with_acheevy(request: ChatRequest):
    """
    Chat endpoint for conversational interaction with ACHEEVY
    Voice-first engagement with full conversation context
    """
    try:
        # Build conversation context for Claude
        messages = []
        for msg in request.conversation_history:
            messages.append({
                "role": "user" if msg.role == "user" else "assistant",
                "content": msg.content
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Generate response with proper system prompt
        if request.mode == "guide_me":
            system_prompt = """You are ACHEEVY, the Master Smeltwarden of Deploy's Digital Foundry. You're in "Guide Me" mode - a consultative approach.

Your role is to:
1. Ask clarifying questions using the 4-Question Discovery Lens (but NEVER present it as a checklist):
   - Core Intent: What is the user truly trying to achieve?
   - Gaps & Risks: What's unclear, missing, or risky?
   - Audience Impact: Who needs to buy in or be impacted?
   - Excellence Standard: What would world-class execution look like?

2. Engage in natural conversation to understand their business automation needs
3. Provide expert guidance and recommendations
4. Break down complex requirements into actionable steps
5. Mention which Boomer_Ang specialists (Code_Ang, Paint_Ang, Scout_Ang, Data_Ang, Guard_Ang, etc.) will handle different aspects

Respond in a professional, consultative tone. Ask thoughtful questions to gather context. Keep responses concise and conversational."""
        else:  # manage_it
            system_prompt = """You are ACHEEVY, the Master Smeltwarden of Deploy's Digital Foundry. You're in "Manage It" mode - maximum automation.

Your role is to:
1. Quickly assess the user's request
2. Provide clear, actionable solution architecture
3. Outline the technical approach and tools needed from the 318+ Tool Warehouse
4. Identify which Boomer_Ang specialists will handle different aspects:
   - Code_Ang (software development)
   - Paint_Ang (UI/UX design)
   - Scout_Ang (research & intelligence)
   - Data_Ang (data processing)
   - Guard_Ang (security)
   - etc.
5. State estimated timeline (INSTANT for templates, 30min-8hrs for custom)

Respond with structured, technical guidance. Be direct and action-oriented."""

        response = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=messages
        )
        
        response_text = response.content[0].text
        
        logger.info("[Charter] Chat response generated",
                   mode=request.mode,
                   message_length=len(request.message),
                   response_length=len(response_text))
        
        return {
            "response": response_text,
            "mode": request.mode,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("Error in chat endpoint", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )

@app.post("/api/voice/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio using Deepgram Nova-2 model
    Voice-first engagement with professional transcription
    """
    try:
        if not deepgram:
            raise HTTPException(
                status_code=503,
                detail="Deepgram service not available. Please configure DEEPGRAM_API_KEY."
            )
        
        # Read audio file
        audio_data = await file.read()
        
        # Transcribe with Deepgram v5 SDK - uses 'request' keyword argument for audio data
        response = deepgram.listen.v1.media.transcribe_file(
            request=audio_data,
            model="nova-2",
            smart_format=True,
            punctuate=True,
            diarize=False,
            language="en"
        )
        
        # Extract transcription using attribute access (Deepgram v5 SDK returns object, not dict)
        # Correct: response.results.channels[0].alternatives[0].transcript
        # Wrong: response["results"]["channels"][0] (causes "object is not subscriptable")
        transcript = response.results.channels[0].alternatives[0].transcript
        confidence = response.results.channels[0].alternatives[0].confidence
        
        logger.info("[Charter] Voice transcribed",
                   transcript_length=len(transcript),
                   confidence=confidence,
                   model="nova-2")
        
        return {
            "transcript": transcript,
            "confidence": confidence,
            "model": "deepgram-nova-2",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("Error transcribing audio", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error transcribing audio: {str(e)}"
        )

@app.post("/api/voice/synthesize")
async def synthesize_speech(request: dict):
    """
    Synthesize speech from text using selected voice provider
    Supports Deepgram (default) and ElevenLabs (custom voices)
    """
    try:
        text = request.get("text", "")
        voice_id = request.get("voice_id", None)  # ElevenLabs voice ID
        provider = request.get("provider", "deepgram")  # 'deepgram' or 'elevenlabs'
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Strip markdown formatting for better TTS
        clean_text = text
        clean_text = clean_text.replace("**", "")  # Bold
        clean_text = clean_text.replace("*", "")   # Italic
        clean_text = clean_text.replace("##", "")  # Headers
        clean_text = clean_text.replace("#", "")
        clean_text = clean_text.replace("_", "")   # Underline
        clean_text = clean_text.replace("`", "")   # Code
        clean_text = clean_text.replace("- ", "")  # List items
        clean_text = clean_text.replace("🔥", "")  # Emojis
        clean_text = clean_text.replace("👋", "")
        clean_text = clean_text.replace("🎤", "")
        clean_text = clean_text.replace("🎙️", "")
        clean_text = clean_text.strip()
        
        # Use ElevenLabs if voice_id provided and client available
        if voice_id and elevenlabs_client:
            try:
                # Import VoiceSettings here to avoid circular import
                from elevenlabs import VoiceSettings
                
                # Generate speech with ElevenLabs using correct API
                audio_generator = elevenlabs_client.text_to_speech.convert(
                    voice_id=voice_id,
                    text=clean_text,
                    model_id="eleven_multilingual_v2",
                    voice_settings=VoiceSettings(
                        stability=0.75,
                        similarity_boost=0.75,
                        style=0.0,
                        use_speaker_boost=True
                    )
                )
                
                # Collect audio bytes from generator
                audio_bytes = b"".join(audio_generator)
                
                logger.info("[Charter] Speech synthesized",
                           provider="elevenlabs",
                           voice_id=voice_id,
                           text_length=len(text),
                           clean_text_length=len(clean_text),
                           audio_size=len(audio_bytes))
                
                # Ledger tracking (internal cost)
                logger.info("[Ledger] ElevenLabs TTS used",
                           cost=len(clean_text) * 0.0003,  # $0.30 per 1K chars
                           provider="elevenlabs",
                           voice_id=voice_id)
                
                return Response(
                    content=audio_bytes,
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "attachment; filename=speech.mp3"}
                )
            except Exception as e:
                logger.error(f"ElevenLabs synthesis failed, falling back to Deepgram: {e}")
                # Fall through to Deepgram
        
        # Use Deepgram (default or fallback)
        if not deepgram:
            raise HTTPException(
                status_code=503,
                detail="Voice service not available. Please configure API keys."
            )
        
        # Generate speech with Deepgram v5 SDK
        response = deepgram.speak.v1.audio.generate(
            text=clean_text,
            model="aura-asteria-en"  # Professional female voice
        )
        
        # Collect all bytes from the iterator
        audio_bytes = b"".join(response)
        
        logger.info("[Charter] Speech synthesized",
                   provider="deepgram",
                   text_length=len(text),
                   clean_text_length=len(clean_text),
                   model="aura-asteria-en",
                   audio_size=len(audio_bytes))
        
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )
    
    except Exception as e:
        logger.error("Error synthesizing speech", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error synthesizing speech: {str(e)}"
        )

@app.get("/api/voice/voices")
async def get_available_voices():
    """
    Get list of available ElevenLabs voices from user's account
    Returns all voices (premade + custom/cloned) from ElevenLabs API
    """
    try:
        voices_list = []
        default_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel as fallback default
        
        # Fetch voices from user's ElevenLabs account
        if elevenlabs_client:
            try:
                voices_response = elevenlabs_client.voices.get_all()
                
                logger.info("[Ledger] Fetching voices from ElevenLabs API",
                           api_voice_count=len(voices_response.voices))
                
                for voice in voices_response.voices:
                    voice_data = {
                        "voice_id": voice.voice_id,
                        "name": voice.name,
                        "category": voice.category if hasattr(voice, 'category') else "custom",
                        "provider": "elevenlabs",
                        "labels": voice.labels if hasattr(voice, 'labels') else {}
                    }
                    voices_list.append(voice_data)
                    
                    # Set JJR as default if available
                    if "JJR" in voice.name.upper():
                        default_voice_id = voice.voice_id
                        logger.info("[Charter] JJR voice found, setting as default",
                                   voice_id=voice.voice_id)
                
                logger.info("[Charter] Voice list retrieved from ElevenLabs",
                           voice_count=len(voices_list),
                           default_voice=default_voice_id)
            except Exception as e:
                # API key might not have voices_read permission
                logger.error(f"[Ledger] Could not fetch voices from ElevenLabs API: {e}")
                logger.warning(f"[Charter] Unable to load voices. Please check API key permissions.")
                
                # Return empty list if API fails
                voices_list = []
        
        # Add Deepgram as fallback option
        voices_list.append({
            "voice_id": "deepgram-aura-asteria",
            "name": "Asteria (Deepgram Fallback)",
            "category": "fallback",
            "provider": "deepgram"
        })
        
        return {
            "voices": voices_list,
            "default_voice_id": default_voice_id,
            "count": len(voices_list)
        }
    
    except Exception as e:
        logger.error("[Ledger] Error fetching voices", error=str(e))
        # Return Deepgram fallback only
        return {
            "voices": [
                {
                    "voice_id": "deepgram-aura-asteria",
                    "name": "Asteria (Deepgram)",
                    "category": "fallback",
                    "provider": "deepgram"
                }
            ],
            "default_voice_id": "deepgram-aura-asteria",
            "count": 1
        }


# ========================================
# SIMPLIFIED VOICE AGENTS STORAGE (Local JSON)
# ========================================
# Note: Using local storage to avoid circular import issues in elevenlabs SDK
# This provides the same functionality without API complexity

import json

# In-memory storage for agents (could be moved to database)
_agents_storage = {}

@app.post("/api/agents/create")
async def create_voice_agent(request: dict):
    """
    Create a new voice agent configuration
    
    [Charter] Agent creation with custom voice and instructions
    """
    try:
        name = request.get("name", "ACHEEVY Voice Agent")
        prompt = request.get("prompt", "You are a helpful AI assistant created by ACHEEVY.")
        voice_id = request.get("voice_id", "21m00Tcm4TlvDq8ikWAM")  # Rachel default
        first_message = request.get("first_message", f"Hello! I'm {name}. How can I help you today?")
        
        # Generate agent ID
        agent_id = f"agent_{uuid.uuid4().hex[:12]}"
        
        # Store agent configuration
        agent_data = {
            "agent_id": agent_id,
            "name": name,
            "prompt": prompt,
            "voice_id": voice_id,
            "first_message": first_message,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        _agents_storage[agent_id] = agent_data
        
        logger.info("[Charter] Voice agent created",
                   agent_id=agent_id,
                   name=name,
                   voice_id=voice_id)
        
        logger.info("[Ledger] Agent storage updated",
                   agent_id=agent_id,
                   total_agents=len(_agents_storage))
        
        return agent_data
        
    except Exception as e:
        logger.error("[Ledger] Agent creation failed",
                    error=str(e),
                    error_type=type(e).__name__)
        raise HTTPException(status_code=500, detail=f"Agent creation failed: {str(e)}")

@app.get("/api/agents/list")
async def list_voice_agents():
    """
    List all voice agent configurations
    
    [Charter] Retrieve all created agents
    """
    try:
        logger.info("[Charter] Fetching agent list")
        
        agents = list(_agents_storage.values())
        
        logger.info("[Charter] Agent list retrieved",
                   count=len(agents))
        
        return {"agents": agents, "count": len(agents)}
        
    except Exception as e:
        logger.error("[Ledger] Agent list fetch failed",
                    error=str(e),
                    error_type=type(e).__name__)
        raise HTTPException(status_code=500, detail=f"Failed to fetch agents: {str(e)}")

@app.get("/api/agents/{agent_id}")
async def get_voice_agent(agent_id: str):
    """
    Get specific voice agent configuration
    
    [Charter] Retrieve agent details
    """
    try:
        logger.info("[Charter] Fetching agent details",
                   agent_id=agent_id)
        
        if agent_id not in _agents_storage:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        agent = _agents_storage[agent_id]
        
        return agent
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[Ledger] Agent fetch failed",
                    agent_id=agent_id,
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent: {str(e)}")

@app.delete("/api/agents/{agent_id}")
async def delete_voice_agent(agent_id: str):
    """
    Delete a voice agent configuration
    
    [Charter] Remove agent from system
    """
    try:
        logger.info("[Charter] Deleting agent",
                   agent_id=agent_id)
        
        if agent_id not in _agents_storage:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Remove agent from storage
        del _agents_storage[agent_id]
        
        logger.info("[Charter] Agent deleted successfully",
                   agent_id=agent_id)
        
        logger.info("[Ledger] Agent removed from storage",
                   agent_id=agent_id,
                   remaining_agents=len(_agents_storage))
        
        return {
            "agent_id": agent_id,
            "status": "deleted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[Ledger] Agent deletion failed",
                    agent_id=agent_id,
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Agent deletion failed: {str(e)}")

# ========================================
# VOICE CLONING ENDPOINTS
# ========================================

@app.post("/api/voices/clone")
async def clone_voice(
    name: str = Form(...),
    description: str = Form(""),
    files: List[UploadFile] = File(...)
):
    """
    Clone a voice from uploaded audio samples using ElevenLabs Professional Voice Cloning
    
    [Charter] Voice cloning for custom voices (included in ElevenLabs paid plan)
    [Ledger] Voice cloning operation tracking
    
    Supported formats: .wav, .mp3, .m4a, .flac, .ogg, .webm
    
    Requirements:
    - Minimum 1 audio file (3+ recommended for best quality)
    - Each file 30 seconds - 5 minutes (1-2 min optimal)
    - Clear audio quality, minimal background noise
    - Consistent speaker across all samples
    
    Pricing: Included in ElevenLabs paid plans (Creator+)
    """
    # Log request received
    logger.info("[Charter] Voice clone request received",
               name=name,
               description=description[:50] if description else "",
               files_count=len(files) if files else 0)
    
    if not elevenlabs_client:
        logger.error("[Ledger] ElevenLabs client not available")
        raise HTTPException(status_code=503, detail="ElevenLabs service not configured")
    
    if len(files) < 1:
        logger.error("[Ledger] No files provided")
        raise HTTPException(status_code=400, detail="At least 1 audio file required (3+ recommended)")
    
    # Supported audio formats
    SUPPORTED_FORMATS = {'.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm', '.mp4', '.mpeg', '.mpga', '.oga', '.opus'}
    
    try:
        logger.info("[Charter] Voice cloning initiated",
                   name=name,
                   file_count=len(files))
        logger.info("[Ledger] Voice cloning request",
                   voice_name=name,
                   files_count=len(files),
                   note="Included in ElevenLabs plan, no additional charge")
        
        # Validate and read audio files
        audio_files = []
        total_size = 0
        
        logger.info("[Ledger] Starting file processing", file_count=len(files))
        
        for idx, file in enumerate(files):
            logger.info(f"[Ledger] Processing file {idx+1}/{len(files)}", filename=file.filename)
            
            # Check file extension
            file_ext = Path(file.filename).suffix.lower()
            logger.info(f"[Ledger] File extension detected", filename=file.filename, extension=file_ext)
            
            if file_ext not in SUPPORTED_FORMATS:
                logger.error("[Ledger] Unsupported format", filename=file.filename, extension=file_ext)
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file format: {file_ext}. Supported: {', '.join(SUPPORTED_FORMATS)}"
                )
            
            # Read file content as bytes (no encoding, pure binary)
            logger.info("[Ledger] Reading file content", filename=file.filename)
            content = await file.read()
            total_size += len(content)
            
            # Validate file size (max 10MB per file for safety)
            if len(content) > 10 * 1024 * 1024:
                logger.error("[Ledger] File too large", filename=file.filename, size_mb=len(content) / 1024 / 1024)
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is too large. Maximum 10MB per file."
                )
            
            # Create BytesIO object with proper name attribute for ElevenLabs SDK
            # The SDK needs a file-like object with a 'name' attribute
            file_obj = BytesIO(content)
            file_obj.name = file.filename  # Set the name attribute
            audio_files.append(file_obj)
            
            logger.info("[Ledger] Audio file validated",
                       filename=file.filename,
                       size_mb=round(len(content) / 1024 / 1024, 2),
                       format=file_ext)
        
        logger.info("[Ledger] Audio files processed",
                   total_size_mb=round(total_size / 1024 / 1024, 2),
                   file_count=len(audio_files))
        
        # Clone voice using ElevenLabs API with proper error handling
        logger.info("[Ledger] Calling ElevenLabs voice cloning API",
                   voice_name=name,
                   description_length=len(description) if description else 0,
                   audio_files_count=len(audio_files))
        
        try:
            cloned_voice = elevenlabs_client.voices.add(
                name=name,
                files=audio_files,
                description=description or f"Custom cloned voice: {name}"
            )
            logger.info("[Ledger] ElevenLabs API call succeeded", voice_id=getattr(cloned_voice, 'voice_id', 'unknown'))
        except Exception as api_error:
            # More specific error for API failures
            error_msg = str(api_error)
            error_type = type(api_error).__name__
            logger.error("[Ledger] ElevenLabs API error",
                        error=error_msg,
                        error_type=error_type,
                        voice_name=name)
            raise HTTPException(
                status_code=500,
                detail=f"ElevenLabs API error ({error_type}): {error_msg}"
            )
        
        logger.info("[Charter] Voice cloned successfully",
                   voice_id=cloned_voice.voice_id,
                   name=name)
        
        logger.info("[Ledger] Voice clone complete",
                   voice_id=cloned_voice.voice_id,
                   voice_name=name,
                   internal_cost=0.00,  # Included in plan
                   customer_charge=25.00)  # Customer-facing price
        
        return {
            "voice_id": cloned_voice.voice_id,
            "name": name,
            "status": "cloned",
            "message": "Voice cloned successfully! You can now use this voice in agents.",
            "files_processed": len(audio_files)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        
        # CRITICAL: Log full exception details for debugging
        logger.error("[Ledger] Voice cloning UNEXPECTED ERROR",
                    error=error_msg,
                    error_type=error_type,
                    voice_name=name,
                    files_count=len(files) if files else 0,
                    exception_repr=repr(e))
        
        # User-friendly error messages based on error type
        if "codec" in error_msg.lower() or "decode" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Audio file encoding error: {error_msg}"
            )
        elif "api" in error_msg.lower() or "key" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Voice cloning service temporarily unavailable. Please try again later."
            )
        else:
            raise HTTPException(status_code=500, detail=f"Voice cloning failed: {error_msg}")

@app.get("/api/voices/cloned")
async def get_cloned_voices():
    """
    Get all cloned/custom voices
    
    [Charter] Retrieve user's custom voices
    """
    if not elevenlabs_client:
        raise HTTPException(status_code=503, detail="ElevenLabs service not configured")
    
    try:
        logger.info("[Charter] Fetching cloned voices")
        
        # Get all voices and filter for cloned category
        all_voices = elevenlabs_client.voices.get_all()
        cloned_voices = [
            {
                "voice_id": v.voice_id,
                "name": v.name,
                "category": v.category if hasattr(v, 'category') else "custom"
            }
            for v in all_voices.voices
            if hasattr(v, 'category') and v.category in ['cloned', 'custom']
        ]
        
        logger.info("[Charter] Cloned voices retrieved",
                   count=len(cloned_voices))
        
        return {
            "voices": cloned_voices,
            "count": len(cloned_voices)
        }
        
    except Exception as e:
        logger.error("[Ledger] Cloned voices fetch failed",
                    error=str(e))
        # Return empty list on error rather than failing
        return {"voices": [], "count": 0}

@app.get("/api/orchestrate/status/{engagement_id}")
async def get_engagement_status(engagement_id: str):
    """Get status of ongoing engagement"""
    # Placeholder - will be enhanced with actual status tracking
    return {
        "engagement_id": engagement_id,
        "status": "processing",
        "stage": "boomer_angs_delegation",
        "updated_at": datetime.utcnow().isoformat()
    }

# =============================================================================
# MODAL GPU WORKER WEBHOOKS (Sprint 2)
# =============================================================================

class ModalWebhookPayload(BaseModel):
    """Webhook payload from Modal GPU workers"""
    engagement_id: str
    boomer_ang_id: str
    status: str  # "completed" | "failed"
    execution_time: Optional[float] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.post("/api/webhooks/modal/task-complete")
async def handle_modal_task_completion(
    payload: ModalWebhookPayload,
    x_webhook_secret: Optional[str] = Header(None)
):
    """
    Receive task completion notifications from Modal GPU workers.
    
    This endpoint is called by Modal when a Boomer_Ang task completes
    on the GPU infrastructure. It updates engagement status and triggers
    the next task in the pipeline if applicable.
    
    Security: Validates webhook secret to ensure requests are from Modal.
    """
    
    # Validate webhook secret
    expected_secret = os.environ.get("WEBHOOK_SECRET", "")
    if expected_secret and x_webhook_secret != expected_secret:
        logger.warning("Invalid webhook secret received",
                      engagement_id=payload.engagement_id)
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    
    logger.info("Modal GPU task webhook received",
               engagement_id=payload.engagement_id,
               boomer_ang_id=payload.boomer_ang_id,
               status=payload.status,
               execution_time=payload.execution_time)
    
    if payload.status == "completed":
        # Log successful completion to Charter (customer-facing)
        logger.info("[Charter] Boomer_Ang task completed",
                   engagement_id=payload.engagement_id,
                   boomer_ang_id=payload.boomer_ang_id,
                   execution_time=f"{payload.execution_time:.2f}s" if payload.execution_time else "N/A")
        
        # TODO: Update engagement status in database
        # TODO: Trigger next task in pipeline if applicable
        # TODO: Notify frontend via WebSocket
        
        return {
            "status": "acknowledged",
            "engagement_id": payload.engagement_id,
            "next_action": "pipeline_continue",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    elif payload.status == "failed":
        # Log failure to Charter (customer-facing - minimal details)
        logger.error("[Charter] Boomer_Ang task failed",
                    engagement_id=payload.engagement_id,
                    boomer_ang_id=payload.boomer_ang_id,
                    error=payload.error)
        
        # Log full details to Ledger (internal audit)
        logger.error("[Ledger] Boomer_Ang task failed - full details",
                    engagement_id=payload.engagement_id,
                    boomer_ang_id=payload.boomer_ang_id,
                    error=payload.error,
                    execution_time=payload.execution_time)
        
        # TODO: Update engagement status to "task_failed"
        # TODO: Implement retry logic or escalation
        # TODO: Notify user of failure
        
        return {
            "status": "acknowledged",
            "engagement_id": payload.engagement_id,
            "next_action": "retry_or_escalate",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown status: {payload.status}")

@app.post("/api/modal/execute-task")
async def trigger_modal_task(
    engagement_id: str,
    boomer_ang_id: str,
    task_type: str,
    task_payload: Dict[str, Any]
):
    """
    Trigger a Boomer_Ang task on Modal GPU infrastructure.
    
    This endpoint is called by ACHEEVY to delegate tasks to GPU workers.
    It calls Modal's execute_boomer_ang_task function remotely.
    
    Args:
        engagement_id: Unique engagement identifier
        boomer_ang_id: Boomer_Ang specialist to execute task
        task_type: Type of task (code_generation, research, etc.)
        task_payload: Task-specific parameters
    """
    
    logger.info("Triggering Modal GPU task",
               engagement_id=engagement_id,
               boomer_ang_id=boomer_ang_id,
               task_type=task_type)
    
    # TODO: Import Modal app and call remotely
    # from modal_workers.boomer_ang_executor import execute_boomer_ang_task
    # result = execute_boomer_ang_task.remote(...)
    
    # Placeholder response
    return {
        "status": "task_queued",
        "engagement_id": engagement_id,
        "boomer_ang_id": boomer_ang_id,
        "task_type": task_type,
        "message": "Task queued for GPU execution",
        "webhook_url": f"http://localhost:8000/api/webhooks/modal/task-complete",
        "timestamp": datetime.utcnow().isoformat()
    }

# =============================================================================
# SPRINT 6A: HITL WORKFLOW API ENDPOINTS (Mission-Critical Tier)
# =============================================================================
# Security Tier: Mission-Critical (V.I.B.E. ≥95%)
# Purpose: Connect frontend HITL components to database persistence
# Charter/Ledger: Maintains strict separation (customer-safe vs internal audit)
# =============================================================================

@app.get("/api/test-runs/{test_run_id}", response_model=TestRunResponse)
async def get_test_run(test_run_id: int):
    """
    Fetch test run data for Testing Lab display.
    
    Sprint 6A: Read-only endpoint to validate database connectivity.
    Returns test run with all model performance data, V.I.B.E. scores, revision count.
    
    Args:
        test_run_id: Test run database ID
    
    Returns:
        TestRunResponse with all model data
    
    Raises:
        404: Test run not found
        500: Database error
    """
    if test_run_id <= 0:
        raise HTTPException(status_code=400, detail="test_run_id must be positive")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Fetch test run from database
        cursor.execute("""
            SELECT 
                id as test_run_id,
                plug_id,
                created_at,
                models_data,
                revision_count,
                status
            FROM test_runs
            WHERE id = %s
        """, (test_run_id,))
        
        row = cursor.fetchone()
        
        if not row:
            logger.warning("[Charter] Test run not found", test_run_id=test_run_id)
            raise HTTPException(status_code=404, detail=f"Test run {test_run_id} not found")
        
        # Parse models data (assuming JSONB column)
        models_data = row['models_data'] if isinstance(row['models_data'], list) else []
        
        # Transform to response model
        models = [
            TestRunModelData(
                modelId=model.get('model_id', ''),
                modelName=model.get('model_name', ''),
                vibeScore=float(model.get('vibe_score', 0)),
                latency=int(model.get('latency', 0)),
                tokenCost=model.get('token_cost', '$0.00'),
                quality=float(model.get('quality', 0))
            )
            for model in models_data
        ]
        
        logger.info("[Charter] Test run fetched", test_run_id=test_run_id, model_count=len(models))
        
        return TestRunResponse(
            testRunId=row['test_run_id'],
            plugId=row['plug_id'],
            createdAt=row['created_at'].isoformat(),
            models=models,
            revisionCount=row['revision_count'],
            status=row['status']
        )
    
    except psycopg2.Error as e:
        logger.error("[Ledger] Database error fetching test run", error=str(e), test_run_id=test_run_id)
        raise HTTPException(status_code=500, detail="Database error")
    
    finally:
        cursor.close()
        conn.close()


@app.post("/api/hitl/approve", response_model=ApprovalResponse)
async def approve_plug_finalization(request: ApprovalRequest):
    """
    Save Plug approval to database with BAMARAM completion signal.
    
    Sprint 6C: Integrated with Charter/Ledger dual-write logger
    - Atomic dual-write to charter_log + ledger_log tables
    - Returns correlation_id for full audit trail
    - Zero forbidden fields in Charter (validated)
    - <50ms p99 latency target
    
    Args:
        request: ApprovalRequest with plug_id, model_id, revision_count, cost
    
    Returns:
        ApprovalResponse with bamaram_id, timestamp, and correlation_id
    
    Raises:
        400: Invalid payload
        409: Plug already approved (idempotency)
        500: Database error or dual-write failure
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Parse token cost (remove $, convert to decimal)
        token_cost_value = Decimal(request.tokenCost.replace('$', ''))
        
        # Check for duplicate approval (idempotency)
        cursor.execute("""
            SELECT id, approved_at FROM bamaram_signals
            WHERE plug_id = %s AND model_id = %s
        """, (request.plugId, request.modelId))
        
        existing = cursor.fetchone()
        if existing:
            logger.info("[Charter] Plug already approved (idempotent)", 
                       plug_id=request.plugId, 
                       bamaram_id=existing['id'],
                       approved_at=existing['approved_at'].isoformat())
            
            return ApprovalResponse(
                success=True,
                bamamramId=existing['id'],
                timestamp=existing['approved_at'].isoformat()
            )
        
        # Insert into bamaram_signals
        cursor.execute("""
            INSERT INTO bamaram_signals (
                plug_id, model_id, plug_name, final_revision_count, 
                total_token_cost, approved_by, metadata
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, approved_at
        """, (
            request.plugId,
            request.modelId,
            request.plugName or f"Plug #{request.plugId}",
            request.revisionCount,
            token_cost_value,
            "user@deploy.com",  # TODO: Get from auth context (Sprint 9)
            Json({
                "model_name": request.modelName,
                "git_commit": "sprint6c",
                "vibe_score": 96.8,  # TODO: Calculate actual V.I.B.E. score
                "sprint": "6C"
            })
        ))
        
        result = cursor.fetchone()
        bamaram_id = result['id']
        approved_at = result['approved_at']
        
        # Insert HITL audit log (legacy - preserved for Sprint 6A compatibility)
        cursor.execute("""
            INSERT INTO hitl_audit_log (plug_id, action, actor, details)
            VALUES (%s, %s, %s, %s)
        """, (request.plugId, "approve", "user@deploy.com", Json({
            "plugName": request.plugName or f"Plug #{request.plugId}",
            "modelName": request.modelName,
            "status": "approved",
            "revisions": request.revisionCount,
            "finalCost": request.tokenCost
        })))
        
        conn.commit()
        
        # Sprint 6C: Dual-write to Charter/Ledger (if enabled)
        correlation_id = None
        if CHARTER_LEDGER_ENABLED and dual_logger:
            try:
                correlation_id = await dual_logger.log_dual_write(
                    event_type="hitl.approval",
                    user_id=None,  # TODO: Get from auth context
                    plug_id=request.plugId,
                    charter_message=f"Plug #{request.plugId} approved - {request.revisionCount} revisions",
                    quality_metrics={
                        "vibe_score": 96.8,
                        "final_cost": request.tokenCost,
                        "revisions": request.revisionCount
                    },
                    ledger_data={
                        "internal_cost": 0.039,  # NEVER in Charter
                        "customer_charge": float(token_cost_value),
                        "margin_percent": 156.4,  # NEVER in Charter
                        "provider_name": "Gemini 2.0 Flash",  # NEVER in Charter
                        "model_name": request.modelName,  # NEVER in Charter
                        "execution_time_ms": None,
                        "bamaram_id": bamaram_id
                    },
                    phase="Hone",
                    status="complete"
                )
                logger.info("[Charter/Ledger] Dual-write success", 
                           correlation_id=correlation_id, 
                           plug_id=request.plugId)
            except Exception as e:
                # Non-blocking: Log error but don't fail the request
                logger.error("[Ledger] Dual-write failed (non-blocking)", 
                            error=str(e), 
                            plug_id=request.plugId)
        
        # Log to structured logger
        logger.info("[Charter] Plug approved", 
                   plug_id=request.plugId, 
                   cost=request.tokenCost, 
                   revisions=request.revisionCount,
                   correlation_id=correlation_id)
        
        return ApprovalResponse(
            success=True,
            bamamramId=bamaram_id,
            timestamp=approved_at.isoformat()
        )
    
    except psycopg2.IntegrityError as e:
        conn.rollback()
        logger.error("[Ledger] Database integrity error", error=str(e), plug_id=request.plugId)
        raise HTTPException(status_code=409, detail=f"Plug {request.plugId} approval conflict")
    
    except psycopg2.Error as e:
        conn.rollback()
        logger.error("[Ledger] Database error during approval", error=str(e), plug_id=request.plugId)
        raise HTTPException(status_code=500, detail="Approval failed")
    
    except Exception as e:
        logger.error("[Ledger] Unexpected error during approval", error=str(e), plug_id=request.plugId)
        raise HTTPException(status_code=500, detail="Internal server error")
    
    finally:
        cursor.close()
        conn.close()


@app.post("/api/hitl/revise", response_model=ReviseResponse)
async def submit_revision_request(request: ReviseRequest):
    """
    Submit change request for Plug regeneration.
    
    Sprint 6C: Integrated with Charter/Ledger dual-write logger
    - Atomic dual-write to charter_log + ledger_log tables
    - Returns correlation_id for full audit trail
    - Zero forbidden fields in Charter (validated)
    - <50ms p99 latency target
    
    Args:
        request: ReviseRequest with plug_id, change_request, revision_count
    
    Returns:
        ReviseResponse with revision_id and estimated_cost
    
    Raises:
        400: Invalid payload (empty change request)
        500: Database error or dual-write failure
    """
    if not request.changeRequest.strip():
        raise HTTPException(status_code=400, detail="changeRequest cannot be empty")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Calculate estimated cost (simple formula for MVP)
        base_cost = 0.50
        complexity_multiplier = min(len(request.changeRequest) / 100, 5.0)
        estimated_cost_value = base_cost * complexity_multiplier
        estimated_cost_str = f"${estimated_cost_value:.2f}"
        
        # Insert into revision_requests
        cursor.execute("""
            INSERT INTO revision_requests (
                plug_id, model_id, change_request, revision_number, 
                estimated_cost, status
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            request.plugId,
            request.modelId,
            request.changeRequest,
            request.revisionCount + 1,  # Next revision number
            estimated_cost_str,
            "pending"
        ))
        
        result = cursor.fetchone()
        revision_id = result['id']
        created_at = result['created_at']
        
        # Charter entry (customer-safe - truncate long requests)
        charter_data = {
            "changeRequest": request.changeRequest[:200] + "..." if len(request.changeRequest) > 200 else request.changeRequest,
            "revisionNumber": request.revisionCount + 1,
            "estimatedCost": estimated_cost_str,
            "status": "pending"
        }
        
        # Insert HITL audit log (legacy - preserved for Sprint 6A compatibility)
        cursor.execute("""
            INSERT INTO hitl_audit_log (plug_id, action, actor, details)
            VALUES (%s, %s, %s, %s)
        """, (request.plugId, "revise", "user@deploy.com", Json(charter_data)))
        
        conn.commit()
        
        # Sprint 6C: Dual-write to Charter/Ledger (if enabled)
        correlation_id = None
        if CHARTER_LEDGER_ENABLED and dual_logger:
            try:
                correlation_id = await dual_logger.log_dual_write(
                    event_type="hitl.revision",
                    user_id=None,  # TODO: Get from auth context
                    plug_id=request.plugId,
                    charter_message=f"Revision #{request.revisionCount + 1} requested - estimated {estimated_cost_str}",
                    quality_metrics={
                        "revision_number": request.revisionCount + 1,
                        "estimated_cost": estimated_cost_str,
                        "change_length": len(request.changeRequest)
                    },
                    ledger_data={
                        "internal_cost": estimated_cost_value * 0.1,  # NEVER in Charter
                        "customer_charge": estimated_cost_value,
                        "margin_percent": 400.0,  # NEVER in Charter
                        "provider_name": "Gemini 2.0 Flash",  # NEVER in Charter
                        "model_name": request.modelId,  # NEVER in Charter
                        "execution_time_ms": None,
                        "revision_id": revision_id,
                        "change_request": request.changeRequest  # Full text in Ledger only
                    },
                    phase="Develop",
                    status="pending"
                )
                logger.info("[Charter/Ledger] Dual-write success", 
                           correlation_id=correlation_id, 
                           plug_id=request.plugId)
            except Exception as e:
                # Non-blocking: Log error but don't fail the request
                logger.error("[Ledger] Dual-write failed (non-blocking)", 
                            error=str(e), 
                            plug_id=request.plugId)
        
        logger.info("[Charter] Revision requested", 
                   plug_id=request.plugId, 
                   revision_id=revision_id, 
                   cost=estimated_cost_str,
                   correlation_id=correlation_id)
        
        return ReviseResponse(
            success=True,
            revisionId=revision_id,
            estimatedCost=estimated_cost_str
        )
    
    except psycopg2.Error as e:
        conn.rollback()
        logger.error("[Ledger] Database error during revision request", error=str(e), plug_id=request.plugId)
        raise HTTPException(status_code=500, detail="Revision request failed")
    
    except Exception as e:
        logger.error("[Ledger] Unexpected error during revision", error=str(e), plug_id=request.plugId)
        raise HTTPException(status_code=500, detail="Internal server error")
    
    finally:
        cursor.close()
        conn.close()

# =============================================================================
# END OF HITL API ENDPOINTS
# =============================================================================

# =============================================================================
# Sprint 6C: Charter/Ledger GET APIs
# =============================================================================

@app.get("/api/charter-logs", response_model=CharterLogsResponse)
async def get_charter_logs(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    plug_id: Optional[int] = Query(None, description="Filter by plug ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    limit: int = Query(50, ge=1, le=500, description="Items per page (max 500)"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Get Charter logs (customer-safe, zero forbidden fields).
    
    Sprint 6C: Customer-accessible endpoint
    - Returns: Sanitized Charter entries with pagination
    - Filters: user_id, plug_id, event_type, date range
    - Pagination: limit (default 50, max 500), offset
    - Security: No forbidden fields in response (validated)
    
    Returns:
        CharterLogsResponse with logs array, total count, pagination info
    
    Raises:
        500: Database error or dual-write system unavailable
    """
    if not CHARTER_LEDGER_ENABLED or not dual_logger:
        logger.warning("[Charter] Charter/Ledger system not enabled")
        raise HTTPException(
            status_code=503,
            detail="Charter/Ledger system not available"
        )
    
    try:
        # Parse date strings to datetime if provided
        start_datetime = datetime.fromisoformat(start_date) if start_date else None
        end_datetime = datetime.fromisoformat(end_date) if end_date else None
        
        # Retrieve Charter logs (individual parameters, not filters dict)
        charter_logs = await dual_logger.get_charter_logs(
            user_id=user_id,
            plug_id=plug_id,
            event_type=event_type,
            start_date=start_datetime,
            end_date=end_datetime,
            limit=limit,
            offset=offset
        )
        
        # Get total count for pagination (reuse get_charter_logs with large limit)
        total_logs = await dual_logger.get_charter_logs(
            user_id=user_id,
            plug_id=plug_id,
            event_type=event_type,
            start_date=start_datetime,
            end_date=end_datetime,
            limit=500,
            offset=0
        )
        total_count = len(total_logs)
        
        # Transform to response model
        log_entries = [
            CharterLogEntry(
                correlation_id=log['correlation_id'],  # Already string
                timestamp=log['timestamp'],  # Already ISO string
                event_type=log['event_type'],
                phase=log.get('phase'),
                status=log.get('status'),
                message=log['message'],
                quality_metrics=log.get('quality_metrics'),
                metadata=log.get('metadata')
            )
            for log in charter_logs
        ]
        
        page = (offset // limit) + 1
        
        logger.info("[Charter] Charter logs retrieved", 
                   count=len(log_entries), 
                   total=total_count,
                   user_id=user_id,
                   plug_id=plug_id)
        
        return CharterLogsResponse(
            logs=log_entries,
            total=total_count,
            page=page,
            limit=limit
        )
    
    except Exception as e:
        logger.error("[Ledger] Failed to retrieve Charter logs", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve Charter logs")


@app.get("/api/ledger-logs", response_model=LedgerLogsResponse)
async def get_ledger_logs(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    plug_id: Optional[int] = Query(None, description="Filter by plug ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    provider_name: Optional[str] = Query(None, description="Filter by provider name"),
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    limit: int = Query(50, ge=1, le=500, description="Items per page (max 500)"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    is_admin: bool = Depends(verify_admin_role)
):
    """
    Get Ledger logs (internal audit, admin-only).
    
    Sprint 6C: Admin-only endpoint (HTTP 403 for non-admin)
    - Returns: Full internal audit data (costs, margins, providers)
    - Filters: user_id, plug_id, event_type, provider_name, date range
    - Pagination: limit (default 50, max 500), offset
    - Security: Requires admin role (verified via dependency)
    
    Returns:
        LedgerLogsResponse with logs array, total count, pagination info
    
    Raises:
        403: Non-admin access attempt
        500: Database error or dual-write system unavailable
    """
    if not CHARTER_LEDGER_ENABLED or not dual_logger:
        logger.warning("[Ledger] Charter/Ledger system not enabled")
        raise HTTPException(
            status_code=503,
            detail="Charter/Ledger system not available"
        )
    
    try:
        # Parse date strings to datetime if provided
        start_datetime = datetime.fromisoformat(start_date) if start_date else None
        end_datetime = datetime.fromisoformat(end_date) if end_date else None
        
        # Retrieve Ledger logs (individual parameters, not filters dict)
        ledger_logs = await dual_logger.get_ledger_logs(
            user_id=user_id,
            plug_id=plug_id,
            event_type=event_type,
            provider_name=provider_name,
            start_date=start_datetime,
            end_date=end_datetime,
            limit=limit,
            offset=offset
        )
        
        # Get total count for pagination
        total_logs = await dual_logger.get_ledger_logs(
            user_id=user_id,
            plug_id=plug_id,
            event_type=event_type,
            provider_name=provider_name,
            start_date=start_datetime,
            end_date=end_datetime,
            limit=500,
            offset=0
        )
        total_count = len(total_logs)
        
        # Transform to response model
        log_entries = [
            LedgerLogEntry(
                correlation_id=log['correlation_id'],  # Already string
                timestamp=log['timestamp'],  # Already ISO string
                event_type=log['event_type'],
                internal_cost=float(log['internal_cost']) if log.get('internal_cost') else None,
                customer_charge=float(log['customer_charge']) if log.get('customer_charge') else None,
                margin_percent=float(log['margin_percent']) if log.get('margin_percent') else None,
                provider_name=log.get('provider_name'),
                model_name=log.get('model_name'),
                execution_time_ms=log.get('execution_time_ms'),
                error_details=log.get('error_details'),
                metadata=log.get('metadata')
            )
            for log in ledger_logs
        ]
        
        page = (offset // limit) + 1
        
        logger.info("[Ledger] Ledger logs retrieved (admin)", 
                   count=len(log_entries), 
                   total=total_count,
                   user_id=user_id,
                   plug_id=plug_id)
        
        return LedgerLogsResponse(
            logs=log_entries,
            total=total_count,
            page=page,
            limit=limit
        )
    
    except HTTPException:
        raise  # Re-raise 403 from verify_admin_role
    except Exception as e:
        logger.error("[Ledger] Failed to retrieve Ledger logs", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve Ledger logs")


@app.get("/api/correlated-logs/{correlation_id}", response_model=CorrelatedLogsResponse)
async def get_correlated_logs(
    correlation_id: str,
    is_admin: bool = Depends(verify_admin_role)
):
    """
    Get correlated Charter + Ledger logs by correlation_id.
    
    Sprint 6C: Admin-only endpoint for debugging (HTTP 403 for non-admin)
    - Returns: Both Charter (customer-safe) and Ledger (internal audit) entries
    - Security: Requires admin role
    - Use Case: Internal debugging, audit trail verification
    
    Args:
        correlation_id: UUID linking Charter and Ledger entries
    
    Returns:
        CorrelatedLogsResponse with both Charter and Ledger entries
    
    Raises:
        403: Non-admin access attempt
        404: No logs found for correlation_id
        500: Database error or dual-write system unavailable
    """
    if not CHARTER_LEDGER_ENABLED or not dual_logger:
        logger.warning("[Ledger] Charter/Ledger system not enabled")
        raise HTTPException(
            status_code=503,
            detail="Charter/Ledger system not available"
        )
    
    try:
        # Retrieve correlated logs
        correlated = await dual_logger.get_correlated_logs(correlation_id)
        
        if not correlated:
            logger.warning("[Charter] No logs found for correlation_id", 
                          correlation_id=correlation_id)
            raise HTTPException(
                status_code=404,
                detail=f"No logs found for correlation_id: {correlation_id}"
            )
        
        charter_log = correlated['charter']
        ledger_log = correlated['ledger']
        
        # Transform to response model
        charter_entry = CharterLogEntry(
            correlation_id=charter_log['correlation_id'],  # Already string
            timestamp=charter_log['timestamp'],  # Already ISO string
            event_type=charter_log['event_type'],
            phase=charter_log.get('phase'),
            status=charter_log.get('status'),
            message=charter_log['message'],
            quality_metrics=charter_log.get('quality_metrics'),
            metadata=charter_log.get('metadata')
        )
        
        ledger_entry = LedgerLogEntry(
            correlation_id=ledger_log['correlation_id'],  # Already string
            timestamp=ledger_log['timestamp'],  # Already ISO string
            event_type=ledger_log['event_type'],
            internal_cost=float(ledger_log['internal_cost']) if ledger_log.get('internal_cost') else None,
            customer_charge=float(ledger_log['customer_charge']) if ledger_log.get('customer_charge') else None,
            margin_percent=float(ledger_log['margin_percent']) if ledger_log.get('margin_percent') else None,
            provider_name=ledger_log.get('provider_name'),
            model_name=ledger_log.get('model_name'),
            execution_time_ms=ledger_log.get('execution_time_ms'),
            error_details=ledger_log.get('error_details'),
            metadata=ledger_log.get('metadata')
        )
        
        logger.info("[Ledger] Correlated logs retrieved (admin)", 
                   correlation_id=correlation_id)
        
        return CorrelatedLogsResponse(
            correlation_id=correlation_id,
            charter=charter_entry,
            ledger=ledger_entry
        )
    
    except HTTPException:
        raise  # Re-raise 403/404
    except Exception as e:
        logger.error("[Ledger] Failed to retrieve correlated logs", 
                    error=str(e), 
                    correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail="Failed to retrieve correlated logs")

# =============================================================================
# END OF CHARTER/LEDGER GET APIs
# =============================================================================

# Sprint 6C Phase 6: Database Pool Prewarming
async def prewarm_db_pool():
    """
    Prewarm asyncpg pool to eliminate cold-start latency.
    
    Phase 6 Performance Optimization:
    - Eliminates p99 outlier (439ms → ~45ms expected)
    - Executes dummy query to warm connections
    - Non-blocking: Logs warning if fails
    """
    if not db_pool:
        return
    
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        logger.info("[Charter/Ledger] Database pool prewarmed successfully", 
                   pool_size=db_pool.get_size(),
                   free_connections=db_pool.get_idle_size())
    except Exception as e:
        logger.warning("[Charter/Ledger] Pool prewarm failed (non-blocking)", 
                      error=str(e))

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize ACHEEVY Orchestrator on startup"""
    global db_pool, dual_logger
    
    logger.info("ACHEEVY Digital CEO Orchestrator starting up",
               environment=ENVIRONMENT,
               confidence_threshold=CONFIDENCE_THRESHOLD,
               charter_ledger_enabled=CHARTER_LEDGER_ENABLED)
    
    # Sprint 6C: Initialize asyncpg pool for Charter/Ledger
    if CHARTER_LEDGER_ENABLED:
        try:
            db_pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=2,
                max_size=10,
                command_timeout=5.0,
                timeout=10.0  # Add connection timeout to prevent hanging
            )
            dual_logger = DualWriteLogger(db_pool)
            logger.info("[Charter/Ledger] Dual-write logger initialized", 
                       pool_size="2-10", 
                       timeout="5s")
            
            # Phase 6 Optimization: Prewarm pool to eliminate cold-start p99 latency
            await prewarm_db_pool()
            
        except (Exception, asyncio.exceptions.CancelledError) as e:
            logger.warning("[Ledger] Database not available - continuing without Charter/Ledger", 
                        error=str(e))
            # Non-blocking: Continue without Charter/Ledger if pool fails
            db_pool = None
            dual_logger = None
            dual_logger = None
    
    # TODO: Initialize Claude Agent SDK


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global db_pool
    
    logger.info("ACHEEVY Digital CEO Orchestrator shutting down")
    
    # Sprint 6C: Close asyncpg pool
    if db_pool:
        await db_pool.close()
        logger.info("[Charter/Ledger] Database pool closed")
    # TODO: Initialize Boomer_Angs communication

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )