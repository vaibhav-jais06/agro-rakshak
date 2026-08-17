import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-primary text-white mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2025 {t('common.appName')}. {t('footer.allRightsReserved', 'All rights reserved.')}</p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <Link to="#" className="hover:text-gray-200 transition">{t('footer.privacyPolicy', 'Privacy Policy')}</Link>
            <Link to="#" className="hover:text-gray-200 transition">{t('footer.termsOfService', 'Terms of Service')}</Link>
            <Link to="#" className="hover:text-gray-200 transition">{t('footer.refundPolicy', 'Refund Policy')}</Link>
            <a href="mailto:support@agrorakshak.com" className="hover:text-gray-200 transition">{t('footer.contactSupport', 'Contact Support')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
