import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('agri_shop_cart')
    const savedWishlist = localStorage.getItem('agri_shop_wishlist')
    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
  }, [])

  useEffect(() => {
    localStorage.setItem('agri_shop_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('agri_shop_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        addToWishlist,
        removeFromWishlist,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
