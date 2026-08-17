import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { toast } from 'react-hot-toast'

export default function FarmerProfile({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      try {
        const p = await farmerService.getProfile(targetUserId ? { userId: targetUserId } : undefined)
        setProfile(p)
      } catch (e) {
        setError(e.message || 'Failed to load profile')
      }
    }
    load()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: profile?.name,
        phone: profile?.phone,
        district: profile?.district,
        pincode: profile?.pincode
      }
      await farmerService.updateProfile(payload)
      const refreshed = await farmerService.getProfile(targetUserId ? { userId: targetUserId } : undefined)
      setProfile(refreshed)
      toast.success('Profile saved')
    } catch (e) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await farmerService.uploadAvatar(file, targetUserId ? { userId: targetUserId } : undefined)
    } catch (e) {
      setError(e.message || 'Avatar upload failed')
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.profile', 'Profile')}</h1>
          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <form onSubmit={save} className="glass-card rounded-3xl p-8 bg-white space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('common.name', 'Name')}</label>
            <input className="input-field" value={profile?.name || ''} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('auth.phoneNumber', 'Phone Number')}</label>
            <input className="input-field" value={profile?.phone || ''} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} disabled={isReadOnly} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('registration.district', 'District')}</label>
              <input className="input-field" value={profile?.district || ''} onChange={(e) => setProfile(p => ({ ...p, district: e.target.value }))} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('registration.village', 'Village')}</label>
              <input className="input-field" value={profile?.village || ''} onChange={(e) => setProfile(p => ({ ...p, village: e.target.value }))} disabled={isReadOnly} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('registration.latitude', 'Latitude')}</label>
            <input className="input-field" value={profile?.lat || ''} onChange={(e) => setProfile(p => ({ ...p, lat: e.target.value }))} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('registration.longitude', 'Longitude')}</label>
            <input className="input-field" value={profile?.lon || ''} onChange={(e) => setProfile(p => ({ ...p, lon: e.target.value }))} disabled={isReadOnly} />
          </div>

          <div className="flex items-center gap-3">
            {!isReadOnly && <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">{saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}</button>}
            {!isReadOnly && <label className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer">
              {t('farmer.uploadAvatar', 'Upload Avatar')}
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>}
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>
      </main>
    </div>
  )
}
