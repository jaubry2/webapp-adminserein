output "instance_name" {
  description = "Nom de l'instance Cloud SQL"
  value       = google_sql_database_instance.main.name
}

output "connection_name" {
  description = "Nom de connexion pour Cloud SQL Proxy (project:region:instance)"
  value       = google_sql_database_instance.main.connection_name
}

output "private_ip_address" {
  description = "Adresse IP privée de l'instance (si activée)"
  value       = var.enable_private_ip ? google_sql_database_instance.main.private_ip_address : null
}

output "public_ip_address" {
  description = "Adresse IP publique de l'instance (si activée)"
  value       = google_sql_database_instance.main.public_ip_address
}

output "database_name" {
  description = "Nom de la base de données"
  value       = google_sql_database.database.name
}

output "database_user" {
  description = "Nom de l'utilisateur"
  value       = google_sql_user.user.name
}

output "connection_string_private" {
  description = "URL de connexion via Cloud SQL Auth Proxy (IP privée)"
  value       = var.enable_private_ip ? "postgresql://${google_sql_user.user.name}:${var.database_password}@/${google_sql_database.database.name}?host=/cloudsql/${google_sql_database_instance.main.connection_name}" : null
  sensitive   = true
}

output "connection_string_public" {
  description = "URL de connexion via IP publique"
  value       = google_sql_database_instance.main.public_ip_address != null ? "postgresql://${google_sql_user.user.name}:${var.database_password}@${google_sql_database_instance.main.public_ip_address}:5432/${google_sql_database.database.name}" : null
  sensitive   = true
}
