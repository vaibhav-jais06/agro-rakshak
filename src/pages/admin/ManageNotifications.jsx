import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import apiService from '../../services/apiService'
import { toast } from 'react-hot-toast'

export default function ManageNotifications() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [notificationForm, setNotificationForm] = useState({ message: '', url: '', active: true })
  const [notificationList, setNotificationList] = useState([])

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const res = await apiService.api.get('/api/notifications/list', { params: { type: 'general', limit: 50 } })
        setNotificationList(Array.isArray(res.data?.data) ? res.data.data : [])
      } catch (_) {
        setNotificationList([])
      }
    }
    loadNotification()
    const es = apiService.subscribeNotificationUpdates(() => loadNotification())
    return () => es && es.close()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          </div>
          <button
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md"
            onClick={() => navigate('/admin')}
          >
            Back to Admin
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-3">
            <input
              value={notificationForm.message}
              onChange={(e) => setNotificationForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Message"
              className="w-full border border-gray-200 rounded-md p-2 text-sm"
            />
            <input
              value={notificationForm.url}
              onChange={(e) => setNotificationForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="Link URL"
              className="w-full border border-gray-200 rounded-md p-2 text-sm"
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notificationForm.active}
                onChange={(e) => setNotificationForm((f) => ({ ...f, active: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Active</span>
            </div>
            <button
              onClick={async () => {
                const payload = { message: notificationForm.message, url: notificationForm.url, type: 'general', active: notificationForm.active }
                const res = await apiService.createNotification(payload)
                if (res.success) {
                  setNotificationForm({ message: '', url: '', active: true })
                }
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Notification
            </button>
            <div className="pt-4 border-t border-gray-200">
              {notificationList.length === 0 ? (
                <div className="text-sm text-gray-600">No notifications</div>
              ) : (
                <ul className="space-y-2">
                  {notificationList.map((n) => (
                    <li key={n._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm text-gray-800 truncate max-w-full sm:max-w-xs">{n.message}</div>
                      <div className="text-xs text-gray-500 sm:mr-3">{n.type || 'general'}</div>
                      <button
                        onClick={async () => {
                          try {
                            const res = await apiService.deleteNotification(n._id)
                            if (res?.success) {
                              setNotificationList((arr) => arr.filter((x) => x._id !== n._id))
                              toast.success('Deleted')
                            } else {
                              throw new Error(res?.message || 'Delete failed')
                            }
                          } catch (e) {
                            const msg = e?.message || 'Delete failed'
                            if (msg.toLowerCase().includes('not found')) {
                              setNotificationList((arr) => arr.filter((x) => x._id !== n._id))
                              toast.success('Removed')
                            } else {
                              toast.error(msg)
                            }
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 w-full sm:w-auto"
                      >
                        Delete
                      </button>
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
