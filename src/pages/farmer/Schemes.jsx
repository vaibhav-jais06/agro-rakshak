import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { ScrollText, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerSchemes({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState([])
  const [applications, setApplications] = useState([])
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      const s = await farmerService.listSchemes(targetUserId ? { userId: targetUserId } : undefined)
      const a = await farmerService.listApplications(targetUserId ? { userId: targetUserId } : undefined)
      setSchemes(s?.records || s || [])
      setApplications(a?.records || a || [])
    }
    load()
  }, [targetUserId])

  const apply = async (scheme) => {
    const r = await farmerService.applyScheme({ schemeId: scheme._id || scheme.id, schemeName: scheme.name }, targetUserId ? { userId: targetUserId } : undefined)
    setApplications(arr => [r, ...arr])
    toast.success('Applied')
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.schemes', 'Schemes')}</h1>
          <div className="w-24" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="glass-card rounded-3xl p-8 bg-white">
          <h3 className="text-lg font-bold mb-4">{t('farmer.availableSchemes', 'Available Schemes')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {schemes.map(s => (
              <article key={s._id || s.id} className="rounded-2xl border border-border p-5 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="w-4 h-4 text-primary" />
                  <h5 className="font-bold text-text-primary">{s.name}</h5>
                </div>
                {s.description && <p className="text-sm text-text-secondary mb-3">{s.description}</p>}
                <div className="flex gap-2">
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-gray-800 text-white font-semibold">
                      {t('farmer.viewDetails', 'View Details')}
                    </a>
                  )}
                  {!isReadOnly && (
                    <button className="px-4 py-2 rounded-xl bg-primary text-white font-semibold" onClick={() => apply(s)}>
                      {t('farmer.apply', 'Apply')}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="glass-card rounded-3xl p-8 bg-white">
          <h3 className="text-lg font-bold mb-4">{t('farmer.myApplications', 'My Applications')}</h3>
          <div className="space-y-3">
            {applications.map(a => (
              <div key={a._id || a.id} className="rounded-xl bg-gray-50 border border-border p-4 flex items-center justify-between">
                <p className="font-semibold">{a.schemeName || a.schemeId}</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${a.status==='approved' ? 'bg-green-100 text-green-700' : a.status==='rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {a.status==='approved' ? <CheckCircle2 className="w-3 h-3" /> : a.status==='rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
