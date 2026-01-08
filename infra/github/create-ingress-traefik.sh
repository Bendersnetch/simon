#!/bin/bash

echo "======================================"
echo "Création des Ingress pour Traefik"
echo "======================================"
echo ""

read -p "Entrez le nom DNS de votre VM Azure: " AZURE_DNS
if [ -z "$AZURE_DNS" ]; then
    echo "ERREUR: Le nom DNS est obligatoire"
    exit 1
fi

# Créer le dossier ingress
mkdir -p prod/ingress

# --- 1. Ingress ArgoCD ---
# On retire le middleware StripPrefix car on utilise --rootpath /argocd sur le pod
cat > prod/ingress/argocd.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  ingressClassName: traefik
  rules:
  - host: ${AZURE_DNS}
    http:
      paths:
      - path: /argocd
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 80
EOF

echo "✓ ArgoCD Ingress créé"

# --- 2. Ingress Prometheus ---
cat > prod/ingress/prometheus.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus-ingress
  namespace: monitoring
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  ingressClassName: traefik
  rules:
  - host: ${AZURE_DNS}
    http:
      paths:
      - path: /prometheus
        pathType: Prefix
        backend:
          service:
            name: prometheus-kube-prometheus-prometheus
            port:
              number: 9090
EOF

echo "✓ Prometheus Ingress créé"

# --- 3. Ingress Grafana ---
cat > prod/ingress/grafana.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  ingressClassName: traefik
  rules:
  - host: ${AZURE_DNS}
    http:
      paths:
      - path: /grafana
        pathType: Prefix
        backend:
          service:
            name: prometheus-grafana
            port:
              number: 80
EOF

echo "✓ Grafana Ingress créé"
echo ""

# Application des ressources
echo "Application des Ingress..."
kubectl apply -f prod/ingress/argocd.yaml
kubectl apply -f prod/ingress/prometheus.yaml
kubectl apply -f prod/ingress/grafana.yaml

echo ""
echo "======================================"
echo "Statut des Ingress :"
echo "======================================"
kubectl get ingress -A

echo ""
echo "Vérification des ports système (80/443)..."
sudo ss -tulpn | grep -E ':(80|443) ' || echo "⚠️ Attention: Rien n'écoute sur les ports 80/443"

echo ""
echo "✓ Terminé. Accès via http://${AZURE_DNS}/argocd"
