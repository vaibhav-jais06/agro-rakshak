import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import { products, getProductsByCategory, searchProducts } from '../data/products'
import { FiFilter, FiX } from 'react-icons/fi'

export default function Marketplace() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

  const [filteredProducts, setFilteredProducts] = useState(products)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParam || '')

  const categories = ['all', 'seeds', 'fertilisers', 'pesticides', 'organic', 'machinery']
  const brands = [...new Set(products.map(p => p.brand))]

  useEffect(() => {
    let result = products
    if (selectedCategory !== 'all') {
      result = getProductsByCategory(selectedCategory)
    }
    if (searchQuery) {
      result = searchProducts(searchQuery)
    }
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand === selectedBrand)
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        break
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      default:
        result.sort((a, b) => b.reviews - a.reviews)
    }
    setFilteredProducts(result)
  }, [selectedCategory, selectedBrand, priceRange, sortBy, searchQuery])

  const maxPrice = Math.max(...products.map(p => p.price))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">{t('agriShop.marketplace')}</h1>
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder={t('agriShop.searchProducts')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field flex-1" />
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center space-x-2">
            <FiFilter />
            <span>{t('agriShop.filters')}</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{t('agriShop.sortBy')}:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto">
            <option value="popularity">{t('agriShop.popularity')}</option>
            <option value="price-low">{t('agriShop.priceLowToHigh')}</option>
            <option value="price-high">{t('agriShop.priceHighToLow')}</option>
            <option value="rating">{t('agriShop.rating')}</option>
            <option value="discount">{t('agriShop.discount')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('agriShop.filters')}</h2>
              <button onClick={() => setShowFilters(false)} className="lg:hidden"><FiX /></button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('agriShop.category')}</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="category" value={cat} checked={selectedCategory === cat} onChange={(e) => setSelectedCategory(e.target.value)} className="text-primary" />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('agriShop.brand')}</h3>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="input-field">
                <option value="all">{t('agriShop.allBrands')}</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('agriShop.priceRange')}</h3>
              <div className="space-y-2">
                <input type="range" min="0" max={maxPrice} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>

            <button onClick={() => { setSelectedCategory('all'); setSelectedBrand('all'); setPriceRange([0, maxPrice]); setSearchQuery('') }} className="btn-secondary w-full">{t('agriShop.clearFilters')}</button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500 text-lg">{t('agriShop.noProducts')}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} to={`/agri-shop/product/${product.id}`}><ProductCard product={product} /></Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
