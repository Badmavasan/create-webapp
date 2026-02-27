import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProduct, fetchProductReviews } from '../api/products.js'
import ReviewForm from '../components/ReviewForm.jsx'
import SentimentChart from '../components/SentimentChart.jsx'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [sentiments, setSentiments] = useState({ positive: 0, neutral: 0, negative: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [productData, reviewsData] = await Promise.all([
        fetchProduct(id),
        fetchProductReviews(id),
      ])
      setProduct(productData.product ?? productData)

      const reviewsList = reviewsData.reviews ?? reviewsData
      setReviews(reviewsList)

      // Les sentiments viennent de votre modèle NLP via l'API
      // Exemple : reviewsData.sentiments = { positive: 5, neutral: 2, negative: 1 }
      // Ici on simule avec les données retournées par le backend
      if (reviewsData.sentiments) {
        setSentiments(reviewsData.sentiments)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!product) return null

  return (
    <div className="page">
      <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
        ← Retour
      </button>

      <div className="product-detail">
        <div className="product-detail-header">
          <div>
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            {product.description && <p className="product-description">{product.description}</p>}
          </div>
          <div className="product-detail-meta">
            <div className="product-price-large">{product.price} €</div>
            {product.stock != null && (
              <div className="product-stock">
                Stock : {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
              </div>
            )}
            {product.average_rating != null && (
              <div className="product-rating">
                <span className="stars">
                  {'★'.repeat(Math.round(product.average_rating))}
                  {'☆'.repeat(5 - Math.round(product.average_rating))}
                </span>
                <span>{Number(product.average_rating).toFixed(1)} / 5</span>
              </div>
            )}
          </div>
        </div>

        <div className="product-detail-body">
          <div className="reviews-section">
            <h3>Avis clients ({reviews.length})</h3>

            <SentimentChart sentiments={sentiments} />

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-data">Aucun avis pour ce produit.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">Utilisateur #{review.user_id}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {review.sentiment && (
                        <span className={`review-sentiment sentiment-${review.sentiment}`}>
                          {review.sentiment}
                        </span>
                      )}
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))
              )}
            </div>

            <ReviewForm productId={Number(id)} onSuccess={loadData} />
          </div>
        </div>
      </div>
    </div>
  )
}
