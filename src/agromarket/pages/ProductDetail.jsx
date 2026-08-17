import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiStar, FiArrowLeft } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { getProductById, getProductsByCategory } from '../data/products'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const product = getProductById(id)
  const { addToCart, addToWishlist, wishlist } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-xl text-gray-500">Product not found</p>
        <Link to="/agri-shop/marketplace" className="btn-primary mt-4 inline-block">Back to Marketplace</Link>
      </div>
    )
  }

  const isInWishlist = wishlist.some(item => item.id === product.id)
  const relatedProducts = getProductsByCategory(product.category).filter(p => p.id !== product.id).slice(0, 4)

  const discountedPrice = product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price

   const handleAddToCart = () => {
     for (let i = 0; i < quantity; i++) {
       addToCart(product)
     }
     toast.success(t('agriShopProductDetail.addedToCart', { quantity }))
   }

  const handleBuyNow = () => {
    handleAddToCart()
  }

   const handleAddToWishlist = () => {
     if (isInWishlist) {
       toast.error(t('agriShopProductDetail.alreadyInWishlist'))
     } else {
       addToWishlist(product)
       toast.success(t('agriShopProductDetail.addedToWishlist'))
     }
   }

  const images = [product.image, product.image, product.image]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/agri-shop/marketplace" className="flex items-center text-gray-600 hover:text-primary mb-6">
        <FiArrowLeft className="mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="mb-4">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
          </div>
          <div className="flex space-x-2">
            {images.map((img, index) => (
              <button key={index} onClick={() => setSelectedImage(index)} className={`w-20 h-20 object-cover rounded-lg border-2 ${selectedImage === index ? 'border-primary' : 'border-gray-200'}`}>
                <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover rounded" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">Brand: {product.brand}</p>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="ml-2 text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <div className="mb-6">
            {product.discount > 0 ? (
              <div>
                <span className="text-4xl font-bold text-primary">₹{discountedPrice}</span>
                <span className="text-gray-400 line-through ml-2 text-xl">₹{product.price}</span>
                <span className="ml-2 text-red-500 font-semibold">{product.discount}% OFF</span>
              </div>
            ) : (
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 border rounded-lg hover:bg-gray-50">-</button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">+</button>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button onClick={handleAddToCart} disabled={!product.inStock} className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50">
              <FiShoppingCart />
              <span>Add to Cart</span>
            </button>
            <button onClick={handleAddToWishlist} className={`p-4 rounded-lg transition ${isInWishlist ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
              <FiHeart />
            </button>
          </div>

          <button onClick={handleBuyNow} disabled={!product.inStock} className="btn-secondary w-full disabled:opacity-50">Buy Now</button>

          {!product.inStock && (
            <p className="text-red-500 mt-4 text-center">This product is currently out of stock</p>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-gray-600 capitalize">{product.category}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Availability</h3>
              <p className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
