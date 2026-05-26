const supabase = require('../config/supabase')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos'
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      })
    }

    return res.json({
      message: 'Bienvenido a BEER TRUCK',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'staff'
      },
      token: data.session.access_token
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Error del servidor',
      message: error.message
    })
  }
}

const logout = async (req, res) => {
  try {
    await supabase.auth.signOut()
    return res.json({ message: 'Sesión cerrada correctamente' })
  } catch (error) {
    return res.status(500).json({
      error: 'Error del servidor',
      message: error.message
    })
  }
}

const getProfile = async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.user_metadata?.role || 'staff'
      }
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Error del servidor',
      message: error.message
    })
  }
}

module.exports = { login, logout, getProfile }