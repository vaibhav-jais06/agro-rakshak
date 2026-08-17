const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const upload = multer({ dest: 'backend/uploads/avatars' })
const fc = require('../controllers/farmerController')

router.use(auth)

router.get('/dashboard/stats', fc.getDashboardStats)
router.get('/dashboard/analytics', fc.getAnalytics)

router.get('/profile', fc.getProfile)
router.put('/profile', fc.updateProfile)
router.post('/profile/avatar', upload.single('avatar'), fc.uploadAvatar)

router.get('/lands', fc.listLands)
router.post('/lands', fc.createLand)
router.put('/lands/:id', fc.updateLand)
router.delete('/lands/:id', fc.deleteLand)

router.get('/crops', fc.listCrops)
router.post('/crops', fc.createCrop)
router.get('/crops/:id', fc.getCrop)
router.put('/crops/:id', fc.updateCrop)
router.delete('/crops/:id', fc.deleteCrop)
router.get('/crops/:id/activities', fc.listActivities)
router.post('/crops/:id/activities', fc.addActivity)

router.get('/finances/transactions', fc.listTransactions)
router.post('/finances/transactions', fc.addTransaction)
router.get('/finances/summary', fc.getFinancialSummary)
router.get('/finances/loans', fc.listLoans)
router.post('/finances/loans', fc.addLoan)
router.put('/finances/loans/:loanId/pay', fc.payLoan)

router.get('/schemes', fc.listSchemes)
router.get('/schemes/applications', fc.listApplications)
router.post('/schemes/applications', fc.applyScheme)

router.get('/advisories', fc.listAdvisories)
router.put('/advisories/:id/read', fc.markAdvisoryRead)
router.get('/advisories/unread-count', fc.getUnreadCount)

router.get('/consultations', fc.listConsultations)
router.post('/consultations', fc.createConsultation)

module.exports = router
