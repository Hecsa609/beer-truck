const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { generateEstadosFinancieros } = require('../controllers/reportsController')

router.use(authMiddleware)
router.get('/estados-financieros', generateEstadosFinancieros)

module.exports = router