import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerConsultations({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined
  const isReadOnly = user?.role === 'admin' && !!targetUserId

  useEffect(() => {
    const load = async () => {
      const r = await farmerService.listConsultations(targetUserId ? { userId: targetUserId } : undefined)
      setItems(r?.records || r || [])
    }
    load()
  }, [targetUserId])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const r = await farmerService.createConsultation({ question: text }, targetUserId ? { userId: targetUserId } : undefined)
    setItems(arr => [r, ...arr])
    setText('')
    toast.success(t('common.submitted','Submitted'))
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.consultations', 'Consultations')}</h1>
          <div className="w-24" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="glass-card rounded-3xl p-8 bg-white">
          {!isReadOnly && <form onSubmit={submit} className="flex gap-3 mb-4">
            <input className="input-field flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('farmer.askQuestion', 'Ask a question')} />
            <button className="px-4 py-2 rounded-xl bg-primary text-white font-semibold">{t('common.submit', 'Submit')}</button>
          </form>}
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={it._id || i} className="rounded-xl bg-gray-50 border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <p className="font-semibold">{it.question}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  {it.answer ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                  <span>{it.answer || t('farmer.pending','Pending')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
