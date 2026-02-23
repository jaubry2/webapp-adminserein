output "app_instance_ips" {
  description = "IPs publiques des VMs applicatives"
  value       = module.compute.app_instance_ips
}

output "db_connection_name" {
  description = "Connection name Cloud SQL Postgres"
  value       = module.sql.db_connection_name
}

