const express = require('express')
const router = express.Router()
const {
  getAll, getById, create,
  update, remove, updateStock
} = require('../controllers/productsController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, getAll)
router.get('/:id', authMiddleware, getById)
router.post('/', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)
router.patch('/:id/stock', authMiddleware, updateStock)

module.exports = router