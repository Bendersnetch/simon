#!/bin/bash

echo "======================================"
echo "Migration de Minikube vers k3s"
echo "======================================"
echo ""
echo "Cette migration va :"
echo "  1. Sauvegarder vos secrets Kubernetes existants"
echo "  2. Supprimer Minikube complètement"
echo "  3. Nettoyer Docker et iptables"
echo "  4. Installer k3s"
echo "  5. Restaurer vos secrets"
echo "  6. Installer ArgoCD, Prometheus, Grafana, nginx-ingress"
echo ""
read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulé."
    exit 0
fi

echo ""
echo "======================================"
echo "Étape 1 : Sauvegarde des secrets"
echo "======================================"
echo ""

# Créer le dossier de sauvegarde
mkdir -p ~/backup-secrets

# Sauvegarder les secrets Postgres et credentials s'ils existent
kubectl get secret postgres-secret -n default -o yaml > ~/backup-secrets/postgres-secret.yaml 2>/dev/null && echo "✓ postgres-secret sauvegardé" || echo "⚠️  postgres-secret non trouvé"
kubectl get secret app-credentials -n default -o yaml > ~/backup-secrets/app-credentials.yaml 2>/dev/null && echo "✓ app-credentials sauvegardé" || echo "⚠️  app-credentials non trouvé"

echo ""
echo "======================================"
echo "Étape 2 : Suppression de Minikube"
echo "======================================"
echo ""

# Supprimer tous les clusters Minikube
minikube delete --all 2>/dev/null || echo "Minikube déjà supprimé ou non présent"

echo "✓ Minikube supprimé"
echo ""

echo "======================================"
echo "Étape 3 : Nettoyage Docker"
echo "======================================"
echo ""

# Nettoyer les conteneurs et réseaux Docker
docker system prune -af --volumes

echo "✓ Docker nettoyé"
echo ""

echo "======================================"
echo "Étape 4 : Nettoyage iptables"
echo "======================================"
echo ""

# Flush les règles iptables
sudo iptables -t filter -F
sudo iptables -t nat -F
sudo iptables -t mangle -F

# Remettre les politiques par défaut
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT

# Redémarrer Docker pour recréer ses règles
sudo systemctl restart docker
sleep 5

# Ajouter la règle DOCKER-USER
sudo iptables -I DOCKER-USER -j ACCEPT
sudo netfilter-persistent save

echo "✓ iptables nettoyé et reconfiguré"
echo ""

echo "======================================"
echo "Étape 5 : Installation de k3s"
echo "======================================"
echo ""

# Demander le nom DNS
read -p "Entrez le nom DNS de votre VM Azure (ex: simon-prod.uksouth.cloudapp.azure.com): " AZURE_DNS
if [ -z "$AZURE_DNS" ]; then
    echo "ERREUR: Le nom DNS est obligatoire"
    exit 1
fi

echo "✓ Nom DNS: $AZURE_DNS"
echo ""

# Installer k3s
echo "Installation de k3s..."
curl -sfL https://get.k3s.io | sh -s - \
    --write-kubeconfig-mode 644 \
    --disable traefik

# Configurer kubectl
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
echo "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml" >> ~/.bashrc

# Attendre que k3s soit prêt
echo "Attente que k3s soit prêt..."
sleep 20
kubectl wait --for=condition=Ready nodes --all --timeout=60s

echo "✓ k3s installé et prêt"
echo ""

echo "======================================"
echo "Étape 6 : Restauration des secrets"
echo "======================================"
echo ""

# Restaurer les secrets s'ils existent
if [ -f ~/backup-secrets/postgres-secret.yaml ]; then
    kubectl apply -f ~/backup-secrets/postgres-secret.yaml
    echo "✓ postgres-secret restauré"
fi

if [ -f ~/backup-secrets/app-credentials.yaml ]; then
    kubectl apply -f ~/backup-secrets/app-credentials.yaml
    echo "✓ app-credentials restauré"
fi

echo ""
echo "======================================"
echo "Étape 7 : Lancement du script d'installation k3s"
echo "======================================"
echo ""

# Rendre le script exécutable
chmod +x script-init-prod-k3s-traefik

# Lancer le script d'installation avec le DNS pré-configuré
echo "$AZURE_DNS" | ./script-init-prod-k3s-traefik

echo ""
echo "======================================"
echo "Migration terminée !"
echo "======================================"
echo ""
echo "Vérifications finales :"
echo ""
echo "1. Tous les pods :"
kubectl get pods -A
echo ""
echo "2. Nginx écoute sur 80/443 :"
sudo ss -tulpn | grep -E ':(80|443) '
echo ""
echo "3. Test depuis la VM :"
curl -H "Host: $AZURE_DNS" http://localhost/argocd | head -5
echo ""
echo "======================================"
echo "Testez depuis votre PC :"
echo "  http://$AZURE_DNS/argocd"
echo "======================================"
echo ""
