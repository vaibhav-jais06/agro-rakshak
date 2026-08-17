import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Cart() {
  const { t } = useTranslation()
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = async () => {
     if (!isAuthenticated) {
       toast.error(t('agriShopAuth.pleaseLoginToContinue'))
       navigate('/agri-shop/login')
       return
     }
     if (cart.length === 0) {
       toast.error(t('agriShopCart.yourCartIsEmptyError'))
       return
     }
     navigate('/agri-shop/payment')
   }

   if (cart.length === 0) {
     return (
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
         <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
         <h2 className="text-2xl font-bold mb-4">{t('agriShopCart.yourCartIsEmpty')}</h2>
         <p className="text-gray-600 mb-6">{t('agriShopCart.addSomeProducts')}</p>
         <Link to="/agri-shop/marketplace" className="btn-primary">{t('agriShopCart.continueShopping')}</Link>
       </div>
     )
   }

  const shipping = 50
  const gst = cartTotal * 0.18
  const total = cartTotal + shipping + gst

   return (
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <h1 className="text-3xl font-bold mb-8">{t('agriShopCart.shoppingCart')}</h1>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
           {cart.map(item => (
             <div key={item.id} className="card flex flex-col sm:flex-row gap-4">
               <img src={item.image} alt={item.name} className="w-full sm:w-32 h-32 object-cover rounded-lg" />
               <div className="flex-1">
                 <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                 <p className="text-gray-600 mb-2">{item.brand}</p>
                 <p className="text-xl font-bold text-primary mb-4">₹{item.price}</p>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 border rounded-lg hover:bg-gray-50"><FiMinus /></button>
                     <span className="font-semibold">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 border rounded-lg hover:bg-gray-50"><FiPlus /></button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-xl font-bold text-primary">₹{item.price * item.quantity}</p>
               </div>
             </div>
           ))}
           <div className="flex justify-between">
             <Link to="/agri-shop/marketplace" className="text-primary hover:underline">{t('agriShopCart.continueShopping')}</Link>
             <button onClick={clearCart} className="text-red-500 hover:text-red-700">{t('agriShopCart.clearCart')}</button>
           </div>
         </div>
         <div className="lg:col-span-1">
           <div className="card sticky top-20">
             <h2 className="text-xl font-bold mb-4">{t('agriShopCart.orderSummary')}</h2>
             <div className="space-y-3 mb-4">
               <div className="flex justify-between"><span>{t('agriShopCart.subtotal')}</span><span>₹{cartTotal.toFixed(2)}</span></div>
               <div className="flex justify-between"><span>{t('agriShopCart.shipping')}</span><span>₹{shipping.toFixed(2)}</span></div>
               <div className="flex justify-between"><span>{t('agriShopCart.gst')}</span><span>₹{gst.toFixed(2)}</span></div>
               <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>{t('agriShopCart.total')}</span><span className="text-primary">₹{total.toFixed(2)}</span></div>
             </div>
             <button onClick={handleCheckout} className="btn-primary w-full mb-4">{t('agriShopCart.proceedToCheckout')}</button>
             <div className="text-sm text-gray-600 space-y-2">
               <p>• {t('agriShopCart.cashOnDelivery')}</p>
               <p>• {t('agriShopCart.freeShipping')}</p>
               <p>• {t('agriShopCart.securePayment')}</p>
             </div>
           </div>
         </div>
       </div>
     </div>
   )
}
