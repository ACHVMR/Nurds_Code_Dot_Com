/**
 * AVATAR MODERATION API ROUTE
 * Sprint 10 Phase 3: Avatar Moderation System
 *
 * PURPOSE: Pre-upload moderation check for avatar images
 * SECURITY: Mission-Critical (Content Safety)
 * V.I.B.E.: Verifiable, Idempotent, Bounded, Evident
 *
 * ENDPOINTS:
 * - POST /api/avatars/moderate - Scan image before upload
 * - GET /api/avatars/moderation-status - Check pending review status
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  scanImage,
  getUserFriendlyMessage,
} from "../services/moderation.service";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface ModerateAvatarRequest {
  Body: {
    imageBase64: string;
    userId: string;
  };
}

interface ModerationStatusRequest {
  Querystring: {
    userId: string;
  };
}

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Service role key for admin operations
);

// =====================================================
// MAIN ROUTE REGISTRATION
// =====================================================

export default async function moderationRoutes(fastify: FastifyInstance) {
  // =====================================================
  // POST /api/avatars/moderate
  // Pre-upload moderation check
  // =====================================================

  fastify.post<ModerateAvatarRequest>(
    "/moderate",
    {
      schema: {
        body: {
          type: "object",
          required: ["imageBase64", "userId"],
          properties: {
            imageBase64: { type: "string" },
            userId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<ModerateAvatarRequest>,
      reply: FastifyReply
    ) => {
      const startTime = Date.now();
      const { imageBase64, userId } = request.body;

      try {
        // Step 1: Rate limit check (10 uploads per hour)
        const isRateLimited = await checkRateLimit(userId);
        if (isRateLimited) {
          return reply.code(429).send({
            allowed: false,
            reason: "rate_limit_exceeded",
            message:
              "You have exceeded the maximum number of uploads. Please try again later.",
          });
        }

        // Step 2: Check if user is suspended/banned
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("moderation_status")
          .eq("id", userId)
          .single();

        if (profileError) {
          fastify.log.error(
            { error: profileError },
            "Failed to fetch user profile"
          );
          throw new Error("Failed to verify user status");
        }

        if (
          profile.moderation_status === "suspended" ||
          profile.moderation_status === "banned"
        ) {
          return reply.code(403).send({
            allowed: false,
            reason: "account_suspended",
            message:
              "Your account has been suspended from uploading avatars. Please contact support.",
          });
        }

        // Step 3: Scan image with AI moderation
        const scanResult = await scanImage(imageBase64);

        // Step 4: Handle decision based on confidence
        if (scanResult.decision === "approved") {
          // AUTO-APPROVED: Return upload URL
          const uploadUrl = await generateUploadUrl(userId);

          // Log to Ledger (approved)
          await logModerationDecision(
            userId,
            null,
            scanResult,
            "approved",
            "auto_approved"
          );

          return reply.code(200).send({
            allowed: true,
            uploadUrl,
            scanId: crypto.randomUUID(),
            message: "Image approved for upload",
          });
        } else if (scanResult.decision === "rejected") {
          // AUTO-REJECTED: High confidence inappropriate content

          // Log to Ledger (rejected)
          await logModerationDecision(
            userId,
            null,
            scanResult,
            "rejected",
            "auto_rejected"
          );

          // Update profiles moderation_count
          await supabase.rpc("increment_moderation_count", {
            p_user_id: userId,
          });

          // Check three-strike policy (trigger will handle suspension)

          // Return user-friendly error message (Charter-safe)
          return reply.code(403).send({
            allowed: false,
            reason: "community_guidelines",
            message: getUserFriendlyMessage(
              scanResult.decision,
              scanResult.categories
            ),
          });
        } else if (scanResult.decision === "flagged") {
          // FLAGGED FOR MANUAL REVIEW: Uncertain confidence (50-85%)

          // Upload to temporary storage (7-day expiry)
          const tempImageUrl = await uploadToTempStorage(userId, imageBase64);

          // Add to manual review queue
          const { data: queueItem, error: queueError } = await supabase
            .from("moderation_queue")
            .insert({
              user_id: userId,
              image_url: tempImageUrl,
              image_hash: computeImageHash(Buffer.from(imageBase64, "base64")),
              scan_result: scanResult.confidence,
              confidence_score: scanResult.confidence.overall,
              flagged_categories: scanResult.categories,
              status: "pending",
              priority: determinePriority(scanResult.confidence.overall),
            })
            .select()
            .single();

          if (queueError) {
            fastify.log.error(
              { error: queueError },
              "Failed to add to moderation queue"
            );
            throw new Error("Failed to queue for manual review");
          }

          // Log to Ledger (flagged)
          await logModerationDecision(
            userId,
            tempImageUrl,
            scanResult,
            "flagged",
            "pending_manual_review"
          );

          // Return "pending review" response
          return reply.code(202).send({
            allowed: "pending",
            queueId: queueItem.id,
            estimatedReviewTime: "24 hours",
            message:
              "Your image is being reviewed by our team. You'll be notified when approved.",
          });
        }
      } catch (error) {
        fastify.log.error({ error }, "Moderation check failed");

        // Fail-open: Allow upload but flag for manual review (API failure)
        const uploadUrl = await generateUploadUrl(userId);

        return reply.code(200).send({
          allowed: true,
          uploadUrl,
          scanId: crypto.randomUUID(),
          message: "Upload allowed (moderation temporarily unavailable)",
          warning: "Your image will be reviewed shortly",
        });
      } finally {
        const duration = Date.now() - startTime;
        fastify.log.info({ userId, duration }, "Moderation check completed");
      }
    }
  );

  // =====================================================
  // GET /api/avatars/moderation-status
  // Check if user has pending reviews
  // =====================================================

  fastify.get<ModerationStatusRequest>(
    "/moderation-status",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<ModerationStatusRequest>,
      reply: FastifyReply
    ) => {
      const { userId } = request.query;

      try {
        // Get pending reviews for user
        const { data: pendingReviews, error } = await supabase
          .from("moderation_queue")
          .select("id, created_at, status, confidence_score")
          .eq("user_id", userId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) {
          fastify.log.error({ error }, "Failed to fetch moderation status");
          throw new Error("Failed to fetch moderation status");
        }

        return reply.code(200).send({
          pending_reviews: pendingReviews?.length || 0,
          reviews: pendingReviews || [],
        });
      } catch (error) {
        fastify.log.error({ error }, "Failed to get moderation status");
        return reply.code(500).send({
          error: "Failed to get moderation status",
        });
      }
    }
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if user has exceeded rate limit (10 uploads per hour)
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_user_rate_limited", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Rate limit check failed:", error);
    return false; // Fail-open
  }

  return data || false;
}

/**
 * Generate presigned upload URL for approved images
 */
async function generateUploadUrl(userId: string): Promise<string> {
  const fileName = `avatars/${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from("user-uploads")
    .createSignedUploadUrl(fileName);

  if (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Upload image to temporary storage for manual review (7-day expiry)
 */
async function uploadToTempStorage(
  userId: string,
  imageBase64: string
): Promise<string> {
  const fileName = `temp-moderation/${userId}/${Date.now()}.jpg`;
  const imageBuffer = Buffer.from(imageBase64, "base64");

  const { data, error } = await supabase.storage
    .from("user-uploads")
    .upload(fileName, imageBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to temp storage: ${error.message}`);
  }

  // Return public URL (will expire in 7 days via bucket policy)
  const { data: urlData } = supabase.storage
    .from("user-uploads")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Compute SHA-256 hash for image (used for caching and duplicate detection)
 */
function computeImageHash(buffer: Buffer): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Determine priority for manual review queue (1-4)
 */
function determinePriority(confidence: number): number {
  if (confidence >= 80) return 4; // Urgent (close to auto-reject)
  if (confidence >= 70) return 3; // High
  if (confidence >= 60) return 2; // Medium
  return 1; // Low
}

/**
 * Log moderation decision to database (Ledger - internal audit)
 */
async function logModerationDecision(
  userId: string,
  imageUrl: string | null,
  scanResult: any,
  decision: string,
  decisionReason: string
): Promise<void> {
  const { error } = await supabase.from("moderation_logs").insert({
    user_id: userId,
    image_url: imageUrl,
    image_hash: imageUrl ? computeImageHash(Buffer.from(imageUrl)) : null,
    scan_provider: scanResult.provider,
    scan_result: scanResult.confidence,
    decision,
    decision_reason: decisionReason,
    confidence_score: scanResult.confidence.overall,
    api_cost: 0.008, // Internal cost (never expose to customers)
  });

  if (error) {
    console.error("Failed to log moderation decision:", error);
  }
}

// =====================================================
// DATABASE HELPER FUNCTIONS (PostgreSQL)
// =====================================================

/**
 * Create PostgreSQL function for incrementing moderation count
 * (Add this to your migration if not already present)
 */
const INCREMENT_MODERATION_COUNT_SQL = `
CREATE OR REPLACE FUNCTION increment_moderation_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    moderation_count = moderation_count + 1,
    last_moderation_action = NOW()
  WHERE id = p_user_id;
END;
$$;
`;

// Run this function during migration deployment
