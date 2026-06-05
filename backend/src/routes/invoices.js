const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const {
  getInvoices, getInvoiceById, createInvoice,
  updateInvoiceStatus, registerPayment, getInvoiceStats
} = require('../controllers/invoicesController')

router.use(authMiddleware)

router.get('/stats', getInvoiceStats)
router.get('/', getInvoices)
router.get('/:id', getInvoiceById)
router.post('/', createInvoice)
router.patch('/:id/status', updateInvoiceStatus)
router.post('/:id/payments', registerPayment)

module.exports = router