output "cloud_sql_connection_name" {
  description = "Nom de connexion Cloud SQL (pour Cloud SQL Auth Proxy)"
  value       = module.cloud_sql.connection_name
}

output "cloud_sql_private_ip" {
  description = "IP privée de l'instance Cloud SQL"
  value       = module.cloud_sql.private_ip_address
}

output "cloud_run_url" {
  description = "URL du serveur API sur Cloud Run"
  value       = module.cloud_run.service_url
}

output "cloud_run_web_url" {
  description = "URL du frontend sur Cloud Run"
  value       = module.cloud_run_web.service_url
}

output "cloud_run_build_command" {
  description = "Commande pour builder et pusher l'image serveur"
  value       = module.cloud_run.build_command
}
