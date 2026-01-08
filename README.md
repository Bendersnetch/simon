![Architecture](./docs/architecture.png)
# Réseau de Capteurs IoT avec LoRaWAN & Microservices NestJS

## Aperçu du Projet
Ce projet est une solution IoT complète conçue pour collecter des données environnementales à partir de capteurs distants utilisant la technologie LoRaWAN et les traiter via une architecture robuste de microservices. Le système couvre l'intégralité de la chaîne, des nœuds de capteurs matériels jusqu'aux API d'ingestion et de visualisation basées sur le cloud.

## Fonctionnalités Clés
*   **Communication Longue Portée** : Utilise LoRaWAN pour une transmission de données longue portée à faible consommation d'énergie.
*   **Architecture Évolutive** : Construit avec des microservices NestJS pour gérer une ingestion de données à haut débit.
*   **Traitement en Temps Réel** : Utilise Redis pour la mise en cache et le traitement des flux de données.
*   **Stockage Fiable** : Assure la persistance des données des capteurs en utilisant Cassandra pour une haute disponibilité.

## Stack Matériel
### Nœud de Capteur
*   **Microcontrôleur** : Arduino
*   **Module de Communication** : Module LoRaWAN LA66
*   **Protocole** : LoRaWAN (Classe A, Activation ABP)
*   **Fréquence** : EU868 (868.1 MHz)

### Passerelle
*   **Appareil** : Raspberry Pi
*   **Logiciel** : Single Channel Packet Forwarder (Transmetteur de paquets monocanal)
*   **Cible** : The Things Network (TTN)

## Stack Logiciel
### Backend (Microservices)
Le backend est développé avec **NestJS** et structuré comme suit :
*   **API Ingestion** : Gère les flux de données entrants, utilise **Redis** pour le cache et **Cassandra** pour le stockage.
*   **API Auth** : Gère l'authentification et la sécurité des utilisateurs.
*   **API Sensor Data** : Expose des points de terminaison (endpoints) pour récupérer et gérer les données des capteurs.
*   **API Gateway** : Point d'entrée central pour les applications clientes.

### Infrastructure
*   **Base de Données** : Apache Cassandra
*   **Cache/Streaming** : Redis
*   **Conteneurisation** : Docker

## Flux d'Architecture
1.  Le **Nœud de Capteur** collecte les données et les envoie via LoRa.
2.  La **Passerelle LoRa** reçoit le paquet et le transmet à **The Things Network (TTN)**.
3.  **TTN** transfère la charge utile (payload) au **Service d'Ingestion**.
4.  Les données sont validées, traitées et stockées dans **Cassandra**.
5.  Les clients accèdent aux données via l'**API Gateway**.