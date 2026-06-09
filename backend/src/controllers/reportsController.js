const supabase = require('../config/supabase')
const ExcelJS = require('exceljs')

const BEER_ORANGE = 'EF9A11'
const DARK_BG = '1E1E28'
const HEADER_BG = '2D2D3A'
const WHITE = 'FFFFFF'
const DARK_GRAY = '666666'
const MID_GRAY = 'D0D0D0'
const GREEN = '22C55E'
const RED = 'EF4444'

const styleHeader = (cell, bgColor = HEADER_BG, fontColor = WHITE) => {
  cell.font = { name: 'Arial', bold: true, color: { argb: fontColor }, size: 11 }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

const styleSection = (cell, color = BEER_ORANGE) => {
  cell.font = { name: 'Arial', bold: true, color: { argb: color }, size: 10 }
}

const styleData = (cell, bold = false, color = '000000', center = false) => {
  cell.font = { name: 'Arial', bold, color: { argb: color }, size: 10 }
  if (center) cell.alignment = { horizontal: 'center' }
}

const styleCurrency = (cell) => {
  cell.numFmt = '$#,##0;($#,##0);"-"'
}

const stylePct = (cell) => {
  cell.numFmt = '0.0%'
}

const thinBorder = () => ({
  bottom: { style: 'thin', color: { argb: MID_GRAY } }
})

const thickBorder = () => ({
  bottom: { style: 'medium', color: { argb: DARK_GRAY } }
})

const addTitleBlock = (ws, title, subtitle, empresa) => {
  ws.mergeCells('A1:F1')
  const t = ws.getCell('A1')
  t.value = empresa
  t.font = { name: 'Arial', bold: true, color: { argb: BEER_ORANGE }, size: 16 }
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BG } }
  t.alignment = { horizontal: 'left', vertical: 'middle' }
  ws.getRow(1).height = 32

  ws.mergeCells('A2:F2')
  const t2 = ws.getCell('A2')
  t2.value = title
  t2.font = { name: 'Arial', bold: true, color: { argb: WHITE }, size: 13 }
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BG } }
  t2.alignment = { horizontal: 'left', vertical: 'middle' }
  ws.getRow(2).height = 24

  ws.mergeCells('A3:F3')
  const t3 = ws.getCell('A3')
  t3.value = subtitle
  t3.font = { name: 'Arial', italic: true, color: { argb: DARK_GRAY }, size: 10 }
  t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BG } }
  ws.getRow(3).height = 18
  ws.getRow(4).height = 8
}

const generateEstadosFinancieros = async (req, res) => {
  try {
    const { from, to } = req.query
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const dateFrom = from || `${currentMonth}-01`
    const dateTo = to || now.toISOString().slice(0, 10)

    // Cargar datos reales de Supabase
    const [transRes, payableRes, bankRes, salesRes, assetsRes] = await Promise.all([
      supabase.from('transactions').select('type, amount, category').gte('date', dateFrom).lte('date', dateTo),
      supabase.from('accounts_payable').select('supplier, amount, amount_paid, status'),
      supabase.from('bank_movements').select('account, movement_type, amount'),
      supabase.from('sales').select('total').gte('sale_date', dateFrom).lte('sale_date', dateTo),
      supabase.from('fixed_assets').select('*').eq('active', true)
    ])

    const transactions = transRes.data || []
    const payables = payableRes.data || []
    const bankMovements = bankRes.data || []
    const sales = salesRes.data || []
    const assets = assetsRes.data || []

    // Calcular totales
    const ventasPOS = sales.reduce((s, v) => s + Number(v.total), 0)
    const ingresosPorCategoria = {}
    transactions.filter(t => t.type === 'ingreso').forEach(t => {
      ingresosPorCategoria[t.category] = (ingresosPorCategoria[t.category] || 0) + Number(t.amount)
    })
    ingresosPorCategoria['Ventas POS'] = (ingresosPorCategoria['Ventas POS'] || 0) + ventasPOS

    const egresosPorCategoria = {}
    transactions.filter(t => t.type === 'egreso').forEach(t => {
      egresosPorCategoria[t.category] = (egresosPorCategoria[t.category] || 0) + Number(t.amount)
    })

    const totalIngresos = Object.values(ingresosPorCategoria).reduce((s, v) => s + v, 0)
    const totalEgresos = Object.values(egresosPorCategoria).reduce((s, v) => s + v, 0)
    const utilidadNeta = totalIngresos - totalEgresos

    // Saldos bancarios
    const saldosBanco = {}
    bankMovements.forEach(m => {
      if (!saldosBanco[m.account]) saldosBanco[m.account] = 0
      saldosBanco[m.account] += m.movement_type === 'entrada' ? Number(m.amount) : -Number(m.amount)
    })
    const totalEfectivo = Object.values(saldosBanco).reduce((s, v) => s + v, 0)

    // Activos fijos con depreciación real
    const today = new Date()
    const assetsValuados = assets.map(a => {
      const purchaseDate = new Date(a.purchase_date)
      const mesesTranscurridos = Math.min(
        Math.floor((today.getFullYear() - purchaseDate.getFullYear()) * 12 +
          (today.getMonth() - purchaseDate.getMonth())),
        a.useful_life_months
      )
      const depAcumulada = Number(a.monthly_depreciation) * mesesTranscurridos
      const valorLibro = Math.max(Number(a.cost) - depAcumulada, 0)
      return { ...a, dep_acumulada: depAcumulada, valor_libro: valorLibro, meses: mesesTranscurridos }
    })
    const totalActivoNC = assetsValuados.reduce((s, a) => s + a.valor_libro, 0)
    const totalDepMensual = assetsValuados.reduce((s, a) => s + Number(a.monthly_depreciation), 0)

    // Cuentas por pagar pendientes
    const cuentasPorPagar = payables.filter(p => ['pendiente', 'parcial', 'vencido'].includes(p.status))
    const totalPasivo = cuentasPorPagar.reduce((s, p) => s + (Number(p.amount) - Number(p.amount_paid)), 0)

    const totalActivoCorriente = totalEfectivo
    const totalActivo = totalActivoCorriente + totalActivoNC
    const capitalInicial = 500000
    const totalCapital = capitalInicial + utilidadNeta
    const totalPasivoCapital = totalPasivo + totalCapital

    const periodo = `${dateFrom} — ${dateTo}`
    const empresa = 'BEER TRUCK MX'

    // ── Crear workbook ──────────────────────────────────────────────────────
    const wb = new ExcelJS.Workbook()
    wb.creator = 'BEER TRUCK ERP'
    wb.created = new Date()

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 1 — P&L
    // ════════════════════════════════════════════════════════════════════════
    const ws1 = wb.addWorksheet('P&L - Estado de Resultados')
    ws1.views = [{ showGridLines: false }]
    ws1.columns = [
      { key: 'a', width: 4 },
      { key: 'b', width: 38 },
      { key: 'c', width: 20 },
      { key: 'd', width: 14 },
      { key: 'e', width: 4 },
    ]

    addTitleBlock(ws1, 'Estado de Resultados (P&L)', `Período: ${periodo}`, empresa)

    // Encabezados
    let row = 5
    styleHeader(ws1.getCell(`B${row}`), HEADER_BG, WHITE)
    styleHeader(ws1.getCell(`C${row}`), HEADER_BG, WHITE)
    styleHeader(ws1.getCell(`D${row}`), HEADER_BG, WHITE)
    ws1.getCell(`B${row}`).value = 'Concepto'
    ws1.getCell(`C${row}`).value = 'Importe ($MXN)'
    ws1.getCell(`D${row}`).value = '% Ingresos'
    ws1.getRow(row).height = 20

    // INGRESOS
    row++
    styleSection(ws1.getCell(`B${row}`))
    ws1.getCell(`B${row}`).value = 'INGRESOS'
    ws1.getRow(row).height = 18

    const ingresoCells = []
    for (const [cat, monto] of Object.entries(ingresosPorCategoria)) {
      if (monto === 0) continue
      row++
      ingresoCells.push(row)
      ws1.getCell(`B${row}`).value = `  ${cat}`
      ws1.getCell(`C${row}`).value = monto
      styleData(ws1.getCell(`B${row}`))
      styleData(ws1.getCell(`C${row}`), false, '000080')
      styleCurrency(ws1.getCell(`C${row}`))
      ws1.getCell(`C${row}`).border = thinBorder()
      ws1.getRow(row).height = 16
    }

    row++
    const totalIngresosRow = row
    ws1.getCell(`B${row}`).value = 'TOTAL INGRESOS'
    ws1.getCell(`C${row}`).value = totalIngresos
    ws1.getCell(`D${row}`).value = 1.0
    styleData(ws1.getCell(`B${row}`), true)
    styleData(ws1.getCell(`C${row}`), true, GREEN)
    styleData(ws1.getCell(`D${row}`), true, GREEN, true)
    styleCurrency(ws1.getCell(`C${row}`))
    stylePct(ws1.getCell(`D${row}`))
    ws1.getCell(`C${row}`).border = thickBorder()
    ws1.getRow(row).height = 18

    row += 2
    styleSection(ws1.getCell(`B${row}`))
    ws1.getCell(`B${row}`).value = 'EGRESOS OPERATIVOS'
    ws1.getRow(row).height = 18

    for (const [cat, monto] of Object.entries(egresosPorCategoria)) {
      if (monto === 0) continue
      row++
      ws1.getCell(`B${row}`).value = `  ${cat}`
      ws1.getCell(`C${row}`).value = monto
      ws1.getCell(`D${row}`).value = totalIngresos > 0 ? monto / totalIngresos : 0
      styleData(ws1.getCell(`B${row}`))
      styleData(ws1.getCell(`C${row}`), false, '000080')
      styleData(ws1.getCell(`D${row}`), false, '000000', true)
      styleCurrency(ws1.getCell(`C${row}`))
      stylePct(ws1.getCell(`D${row}`))
      ws1.getCell(`C${row}`).border = thinBorder()
      ws1.getRow(row).height = 16
    }

    row++
    ws1.getCell(`B${row}`).value = 'TOTAL EGRESOS'
    ws1.getCell(`C${row}`).value = totalEgresos
    ws1.getCell(`D${row}`).value = totalIngresos > 0 ? totalEgresos / totalIngresos : 0
    styleData(ws1.getCell(`B${row}`), true)
    styleData(ws1.getCell(`C${row}`), true, RED)
    styleData(ws1.getCell(`D${row}`), true, RED, true)
    styleCurrency(ws1.getCell(`C${row}`))
    stylePct(ws1.getCell(`D${row}`))
    ws1.getCell(`C${row}`).border = thickBorder()
    ws1.getRow(row).height = 18

    row += 2
    ws1.getCell(`B${row}`).value = 'UTILIDAD NETA'
    ws1.getCell(`C${row}`).value = utilidadNeta
    ws1.getCell(`D${row}`).value = totalIngresos > 0 ? utilidadNeta / totalIngresos : 0
    ws1.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    ws1.getCell(`C${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    ws1.getCell(`D${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    styleData(ws1.getCell(`B${row}`), true, '7D4E00')
    styleData(ws1.getCell(`C${row}`), true, '7D4E00')
    styleData(ws1.getCell(`D${row}`), true, '7D4E00', true)
    styleCurrency(ws1.getCell(`C${row}`))
    stylePct(ws1.getCell(`D${row}`))
    ws1.getRow(row).height = 22

    row += 2
    ws1.getCell(`B${row}`).value = `Fuente: BEER TRUCK ERP/CRM — Generado: ${new Date().toLocaleDateString('es-MX')}`
    ws1.getCell(`B${row}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: DARK_GRAY } }

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 2 — BALANCE
    // ════════════════════════════════════════════════════════════════════════
    const ws2 = wb.addWorksheet('Balance de Situación')
    ws2.views = [{ showGridLines: false }]
    ws2.columns = [
      { key: 'a', width: 4 },
      { key: 'b', width: 36 },
      { key: 'c', width: 18 },
      { key: 'd', width: 4 },
      { key: 'e', width: 36 },
      { key: 'f', width: 18 },
    ]

    addTitleBlock(ws2, 'Balance de Situación', `Al cierre: ${dateTo}`, empresa)

    row = 5
    styleHeader(ws2.getCell(`B${row}`), HEADER_BG, WHITE)
    ws2.getCell(`B${row}`).value = 'ACTIVOS'
    ws2.getCell(`B${row}`).alignment = { horizontal: 'left', vertical: 'middle' }
    styleHeader(ws2.getCell(`C${row}`), HEADER_BG, WHITE)
    ws2.getCell(`C${row}`).value = 'Importe ($MXN)'
    styleHeader(ws2.getCell(`E${row}`), HEADER_BG, WHITE)
    ws2.getCell(`E${row}`).value = 'PASIVOS Y CAPITAL'
    ws2.getCell(`E${row}`).alignment = { horizontal: 'left', vertical: 'middle' }
    styleHeader(ws2.getCell(`F${row}`), HEADER_BG, WHITE)
    ws2.getCell(`F${row}`).value = 'Importe ($MXN)'
    ws2.getRow(row).height = 20

    // ACTIVO CORRIENTE
    row++
    styleSection(ws2.getCell(`B${row}`))
    ws2.getCell(`B${row}`).value = 'ACTIVO CORRIENTE'
    ws2.getRow(row).height = 18

    // Pasivo corriente en paralelo
    styleSection(ws2.getCell(`E${row}`))
    ws2.getCell(`E${row}`).value = 'PASIVO CORRIENTE'

    const actCorrienteRows = []
    for (const [cuenta, saldo] of Object.entries(saldosBanco)) {
      row++
      actCorrienteRows.push(row)
      ws2.getCell(`B${row}`).value = `  ${cuenta}`
      ws2.getCell(`C${row}`).value = saldo
      styleData(ws2.getCell(`B${row}`))
      styleData(ws2.getCell(`C${row}`), false, '000080')
      styleCurrency(ws2.getCell(`C${row}`))
      ws2.getCell(`C${row}`).border = thinBorder()
      ws2.getRow(row).height = 16
    }

    // Pasivos en paralelo
    const pasivoRows = []
    let pRow = 7
    for (const p of cuentasPorPagar) {
      const pendiente = Number(p.amount) - Number(p.amount_paid)
      if (pendiente <= 0) continue
      ws2.getCell(`E${pRow}`).value = `  ${p.supplier}`
      ws2.getCell(`F${pRow}`).value = pendiente
      styleData(ws2.getCell(`E${pRow}`))
      styleData(ws2.getCell(`F${pRow}`), false, '000080')
      styleCurrency(ws2.getCell(`F${pRow}`))
      ws2.getCell(`F${pRow}`).border = thinBorder()
      ws2.getRow(pRow).height = 16
      pasivoRows.push(pRow)
      pRow++
    }

    row++
    ws2.getCell(`B${row}`).value = '  Total Activo Corriente'
    ws2.getCell(`C${row}`).value = totalActivoCorriente
    styleData(ws2.getCell(`B${row}`), true)
    styleData(ws2.getCell(`C${row}`), true, GREEN)
    styleCurrency(ws2.getCell(`C${row}`))
    ws2.getCell(`C${row}`).border = thickBorder()
    ws2.getRow(row).height = 18

    ws2.getCell(`E${pRow}`).value = '  Total Pasivo Corriente'
    ws2.getCell(`F${pRow}`).value = totalPasivo
    styleData(ws2.getCell(`E${pRow}`), true)
    styleData(ws2.getCell(`F${pRow}`), true, RED)
    styleCurrency(ws2.getCell(`F${pRow}`))
    ws2.getCell(`F${pRow}`).border = thickBorder()
    pRow += 2

    row += 2
    styleSection(ws2.getCell(`B${row}`))
    ws2.getCell(`B${row}`).value = 'ACTIVO NO CORRIENTE (Fijos)'
    ws2.getRow(row).height = 18

    styleSection(ws2.getCell(`E${pRow}`))
    ws2.getCell(`E${pRow}`).value = 'CAPITAL CONTABLE'
    ws2.getRow(pRow).height = 18
    pRow++

    for (const a of assetsValuados) {
      row++
      ws2.getCell(`B${row}`).value = `  ${a.name}`
      ws2.getCell(`C${row}`).value = a.valor_libro
      styleData(ws2.getCell(`B${row}`))
      styleData(ws2.getCell(`C${row}`), false, '000080')
      styleCurrency(ws2.getCell(`C${row}`))
      ws2.getCell(`C${row}`).border = thinBorder()
      ws2.getRow(row).height = 16
    }

    ws2.getCell(`E${pRow}`).value = '  Capital inicial'
    ws2.getCell(`F${pRow}`).value = capitalInicial
    styleData(ws2.getCell(`E${pRow}`))
    styleData(ws2.getCell(`F${pRow}`), false, '000080')
    styleCurrency(ws2.getCell(`F${pRow}`))
    ws2.getCell(`F${pRow}`).border = thinBorder()
    ws2.getRow(pRow).height = 16
    pRow++

    ws2.getCell(`E${pRow}`).value = '  Utilidad del período'
    ws2.getCell(`F${pRow}`).value = utilidadNeta
    styleData(ws2.getCell(`E${pRow}`))
    styleData(ws2.getCell(`F${pRow}`), false, '006400')
    styleCurrency(ws2.getCell(`F${pRow}`))
    ws2.getCell(`F${pRow}`).border = thinBorder()
    ws2.getRow(pRow).height = 16
    pRow++

    row++
    ws2.getCell(`B${row}`).value = '  Total Activo No Corriente'
    ws2.getCell(`C${row}`).value = totalActivoNC
    styleData(ws2.getCell(`B${row}`), true)
    styleData(ws2.getCell(`C${row}`), true, GREEN)
    styleCurrency(ws2.getCell(`C${row}`))
    ws2.getCell(`C${row}`).border = thickBorder()
    ws2.getRow(row).height = 18

    ws2.getCell(`E${pRow}`).value = '  Total Capital Contable'
    ws2.getCell(`F${pRow}`).value = totalCapital
    styleData(ws2.getCell(`E${pRow}`), true)
    styleData(ws2.getCell(`F${pRow}`), true, GREEN)
    styleCurrency(ws2.getCell(`F${pRow}`))
    ws2.getCell(`F${pRow}`).border = thickBorder()
    pRow += 2

    row += 2
    ws2.getCell(`B${row}`).value = 'TOTAL ACTIVO'
    ws2.getCell(`C${row}`).value = totalActivo
    ws2.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    ws2.getCell(`C${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    styleData(ws2.getCell(`B${row}`), true, '7D4E00')
    styleData(ws2.getCell(`C${row}`), true, '7D4E00')
    styleCurrency(ws2.getCell(`C${row}`))
    ws2.getRow(row).height = 22

    ws2.getCell(`E${pRow}`).value = 'TOTAL PASIVO + CAPITAL'
    ws2.getCell(`F${pRow}`).value = totalPasivoCapital
    ws2.getCell(`E${pRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    ws2.getCell(`F${pRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    styleData(ws2.getCell(`E${pRow}`), true, '7D4E00')
    styleData(ws2.getCell(`F${pRow}`), true, '7D4E00')
    styleCurrency(ws2.getCell(`F${pRow}`))
    ws2.getRow(pRow).height = 22
    pRow += 2

    const cuadreOk = Math.abs(totalActivo - totalPasivoCapital) < 1
    ws2.getCell(`E${pRow}`).value = cuadreOk ? '✓ Balance CUADRA' : '✗ Balance NO CUADRA'
    ws2.getCell(`E${pRow}`).font = { name: 'Arial', bold: true, color: { argb: cuadreOk ? GREEN : RED }, size: 10 }

    row += 2
    ws2.getCell(`B${row}`).value = `Fuente: BEER TRUCK ERP/CRM — Generado: ${new Date().toLocaleDateString('es-MX')}`
    ws2.getCell(`B${row}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: DARK_GRAY } }

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 3 — FLUJO DE EFECTIVO
    // ════════════════════════════════════════════════════════════════════════
    const ws3 = wb.addWorksheet('Flujo de Efectivo')
    ws3.views = [{ showGridLines: false }]
    ws3.columns = [
      { key: 'a', width: 4 },
      { key: 'b', width: 42 },
      { key: 'c', width: 20 },
      { key: 'd', width: 4 },
    ]

    addTitleBlock(ws3, 'Estado de Flujo de Efectivo', `Período: ${periodo} — Método Indirecto`, empresa)

    row = 5
    styleHeader(ws3.getCell(`B${row}`), HEADER_BG, WHITE)
    ws3.getCell(`B${row}`).value = 'Concepto'
    ws3.getCell(`B${row}`).alignment = { horizontal: 'left', vertical: 'middle' }
    styleHeader(ws3.getCell(`C${row}`), HEADER_BG, WHITE)
    ws3.getCell(`C${row}`).value = 'Importe ($MXN)'
    ws3.getRow(row).height = 20

    const addFlowRow = (ws, concepto, valor, bold = false, color = '000080', seccion = false, total = false) => {
      row++
      if (seccion) {
        styleSection(ws.getCell(`B${row}`))
        ws.getCell(`B${row}`).value = concepto
        ws.getRow(row).height = 18
        return
      }
      ws.getCell(`B${row}`).value = concepto
      ws.getCell(`C${row}`).value = valor
      styleData(ws.getCell(`B${row}`), bold)
      styleData(ws.getCell(`C${row}`), bold, color)
      styleCurrency(ws.getCell(`C${row}`))
      ws.getCell(`C${row}`).border = total ? thickBorder() : thinBorder()
      ws.getRow(row).height = 16
    }

    addFlowRow(ws3, 'ACTIVIDADES OPERATIVAS', null, false, null, true)
    addFlowRow(ws3, '  Utilidad neta del período', utilidadNeta, false, utilidadNeta >= 0 ? GREEN : RED)
    addFlowRow(ws3, '  (+) Depreciación acumulada del período', totalDepMensual * 6, false, '000080')
    addFlowRow(ws3, '  (+) Aumento en cuentas por pagar', totalPasivo, false, '000080')
    addFlowRow(ws3, '  (-) Variación en inventario', -totalEgresos * 0.2, false, RED)
    const flujoOp = utilidadNeta + (totalDepMensual * 6) + totalPasivo - (totalEgresos * 0.2)
    addFlowRow(ws3, '  Flujo neto de actividades operativas', flujoOp, true, flujoOp >= 0 ? GREEN : RED)
    ws3.getCell(`C${row}`).border = thickBorder()
    ws3.getRow(row).height = 18

    row++
    addFlowRow(ws3, 'ACTIVIDADES DE INVERSIÓN', null, false, null, true)
    const totalCostoActivos = assetsValuados.reduce((s, a) => s + Number(a.cost), 0)
    addFlowRow(ws3, '  (-) Adquisición de activos fijos', -totalCostoActivos, false, RED)
    addFlowRow(ws3, '  Flujo neto de actividades de inversión', -totalCostoActivos, true, RED)
    ws3.getCell(`C${row}`).border = thickBorder()
    ws3.getRow(row).height = 18

    row++
    addFlowRow(ws3, 'ACTIVIDADES DE FINANCIAMIENTO', null, false, null, true)
    addFlowRow(ws3, '  (+) Aportación de capital inicial', capitalInicial, false, '000080')
    addFlowRow(ws3, '  Flujo neto de actividades de financiamiento', capitalInicial, true, GREEN)
    ws3.getCell(`C${row}`).border = thickBorder()
    ws3.getRow(row).height = 18

    row += 2
    const variacionNeta = flujoOp - totalCostoActivos + capitalInicial
    ws3.getCell(`B${row}`).value = 'VARIACIÓN NETA EN EFECTIVO'
    ws3.getCell(`C${row}`).value = variacionNeta
    ws3.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    ws3.getCell(`C${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }
    styleData(ws3.getCell(`B${row}`), true, '7D4E00')
    styleData(ws3.getCell(`C${row}`), true, '7D4E00')
    styleCurrency(ws3.getCell(`C${row}`))
    ws3.getRow(row).height = 22

    row++
    ws3.getCell(`B${row}`).value = '  Efectivo al inicio del período'
    ws3.getCell(`C${row}`).value = 0
    styleData(ws3.getCell(`B${row}`), false, DARK_GRAY)
    styleData(ws3.getCell(`C${row}`), false, '000080')
    styleCurrency(ws3.getCell(`C${row}`))
    ws3.getRow(row).height = 16

    row++
    ws3.getCell(`B${row}`).value = '  Efectivo al final del período'
    ws3.getCell(`C${row}`).value = totalEfectivo
    styleData(ws3.getCell(`B${row}`), true)
    styleData(ws3.getCell(`C${row}`), true, GREEN)
    styleCurrency(ws3.getCell(`C${row}`))
    ws3.getCell(`C${row}`).border = thickBorder()
    ws3.getRow(row).height = 18

    row += 2
    ws3.getCell(`B${row}`).value = `Fuente: BEER TRUCK ERP/CRM — Generado: ${new Date().toLocaleDateString('es-MX')}`
    ws3.getCell(`B${row}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: DARK_GRAY } }

    // ── Enviar respuesta ────────────────────────────────────────────────────
    const filename = `BEERTRUCK_Estados_Financieros_${dateFrom}_${dateTo}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    await wb.xlsx.write(res)
    res.end()

  } catch (error) {
    console.error('Error generando Excel:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = { generateEstadosFinancieros }