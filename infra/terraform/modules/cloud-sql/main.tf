# Adresse IP privée pour Cloud SQL (Private Service Access)
resource "google_compute_global_address" "private_ip_range" {
  count = var.enable_private_ip ? 1 : 0

  name          = "${var.instance_name}-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.network_id
  project       = var.project_id
}

# Connexion du VPC au service Cloud SQL
resource "google_service_networking_connection" "private_vpc_connection" {
  count = var.enable_private_ip ? 1 : 0

  network                 = var.network_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = var.enable_private_ip ? [google_compute_global_address.private_ip_range[0].name] : []
}

# Instance Cloud SQL PostgreSQL
resource "google_sql_database_instance" "main" {
  name             = var.instance_name
  database_version = var.database_version
  project          = var.project_id
  region           = var.region

  settings {
    tier              = var.tier
    availability_type = var.availability_type
    disk_size         = var.disk_size_gb
    disk_type         = var.disk_type

    ip_configuration {
      ipv4_enabled    = var.enable_public_ip
      private_network = var.enable_private_ip ? var.network_id : null

      dynamic "authorized_networks" {
        for_each = length(var.authorized_networks) > 0 ? var.authorized_networks : (var.enable_public_ip ? [{ name = "all", value = "0.0.0.0/0" }] : [])
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.value
        }
      }
    }

    backup_configuration {
      enabled                        = var.backup_enabled
      start_time                     = var.backup_start_time
      point_in_time_recovery_enabled = false
    }

    maintenance_window {
      day          = 7 # Dimanche
      hour         = 4
      update_track = "stable"
    }
  }

  deletion_protection = false
  # Dépendance sur la connexion VPC quand l'IP privée est activée
  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# Base de données
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.main.name
  project  = var.project_id
}

# Utilisateur
resource "google_sql_user" "user" {
  name     = var.database_user
  instance = google_sql_database_instance.main.name
  password = var.database_password
  project  = var.project_id
}
