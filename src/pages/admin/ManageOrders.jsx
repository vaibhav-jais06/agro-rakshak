import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ExternalLink } from 'lucide-react'
import apiService from '../../services/apiService'

export default function ManageOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiService.api.get('/api/marketplace/orders', { params: { status: statusFilter === 'all' ? undefined : statusFilter, q: search || undefined, userId: userFilter || undefined, includeUser: true } })
        const data = res.data?.records || res.data?.data || res.data || []
        setOrders(Array.isArray(data) ? data : [])
      } catch (_) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, statusFilter])

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-semibold text-gray-800">Manage Orders</h1>
          </div>
          <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md" onClick={() => navigate('/admin')}>Back to Admin</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user or product" className="border border-gray-200 rounded-md p-2 text-sm w-64" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-md p-2 text-sm">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter by User ID" className="border border-gray-200 rounded-md p-2 text-sm w-48" />
            </div>
            <a href="/agri-shop/orders" className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-orange-200 text-orange-700 hover:bg-orange-50">
              <ExternalLink className="w-4 h-4" />
              Open Orders in Agro Shop
            </a>
          </div>

          {/* Summary grouped by user */}
          {orders.length > 0 && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {Object.values(orders.reduce((acc, o) => {
                const key = o.userId || o.userName || 'unknown'
                if (!acc[key]) acc[key] = { userId: o.userId, userName: o.userName || 'Unknown', count: 0, total: 0 }
                acc[key].count += 1
                acc[key].total += Number(o.total) || 0
                return acc
              }, {})).map((u) => (
                <div key={u.userId || u.userName} className="rounded-lg border border-orange-200 p-4 bg-orange-50">
                  <div className="font-semibold text-orange-800">{u.userName}</div>
                  <div className="text-sm text-orange-700">Orders: {u.count}</div>
                  <div className="text-sm text-orange-700">Total: ₹{u.total.toFixed(2)}</div>
                  <a href={`/agri-shop/orders?userId=${u.userId || ''}`} className="inline-flex items-center gap-1 mt-2 text-orange-700 hover:underline text-sm"><ExternalLink className="w-3 h-3" /> View in Agro Shop</a>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-600">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Items</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Placed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Shipping</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr key={o.id || o._id}>
                      <td className="px-4 py-2 text-sm text-gray-800">{o.id || o._id}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{o.user?.name || o.userName}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{o.user?.phone || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{Array.isArray(o.items) ? o.items.map((i) => `${i.name}×${i.quantity}`).join(', ') : '-'}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-800">₹{o.total?.toFixed ? o.total.toFixed(2) : o.total}</td>
                      <td className="px-4 py-2 text-xs"><span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{o.status || 'pending'}</span></td>
                      <td className="px-4 py-2 text-sm text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{typeof o.shippingAddress === 'string' ? o.shippingAddress : (o.shippingAddress?.line1 || '-')}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setUserFilter(o.userId || '')} className="px-3 py-1 border rounded-md text-blue-700 border-blue-200 hover:bg-blue-50 inline-flex items-center gap-2">
                            Filter by user
                          </button>
                          <a href={`/agri-shop/orders${o.userId ? `?userId=${o.userId}` : ''}`} className="px-3 py-1 border rounded-md text-orange-700 border-orange-200 hover:bg-orange-50 inline-flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Orders in Agro Shop
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
