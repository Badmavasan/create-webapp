import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import AddProductPage from './pages/AddProductPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products/add" element={<AddProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}
