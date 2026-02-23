variable "project_id" {
  type = string
}

variable "network_name" {
  type = string
}

variable "region" {
  type = string
}

variable "subnet_ip_cidr_range" {
  type = string
}

resource "google_compute_network" "vpc" {
  name                    = var.network_name
  auto_create_subnetworks = false
  project                 = var.project_id
}

resource "google_compute_subnetwork" "primary" {
  name          = "${var.network_name}-subnet"
  ip_cidr_range = var.subnet_ip_cidr_range
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id
}

resource "google_compute_firewall" "allow_http_https" {
  name    = "${var.network_name}-allow-http-https"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  direction   = "INGRESS"
  target_tags = ["web"]
  source_ranges = [
    "0.0.0.0/0",
  ]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.network_name}-allow-ssh"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  direction = "INGRESS"
  # A adapter plus tard (IP de ton poste / bastion)
  source_ranges = ["0.0.0.0/0"]
}

output "network_self_link" {
  value = google_compute_network.vpc.self_link
}

output "subnet_self_link" {
  value = google_compute_subnetwork.primary.self_link
}

