const express = require('express')
const router = express.Router()
const { getAll, getById, create, getDailySummary } = require('../controllers/salesController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, getAll)
router.get('/summary/today', authMiddleware, getDailySummary)
router.get('/:id', authMiddleware, getById)
router.post('/', authMiddleware, create)

module.exports = router