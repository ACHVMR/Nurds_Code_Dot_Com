import { FastifyPluginAsync } from "fastify";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Whitelist of valid template URLs (security: prevent arbitrary URLs)
const VALID_TEMPLATES = [
  "/avatar-templates/template-1.svg",
  "/avatar-templates/template-2.svg",
  "/avatar-templates/template-3.svg",
  "/avatar-templates/template-4.svg",
  "/avatar-templates/template-5.svg",
  "/avatar-templates/template-6.svg",
  "/avatar-templates/template-7.svg",
  "/avatar-templates/template-8.svg",
  "/avatar-templates/template-9.svg",
  "/avatar-templates/template-10.svg",
  "/avatar-templates/template-11.svg",
  "/avatar-templates/template-12.svg",
];

export const setTemplateRoute: FastifyPluginAsync = async (fastify) => {
  // POST /api/avatars/set-template - Set template as user avatar (skip moderation)
  fastify.post("/api/avatars/set-template", async (request, reply) => {
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
      const { templateUrl } = request.body as { templateUrl: string };

      // Validate template URL (prevent arbitrary URLs - security)
      if (!templateUrl || !VALID_TEMPLATES.includes(templateUrl)) {
        console.warn("[Ledger] Invalid template URL attempted", {
          userId,
          attemptedUrl: templateUrl,
        });
        return reply.status(400).send({
          error: "Invalid template. Please select from available templates.",
        });
      }

      // Update user profile (skip moderation for templates)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: templateUrl,
          avatar_uploaded_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("[Ledger] Failed to set template avatar", {
          error: updateError.message,
          userId,
        });
        return reply.status(500).send({ error: "Failed to set template" });
      }

      // Log to moderation_logs for audit trail (pre-approved)
      await supabase.from("moderation_logs").insert({
        user_id: userId,
        image_url: templateUrl,
        scan_provider: "template",
        decision: "approved",
        decision_reason: "template_avatar",
        confidence_score: 0,
        api_cost: 0, // Templates are free (Ledger-only tracking)
      });

      console.log("[Charter] Template avatar set successfully", {
        userId,
        template: templateUrl.split("/").pop(),
      });

      return reply.send({
        success: true,
        avatarUrl: templateUrl,
        message: "Template avatar applied successfully",
      });
    } catch (err) {
      console.error("[Ledger] Set template error", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};
