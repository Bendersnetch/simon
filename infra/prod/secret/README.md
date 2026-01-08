# 🔐 Configuration des Secrets Production

Ce dossier contient les **templates de secrets** pour la production. Les secrets stockent les **variables sensibles** (mots de passe, tokens) séparément des ConfigMaps.

## ⚠️ IMPORTANT : Configuration avant déploiement

**Avant de déployer**, vous **DEVEZ** créer vos fichiers de secrets avec les vraies valeurs.

## 🚀 Méthode rapide (recommandée)

Utilisez le script helper qui génère automatiquement des mots de passe forts :

```bash
cd prod/secret
./create-secrets.sh
```

Le script :
- ✅ Génère un mot de passe fort aléatoire
- ✅ Crée automatiquement `postgres-secret.yaml` et `credentials-secret.yaml`
- ✅ Configure les bonnes permissions (chmod 600)
- ✅ Affiche le mot de passe pour que vous le sauvegardiez

**C'est tout !** Vous pouvez ensuite déployer directement.

---

## 📝 Méthode manuelle

Si vous préférez créer les secrets manuellement :

### Étape 1 : Copier les templates

```bash
cd prod/secret

# PostgreSQL
cp postgres-template.yaml postgres-secret.yaml

# Credentials applicatifs
cp credentials-template.yaml credentials-secret.yaml
```

### Étape 2 : Modifier les valeurs

#### `postgres-secret.yaml`

Ouvrez le fichier et remplacez `CHANGE_ME` par des **mots de passe forts** :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: "votre_mot_de_passe_postgres_fort"
  ROOT_PASSWORD: "votre_mot_de_passe_root_fort"
```

#### `credentials-secret.yaml`

Ouvrez le fichier et remplacez `CHANGE_ME_STRONG_PASSWORD` :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-credentials
type: Opaque
stringData:
  DB_PASSWORD: "le_meme_mot_de_passe_que_ROOT_PASSWORD"
```

**⚠️ IMPORTANT** : `DB_PASSWORD` doit être **identique** à `ROOT_PASSWORD` dans `postgres-secret.yaml` !

### Étape 3 : Sécuriser les fichiers

```bash
# Les fichiers *-secret.yaml contiennent vos vrais mots de passe
# NE LES COMMITTEZ PAS dans Git !

# Vérifier qu'ils sont dans .gitignore
cat ../../.gitignore | grep "secret.yaml"

# Permissions restreintes
chmod 600 *-secret.yaml
```

## 🚀 Déploiement

Une fois vos secrets configurés, le script `deploy-prod.sh` les déploiera automatiquement :

```bash
cd ../..  # Retour au dossier infra
./deploy-prod.sh
```

Le script applique automatiquement :
1. Les ConfigMaps (variables non-sensibles)
2. **Les Secrets** (variables sensibles)
3. Les déploiements

## 🔑 Secrets utilisés dans la stack

### Secret : `postgres-secret`

Utilisé par :
- StatefulSet PostgreSQL
- API Capteur (via `ROOT_PASSWORD`)

Variables :
- `POSTGRES_PASSWORD` : Mot de passe superuser PostgreSQL
- `ROOT_PASSWORD` : Mot de passe pour l'utilisateur `root`

### Secret : `app-credentials`

Utilisé par :
- API Auth User
- API Gateway Client
- API Ingestion

Variables :
- `DB_PASSWORD` : Mot de passe pour se connecter à PostgreSQL

### Secret : `dockerhub-secret`

Créé automatiquement par `deploy-prod.sh` si vous avez des images privées.

Utilisé par :
- Tous les déploiements (pull des images DockerHub)
- ArgoCD Image Updater (surveiller les images)

## 📝 Génération de mots de passe forts

### Option 1 : openssl (recommandé)

```bash
# Générer un mot de passe aléatoire de 32 caractères
openssl rand -base64 32
```

### Option 2 : pwgen

```bash
# Installer pwgen
sudo apt install pwgen

# Générer un mot de passe de 32 caractères
pwgen -s 32 1
```

### Option 3 : En ligne

Utilisez un générateur de mots de passe sécurisé :
- https://www.random.org/passwords/
- https://passwordsgenerator.net/

## 🔄 Mise à jour des secrets

Si vous devez **changer un mot de passe** après le déploiement :

```bash
# 1. Modifier le fichier secret
nano credentials-secret.yaml

# 2. Appliquer le changement
kubectl apply -f credentials-secret.yaml -n simon-prod --context prod

# 3. Redémarrer les pods pour qu'ils prennent le nouveau secret
kubectl rollout restart deployment/api-auth-user-deployment -n simon-prod --context prod
kubectl rollout restart deployment/api-gateway-client-deployment -n simon-prod --context prod
kubectl rollout restart deployment/api-ingestion-deployment -n simon-prod --context prod
```

## ⚠️ Sécurité : Bonnes pratiques

### ✅ À FAIRE

- ✅ Utiliser des **mots de passe forts** (minimum 16 caractères)
- ✅ Utiliser des mots de passe **différents** pour chaque environnement (dev/prod)
- ✅ **Ne jamais** committer les fichiers `*-secret.yaml` dans Git
- ✅ Restreindre les permissions : `chmod 600 *-secret.yaml`
- ✅ Sauvegarder vos secrets dans un **gestionnaire de mots de passe** (1Password, Bitwarden, etc.)

### ❌ À NE PAS FAIRE

- ❌ Ne pas utiliser des mots de passe simples (`password`, `root`, `123456`)
- ❌ Ne pas réutiliser le même mot de passe partout
- ❌ Ne pas partager les secrets par email/chat non chiffré
- ❌ Ne pas laisser les secrets en clair sur votre machine sans protection

## 📚 Exemple complet

```bash
# 1. Générer des mots de passe forts
DB_PASSWORD=$(openssl rand -base64 32)
echo "Votre DB_PASSWORD: $DB_PASSWORD"

# 2. Copier les templates
cp postgres-template.yaml postgres-secret.yaml
cp credentials-template.yaml credentials-secret.yaml

# 3. Remplacer dans postgres-secret.yaml
sed -i "s/CHANGE_ME/$DB_PASSWORD/g" postgres-secret.yaml

# 4. Remplacer dans credentials-secret.yaml
sed -i "s/CHANGE_ME_STRONG_PASSWORD/$DB_PASSWORD/g" credentials-secret.yaml

# 5. Vérifier
cat postgres-secret.yaml
cat credentials-secret.yaml

# 6. Sécuriser
chmod 600 *-secret.yaml

# 7. Déployer
cd ../..
./deploy-prod.sh
```

## 🆘 Troubleshooting

### Erreur : "secret not found"

**Cause** : Vous n'avez pas créé les fichiers `*-secret.yaml`

**Solution** :
```bash
cd prod/secret
cp postgres-template.yaml postgres-secret.yaml
cp credentials-template.yaml credentials-secret.yaml
# Puis modifiez les valeurs
```

### Erreur : Pods en CrashLoopBackOff

**Cause** : Le mot de passe dans `app-credentials` ne correspond pas à celui de PostgreSQL

**Solution** : Vérifiez que `DB_PASSWORD` (dans `credentials-secret.yaml`) = `ROOT_PASSWORD` (dans `postgres-secret.yaml`)

---

**🔒 La sécurité de votre production commence ici !**
