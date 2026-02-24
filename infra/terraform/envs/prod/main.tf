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

module "compute" {
  source          = "../../modules/compute"
  project_id      = var.project_id
  zone            = var.zone
  machine_type    = var.machine_type
  subnet_self_link = module.network.subnet_self_link
}

