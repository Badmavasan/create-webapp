import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../api/products.js'

const CATEGORIES = ['Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Sport', 'Jouets']

export default function AddProductPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.category || !form.price) {
      setError('Le nom, la catégorie et le prix sont obligatoires.')
      return
    }
    if (Number(form.price) <= 0) {
      setError('Le prix doit être supérieur à 0.')
      return
    }

    setLoading(true)
    try {
      const result = await createProduct({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        description: form.description.trim(),
        stock: form.stock ? Number(form.stock) : 0,
      })
      const newId = result.product?.id ?? result.id
      navigate(newId ? `/products/${newId}` : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Ajouter un produit</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du produit *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex : Chaussures de running"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Prix (€) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Ex : 49.99"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock disponible</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            placeholder="Ex : 100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Décrivez le produit..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Création...' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}
