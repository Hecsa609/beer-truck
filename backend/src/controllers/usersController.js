const supabase = require('../config/supabase')

const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) throw error

    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'staff',
      name: user.user_metadata?.name || user.email.split('@')[0],
      phone: user.user_metadata?.phone || '',
      active: !user.banned_until,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at
    }))

    return res.json({ users, total: users.length })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const updateRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role, name, phone } = req.body

    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role, name, phone }
    })

    if (error) throw error

    return res.json({ message: 'Usuario actualizado', user: data.user })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const createUser = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos'
      })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'staff', name, phone }
    })

    if (error) throw error

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: data.user
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, updateRole, createUser }