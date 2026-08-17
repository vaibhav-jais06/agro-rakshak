import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Payment from './pages/Payment'
import Login from './pages/Login'
import Register from './pages/Register'
import OrdersPage from './pages/Orders'
import SellerPanel from './pages/SellerPanel'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

export default function AgriShopApp() {
  const { t } = useTranslation();
  const location = useLocation()

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (_) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="" element={<Home />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="payment" element={<Payment />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="seller" element={<SellerPanel />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  )
}
