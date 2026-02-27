import { useState, useEffect } from 'react'
import { fetchProducts } from '../api/products.js'
import ProductCard from '../components/ProductCard.jsx'

const CATEGORIES = ['', 'Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Sport', 'Jouets']

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('')

  useEffect(() => {
    loadProducts()
  }, [category])

  async function loadProducts() {
    setLoading(true)
    setError(null)
    try {
      const filters = {}
      if (category) filters.category = category
      const data = await fetchProducts(filters)
      setProducts(data.products ?? data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Catalogue de produits</h1>
        <p>{products.length} produit{products.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={loadProducts}>
          Actualiser
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des produits...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">Aucun produit trouvé.</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
