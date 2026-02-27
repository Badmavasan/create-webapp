# Frontend – Application Produits (exemple Vite + React)

> **Ce projet est un exemple de référence.** Il montre comment structurer un frontend React avec Vite pour se connecter à une API REST. Les étudiants doivent réaliser la même chose pour leur application de **films**.

---

## Stack technique

| Outil | Rôle |
|-------|------|
| [Vite](https://vitejs.dev/) | Build tool et serveur de développement |
| [React 18](https://react.dev/) | Bibliothèque UI |
| [React Router v6](https://reactrouter.com/) | Navigation entre les pages |
| `fetch` natif | Appels HTTP vers le backend |

---

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Le backend doit tourner sur `http://localhost:5000`

---

## Créer ce projet from scratch (pas à pas)

### Étape 1 – Initialiser le projet avec Vite

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Étape 2 – Installer React Router

```bash
npm install react-router-dom
```

### Étape 3 – Configurer le proxy vers le backend

Dans `vite.config.js`, ajouter un proxy pour éviter les problèmes CORS en développement :

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // adresse de votre backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

> Ainsi, un appel à `/api/products` sera redirigé vers `http://localhost:5000/products`.

### Étape 4 – Ajouter le BrowserRouter dans `main.jsx`

```jsx
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### Étape 5 – Définir les routes dans `App.jsx`

```jsx
import { Routes, Route } from 'react-router-dom'

<Routes>
  <Route path="/" element={<ProductsPage />} />
  <Route path="/products/add" element={<AddProductPage />} />
  <Route path="/products/:id" element={<ProductDetailPage />} />
</Routes>
```

### Étape 6 – Lancer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

---

## Structure du projet

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx            # Point d'entrée, BrowserRouter
    ├── App.jsx             # Routes principales
    ├── App.css             # Styles globaux
    ├── index.css           # Reset CSS
    ├── api/
    │   └── products.js     # Toutes les fonctions fetch vers l'API
    ├── components/
    │   ├── Navbar.jsx          # Barre de navigation
    │   ├── ProductCard.jsx     # Carte cliquable d'un produit
    │   ├── ReviewForm.jsx      # Formulaire note + avis
    │   └── SentimentChart.jsx  # Graphique de répartition des sentiments
    └── pages/
        ├── ProductsPage.jsx      # Liste de tous les produits
        ├── AddProductPage.jsx    # Formulaire d'ajout d'un produit
        └── ProductDetailPage.jsx # Détail + avis + sentiments
```

---

## Pages implémentées

### `/` – Liste des produits (`ProductsPage`)

- Récupère les produits via `GET /api/products`
- Filtre par catégorie (paramètre query)
- Affiche une grille de `ProductCard`
- Cliquer sur une carte navigue vers `/products/:id`

### `/products/add` – Ajouter un produit (`AddProductPage`)

- Formulaire avec validation côté client (champs obligatoires, prix > 0)
- Appel `POST /api/products`
- Redirige vers la page de détail après création

### `/products/:id` – Détail d'un produit (`ProductDetailPage`)

- Récupère le produit via `GET /api/products/:id`
- Récupère les avis via `GET /api/reviews/:id`
- Affiche le composant `SentimentChart` avec la répartition des sentiments
  retournée par votre modèle NLP (champ `sentiments` dans la réponse du backend)
- Affiche la liste des avis avec leur sentiment individuel
- Intègre le `ReviewForm` pour laisser une note et un avis

---

## Composants clés

### `SentimentChart`

Reçoit un objet `{ positive, neutral, negative }` et affiche une barre de progression pour chaque sentiment.

```jsx
<SentimentChart sentiments={{ positive: 8, neutral: 2, negative: 1 }} />
```

> Les données viennent de votre backend : le modèle NLP analyse chaque review et retourne sa classification.

### `ReviewForm`

Permet à un utilisateur de soumettre une note (1–5) et un avis texte.
Appelle `POST /api/ratings` puis `POST /api/reviews`.

```jsx
<ReviewForm productId={42} onSuccess={() => rechargerLesAvis()} />
```

### `ProductCard`

Carte cliquable affichant nom, catégorie, prix et note moyenne.

---

## Connexion avec le backend

Toutes les fonctions d'appel API sont centralisées dans `src/api/products.js`.
Exemple de fonction :

```js
export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams(filters)
  const res = await fetch(`/api/products?${params}`)
  if (!res.ok) throw new Error('Erreur lors du chargement')
  return res.json()
}
```

> Adaptez les URLs et les noms de champs selon votre backend.

---

## Ce que les étudiants doivent reproduire pour les films

| Page produit (exemple) | Page film (à développer) |
|------------------------|--------------------------|
| `ProductsPage` | Liste de tous les films |
| `AddProductPage` | Formulaire d'ajout d'un film |
| `ProductDetailPage` | Détail d'un film + reviews + sentiments |
| `ReviewForm` | Formulaire note + critique pour un film |
| `SentimentChart` | Répartition positive / neutre / négative des critiques |
