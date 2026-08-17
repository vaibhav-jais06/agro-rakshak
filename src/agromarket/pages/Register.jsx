import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import apiService from '../../services/apiService'

export default function Register() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'consumer', aadhaar: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('agriShopAuth.passwordsDoNotMatch'))
      return
    }
    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        username: formData.email?.trim()?.toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        role: formData.role === 'seller' ? 'seller' : 'user'
      }
      const res = await apiService.api.post('/api/auth/register', payload)
      if (res.data?.success && res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token)
        toast.success(t('agriShopAuth.registrationSuccessful'))
        navigate('/agri-shop')
      } else {
        toast.error(res.data?.message || t('errors.registrationFailed'))
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('errors.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" placeholder="Enter your phone number" />
            </div>
            {(formData.role === 'farmer' || formData.role === 'seller') && (
              <div>
                <label className="block text-sm font-semibold mb-2">Aadhaar Number (Optional)</label>
                <input type="text" value={formData.aadhaar} onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })} className="input-field" placeholder="Enter Aadhaar number" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-field">
                <option value="consumer">Consumer</option>
                <option value="farmer">Farmer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" placeholder="Create a password" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-field" placeholder="Confirm your password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Registering...' : 'Register'}</button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Already have an account? <Link to="/agri-shop/login" className="text-primary hover:underline">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
