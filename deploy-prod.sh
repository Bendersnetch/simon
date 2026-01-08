#!/bin/bash

# Script de déploiement SIMON en prod avec ArgoCD Image Updater
# Crée un repo Git local et configure ArgoCD pour surveiller les images DockerHub

set -e

echo "======================================"
echo "Déploiement SIMON Production"
echo "======================================"
echo ""

# Vérifier que kubectl est configuré
if ! kubectl config get-contexts | grep -q "prod"; then
    echo "❌ Erreur: Le contexte 'prod' n'existe pas"
    exit 1
fi

# Vérifier que les fichiers existent
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -d "$SCRIPT_DIR/prod" ]; then
    echo "❌ Erreur: Le dossier 'prod' n'existe pas"
    echo "   Copiez le dépôt infra sur cette machine d'abord"
    exit 1
fi

echo "✓ Contexte kubectl configuré"
echo "✓ Manifests prod trouvés"
echo ""

# Créer un repo Git local pour ArgoCD
echo "======================================"
echo "Création du repo Git local pour ArgoCD"
echo "======================================"
echo ""
GIT_REPO_DIR="$HOME/simon-prod-repo"
if [ -d "$GIT_REPO_DIR" ]; then
    echo "⚠️  Le repo existe déjà, on le supprime et on le recrée..."
    rm -rf "$GIT_REPO_DIR"
fi

mkdir -p "$GIT_REPO_DIR"
cp -r "$SCRIPT_DIR/prod" "$GIT_REPO_DIR/"
cd "$GIT_REPO_DIR"

# Initialiser Git
git init
git config user.email "argocd@simon.local"
git config user.name "ArgoCD Local"
git add .
git commit -m "Initial deployment"

echo "✓ Repo Git local créé: $GIT_REPO_DIR"
echo ""

# Vérifier que les secrets existent
echo "======================================"
echo "Vérification des secrets"
echo "======================================"
echo ""

SECRETS_OK=true

if [ ! -f "$SCRIPT_DIR/prod/secret/postgres-secret.yaml" ]; then
    echo "❌ ERREUR: Le fichier 'postgres-secret.yaml' n'existe pas !"
    echo "   Vous devez créer vos fichiers de secrets avant de déployer."
    echo ""
    echo "   Étapes :"
    echo "   1. cd $SCRIPT_DIR/prod/secret"
    echo "   2. cp postgres-template.yaml postgres-secret.yaml"
    echo "   3. Modifiez postgres-secret.yaml avec vos vrais mots de passe"
    echo ""
    SECRETS_OK=false
fi

if [ ! -f "$SCRIPT_DIR/prod/secret/credentials-secret.yaml" ]; then
    echo "❌ ERREUR: Le fichier 'credentials-secret.yaml' n'existe pas !"
    echo "   Vous devez créer vos fichiers de secrets avant de déployer."
    echo ""
    echo "   Étapes :"
    echo "   1. cd $SCRIPT_DIR/prod/secret"
    echo "   2. cp credentials-template.yaml credentials-secret.yaml"
    echo "   3. Modifiez credentials-secret.yaml avec vos vrais mots de passe"
    echo ""
    SECRETS_OK=false
fi

# Vérifier que les secrets ne contiennent pas les valeurs par défaut
if [ -f "$SCRIPT_DIR/prod/secret/postgres-secret.yaml" ]; then
    if grep -q "CHANGE_ME" "$SCRIPT_DIR/prod/secret/postgres-secret.yaml"; then
        echo "⚠️  ATTENTION: postgres-secret.yaml contient encore 'CHANGE_ME' !"
        echo "   Vous devez remplacer les mots de passe par défaut."
        SECRETS_OK=false
    fi
fi

if [ -f "$SCRIPT_DIR/prod/secret/credentials-secret.yaml" ]; then
    if grep -q "CHANGE_ME" "$SCRIPT_DIR/prod/secret/credentials-secret.yaml"; then
        echo "⚠️  ATTENTION: credentials-secret.yaml contient encore 'CHANGE_ME' !"
        echo "   Vous devez remplacer les mots de passe par défaut."
        SECRETS_OK=false
    fi
fi

if [ "$SECRETS_OK" = false ]; then
    echo ""
    echo "📖 Consultez le guide : $SCRIPT_DIR/prod/secret/README.md"
    echo ""
    exit 1
fi

echo "✓ Fichiers de secrets trouvés et configurés"
echo ""

# Créer le namespace
echo "Création du namespace simon-prod..."
kubectl create namespace simon-prod --context prod 2>/dev/null || echo "  Namespace déjà existant"

# Déployer dans l'ordre
echo ""
echo "Déploiement des ConfigMaps..."
kubectl apply -f "$SCRIPT_DIR/prod/configmap/" -n simon-prod --context prod

echo ""
echo "Déploiement des Secrets..."
kubectl apply -f "$SCRIPT_DIR/prod/secret/postgres-secret.yaml" -n simon-prod --context prod
kubectl apply -f "$SCRIPT_DIR/prod/secret/credentials-secret.yaml" -n simon-prod --context prod

echo ""
echo "Déploiement des StatefulSets (BDD)..."
kubectl apply -f "$SCRIPT_DIR/prod/statefulset/" -n simon-prod --context prod

echo ""
echo "Attente que les StatefulSets soient prêts (30s)..."
sleep 30

echo ""
echo "Déploiement des Services..."
kubectl apply -f "$SCRIPT_DIR/prod/service/" -n simon-prod --context prod

echo ""
echo "Déploiement des Deployments (applications)..."
kubectl apply -f "$SCRIPT_DIR/prod/deployment/" -n simon-prod --context prod

echo ""
echo "======================================"
echo "Configuration ArgoCD Application"
echo "======================================"
echo ""

# Créer l'Application ArgoCD
cat <<EOF | kubectl apply -f - --context prod
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: simon-prod
  namespace: argocd
  annotations:
    # ArgoCD Image Updater - surveille DockerHub automatiquement
    argocd-image-updater.argoproj.io/image-list: |
      frontend=beirdinhos/frontend,
      api-capteur=beirdinhos/api-capteur,
      api-auth-user=beirdinhos/api-auth-user,
      api-gateway-client=beirdinhos/api-gateway-client,
      api-ingestion=beirdinhos/api-ingestion,
      api-sensor-data=beirdinhos/api-sensor-data,
      service-ingestion-bdd=beirdinhos/service-ingestion-bdd
    # Prendre toujours la dernière version
    argocd-image-updater.argoproj.io/frontend.update-strategy: "latest"
    argocd-image-updater.argoproj.io/api-capteur.update-strategy: "latest"
    argocd-image-updater.argoproj.io/api-auth-user.update-strategy: "latest"
    argocd-image-updater.argoproj.io/api-gateway-client.update-strategy: "latest"
    argocd-image-updater.argoproj.io/api-ingestion.update-strategy: "latest"
    argocd-image-updater.argoproj.io/api-sensor-data.update-strategy: "latest"
    argocd-image-updater.argoproj.io/service-ingestion-bdd.update-strategy: "latest"
    # Écrire dans le repo Git local
    argocd-image-updater.argoproj.io/write-back-method: "git"
    argocd-image-updater.argoproj.io/git-branch: "master"
spec:
  project: default

  source:
    repoURL: file://$GIT_REPO_DIR
    targetRevision: master
    path: prod

  destination:
    server: https://kubernetes.default.svc
    namespace: simon-prod

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF

echo "✓ Application ArgoCD créée avec Image Updater"
echo ""

# Configurer les credentials DockerHub (si images privées)
echo "======================================"
echo "Configuration DockerHub (images privées)"
echo "======================================"
echo ""
echo "Vos images DockerHub sont-elles PRIVÉES ?"
echo "  - PUBLIC : Tout le monde peut les télécharger (pas de credentials)"
echo "  - PRIVÉ  : Besoin d'un login/password pour y accéder"
echo ""
read -p "Vos images sont-elles PRIVÉES ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Configuration des credentials DockerHub..."
    echo ""
    read -p "DockerHub username: " DOCKERHUB_USER
    read -sp "DockerHub password (ou token): " DOCKERHUB_PASS
    echo ""
    read -p "DockerHub email: " DOCKERHUB_EMAIL

    # Créer le secret dans le namespace argocd
    kubectl create secret docker-registry dockerhub-secret \
      --docker-server=https://registry-1.docker.io \
      --docker-username="$DOCKERHUB_USER" \
      --docker-password="$DOCKERHUB_PASS" \
      --docker-email="$DOCKERHUB_EMAIL" \
      --context prod -n argocd \
      --dry-run=client -o yaml | kubectl apply -f - --context prod

    # Créer le même secret dans le namespace simon-prod (pour pull les images)
    kubectl create secret docker-registry dockerhub-secret \
      --docker-server=https://registry-1.docker.io \
      --docker-username="$DOCKERHUB_USER" \
      --docker-password="$DOCKERHUB_PASS" \
      --docker-email="$DOCKERHUB_EMAIL" \
      --context prod -n simon-prod \
      --dry-run=client -o yaml | kubectl apply -f - --context prod

    echo "✓ Credentials DockerHub configurés"
    echo ""
else
    echo "✓ Pas de credentials nécessaires (images publiques)"
    echo ""
fi

echo "======================================"
echo "Déploiement terminé !"
echo "======================================"
echo ""

echo "Vérification de l'état des pods..."
kubectl get pods -n simon-prod --context prod

echo ""
echo "======================================"
echo "🚀 Auto-Update DockerHub activé !"
echo "======================================"
echo ""
echo "ArgoCD Image Updater surveille automatiquement vos images DockerHub :"
echo "  - beirdinhos/frontend:latest"
echo "  - beirdinhos/api-capteur:latest"
echo "  - beirdinhos/api-auth-user:latest"
echo "  - beirdinhos/api-gateway-client:latest"
echo "  - beirdinhos/api-ingestion:latest"
echo "  - beirdinhos/api-sensor-data:latest"
echo "  - beirdinhos/service-ingestion-bdd:latest"
echo ""
echo "Quand vous pushez une nouvelle image sur DockerHub :"
echo "  1. Image Updater détecte la nouvelle version (toutes les 2 minutes)"
echo "  2. Met à jour automatiquement le déploiement dans Kubernetes"
echo "  3. ArgoCD redéploie automatiquement"
echo ""
echo "Pour suivre les mises à jour automatiques :"
echo "  kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --context prod -f"
echo ""
echo "Pour voir l'état de l'application ArgoCD :"
echo "  kubectl get application simon-prod -n argocd --context prod"
echo ""
echo "Pour suivre le démarrage des pods :"
echo "  kubectl get pods -n simon-prod --context prod -w"
echo ""
