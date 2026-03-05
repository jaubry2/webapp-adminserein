# Artifact Registry pour les images Docker
resource "google_artifact_registry_repository" "server" {
  location      = var.region
  repository_id = "cloud-run-source-deploy"
  description   = "Images Docker pour Cloud Run"
  format        = "DOCKER"
  project       = var.project_id
}

# Cloud Run service
resource "google_cloud_run_v2_service" "server" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # Cloud SQL connexion via socket Unix
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.cloud_sql_connection_name]
      }
    }

    containers {
      image = var.image

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }
      env {
        name  = "BETTER_AUTH_SECRET"
        value = var.better_auth_secret
      }
      env {
        name  = "BETTER_AUTH_URL"
        value = var.better_auth_url
      }
      env {
        name  = "CORS_ORIGIN"
        value = var.cors_origin
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }
}

# Permettre l'accès public (non authentifié)
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = google_cloud_run_v2_service.server.project
  location = google_cloud_run_v2_service.server.location
  name     = google_cloud_run_v2_service.server.name

  role   = "roles/run.invoker"
  member = "allUsers"
}
