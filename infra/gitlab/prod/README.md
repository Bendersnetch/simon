# 🚀 Installation SIMON Production sur VM Azure

Guide complet pour déployer la stack SIMON sur une VM Azure avec auto-update depuis DockerHub.

## 📋 Prérequis

### Sur Azure

1. **VM Ubuntu** créée sur Azure
2. **DNS configuré** pour la VM :
   - Portail Azure → Votre VM → Configuration → DNS name label
   - Exemple : `simon-vm.francecentral.cloudapp.azure.com`
3. **Ports ouverts** dans le Network Security Group (NSG) :
   - Port **80** (HTTP)
   - Port **8080** (HTTP alternatif)

### Sur votre machine locale

- Accès au dépôt Git : `https://iut-git.unice.fr/simon/infra`
- Accès SSH à la VM Azure avec clé `.pem`
- **Permissions correctes sur la clé** : `chmod 400 votre-cle.pem` (si ce n'est pas déjà fait)

## 🎯 Installation complète (3 étapes)

### Étape 1 : Copier le dépôt vers la VM Azure

**Sur votre machine locale** :

```bash
# 1. Aller dans le dossier du projet
cd ~/simon-dev

# 2. Créer une archive du dossier infra (sans Git ni dev)
tar -czf infra.tar.gz --exclude='.git' --exclude='dev' infra/

# 3. Copier vers la VM Azure (avec clé .pem)
scp -i <chemin-vers-votre-cle.pem> infra.tar.gz <votre-user>@<dns-vm-azure>:~/
```

**Exemples** :

Avec IP publique :
```bash
scp -i ~/.ssh/simonprod_key.pem infra.tar.gz azureuser@172.187.130.6:~/
```

Avec DNS Azure (si configuré) :
```bash
scp -i ~/.ssh/simonprod_key.pem infra.tar.gz azureuser@simon-vm.francecentral.cloudapp.azure.com:~/
```

### Étape 2 : Configurer les secrets

**Sur la VM Azure (connexion SSH)** :

```bash
# 1. Se connecter à la VM (avec clé .pem)
ssh -i ~/.ssh/simonprod_key.pem azureuser@172.187.130.6

# Ou avec DNS Azure (si configuré) :
# ssh -i ~/.ssh/simonprod_key.pem azureuser@<votre-dns>.cloudapp.azure.com

# 2. Extraire l'archive
cd ~
tar -xzf infra.tar.gz
cd infra

# 3. Configurer les secrets (IMPORTANT !)
cd prod/secret

# Utiliser le script automatique (recommandé)
./create-secrets.sh
# Le script génère automatiquement des mots de passe forts
# ⚠️ Notez le mot de passe affiché et sauvegardez-le !

# Retour au dossier infra
cd ../..
```

📖 **Guide complet** : Consultez `prod/secret/README.md` pour plus de détails.

### Étape 3 : Installer l'infrastructure

```bash
# Lancer le script d'installation
./script-init-prod-env
```

**Le script va vous demander** :
- Le **DNS de votre VM** : entrez `simon-vm.francecentral.cloudapp.azure.com` (votre DNS Azure)

**Ce qui sera installé** :
- ✅ kubectl
- ✅ Minikube (driver "none" - bare metal, sans profil)
- ✅ Helm
- ✅ nginx-ingress (hostNetwork - ports 80/443 directement sur l'hôte)
- ✅ ArgoCD + ArgoCD Image Updater
- ✅ Prometheus + Grafana

⏱️ **Durée** : 5-10 minutes

**💡 Note technique** : Le script utilise `minikube start --driver=none` pour que Kubernetes tourne directement sur votre VM (bare metal) au lieu d'un conteneur Docker. Cela permet d'exposer directement les ports 80 et 443 sans tunnel ni redirection complexe. Le driver "none" ne supporte pas les profils multiples, donc on utilise le profil par défaut.

**⚠️ IMPORTANT** : À la fin, notez le **mot de passe ArgoCD** affiché.

### Étape 4 : Déployer les applications

**Sur la VM Azure** :

```bash
# Toujours dans le dossier infra
./deploy-prod.sh
```

**Ce qui sera déployé** :
1. Création d'un repo Git local (`~/simon-prod-repo`)
2. Déploiement de toutes les ressources :
   - ConfigMaps, Secrets
   - PostgreSQL, Cassandra, Kafka, Redis
   - Frontend (3 replicas)
   - 6 APIs/Services (3 replicas chacun)
3. Configuration de l'Application ArgoCD
4. Activation d'ArgoCD Image Updater

⏱️ **Durée** : 2-5 minutes

**⚠️ Configuration DockerHub** : Le script vous demandera si vos images sont **privées** ou **publiques** :

- **Images PUBLIQUES** : Appuyez sur `n` → Pas de credentials nécessaires
- **Images PRIVÉES** : Appuyez sur `y` et entrez :
  - DockerHub username (ex: `beirdinhos`)
  - DockerHub password ou **token** (recommandé : créez un token sur https://hub.docker.com/settings/security)
  - DockerHub email

💡 **Astuce** : Utilisez un **Access Token** au lieu de votre mot de passe (plus sécurisé)

## ✅ Vérification de l'installation

### Vérifier que tous les pods sont running

```bash
kubectl get pods -n simon-prod
```

Attendez que tous les pods soient `Running` (peut prendre 2-3 minutes).

### Accéder aux interfaces web

Depuis votre navigateur :

| Service | URL | Identifiants |
|---------|-----|--------------|
| **ArgoCD** | `http://<votre-dns-azure>/argocd` | admin / `<mot-de-passe-affiché>` |
| **Grafana** | `http://<votre-dns-azure>/grafana` | admin / admin |
| **Prometheus** | `http://<votre-dns-azure>/prometheus` | - |

Exemple : `http://simon-vm.francecentral.cloudapp.azure.com/argocd`

## 🎉 Auto-Update depuis DockerHub

**C'est maintenant automatique !** Voici comment ça fonctionne :

### Workflow complet

```
1. Vous développez et pushez sur DockerHub
   → docker push beirdinhos/frontend:latest

2. ArgoCD Image Updater détecte (toutes les 2 minutes)
   → Surveille DockerHub pour les nouvelles images

3. Image Updater met à jour automatiquement
   → Modifie le deployment YAML dans le repo Git local
   → Commit automatique

4. ArgoCD synchronise automatiquement
   → Détecte le changement Git
   → Redéploie le pod avec la nouvelle image

5. Votre application est mise à jour !
   → Nouveau pod démarré
   → Ancien pod supprimé
```

**Aucune action manuelle requise !** 🚀

### Images surveillées

ArgoCD Image Updater surveille automatiquement ces images sur DockerHub :

- `beirdinhos/frontend:latest`
- `beirdinhos/api-capteur:latest`
- `beirdinhos/api-auth-user:latest`
- `beirdinhos/api-gateway-client:latest`
- `beirdinhos/api-ingestion:latest`
- `beirdinhos/api-sensor-data:latest`
- `beirdinhos/service-ingestion-bdd:latest`

## 📊 Monitoring et Logs

### Voir les logs d'ArgoCD Image Updater

```bash
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater -f
```

Vous verrez les détections de nouvelles images en temps réel.

### Voir l'état de l'application ArgoCD

```bash
kubectl get application simon-prod -n argocd
```

### Voir tous les pods déployés

```bash
kubectl get pods -n simon-prod
```

### Suivre le déploiement en temps réel

```bash
kubectl get pods -n simon-prod -w
```

### Voir les logs d'un pod spécifique

```bash
kubectl logs -n simon-prod <nom-du-pod> -f
```

## 🛠️ Commandes utiles

### Redéployer manuellement (si besoin)

```bash
# Redéployer TOUTES les applications
kubectl rollout restart deployment -n simon-prod

# Redéployer une application spécifique
kubectl rollout restart deployment/frontend-deployment -n simon-prod
```

### Forcer une synchronisation ArgoCD

```bash
kubectl patch application simon-prod -n argocd \
  --type merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"normal"}}}' \
 
```

### Voir toutes les ressources déployées

```bash
kubectl get all -n simon-prod
```

### Voir les Ingress configurés

```bash
kubectl get ingress -A
```

## 📦 Architecture déployée

### Services applicatifs

| Service | Replicas | Port | Description |
|---------|----------|------|-------------|
| **frontend** | 3 | 80 | Application Next.js |
| **api-capteur** | 3 | 3000 | API gestion capteurs |
| **api-auth-user** | 3 | 3002 | API authentification |
| **api-gateway-client** | 3 | 3003 | API Gateway |
| **api-ingestion** | 3 | 3001 | API ingestion données |
| **api-sensor-data** | 3 | 3006 | API données capteurs |
| **service-ingestion-bdd** | 3 | 3004 | Service ingestion Cassandra |

### Bases de données

| Service | Type | Port |
|---------|------|------|
| **PostgreSQL** | StatefulSet | 5432 |
| **Cassandra** | StatefulSet | 9042 |
| **Kafka** | StatefulSet | 9092 |
| **Redis** | Deployment | 6379 |

### Infrastructure

| Service | Namespace | Description |
|---------|-----------|-------------|
| **nginx-ingress** | ingress-nginx | Reverse proxy (ports 80/8080) |
| **ArgoCD** | argocd | GitOps CD |
| **ArgoCD Image Updater** | argocd | Surveillance DockerHub |
| **Prometheus** | monitoring | Métriques |
| **Grafana** | monitoring | Dashboards |

## 🔑 Créer un Access Token DockerHub (recommandé)

Au lieu d'utiliser votre mot de passe DockerHub, créez un **Access Token** (plus sécurisé) :

1. Allez sur https://hub.docker.com/settings/security
2. Cliquez sur **New Access Token**
3. Nom : `simon-prod-azure` (ou autre)
4. Permissions : **Read, Write, Delete**
5. Cliquez sur **Generate**
6. **Copiez le token** (vous ne pourrez plus le voir après !)
7. Utilisez ce token comme "password" lors de l'installation

## ⚠️ Troubleshooting

### Problème : Les pods ne démarrent pas

**Solution** :

```bash
# Voir les événements
kubectl get events -n simon-prod --sort-by='.lastTimestamp'

# Voir les logs d'un pod en erreur
kubectl logs -n simon-prod <nom-pod>

# Décrire le pod pour voir l'erreur
kubectl describe pod <nom-pod> -n simon-prod
```

### Problème : Image Updater ne détecte pas les nouvelles images

**Solution** :

```bash
# 1. Vérifier les logs d'Image Updater
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --tail=50

# 2. Vérifier la configuration de l'Application ArgoCD
kubectl get application simon-prod -n argocd -o yaml | grep -A 20 annotations

# 3. Forcer un refresh
kubectl patch application simon-prod -n argocd \
  --type merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}' \
 
```

### Problème : ArgoCD ne synchronise pas

**Solution** :

```bash
# Voir l'état détaillé
kubectl describe application simon-prod -n argocd

# Forcer la synchronisation
kubectl patch application simon-prod -n argocd \
  --type merge \
  -p '{"spec":{"syncPolicy":{"automated":{"prune":true,"selfHeal":true}}}}' \
 
```

### Problème : Erreur `ImagePullBackOff` ou `ErrImagePull`

**Cause** : Kubernetes ne peut pas télécharger l'image depuis DockerHub (credentials manquants ou invalides)

**Solution** :

```bash
# 1. Vérifier si le secret existe
kubectl get secret dockerhub-secret -n simon-prod

# 2. Si le secret n'existe pas ou est invalide, le recréer
kubectl delete secret dockerhub-secret -n simon-prod || true

kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://registry-1.docker.io \
  --docker-username=<votre-username> \
  --docker-password=<votre-token> \
  --docker-email=<votre-email> \
  -n simon-prod

# 3. Redéployer
kubectl rollout restart deployment -n simon-prod
```

### Problème : nginx-ingress pod reste en "Pending" ou services non accessibles

**Cause** : Avec le driver "none", Minikube utilise directement les ressources de l'hôte.

**Solution** : Vérifiez que :

```bash
# 1. Minikube utilise bien le driver "none"
minikube profile list

# 2. nginx-ingress est bien en hostNetwork
kubectl get daemonset ingress-nginx-controller -n ingress-nginx -o yaml | grep hostNetwork

# 3. Le pod nginx-ingress fonctionne
kubectl get pods -n ingress-nginx

# 4. Les ports 80 et 443 sont bien ouverts
sudo netstat -tulpn | grep -E ':(80|443) '
```

### Problème : Impossible d'accéder aux interfaces web

**Vérifications** :

1. **Ports ouverts** dans le NSG Azure ?
   ```bash
   # Sur la VM, vérifier nginx-ingress
   kubectl get pods -n ingress-nginx
   ```

2. **DNS bien configuré** ?
   ```bash
   # Ping depuis votre machine
   ping simon-vm.francecentral.cloudapp.azure.com
   ```

3. **Ingress bien créés** ?
   ```bash
   kubectl get ingress -A
   ```

## 🔄 Mise à jour de l'infrastructure

Si vous modifiez les manifests dans `prod/` :

```bash
# 1. Sur votre machine locale, recréer l'archive
cd ~/simon-dev
tar -czf infra.tar.gz --exclude='.git' --exclude='dev' infra/
scp infra.tar.gz <user>@<vm-azure>:~/

# 2. Sur la VM Azure
cd ~
tar -xzf infra.tar.gz
cd infra

# 3. Appliquer les changements
kubectl apply -f prod/ -R -n simon-prod

# 4. Mettre à jour le repo Git local
rm -rf ~/simon-prod-repo
./deploy-prod.sh
```

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs ArgoCD Image Updater
- Vérifier les événements Kubernetes
- Consulter l'interface ArgoCD pour l'état de synchronisation

---

**🎉 Installation terminée ! Votre stack SIMON est maintenant déployée avec auto-update depuis DockerHub.**
