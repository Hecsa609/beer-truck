const supabase = require('../config/supabase')

// Función auxiliar: calcular saldo actual de una cuenta
const getAccountBalance = async (account) => {
  const { data, error } = await supabase
    .from('bank_movements')
    .select('movement_type, amount')
    .eq('account', account)
  if (error) return 0
  return (data || []).reduce((saldo, m) => {
    return m.movement_type === 'entrada' ? saldo + Number(m.amount) : saldo - Number(m.amount)
  }, 0)
}

// Función auxiliar: registrar ingreso por evento completado
const registrarIngresoEvento = async (event) => {
  try {
    if (!event.agreed_price || parseFloat(event.agreed_price) <= 0) return

    const today = new Date().toISOString().slice(0, 10)
    const monto = parseFloat(event.agreed_price)

    // Verificar que no se haya registrado ya este evento
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('description', `Cobro evento — ${event.name}`)
      .limit(1)

    if (existing && existing.length > 0) return // Ya fue registrado

    // 1. Registrar en transactions
    await supabase.from('transactions').insert([{
      date: today,
      type: 'ingreso',
      category: 'Ventas evento',
      description: `Cobro evento — ${event.name}`,
      amount: monto,
      payment_method: 'transferencia',
      third_party: event.customers?.name || null,
      status: 'completado',
      notes: `Evento completado automáticamente. ID: ${event.id}`
    }])

    // 2. Registrar en banco — cobros de eventos van a Cuenta BBVA
    const saldoActual = await getAccountBalance('Cuenta BBVA')
    const nuevoSaldo = saldoActual + monto

    await supabase.from('bank_movements').insert([{
      date: today,
      account: 'Cuenta BBVA',
      movement_type: 'entrada',
      description: `Cobro evento — ${event.name}`,
      amount: monto,
      balance: nuevoSaldo,
      reference: event.id
    }])
  } catch (err) {
    console.error('Error registrando ingreso de evento:', err.message)
  }
}

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

    // Obtener el evento actual con datos del cliente
    const { data: eventoActual, error: fetchError } = await supabase
      .from('events')
      .select(`*, customers (id, name, phone, email)`)
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Actualizar el estado
    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .select(`*, customers (id, name, phone, email)`)
      .single()

    if (error) throw error

    // ✅ Si el evento se marca como completado, registrar ingreso automáticamente
    if (status === 'completado' && eventoActual.status !== 'completado') {
      await registrarIngresoEvento({ ...data, customers: eventoActual.customers })
    }

    return res.json({ message: `Evento marcado como: ${status}`, event: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, getById, create, update, updateStatus }