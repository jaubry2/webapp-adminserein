# Module Terraform - Cloud SQL PostgreSQL

Module pour créer une instance Google Cloud SQL PostgreSQL.

## Prérequis

1. **APIs GCP à activer** :
   ```bash
   gcloud services enable servicenetworking.googleapis.com sqladmin.googleapis.com
   ```

2. **Mot de passe** : Définir la variable `cloud_sql_database_password` (via `-var`, `TF_VAR_` ou `terraform.tfvars`).

## Utilisation

```hcl
module "cloud_sql" {
  source = "../../modules/cloud-sql"

  project_id         = "mon-projet"
  region             = "europe-west1"
  instance_name      = "bdd-adminserein"
  database_name     = "webapp-adminserein"
  database_user     = "postgres"
  database_password = var.cloud_sql_database_password
  network_id        = module.network.network_self_link
  enable_private_ip = true
}
```

## Connexion

- **Depuis une VM dans le même VPC** : utiliser l’IP privée ou Cloud SQL Auth Proxy avec `connection_name`.
- **Depuis l’extérieur** : Cloud SQL Auth Proxy ou ajouter des `authorized_networks` pour l’IP publique.

Exemple d’URL avec Cloud SQL Auth Proxy :
```
postgresql://user:password@/database?host=/cloudsql/project:region:instance
```
