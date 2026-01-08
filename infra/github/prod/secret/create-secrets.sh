#!/bin/bash

# Script helper pour créer rapidement les secrets de production

set -e

echo "======================================"
echo "Création des secrets de production"
echo "======================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Vérifier si les fichiers existent déjà
if [ -f "$SCRIPT_DIR/postgres-secret.yaml" ] || [ -f "$SCRIPT_DIR/credentials-secret.yaml" ]; then
    echo "⚠️  Des fichiers de secrets existent déjà !"
    echo ""
    ls -la "$SCRIPT_DIR"/*-secret.yaml 2>/dev/null || true
    echo ""
    read -p "Voulez-vous les ÉCRASER et en créer de nouveaux ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Opération annulée."
        exit 0
    fi
fi

echo ""
echo "======================================"
echo "Génération des mots de passe"
echo "======================================"
echo ""

# Générer un mot de passe fort
DB_PASSWORD=$(openssl rand -base64 32)

echo "✓ Mot de passe généré : $DB_PASSWORD"
echo ""
echo "⚠️  IMPORTANT : Sauvegardez ce mot de passe dans un gestionnaire de mots de passe !"
echo ""

# Créer postgres-secret.yaml
echo "Création de postgres-secret.yaml..."
cat > "$SCRIPT_DIR/postgres-secret.yaml" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: "$DB_PASSWORD"
  ROOT_PASSWORD: "$DB_PASSWORD"
EOF

echo "✓ postgres-secret.yaml créé"

# Créer credentials-secret.yaml
echo "Création de credentials-secret.yaml..."
cat > "$SCRIPT_DIR/credentials-secret.yaml" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: app-credentials
type: Opaque
stringData:
  DB_PASSWORD: "$DB_PASSWORD"
EOF

echo "✓ credentials-secret.yaml créé"
echo ""

# Sécuriser les fichiers
chmod 600 "$SCRIPT_DIR"/*-secret.yaml
echo "✓ Permissions sécurisées (chmod 600)"
echo ""

echo "======================================"
echo "✅ Secrets créés avec succès !"
echo "======================================"
echo ""
echo "Fichiers créés :"
echo "  - $SCRIPT_DIR/postgres-secret.yaml"
echo "  - $SCRIPT_DIR/credentials-secret.yaml"
echo ""
echo "Mot de passe utilisé partout : $DB_PASSWORD"
echo ""
echo "⚠️  N'oubliez pas de sauvegarder ce mot de passe !"
echo ""
echo "Vous pouvez maintenant déployer :"
echo "  cd ../.."
echo "  ./deploy-prod.sh"
echo ""
