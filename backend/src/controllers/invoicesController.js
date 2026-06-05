const supabase = require('../config/supabase')

const getInvoices = async (req, res) => {
  try {
    const { status, customer_id, from, to } = req.query
    let query = supabase.from('invoices')
      .select(`*, customers(id, name, email, phone, rfc), events(id, name, event_date), invoice_items(*), invoice_payments(*)`)
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    if (customer_id) query = query.eq('customer_id', customer_id)
    if (from) query = query.gte('issue_date', from)
    if (to) query = query.lte('issue_date', to)
    const { data, error } = await query
    if (error) throw error
    return res.json({ invoices: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from('invoices')
      .select(`*, customers(id, name, email, phone, rfc, address, city), events(id, name, event_date, location), invoice_items(*), invoice_payments(*)`)
      .eq('id', id).single()
    if (error) throw error
    return res.json({ invoice: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createInvoice = async (req, res) => {
  try {
    const {
      customer_id, event_id, receptor_name, receptor_rfc, receptor_email,
      receptor_address, receptor_fiscal_regime, receptor_cfdi_use,
      issue_date, due_date, items, discount, tax_rate, currency,
      payment_method, payment_form, advance_amount, notes, internal_notes
    } = req.body

    if (!receptor_name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const taxRate = parseFloat(tax_rate || 16)
    const discountGlobal = parseFloat(discount || 0)
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price)
      const itemDiscount = itemSubtotal * (parseFloat(item.discount || 0) / 100)
      return sum + itemSubtotal - itemDiscount
    }, 0)
    const subtotalWithDiscount = subtotal - discountGlobal
    const taxAmount = subtotalWithDiscount * (taxRate / 100)
    const total = subtotalWithDiscount + taxAmount
    const advance = parseFloat(advance_amount || 0)
    const balanceDue = total - advance

    const { data: invoice, error: invError } = await supabase.from('invoices').insert([{
      customer_id: customer_id || null,
      event_id: event_id || null,
      receptor_name,
      receptor_rfc: receptor_rfc || null,
      receptor_email: receptor_email || null,
      receptor_address: receptor_address || null,
      receptor_fiscal_regime: receptor_fiscal_regime || null,
      receptor_cfdi_use: receptor_cfdi_use || 'G03',
      issue_date: issue_date || new Date().toISOString().slice(0, 10),
      due_date: due_date || null,
      subtotal: subtotalWithDiscount,
      discount: discountGlobal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: currency || 'MXN',
      payment_method: payment_method || 'PUE',
      payment_form: payment_form || '01',
      status: 'borrador',
      advance_amount: advance,
      balance_due: balanceDue,
      notes: notes || null,
      internal_notes: internal_notes || null
    }]).select().single()

    if (invError) throw invError

    const invoiceItems = items.map(item => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price)
      const itemDiscount = itemSubtotal * (parseFloat(item.discount || 0) / 100)
      return {
        invoice_id: invoice.id,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit: item.unit || 'Servicio',
        unit_price: parseFloat(item.unit_price),
        discount: parseFloat(item.discount || 0),
        subtotal: itemSubtotal - itemDiscount
      }
    })

    const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)
    if (itemsError) throw itemsError

    const { data: full, error: fullError } = await supabase.from('invoices')
      .select(`*, customers(id, name, email), events(id, name), invoice_items(*), invoice_payments(*)`)
      .eq('id', invoice.id).single()
    if (fullError) throw fullError

    return res.status(201).json({ invoice: full })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { data, error } = await supabase.from('invoices')
      .update({ status }).eq('id', id).select().single()
    if (error) throw error
    return res.json({ invoice: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const registerPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { payment_date, amount, payment_form, reference, notes } = req.body

    if (!amount) return res.status(400).json({ error: 'El monto es requerido' })

    const { error: payError } = await supabase.from('invoice_payments').insert([{
      invoice_id: id,
      payment_date: payment_date || new Date().toISOString().slice(0, 10),
      amount: parseFloat(amount),
      payment_form: payment_form || '01',
      reference: reference || null,
      notes: notes || null
    }])
    if (payError) throw payError

    const { data: invoice, error: invError } = await supabase.from('invoices')
      .select('total, invoice_payments(amount)').eq('id', id).single()
    if (invError) throw invError

    const totalPaid = invoice.invoice_payments.reduce((s, p) => s + Number(p.amount), 0)
    const balanceDue = Number(invoice.total) - totalPaid
    const newStatus = balanceDue <= 0 ? 'pagada' : 'parcial'

    const { data: updated, error: updateError } = await supabase.from('invoices')
      .update({ balance_due: Math.max(0, balanceDue), status: newStatus })
      .eq('id', id).select(`*, customers(id, name, email), invoice_items(*), invoice_payments(*)`).single()
    if (updateError) throw updateError

    return res.json({ invoice: updated })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const getInvoiceStats = async (req, res) => {
  try {
    const { data, error } = await supabase.from('invoices')
      .select('status, total, balance_due')
    if (error) throw error

    const stats = {
      total: data.length,
      borrador: data.filter(i => i.status === 'borrador').length,
      enviada: data.filter(i => i.status === 'enviada').length,
      pagada: data.filter(i => i.status === 'pagada').length,
      vencida: data.filter(i => i.status === 'vencida').length,
      cancelada: data.filter(i => i.status === 'cancelada').length,
      total_facturado: data.reduce((s, i) => s + Number(i.total), 0),
      total_por_cobrar: data.filter(i => ['enviada', 'parcial', 'vencida'].includes(i.status))
        .reduce((s, i) => s + Number(i.balance_due), 0),
      total_cobrado: data.filter(i => i.status === 'pagada').reduce((s, i) => s + Number(i.total), 0)
    }

    return res.json({ stats })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getInvoices, getInvoiceById, createInvoice,
  updateInvoiceStatus, registerPayment, getInvoiceStats
}