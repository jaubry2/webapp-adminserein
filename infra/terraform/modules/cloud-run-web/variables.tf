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
  default     = "adminserein-web"
}

variable "server_url" {
  description = "URL de l'API (Cloud Run server)"
  type        = string
}

variable "image" {
  description = "Image Docker complète (ex: europe-west1-docker.pkg.dev/project/repo/web:latest)"
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
