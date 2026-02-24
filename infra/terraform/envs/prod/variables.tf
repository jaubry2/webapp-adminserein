variable "project_id" {
  description = "Nom du projet"
  type        = string
  default     = "adminserein"
}

variable "region" {
  description = "Région GCP"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "Zone GCP"
  type        = string
  default     = "europe-west1-b"
}

variable "machine_type" {
  description = "Type de machine pour les VMs Compute Engine"
  type        = string
  default     = "e2-micro"
}

variable "network_name" {
  description = "Nom du VPC"
  type        = string
  default     = "vpc-adminserein"
}

variable "subnet_ip_cidr_range" {
  description = "CIDR du sous-réseau principal"
  type        = string
  default     = "10.0.0.0/24"
}

