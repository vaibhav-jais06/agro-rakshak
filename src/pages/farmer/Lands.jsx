import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { MapPin, Leaf } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerLands({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [lands, setLands] = useState([])
  const [form, setForm] = useState({ plotName: '', area: '', village: '', district: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState('')
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      const r = await farmerService.listLands(targetUserId ? { userId: targetUserId } : undefined)
      setLands(r?.records || r || [])
    }
    load()
  }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!form.plotName || !form.area) return
    setSaving(true)
    try {
      const payload = { ...form, area: Number(form.area) }
      const land = await farmerService.createLand(payload, targetUserId ? { userId: targetUserId } : undefined)
      setLands(arr => [land, ...arr])
      setForm({ plotName: '', area: '', village: '', district: '' })
      toast.success(t('common.added','Added'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await farmerService.deleteLand(id, targetUserId ? { userId: targetUserId } : undefined)
    setLands(arr => arr.filter(l => (l._id || l.id) !== id))
    toast.success(t('common.deleted','Deleted'))
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.lands', 'Lands')}</h1>
          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-green-50 border border-green-200 p-6 flex items-center gap-3">
            <Leaf className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm text-text-secondary">{t('farmer.totalPlots','Total Plots')}</p>
              <p className="text-2xl font-bold text-primary">{lands.length}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-text-secondary">{t('farmer.totalArea','Total Area')}</p>
              <p className="text-2xl font-bold text-blue-600">{(lands || []).reduce((s,l)=>s+(Number(l.area)||0),0)}</p>
            </div>
          </div>
        </section>
        {!isReadOnly && <form onSubmit={create} className="glass-card rounded-2xl p-6 bg-white grid gap-4 sm:grid-cols-4">
          <input className="input-field" placeholder={t('farmer.plot','Plot')} value={form.plotName} onChange={e=>setForm(f=>({ ...f, plotName: e.target.value }))} />
          <input className="input-field" placeholder={t('farmer.area','Area')} value={form.area} onChange={e=>setForm(f=>({ ...f, area: e.target.value }))} />
          <input className="input-field" placeholder={t('registration.village','Village')} value={form.village} onChange={e=>setForm(f=>({ ...f, village: e.target.value }))} />
          <input className="input-field" placeholder={t('registration.district','District')} value={form.district} onChange={e=>setForm(f=>({ ...f, district: e.target.value }))} />
          <div className="sm:col-span-4 flex justify-end">
            <button className="px-4 py-2 rounded-xl bg-primary text-white" disabled={saving}>{saving ? t('common.saving','Saving...') : t('common.add','Add')}</button>
          </div>
        </form>}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lands.map(l => (
            <article key={l._id || l.id} className="rounded-2xl border border-border p-5 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <h5 className="font-bold text-text-primary">{l.plotName || t('farmer.plot', 'Plot')}</h5>
              </div>
              <p className="text-sm text-text-secondary">{t('farmer.area', 'Area')}: {l.area} {t('farmer.acres', 'acres')}</p>
              <p className="text-sm text-text-secondary">{t('registration.village', 'Village')}: {l.village}</p>
              {!isReadOnly && <div className="mt-3">
                <button className="px-3 py-1 rounded-md bg-rose-600 text-white" onClick={() => remove(l._id || l.id)}>{t('common.delete','Delete')}</button>
              </div>}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
