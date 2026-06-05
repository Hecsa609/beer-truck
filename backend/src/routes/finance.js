const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const {
  getTransactions, createTransaction, updateTransaction,
  getAccountsPayable, createAccountPayable, updateAccountPayable,
  getBankMovements, createBankMovement, getAccountBalances,
  getFixedAssets, createFixedAsset,
  getFinancialSummary
} = require('../controllers/financeController')

router.use(authMiddleware)

router.get('/summary', getFinancialSummary)
router.get('/transactions', getTransactions)
router.post('/transactions', createTransaction)
router.put('/transactions/:id', updateTransaction)
router.get('/accounts-payable', getAccountsPayable)
router.post('/accounts-payable', createAccountPayable)
router.put('/accounts-payable/:id', updateAccountPayable)
router.get('/bank-movements', getBankMovements)
router.post('/bank-movements', createBankMovement)
router.get('/account-balances', getAccountBalances)
router.get('/fixed-assets', getFixedAssets)
router.post('/fixed-assets', createFixedAsset)

module.exports = router