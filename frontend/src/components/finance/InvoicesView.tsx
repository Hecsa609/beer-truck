import { useState, useEffect } from 'react';
import {
  Plus, FileText, CheckCircle2, Clock, AlertTriangle,
  XCircle, Eye, DollarSign, RefreshCw, ChevronDown,
  Trash2, Send, X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { invoicesAPI, customersAPI, eventsAPI } from '../../api';

const CFDI_USES = [
  { value: 'G01', label: 'G01 - Adquisición de mercancias' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'P01', label: 'P01 - Por definir' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
  { value: 'CP01', label: 'CP01 - Pagos' },
]

const PAYMENT_FORMS = [
  { value: '01', label: '01 - Efectivo' },
  { value: '02', label: '02 - Cheque' },
  { value: '03', label: '03 - Transferencia' },
  { value: '04', label: '04 - Tarjeta de crédito' },
  { value: '28', label: '28 - Tarjeta de débito' },
  { value: '99', label: '99 - Por definir' },
]

const PAYMENT_METHODS = [
  { value: 'PUE', label: 'PUE - Pago en una sola exhibición' },
  { value: 'PPD', label: 'PPD - Pago en parcialidades o diferido' },
]

const FISCAL_REGIMES = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios',
  '606 - Arrendamiento',
  '612 - Personas Físicas con Actividades Empresariales',
  '616 - Sin obligaciones fiscales',
  '621 - Incorporación Fiscal',
  '626 - Régimen Simplificado de Confianza',
]

const statusColors: Record<string, string> = {
  borrador: 'badge-neutral',
  enviada: 'badge-info',
  parcial: 'badge-warning',
  pagada: 'badge-success',
  cancelada: 'badge-danger',
  vencida: 'badge-danger',
}

const statusIcons: Record<string, React.ReactNode> = {
  borrador: <FileText size={13} />,
  enviada: <Send size={13} />,
  parcial: <Clock size={13} />,
  pagada: <CheckCircle2 size={13} />,
  cancelada: <XCircle size={13} />,
  vencida: <AlertTriangle size={13} />,
}

const emptyItem = () => ({
  description: '', quantity: '1', unit: 'Servicio', unit_price: '', discount: '0'
})

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    customer_id: '',
    event_id: '',
    receptor_name: '',
    receptor_rfc: '',
    receptor_email: '',
    receptor_address: '',
    receptor_fiscal_regime: '',
    receptor_cfdi_use: 'G03',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    payment_method: 'PUE',
    payment_form: '03',
    currency: 'MXN',
    discount: '0',
    tax_rate: '16',
    advance_amount: '0',
    notes: '',
    internal_notes: '',
    items: [emptyItem()]
  })

  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    payment_form: '03',
    reference: '',
    notes: ''
  })

  const loadAll = async () => {
    setLoading(true)
    try {
      const [inv, st, cust, ev] = await Promise.all([
        invoicesAPI.getAll(),
        invoicesAPI.getStats(),
        customersAPI.getAll(),
        eventsAPI.getAll()
      ])
      setInvoices(inv.invoices || [])
      setStats(st.stats)
      setCustomers(cust.customers || [])
      setEvents(ev.events || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setForm(prev => ({
        ...prev,
        customer_id: customerId,
        receptor_name: customer.name || prev.receptor_name,
        receptor_rfc: customer.rfc || prev.receptor_rfc,
        receptor_email: customer.email || prev.receptor_email,
      }))
    } else {
      setForm(prev => ({ ...prev, customer_id: '' }))
    }
  }

  const handleEventSelect = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setForm(prev => ({
        ...prev,
        event_id: eventId,
        items: event.agreed_price ? [{
          description: `Servicio Beer Truck — ${event.name}`,
          quantity: '1',
          unit: 'Servicio',
          unit_price: String(event.agreed_price),
          discount: '0'
        }] : prev.items,
        advance_amount: event.agreed_price ? String(event.agreed_price * 0.5) : prev.advance_amount
      }))
    } else {
      setForm(prev => ({ ...prev, event_id: '' }))
    }
  }

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))

  const removeItem = (index: number) => {
    if (form.items.length === 1) return
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const updateItem = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  const calcSubtotal = () => {
    const itemsSubtotal = form.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity || '0')
      const price = parseFloat(item.unit_price || '0')
      const disc = parseFloat(item.discount || '0')
      const lineTotal = qty * price
      return sum + lineTotal - (lineTotal * disc / 100)
    }, 0)
    return itemsSubtotal - parseFloat(form.discount || '0')
  }

  const calcTax = () => calcSubtotal() * (parseFloat(form.tax_rate || '16') / 100)
  const calcTotal = () => calcSubtotal() + calcTax()
  const calcBalance = () => calcTotal() - parseFloat(form.advance_amount || '0')

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(v || 0)

  const formatDate = (d: string) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const handleSave = async () => {
    if (!form.receptor_name || form.items.some(i => !i.description || !i.unit_price)) return
    setSaving(true)
    try {
      await invoicesAPI.create(form)
      await loadAll()
      setShowForm(false)
      resetForm()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const resetForm = () => setForm({
    customer_id: '', event_id: '', receptor_name: '', receptor_rfc: '',
    receptor_email: '', receptor_address: '', receptor_fiscal_regime: '',
    receptor_cfdi_use: 'G03', issue_date: new Date().toISOString().slice(0, 10),
    due_date: '', payment_method: 'PUE', payment_form: '03', currency: 'MXN',
    discount: '0', tax_rate: '16', advance_amount: '0', notes: '', internal_notes: '',
    items: [emptyItem()]
  })

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await invoicesAPI.updateStatus(id, status)
      await loadAll()
      if (selectedInvoice?.id === id) {
        const updated = await invoicesAPI.getById(id)
        setSelectedInvoice(updated.invoice)
      }
    } catch (err) { console.error(err) }
  }

  const handleRegisterPayment = async () => {
    if (!paymentForm.amount || !selectedInvoice) return
    setSaving(true)
    try {
      await invoicesAPI.registerPayment(selectedInvoice.id, paymentForm)
      await loadAll()
      const updated = await invoicesAPI.getById(selectedInvoice.id)
      setSelectedInvoice(updated.invoice)
      setShowPaymentForm(false)
      setPaymentForm({ payment_date: new Date().toISOString().slice(0, 10), amount: '', payment_form: '03', reference: '', notes: '' })
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const openDetail = async (invoice: any) => {
    try {
      const data = await invoicesAPI.getById(invoice.id)
      setSelectedInvoice(data.invoice)
      setShowDetail(true)
    } catch (err) { console.error(err) }
  }

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter(i => i.status === filterStatus)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-dark-400">Cargando facturas...</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturas</h1>
          <p className="text-sm text-dark-300 mt-1">Genera y administra facturas reales con datos fiscales</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAll} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { setShowForm(true); setShowDetail(false) }}
            className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
            <Plus size={16} /> Nueva Factura
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Facturado', value: formatCurrency(stats.total_facturado), color: 'text-white' },
            { label: 'Por Cobrar', value: formatCurrency(stats.total_por_cobrar), color: 'text-yellow-400' },
            { label: 'Cobrado', value: formatCurrency(stats.total_cobrado), color: 'text-green-400' },
            { label: 'Enviadas', value: stats.enviada, color: 'text-blue-400' },
            { label: 'Vencidas', value: stats.vencida, color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-1">{s.label}</p>
              <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'borrador', 'enviada', 'parcial', 'pagada', 'vencida', 'cancelada'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
              filterStatus === s ? 'bg-beer-500/20 text-beer-400 border border-beer-500/30' : 'bg-dark-800 text-dark-300 border border-white/5 hover:text-white'
            )}>
            {s === 'all' ? 'Todas' : s}
            {s !== 'all' && stats?.[s] > 0 && (
              <span className="ml-1 text-[10px] opacity-70">({stats[s]})</span>
            )}
          </button>
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 border border-beer-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Nueva Factura</h3>
            <button onClick={() => { setShowForm(false); resetForm() }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Vincular cliente/evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Vincular Cliente CRM</label>
              <select value={form.customer_id} onChange={e => handleCustomerSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                <option value="">Sin cliente vinculado</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Vincular Evento</label>
              <select value={form.event_id} onChange={e => handleEventSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                <option value="">Sin evento vinculado</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name} — {formatDate(e.event_date)}</option>)}
              </select>
            </div>
          </div>

          {/* Datos fiscales del receptor */}
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-3 uppercase tracking-wider">Datos del Receptor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Razón Social / Nombre *</label>
                <input type="text" value={form.receptor_name} onChange={e => setForm({ ...form, receptor_name: e.target.value })}
                  placeholder="Nombre completo o razón social"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">RFC</label>
                <input type="text" value={form.receptor_rfc} onChange={e => setForm({ ...form, receptor_rfc: e.target.value.toUpperCase() })}
                  placeholder="RFC del receptor"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Email</label>
                <input type="email" value={form.receptor_email} onChange={e => setForm({ ...form, receptor_email: e.target.value })}
                  placeholder="correo@receptor.com"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Dirección Fiscal</label>
                <input type="text" value={form.receptor_address} onChange={e => setForm({ ...form, receptor_address: e.target.value })}
                  placeholder="Calle, Colonia, CP, Ciudad"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Régimen Fiscal</label>
                <select value={form.receptor_fiscal_regime} onChange={e => setForm({ ...form, receptor_fiscal_regime: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                  <option value="">Selecciona régimen</option>
                  {FISCAL_REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Uso del CFDI</label>
                <select value={form.receptor_cfdi_use} onChange={e => setForm({ ...form, receptor_cfdi_use: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                  {CFDI_USES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Datos de la factura */}
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-3 uppercase tracking-wider">Datos de la Factura</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Fecha Emisión</label>
                <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Fecha Vencimiento</label>
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Método de Pago</label>
                <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Forma de Pago</label>
                <select value={form.payment_form} onChange={e => setForm({ ...form, payment_form: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                  {PAYMENT_FORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Conceptos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-dark-300 uppercase tracking-wider">Conceptos</h4>
              <button onClick={addItem}
                className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-dark-200 hover:text-white transition-colors flex items-center gap-1">
                <Plus size={13} /> Agregar línea
              </button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Descripción *</label>}
                    <input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)}
                      placeholder="Descripción del concepto"
                      className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30" />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Cant.</label>}
                    <input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Unidad</label>}
                    <input type="text" value={item.unit} onChange={e => updateItem(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Precio Unit. *</label>}
                    <input type="number" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Desc.%</label>}
                    <input type="number" value={item.discount} onChange={e => updateItem(index, 'discount', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <label className="block text-xs text-dark-400 mb-1">Subtotal</label>}
                    <div className="px-3 py-2 bg-dark-900 rounded-xl text-sm text-beer-400 font-medium">
                      {formatCurrency(
                        parseFloat(item.quantity || '0') * parseFloat(item.unit_price || '0') *
                        (1 - parseFloat(item.discount || '0') / 100)
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    {index === 0 && <div className="mb-5" />}
                    <button onClick={() => removeItem(index)} disabled={form.items.length === 1}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Descuento global ($)</label>
                <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Tasa IVA (%)</label>
                <input type="number" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Anticipo recibido ($)</label>
                <input type="number" value={form.advance_amount} onChange={e => setForm({ ...form, advance_amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Notas para el cliente</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Condiciones, notas de pago..."
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-white mb-4">Resumen</h4>
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(calcSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">IVA ({form.tax_rate}%)</span>
                <span className="text-white font-medium">{formatCurrency(calcTax())}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-white/10 pt-3">
                <span className="text-white">Total</span>
                <span className="text-beer-400">{formatCurrency(calcTotal())}</span>
              </div>
              {parseFloat(form.advance_amount) > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Anticipo</span>
                    <span className="text-green-400">-{formatCurrency(parseFloat(form.advance_amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-dark-300">Saldo pendiente</span>
                    <span className="text-yellow-400">{formatCurrency(calcBalance())}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); resetForm() }}
              className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave}
              disabled={saving || !form.receptor_name || form.items.some(i => !i.description || !i.unit_price)}
              className="px-6 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? 'Guardando...' : 'Crear Factura'}
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetail && selectedInvoice && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-white">{selectedInvoice.folio}</h3>
                <span className={cn('badge flex items-center gap-1', statusColors[selectedInvoice.status])}>
                  {statusIcons[selectedInvoice.status]}
                  {selectedInvoice.status}
                </span>
              </div>
              <p className="text-sm text-dark-400">
                Emitida: {formatDate(selectedInvoice.issue_date)}
                {selectedInvoice.due_date && ` · Vence: ${formatDate(selectedInvoice.due_date)}`}
              </p>
            </div>
            <button onClick={() => setShowDetail(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-dark-400 uppercase">Receptor</h4>
              <p className="text-sm font-semibold text-white">{selectedInvoice.receptor_name}</p>
              {selectedInvoice.receptor_rfc && <p className="text-xs text-dark-300">RFC: {selectedInvoice.receptor_rfc}</p>}
              {selectedInvoice.receptor_email && <p className="text-xs text-dark-300">{selectedInvoice.receptor_email}</p>}
              {selectedInvoice.receptor_address && <p className="text-xs text-dark-300">{selectedInvoice.receptor_address}</p>}
              {selectedInvoice.receptor_fiscal_regime && <p className="text-xs text-dark-400">{selectedInvoice.receptor_fiscal_regime}</p>}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-dark-400 uppercase">Detalles Fiscales</h4>
              <p className="text-xs text-dark-300">Método: {selectedInvoice.payment_method}</p>
              <p className="text-xs text-dark-300">Forma de pago: {PAYMENT_FORMS.find(p => p.value === selectedInvoice.payment_form)?.label || selectedInvoice.payment_form}</p>
              <p className="text-xs text-dark-300">Uso CFDI: {selectedInvoice.receptor_cfdi_use}</p>
              <p className="text-xs text-dark-300">Moneda: {selectedInvoice.currency}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-medium text-dark-400 uppercase mb-3">Conceptos</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 text-xs text-dark-400">Descripción</th>
                    <th className="text-center py-2 text-xs text-dark-400">Cant.</th>
                    <th className="text-center py-2 text-xs text-dark-400">Unidad</th>
                    <th className="text-right py-2 text-xs text-dark-400">P. Unit.</th>
                    <th className="text-right py-2 text-xs text-dark-400">Desc.%</th>
                    <th className="text-right py-2 text-xs text-dark-400">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.invoice_items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-white/3">
                      <td className="py-2 text-sm text-white">{item.description}</td>
                      <td className="py-2 text-sm text-dark-300 text-center">{item.quantity}</td>
                      <td className="py-2 text-sm text-dark-300 text-center">{item.unit}</td>
                      <td className="py-2 text-sm text-dark-300 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 text-sm text-dark-300 text-right">{item.discount}%</td>
                      <td className="py-2 text-sm font-medium text-white text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="space-y-2 min-w-[240px]">
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">Subtotal</span>
                <span className="text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Descuento</span>
                  <span className="text-red-400">-{formatCurrency(selectedInvoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">IVA ({selectedInvoice.tax_rate}%)</span>
                <span className="text-white">{formatCurrency(selectedInvoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-white/10 pt-2">
                <span className="text-white">Total</span>
                <span className="text-beer-400">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              {selectedInvoice.advance_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Anticipo</span>
                  <span className="text-green-400">-{formatCurrency(selectedInvoice.advance_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold">
                <span className="text-dark-300">Saldo pendiente</span>
                <span className={selectedInvoice.balance_due > 0 ? 'text-yellow-400' : 'text-green-400'}>
                  {formatCurrency(selectedInvoice.balance_due)}
                </span>
              </div>
            </div>
          </div>

          {/* Pagos registrados */}
          {selectedInvoice.invoice_payments?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-dark-400 uppercase mb-3">Pagos Registrados</h4>
              <div className="space-y-2">
                {selectedInvoice.invoice_payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                    <div>
                      <p className="text-sm text-white">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-dark-400">{formatDate(p.payment_date)} · {PAYMENT_FORMS.find(pf => pf.value === p.payment_form)?.label || p.payment_form}</p>
                      {p.reference && <p className="text-xs text-dark-500">Ref: {p.reference}</p>}
                    </div>
                    <CheckCircle2 size={16} className="text-green-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registro de pago */}
          {showPaymentForm && (
            <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-3">
              <h4 className="text-sm font-medium text-white">Registrar Pago</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Fecha</label>
                  <input type="date" value={paymentForm.payment_date}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Monto *</label>
                  <input type="number" value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder={formatCurrency(selectedInvoice.balance_due)}
                    className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Forma de Pago</label>
                  <select value={paymentForm.payment_form}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_form: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
                    {PAYMENT_FORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Referencia</label>
                  <input type="text" value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="No. de transferencia, cheque..."
                    className="w-full px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-dark-300 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={handleRegisterPayment} disabled={saving || !paymentForm.amount}
                  className="px-3 py-1.5 gradient-beer rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
                  {saving ? 'Guardando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5 flex-wrap">
            {selectedInvoice.status === 'borrador' && (
              <button onClick={() => handleStatusChange(selectedInvoice.id, 'enviada')}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                <Send size={14} /> Marcar como Enviada
              </button>
            )}
            {['enviada', 'parcial'].includes(selectedInvoice.status) && !showPaymentForm && (
              <button onClick={() => setShowPaymentForm(true)}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2">
                <DollarSign size={14} /> Registrar Pago
              </button>
            )}
            {selectedInvoice.status !== 'cancelada' && selectedInvoice.status !== 'pagada' && (
              <button onClick={() => handleStatusChange(selectedInvoice.id, 'cancelada')}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2">
                <XCircle size={14} /> Cancelar Factura
              </button>
            )}
          </div>
        </div>
      )}

      {/* LIST */}
      {!showForm && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Folio</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Receptor</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Fecha</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase">Vencimiento</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Total</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Saldo</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase">Estado</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-dark-400">
                      {invoices.length === 0 ? 'No hay facturas aún. ¡Crea la primera!' : 'No hay facturas con ese filtro'}
                    </td>
                  </tr>
                ) : filteredInvoices.map(inv => (
                  <tr key={inv.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-beer-400">{inv.folio}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{inv.receptor_name}</p>
                      {inv.receptor_rfc && <p className="text-xs text-dark-400">{inv.receptor_rfc}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">{formatDate(inv.issue_date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-sm', inv.status === 'vencida' ? 'text-red-400' : 'text-dark-300')}>
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">{formatCurrency(inv.total)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn('text-sm font-medium', inv.balance_due > 0 ? 'text-yellow-400' : 'text-green-400')}>
                        {formatCurrency(inv.balance_due)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn('badge flex items-center justify-center gap-1 w-fit mx-auto', statusColors[inv.status])}>
                        {statusIcons[inv.status]}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(inv)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}