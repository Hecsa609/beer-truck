import { useState, useEffect } from 'react';
import {
  Download, TrendingUp, DollarSign, ShoppingCart,
  Users, Package, Calendar, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '../../utils/cn';
import { salesAPI, productsAPI, customersAPI, eventsAPI } from '../../api';

export default function ReportsView() {
  const [sales, setSales] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [salesData, productsData, customersData, eventsData] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll(),
        customersAPI.getAll(),
        eventsAPI.getAll()
      ])
      setSales(salesData.sales)
      setProducts(productsData.products)
      setCustomers(customersData.customers)
      setEvents(eventsData.events)
    } catch (err) {
      console.error('Error cargando reportes')
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

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalTax = sales.reduce((sum, s) => sum + Number(s.tax), 0)
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0
  const confirmedEvents = events.filter(e => e.status === 'confirmado').length
  const eventsRevenue = events.reduce((sum, e) => sum + (e.agreed_price || 0), 0)

  const getStock = (product: any) => {
    const inv = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory
    return inv?.stock_current || 0
  }

  const totalStock = products.reduce((sum, p) => sum + getStock(p), 0)
  const inventoryValue = products.reduce((sum, p) => sum + (getStock(p) * p.cost), 0)

  // Sales by date chart
  const salesByDate = sales.reduce((acc: any, sale) => {
    const date = new Date(sale.sale_date).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short'
    })
    if (!acc[date]) acc[date] = { date, total: 0, count: 0 }
    acc[date].total += Number(sale.total)
    acc[date].count += 1
    return acc
  }, {})
  const salesChartData = Object.values(salesByDate).slice(-10)

  // Payment method breakdown
  const paymentData = [
    {
      name: 'Efectivo',
      value: sales.filter(s => s.payment_method === 'efectivo').length,
      total: sales.filter(s => s.payment_method === 'efectivo').reduce((sum, s) => sum + Number(s.total), 0),
      fill: '#22c55e'
    },
    {
      name: 'Tarjeta',
      value: sales.filter(s => s.payment_method === 'tarjeta').length,
      total: sales.filter(s => s.payment_method === 'tarjeta').reduce((sum, s) => sum + Number(s.total), 0),
      fill: '#3b82f6'
    },
    {
      name: 'Transferencia',
      value: sales.filter(s => s.payment_method === 'transferencia').length,
      total: sales.filter(s => s.payment_method === 'transferencia').reduce((sum, s) => sum + Number(s.total), 0),
      fill: '#a855f7'
    },
  ].filter(d => d.value > 0)

  // Products by margin
  const productMargins = products.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    margen: p.cost > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0,
    precio: p.price,
    stock: getStock(p)
  })).sort((a, b) => b.margen - a.margen)

  // Customer types
  const customerTypes = [
    { name: 'Regular', value: customers.filter(c => c.customer_type === 'regular').length, fill: '#3b82f6' },
    { name: 'Empresa', value: customers.filter(c => c.customer_type === 'empresa').length, fill: '#ef9a11' },
    { name: 'VIP', value: customers.filter(c => c.customer_type === 'vip').length, fill: '#a855f7' },
    { name: 'Evento', value: customers.filter(c => c.customer_type === 'evento').length, fill: '#22c55e' },
  ].filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark-400">Cargando reportes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes y Analítica</h1>
          <p className="text-sm text-dark-300 mt-1">Métricas reales de tu operación</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
            <DollarSign size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Revenue Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400 mb-3">
            <ShoppingCart size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Ventas</p>
          <p className="text-lg font-bold text-white">{sales.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Ticket Promedio</p>
          <p className="text-lg font-bold text-white">{formatCurrency(avgTicket)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Users size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Clientes</p>
          <p className="text-lg font-bold text-white">{customers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Package size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Stock Total</p>
          <p className="text-lg font-bold text-white">{totalStock}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Calendar size={20} />
          </div>
          <p className="text-xs text-dark-400 mb-1">Eventos</p>
          <p className="text-lg font-bold text-white">{events.length}</p>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border border-beer-500/20">
          <p className="text-xs text-dark-400 mb-1">Revenue bruto</p>
          <p className="text-2xl font-bold text-beer-400">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-dark-500 mt-1">de {sales.length} ventas registradas</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">IVA generado</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalTax)}</p>
          <p className="text-xs text-dark-500 mt-1">16% sobre ventas</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-xs text-dark-400 mb-1">Valor del inventario</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(inventoryValue)}</p>
          <p className="text-xs text-dark-500 mt-1">{totalStock} unidades en stock</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sales by date */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Ventas por Fecha</h3>
          <p className="text-xs text-dark-400 mb-4">Histórico de transacciones</p>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b6b85" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b6b85" fontSize={11} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(value), 'Total']}
                />
                <Bar dataKey="total" fill="#ef9a11" radius={[6, 6, 0, 0]} name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-dark-400">
              <p>No hay ventas registradas</p>
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Métodos de Pago</h3>
          <p className="text-xs text-dark-400 mb-4">Distribución por forma de cobro</p>
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {paymentData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} ventas`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-4">
                {paymentData.map((method, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: method.fill }} />
                      <span className="text-sm text-dark-200">{method.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{formatCurrency(method.total)}</span>
                      <span className="text-xs text-dark-400 ml-2">({method.value} ventas)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-60 text-dark-400">
              <p>No hay datos de pago</p>
            </div>
          )}
        </div>

        {/* Product margins */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Márgenes por Producto</h3>
          <p className="text-xs text-dark-400 mb-4">Rentabilidad de tu catálogo</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={productMargins} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#6b6b85" fontSize={11} tickLine={false}
                tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#6b6b85" fontSize={11} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`${value}%`, 'Margen']}
              />
              <Bar dataKey="margen" radius={[0, 4, 4, 0]}
                fill="#ef9a11"
                label={{ position: 'right', fontSize: 11, fill: '#9ca3af', formatter: (v: any) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer types */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Tipos de Clientes</h3>
          <p className="text-xs text-dark-400 mb-4">Distribución de tu base de clientes</p>
          {customerTypes.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={customerTypes} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {customerTypes.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} clientes`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {customerTypes.map((type, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: type.fill }} />
                    <span className="text-sm text-dark-200">{type.name}</span>
                    <span className="text-sm font-bold text-white ml-auto">{type.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-60 text-dark-400">
              <p>No hay clientes registrados</p>
            </div>
          )}

          {/* Events summary */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <h4 className="text-xs font-medium text-dark-400 uppercase mb-3">Resumen de Eventos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Total eventos</span>
                <span className="text-white font-bold">{events.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Confirmados</span>
                <span className="text-green-400 font-bold">{confirmedEvents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Revenue eventos</span>
                <span className="text-beer-400 font-bold">{formatCurrency(eventsRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-base font-semibold text-white">Análisis de Productos</h3>
          <p className="text-xs text-dark-400 mt-0.5">Precio, costo, margen y stock actual</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase">Producto</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Precio</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Costo</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Margen</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Stock</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase">Valor en Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const stock = getStock(product)
                const margin = product.cost > 0
                  ? Math.round(((product.price - product.cost) / product.price) * 100)
                  : 0
                const stockValue = stock * product.cost
                return (
                  <tr key={product.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-dark-400">{product.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-white">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-dark-300">{formatCurrency(product.cost)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'text-sm font-bold',
                        margin > 50 ? 'text-green-400' :
                        margin > 30 ? 'text-beer-400' : 'text-red-400'
                      )}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-white">{stock}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-beer-400">{formatCurrency(stockValue)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="px-6 py-4 text-sm font-semibold text-white">Total</td>
                <td colSpan={3}></td>
                <td className="px-6 py-4 text-right text-sm font-bold text-white">{totalStock}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-beer-400">{formatCurrency(inventoryValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}