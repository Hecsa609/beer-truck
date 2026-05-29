import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, ShoppingCart, Users, Calendar,
  AlertTriangle, ArrowRight, RefreshCw, Package
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '../../utils/cn';
import { salesAPI, productsAPI, customersAPI, eventsAPI } from '../../api';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [sales, setSales] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [summaryData, salesData, productsData, customersData, eventsData] = await Promise.all([
        salesAPI.getDailySummary(),
        salesAPI.getAll(),
        productsAPI.getAll(),
        customersAPI.getAll(),
        eventsAPI.getAll()
      ])
      setSummary(summaryData)
      setSales(salesData.sales)
      setProducts(productsData.products)
      setCustomers(customersData.customers)
      setEvents(eventsData.events)
    } catch (err) {
      console.error('Error cargando dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0
    }).format(Number(value))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  const getStock = (product: any) => {
    const inv = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory
    return inv?.stock_current || 0
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const todayRevenue = Number(summary?.total_ingresos || 0)
  const lowStockProducts = products.filter(p => {
    const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory
    return inv && inv.stock_current <= inv.stock_minimum
  })
  const upcomingEvents = events.filter(e =>
    ['prospecto', 'cotizado', 'confirmado'].includes(e.status)
  ).slice(0, 4)

  const salesChartData = sales.slice(-7).reverse().map((s, i) => ({
    name: new Date(s.sale_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    ventas: Number(s.total)
  }))

  const paymentMethodData = [
    { name: 'Efectivo', value: sales.filter(s => s.payment_method === 'efectivo').length, color: '#22c55e' },
    { name: 'Tarjeta', value: sales.filter(s => s.payment_method === 'tarjeta').length, color: '#3b82f6' },
    { name: 'Transferencia', value: sales.filter(s => s.payment_method === 'transferencia').length, color: '#a855f7' },
  ].filter(d => d.value > 0)

  const statusColors: Record<string, string> = {
    prospecto: 'badge-info',
    cotizado: 'badge-warning',
    confirmado: 'badge-success',
    en_curso: 'badge-info',
    completado: 'badge-neutral',
    cancelado: 'badge-danger'
  }

  const paymentColors: Record<string, string> = {
    efectivo: 'badge-success',
    tarjeta: 'badge-info',
    transferencia: 'badge-warning'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark-400">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buenos días 👋</h1>
          <p className="text-sm text-dark-300 mt-1">Aquí tienes el resumen real de tu operación</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <DollarSign size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Revenue Total</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400 mb-3">
            <ShoppingCart size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Ventas Hoy</p>
          <p className="text-xl font-bold text-white">{formatCurrency(todayRevenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Users size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Clientes</p>
          <p className="text-xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
            <Calendar size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Eventos</p>
          <p className="text-xl font-bold text-white">{events.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Package size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Productos</p>
          <p className="text-xl font-bold text-white">{products.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3',
            lowStockProducts.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          )}>
            <AlertTriangle size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Stock Bajo</p>
          <p className={cn('text-xl font-bold', lowStockProducts.length > 0 ? 'text-red-400' : 'text-green-400')}>
            {lowStockProducts.length}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Ventas Recientes</h3>
              <p className="text-xs text-dark-400 mt-0.5">Últimas {salesChartData.length} transacciones</p>
            </div>
          </div>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b6b85" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b6b85" fontSize={11} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(value), 'Total']}
                />
                <Bar dataKey="ventas" fill="#ef9a11" radius={[4, 4, 0, 0]} name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-dark-400">
              <p>No hay ventas registradas aún</p>
            </div>
          )}
        </div>

        {/* Resumen del día */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-2">Resumen de hoy</h3>
          <p className="text-xs text-dark-400 mb-4">{summary?.fecha}</p>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-400">Ventas</span>
              <span className="text-sm font-bold text-white">{summary?.total_ventas || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-400">Total</span>
              <span className="text-sm font-bold text-beer-400">{formatCurrency(summary?.total_ingresos || 0)}</span>
            </div>
            <div className="border-t border-white/5 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-400">💵 Efectivo</span>
                <span className="text-xs text-green-400">{formatCurrency(summary?.por_metodo?.efectivo || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-400">💳 Tarjeta</span>
                <span className="text-xs text-blue-400">{formatCurrency(summary?.por_metodo?.tarjeta || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-400">📱 Transferencia</span>
                <span className="text-xs text-purple-400">{formatCurrency(summary?.por_metodo?.transferencia || 0)}</span>
              </div>
            </div>
          </div>

          {/* Inventory quick view */}
          <h4 className="text-xs font-medium text-dark-400 uppercase mb-3">Inventario</h4>
          <div className="space-y-2">
            {products.slice(0, 4).map(p => {
              const stock = getStock(p)
              const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory
              const min = inv?.stock_minimum || 5
              const isLow = stock <= min
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-xs text-dark-300 truncate flex-1">{p.name}</span>
                  <span className={cn('text-xs font-bold ml-2', isLow ? 'text-red-400' : 'text-green-400')}>
                    {stock}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Events */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Próximos Eventos</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-6">No hay eventos próximos</p>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-beer-500/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-beer-400 leading-none uppercase">
                      {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-beer-400 leading-none">
                      {new Date(event.event_date + 'T12:00:00').getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.name}</p>
                    <p className="text-xs text-dark-400">{event.estimated_guests || '—'} invitados · {event.location || '—'}</p>
                    <span className={cn('badge text-[10px] mt-1', statusColors[event.status] || 'badge-neutral')}>
                      {event.status}
                    </span>
                  </div>
                  {event.agreed_price && (
                    <span className="text-xs font-bold text-beer-400">{formatCurrency(event.agreed_price)}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-base font-semibold text-white">Ventas Recientes</h3>
            <span className="text-xs text-dark-400">{sales.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase">Folio</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase">Fecha</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-dark-400 uppercase">Método</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-beer-400">{sale.folio}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-dark-300">{formatDate(sale.sale_date)}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn('badge text-[10px]', paymentColors[sale.payment_method] || 'badge-neutral')}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-bold text-white">{formatCurrency(sale.total)}</span>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-dark-400 text-sm">
                      No hay ventas aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}