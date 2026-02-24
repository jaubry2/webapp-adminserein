variable "project_id" {
  type = string
}

variable "zone" {
  type = string
}

variable "machine_type" {
  type = string
}

variable "subnet_self_link" {
  type = string
}

variable "instance_name" {
  type    = string
  default = "adminserein-app-vm"
}

resource "google_compute_instance" "app" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone
  project      = var.project_id

  tags = ["web", "http-server", "ansible-target", "ssh-access"]

  boot_disk {
    initialize_params {
      image = "projects/debian-cloud/global/images/family/debian-12"
      size  = 20
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = var.subnet_self_link

    access_config {}
  }

  metadata = {
    enable-oslogin = "TRUE"
  }
}

output "app_instance_ips" {
  value = [google_compute_instance.app.network_interface[0].access_config[0].nat_ip]
}

