#!/bin/bash
# Script de déploiement du frontend sur Cloud Run
# Usage: ./deploy-web.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PROD_DIR="$SCRIPT_DIR/../envs/prod"

cd "$REPO_ROOT"

PROJECT_ID="${TF_VAR_project_id:-adminserein}"
REGION="${TF_VAR_region:-europe-west1}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/web:latest"

echo "==> Étape 1: Build et push de l'image Docker"
gcloud builds submit --config=cloudbuild-web.yaml .

echo ""
echo "==> Étape 2: Déploiement Terraform"
cd "$PROD_DIR"
terraform apply -var="web_image=$IMAGE" -auto-approve

echo ""
echo "==> Déploiement terminé!"
echo "URL du frontend:"
terraform output cloud_run_web_url
echo ""
echo "IMPORTANT: Mettre à jour cors_origin dans terraform.tfvars avec l'URL ci-dessus,"
echo "puis relancer: terraform apply"
