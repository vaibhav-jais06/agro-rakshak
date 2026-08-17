import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useState } from "react";


export default function Navbar() {
  const { t } = useTranslation();
  const { logout, isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/agri-shop");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                if (window.history && window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="flex items-center text-primary hover:text-primary-dark transition font-medium"
            >
              <FiArrowLeft className="mr-2" />
              {t("weatherIntelligence.backToDashboard")}
            </Link>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <span className="text-xl sm:text-2xl font-bold text-primary truncate max-w-[50vw] sm:max-w-none">
              {t("features.agriShop")}- {t("common.appNameDevanagari")}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/agri-shop/cart"
              className="relative text-gray-600 hover:text-primary transition"
            >
              <FiShoppingCart className="text-2xl" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            <button className="sm:hidden px-3 py-2 border rounded-md text-sm" onClick={() => setMenuOpen((v) => !v)}>
              Menu
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="text-sm">Logged in: {user?.name} ({user?.role})</span>
                </div>
                <LanguageSwitcher />
                {user?.role === 'seller' && (
                  <Link to="/agri-shop/seller" className="text-sm text-primary hover:text-primary-dark">Seller Panel</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t("auth.logout")}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-gray-500"></span>
                <LanguageSwitcher />
                <Link to="/agri-shop/login" className="px-4 py-2 rounded-lg text-primary border border-primary hover:bg-primary hover:text-white transition-colors font-medium">Login as Seller</Link>
              </div>
            )}
          </div>
        </div>
         {menuOpen && (
           <div className="sm:hidden border-t py-2 flex flex-col gap-2">
             {isAuthenticated ? (
               <>
                 <div className="text-sm text-gray-600">Logged in: {user?.name} ({user?.role})</div>
                 {user?.role === 'seller' && (
                   <Link to="/agri-shop/seller" className="text-sm text-primary">Seller Panel</Link>
                 )}
                 <LanguageSwitcher />
                 <button onClick={handleLogout} className="text-sm text-red-600 text-left">{t("auth.logout")}</button>
               </>
             ) : (
               <>
                 <LanguageSwitcher />
                 <Link to="/agri-shop/login" className="text-primary text-sm px-3 py-2 border border-primary rounded-lg text-center hover:bg-primary hover:text-white transition-colors">Login as Seller</Link>
               </>
             )}
           </div>
         )}
      </div>
    </nav>
  );
}
