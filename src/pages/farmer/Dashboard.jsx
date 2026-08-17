import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { Leaf, Wallet, BarChart3, PlusCircle, User as UserIcon, Sprout, MapPin, ScrollText, MessageSquare } from 'lucide-react'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function FarmerDashboard({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          farmerService.getDashboardStats(targetUserId ? { userId: targetUserId } : undefined),
          farmerService.getAnalytics(targetUserId ? { userId: targetUserId } : undefined)
        ])
        if (!mounted) return
        setStats(s)
        setAnalytics(a)
      } catch (e) {
        setError(e.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('navbar.home', 'Home')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.dashboardTitle', 'Farmer Dashboard')}</h1>
          <div className="flex items-center"><LanguageSwitcher /></div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="glass-card rounded-3xl p-8 bg-white">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <UserIcon className="w-5 h-5" />, label: t('farmer.profile','Profile'), to: '/farmer/profile' },
              { icon: <MapPin className="w-5 h-5" />, label: t('farmer.lands','Lands'), to: '/farmer/lands' },
              { icon: <Sprout className="w-5 h-5" />, label: t('farmer.crops','Crops'), to: '/farmer/crops' },
              { icon: <Wallet className="w-5 h-5" />, label: t('farmer.finances','Finances'), to: '/farmer/finances' },
              { icon: <ScrollText className="w-5 h-5" />, label: t('farmer.schemes','Schemes'), to: '/farmer/schemes' },
              { icon: <MessageSquare className="w-5 h-5" />, label: t('farmer.consultations','Consultations'), to: '/farmer/consultations' }
            ].map((a) => (
              <button key={a.to} onClick={() => navigate(`${a.to}${targetUserId ? `?userId=${targetUserId}` : ''}`)} className="flex items-center justify-between rounded-2xl bg-gray-50 border border-border p-5 hover:bg-white">
                <span className="flex items-center gap-3 font-semibold text-text-primary">{a.icon}{a.label}</span>
                <span className="text-primary">→</span>
              </button>
            ))}
          </div>
        </section>
        <section className="glass-card rounded-3xl p-8 bg-white">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-green-50/50 border border-green-100 p-5">
              <p className="text-sm font-medium text-green-800 mb-1">{t('farmer.totalLand', 'Total Land')}</p>
              <p className="text-3xl font-bold text-primary">{stats?.landArea ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-5">
              <p className="text-sm font-medium text-blue-800 mb-1">{t('farmer.activeCrops', 'Active Crops')}</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.activeCrops ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-5">
              <p className="text-sm font-medium text-amber-800 mb-1">{t('farmer.income', 'Income')}</p>
              <p className="text-3xl font-bold text-amber-600">₹{stats?.income ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-5">
              <p className="text-sm font-medium text-rose-800 mb-1">{t('farmer.profit', 'Profit')}</p>
              <p className="text-3xl font-bold text-rose-600">₹{stats?.profit ?? '-'}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-gray-50 border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">{t('farmer.currentCrops', 'Current Crops')}</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(analytics?.crops || []).map((c) => (
                  <div key={c.id} className="rounded-xl bg-white border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-text-secondary">{c.area} {t('farmer.acres', 'acres')}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white" onClick={() => navigate(`/farmer/crops/${c.id}`)}>
                      <PlusCircle className="w-4 h-4" /> {t('farmer.manage', 'Manage')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">{t('farmer.financialSummary', 'Financial Summary')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('farmer.summaryHint', 'Track transactions and loans under Finances.')}</p>
            </div>
            <div className="rounded-2xl bg-white border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold">{t('farmer.yieldTrends', 'Yield Trends')}</h3>
              </div>
              {Array.isArray(analytics?.yieldTrends) && analytics.yieldTrends.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.yieldTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">{t('farmer.trendsHint', 'Charts will appear when data is available.')}</p>
              )}
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700">{error}</div>
        ) : null}
        {loading ? (
          <div className="rounded-2xl bg-gray-50 border border-border p-4">{t('common.loading', 'Loading...')}</div>
        ) : null}
      </main>
    </div>
  )
}
