/**
 * Cloudflare Workers Environment Bindings
 * Sprint 12A: Avatar Upload System
 */

export interface Env {
  // R2 Storage Binding
  AVATARS: R2Bucket;

  // KV Namespace Binding (Session Cache)
  SESSIONS: KVNamespace;

  // Workers AI Binding
  AI: any; // Using any to avoid type conflicts with Workers AI

  // Environment Variables
  ENVIRONMENT: string;
  R2_PUBLIC_URL: string;
  SUPABASE_URL: string;

  // Secrets (set via: wrangler secret put SECRET_NAME)
  SUPABASE_SERVICE_KEY: string;
  ADMIN_KEY: string;
}

/**
 * Session Data Structure (Cached in KV)
 */
export interface Session {
  userId: string;
  email: string;
  role?: string;
  expiresAt: number;
}

/**
 * Avatar Upload Request
 */
export interface UploadRequest {
  avatar: File;
  userId: string;
}

/**
 * Moderation Request
 */
export interface ModerationRequest {
  imageBase64: string;
  userId: string;
}

/**
 * Moderation Result
 */
export interface ModerationResult {
  approved: boolean;
  reason: string; // Charter-safe message
  confidence: number;
  categories?: string[];
}

/**
 * Processed Image
 */
export interface ProcessedImage {
  buffer: ArrayBuffer;
  body: ReadableStream<Uint8Array>;
  width: number;
  height: number;
  format: string;
}

/**
 * Charter-Safe API Response
 */
export interface CharterResponse {
  success: boolean;
  message: string;
  avatar_url?: string;
  error?: string;
}

/**
 * Migration Request
 */
export interface MigrationRequest {
  limit?: number;
  batchSize?: number;
}

/**
 * Supabase Profile Update
 */
export interface ProfileUpdate {
  userId: string;
  avatar_r2_url?: string;
  avatar_cdn_url?: string;
  avatar_uploaded_at?: string;
  r2_migration_date?: string;
}

/**
 * Moderation Log Entry
 */
export interface ModerationLog {
  user_id: string;
  avatar_url: string;
  status: "approved" | "rejected" | "pending" | "flagged";
  reason: string;
  confidence_score: number;
  api_cost: number;
  created_at: string;
}
