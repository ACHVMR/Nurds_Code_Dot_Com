# ============================================
# Nurds Code - Terraform Production Variables
# ============================================

gcp_project_id = "nurds-code-prod"
region         = "us-central1"

# Secrets will be passed via environment variables or CLI:
# terraform apply -var="groq_api_key=$GROQ_API_KEY"
