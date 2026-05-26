const supabase = require('../config/supabase')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de acceso requerido'
      })
    }

    const token = authHeader.substring(7)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado'
      })
    }

    req.user = user
    next()

  } catch (error) {
    return res.status(500).json({
      error: 'Error del servidor',
      message: error.message
    })
  }
}

module.exports = authMiddleware