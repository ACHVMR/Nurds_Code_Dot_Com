# ============================================
# Nurds Code - ACHEEVY + II-Agent Cloud Run Deployment
# Terraform Configuration
# ============================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "nurds-code-tf-state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# ============================================
# 1. SERVICE ACCOUNT FOR CLOUD RUN
# ============================================

resource "google_service_account" "cloud_run" {
  account_id   = "cloud-run-acheevy"
  display_name = "Service account for ACHEEVY + II-Agents"
}

resource "google_project_iam_member" "cloud_run_roles" {
  for_each = toset([
    "roles/firestore.user",
    "roles/cloudtrace.agent",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/secretmanager.secretAccessor",
  ])
  
  project = var.gcp_project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# ============================================
# 2. SECRETS MANAGEMENT
# ============================================

resource "google_secret_manager_secret" "groq_key" {
  secret_id = "groq-api-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "openrouter_key" {
  secret_id = "openrouter-api-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "elevenlabs_key" {
  secret_id = "elevenlabs-api-key"
  replication {
    auto {}
  }
}

# ============================================
# 3. CDM HUB (ACHEEVY Orchestrator)
# ============================================

resource "google_cloud_run_service" "acheevy_hub" {
  name     = "acheevy-hub"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.cloud_run.email
      
      containers {
        image = "gcr.io/${var.gcp_project_id}/acheevy-hub:latest"
        
        env {
          name  = "FIRESTORE_PROJECT_ID"
          value = var.gcp_project_id
        }
        env {
          name  = "ENVIRONMENT"
          value = "production"
        }
        env {
          name = "GROQ_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.groq_key.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            memory = "2Gi"
            cpu    = "2"
          }
        }
        
        ports {
          container_port = 8080
        }
        
        liveness_probe {
          http_get {
            path = "/health"
            port = 8080
          }
          initial_delay_seconds = 10
          period_seconds        = 10
        }
      }
      
      timeout_seconds = 60
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "3"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_iam_member.cloud_run_roles]
}

resource "google_cloud_run_service_iam_member" "acheevy_public" {
  service  = google_cloud_run_service.acheevy_hub.name
  location = google_cloud_run_service.acheevy_hub.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================
# 4. II-AGENT WORKER SERVICES (Templated)
# ============================================

locals {
  ii_agents = {
    nlu = {
      min = 1, max = 8, memory = "512Mi", timeout = 30, cpu = "1"
    }
    research = {
      min = 2, max = 10, memory = "2Gi", timeout = 180, cpu = "2"
    }
    codegen = {
      min = 2, max = 15, memory = "2Gi", timeout = 120, cpu = "2"
    }
    data = {
      min = 1, max = 6, memory = "1Gi", timeout = 90, cpu = "1"
    }
    security = {
      min = 1, max = 4, memory = "1Gi", timeout = 60, cpu = "1"
    }
    kg = {
      min = 1, max = 5, memory = "1536Mi", timeout = 120, cpu = "1"
    }
    streaming = {
      min = 1, max = 6, memory = "1Gi", timeout = 30, cpu = "1"
    }
    multimodal = {
      min = 1, max = 8, memory = "2Gi", timeout = 120, cpu = "2"
    }
    reasoning = {
      min = 2, max = 8, memory = "2Gi", timeout = 180, cpu = "2"
    }
    validation = {
      min = 1, max = 5, memory = "1Gi", timeout = 60, cpu = "1"
    }
    deploy = {
      min = 1, max = 3, memory = "512Mi", timeout = 180, cpu = "1"
    }
    observability = {
      min = 1, max = 2, memory = "512Mi", timeout = 30, cpu = "1"
    }
    costopt = {
      min = 1, max = 2, memory = "512Mi", timeout = 60, cpu = "1"
    }
    legal = {
      min = 1, max = 3, memory = "1Gi", timeout = 90, cpu = "1"
    }
    synthesis = {
      min = 1, max = 5, memory = "1536Mi", timeout = 120, cpu = "1"
    }
    hitl = {
      min = 1, max = 2, memory = "512Mi", timeout = 30, cpu = "1"
    }
    prompt = {
      min = 1, max = 3, memory = "512Mi", timeout = 60, cpu = "1"
    }
    tools = {
      min = 2, max = 8, memory = "1Gi", timeout = 90, cpu = "1"
    }
    learning = {
      min = 1, max = 5, memory = "2Gi", timeout = 180, cpu = "2"
    }
  }
}

resource "google_cloud_run_service" "ii_agents" {
  for_each = local.ii_agents
  
  name     = "ii-${each.key}-worker"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.cloud_run.email
      
      containers {
        image = "gcr.io/${var.gcp_project_id}/ii-${each.key}-worker:latest"
        
        env {
          name  = "AGENT_TYPE"
          value = each.key
        }
        env {
          name  = "ACHEEVY_HUB_URL"
          value = google_cloud_run_service.acheevy_hub.status[0].url
        }
        env {
          name  = "ENVIRONMENT"
          value = "production"
        }
        env {
          name = "GROQ_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.groq_key.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            memory = each.value.memory
            cpu    = each.value.cpu
          }
        }
        
        ports {
          container_port = 8080
        }
      }
      
      timeout_seconds = each.value.timeout
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = tostring(each.value.min)
        "autoscaling.knative.dev/maxScale" = tostring(each.value.max)
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_iam_member.cloud_run_roles,
    google_cloud_run_service.acheevy_hub
  ]
}

resource "google_cloud_run_service_iam_member" "ii_agents_public" {
  for_each = local.ii_agents
  
  service  = google_cloud_run_service.ii_agents[each.key].name
  location = google_cloud_run_service.ii_agents[each.key].location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================
# 5. OUTPUTS
# ============================================

output "acheevy_hub_url" {
  value       = google_cloud_run_service.acheevy_hub.status[0].url
  description = "ACHEEVY CDM Hub URL"
}

output "ii_agent_urls" {
  value = {
    for name, svc in google_cloud_run_service.ii_agents :
    name => svc.status[0].url
  }
  description = "II-Agent worker URLs"
}

output "total_min_instances" {
  value       = sum([for agent in local.ii_agents : agent.min])
  description = "Total minimum always-on instances"
}

output "total_max_instances" {
  value       = sum([for agent in local.ii_agents : agent.max])
  description = "Total maximum scaling capacity"
}
