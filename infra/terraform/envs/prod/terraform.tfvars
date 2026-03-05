# Projet GCP
project_id = "adminserein"
region     = "europe-west1"
zone       = "europe-west1-b"

# Cloud SQL
cloud_sql_database_password = "password"

# Cloud Run (à adapter après 1er deploy)
better_auth_secret = "5R9YgmtaOr2ggSHxa6RUzjT5DzAHAmTk"
better_auth_url    = "https://adminserein-server-n5npcdmm5a-ew.a.run.app"  # Remplacer par l'URL réelle
cors_origin        = "http://localhost:3001"  # URL du frontend
server_image       = "europe-west1-docker.pkg.dev/adminserein/cloud-run-source-deploy/server:latest"
