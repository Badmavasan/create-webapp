# TP Backend – Application de Gestion de Films

## Contexte

Vous devez développer le backend d'une application permettant aux utilisateurs de gérer leurs films favoris, de leur attribuer une note et d'écrire des critiques. L'application expose une API REST (par exemple avec **Flask** ou **FastAPI** en Python, ou **Express** en Node.js).

> **Note sur l'authentification :** Pour ce TP, l'authentification n'est pas gérée. L'identifiant de l'utilisateur (`user_id`) est transmis directement dans le corps de chaque requête. **Cette pratique n'est pas recommandée en production** — elle sera remplacée par un système de tokens (JWT) dans un TP ultérieur.

---

## Contraintes Techniques Obligatoires

### 1. Validation des données entrantes
Toutes les données reçues doivent être validées **avant** tout traitement ou écriture en base :

- Vérifier que les champs obligatoires sont présents et non vides.
- Valider le format de l'adresse e-mail si elle est fournie (ex : regex ou librairie dédiée).
- Vérifier que les champs numériques (note, `user_id`, `movie_id`) sont bien des entiers ou flottants dans une plage définie.
- Contrôler que les reviews ne contiennent pas de contenu illicite : balises HTML/JavaScript (`<script>`, `<iframe>`, etc.), injections SQL (mots-clés suspects : `DROP`, `SELECT`, `--`, etc.), ou chaînes anormalement longues (ex : > 2000 caractères).

### 2. Gestion des erreurs avec `try / except`
**Toutes** les routes doivent être enveloppées dans un bloc `try / except`. Il est **interdit** de renvoyer une erreur HTTP brute non gérée (500, 404 HTML, etc.). Chaque erreur doit retourner une réponse JSON structurée, par exemple :

```json
{
  "success": false,
  "error": "Description lisible de l'erreur",
  "code": "INVALID_RATING"
}
```

### 3. Réponses systématiquement utiles
Chaque endpoint doit retourner une réponse JSON contenant :
- Un champ `success` (booléen).
- Les données créées, modifiées ou consultées.
- Un message lisible en cas d'erreur ou de succès.

### 4. Traçabilité en base de données
Chaque action de modification (ajout, mise à jour, suppression) doit enregistrer en base :
- Un timestamp (`created_at` / `updated_at`).
- Le `user_id` responsable de l'action.

---

## Modèle de données suggéré

Vous êtes libres d'adapter ce modèle, mais il doit couvrir au minimum :

- **User** : `id`, `username`, `email`
- **Movie** : `id`, `title`, `genre`, `release_year`, `description`
- **Favorite** : `id`, `user_id`, `movie_id`, `added_at`
- **Rating** : `id`, `user_id`, `movie_id`, `score` (1 à 5), `created_at`, `updated_at`
- **Review** : `id`, `user_id`, `movie_id`, `content`, `created_at`, `updated_at`

---

## Liste des Endpoints à Implémenter

### CRUD – Utilisateurs (`/users`)

| Méthode | Route | Description | Validations requises |
|--------|-------|-------------|----------------------|
| `GET` | `/users` | Lister tous les utilisateurs (pagination conseillée) | — |
| `GET` | `/users/:id` | Récupérer un utilisateur par son ID | Vérifier que l'ID existe |
| `POST` | `/users` | Créer un nouvel utilisateur | `username` non vide, `email` valide et unique, pas d'injection |
| `PUT` | `/users/:id` | Modifier les informations d'un utilisateur | Mêmes validations que POST, vérifier que l'ID existe |
| `DELETE` | `/users/:id` | Supprimer un utilisateur | Vérifier que l'ID existe ; supprimer en cascade ses favoris, notes et reviews |

**Champs attendus pour POST / PUT :**
```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

---

### CRUD – Films (`/movies`)

| Méthode | Route | Description | Validations requises |
|--------|-------|-------------|----------------------|
| `GET` | `/movies` | Lister tous les films (filtres optionnels : `genre`, `release_year`) | Vérifier les types des paramètres de filtre |
| `GET` | `/movies/:id` | Récupérer un film par son ID | Vérifier que l'ID existe |
| `POST` | `/movies` | Ajouter un nouveau film | `title` non vide, `release_year` entier valide (ex : entre 1888 et l'année courante), `genre` dans une liste autorisée |
| `PUT` | `/movies/:id` | Modifier les informations d'un film | Mêmes validations que POST, vérifier que l'ID existe |
| `DELETE` | `/movies/:id` | Supprimer un film | Vérifier que l'ID existe ; supprimer en cascade ses ratings, reviews et favoris associés |

**Champs attendus pour POST / PUT :**
```json
{
  "title": "Inception",
  "genre": "Science-Fiction",
  "release_year": 2010,
  "description": "Un voleur qui s'infiltre dans les rêves..."
}
```

---

### CRUD – Favoris, Notes et Reviews

| Méthode | Route | Description |
|--------|-------|-------------|
| `GET` | `/favorites/:user_id` | Lister les films favoris d'un utilisateur |
| `POST` | `/favorites` | Ajouter un film aux favoris |
| `DELETE` | `/favorites` | Retirer un film des favoris |
| `GET` | `/ratings/:user_id` | Lister toutes les notes d'un utilisateur |
| `POST` | `/ratings` | Ajouter une note (1–5) |
| `PUT` | `/ratings` | Mettre à jour une note existante |
| `DELETE` | `/ratings` | Supprimer une note |
| `GET` | `/reviews/:movie_id` | Lire toutes les critiques d'un film |
| `POST` | `/reviews` | Ajouter une critique |
| `PUT` | `/reviews/:review_id` | Modifier sa propre critique |
| `DELETE` | `/reviews/:review_id` | Supprimer sa propre critique |

---

### Endpoints avec Logique Métier (≥ 5 requis)

Ces endpoints nécessitent une réflexion et une logique supplémentaire de votre part :

---

#### 1. `GET /movies/top-rated`

**Description :** Retourner la liste des films triés par note moyenne décroissante.

**Logique à implémenter :**
- Calculer la **note moyenne** de chaque film à partir de la table `Rating`.
- Ne retourner que les films ayant reçu **au moins N évaluations** (valeur configurable, ex : 3).
- Inclure dans la réponse : le titre, la moyenne, le nombre de votes.
- Gérer le cas où aucun film ne répond aux critères.

---

#### 2. `GET /users/:user_id/stats`

**Description :** Retourner un résumé de l'activité d'un utilisateur.

**Logique à implémenter :**
- Nombre de films en favoris.
- Nombre de notes données et leur moyenne personnelle.
- Nombre de reviews écrites.
- Genre de film le plus présent dans ses favoris (**genre préféré**).
- Retourner une erreur claire si le `user_id` n'existe pas.

---

#### 3. `POST /reviews/:review_id/report`

**Description :** Signaler une critique comme inappropriée.

**Logique à implémenter :**
- Un utilisateur ne peut pas signaler **sa propre** critique.
- Un utilisateur ne peut signaler la même critique **qu'une seule fois**.
- Si une critique dépasse un seuil de signalements (ex : 5), elle doit être **automatiquement masquée** (champ `is_hidden = true`).
- Enregistrer chaque signalement avec le `user_id` et le timestamp.

---

#### 4. `GET /movies/recommendations/:user_id`

**Description :** Proposer des films que l'utilisateur n'a pas encore mis en favoris, basés sur ses préférences.

**Logique à implémenter :**
- Identifier le ou les **genres les plus présents** dans les favoris de l'utilisateur.
- Retourner des films de ces genres **non encore en favoris**.
- Trier par note moyenne décroissante.
- Limiter la réponse à 10 films maximum.
- Si l'utilisateur n'a pas de favoris, retourner les films les mieux notés globalement.

---

#### 5. `PUT /ratings` (mise à jour intelligente)

**Description :** Mettre à jour la note d'un utilisateur pour un film, avec historique.

**Logique à implémenter :**
- Si une note existe déjà pour ce `(user_id, movie_id)`, la **mettre à jour** au lieu d'en créer une nouvelle.
- Conserver l'**ancienne note** dans une table `RatingHistory` avec la date de modification.
- Valider que le score est compris entre 1 et 5 inclus (valeur décimale acceptée, ex : 3.5).
- Retourner la note précédente, la nouvelle note, et le delta (écart).

---

#### 6. `GET /movies/:movie_id/summary`

**Description :** Retourner un résumé complet d'un film.

**Logique à implémenter :**
- Informations générales du film.
- Note moyenne et nombre de votes.
- Les 3 reviews les plus récentes (non masquées).
- Nombre total de fois où ce film a été ajouté en favori.
- Indiquer si l'utilisateur courant (`user_id` en query param optionnel) a ce film en favori et quelle note il lui a donné.

---

## Livrables attendus

- Le code source du backend avec une structure de projet claire.

---

## Critères d'évaluation

| Critère | Points |
|--------|--------|
| Fonctionnement des endpoints CRUD | 4 pts |
| Validation des données (email, injection, longueur…) | 3 pts |
| Gestion des erreurs (`try/except`, réponses JSON) | 3 pts |
| Qualité de la logique métier (5 endpoints avancés) | 6 pts |
| Qualité du code (lisibilité, structure, commentaires) | 2 pts |
| Documentation et fichier de tests | 2 pts |
| **Total** | **20 pts** |

---

> 💡 **Conseil :** Commencez par mettre en place la base de données et les modèles, puis implémentez les endpoints CRUD avant d'attaquer la logique métier.
