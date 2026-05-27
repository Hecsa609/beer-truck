const supabase = require('../config/supabase')

const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    return res.json({ customers: data, total: data.length })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('customers')
      .select(`*, events (id, name, event_date, status, agreed_price)`)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Cliente no encontrado' })

    return res.json({ customer: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const { name, email, phone, rfc, address, city, customer_type, notes } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre es requerido'
      })
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name, email, phone, rfc, address,
        city, customer_type: customer_type || 'regular',
        notes, active: true
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({
      message: 'Cliente creado correctamente',
      customer: data
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, rfc, address, city, customer_type, notes, active } = req.body

    const { data, error } = await supabase
      .from('customers')
      .update({ name, email, phone, rfc, address, city, customer_type, notes, active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return res.json({ message: 'Cliente actualizado', customer: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('customers')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error
    return res.json({ message: 'Cliente desactivado correctamente' })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, getById, create, update, remove }