const supabase = require('../config/supabase')

// TRANSACCIONES
const getTransactions = async (req, res) => {
  try {
    const { type, category, from, to } = req.query
    let query = supabase.from('transactions').select('*').order('date', { ascending: false })
    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    const { data, error } = await query
    if (error) throw error
    return res.json({ transactions: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createTransaction = async (req, res) => {
  try {
    const { date, type, category, description, amount, payment_method, third_party, status, notes } = req.body
    if (!date || !type || !category || !description || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const { data, error } = await supabase.from('transactions').insert([{
      date, type, category, description,
      amount: parseFloat(amount),
      payment_method, third_party,
      status: status || 'completado',
      notes
    }]).select().single()
    if (error) throw error
    return res.status(201).json({ transaction: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from('transactions')
      .update(req.body).eq('id', id).select().single()
    if (error) throw error
    return res.json({ transaction: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// CUENTAS POR PAGAR
const getAccountsPayable = async (req, res) => {
  try {
    const { status } = req.query
    let query = supabase.from('accounts_payable').select('*').order('due_date', { ascending: true })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return res.json({ accounts_payable: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createAccountPayable = async (req, res) => {
  try {
    const { invoice_id, supplier, issue_date, due_date, amount, notes } = req.body
    if (!supplier || !issue_date || !due_date || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const { data, error } = await supabase.from('accounts_payable').insert([{
      invoice_id, supplier, issue_date, due_date,
      amount: parseFloat(amount),
      amount_paid: 0,
      status: 'pendiente',
      notes
    }]).select().single()
    if (error) throw error
    return res.status(201).json({ account_payable: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateAccountPayable = async (req, res) => {
  try {
    const { id } = req.params
    const current = await supabase.from('accounts_payable').select('amount').eq('id', id).single()
    if (current.error) throw current.error
    const updates = { ...req.body }
    if (updates.amount_paid !== undefined) {
      const paid = parseFloat(updates.amount_paid)
      const total = parseFloat(current.data.amount)
      updates.status = paid >= total ? 'pagado' : paid > 0 ? 'parcial' : 'pendiente'
    }
    const { data, error } = await supabase.from('accounts_payable')
      .update(updates).eq('id', id).select().single()
    if (error) throw error
    return res.json({ account_payable: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// MOVIMIENTOS DE CAJA/BANCO — saldo automático por cuenta
const getBankMovements = async (req, res) => {
  try {
    const { account, from, to } = req.query
    let query = supabase.from('bank_movements').select('*').order('date', { ascending: true }).order('created_at', { ascending: true })
    if (account) query = query.eq('account', account)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    const { data, error } = await query
    if (error) throw error

    // Calcular saldo acumulado por cuenta
    const saldosPorCuenta = {}
    const movimientosConSaldo = data.map(m => {
      const cuenta = m.account
      if (!saldosPorCuenta[cuenta]) saldosPorCuenta[cuenta] = 0
      if (m.movement_type === 'entrada') {
        saldosPorCuenta[cuenta] += Number(m.amount)
      } else {
        saldosPorCuenta[cuenta] -= Number(m.amount)
      }
      return { ...m, balance: saldosPorCuenta[cuenta] }
    })

    // Devolver en orden descendente para mostrar más reciente primero
    return res.json({ bank_movements: movimientosConSaldo.reverse() })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createBankMovement = async (req, res) => {
  try {
    const { date, account, movement_type, description, amount, reference } = req.body
    if (!date || !account || !movement_type || !description || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    // Calcular saldo actual de la cuenta antes de insertar
    const { data: prevMovements, error: prevError } = await supabase
      .from('bank_movements')
      .select('movement_type, amount')
      .eq('account', account)
    if (prevError) throw prevError

    const saldoActual = (prevMovements || []).reduce((saldo, m) => {
      return m.movement_type === 'entrada'
        ? saldo + Number(m.amount)
        : saldo - Number(m.amount)
    }, 0)

    const nuevoMonto = parseFloat(amount)
    const nuevoSaldo = movement_type === 'entrada'
      ? saldoActual + nuevoMonto
      : saldoActual - nuevoMonto

    const { data, error } = await supabase.from('bank_movements').insert([{
      date, account, movement_type, description,
      amount: nuevoMonto,
      balance: nuevoSaldo,
      reference: reference || null
    }]).select().single()
    if (error) throw error

    return res.status(201).json({ bank_movement: { ...data, balance: nuevoSaldo } })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// Saldos actuales por cuenta
const getAccountBalances = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bank_movements')
      .select('account, movement_type, amount')
    if (error) throw error

    const saldos = {}
    ;(data || []).forEach(m => {
      if (!saldos[m.account]) saldos[m.account] = 0
      saldos[m.account] += m.movement_type === 'entrada'
        ? Number(m.amount)
        : -Number(m.amount)
    })

    const resultado = Object.entries(saldos).map(([cuenta, saldo]) => ({
      account: cuenta,
      balance: saldo
    }))

    return res.json({ balances: resultado })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// ACTIVOS FIJOS
const getFixedAssets = async (req, res) => {
  try {
    const { data, error } = await supabase.from('fixed_assets')
      .select('*').eq('active', true).order('purchase_date', { ascending: false })
    if (error) throw error

    // Calcular depreciación acumulada y valor libro actual
    const today = new Date()
    const assetsWithCurrentValue = data.map(asset => {
      const purchaseDate = new Date(asset.purchase_date)
      const monthsElapsed = Math.floor(
        (today.getFullYear() - purchaseDate.getFullYear()) * 12 +
        (today.getMonth() - purchaseDate.getMonth())
      )
      const monthsDepreciated = Math.min(monthsElapsed, asset.useful_life_months)
      const accumulated_depreciation = asset.monthly_depreciation * monthsDepreciated
      const current_book_value = Math.max(0, asset.cost - accumulated_depreciation)
      return {
        ...asset,
        months_elapsed: monthsDepreciated,
        accumulated_depreciation,
        book_value: current_book_value
      }
    })

    return res.json({ fixed_assets: assetsWithCurrentValue })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createFixedAsset = async (req, res) => {
  try {
    const { name, purchase_date, cost, useful_life_months } = req.body
    if (!name || !purchase_date || !cost || !useful_life_months) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const costNum = parseFloat(cost)
    const lifeNum = parseInt(useful_life_months)
    const monthly_depreciation = costNum / lifeNum
    const { data, error } = await supabase.from('fixed_assets').insert([{
      name, purchase_date,
      cost: costNum,
      useful_life_months: lifeNum,
      monthly_depreciation,
      book_value: costNum
    }]).select().single()
    if (error) throw error
    return res.status(201).json({ fixed_asset: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// RESUMEN FINANCIERO
const getFinancialSummary = async (req, res) => {
  try {
    const { from, to } = req.query
    const currentMonth = new Date().toISOString().slice(0, 7)
    const dateFrom = from || `${currentMonth}-01`
    const dateTo = to || new Date().toISOString().slice(0, 10)

    const [transRes, payableRes, bankRes, salesRes] = await Promise.all([
      supabase.from('transactions').select('type, amount, category').gte('date', dateFrom).lte('date', dateTo),
      supabase.from('accounts_payable').select('amount, amount_paid, status'),
      supabase.from('bank_movements').select('movement_type, amount, account'),
      supabase.from('sales').select('total').gte('sale_date', dateFrom).lte('sale_date', dateTo)
    ])

    const transactions = transRes.data || []
    const payables = payableRes.data || []
    const movements = bankRes.data || []
    const sales = salesRes.data || []

    const totalIngresos = transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0)
    const totalEgresos = transactions.filter(t => t.type === 'egreso').reduce((s, t) => s + Number(t.amount), 0)
    const ventasPOS = sales.reduce((s, v) => s + Number(v.total), 0)
    const cuentasPorPagar = payables
      .filter(p => ['pendiente', 'parcial', 'vencido'].includes(p.status))
      .reduce((s, p) => s + (Number(p.amount) - Number(p.amount_paid)), 0)

    // Saldo total en bancos y caja
    const saldosBanco = {}
    movements.forEach(m => {
      if (!saldosBanco[m.account]) saldosBanco[m.account] = 0
      saldosBanco[m.account] += m.movement_type === 'entrada'
        ? Number(m.amount)
        : -Number(m.amount)
    })
    const totalEfectivo = Object.values(saldosBanco).reduce((s, v) => s + v, 0)

    const categorias = {}
    transactions.filter(t => t.type === 'egreso').forEach(t => {
      categorias[t.category] = (categorias[t.category] || 0) + Number(t.amount)
    })

    return res.json({
      periodo: { desde: dateFrom, hasta: dateTo },
      ingresos: totalIngresos + ventasPOS,
      egresos: totalEgresos,
      utilidad_neta: (totalIngresos + ventasPOS) - totalEgresos,
      ventas_pos: ventasPOS,
      cuentas_por_pagar: cuentasPorPagar,
      total_efectivo: totalEfectivo,
      saldos_por_cuenta: saldosBanco,
      egresos_por_categoria: categorias
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getTransactions, createTransaction, updateTransaction,
  getAccountsPayable, createAccountPayable, updateAccountPayable,
  getBankMovements, createBankMovement, getAccountBalances,
  getFixedAssets, createFixedAsset,
  getFinancialSummary
}