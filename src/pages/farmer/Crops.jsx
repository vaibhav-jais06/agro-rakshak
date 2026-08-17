import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { Sprout, CalendarDays, Search as SearchIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerCrops({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [search, setSearch] = useState('')
  const [lands, setLands] = useState([])
  const [form, setForm] = useState({ name: '', area: '', season: '', landId: '' })
  const [saving, setSaving] = useState(false)
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const [seasonFilter, setSeasonFilter] = useState('')
  const popularCrops = ['Wheat','Rice','Maize','Mustard','Gram','Cotton','Sugarcane','Potato','Onion','Tomato','Soybean','Groundnut','Lentil','Barley']
  const seasonOptions = ['Rabi','Kharif','Zaid']
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestions = useMemo(() => {
    const names = Array.from(new Set([...(items.map(i => i.name).filter(Boolean)), ...popularCrops]))
    const q = search.trim().toLowerCase()
    return names.filter(n => !q || n.toLowerCase().includes(q)).slice(0, 10)
  }, [items, popularCrops, search])
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      try {
        const params = { page, size, search: search.trim() || undefined, season: seasonFilter || undefined, ...(targetUserId ? { userId: targetUserId } : {}) }
        const data = await farmerService.listCrops(params)
        setItems(data?.records || data || [])
      } catch (e) {
        setError(e.message || 'Failed to load crops')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, size, search])

  useEffect(() => {
    const loadLands = async () => {
      try {
        const r = await farmerService.listLands(targetUserId ? { userId: targetUserId } : undefined)
        setLands(r?.records || r || [])
      } catch (_) {}
    }
    loadLands()
  }, [])

  const exportCSV = () => {
    const rows = [['Name','Area','Acres'], ...items.map(i => [i.name, i.area, 'acres'])]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crops.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const create = async (e) => {
    e.preventDefault()
    if (!form.name || !form.area) return
    setSaving(true)
    try {
      const payload = { name: form.name, area: Number(form.area), season: form.season || undefined, land: form.landId || undefined }
      const crop = await farmerService.createCrop(payload, targetUserId ? { userId: targetUserId } : undefined)
      setItems(arr => [crop, ...arr])
      setForm({ name: '', area: '', season: '', landId: '' })
      toast.success(t('common.added','Added'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await farmerService.deleteCrop(id, targetUserId ? { userId: targetUserId } : undefined)
    setItems(arr => arr.filter(c => (c._id || c.id) !== id))
    toast.success(t('common.deleted','Deleted'))
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.crops', 'Crops')}</h1>
          <div className="w-24" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!isReadOnly && <form onSubmit={create} className="glass-card rounded-2xl p-6 bg-white grid gap-4 sm:grid-cols-5">
          <input list="crop-suggestions" className="input-field" placeholder={t('farmer.crop','Crop')} value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
          <datalist id="crop-suggestions">
            {popularCrops.map(c => <option key={c} value={c} />)}
          </datalist>
          <input className="input-field" placeholder={t('farmer.area','Area')} value={form.area} onChange={e=>setForm(f=>({ ...f, area: e.target.value }))} />
          <input list="season-suggestions" className="input-field" placeholder={t('farmer.season','Season')} value={form.season} onChange={e=>setForm(f=>({ ...f, season: e.target.value }))} />
          <datalist id="season-suggestions">
            {seasonOptions.map(s => <option key={s} value={s} />)}
          </datalist>
          <select className="input-field" value={form.landId} onChange={e=>setForm(f=>({ ...f, landId: e.target.value }))}>
            <option value="">{t('farmer.selectLand','Select Land')}</option>
            {lands.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.plotName || 'Plot'} ({l.area})</option>)}
          </select>
          <div className="sm:col-span-5 flex justify-end">
            <button className="px-4 py-2 rounded-xl bg-primary text-white" disabled={saving}>{saving ? t('common.saving','Saving...') : t('common.add','Add')}</button>
          </div>
        </form>}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              className="input-field"
              placeholder={t('common.search','Search')}
              value={search}
              onChange={e=>setSearch(e.target.value)}
              onFocus={()=>setShowSuggestions(true)}
              onBlur={()=>setTimeout(()=>setShowSuggestions(false), 120)}
            />
            {showSuggestions && suggestions.length ? (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-auto">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-surface-hover text-text-secondary"
                  onMouseDown={() => { setSearch(''); setShowSuggestions(false); }}
                >
                  {t('farmer.allCrops','All Crops')}
                </button>
                {suggestions.map(s => (
                  <button
                    key={s}
                    className="w-full text-left px-3 py-2 hover:bg-surface-hover flex items-center gap-2"
                    onMouseDown={() => { setSearch(s); setShowSuggestions(false); setPage(1) }}
                  >
                    <SearchIcon className="w-4 h-4 text-primary" />
                    <span className="font-medium text-text-primary">{s}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <select className="input-field" value={size} onChange={e=>setSize(Number(e.target.value))}>
            {[10,20,50].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" value={seasonFilter} onChange={e=>setSeasonFilter(e.target.value)}>
            <option value="">{t('farmer.allSeasons','All Seasons')}</option>
            {['Rabi','Kharif','Zaid'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="px-3 py-2 rounded-lg bg-surface border border-border" onClick={exportCSV}>{t('farmer.exportCsv','Export CSV')}</button>
        </div>
        {loading ? <div className="rounded-2xl bg-gray-50 border border-border p-4">{t('common.loading', 'Loading...')}</div> : null}
        {error ? <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700">{error}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(c => (
            <article key={c._id || c.id} className="rounded-2xl border border-border p-5 bg-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-primary" />
                  <h5 className="font-bold text-text-primary">{c.name}</h5>
                </div>
                <button className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary text-white" onClick={() => navigate(`/farmer/crops/${c._id || c.id}${targetUserId ? `?userId=${targetUserId}` : ''}`)}>
                  {t('farmer.manage', 'Manage')}
                </button>
              </div>
              <p className="text-sm text-text-secondary">{t('farmer.area', 'Area')}: {c.area} {t('farmer.acres', 'acres')}</p>
              <p className="text-xs text-text-secondary flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.season || '-'}</p>
              {!isReadOnly && <div className="mt-3">
                <button className="px-3 py-1 rounded-md bg-rose-600 text-white" onClick={() => remove(c._id || c.id)}>{t('common.delete','Delete')}</button>
              </div>}
            </article>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button className="px-3 py-2 rounded-lg bg-surface border border-border" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{t('common.prev','Prev')}</button>
          <span className="text-sm text-text-secondary">{t('common.page','Page')} {page}</span>
          <button className="px-3 py-2 rounded-lg bg-surface border border-border" onClick={()=>setPage(p=>p+1)}>{t('common.next','Next')}</button>
        </div>
      </main>
    </div>
  )
}
