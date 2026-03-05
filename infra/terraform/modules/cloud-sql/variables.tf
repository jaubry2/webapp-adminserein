variable "project_id" {
  description = "ID du projet GCP"
  type        = string
}

variable "region" {
  description = "Région GCP pour l'instance Cloud SQL"
  type        = string
}

variable "instance_name" {
  description = "Nom de l'instance Cloud SQL"
  type        = string
  default     = "bdd-adminserein"
}

variable "database_version" {
  description = "Version de PostgreSQL (POSTGRES_15, POSTGRES_14, etc.)"
  type        = string
  default     = "POSTGRES_15"
}

variable "tier" {
  description = "Tier de la machine (db-f1-micro, db-g1-small, db-custom-2-4096, etc.)"
  type        = string
  default     = "db-f1-micro"
}

variable "disk_size_gb" {
  description = "Taille du disque en Go"
  type        = number
  default     = 10
}

variable "disk_type" {
  description = "Type de disque (PD_SSD ou PD_HDD)"
  type        = string
  default     = "PD_SSD"
}

variable "database_name" {
  description = "Nom de la base de données à créer"
  type        = string
  default     = "webapp-adminserein"
}

variable "database_user" {
  description = "Nom de l'utilisateur de la base de données"
  type        = string
  default     = "postgres"
}

variable "database_password" {
  description = "Mot de passe de l'utilisateur (sensible)"
  type        = string
  sensitive   = true
}

variable "network_id" {
  description = "ID ou self_link du VPC pour l'IP privée (optionnel)"
  type        = string
  default     = ""
}

variable "enable_private_ip" {
  description = "Activer l'IP privée (connexion via VPC)"
  type        = bool
  default     = true
}

variable "enable_public_ip" {
  description = "Activer l'accès public (IP publique)"
  type        = bool
  default     = true
}

variable "authorized_networks" {
  description = "Liste des réseaux autorisés pour l'accès public. Vide = 0.0.0.0/0 (tous) quand enable_public_ip est true"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "availability_type" {
  description = "ZONAL ou REGIONAL pour la haute disponibilité"
  type        = string
  default     = "ZONAL"
}

variable "backup_enabled" {
  description = "Activer les sauvegardes automatiques"
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Heure de début des sauvegardes (HH:MM)"
  type        = string
  default     = "03:00"
}
