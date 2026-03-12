variable "project_id" {
  description = "ID du projet GCP"
  type        = string
}

variable "region" {
  description = "Région GCP pour Cloud Run"
  type        = string
}

variable "service_name" {
  description = "Nom du service Cloud Run"
  type        = string
  default     = "adminserein-server"
}

variable "cloud_sql_connection_name" {
  description = "Nom de connexion Cloud SQL (project:region:instance)"
  type        = string
}

variable "database_url" {
  description = "URL de connexion PostgreSQL (format Cloud SQL socket)"
  type        = string
  sensitive   = true
}

variable "better_auth_secret" {
  description = "Secret pour Better Auth"
  type        = string
  sensitive   = true
}

variable "better_auth_url" {
  description = "URL publique du serveur (pour Better Auth)"
  type        = string
}

variable "cors_origin" {
  description = "Origine CORS autorisée (URL du frontend)"
  type        = string
}

variable "image" {
  description = "Image Docker complète (ex: europe-west1-docker.pkg.dev/project/repo/server:latest)"
  type        = string
}

variable "min_instances" {
  description = "Nombre minimum d'instances (0 = scale to zero)"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Nombre maximum d'instances"
  type        = number
  default     = 10
}

variable "memory" {
  description = "Mémoire allouée (Mi)"
  type        = string
  default     = "512Mi"
}

variable "cpu" {
  description = "CPU allouée"
  type        = string
  default     = "1"
}
