# Projet Fil Rouge — Développement d'Application (1 semaine)

> **Durée :** 5 jours
> 
> **Groupes :** 3 à 4 étudiants
> 
> **Évaluation :** Basée sur l'historique Git, la qualité du code, les tests et la présentation finale

---

## Contexte et objectif

L'objectif de ce projet est de développer une application complète en suivant **toutes les étapes d'un vrai processus de développement logiciel** : de la phase d'architecture jusqu'à la démonstration finale.

Chaque groupe devra produire une application fonctionnelle, testée, documentée et déployable, en respectant les bonnes pratiques du secteur (TDD, versionnement Git, design mobile-first, sécurité JWT, etc.).

---

## Contraintes techniques obligatoires

| Critère | Exigence |
|---|---|
| Architecture | Backend + Frontend séparés |
| Backend | **2 services distincts** minimum |
| IA | **Au moins 1 composant IA** (modèle pré-entraîné HuggingFace accepté) |
| Authentification | **JWT** obligatoire |
| Rôles | **Plusieurs rôles hiérarchiques** avec affichage conditionnel du contenu |
| Frontend | Mobile-first, responsive — **Streamlit interdit** |
| Langage | Libre pour le backend et le frontend (sauf Streamlit) |
| Tests | TDD obligatoire : tests unitaires + tests d'endpoints (cas nominaux ET cas d'erreur) |

---

## Exemple de projet de référence — *TalentFlow*

> Cet exemple vous donne une idée du niveau de complexité attendu. Vous êtes libres de choisir votre propre sujet, sous réserve de **validation préalable**.

### TalentFlow — Plateforme intelligente de gestion RH & recrutement

**Description :** TalentFlow est une plateforme RH complète permettant de gérer les offres d'emploi, les candidatures et les performances des collaborateurs. Elle intègre un moteur d'analyse IA pour scorer automatiquement les CVs et les faire correspondre aux postes disponibles.

**Rôles hiérarchiques :**
- `Super Admin` — gestion des entreprises et des utilisateurs globaux
- `RH Manager` — gestion des offres, validation des candidatures
- `Recruteur` — consultation des CVs, planification des entretiens
- `Candidat` — dépôt de candidature, suivi de dossier

**Service 1 — Auth & Gestion des utilisateurs :**
- Authentification JWT (inscription, connexion, refresh token)
- CRUD utilisateurs avec rôles
- Gestion des offres d'emploi et des entreprises

**Service 2 — Analyse IA & Matching :**
- Analyse du CV via un modèle HuggingFace (NER, classification de texte ou embeddings)
- Score de compatibilité candidat/poste
- Génération automatique d'un résumé de profil

**Frontend :**
- Tableau de bord différencié selon le rôle connecté
- Pages : offres publiques, espace candidat, espace RH, administration
- Design mobile-first, interface minimaliste et propre

---

## Planning de la semaine

### Jour 1 — Architecture & Initialisation
- Définir les **fonctionnalités clés** de votre application
- Identifier les **utilisateurs** et leurs rôles
- Concevoir l'**architecture technique** (schéma des services, base de données, flux d'authentification)
- Créer le **repository GitHub** du groupe
- **Partager le repo avec** `Badmavasan` (accès collaborateur)
- Rédiger un `README.md` présentant votre projet (description, stack technique, architecture)
- Faire valider le projet par le formateur **avant de commencer le développement**

> Livrable attendu en fin de journée : repo GitHub initialisé + architecture documentée + validation obtenue

---

### Jour 2 — Développement Backend (TDD)

- Implémenter la logique métier des **2 services backend**
- Appliquer le **Test Driven Development** :
  1. Écrire le test en premier
  2. Écrire le code minimal pour le faire passer
  3. Refactoriser
- Couvrir **tous les endpoints** avec des tests :
  - Cas nominaux (comportement attendu)
  - Cas d'erreur et d'exception (mauvais token, données manquantes, accès non autorisé, etc.)
- Mettre en place la base de données et les migrations

> Livrable attendu en fin de journée : backend fonctionnel, testé, pushé sur GitHub

---

### Jour 3 — Développement Frontend (Mobile-First)

- Initiation aux fondamentaux du frontend (cours en journée)
- Implémenter les pages de l'application en **design mobile-first et responsive**
- Connecter le frontend aux APIs backend (authentification, données)
- Afficher un contenu **différent selon le rôle** de l'utilisateur connecté
- L'interface doit être **minimaliste mais fonctionnelle** — pas besoin de design élaboré, la structure et la clarté sont prioritaires

> Livrable attendu en fin de journée : frontend connecté, pages principales fonctionnelles, pushé sur GitHub

---

### Jour 4 — Intégration du composant IA

- Intégrer le modèle IA dans le service backend dédié
- Connecter le frontend pour afficher les résultats de l'IA
- Tester les endpoints IA (cas nominaux + erreurs)
- Peaufiner l'application, corriger les bugs

> Livrable attendu en fin de journée : composant IA intégré et fonctionnel, pushé sur GitHub

---

### Jour 5 — Démonstration & Présentation

- **Matin :** Préparation de la démonstration (polish final, répétition, slides si nécessaire)
- **Après-midi :** Présentation devant le groupe

**Format de la présentation :**
1. Présentation du projet et de l'architecture (5 min)
2. Démonstration live de l'application (10 min)
3. Questions & réponses (5 min)

---

## Critères d'évaluation

| Critère | Détail |
|---|---|
| **Historique Git** | Commits réguliers, messages clairs, au moins **1 push par fin de journée** |
| **TDD** | Respect de la démarche test-first, couverture des cas nominaux et d'erreur |
| **Collaboration** | Contributions équilibrées entre les membres du groupe (visible dans Git) |
| **Architecture** | Séparation des services, JWT, rôles hiérarchiques |
| **Composant IA** | Intégration fonctionnelle et pertinente |
| **Frontend** | Responsive, mobile-first, affichage conditionnel selon le rôle |
| **Présentation** | Clarté, démo fonctionnelle, réponses aux questions |

---

## Règles Git à respecter

```
# Commiter régulièrement (plusieurs fois par jour)
git commit -m "feat: ajout de l'endpoint POST /users"
git commit -m "test: tests unitaires du service d'authentification"
git commit -m "fix: correction de la validation du token JWT"

# Au moins un push en fin de chaque journée
git push origin main
```

- Utiliser des **messages de commit clairs et conventionnels** (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`)
- Travailler sur des **branches par feature** si possible (`feature/auth`, `feature/ai-service`)
- Ne jamais pusher directement sur `main` du code non testé

---

## Validation du projet (Jour 1 obligatoire)

Avant de commencer tout développement, chaque groupe doit faire valider son projet par le formateur.

La validation porte sur :
- [ ] Le sujet est suffisamment complexe
- [ ] Les 2 services backend sont bien identifiés
- [ ] Le composant IA est clairement défini (modèle choisi ou piste sérieuse)
- [ ] Les rôles hiérarchiques sont définis
- [ ] La stack technique est cohérente
- [ ] Une logique complexe du système (Intégrer l'expertise humaine sous forme des règles) 
- [ ] Le repo GitHub est créé et partagé avec `Badmavasan`

**Aucun groupe ne peut passer au Jour 2 sans cette validation.**

---

## Stack technique suggérée (non exhaustive)

| Composant | Options possibles |
|---|---|
| Backend | FastAPI (Python), Node.js/Express, Spring Boot (Java), Go, NestJS... |
| Frontend | React, Vue.js, Angular, Next.js, Svelte... |
| Base de données | PostgreSQL, MySQL, MongoDB, SQLite... |
| IA | HuggingFace Transformers, OpenAI API, modèles locaux... |
| Auth | JWT (implémentation manuelle ou via librairie) |
| Tests | pytest, Jest, JUnit, Vitest... |

Bonne chance à tous les groupes !