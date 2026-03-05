#!/bin/bash
# Script de déploiement du serveur sur Cloud Run
# Usage: ./deploy-server.sh [--build-only]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PROD_DIR="$SCRIPT_DIR/../envs/prod"

cd "$REPO_ROOT"

# Charger les variables depuis terraform.tfvars si possible
PROJECT_ID="${TF_VAR_project_id:-adminserein}"
REGION="${TF_VAR_region:-europe-west1}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/server:latest"

echo "==> Étape 1: Créer le repository Artifact Registry (si nécessaire)"
cd "$PROD_DIR"
terraform apply -target=module.cloud_run.google_artifact_registry_repository.server -auto-approve 2>/dev/null || true

echo ""
echo "==> Étape 2: Build et push de l'image Docker"
cd "$REPO_ROOT"
gcloud builds submit --config=cloudbuild.yaml .

if [[ "$1" == "--build-only" ]]; then
  echo ""
  echo "Build terminé. Pour déployer:"
  echo "  cd infra/terraform/envs/prod"
  echo "  terraform apply -var=\"server_image=$IMAGE\""
  exit 0
fi

echo ""
echo "==> Étape 3: Déploiement Terraform"
cd "$PROD_DIR"
terraform apply -var="server_image=$IMAGE" -auto-approve

echo ""
echo "==> Déploiement terminé!"
terraform output cloud_run_url
