import { FastifyPluginAsync } from "fastify";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const historyRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/avatars/history - Fetch user's avatar upload history
  fastify.get("/api/avatars/history", async (request, reply) => {
    try {
      // Extract user ID from authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply
          .status(401)
          .send({ error: "Unauthorized - No token provided" });
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return reply
          .status(401)
          .send({ error: "Unauthorized - Invalid token" });
      }

      const userId = user.id;
      const limit = parseInt(request.query?.limit as string) || 10;

      // Fetch moderation logs for this user (last 10 uploads)
      const { data, error } = await supabase
        .from("moderation_logs")
        .select(
          "id, image_url, decision, decision_reason, confidence_score, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[Ledger] Failed to fetch moderation history", {
          error: error.message,
          userId,
        });
        return reply.status(500).send({ error: "Failed to fetch history" });
      }

      // Map to user-friendly format (Charter-safe)
      const history = data.map((log) => ({
        id: log.id,
        thumbnail: log.image_url || "/assets/images/ACHEEVY-Avatar.PNG",
        status: log.decision, // 'approved', 'rejected', 'flagged'
        statusLabel: getStatusLabel(log.decision),
        reason: getUserFriendlyReason(log.decision_reason),
        date: log.created_at,
      }));

      console.log("[Charter] Avatar history retrieved", {
        userId,
        count: history.length,
      });

      return reply.send({ history });
    } catch (err) {
      console.error("[Ledger] Avatar history error", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};

// Map decision to user-friendly label
function getStatusLabel(decision: string): string {
  switch (decision) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "flagged":
      return "Pending Review";
    default:
      return "Unknown";
  }
}

// Map technical reasons to user-friendly messages (Charter-safe, no leaks)
function getUserFriendlyReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    auto_approved: "Image passed content safety checks",
    auto_rejected:
      "Please upload a professional photo suitable for a business profile",
    manual_review_required: "Your avatar is being reviewed by our team",
    api_failure: "Technical issue during review - our team will check manually",
    template_avatar: "Professional template selected",
  };
  return reasonMap[reason] || "Avatar upload processed";
}
