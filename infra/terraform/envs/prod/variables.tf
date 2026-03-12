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

# Cloud SQL
variable "cloud_sql_database_password" {
  description = "Mot de passe de la base Cloud SQL PostgreSQL"
  type        = string
  sensitive   = true
}

# Cloud Run
variable "better_auth_secret" {
  description = "Secret pour Better Auth (min 32 caractères)"
  type        = string
  sensitive   = true
}

variable "better_auth_url" {
  description = "URL publique du serveur API (ex: https://adminserein-server-xxx.run.app)"
  type        = string
}

variable "cors_origin" {
  description = "Origine CORS (URL du frontend)"
  type        = string
}

variable "server_image" {
  description = "Image Docker complète pour le serveur (europe-west1-docker.pkg.dev/adminserein/cloud-run-source-deploy/server:latest)"
  type        = string
}

variable "web_image" {
  description = "Image Docker complète pour le frontend (europe-west1-docker.pkg.dev/adminserein/cloud-run-source-deploy/web:latest)"
  type        = string
}

