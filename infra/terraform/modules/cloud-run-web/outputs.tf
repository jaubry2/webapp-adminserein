output "service_url" {
  description = "URL du frontend web"
  value       = data.google_cloud_run_v2_service.web[0].uri
}

output "service_name" {
  description = "Nom du service"
  value       = google_cloud_run_v2_service.web.name
}
