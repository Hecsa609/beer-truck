const express = require('express')
const router = express.Router()
const { getAll, updateRole, createUser } = require('../controllers/usersController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, createUser)
router.put('/:id', authMiddleware, updateRole)

module.exports = router