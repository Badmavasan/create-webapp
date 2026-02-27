import { useState } from 'react'
import { createReview, createRating } from '../api/products.js'

export default function ReviewForm({ productId, onSuccess }) {
  const [userId, setUserId] = useState('')
  const [score, setScore] = useState(3)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!userId || !content.trim()) {
      setError('Veuillez renseigner votre User ID et votre avis.')
      return
    }

    setLoading(true)
    try {
      await createRating({ user_id: Number(userId), product_id: productId, score: Number(score) })
      await createReview({ user_id: Number(userId), product_id: productId, content: content.trim() })
      setSuccess(true)
      setContent('')
      setScore(3)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Laisser un avis</h4>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Avis ajouté avec succès !</div>}

      <div className="form-group">
        <label htmlFor="userId">User ID</label>
        <input
          id="userId"
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Ex : 1"
          required
        />
      </div>

      <div className="form-group">
        <label>Note (1 – 5)</label>
        <div className="star-selector">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              className={`star-btn ${s <= score ? 'selected' : ''}`}
              onClick={() => setScore(s)}
            >
              ★
            </button>
          ))}
          <span className="score-label">{score} / 5</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="content">Votre avis</label>
        <textarea
          id="content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Partagez votre expérience avec ce produit..."
          maxLength={2000}
          required
        />
        <small>{content.length} / 2000 caractères</small>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  )
}
