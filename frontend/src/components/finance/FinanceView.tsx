import { useState, useEffect } from 'react';
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Plus, RefreshCw,
  Clock, CheckCircle2, Building2, Package, Calendar, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';
import { financeAPI, reportsAPI } from '../../api';

const CATEGORIAS_INGRESO = ['Ventas evento', 'Ventas POS', 'Anticipo cliente', 'Otro ingreso']
const CATEGORIAS_EGRESO = ['Nómina', 'Inventario', 'Mantenimiento', 'Combustible', 'Renta', 'Servicios', 'Impuestos', 'Publicidad', 'Otro egreso']
const CUENTAS_BANCO = ['Caja chica', 'Cuenta BBVA', 'Cuenta Banamex', 'Cuenta HSBC', 'PayPal', 'Mercado Pago']

const PERIODOS = [
  { id: 'mes_actual', label: 'Este mes' },
  { id: 'mes_anterior', label: 'Mes anterior' },
  { id: 'trimestre', label: 'Este trimestre' },
  { id: 'anio', label: 'Este año' },
  { id: 'personalizado', label: 'Personalizado' },
]

const getPeriodDates = (periodoId: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  switch (periodoId) {
    case 'mes_actual':
      return { from: `${year}-${String(month + 1).padStart(2, '0')}-01`, to: now.toISOString().slice(0, 10) }
    case 'mes_anterior': {
      const prevMonth = month === 0 ? 12 : month
      const prevYear = month === 0 ? year - 1 : year
      const lastDay = new Date(prevYear, prevMonth, 0).getDate()
      return { from: `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`, to: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${lastDay}` }
    }
    case 'trimestre': {
      const quarterStart = Math.floor(month / 3) * 3
      return { from: `${year}-${String(quarterStart + 1).padStart(2, '0')}-01`, to: now.toISOString().slice(0, 10) }
    }
    case 'anio':
      return { from: `${year}-01-01`, to: now.toISOString().slice(0, 10) }
    default:
      return { from: `${year}-${String(month + 1).padStart(2, '0')}-01`, to: now.toISOString().slice(0, 10) }
  }
}

export default function FinanceView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payable' | 'bank' | 'assets'>('overview')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [accountsPayable, setAccountsPayable] = useState<any[]>([])
  const [bankMovements, setBankMovements] = useState<any[]>([])
  const [fixedAssets, setFixedAssets] = useState<any[]>([])
  const [periodo, setPeriodo] = useState('mes_actual')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showTxForm, setShowTxForm] = useState(false)
  const [showPayableForm, setShowPayableForm] = useState(false)
  const [showBankForm, setShowBankForm] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'egreso', category: '', description: '',
    amount: '', payment_method: 'efectivo', third_party: '', notes: ''
  })
  const [payableForm, setPayableForm] = useState({
    supplier: '', invoice_id: '', issue_date: new Date().toISOString().slice(0, 10),
    due_date: '', amount: '', notes: ''
  })
  const [bankForm, setBankForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    account: 'Caja chica', movement_type: 'entrada',
    description: '', amount: '', reference: ''
  })
  const [assetForm, setAssetForm] = useState({
    name: '', purchase_date: new Date().toISOString().slice(0, 10),
    cost: '', useful_life_months: ''
  })

  const getActiveDates = () => {
    if (periodo === 'personalizado' && customFrom && customTo) return { from: customFrom, to: customTo }
    return getPeriodDates(periodo)
  }

  const loadSummary = async () => {
    const { from, to } = getActiveDates()
    const s = await financeAPI.getSummary(from, to)
    setSummary(s)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const { from, to } = getActiveDates()
      const [s, t, p, b, a] = await Promise.all([
        financeAPI.getSummary(from, to),
        financeAPI.getTransactions(),
        financeAPI.getAccountsPayable(),
        financeAPI.getBankMovements(),
        financeAPI.getFixedAssets()
      ])
      setSummary(s)
      setTransactions(t.transactions || [])
      setAccountsPayable(p.accounts_payable || [])
      setBankMovements(b.bank_movements || [])
      setFixedAssets(a.fixed_assets || [])
    } catch (err) {
      console.error('Error cargando finanzas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])
  useEffect(() => { if (periodo !== 'personalizado') loadSummary() }, [periodo])

  const handleCustomPeriod = () => { if (customFrom && customTo) loadSummary() }

  const handleSaveTx = async () => {
    if (!txForm.category || !txForm.description || !txForm.amount) return
    setSaving(true)
    try {
      await financeAPI.createTransaction(txForm)
      await loadAll()
      setShowTxForm(false)
      setTxForm({ date: new Date().toISOString().slice(0, 10), type: 'egreso', category: '', description: '', amount: '', payment_method: 'efectivo', third_party: '', notes: '' })
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleSavePayable = async () => {
    if (!payableForm.supplier || !payableForm.due_date || !payableForm.amount) return
    setSaving(true)
    try {
      await financeAPI.createAccountPayable(payableForm)
      await loadAll()
      setShowPayableForm(false)
      setPayableForm({ supplier: '', invoice_id: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '', amount: '', notes: '' })
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleSaveBank = async () => {
    if (!bankForm.description || !bankForm.amount) return
    setSaving(true)
    try {
      await financeAPI.createBankMovement(bankForm)
      await loadAll()
      setShowBankForm(false)
      setBankForm({ date: new Date().toISOString().slice(0, 10), account: 'Caja chica', movement_type: 'entrada', description: '', amount: '', reference: '' })
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleSaveAsset = async () => {
    if (!assetForm.name || !assetForm.cost || !assetForm.useful_life_months) return
    setSaving(true)
    try {
      await financeAPI.createFixedAsset(assetForm)
      await loadAll()
      setShowAssetForm(false)
      setAssetForm({ name: '', purchase_date: new Date().toISOString().slice(0, 10), cost: '', useful_life_months: '' })
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handlePayPayable = async (id: string, currentPaid: number, total: number) => {
    const newPaid = Math.min(currentPaid + total, total)
    try {
      await financeAPI.updateAccountPayable(id, { amount_paid: newPaid })
      await loadAll()
    } catch (err) { console.error(err) }
  }

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true)
      const { from, to } = getActiveDates()
      await reportsAPI.downloadEstadosFinancieros(from, to)
    } catch (err) {
      console.error('Error descargando Excel:', err)
    } finally {
      setDownloading(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value || 0)

  const formatDate = (d: string) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const statusPayableColors: Record<string, string> = {
    pendiente: 'badge-warning', parcial: 'badge-info',
    pagado: 'badge-success', vencido: 'badge-danger', cancelado: 'badge-neutral'
  }

  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'transactions', label: 'Transacciones' },
    { id: 'payable', label: 'Cuentas por Pagar' },
    { id: 'bank', label: 'Caja / Banco' },
    { id: 'assets', label: 'Activos Fijos' },
  ]

  const saldosPorCuenta: Record<string, number> = {}
  ;[...bankMovements].reverse().forEach(m => {
    if (!saldosPorCuenta[m.account]) saldosPorCuenta[m.account] = 0
    saldosPorCuenta[m.account] += m.movement_type === 'entrada' ? Number(m.amount) : -Number(m.amount)
  })

  const chartData = [...bankMovements].reverse().slice(-10).map(m => ({
    date: new Date(m.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    entrada: m.movement_type === 'entrada' ? Number(m.amount) : 0,
    salida: m.movement_type === 'salida' ? Number(m.amount) : 0,
  }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-dark-400">Cargando finanzas...</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finanzas</h1>
          <p className="text-sm text-dark-300 mt-1">Control financiero real — transacciones, pagos y activos</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadExcel} disabled={downloading}
            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-all flex items-center gap-2 disabled:opacity-50">
            <Download size={16} />
            {downloading ? 'Generando...' : 'Exportar Excel'}
          </button>
          <button onClick={loadAll} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-dark-400">
                <Calendar size={16} />
                <span className="text-xs font-medium uppercase">Período</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {PERIODOS.map(p => (
                  <button key={p.id} onClick={() => setPeriodo(p.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      periodo === p.id
                        ? 'bg-beer-500/20 text-beer-400 border border-beer-500/30'
                        : 'bg-dark-800 text-dark-300 border border-white/5 hover:text-white'
                    )}>
                    {p.label}
                  </button>
                ))}
              </div>
              {periodo === 'personalizado' && (
                <div className="flex items-center gap-2 ml-2">
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className="px-3 py-1.5 bg-dark-800 border border-white/5 rounded-lg text-xs text-white focus:outline-none" />
                  <span className="text-dark-400 text-xs">—</span>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className="px-3 py-1.5 bg-dark-800 border border-white/5 rounded-lg text-xs text-white focus:outline-none" />
                  <button onClick={handleCustomPeriod} disabled={!customFrom || !customTo}
                    className="px-3 py-1.5 gradient-beer rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                    Aplicar
                  </button>
                </div>
              )}
              {summary?.periodo && (
                <span className="text-xs text-dark-500 ml-auto">
                  {formatDate(summary.periodo.desde)} — {formatDate(summary.periodo.hasta)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                  <ArrowUpRight size={20} />
                </div>
                <span className="text-xs text-dark-400">Ingresos del período</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary?.ingresos || 0)}</p>
              <p className="text-xs text-dark-500 mt-1">Incl. ventas POS: {formatCurrency(summary?.ventas_pos || 0)}</p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <ArrowDownRight size={20} />
                </div>
                <span className="text-xs text-dark-400">Egresos del período</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary?.egresos || 0)}</p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
                  <DollarSign size={20} />
                </div>
                <span className="text-xs text-dark-400">Utilidad Neta</span>
              </div>
              <p className={cn('text-2xl font-bold', (summary?.utilidad_neta || 0) >= 0 ? 'text-green-400' : 'text-red-400')}>
                {formatCurrency(summary?.utilidad_neta || 0)}
              </p>
              {(summary?.ingresos || 0) > 0 && (
                <p className="text-xs text-dark-500 mt-1">
                  Margen: {(((summary?.utilidad_neta || 0) / (summary?.ingresos || 1)) * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Clock size={20} />
                </div>
                <span className="text-xs text-dark-400">Por Pagar</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary?.cuentas_por_pagar || 0)}</p>
            </div>
          </div>

          {Object.keys(summary?.saldos_por_cuenta || {}).length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Saldos por Cuenta</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(summary.saldos_por_cuenta).map(([cuenta, saldo]: any) => (
                  <div key={cuenta} className="p-3 rounded-xl bg-white/3 text-center">
                    <p className="text-xs text-dark-400 mb-1 truncate">{cuenta}</p>
                    <p className={cn('text-sm font-bold', saldo >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {formatCurrency(saldo)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm text-dark-400">Total en caja y bancos</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(Object.values(summary.saldos_por_cuenta).reduce((s: any, v: any) => s + v, 0))}
                </span>
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-1">Movimientos de Caja / Banco</h3>
            <p className="text-xs text-dark-400 mb-4">Últimos movimientos registrados</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSalida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6b6b85" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(value), '']} />
                  <Area type="monotone" dataKey="entrada" stroke="#22c55e" fill="url(#colorEntrada)" strokeWidth={2} name="Entrada" />
                  <Area type="monotone" dataKey="salida" stroke="#ef4444" fill="url(#colorSalida)" strokeWidth={2} name="Salida" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-dark-400">
                <p>Registra movimientos de caja para ver la gráfica</p>
              </div>
            )}
          </div>

          {summary?.egresos_por_categoria && Object.keys(summary.egresos_por_categoria).length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Egresos por Categoría</h3>
              <div className="space-y-3">
                {Object.entries(summary.egresos_por_categoria)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([cat, val]: any) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-dark-200">{cat}</span>
                        <span className="text-sm font-medium text-white">{formatCurrency(val)}</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-beer-500"
                          style={{ width: `${(val / summary.egresos) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTxForm(!showTxForm)}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={16} /> Nueva Transacción
            </button>
          </div>
          {showTxForm && (
            <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
              <h3 className="text-base font-semibold text-white mb-4">Nueva Transacción</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Tipo *</label>
                  <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value, category: '' })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    <option value="egreso">Egreso</option>
                    <option value="ingreso">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Categoría *</label>
                  <select value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    <option value="">Selecciona categoría</option>
                    {(txForm.type === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha *</label>
                  <input type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Monto *</label>
                  <input type="number" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Descripción *</label>
                  <input type="text" value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                    placeholder="Descripción de la transacción"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Método de pago</label>
                  <select value={txForm.payment_method} onChange={e => setTxForm({ ...txForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Tercero</label>
                  <input type="text" value={txForm.third_party} onChange={e => setTxForm({ ...txForm, third_party: e.target.value })}
                    placeholder="Proveedor o cliente"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Notas</label>
                  <input type="text" value={txForm.notes} onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                    placeholder="Notas adicionales"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowTxForm(false)}
                  className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSaveTx} disabled={saving || !txForm.category || !txForm.description || !txForm.amount}
                  className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Fecha</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Tipo</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Categoría</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Descripción</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Tercero</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Monto</th>
                    <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-dark-400">No hay transacciones registradas</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4"><span className="text-sm text-dark-300">{formatDate(t.date)}</span></td>
                      <td className="px-6 py-4">
                        <span className={cn('badge', t.type === 'ingreso' ? 'badge-success' : 'badge-danger')}>
                          {t.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-dark-200">{t.category}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-white">{t.description}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-dark-300">{t.third_party || '—'}</span></td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn('text-sm font-bold', t.type === 'ingreso' ? 'text-green-400' : 'text-red-400')}>
                          {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge', t.status === 'completado' ? 'badge-success' : t.status === 'pendiente' ? 'badge-warning' : 'badge-neutral')}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUENTAS POR PAGAR */}
      {activeTab === 'payable' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowPayableForm(!showPayableForm)}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={16} /> Nueva Cuenta por Pagar
            </button>
          </div>
          {showPayableForm && (
            <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
              <h3 className="text-base font-semibold text-white mb-4">Nueva Cuenta por Pagar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Proveedor *</label>
                  <input type="text" value={payableForm.supplier} onChange={e => setPayableForm({ ...payableForm, supplier: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">No. Factura</label>
                  <input type="text" value={payableForm.invoice_id} onChange={e => setPayableForm({ ...payableForm, invoice_id: e.target.value })}
                    placeholder="FAC-001"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha emisión *</label>
                  <input type="date" value={payableForm.issue_date} onChange={e => setPayableForm({ ...payableForm, issue_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha vencimiento *</label>
                  <input type="date" value={payableForm.due_date} onChange={e => setPayableForm({ ...payableForm, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Monto *</label>
                  <input type="number" value={payableForm.amount} onChange={e => setPayableForm({ ...payableForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Notas</label>
                  <input type="text" value={payableForm.notes} onChange={e => setPayableForm({ ...payableForm, notes: e.target.value })}
                    placeholder="Notas adicionales"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowPayableForm(false)}
                  className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSavePayable} disabled={saving || !payableForm.supplier || !payableForm.due_date || !payableForm.amount}
                  className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {accountsPayable.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <p className="text-dark-400">No hay cuentas por pagar registradas</p>
              </div>
            ) : accountsPayable.map(p => (
              <div key={p.id} className={cn('glass-card rounded-xl p-5 border-l-4',
                p.status === 'vencido' ? 'border-l-red-500' :
                p.status === 'pagado' ? 'border-l-green-500' :
                p.status === 'parcial' ? 'border-l-blue-500' : 'border-l-yellow-500'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-dark-300">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{p.supplier}</h4>
                      <p className="text-xs text-dark-400 mt-0.5">
                        {p.invoice_id ? `Factura: ${p.invoice_id} · ` : ''}Vence: {formatDate(p.due_date)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn('badge text-[10px]', statusPayableColors[p.status] || 'badge-neutral')}>{p.status}</span>
                        {p.status === 'parcial' && <span className="text-xs text-dark-400">Pagado: {formatCurrency(p.amount_paid)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatCurrency(p.amount)}</p>
                      {p.status !== 'pagado' && <p className="text-xs text-red-400">Pendiente: {formatCurrency(Number(p.amount) - Number(p.amount_paid))}</p>}
                    </div>
                    {p.status !== 'pagado' && p.status !== 'cancelado' && (
                      <button onClick={() => handlePayPayable(p.id, Number(p.amount_paid), Number(p.amount))}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors flex items-center gap-1">
                        <CheckCircle2 size={13} /> Marcar pagado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAJA / BANCO */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {Object.keys(saldosPorCuenta).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(saldosPorCuenta).map(([cuenta, saldo]) => (
                <div key={cuenta} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-xs text-dark-400 mb-1 truncate">{cuenta}</p>
                  <p className={cn('text-lg font-bold', saldo >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => setShowBankForm(!showBankForm)}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={16} /> Nuevo Movimiento
            </button>
          </div>
          {showBankForm && (
            <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
              <h3 className="text-base font-semibold text-white mb-4">Nuevo Movimiento de Caja / Banco</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Cuenta *</label>
                  <select value={bankForm.account} onChange={e => setBankForm({ ...bankForm, account: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    {CUENTAS_BANCO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Tipo *</label>
                  <select value={bankForm.movement_type} onChange={e => setBankForm({ ...bankForm, movement_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha *</label>
                  <input type="date" value={bankForm.date} onChange={e => setBankForm({ ...bankForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Monto *</label>
                  <input type="number" value={bankForm.amount} onChange={e => setBankForm({ ...bankForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Descripción *</label>
                  <input type="text" value={bankForm.description} onChange={e => setBankForm({ ...bankForm, description: e.target.value })}
                    placeholder="Descripción del movimiento"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Referencia</label>
                  <input type="text" value={bankForm.reference} onChange={e => setBankForm({ ...bankForm, reference: e.target.value })}
                    placeholder="No. de transferencia, folio..."
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowBankForm(false)}
                  className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSaveBank} disabled={saving || !bankForm.description || !bankForm.amount}
                  className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Fecha</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Cuenta</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Descripción</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Referencia</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Entrada</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Salida</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {bankMovements.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-dark-400">No hay movimientos registrados</td></tr>
                  ) : bankMovements.map(m => (
                    <tr key={m.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4"><span className="text-sm text-dark-300">{formatDate(m.date)}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-dark-200">{m.account}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-white">{m.description}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-dark-400">{m.reference || '—'}</span></td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-green-400">
                          {m.movement_type === 'entrada' ? formatCurrency(m.amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-red-400">
                          {m.movement_type === 'salida' ? formatCurrency(m.amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn('text-sm font-bold', Number(m.balance) >= 0 ? 'text-white' : 'text-red-400')}>
                          {formatCurrency(m.balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVOS FIJOS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAssetForm(!showAssetForm)}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={16} /> Nuevo Activo
            </button>
          </div>
          {showAssetForm && (
            <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
              <h3 className="text-base font-semibold text-white mb-4">Nuevo Activo Fijo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Nombre del activo *</label>
                  <input type="text" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })}
                    placeholder="Beer Truck #1, Refrigerador..."
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha de compra *</label>
                  <input type="date" value={assetForm.purchase_date} onChange={e => setAssetForm({ ...assetForm, purchase_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Costo de adquisición *</label>
                  <input type="number" value={assetForm.cost} onChange={e => setAssetForm({ ...assetForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Vida útil (meses) *</label>
                  <input type="number" value={assetForm.useful_life_months} onChange={e => setAssetForm({ ...assetForm, useful_life_months: e.target.value })}
                    placeholder="60"
                    className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAssetForm(false)}
                  className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSaveAsset} disabled={saving || !assetForm.name || !assetForm.cost || !assetForm.useful_life_months}
                  className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
          {fixedAssets.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-dark-400 mb-1">Valor Original Total</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(fixedAssets.reduce((s, a) => s + Number(a.cost), 0))}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-dark-400 mb-1">Depreciación Acumulada</p>
                <p className="text-xl font-bold text-red-400">
                  {formatCurrency(fixedAssets.reduce((s, a) => s + Number(a.accumulated_depreciation || 0), 0))}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-dark-400 mb-1">Valor Libro Actual</p>
                <p className="text-xl font-bold text-beer-400">
                  {formatCurrency(fixedAssets.reduce((s, a) => s + Number(a.book_value), 0))}
                </p>
              </div>
            </div>
          )}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Activo</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Fecha compra</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Costo original</th>
                    <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase">Meses</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Dep. mensual</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Dep. acumulada</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Valor libro actual</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedAssets.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-dark-400">No hay activos fijos registrados</td></tr>
                  ) : fixedAssets.map(a => (
                    <tr key={a.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-beer-500/10 flex items-center justify-center text-beer-400">
                            <Package size={15} />
                          </div>
                          <span className="text-sm font-medium text-white">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-dark-300">{formatDate(a.purchase_date)}</span></td>
                      <td className="px-6 py-4 text-right"><span className="text-sm font-semibold text-white">{formatCurrency(a.cost)}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-dark-300">{a.months_elapsed} / {a.useful_life_months}</span>
                      </td>
                      <td className="px-6 py-4 text-right"><span className="text-sm text-dark-300">{formatCurrency(a.monthly_depreciation)}</span></td>
                      <td className="px-6 py-4 text-right"><span className="text-sm text-red-400">{formatCurrency(a.accumulated_depreciation || 0)}</span></td>
                      <td className="px-6 py-4 text-right"><span className="text-sm font-bold text-beer-400">{formatCurrency(a.book_value)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}