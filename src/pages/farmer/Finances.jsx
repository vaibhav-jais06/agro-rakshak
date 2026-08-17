import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import farmerService from '../../services/farmerService'
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerFinances({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loans, setLoans] = useState([])
  const [txForm, setTxForm] = useState({ title: '', amount: '', type: 'expense', date: '' })
  const [loanForm, setLoanForm] = useState({ bank: '', principal: '' })
  const [payAmount, setPayAmount] = useState({})
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || undefined

  useEffect(() => {
    const load = async () => {
      const params = targetUserId ? { userId: targetUserId } : undefined
      const s = await farmerService.getFinancialSummary(params)
      const tx = await farmerService.listTransactions(params)
      const ln = await farmerService.listLoans(params)
      setSummary(s)
      setTransactions(tx?.records || tx || [])
      setLoans(ln?.records || ln || [])
    }
    load()
  }, [])

  const addTransaction = async (e) => {
    e.preventDefault()
    if (!txForm.title || !txForm.amount) return
    const payload = { title: txForm.title, amount: Number(txForm.amount), type: txForm.type, date: txForm.date || new Date().toISOString() }
    const r = await farmerService.addTransaction(payload, targetUserId ? { userId: targetUserId } : undefined)
    setTransactions(arr => [r, ...arr])
    setTxForm({ title: '', amount: '', type: 'expense', date: '' })
    const s = await farmerService.getFinancialSummary(targetUserId ? { userId: targetUserId } : undefined)
    setSummary(s)
    toast.success(t('common.added','Added'))
  }

  const addLoan = async (e) => {
    e.preventDefault()
    if (!loanForm.bank || !loanForm.principal) return
    const payload = { bank: loanForm.bank, principal: Number(loanForm.principal), balance: Number(loanForm.principal) }
    const r = await farmerService.addLoan(payload, targetUserId ? { userId: targetUserId } : undefined)
    setLoans(arr => [r, ...arr])
    setLoanForm({ bank: '', principal: '' })
    toast.success(t('common.added','Added'))
  }

  const pay = async (loanId) => {
    const amt = Number(payAmount[loanId] || 0)
    if (!amt) return
    const r = await farmerService.payLoan(loanId, { amount: amt }, targetUserId ? { userId: targetUserId } : undefined)
    setLoans(arr => arr.map(l => (l._id || l.id) === loanId ? r : l))
    setPayAmount(m => ({ ...m, [loanId]: '' }))
    toast.success(t('farmer.paymentDone','Payment done'))
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/farmer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
            <span className="font-medium hidden sm:inline">{t('farmer.backToDashboard', 'Back to Dashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('farmer.finances', 'Finances')}</h1>
          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-green-50/50 border border-green-100 p-5">
            <p className="text-sm font-medium text-green-800 mb-1">{t('farmer.income', 'Income')}</p>
            <p className="text-3xl font-bold text-primary">₹{summary?.income ?? '-'}</p>
          </div>
          <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-5">
            <p className="text-sm font-medium text-rose-800 mb-1">{t('farmer.expenses', 'Expenses')}</p>
            <p className="text-3xl font-bold text-rose-600">₹{summary?.expenses ?? '-'}</p>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-8 bg-white">
          <h3 className="text-lg font-bold mb-4">{t('farmer.transactions', 'Transactions')}</h3>
          <form onSubmit={addTransaction} className="grid gap-3 sm:grid-cols-4 mb-4">
            <input className="input-field" placeholder={t('common.title','Title')} value={txForm.title} onChange={e=>setTxForm(f=>({ ...f, title: e.target.value }))} />
            <input className="input-field" placeholder={t('farmer.amount','Amount')} value={txForm.amount} onChange={e=>setTxForm(f=>({ ...f, amount: e.target.value }))} />
            <select className="input-field" value={txForm.type} onChange={e=>setTxForm(f=>({ ...f, type: e.target.value }))}>
              <option value="expense">{t('farmer.expense','Expense')}</option>
              <option value="income">{t('farmer.income','Income')}</option>
            </select>
            <input className="input-field" type="date" value={txForm.date} onChange={e=>setTxForm(f=>({ ...f, date: e.target.value }))} />
            <div className="sm:col-span-4 flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-primary text-white">{t('common.add','Add')}</button>
            </div>
          </form>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx._id || tx.id} className="rounded-xl bg-gray-50 border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tx.title}</p>
                  <p className="text-sm text-text-secondary">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {tx.type === 'income' ? <ArrowUpCircle className="w-5 h-5 text-green-600" /> : <ArrowDownCircle className="w-5 h-5 text-rose-600" />}
                  <p className="font-bold">₹{tx.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-8 bg-white">
          <h3 className="text-lg font-bold mb-4">{t('farmer.loans', 'Loans')}</h3>
          <form onSubmit={addLoan} className="grid gap-3 sm:grid-cols-3 mb-4">
            <input className="input-field" placeholder={t('farmer.bank','Bank')} value={loanForm.bank} onChange={e=>setLoanForm(f=>({ ...f, bank: e.target.value }))} />
            <input className="input-field" placeholder={t('farmer.principal','Principal')} value={loanForm.principal} onChange={e=>setLoanForm(f=>({ ...f, principal: e.target.value }))} />
            <div className="sm:col-span-3 flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-primary text-white">{t('common.add','Add')}</button>
            </div>
          </form>
          <div className="space-y-3">
            {loans.map(l => (
              <div key={l._id || l.id} className="rounded-xl bg-gray-50 border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{l.bank}</p>
                  <p className="text-sm text-text-secondary">{t('farmer.principal', 'Principal')}: ₹{l.principal}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">{t('farmer.balance', 'Balance')}: ₹{l.balance}</p>
                  <input className="input-field w-28" placeholder={t('farmer.amount','Amount')} value={payAmount[l._id || l.id] || ''} onChange={e=>setPayAmount(m=>({ ...m, [l._id || l.id]: e.target.value }))} />
                  <button className="px-3 py-1 rounded-md bg-primary text-white" onClick={() => pay(l._id || l.id)}>{t('farmer.pay','Pay')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
