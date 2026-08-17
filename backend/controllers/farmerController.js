const FarmerProfile = require('../models/FarmerProfile')
const FarmLand = require('../models/FarmLand')
const FarmerCrop = require('../models/FarmerCrop')
const FarmerActivity = require('../models/FarmerActivity')
const Transaction = require('../models/Transaction')
const Loan = require('../models/Loan')
const SchemeApplication = require('../models/SchemeApplication')
const Advisory = require('../models/Advisory')
const Consultation = require('../models/Consultation')
const FarmerAnalytics = require('../models/FarmerAnalytics')
const Notification = require('../models/Notification')

const getTargetUserId = (req) => (req.user?.role === 'admin' && req.query.userId ? req.query.userId : req.user._id)
const isAdminTargetingOther = (req) => req.user?.role === 'admin' && !!req.query.userId

exports.getDashboardStats = async (req, res) => {
  const userId = getTargetUserId(req)
  const [landsCount, cropsCount, income, expenses] = await Promise.all([
    FarmLand.countDocuments({ user: userId }),
    FarmerCrop.countDocuments({ user: userId }),
    Transaction.aggregate([{ $match: { user: userId, type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { user: userId, type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ])
  res.json({ landArea: landsCount, activeCrops: cropsCount, income: income[0]?.total || 0, profit: (income[0]?.total || 0) - (expenses[0]?.total || 0) })
}

exports.getAnalytics = async (req, res) => {
  const userId = getTargetUserId(req)
  const analytics = await FarmerAnalytics.findOne({ user: userId })
  if (!analytics) return res.json({ crops: [], yieldTrends: [] })
  res.json(analytics.data || { crops: [], yieldTrends: [] })
}

exports.getProfile = async (req, res) => {
  const userId = getTargetUserId(req)
  const profile = await FarmerProfile.findOne({ user: userId })
  res.json(profile || {})
}

exports.updateProfile = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const userId = getTargetUserId(req)
  const updated = await FarmerProfile.findOneAndUpdate(
    { user: userId },
    { $set: { ...req.body }, $setOnInsert: { user: userId } },
    { upsert: true, new: true }
  )
  res.json(updated)
}

exports.uploadAvatar = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const userId = getTargetUserId(req)
  const url = req.file?.path || req.body?.avatarUrl
  if (!url) return res.status(400).json({ message: 'No avatar provided' })
  const updated = await FarmerProfile.findOneAndUpdate({ user: userId }, { avatarUrl: url }, { upsert: true, new: true })
  res.json(updated)
}

exports.listLands = async (req, res) => {
  const userId = getTargetUserId(req)
  const { page = 1, size = 20 } = req.query
  const records = await FarmLand.find({ user: userId }).skip((page-1)*size).limit(Number(size))
  res.json({ records })
}

exports.createLand = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const land = await FarmLand.create({ user: getTargetUserId(req), ...req.body })
  res.json(land)
}

exports.updateLand = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const land = await FarmLand.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true })
  res.json(land)
}

exports.deleteLand = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  await FarmLand.deleteOne({ _id: req.params.id, user: req.user._id })
  res.json({ success: true })
}

exports.listCrops = async (req, res) => {
  const userId = getTargetUserId(req)
  const { page = 1, size = 20, search } = req.query
  const q = { user: userId }
  if (search) q.name = new RegExp(search, 'i')
  const records = await FarmerCrop.find(q).skip((page-1)*size).limit(Number(size))
  res.json({ records })
}

exports.getCrop = async (req, res) => {
  const crop = await FarmerCrop.findOne({ _id: req.params.id, user: getTargetUserId(req) })
  res.json(crop)
}

exports.createCrop = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const crop = await FarmerCrop.create({ user: getTargetUserId(req), ...req.body })
  res.json(crop)
}

exports.updateCrop = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const crop = await FarmerCrop.findOneAndUpdate({ _id: req.params.id, user: getTargetUserId(req) }, req.body, { new: true })
  res.json(crop)
}

exports.deleteCrop = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  await FarmerCrop.deleteOne({ _id: req.params.id, user: getTargetUserId(req) })
  res.json({ success: true })
}

exports.listActivities = async (req, res) => {
  const records = await FarmerActivity.find({ crop: req.params.id }).sort({ createdAt: -1 })
  res.json({ records })
}

exports.addActivity = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const activity = await FarmerActivity.create({ crop: req.params.id, note: req.body.note })
  res.json(activity)
}

exports.listTransactions = async (req, res) => {
  const { page = 1, size = 20 } = req.query
  const records = await Transaction.find({ user: getTargetUserId(req) }).sort({ date: -1 }).skip((page-1)*size).limit(Number(size))
  res.json({ records })
}

exports.addTransaction = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const tx = await Transaction.create({ user: getTargetUserId(req), ...req.body })
  res.json(tx)
}

exports.listLoans = async (req, res) => {
  const records = await Loan.find({ user: getTargetUserId(req) })
  res.json({ records })
}

exports.addLoan = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const loan = await Loan.create({ user: getTargetUserId(req), ...req.body })
  res.json(loan)
}

exports.payLoan = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const loan = await Loan.findOne({ _id: req.params.loanId, user: getTargetUserId(req) })
  if (!loan) return res.status(404).json({ message: 'Not found' })
  loan.balance = Math.max(0, (loan.balance || 0) - Number(req.body.amount || 0))
  await loan.save()
  res.json(loan)
}

exports.getFinancialSummary = async (req, res) => {
  const userId = getTargetUserId(req)
  const [income, expenses] = await Promise.all([
    Transaction.aggregate([{ $match: { user: userId, type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { user: userId, type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ])
  res.json({ income: income[0]?.total || 0, expenses: expenses[0]?.total || 0 })
}

exports.listSchemes = async (req, res) => {
  try {
    const docs = await Notification.find({ active: true, type: 'scheme' }).sort({ updatedAt: -1 }).limit(50)
    const items = docs.map((d) => ({ id: d._id.toString(), name: d.message, description: '', url: d.url || '' }))
    res.json({ records: items })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.applyScheme = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const app = await SchemeApplication.create({ user: req.user._id, schemeId: req.body.schemeId, schemeName: req.body.schemeName })
  res.json(app)
}

exports.listApplications = async (req, res) => {
  const records = await SchemeApplication.find({ user: getTargetUserId(req) })
  res.json({ records })
}

exports.listAdvisories = async (req, res) => {
  const records = await Advisory.find({ user: getTargetUserId(req) }).sort({ createdAt: -1 })
  res.json({ records })
}

exports.markAdvisoryRead = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const adv = await Advisory.findOneAndUpdate({ _id: req.params.id, user: getTargetUserId(req) }, { read: true }, { new: true })
  res.json(adv)
}

exports.getUnreadCount = async (req, res) => {
  const count = await Advisory.countDocuments({ user: getTargetUserId(req), read: false })
  res.json({ count })
}

exports.listConsultations = async (req, res) => {
  const records = await Consultation.find({ user: getTargetUserId(req) }).sort({ createdAt: -1 })
  res.json({ records })
}

exports.createConsultation = async (req, res) => {
  if (isAdminTargetingOther(req)) return res.status(403).json({ message: 'Forbidden' })
  const c = await Consultation.create({ user: getTargetUserId(req), question: req.body.question })
  res.json(c)
}
