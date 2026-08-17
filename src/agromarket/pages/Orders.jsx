import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiService from '../../services/apiService'

export default function OrdersPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('all')
  const userId = searchParams.get('userId') || undefined

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiService.api.get('/api/marketplace/orders', { params: { userId, status: status === 'all' ? undefined : status } })
        const data = res.data?.data || []
        setOrders(Array.isArray(data) ? data : [])
      } catch (_) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, status])

  const groups = Object.values(orders.reduce((acc, o) => {
    const key = o.userId || o.userName || 'unknown'
    if (!acc[key]) acc[key] = { userId: o.userId, userName: o.userName || 'Unknown', orders: [], total: 0 }
    acc[key].orders.push(o)
    acc[key].total += Number(o.total) || 0
    return acc
  }, {}))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('agriShop.orders', 'Orders')}</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-md p-2 text-sm">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="text-sm text-gray-600">No orders</div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.userId || g.userName} className="rounded-lg border border-orange-200">
              <header className="px-4 py-3 bg-orange-50 flex items-center justify-between">
                <div className="font-semibold text-orange-800">{g.userName}</div>
                <div className="text-sm text-orange-700">Total: ₹{g.total.toFixed(2)}</div>
              </header>
              <div className="divide-y">
                {g.orders.map((o) => (
                  <div key={o.id} className="px-4 py-3">
                    <div className="text-sm text-gray-800">Order #{o.id}</div>
                    <div className="text-xs text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</div>
                    <div className="mt-2 text-sm text-gray-700">Items: {Array.isArray(o.items) ? o.items.map(i => `${i.name}×${i.quantity}`).join(', ') : '-'}</div>
                    <div className="mt-1 text-sm">Status: <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{o.status}</span></div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
