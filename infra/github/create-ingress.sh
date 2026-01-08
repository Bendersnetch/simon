#!/bin/bash

echo "======================================"
echo "Création des Ingress"
echo "======================================"
echo ""

# Créer le dossier ingress
mkdir -p prod/ingress

# Ingress ArgoCD
cat > prod/ingress/argocd.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  ingressClassName: nginx
  rules:
  - host: simon-prod.uksouth.cloudapp.azure.com
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

# Ingress Prometheus
cat > prod/ingress/prometheus.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus-ingress
  namespace: monitoring
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: simon-prod.uksouth.cloudapp.azure.com
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

# Ingress Grafana
cat > prod/ingress/grafana.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: simon-prod.uksouth.cloudapp.azure.com
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

# Appliquer tous les Ingress
echo "Application des Ingress..."
kubectl apply -f prod/ingress/argocd.yaml
kubectl apply -f prod/ingress/prometheus.yaml
kubectl apply -f prod/ingress/grafana.yaml

echo ""
echo "Configuration de Grafana pour sub-path..."
kubectl set env deployment/prometheus-grafana -n monitoring \
  GF_SERVER_ROOT_URL="http://simon-prod.uksouth.cloudapp.azure.com/grafana" \
  GF_SERVER_SERVE_FROM_SUB_PATH="true"

echo ""
echo "======================================"
echo "Ingress créés avec succès"
echo "======================================"
echo ""
kubectl get ingress -A

echo ""
echo "Vérification nginx..."
sudo ss -tulpn | grep -E ':(80|443) '

echo ""
echo "Si nginx n'écoute pas sur 80/443, vérifiez la configuration du pod nginx."
