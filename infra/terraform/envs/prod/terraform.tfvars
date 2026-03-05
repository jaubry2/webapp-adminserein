# Projet GCP
project_id = "adminserein"
region     = "europe-west1"
zone       = "europe-west1-b"

# Cloud SQL
cloud_sql_database_password = "password"


# Mot de passe pour Cloud SQL (obligatoire)
# Définir via: terraform plan -var="cloud_sql_database_password=VOTRE_MOT_DE_PASSE"
# Ou créer terraform.tfvars avec:
# cloud_sql_database_password = "votre-mot-de-passe-securise"
