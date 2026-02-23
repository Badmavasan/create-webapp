# Test Driven Development — Backend API

> **Note sur les exemples de code :** ce document utilise **Node.js / Express / Jest** pour illustrer les concepts.
> Les principes TDD sont universels : si vous choisissez Python (pytest), Java (JUnit), Go (testing), ou tout autre langage, la démarche est exactement la même. Des équivalents sont listés en fin de document.

---

## Qu'est-ce que le TDD ?

Le TDD (Test Driven Development) est une méthode de développement où **les tests sont écrits avant le code**.

### Le cycle Red-Green-Refactor

```
        ┌─────────────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     │
  ┌───────────┐                                               │
  │    RED    │  Écrire un test qui échoue                    │
  │  🔴 Fail  │  (le code n'existe pas encore)                │
  └─────┬─────┘                                               │
        │                                                     │
        ▼                                                     │
  ┌───────────┐                                               │
  │   GREEN   │  Écrire le code MINIMAL                       │
  │  🟢 Pass  │  pour faire passer le test                    │
  └─────┬─────┘                                               │
        │                                                     │
        ▼                                                     │
  ┌───────────┐                                               │
  │ REFACTOR  │  Améliorer le code sans casser les tests ─────┘
  │  🔵 Clean │
  └───────────┘
```

### Pourquoi le TDD ?

| Sans TDD | Avec TDD |
|---|---|
| On code, puis on espère que ça marche | On définit le comportement attendu avant de coder |
| Les bugs sont découverts tard (en prod) | Les bugs sont découverts immédiatement |
| Refactorer fait peur (on ne sait pas ce qu'on casse) | Refactorer est serein (les tests protègent) |
| La documentation est souvent absente | Les tests **sont** la documentation |
| On teste les cas heureux seulement | On est forcé de penser aux cas d'erreur |

---

## Les deux types de tests à produire

```
                    ┌────────────────────────────────────────┐
                    │            Votre backend               │
                    │                                        │
                    │  ┌──────────────────────────────────┐  │
                    │  │         Logique métier           │  │←── Tests Unitaires
                    │  │  (calculs, validations, règles)  │  │    (isolé, rapide)
                    │  └──────────────────────────────────┘  │
                    │                                        │
                    │  ┌──────────────────────────────────┐  │
                    │  │          Endpoints API           │  │←── Tests d'Intégration
                    │  │  (routes HTTP, auth, réponses)   │  │    (requête réelle)
                    │  └──────────────────────────────────┘  │
                    │                                        │
                    └────────────────────────────────────────┘
```

**Tests unitaires** → testent une fonction ou une classe isolément, sans base de données, sans réseau
**Tests d'intégration** → testent un endpoint HTTP de bout en bout (requête → middleware → contrôleur → réponse)

---

## Mise en place — Node.js / Express

### Installation

```bash
npm install --save-dev jest supertest
```

### Structure de fichiers recommandée

```
src/
├── services/
│   ├── auth.service.js           ← logique métier
│   └── auth.service.test.js      ← tests unitaires (au même niveau)
├── routes/
│   ├── auth.routes.js            ← endpoints
│   └── auth.routes.test.js       ← tests d'intégration
├── middleware/
│   └── auth.middleware.js
└── app.js                        ← configuration Express (sans listen)

server.js                         ← uniquement le app.listen()
```

> Séparer `app.js` de `server.js` est essentiel pour les tests : on importe `app` sans démarrer le serveur.

### Configuration Jest (`package.json`)

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

---

## Partie 1 — Tests Unitaires (logique métier)

### Exemple : service d'authentification

#### Étape 1 — RED : écrire le test d'abord

```javascript
// src/services/auth.service.test.js

const { hashPassword, verifyPassword, generateToken, validateEmail } = require('./auth.service');

describe('Auth Service — hashPassword', () => {

  test('doit retourner un hash différent du mot de passe original', async () => {
    const plain = 'monMotDePasse123';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
  });

  test('doit produire un hash différent à chaque appel (salt unique)', async () => {
    const plain = 'monMotDePasse123';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    expect(hash1).not.toBe(hash2);
  });

});

describe('Auth Service — verifyPassword', () => {

  test('doit retourner true pour un mot de passe correct', async () => {
    const plain = 'monMotDePasse123';
    const hashed = await hashPassword(plain);

    const result = await verifyPassword(plain, hashed);
    expect(result).toBe(true);
  });

  test('doit retourner false pour un mauvais mot de passe', async () => {
    const plain = 'monMotDePasse123';
    const hashed = await hashPassword(plain);

    const result = await verifyPassword('mauvaisMotDePasse', hashed);
    expect(result).toBe(false);
  });

});

describe('Auth Service — validateEmail', () => {

  test('doit accepter un email valide', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('doit rejeter un email sans @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('doit rejeter un email vide', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('doit rejeter null', () => {
    expect(validateEmail(null)).toBe(false);
  });

});
```

> Lancez `npm test` → tous les tests échouent (🔴 RED) car `auth.service.js` n'existe pas encore.

#### Étape 2 — GREEN : écrire le code minimal

```javascript
// src/services/auth.service.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { hashPassword, verifyPassword, validateEmail, generateToken };
```

> Lancez `npm test` → tous les tests passent (🟢 GREEN).

#### Étape 3 — REFACTOR

Améliorez sans casser les tests : renommer des variables, extraire des constantes, ajouter des commentaires.

---

## Partie 2 — Tests d'Intégration (endpoints HTTP)

On teste les routes HTTP avec **Supertest** qui simule de vraies requêtes HTTP sans démarrer le serveur.

### Setup de la base de test

```javascript
// src/routes/auth.routes.test.js

const request = require('supertest');
const app = require('../../app');  // app Express sans listen()

// Réinitialiser la base de données de test avant chaque test
beforeEach(async () => {
  await db.query('DELETE FROM users');
});

afterAll(async () => {
  await db.end();  // fermer la connexion après tous les tests
});
```

### Tests de l'endpoint POST /auth/register

```javascript
describe('POST /auth/register', () => {

  // ──────────────────────────────────────────
  // CAS NOMINAUX (comportement attendu)
  // ──────────────────────────────────────────

  test('doit créer un utilisateur et retourner 201', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'MotDePasse123!',
        name: 'Alice'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('alice@example.com');
    expect(response.body).not.toHaveProperty('password'); // jamais exposer le mot de passe
  });

  test('doit hasher le mot de passe en base de données', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com', password: 'MotDePasse123!', name: 'Alice' });

    const user = await db.query('SELECT password FROM users WHERE email = $1', ['alice@example.com']);
    expect(user.rows[0].password).not.toBe('MotDePasse123!');  // doit être hashé
  });

  // ──────────────────────────────────────────
  // CAS D'ERREUR ET D'EXCEPTION
  // ──────────────────────────────────────────

  test('doit retourner 409 si l\'email est déjà utilisé', async () => {
    const userData = { email: 'alice@example.com', password: 'MotDePasse123!', name: 'Alice' };

    await request(app).post('/auth/register').send(userData);  // premier appel
    const response = await request(app).post('/auth/register').send(userData);  // doublon

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/déjà utilisé|already exists/i);
  });

  test('doit retourner 400 si l\'email est invalide', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'pas-un-email', password: 'MotDePasse123!', name: 'Alice' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('doit retourner 400 si le mot de passe est trop court', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com', password: '123', name: 'Alice' });

    expect(response.status).toBe(400);
  });

  test('doit retourner 400 si des champs obligatoires sont manquants', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com' });  // password et name manquants

    expect(response.status).toBe(400);
  });

  test('doit retourner 400 si le body est vide', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({});

    expect(response.status).toBe(400);
  });

});
```

### Tests de l'endpoint POST /auth/login

```javascript
describe('POST /auth/login', () => {

  beforeEach(async () => {
    // Créer un utilisateur de test
    await request(app).post('/auth/register').send({
      email: 'alice@example.com',
      password: 'MotDePasse123!',
      name: 'Alice'
    });
  });

  // CAS NOMINAUX
  test('doit retourner un token JWT pour des identifiants valides', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'MotDePasse123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  // CAS D'ERREUR
  test('doit retourner 401 pour un mauvais mot de passe', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'mauvaisMotDePasse' });

    expect(response.status).toBe(401);
  });

  test('doit retourner 401 pour un email inexistant', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'inconnu@example.com', password: 'MotDePasse123!' });

    expect(response.status).toBe(401);
    // IMPORTANT : même message d'erreur que pour mauvais mot de passe
    // → ne pas révéler si l'email existe ou non
  });

  test('doit retourner 400 si le body est mal formé', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com' });  // password manquant

    expect(response.status).toBe(400);
  });

});
```

### Tests d'un endpoint protégé (avec JWT)

```javascript
describe('GET /users/me', () => {

  let token;

  beforeEach(async () => {
    await request(app).post('/auth/register').send({
      email: 'alice@example.com', password: 'MotDePasse123!', name: 'Alice'
    });
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'MotDePasse123!' });
    token = loginResponse.body.access_token;
  });

  // CAS NOMINAUX
  test('doit retourner le profil de l\'utilisateur connecté', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('alice@example.com');
    expect(response.body).not.toHaveProperty('password');
  });

  // CAS D'ERREUR — AUTHENTIFICATION
  test('doit retourner 401 sans token', async () => {
    const response = await request(app).get('/users/me');
    expect(response.status).toBe(401);
  });

  test('doit retourner 401 avec un token invalide', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer token_completement_faux');
    expect(response.status).toBe(401);
  });

  test('doit retourner 401 avec un token expiré', async () => {
    const expiredToken = jwt.sign(
      { sub: 'user_id', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }  // déjà expiré
    );
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(response.status).toBe(401);
  });

  test('doit retourner 401 si le header Authorization est mal formé', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', token);  // manque "Bearer "
    expect(response.status).toBe(401);
  });

});
```

### Tests d'autorisation par rôle

```javascript
describe('DELETE /users/:id — accès admin uniquement', () => {

  let adminToken, userToken, targetUserId;

  beforeEach(async () => {
    // Créer un admin et un user normal
    const admin = await createUser({ role: 'admin' });
    const user  = await createUser({ role: 'user' });
    targetUserId = user.id;
    adminToken = generateToken({ sub: admin.id, role: 'admin' });
    userToken  = generateToken({ sub: user.id,  role: 'user' });
  });

  test('un admin peut supprimer un utilisateur', async () => {
    const response = await request(app)
      .delete(`/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
  });

  test('un user standard ne peut pas supprimer un utilisateur', async () => {
    const response = await request(app)
      .delete(`/users/${targetUserId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(403);
  });

  test('doit retourner 404 si l\'utilisateur cible n\'existe pas', async () => {
    const response = await request(app)
      .delete('/users/id-inexistant-99999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(404);
  });

});
```

---

## Cartographie des scénarios à couvrir

Pour chaque endpoint, couvrir systématiquement ces catégories :

```
┌─────────────────────────────────────────────────────────────────┐
│  ENDPOINT : POST /ressource                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ CAS NOMINAUX                                                │
│     → Création réussie avec données valides          (201)      │
│     → Lecture réussie d'une ressource existante      (200)      │
│     → Mise à jour réussie                            (200)      │
│     → Suppression réussie                            (200/204)  │
│                                                                 │
│  ❌ CAS D'ERREUR — DONNÉES                                     │
│     → Body vide                                      (400)      │
│     → Champs obligatoires manquants                  (400)      │
│     → Format invalide (email, date, enum...)         (400)      │
│     → Valeurs hors limites (trop long, négatif...)   (400)      │
│     → Doublon / conflit (email déjà pris)            (409)      │
│                                                                 │
│  🔐 CAS D'ERREUR — AUTHENTIFICATION                            │
│     → Pas de token                                   (401)      │
│     → Token invalide / corrompu                      (401)      │
│     → Token expiré                                   (401)      │
│     → Format du header incorrect                     (401)      │
│                                                                 │
│  🚫 CAS D'ERREUR — AUTORISATION                               │
│     → Rôle insuffisant                               (403)      │
│     → Accès à la ressource d'un autre user (IDOR)    (403/404)  │
│                                                                 │
│  🔍 CAS D'ERREUR — RESSOURCE                                  │
│     → Ressource inexistante                          (404)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Équivalents dans d'autres langages

| Aspect | Node.js | Python | Java | Go |
|---|---|---|---|---|
| Framework test | Jest | pytest | JUnit 5 | testing (stdlib) |
| Test HTTP | Supertest | pytest + httpx / TestClient (FastAPI) | MockMvc (Spring) | net/http/httptest |
| Assertions | expect() | assert / pytest assertions | AssertJ | testify |
| Mock | jest.fn() / jest.mock() | unittest.mock / pytest-mock | Mockito | testify/mock |
| Base de test | jest.setup.js | conftest.py | @BeforeEach | TestMain |

### Exemple équivalent Python / FastAPI / pytest

```python
# test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_success():
    response = client.post("/auth/register", json={
        "email": "alice@example.com",
        "password": "MotDePasse123!",
        "name": "Alice"
    })
    assert response.status_code == 201
    assert "id" in response.json()
    assert "password" not in response.json()

def test_register_duplicate_email():
    data = {"email": "alice@example.com", "password": "MotDePasse123!", "name": "Alice"}
    client.post("/auth/register", json=data)
    response = client.post("/auth/register", json=data)
    assert response.status_code == 409

def test_login_wrong_password():
    response = client.post("/auth/login", json={
        "email": "alice@example.com",
        "password": "mauvaisMotDePasse"
    })
    assert response.status_code == 401

def test_protected_route_without_token():
    response = client.get("/users/me")
    assert response.status_code == 401
```

---

## Commandes utiles

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (re-exécute à chaque sauvegarde)
npm run test:watch

# Lancer les tests avec couverture de code
npx jest --coverage

# Lancer un seul fichier de test
npx jest auth.service.test.js

# Lancer les tests qui correspondent à un pattern
npx jest --testNamePattern="register"
```

### Interpréter le rapport de couverture

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
auth.service.js     |   95.2  |   88.9   |  100.0  |  94.7   |
auth.routes.js      |   87.5  |   75.0   |   90.0  |  87.5   |
--------------------|---------|----------|---------|---------|

Stmts   → % des lignes de code exécutées au moins une fois
Branch  → % des branches if/else couvertes (le plus important)
Funcs   → % des fonctions appelées
Lines   → % des lignes physiques couvertes
```

> Viser **80% de couverture minimum** sur la logique métier. La couverture seule ne garantit pas la qualité — un test sans assertion pertinente ne sert à rien.

---

## Règle d'or du TDD

```
Un test doit pouvoir échouer pour une seule raison.
Un test qui ne peut jamais échouer ne teste rien.
Tester le comportement, pas l'implémentation.
```

```javascript
// MAUVAIS ❌ — teste l'implémentation interne
test('doit appeler bcrypt.hash', () => {
  const spy = jest.spyOn(bcrypt, 'hash');
  await hashPassword('password');
  expect(spy).toHaveBeenCalled();  // fragile, couplé à l'implémentation
});

// BON ✅ — teste le comportement observable
test('le hash doit être vérifiable avec le mot de passe original', async () => {
  const hashed = await hashPassword('password');
  const isValid = await verifyPassword('password', hashed);
  expect(isValid).toBe(true);  // peu importe comment c'est implémenté
});
```