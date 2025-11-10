/**
 * Supabase Database Utilities
 * Sprint 12A: Database operations for profiles and moderation logs
 */

import { Env, ProfileUpdate, ModerationLog } from "../types";
import { logLedger } from "./charter";

/**
 * Update user profile with R2 avatar URLs
 */
export async function updateProfile(
  env: Env,
  update: ProfileUpdate
): Promise<boolean> {
  try {
    const updates: Record<string, any> = {};

    if (update.avatar_r2_url) updates.avatar_r2_url = update.avatar_r2_url;
    if (update.avatar_cdn_url) updates.avatar_cdn_url = update.avatar_cdn_url;
    if (update.avatar_uploaded_at)
      updates.avatar_uploaded_at = update.avatar_uploaded_at;
    if (update.r2_migration_date)
      updates.r2_migration_date = update.r2_migration_date;

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${update.userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          apikey: env.SUPABASE_SERVICE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logLedger("Profile update failed", {
        userId: update.userId,
        status: response.status,
        error,
      });
      return false;
    }

    logLedger("Profile updated successfully", {
      userId: update.userId,
      updates: Object.keys(updates),
    });

    return true;
  } catch (error) {
    logLedger("Profile update error", {
      userId: update.userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Log moderation decision to database
 */
export async function logModeration(
  env: Env,
  log: ModerationLog
): Promise<boolean> {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/moderation_logs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          apikey: env.SUPABASE_SERVICE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(log),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logLedger("Moderation log failed", {
        userId: log.user_id,
        status: response.status,
        error,
      });
      return false;
    }

    logLedger("Moderation logged successfully", {
      userId: log.user_id,
      status: log.status,
      confidence: log.confidence_score,
    });

    return true;
  } catch (error) {
    logLedger("Moderation log error", {
      userId: log.user_id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Fetch unmigrated profiles (for migration script)
 */
export async function fetchUnmigratedProfiles(
  env: Env,
  limit: number = 100
): Promise<Array<{ id: string; avatar_url: string }>> {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?avatar_url=not.is.null&avatar_r2_url=is.null&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          apikey: env.SUPABASE_SERVICE_KEY,
        },
      }
    );

    if (!response.ok) {
      logLedger("Fetch unmigrated profiles failed", {
        status: response.status,
      });
      return [];
    }

    const profiles = await response.json();

    logLedger("Fetched unmigrated profiles", {
      count: profiles.length,
      limit,
    });

    return profiles;
  } catch (error) {
    logLedger("Fetch unmigrated profiles error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}
