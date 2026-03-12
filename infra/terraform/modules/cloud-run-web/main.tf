# Data source pour récupérer l'URL (toujours à jour, même après import)
data "google_cloud_run_v2_service" "web" {
  count    = 1
  name     = var.service_name
  location = var.region
  project  = var.project_id

  depends_on = [google_cloud_run_v2_service.web]
}

resource "google_cloud_run_v2_service" "web" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      env {
        name  = "NUXT_PUBLIC_SERVER_URL"
        value = var.server_url
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = google_cloud_run_v2_service.web.project
  location = google_cloud_run_v2_service.web.location
  name     = google_cloud_run_v2_service.web.name

  role   = "roles/run.invoker"
  member = "allUsers"
}
