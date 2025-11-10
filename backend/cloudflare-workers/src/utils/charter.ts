/**
 * Charter/Ledger Logging Utilities
 * Sprint 12A: Maintains strict separation between customer-facing and internal logs
 *
 * CRITICAL: Never expose internal costs, provider names, or margins to customers
 */

import { Env } from "../types";

/**
 * Charter-safe messages (customer-facing)
 */
export const CHARTER_MESSAGES = {
  // Success messages
  UPLOAD_SUCCESS: "Avatar uploaded successfully",
  MODERATION_PASSED: "Image passed content safety checks",
  TEMPLATE_APPLIED: "Template applied successfully",
  MIGRATION_COMPLETE: "Migration completed successfully",

  // Error messages (Charter-safe)
  UPLOAD_FAILED: "Upload failed. Please try again.",
  MODERATION_REJECTED:
    "Please upload a professional photo suitable for a business profile",
  INVALID_FILE: "Invalid file format. Please upload JPG, PNG, or WebP.",
  FILE_TOO_LARGE: "File size exceeds 2MB limit.",
  UNAUTHORIZED: "Authentication required.",
  SERVER_ERROR: "Technical issue occurred. Please try again later.",
} as const;

/**
 * Log Charter-safe message (customer-facing)
 */
export function logCharter(message: string, data?: Record<string, any>): void {
  const charterData = {
    timestamp: new Date().toISOString(),
    ...data,
  };

  console.log(`[Charter] ${message}`, charterData);
}

/**
 * Log Ledger message (internal audit only)
 *
 * FORBIDDEN in Ledger logs (never expose to customers):
 * - Internal costs ($0.039, $0.015/GB, etc.)
 * - Provider names (Workers AI, Cloudflare R2, ResNet-50)
 * - Margins (300%, 86% savings)
 * - Technical implementation details
 */
export function logLedger(message: string, data: Record<string, any>): void {
  const ledgerData = {
    timestamp: new Date().toISOString(),
    environment: "unknown", // Will be set from Env
    ...data,
  };

  console.log(`[Ledger] ${message}`, ledgerData);
}

/**
 * Log error with Charter/Ledger separation
 */
export function logError(error: Error, context: string, userId?: string): void {
  // Charter log (customer-safe)
  logCharter(`Error in ${context}`, {
    userId,
    message: CHARTER_MESSAGES.SERVER_ERROR,
  });

  // Ledger log (full details)
  logLedger(`Error in ${context}`, {
    userId,
    error: error.message,
    stack: error.stack,
    context,
  });
}

/**
 * Create Charter-safe API response
 */
export function charterResponse(
  success: boolean,
  message: string,
  data?: Record<string, any>
): Response {
  const response = {
    success,
    message,
    ...data,
  };

  return new Response(JSON.stringify(response), {
    status: success ? 200 : 400,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Create error response (Charter-safe)
 */
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
