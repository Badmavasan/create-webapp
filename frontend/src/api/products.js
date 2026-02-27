const BASE_URL = '/api'

// --- Products ---

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)

  const url = `${BASE_URL}/products${params.toString() ? '?' + params.toString() : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erreur lors du chargement des produits')
  return res.json()
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`)
  if (!res.ok) throw new Error('Produit introuvable')
  return res.json()
}

export async function createProduct(data) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erreur lors de la création du produit')
  return json
}

// --- Reviews ---

export async function fetchProductReviews(productId) {
  const res = await fetch(`${BASE_URL}/reviews/${productId}`)
  if (!res.ok) throw new Error('Erreur lors du chargement des avis')
  return res.json()
}

export async function createReview(data) {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Erreur lors de l'ajout de l'avis")
  return json
}

export async function createRating(data) {
  const res = await fetch(`${BASE_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Erreur lors de l'ajout de la note")
  return json
}
