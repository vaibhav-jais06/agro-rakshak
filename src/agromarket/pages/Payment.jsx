import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Payment() {
  const { t } = useTranslation()
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  const shipping = 50
  const gst = cartTotal * 0.18
  const total = cartTotal + shipping + gst

   const handlePayment = async (e) => {
     e.preventDefault()
     setLoading(true)
     setTimeout(() => {
       toast.success(t('agriShopPayment.paymentSuccessful'))
       clearCart()
       navigate('/agri-shop')
       setLoading(false)
     }, 2000)
   }

  if (cart.length === 0) {
    navigate('/agri-shop/cart')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout & Payment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary" />
                  <span>UPI</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary" />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="input-field" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <input type="text" placeholder="123" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                  <input type="text" placeholder="John Doe" className="input-field" required />
                </div>
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium mb-1">UPI ID</label>
                <input type="text" placeholder="username@upi" className="input-field" required />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg font-bold">{loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
