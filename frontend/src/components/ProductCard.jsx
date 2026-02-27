import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const navigate = useNavigate()

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${product.id}`)}
    >
      <div className="product-card-header">
        <span className="product-category">{product.category}</span>
        <span className="product-price">{product.price} €</span>
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">
        {product.description
          ? product.description.length > 100
            ? product.description.slice(0, 100) + '...'
            : product.description
          : 'Aucune description disponible.'}
      </p>
      {product.average_rating != null && (
        <div className="product-rating">
          <span className="stars">
            {'★'.repeat(Math.round(product.average_rating))}
            {'☆'.repeat(5 - Math.round(product.average_rating))}
          </span>
          <span className="rating-value">
            {Number(product.average_rating).toFixed(1)} / 5
          </span>
        </div>
      )}
    </div>
  )
}
