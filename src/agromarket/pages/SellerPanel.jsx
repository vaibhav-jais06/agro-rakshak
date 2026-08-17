import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiService from '../../services/apiService'
import { useAuth } from '../context/AuthContext'

export default function SellerPanel() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const sellerId = (user?.id || user?._id) || null
  const sellerName = user?.name || ''
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', category: '', price: '', unit: 'unit', brand: '', stock: true, imageUrl: '' })
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiService.api.get('/api/marketplace/seller/products', { params: { sellerId } })
      setList(res.data?.data || [])
    } catch (_) {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (sellerId) load() }, [sellerId])

  const addProduct = async () => {
    let imageUrl = form.imageUrl
    try {
      if (imageFile) {
        setUploading(true)
        const fd = new FormData()
        fd.append('image', imageFile)
        const up = await apiService.api.post('/api/upload/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrl = up.data?.file?.url || imageUrl
      }
    } catch (_) {} finally { setUploading(false) }
    const payload = { sellerId, sellerName, ...form, imageUrl, price: Number(form.price || 0) }
    const res = await apiService.api.post('/api/marketplace/seller/products', payload)
    if (res.data?.success) {
      setForm({ name: '', category: '', price: '', unit: 'unit', brand: '', stock: true, imageUrl: '' })
      setImageFile(null)
      load()
    }
  }

  const remove = async (id) => {
    try {
      await apiService.api.delete(`/api/marketplace/seller/products/${id}`)
      setList(arr => arr.filter(p => (p._id || p.id) !== id))
    } catch (_) {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {(!isAuthenticated || (user?.role !== 'seller')) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <div className="font-semibold text-yellow-800">Seller access required</div>
          <p className="text-sm text-yellow-700 mt-1">Please register or login as a seller to manage products.</p>
          <div className="mt-3 flex items-center gap-3">
            <a href="/agri-shop/register" className="px-3 py-1 rounded border border-yellow-300 text-yellow-800 hover:bg-yellow-100 text-sm">Register as Seller</a>
            <a href="/agri-shop/login" className="px-3 py-1 rounded border border-yellow-300 text-yellow-800 hover:bg-yellow-100 text-sm">Seller Login</a>
          </div>
        </div>
      )}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('agriShop.sellerPanel', 'Seller Panel')}</h1>
        {isAuthenticated && (
          <p className="text-sm text-gray-600">Logged in: {user?.name} ({user?.role})</p>
        )}
      </header>

      {isAuthenticated && user?.role === 'seller' && (
      <section className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Product name" className="border rounded p-2" />
          <input value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))} placeholder="Category" className="border rounded p-2" />
          <input value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} placeholder="Price" className="border rounded p-2" />
          <input value={form.unit} onChange={(e)=>setForm(f=>({...f,unit:e.target.value}))} placeholder="Unit" className="border rounded p-2" />
          <input value={form.brand} onChange={(e)=>setForm(f=>({...f,brand:e.target.value}))} placeholder="Brand" className="border rounded p-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.stock} onChange={(e)=>setForm(f=>({...f,stock:e.target.checked}))} /> In stock</label>
          <div>
            <label className="block text-sm font-semibold mb-2">Product image</label>
            <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files?.[0] || null)} className="border rounded p-2 w-full" />
            {(imageFile || form.imageUrl) && (
              <img alt="preview" src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} className="mt-2 h-24 w-24 object-cover rounded border" />
            )}
          </div>
        </div>
        <button onClick={addProduct} className="mt-4 px-4 py-2 bg-green-600 text-white rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Add Product'}</button>
      </section>
      )}

      <section className="bg-white rounded-lg shadow">
        <header className="px-4 py-3 border-b"><h2 className="font-semibold">Products</h2></header>
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : list.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No products</div>
        ) : (
          <div className="divide-y">
            {list.map(p => (
              <div key={p._id || p.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-12 w-12 object-cover rounded" /> : <div className="h-12 w-12 bg-gray-200 rounded" />}
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.category} • ₹{p.price} / {p.unit}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${p.inStock? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{p.inStock? 'In Stock':'Out of Stock'}</span>
                  <button onClick={()=>remove(p._id || p.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm w-full sm:w-auto">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
