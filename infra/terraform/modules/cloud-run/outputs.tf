output "service_url" {
  description = "URL du service Cloud Run"
  value       = google_cloud_run_v2_service.server.uri
}

output "service_name" {
  description = "Nom du service"
  value       = google_cloud_run_v2_service.server.name
}

output "artifact_registry_repository" {
  description = "Repository Artifact Registry pour les images"
  value       = google_artifact_registry_repository.server.name
}

output "image_path" {
  description = "Chemin pour push l'image (sans tag)"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.server.repository_id}/server"
}

output "build_command" {
  description = "Commande pour builder et pusher l'image"
  value       = "gcloud builds submit --config=cloudbuild.yaml ."
}
