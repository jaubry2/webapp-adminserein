variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "db_tier" {
  type = string
}

variable "db_disk_size" {
  type = number
}

variable "db_name" {
  type    = string
  default = "adminserein"
}

variable "db_user_name" {
  type    = string
  default = "app_user"
}

variable "db_user_password" {
  type      = string
  sensitive = true
}

resource "google_sql_database_instance" "postgres" {
  name                = "adminserein-postgres"
  database_version    = "POSTGRES_15"
  region              = var.region
  project             = var.project_id
  deletion_protection = true

  settings {
    tier = var.db_tier

    disk_size = var.db_disk_size

    ip_configuration {
      ipv4_enabled    = true
    }
  }
}

resource "google_sql_database" "app_db" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

resource "google_sql_user" "app_user" {
  name     = var.db_user_name
  instance = google_sql_database_instance.postgres.name
  password = var.db_user_password
  project  = var.project_id
}

output "db_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

