import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ScrollText, Edit } from 'lucide-react'
import apiService from '../../services/apiService'

export default function ManageSchemes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [schemeForm, setSchemeForm] = useState({ message: '', url: '', active: true })
  const [schemeList, setSchemeList] = useState([])
  const [editingSchemeId, setEditingSchemeId] = useState(null)
  const [schemeEdit, setSchemeEdit] = useState({ message: '', url: '', active: true })

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const res = await apiService.api.get('/api/notifications/list', { params: { type: 'scheme', limit: 50 } })
        setSchemeList(Array.isArray(res.data?.data) ? res.data.data : [])
      } catch (_) {
        setSchemeList([])
      }
    }
    loadSchemes()
    const es = apiService.subscribeNotificationUpdates(() => loadSchemes())
    return () => es && es.close()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ScrollText className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-800">Schemes</h1>
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
          <div className="space-y-3">
            <input
              value={schemeForm.message}
              onChange={(e) => setSchemeForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Scheme title"
              className="w-full border border-gray-200 rounded-md p-2 text-sm"
            />
            <input
              value={schemeForm.url}
              onChange={(e) => setSchemeForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="Scheme link URL"
              className="w-full border border-gray-200 rounded-md p-2 text-sm"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={schemeForm.active}
                onChange={(e) => setSchemeForm((f) => ({ ...f, active: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Active</span>
            </div>
            <button
              onClick={async () => {
                const payload = { message: schemeForm.message, url: schemeForm.url, type: 'scheme', active: schemeForm.active }
                const res = await apiService.createNotification(payload)
                if (res.success) {
                  setSchemeForm({ message: '', url: '', active: true })
                }
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Scheme
            </button>
            <div className="pt-4 border-t border-gray-200">
              {schemeList.length === 0 ? (
                <div className="text-sm text-gray-600">No schemes</div>
              ) : (
                <ul className="space-y-2">
                  {schemeList.map((n) => (
                    <li key={n._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {editingSchemeId === n._id ? (
                        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            value={schemeEdit.message}
                            onChange={(e) => setSchemeEdit((f) => ({ ...f, message: e.target.value }))}
                            className="flex-1 border border-gray-200 rounded-md p-2 text-sm w-full"
                            placeholder="Scheme title"
                          />
                          <input
                            value={schemeEdit.url}
                            onChange={(e) => setSchemeEdit((f) => ({ ...f, url: e.target.value }))}
                            className="flex-1 border border-gray-200 rounded-md p-2 text-sm w-full"
                            placeholder="Link URL"
                          />
                          <label className="flex items-center gap-2 text-xs text-gray-700">
                            <input type="checkbox" checked={!!schemeEdit.active} onChange={(e) => setSchemeEdit((f) => ({ ...f, active: e.target.checked }))} /> Active
                          </label>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="text-sm text-gray-800 truncate max-w-full sm:max-w-xs">{n.message}</div>
                          {n.url && <div className="text-xs text-gray-500 truncate max-w-full sm:max-w-xs">{n.url}</div>}
                        </div>
                      )}
                      {editingSchemeId === n._id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const payload = { message: schemeEdit.message, url: schemeEdit.url, active: schemeEdit.active, type: 'scheme' }
                              const res = await apiService.updateNotificationById(n._id, payload)
                              if (res.success) {
                                setEditingSchemeId(null)
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 w-full sm:w-auto"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSchemeId(null)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingSchemeId(n._id)
                              setSchemeEdit({ message: n.message || '', url: n.url || '', active: !!n.active })
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center gap-1 w-full sm:w-auto"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              await apiService.deleteNotification(n._id)
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 w-full sm:w-auto"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
