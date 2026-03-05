output "cloud_sql_connection_name" {
  description = "Nom de connexion Cloud SQL (pour Cloud SQL Auth Proxy)"
  value       = module.cloud_sql.connection_name
}

output "cloud_sql_private_ip" {
  description = "IP privée de l'instance Cloud SQL"
  value       = module.cloud_sql.private_ip_address
}
