const express = require('express')
const router = express.Router()
const { getAll, getById, create, update, updateStatus } = require('../controllers/eventsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, getAll)
router.get('/:id', authMiddleware, getById)
router.post('/', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.patch('/:id/status', authMiddleware, updateStatus)

module.exports = router