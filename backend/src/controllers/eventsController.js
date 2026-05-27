const supabase = require('../config/supabase')

const getAll = async (req, res) => {
  try {
    const { status, from, to } = req.query

    let query = supabase
      .from('events')
      .select(`*, customers (id, name, phone, email)`)
      .order('event_date', { ascending: false })

    if (status) query = query.eq('status', status)
    if (from) query = query.gte('event_date', from)
    if (to) query = query.lte('event_date', to)

    const { data, error } = await query
    if (error) throw error

    return res.json({ events: data, total: data.length })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('events')
      .select(`*, customers (id, name, phone, email)`)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Evento no encontrado' })

    return res.json({ event: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const {
      name, description, customer_id, event_date,
      start_time, end_time, location, address,
      city, estimated_guests, agreed_price, notes
    } = req.body

    if (!name || !event_date) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre y fecha del evento son requeridos'
      })
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{
        name, description, customer_id, event_date,
        start_time, end_time, location, address,
        city, estimated_guests, agreed_price,
        notes, status: 'prospecto'
      }])
      .select(`*, customers (id, name, phone, email)`)
      .single()

    if (error) throw error

    return res.status(201).json({
      message: 'Evento creado correctamente',
      event: data
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name, description, customer_id, event_date,
      start_time, end_time, location, address,
      city, status, estimated_guests, agreed_price, notes
    } = req.body

    const { data, error } = await supabase
      .from('events')
      .update({
        name, description, customer_id, event_date,
        start_time, end_time, location, address,
        city, status, estimated_guests, agreed_price, notes
      })
      .eq('id', id)
      .select(`*, customers (id, name, phone, email)`)
      .single()

    if (error) throw error
    return res.json({ message: 'Evento actualizado', event: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['prospecto', 'cotizado', 'confirmado', 'en_curso', 'completado', 'cancelado']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `El estado debe ser: ${validStatuses.join(', ')}`
      })
    }

    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return res.json({ message: `Evento marcado como: ${status}`, event: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, getById, create, update, updateStatus }