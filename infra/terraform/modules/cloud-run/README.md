# Module Cloud Run

Déploie le serveur Hono sur Google Cloud Run avec connexion Cloud SQL.

## Prérequis

- Cloud SQL déjà déployé
- APIs activées: `run.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`

## Variables requises

- `database_url` : URL PostgreSQL (format socket Cloud SQL)
- `better_auth_secret` : Secret Better Auth (32+ caractères)
- `better_auth_url` : URL publique du serveur
- `cors_origin` : URL du frontend
- `image` : Image Docker complète

## Déploiement

Voir le script `infra/terraform/scripts/deploy-server.sh` pour le workflow complet.
