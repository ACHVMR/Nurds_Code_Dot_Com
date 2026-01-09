# ============================================
# Nurds Code - Terraform Variables
# ============================================

variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "GCP Region for Cloud Run services"
}

variable "groq_api_key" {
  type        = string
  sensitive   = true
  description = "Groq API Key for fast inference"
}

variable "openrouter_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "OpenRouter API Key for multi-model routing"
}

variable "elevenlabs_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "ElevenLabs API Key for voice synthesis"
}
