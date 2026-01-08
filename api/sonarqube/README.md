# SonarQube

Ce dépôt sert à tester les APIs localement avec SonarQube.

Après avoir cloné le dépôt, veuillez exécuter les commandes suivantes :

```shell
docker compose up -d
```

SonarQube est maintenant lancé à l'adresse : http://localhost:9000

Étape suivante : créer un token dans SonarQube

   - Connectez-vous avec les identifiants par défaut : `admin - admin`

   - Dans l'onglet Sécurité du compte admin, ajoutez un token.

Ajouter les APIs dans SonarQube

Pour WSL / Linux :
```shell
chmod +x ./sonarqube.sh
./sonarqube.sh <YOUR_TOKEN>
```

Pour Docker Desktop :
```shell
chmod +x ./sonarqube.sh
./sonarqube.sh -d <YOUR_TOKEN>
```

Patientez jusqu'à la fin du processus et consultez SonarQube.

