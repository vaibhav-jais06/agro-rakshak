import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import apiService from '../../services/apiService'

export default function ManageUsers() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [farmers, setFarmers] = useState([])
  const [farmersLoading, setFarmersLoading] = useState(false)
  const [farmerQuery, setFarmerQuery] = useState('')

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        setFarmersLoading(true)
        const res = await apiService.api.get('/api/auth/users', { params: { role: 'user', q: farmerQuery } })
        setFarmers(res.data?.records || [])
      } catch (_) {
        setFarmers([])
      } finally {
        setFarmersLoading(false)
      }
    }
    loadFarmers()
  }, [farmerQuery])

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
          </div>
          <button
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md"
            onClick={() => navigate('/')}
          >
            Back to Admin
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">Farmers</h3>
            </div>
            <input
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Search by name, username, phone"
              value={farmerQuery}
              onChange={(e) => setFarmerQuery(e.target.value)}
            />
          </div>
          {farmersLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Username</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f) => (
                    <tr key={f._id} className="border-t">
                      <td className="py-2 pr-4">{f.name}</td>
                      <td className="py-2 pr-4">{f.username || '-'}</td>
                      <td className="py-2 pr-4">{f.phone || '-'}</td>
                      <td className="py-2 pr-4">
                        <button
                          className="px-3 py-2 bg-primary text-white rounded-md"
                          onClick={() => navigate(`/farmer/dashboard?userId=${f._id}`)}
                        >
                          Open Dashboard
                        </button>
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
