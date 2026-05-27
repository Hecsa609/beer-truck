const express = require('express')
const router = express.Router()
const { getAll, getById, create, update, remove } = require('../controllers/customersController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, getAll)
router.get('/:id', authMiddleware, getById)
router.post('/', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)

module.exports = router