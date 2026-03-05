terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

module "network" {
  source              = "../../modules/network"
  project_id          = var.project_id
  network_name        = var.network_name
  region              = var.region
  subnet_ip_cidr_range = var.subnet_ip_cidr_range
}


module "cloud_sql" {
  source = "../../modules/cloud-sql"

  project_id          = var.project_id
  region              = var.region
  instance_name       = "bdd-adminserein"
  database_name      = "webapp-adminserein"
  database_user      = "postgres"
  database_password   = var.cloud_sql_database_password
  network_id         = module.network.network_self_link
  enable_private_ip  = true
  enable_public_ip   = true  # Accès public (0.0.0.0/0 par défaut)
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id                = var.project_id
  region                    = var.region
  service_name              = "adminserein-server"
  cloud_sql_connection_name  = module.cloud_sql.connection_name
  database_url              = module.cloud_sql.connection_string_private
  better_auth_secret         = var.better_auth_secret
  better_auth_url            = var.better_auth_url
  cors_origin                = var.cors_origin
  image                     = var.server_image
}

