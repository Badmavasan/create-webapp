import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Shop</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Produits
        </Link>
        <Link
          to="/products/add"
          className={location.pathname === '/products/add' ? 'active' : ''}
        >
          + Ajouter un produit
        </Link>
      </div>
    </nav>
  )
}
