import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import apiService from '../../services/apiService'

export default function Login() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const val = formData.email.trim()
      const isPhone = /^\d{10}$/.test(val)
      const payload = { password: formData.password }
      if (isPhone) payload.phone = val
      else payload.username = val
      const res = await apiService.api.post('/api/auth/login', payload)
      if (res.data?.success && res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token)
        toast.success(t('agriShopAuth.loginSuccessful'))
        navigate('/agri-shop')
      } else {
        toast.error(res.data?.message || t('errors.loginFailed'))
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('errors.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">Don't have an account? <Link to="/agri-shop/register" className="text-primary hover:underline">Register here</Link></p>
            <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center gap-4">
              <Link to="/agri-shop/register" className="btn-secondary text-sm py-2 px-6">Register as Seller</Link>
              <Link to="/agri-shop/seller" className="text-primary hover:underline text-sm">Go to Seller Panel</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
