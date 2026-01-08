# Déploiement SIMON en Production sur Azure

## 📋 Prérequis

- Une VM Azure avec Ubuntu
- DNS configuré pour la VM (ex: `simon.francecentral.cloudapp.azure.com`)
- Ports ouverts dans le NSG Azure : **80** et **8080**

## 🚀 Installation complète

### 1. Copier le dépôt infra vers la VM Azure

Depuis votre machine locale :

```bash
cd /home/erwan/simon-dev
tar -czf infra.tar.gz --exclude='.git' --exclude='dev' infra/
scp infra.tar.gz <user>@<vm-azure>:~/
```

Sur la VM Azure :

```bash
tar -xzf infra.tar.gz
cd infra
```

### 2. Installer l'infrastructure

```bash
./script-init-prod-env
```

Ce script installe :
- ✅ Docker, kubectl, minikube, Helm
- ✅ Minikube (profil prod)
- ✅ nginx-ingress (ports 80/8080)
- ✅ **ArgoCD + ArgoCD Image Updater**
- ✅ Prometheus + Grafana
- ✅ Ingress pour tous les services

À la fin, notez le **mot de passe ArgoCD** affiché.

### 3. Déployer les applications

```bash
./deploy-prod.sh
```

Ce script :
1. Crée un **repo Git local** sur la VM (`~/simon-prod-repo`)
2. Déploie toutes les applications (BDD, APIs, frontend)
3. Crée une **Application ArgoCD** avec Image Updater
4. Configure la surveillance automatique des images DockerHub

## 🎯 Comment ça fonctionne

### Auto-Update depuis DockerHub

**ArgoCD Image Updater** surveille automatiquement vos images sur DockerHub :

1. Vous pushez une nouvelle image : `docker push beirdinhos/frontend:latest`
2. Image Updater détecte la nouvelle version (check toutes les **2 minutes**)
3. Image Updater met à jour le fichier deployment dans le **repo Git local**
4. ArgoCD détecte le changement Git et **redéploie automatiquement**

**Aucune action manuelle requise** ! 🎉

### Images surveillées

- `beirdinhos/frontend:latest`
- `beirdinhos/api-capteur:latest`
- `beirdinhos/api-auth-user:latest`
- `beirdinhos/api-gateway-client:latest`
- `beirdinhos/api-ingestion:latest`
- `beirdinhos/api-sensor-data:latest`
- `beirdinhos/service-ingestion-bdd:latest`

## 🔍 Monitoring et Debug

### Voir les logs d'Image Updater

```bash
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --context prod -f
```

### Voir l'état de l'application ArgoCD

```bash
kubectl get application simon-prod -n argocd --context prod
```

### Voir les pods déployés

```bash
kubectl get pods -n simon-prod --context prod -w
```

### Accéder à ArgoCD UI

```bash
# URL : http://<votre-dns-azure>/argocd
# Username: admin
# Password: <affiché lors de l'installation>
```

### Accéder à Grafana

```bash
# URL : http://<votre-dns-azure>/grafana
# Username: admin
# Password: admin
```

### Accéder à Prometheus

```bash
# URL : http://<votre-dns-azure>/prometheus
```

## 📦 Services déployés

| Service | Type | Port |
|---------|------|------|
| **Frontend** | Application | 80 |
| **API Capteur** | API | 3000 |
| **API Ingestion** | API | 3001 |
| **API Auth User** | API | 3002 |
| **API Gateway** | API | 3003 |
| **Service Ingestion BDD** | Worker | 3004 |
| **API Sensor Data** | API | 3006 |
| **PostgreSQL** | BDD | 5432 |
| **Cassandra** | BDD | 9042 |
| **Kafka** | Message Queue | 9092 |
| **Redis** | Cache | 6379 |

## 🔧 Commandes utiles

### Forcer une synchronisation ArgoCD

```bash
kubectl patch application simon-prod -n argocd \
  --type merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"normal"}}}' \
  --context prod
```

### Redéployer manuellement une application

```bash
# Toutes les apps
kubectl rollout restart deployment -n simon-prod --context prod

# Une seule app
kubectl rollout restart deployment/frontend-deployment -n simon-prod --context prod
```

### Voir les ressources déployées

```bash
kubectl get all -n simon-prod --context prod
```

### Vérifier les Ingress

```bash
kubectl get ingress -A --context prod
```

## ⚠️ Troubleshooting

### Image Updater ne détecte pas les nouvelles images

1. Vérifier les logs :
   ```bash
   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --context prod --tail=100
   ```

2. Vérifier que l'annotation est correcte :
   ```bash
   kubectl get application simon-prod -n argocd --context prod -o yaml
   ```

### ArgoCD ne synchronise pas

1. Vérifier l'état de l'app :
   ```bash
   kubectl describe application simon-prod -n argocd --context prod
   ```

2. Forcer un refresh :
   ```bash
   kubectl patch application simon-prod -n argocd \
     --type merge \
     -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}' \
     --context prod
   ```

### Les pods ne démarrent pas

1. Voir les événements :
   ```bash
   kubectl get events -n simon-prod --context prod --sort-by='.lastTimestamp'
   ```

2. Voir les logs d'un pod :
   ```bash
   kubectl logs -n simon-prod <pod-name> --context prod
   ```

## 🎉 Architecture finale

```
┌─────────────────────────────────────────────────┐
│           VM Azure (Minikube prod)              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  nginx-ingress (ports 80/8080)           │  │
│  │  ├─ /argocd      → ArgoCD UI             │  │
│  │  ├─ /prometheus  → Prometheus            │  │
│  │  └─ /grafana     → Grafana               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  ArgoCD + Image Updater                  │  │
│  │  ↓ surveille DockerHub (2min)            │  │
│  │  ↓ détecte nouvelle image                │  │
│  │  ↓ commit dans repo Git local            │  │
│  │  ↓ sync automatique                      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Namespace: simon-prod                   │  │
│  │  ├─ Frontend (3 replicas)                │  │
│  │  ├─ API Capteur (3 replicas)             │  │
│  │  ├─ API Auth User (3 replicas)           │  │
│  │  ├─ API Gateway (3 replicas)             │  │
│  │  ├─ API Ingestion (3 replicas)           │  │
│  │  ├─ API Sensor Data (3 replicas)         │  │
│  │  ├─ Service Ingestion BDD (3 replicas)   │  │
│  │  ├─ PostgreSQL (StatefulSet)             │  │
│  │  ├─ Cassandra (StatefulSet)              │  │
│  │  ├─ Kafka (StatefulSet)                  │  │
│  │  └─ Redis (Deployment)                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Repo Git local                          │  │
│  │  ~/simon-prod-repo/prod/                 │  │
│  │  (Image Updater écrit ici)               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```
