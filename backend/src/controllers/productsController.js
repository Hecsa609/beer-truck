const supabase = require('../config/supabase')

const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, color),
        inventory (stock_current, stock_minimum, stock_maximum, location)
      `)
      .eq('active', true)
      .order('name')

    if (error) throw error

    return res.json({ products: data, total: data.length })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, color),
        inventory (stock_current, stock_minimum, stock_maximum, location)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' })

    return res.json({ product: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const {
      name, description, category_id, sku,
      barcode, price, cost, unit, image_url
    } = req.body

    if (!name || !price) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre y precio son requeridos'
      })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        name, description, category_id, sku,
        barcode, price, cost: cost || 0,
        unit: unit || 'pieza', image_url, active: true
      }])
      .select()
      .single()

    if (productError) throw productError

    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert([{
        product_id: product.id,
        stock_current: 0,
        stock_minimum: 5,
        stock_maximum: 100,
        location: 'camion'
      }])

    if (inventoryError) throw inventoryError

    return res.status(201).json({
      message: 'Producto creado correctamente',
      product
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name, description, category_id, sku,
      barcode, price, cost, unit, image_url, active
    } = req.body

    const { data, error } = await supabase
      .from('products')
      .update({
        name, description, category_id, sku,
        barcode, price, cost, unit, image_url, active
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.json({ message: 'Producto actualizado', product: data })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error

    return res.json({ message: 'Producto desactivado correctamente' })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

const updateStock = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, movement_type, notes } = req.body

    if (!quantity || !movement_type) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Cantidad y tipo de movimiento son requeridos'
      })
    }

    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('stock_current')
      .eq('product_id', id)
      .single()

    if (invError) throw invError

    const stock_before = inventory.stock_current
    let stock_after

    if (movement_type === 'entrada') {
      stock_after = stock_before + quantity
    } else if (movement_type === 'salida') {
      if (stock_before < quantity) {
        return res.status(400).json({
          error: 'Stock insuficiente',
          message: `Solo hay ${stock_before} unidades disponibles`
        })
      }
      stock_after = stock_before - quantity
    } else if (movement_type === 'ajuste') {
      stock_after = quantity
    } else {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser: entrada, salida o ajuste'
      })
    }

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ stock_current: stock_after, last_updated: new Date() })
      .eq('product_id', id)

    if (updateError) throw updateError

    await supabase
      .from('inventory_movements')
      .insert([{
        product_id: id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        notes
      }])

    return res.json({
      message: 'Stock actualizado correctamente',
      stock_before,
      stock_after,
      movement_type
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor', message: error.message })
  }
}

module.exports = { getAll, getById, create, update, remove, updateStock }