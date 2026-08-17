import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import farmerService from '../../services/farmerService'

export default function FarmerCropDetail({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [crop, setCrop] = useState(null)
  const [activities, setActivities] = useState([])
  const [text, setText] = useState('')
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      const c = await farmerService.getCrop(id, targetUserId ? { userId: targetUserId } : undefined)
      setCrop(c)
      const a = await farmerService.listActivities(id, targetUserId ? { userId: targetUserId } : undefined)
      setActivities(a?.records || a || [])
    }
    load()
  }, [id, targetUserId])

  const addActivity = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const r = await farmerService.addActivity(id, { note: text }, targetUserId ? { userId: targetUserId } : undefined)
    setActivities(arr => [r, ...arr])
    setText('')
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/crops')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToCrops', 'Back to Crops')}</span>
          </button>
          <h1 className="font-semibold text-lg">{crop?.name || t('farmer.cropDetail', 'Crop Detail')}</h1>
          <div className="w-24" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="glass-card rounded-3xl p-8 bg-white">
          <p className="text-sm text-text-secondary">{t('farmer.area', 'Area')}: {crop?.area} {t('farmer.acres', 'acres')}</p>
        </section>
        <section className="glass-card rounded-3xl p-8 bg-white">
          <h3 className="text-lg font-bold mb-4">{t('farmer.activities', 'Activities')}</h3>
          {!isReadOnly && <form onSubmit={addActivity} className="flex gap-3 mb-4">
            <input className="input-field flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('farmer.addNote', 'Add a note')} />
            <button className="px-4 py-2 rounded-xl bg-primary text-white font-semibold">{t('common.add', 'Add')}</button>
          </form>}
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={a._id || i} className="rounded-xl bg-gray-50 border border-border p-4">
                <p className="font-semibold">{a.note}</p>
                <p className="text-xs text-text-secondary">{new Date(a.createdAt || Date.now()).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
