import { FiHeart, FiShoppingCart } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { t } = useTranslation()
  const { addToCart, addToWishlist, wishlist } = useCart()
  const isInWishlist = wishlist.some(item => item.id === product.id)

   const handleAddToCart = (e) => {
     e.preventDefault()
     e.stopPropagation()
     addToCart(product)
     toast.success(t('agriShopProductCard.addedToCart'))
   }

   const handleAddToWishlist = (e) => {
     e.preventDefault()
     e.stopPropagation()
     if (isInWishlist) {
       toast.error(t('agriShopProductCard.alreadyInWishlist'))
     } else {
       addToWishlist(product)
       toast.success(t('agriShopProductCard.addedToWishlist'))
     }
   }

  const discountedPrice = product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price

  return (
    <div className="card group">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform" />
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">{product.discount}% OFF</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{product.brand}</p>

      <div className="flex items-center mb-3">
        <span className="text-yellow-500">★</span>
        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
        <span className="text-sm text-gray-400 ml-2">({product.reviews} reviews)</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {product.discount > 0 ? (
            <div>
              <span className="text-2xl font-bold text-primary">₹{discountedPrice}</span>
              <span className="text-gray-400 line-through ml-2">₹{product.price}</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button onClick={handleAddToWishlist} className={`p-2 rounded-lg transition ${isInWishlist ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
            <FiHeart />
          </button>
          <button onClick={handleAddToCart} disabled={!product.inStock} className="p-2 rounded-lg bg-primary text-white hover:bg-primary-light transition disabled:opacity-50">
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  )
}
