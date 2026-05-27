const path = require('path')
const dotenv = require('dotenv')

const envPath = path.resolve(__dirname, '..', '.env')
const result = dotenv.config({ path: envPath })
if (result.error) {
  dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })
}

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const productsRoutes = require('./routes/products')
const customersRoutes = require('./routes/customers')
const eventsRoutes = require('./routes/events')
const salesRoutes = require('./routes/sales')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta más tarde' }
})
app.use(limiter)

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    proyecto: 'BEER TRUCK API',
    version: '1.0.0',
    rutas: ['/api/auth', '/api/products', '/api/customers', '/api/events', '/api/sales'],
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/sales', salesRoutes)

app.listen(PORT, () => {
  console.log(`🍺 BEER TRUCK API corriendo en http://localhost:${PORT}`)
  console.log(`✅ Ambiente: ${process.env.NODE_ENV}`)
  console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL ? 'conectado' : 'no encontrado'}`)
})

module.exports = app