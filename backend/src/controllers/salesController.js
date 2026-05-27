const supabase = require('../config/supabase')

const generateFolio = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `BT-${year}${month}${day}-${random}`
}

const getAll = async (req, res) => {
  try {
    const { from, to, payment_method, payment_status } = req.query

    let query = supabase
      .from('sales')
      .select(`
        *,
        customers (id, name, phone),
        events (id, name, event_date),
        sale_items (
          id, quantity, unit_price, subtotal,
          products (id, name, sku)
        )
      `)
      .order('created_at', { ascending: false })

    if (from) query = query.gte('sale_date', from)
    if (to) query = query.lte('sale_date', to)
    if (payment_method) query = query.eq('payment_method', payment_method)
    if (payment_status) query = query.eq('payment_status', payment_status)

    const { data, error } = await query
    if (error) throw error

    const totalRevenue = data.reduce((sum, sale) => sum + parseFloat(sale.total), 0)

    return res.json({
      sales: data,
      total: data.length,
      total_revenue: totalRevenue.toFixed(2)
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (id, name, phone, email, rfc),
        events (id, name, event_date, location),
        sale_items (
          id, quantity, unit_price, discount, subtotal,
          products (id, name, sku, unit)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Venta no encontrada' })

    return res.json({ sale: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const {
      customer_id, event_id, items,
      payment_method, discount, notes
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'La venta debe tener al menos un producto'
      })
    }

    // Verificar stock de todos los productos
    for (const item of items) {
      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('stock_current')
        .eq('product_id', item.product_id)
        .single()

      if (invError) throw invError

      if (inventory.stock_current < item.quantity) {
        const { data: product } = await supabase
          .from('products')
          .select('name')
          .eq('id', item.product_id)
          .single()

        return res.status(400).json({
          error: 'Stock insuficiente',
          message: `${product.name}: solo hay ${inventory.stock_current} unidades disponibles`
        })
      }
    }

    // Calcular totales
    let subtotal = 0
    const saleItems = []

    for (const item of items) {
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('price, name')
        .eq('id', item.product_id)
        .single()

      if (prodError) throw prodError

      const unit_price = item.unit_price || product.price
      const item_discount = item.discount || 0
      const item_subtotal = (unit_price * item.quantity) - item_discount

      subtotal += item_subtotal
      saleItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price,
        discount: item_discount,
        subtotal: item_subtotal
      })
    }

    const sale_discount = discount || 0
    const tax = (subtotal - sale_discount) * 0.16
    const total = subtotal - sale_discount + tax

    // Crear la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        folio: generateFolio(),
        customer_id,
        event_id,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        discount: sale_discount,
        total: total.toFixed(2),
        payment_method: payment_method || 'efectivo',
        payment_status: 'pagado',
        notes
      }])
      .select()
      .single()

    if (saleError) throw saleError

    // Insertar productos de la venta
    const itemsWithSaleId = saleItems.map(item => ({
      ...item,
      sale_id: sale.id
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(itemsWithSaleId)

    if (itemsError) throw itemsError

    // Bajar stock automáticamente
    for (const item of saleItems) {
      const { data: inventory } = await supabase
        .from('inventory')
        .select('stock_current')
        .eq('product_id', item.product_id)
        .single()

      const new_stock = inventory.stock_current - item.quantity

      await supabase
        .from('inventory')
        .update({ stock_current: new_stock, last_updated: new Date() })
        .eq('product_id', item.product_id)

      await supabase
        .from('inventory_movements')
        .insert([{
          product_id: item.product_id,
          movement_type: 'salida',
          quantity: item.quantity,
          stock_before: inventory.stock_current,
          stock_after: new_stock,
          reference_id: sale.id,
          reference_type: 'venta',
          notes: `Venta ${sale.folio}`
        }])
    }

    return res.status(201).json({
      message: 'Venta registrada correctamente',
      sale: {
        ...sale,
        items: saleItems
      }
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const getDailySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id, folio, total, payment_method, payment_status, created_at,
        sale_items (quantity, subtotal)
      `)
      .gte('sale_date', `${today}T00:00:00`)
      .lte('sale_date', `${today}T23:59:59`)

    if (error) throw error

    const total_ventas = data.length
    const total_ingresos = data.reduce((sum, s) => sum + parseFloat(s.total), 0)
    const efectivo = data.filter(s => s.payment_method === 'efectivo').reduce((sum, s) => sum + parseFloat(s.total), 0)
    const tarjeta = data.filter(s => s.payment_method === 'tarjeta').reduce((sum, s) => sum + parseFloat(s.total), 0)
    const transferencia = data.filter(s => s.payment_method === 'transferencia').reduce((sum, s) => sum + parseFloat(s.total), 0)

    return res.json({
      fecha: today,
      total_ventas,
      total_ingresos: total_ingresos.toFixed(2),
      por_metodo: {
        efectivo: efectivo.toFixed(2),
        tarjeta: tarjeta.toFixed(2),
        transferencia: transferencia.toFixed(2)
      },
      ventas: data
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, getById, create, getDailySummary }