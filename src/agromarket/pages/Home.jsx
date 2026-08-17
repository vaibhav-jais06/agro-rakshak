import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiTool, FiTrendingUp } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { getCommodityPrices } from '../utils/api'
import { products, getProductsByCategory } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { t } = useTranslation()
  const [commodityPrices, setCommodityPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getCommodityPrices()
        setCommodityPrices(data.records || [])
      } catch (_) {
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

  const featuredProducts = products.slice(0, 8)
  const seeds = getProductsByCategory('seeds').slice(0, 4)
  const fertilisers = getProductsByCategory('fertilisers').slice(0, 4)

  return (
    <div>
      <section className="bg-white text-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('agriShop.welcome')}</h1>
              <p className="text-xl mb-6 text-gray-600">{t('agriShop.subtitle')}</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/agri-shop/marketplace" className="btn-primary">{t('agriShop.shopNow')}</Link>
                <Link to="/agri-shop/login" className="px-6 py-3 rounded-lg font-medium transition-all duration-300 border-2 border-primary text-primary hover:bg-primary hover:text-white">{t('agriShop.sellYourCrops')}</Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="/assets/images/logo.png" alt="Agro Rakshak" className="w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-primary">{t('footer.quickLinks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/agri-shop/marketplace?category=seeds" className="card text-center hover:scale-105 transition-transform">
              <FiShoppingBag className="text-4xl text-primary mx-auto mb-3" />
              <h3 className="font-semibold">{t('agriShop.buySeeds')}</h3>
            </Link>
            <Link to="/agri-shop/marketplace?category=machinery" className="card text-center hover:scale-105 transition-transform">
              <FiTool className="text-4xl text-primary mx-auto mb-3" />
              <h3 className="font-semibold">{t('agriShop.buyTools')}</h3>
            </Link>
            <Link to="/agri-shop/login" className="card text-center hover:scale-105 transition-transform">
              <FiTrendingUp className="text-4xl text-primary mx-auto mb-3" />
              <h3 className="font-semibold">{t('agriShop.sellYourCrops')}</h3>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('agriShop.commodityPrices')}</h2>
            <Link to="/agri-shop/marketplace" className="text-primary hover:underline">{t('agriShop.viewAll')}</Link>
          </div>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">{t('agriShop.commodity')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('registration.state')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('agriShop.market')}</th>
                    <th className="text-right py-3 px-4 font-semibold">{t('agriShop.minPrice')}</th>
                    <th className="text-right py-3 px-4 font-semibold">{t('agriShop.maxPrice')}</th>
                    <th className="text-right py-3 px-4 font-semibold">{t('agriShop.modalPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {commodityPrices.slice(0, 10).map((price, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{price.commodity || 'N/A'}</td>
                      <td className="py-3 px-4">{price.state || 'N/A'}</td>
                      <td className="py-3 px-4">{price.market || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">₹{price.min_price || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">₹{price.max_price || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">₹{price.modal_price || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('agriShop.featuredProducts')}</h2>
            <Link to="/agri-shop/marketplace" className="text-primary hover:underline">{t('agriShop.viewAll')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('agriShop.premiumSeeds')}</h2>
            <Link to="/agri-shop/marketplace?category=seeds" className="text-primary hover:underline">{t('agriShop.viewAllSeeds')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seeds.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('agriShop.fertilisers')}</h2>
            <Link to="/agri-shop/marketplace?category=fertilisers" className="text-primary hover:underline">{t('agriShop.viewAllFertilisers')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fertilisers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
