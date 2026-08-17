import React, { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, Search, Package, Filter, X, Check, IndianRupee, MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import apiService from '../../services/apiService'

export default function AgriShopPage({ user }) {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [placingOrder, setPlacingOrder] = useState(false)
  const AGMARKNET_API_KEY = process.env.REACT_APP_AGMARKNET_API_KEY
  const [menuOpen, setMenuOpen] = useState(false)

  // Helper function to translate product names
  const translateProductName = (productName) => {
    if (!productName) return productName
    
    // Try to match common product patterns (order matters - more specific first)
    // Patterns are case-insensitive and match anywhere in the product name
    const patterns = [
      // Specific products first
      { pattern: /organic\s+urea/i, key: 'organicUrea' },
      { pattern: /hybrid\s+tomato\s+seeds/i, key: 'hybridTomatoSeeds' },
      { pattern: /drip\s+irrigation\s+kit/i, key: 'dripIrrigationKit' },
      { pattern: /single\s+super\s+phosphate/i, key: 'singleSuperPhosphate' },
      { pattern: /farm\s+yard\s+manure/i, key: 'farmYardManure' },
      { pattern: /mustard\s+cake/i, key: 'mustardCake' },
      { pattern: /neem\s+cake/i, key: 'neemCake' },
      // Fertilizers
      { pattern: /potash\s+fertilizer/i, key: 'potashFertilizer' },
      { pattern: /ammonium\s+sulphate/i, key: 'ammoniumSulphate' },
      { pattern: /zinc\s+sulphate/i, key: 'zincSulphate' },
      { pattern: /urea\s+fertilizer/i, key: 'ureaFertilizer' },
      { pattern: /dap\s+fertilizer/i, key: 'dapFertilizer' },
      { pattern: /npk\s+\d+:\d+:\d+/i, key: 'npkFertilizer' },
      { pattern: /\bnpk\b/i, key: 'npkFertilizer' },
      // Seeds (must come before generic crop names)
      { pattern: /groundnut\s+seeds/i, key: 'groundnutSeeds' },
      { pattern: /sunflower\s+seeds/i, key: 'sunflowerSeeds' },
      { pattern: /soybean\s+seeds/i, key: 'soybeanSeeds' },
      { pattern: /maize\s+seeds/i, key: 'maizeSeeds' },
      { pattern: /mustard\s+seeds/i, key: 'mustardSeeds' },
      { pattern: /cotton\s+seeds/i, key: 'cottonSeeds' },
      { pattern: /rice\s+seeds/i, key: 'riceSeeds' },
      { pattern: /wheat\s+seeds/i, key: 'wheatSeeds' },
      // Pesticides
      { pattern: /2,4-d\s+amine/i, key: 'amine24D' },
      { pattern: /glyphosate/i, key: 'glyphosate' },
      { pattern: /chlorpyriphos/i, key: 'chlorpyriphos' },
      { pattern: /imidacloprid/i, key: 'imidacloprid' },
      // Organic products
      { pattern: /vermicompost/i, key: 'vermicompost' },
      { pattern: /cocopeat/i, key: 'cocopeat' },
      { pattern: /compost/i, key: 'compost' },
      // Machinery
      { pattern: /rotavator/i, key: 'rotavator' },
      { pattern: /cultivator/i, key: 'cultivator' },
      { pattern: /tractor/i, key: 'tractor' }
    ]
    
    for (const { pattern, key } of patterns) {
      if (pattern.test(productName)) {
        const translationKey = `products.${key}`
        // Get translation - i18next will return translation or fallback to English
        const translated = t(translationKey)
        
        // Always use translation if it's not the key path itself
        // i18next returns the key path only if translation doesn't exist in any language
        // With fallbackLng: 'en', it should always return a translation
        if (translated && translated !== translationKey && typeof translated === 'string') {
          // Try to preserve model numbers and specifications from original name
          // Match patterns like: " - HD 3086", " 50kg", " 19:19:19", " 35 HP", etc.
          const specMatch = productName.match(/(\s*[-–]\s*[A-Z0-9\s]+|\s+\d+[a-z]+\s*|\s+\d+kg\s*|\s+\d+%[^%]*|\s+\d+L\s*|\s+\d+ml\s*|\s+\d+HP\s*|\s+\d+\s+Feet\s*|\s+\d+\s+Tines\s*)/i)
          if (specMatch) {
            // Append specifications to translated name
            return translated + specMatch[0]
          }
          // Return the translated base name
          return translated
        }
      }
    }
    
    // Fallback: return original name if no pattern matched
    return productName
  }

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category))
    return Array.from(set)
  }, [products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      const res = await apiService.api.get(`/api/marketplace/products?${params.toString()}`)
      const data = res.data?.data || []
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(typeof e === 'string' ? e : (e?.message || 'Failed to load products'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [category])

  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.product.id !== id))
  }

  const updateQty = (id, qty) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i))
  }

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  }, [cart])

  const placeOrder = async () => {
    try {
      if (!cart.length) return
      setPlacingOrder(true)
      const payload = {
        userId: user?.id || user?._id || 'guest',
        products: cart.map(i => ({ id: i.product.id, qty: i.qty })),
        totalAmount,
        shippingAddress: 'Address pending'
      }
      const res = await apiService.api.post('/api/marketplace/orders', payload)
      if (res.data?.success) {
        setCart([])
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : (e?.message || 'Failed to place order'))
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <img src="/assets/images/logo.png" alt="Agro Rakshak" className="h-10 w-auto" />
            <h1 className="text-xl sm:text-2xl font-bold text-green-800">{t('features.agriShop')}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-green-700" />
              <span className="font-semibold text-green-800">{cart.length}</span>
            </div>
            <a href="/agri-shop/login" className="px-3 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50">Seller Login</a>
            <a href="/agri-shop/register" className="px-3 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50">Register</a>
          </div>
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Open menu"
              className="p-2 rounded border border-green-300 text-green-700 hover:bg-green-50"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden mt-3 w-full bg-white rounded-lg border border-green-100 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-700" />
              <span className="font-semibold text-green-800">{cart.length}</span>
            </div>
            <a href="/agri-shop/login" className="px-3 py-2 rounded border border-green-300 text-green-700 hover:bg-green-50 w-full">Seller Login</a>
            <a href="/agri-shop/register" className="px-3 py-2 rounded border border-green-300 text-green-700 hover:bg-green-50 w-full">Register</a>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-4 border border-green-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('agriShop.searchProducts')}
                className="w-full pl-10 pr-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-md py-2 px-3"
              >
                <option value="">{t('agriShop.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{t(`productCategories.${c?.toLowerCase()}`, c)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {t('common.search')}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-red-600 text-sm">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">{t('agriShop.loadingProducts')}</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-green-700" />
                        <h3 className="font-semibold text-gray-800">{translateProductName(p.name)}</h3>
                      </div>
                      <span className="text-sm text-gray-500">{p.brand}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{t(`productCategories.${p.category?.toLowerCase()}`, p.category)}</div>
                    <div className="flex items-center space-x-1 text-green-700 font-semibold mb-3">
                      <IndianRupee className="w-4 h-4" />
                      <span>{p.price}</span>
                      <span className="text-gray-500 text-sm">/{p.unit}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={!p.inStock}
                    >
                      {p.inStock ? t('agriShop.addToCart', 'Add to Cart') : t('agriShop.outOfStock', 'Out of Stock')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">{t('agriShopCart.shoppingCart')}</h2>
              <span className="text-sm text-gray-500">
                {cart.length} {t('agriShop.items')}
              </span>
            </div>
            {cart.length === 0 ? (
              <div className="text-gray-500 text-sm">{t('agriShopCart.yourCartIsEmpty')}</div>
            ) : (
              <div className="space-y-3">
                {cart.map((i) => (
                  <div key={i.product.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{translateProductName(i.product.name)}</div>
                        <div className="text-sm text-gray-500">{i.product.brand}</div>
                      </div>
                      <button onClick={() => removeFromCart(i.product.id)} className="text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <span className="text-sm text-gray-500">{t('agriShop.qty')}</span>
                      <input
                        type="number"
                        min="1"
                        value={i.qty}
                        onChange={(e) => updateQty(i.product.id, parseInt(e.target.value || '1', 10))}
                        className="w-full sm:w-20 border rounded-md px-2 py-1"
                      />
                    </div>
                      <div className="flex items-center space-x-1 text-green-700 font-semibold mt-2 sm:mt-0">
                        <IndianRupee className="w-4 h-4" />
                        <span>{i.product.price * i.qty}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="text-gray-600">{t('agriShopCart.total')}</div>
                  <div className="flex items-center space-x-1 text-green-700 font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{totalAmount}</span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={placingOrder || !cart.length}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>
                    {placingOrder ? t('agriShop.placingOrder') : t('agriShop.placeOrder')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
