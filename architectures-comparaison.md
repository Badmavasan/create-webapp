# Architecture Monolithique vs Architecture Microservices

---

## Vue d'ensemble

```
MONOLITHIQUE                          MICROSERVICES
────────────────────                  ──────────────────────────────────────

┌──────────────────┐                  ┌─────────┐  ┌─────────┐  ┌────────┐
│                  │                  │ Service │  │ Service │  │Service │
│   AUTH           │                  │  Auth   │  │Produits │  │Commande│
│   PRODUITS       │                  └────┬────┘  └────┬────┘  └───┬────┘
│   COMMANDES      │                       │             │            │
│   PAIEMENTS      │                  ─────┴─────────────┴────────────┴────
│   NOTIFICATIONS  │                             API Gateway
│                  │                  ─────────────────────────────────────
└────────┬─────────┘                       │            │            │
         │                            ┌────┴────┐  ┌────┴────┐  ┌───┴────┐
    ┌────┴────┐                       │   DB    │  │   DB    │  │   DB   │
    │   DB    │                       │  Auth   │  │Produits │  │Commande│
    └─────────┘                       └─────────┘  └─────────┘  └────────┘

  1 seul déploiement                    N déploiements indépendants
  1 seule base de données               1 base de données par service
```

---

## Comparaison détaillée

| Critère | Monolithique | Microservices |
|---|---|---|
| **Structure** | Une seule application unifiée | Ensemble de services indépendants |
| **Déploiement** | Tout déployer à chaque release | Déployer service par service |
| **Scalabilité** | Tout scaler ou rien | Scaler uniquement les services sous charge |
| **Base de données** | Une seule partagée | Une par service (isolation des données) |
| **Communication** | Appels de fonctions internes | HTTP/REST, gRPC, ou messages asynchrones |
| **Complexité initiale** | Faible (démarrer vite) | Élevée (orchestration, réseau, CI/CD) |
| **Complexité opérationnelle** | Faible | Élevée (monitoring distribué, tracing) |
| **Tolérance aux pannes** | Un bug peut tout faire tomber | Panne isolée au service concerné |
| **Technologies** | Stack unique | Stack différente par service (polyglot) |
| **Équipe** | Idéal pour petite équipe | Idéal pour équipes multiples autonomes |

---

## Architecture Monolithique

### Principe

Toute la logique applicative est regroupée dans **un seul projet, un seul processus, un seul déploiement**.

```
┌─────────────────────────────────────────────────┐
│                  Application                    │
│                                                 │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Module   │  │  Module   │  │  Module    │  │
│  │   Auth    │◄─►│ Produits  │◄─►│ Commandes  │  │
│  └───────────┘  └───────────┘  └────────────┘  │
│                                                 │
│              Logique partagée                   │
│           (utils, models, config)               │
└──────────────────────┬──────────────────────────┘
                       │
               ┌───────┴───────┐
               │  Base unique  │
               └───────────────┘
```

### Avantages

- **Simplicité de développement** : tout le code est au même endroit, facile à naviguer
- **Pas de latence réseau** entre les modules (appels directs en mémoire)
- **Transactions ACID simples** : une seule base de données, cohérence garantie
- **Débogage facile** : une seule application à monitorer et tracer
- **Déploiement simple** : un seul artefact à construire et déployer

### Inconvénients

- **Couplage fort** : un changement dans un module peut casser les autres
- **Scalabilité limitée** : impossible de scaler un seul module indépendamment
- **Temps de build long** : toute l'application est recompilée à chaque modification
- **Point de défaillance unique** : si l'application tombe, tout tombe
- **Difficile à faire évoluer en grande équipe** : risques de conflits constants

### Quand choisir le monolithique ?

- Projet en phase de démarrage (MVP, prototype)
- Petite équipe (1 à 5 développeurs)
- Domaine métier encore flou ou en évolution rapide
- Contraintes de temps fortes
- Application dont la charge est prévisible et modérée

---

## Architecture Microservices

### Principe

L'application est découpée en **services autonomes**, chacun responsable d'un domaine métier précis, communiquant via des interfaces bien définies (API REST, gRPC, messages).

```
                        ┌──────────────┐
       Clients ────────►│  API Gateway │◄──── Authentification centralisée
                        └──────┬───────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     ┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────┐
     │  Service    │   │   Service    │   │   Service   │
     │    Auth     │   │   Produits   │   │  Commandes  │
     │             │   │              │   │             │
     │  ┌────────┐ │   │  ┌────────┐  │   │ ┌────────┐  │
     │  │  DB    │ │   │  │  DB    │  │   │ │  DB    │  │
     │  └────────┘ │   │  └────────┘  │   │ └────────┘  │
     └─────────────┘   └──────────────┘   └─────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                    ┌──────────▼─────────┐
                    │   Message Broker   │  (ex: RabbitMQ, Kafka)
                    │  (asynchrone)      │
                    └────────────────────┘
```

### Avantages

- **Déploiement indépendant** : mettre à jour un service sans toucher les autres
- **Scalabilité granulaire** : augmenter les ressources uniquement pour le service surchargé
- **Isolation des pannes** : si le service "Notifications" tombe, les commandes continuent de fonctionner
- **Liberté technologique** : chaque service peut avoir sa propre stack (Python, Node.js, Go...)
- **Équipes autonomes** : chaque équipe possède et déploie son service

### Inconvénients

- **Complexité opérationnelle** : orchestration, discovery de services, load balancing
- **Latence réseau** : les appels entre services passent par le réseau (vs mémoire en monolithique)
- **Gestion des transactions distribuées** : la cohérence des données entre services est difficile
- **Observabilité complexe** : tracer une requête qui traverse 5 services nécessite des outils dédiés
- **Coût d'infrastructure plus élevé** : plusieurs bases de données, plusieurs instances de déploiement

### Quand choisir les microservices ?

- Application à forte charge avec des besoins de scalabilité différents par domaine
- Grande équipe (plusieurs équipes travaillant en parallèle)
- Domaine métier bien défini et stable
- Tolérance aux pannes critique (système de production)
- Organisation prête pour la complexité DevOps (CI/CD, Kubernetes, monitoring distribué)

---

## Communication entre services

### Synchrone — REST / gRPC

```
Service A ──── HTTP Request ────► Service B
          ◄─── HTTP Response ────
```

- Adapté pour les requêtes qui nécessitent une réponse immédiate
- Simple à implémenter
- Risque de couplage temporel (si B est down, A échoue)

### Asynchrone — Message Broker

```
Service A ──── Message ────► [Queue] ────► Service B
                                     └───► Service C
```

- Découplage total : A publie, peu importe si B est disponible
- Résilience accrue
- Plus complexe à debugger (messages perdus, ordre non garanti)

---

## Dans le cadre de ce projet

Vous devez implémenter **2 services backend distincts**. Vous êtes dans une architecture **microservices simplifiée** :

```
┌─────────────────────────────────────────────────────┐
│                      Frontend                       │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
       ┌───────▼────────┐    ┌────────▼────────┐
       │   Service 1    │    │    Service 2    │
       │  (Auth, Users, │    │  (IA, Analyse,  │
       │   Métier core) │    │   Traitement)   │
       └───────┬────────┘    └────────┬────────┘
               │                      │
          ┌────┴────┐            ┌─────┴────┐
          │   DB 1  │            │   DB 2   │
          └─────────┘            └──────────┘
```

**Recommandation :** faites communiquer vos deux services via des appels HTTP REST.
Le Service 1 appelle le Service 2 lorsqu'il a besoin du composant IA.

---

## Résumé visuel

```
QUAND PARTIR EN MONOLITHIQUE ?          QUAND PARTIR EN MICROSERVICES ?

✅ MVP / Prototype                       ✅ Application mature à fort trafic
✅ Petite équipe                         ✅ Plusieurs équipes autonomes
✅ Domaine flou                          ✅ Domaine métier bien découpé
✅ Time-to-market court                  ✅ Scalabilité différenciée nécessaire
✅ Budget infrastructure limité          ✅ Tolérance aux pannes critique

❌ Scalabilité différenciée              ❌ Démarrage rapide
❌ Équipes multiples                     ❌ Petite équipe sans DevOps
❌ Isolation des pannes                  ❌ Budget infra limité
```

> **Règle empirique :** commencer en monolithique, migrer vers les microservices quand la douleur est réelle — pas anticipée.