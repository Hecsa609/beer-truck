import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar,
  AlertTriangle, ArrowRight, MoreHorizontal, Eye
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '../../utils/cn';
import { 
  kpis, sales, events, trucks, clients, salesByDay, 
  topProducts, revenueByChannel, stockAlerts, notifications,
  cashFlowData
} from '../../data/mockData';

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0 
    }).format(value);
  };

  const getKpiIcon = (label: string) => {
    switch (label) {
      case 'Ingresos del Mes': return <DollarSign size={20} />;
      case 'Ventas Hoy': return <ShoppingCart size={20} />;
      case 'Clientes Activos': return <Users size={20} />;
      case 'Eventos del Mes': return <Calendar size={20} />;
      case 'Tickets Abiertos': return <AlertTriangle size={20} />;
      case 'Margen de Ganancia': return <TrendingUp size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  const getKpiColor = (label: string) => {
    switch (label) {
      case 'Ingresos del Mes': return 'from-blue-500/20 to-blue-600/5 text-blue-400';
      case 'Ventas Hoy': return 'from-beer-500/20 to-beer-600/5 text-beer-400';
      case 'Clientes Activos': return 'from-purple-500/20 to-purple-600/5 text-purple-400';
      case 'Eventos del Mes': return 'from-green-500/20 to-green-600/5 text-green-400';
      case 'Tickets Abiertos': return 'from-red-500/20 to-red-600/5 text-red-400';
      case 'Margen de Ganancia': return 'from-emerald-500/20 to-emerald-600/5 text-emerald-400';
      default: return 'from-gray-500/20 to-gray-600/5 text-gray-400';
    }
  };

  const truckStatusColors: Record<string, string> = {
    available: 'bg-green-500',
    on_route: 'bg-blue-500',
    at_event: 'bg-purple-500',
    maintenance: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  const truckStatusLabels: Record<string, string> = {
    available: 'Disponible',
    on_route: 'En Ruta',
    at_event: 'En Evento',
    maintenance: 'Mantenimiento',
    offline: 'Offline'
  };

  const eventStatusColors: Record<string, string> = {
    inquiry: 'badge-info',
    quoted: 'badge-warning',
    confirmed: 'badge-success',
    in_progress: 'badge-info',
    completed: 'badge-neutral',
    cancelled: 'badge-danger'
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buenos días, Carlos 👋</h1>
          <p className="text-sm text-dark-300 mt-1">Aquí tienes el resumen de tu operación de hoy</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all">
            Exportar Reporte
          </button>
          <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20">
            + Nueva Venta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="stat-card glass-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', getKpiColor(kpi.label))}>
                {getKpiIcon(kpi.label)}
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                kpi.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
              )}>
                {kpi.changeType === 'increase' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-xs text-dark-400 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-white">
              {kpi.format === 'currency' ? formatCurrency(kpi.value as number) : 
               kpi.format === 'percentage' ? `${kpi.value}%` : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Flujo de Caja</h3>
              <p className="text-xs text-dark-400 mt-0.5">Últimos 15 días de enero 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-green-500" />
                <span className="text-dark-300">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-red-400" />
                <span className="text-dark-300">Gastos</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6b6b85" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px', fontSize: '12px' 
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#colorIncome)" strokeWidth={2} name="Ingresos" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} name="Gastos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Channel */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-2">Ingresos por Canal</h3>
          <p className="text-xs text-dark-400 mb-4">Distribución de ventas enero 2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenueByChannel}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {revenueByChannel.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {revenueByChannel.map((ch, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ch.fill }} />
                  <span className="text-dark-200">{ch.name}</span>
                </div>
                <span className="text-white font-medium">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Ventas por Día</h3>
              <p className="text-xs text-dark-400 mt-0.5">Semana actual vs eventos</p>
            </div>
            <button className="text-xs text-beer-400 hover:text-beer-300">Ver todo →</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByDay} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6b6b85" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Bar dataKey="ventas" fill="#ef9a11" radius={[4, 4, 0, 0]} name="Ventas Directas" />
              <Bar dataKey="eventos" fill="#78350f" radius={[4, 4, 0, 0]} name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Productos Top</h3>
              <p className="text-xs text-dark-400 mt-0.5">Los más vendidos este mes</p>
            </div>
            <button className="text-xs text-beer-400 hover:text-beer-300">Ver catálogo →</button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-bold text-dark-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{product.name}</span>
                    <span className="text-sm font-semibold text-beer-400">{formatCurrency(product.ventas)}</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-beer rounded-full transition-all duration-500"
                      style={{ width: `${(product.ventas / topProducts[0].ventas) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-dark-400 mt-1">{product.unidades} unidades vendidas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row - Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Estado de Flotilla</h3>
            <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {trucks.map((truck) => (
              <div key={truck.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className={cn('w-2.5 h-2.5 rounded-full', truckStatusColors[truck.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{truck.name}</p>
                  <p className="text-xs text-dark-400">{truckStatusLabels[truck.status]} · {truck.model}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {truck.fuelLevel !== undefined && (
                      <span className="text-xs text-dark-300">⛽ {truck.fuelLevel}%</span>
                    )}
                  </div>
                  {truck.temperature !== undefined && (
                    <span className="text-xs text-blue-400">🌡️ {truck.temperature}°C</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Próximos Eventos</h3>
            <button className="text-xs text-beer-400 hover:text-beer-300">Ver calendario →</button>
          </div>
          <div className="space-y-3">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-beer-500/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-beer-400 leading-none">
                    {new Date(event.startDate).toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-beer-400 leading-none">
                    {new Date(event.startDate).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-dark-400">{event.attendees.toLocaleString()} asistentes</p>
                  <span className={cn('badge text-[10px] mt-1', eventStatusColors[event.status])}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Actividad Reciente</h3>
            <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors cursor-pointer">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  notif.type === 'success' ? 'bg-green-500' :
                  notif.type === 'warning' ? 'bg-yellow-500' :
                  notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{notif.title}</p>
                  <p className="text-xs text-dark-400 truncate">{notif.message}</p>
                </div>
                <span className="text-[10px] text-dark-500 flex-shrink-0">2h</span>
              </div>
            ))}
          </div>
          {/* Stock Alerts */}
          {stockAlerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Alertas de Inventario
              </p>
              {stockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-dark-300 truncate">{alert.location}</span>
                  <span className={cn(
                    'badge',
                    alert.severity === 'high' ? 'badge-danger' :
                    alert.severity === 'medium' ? 'badge-warning' : 'badge-info'
                  )}>
                    Stock: {alert.currentStock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Recent Sales */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Ventas Recientes</h3>
            <p className="text-xs text-dark-400 mt-0.5">Últimas transacciones del sistema</p>
          </div>
          <button className="text-xs text-beer-400 hover:text-beer-300 flex items-center gap-1">
            Ver historial <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Folio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Concepto</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Pago</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale) => {
                const client = clients.find(c => c.id === sale.clientId);
                return (
                  <tr key={sale.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-beer-400">{sale.saleNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">{client?.name || 'Venta en mostrador'}</p>
                        <p className="text-xs text-dark-400">{client?.company || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-dark-200">
                        {sale.items.length} producto{sale.items.length > 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-white">{formatCurrency(sale.total)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'badge capitalize',
                        sale.paymentMethod === 'cash' ? 'badge-success' :
                        sale.paymentMethod === 'card' ? 'badge-info' :
                        sale.paymentMethod === 'transfer' ? 'badge-warning' : 'badge-neutral'
                      )}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'badge',
                        sale.paymentStatus === 'paid' ? 'badge-success' :
                        sale.paymentStatus === 'partial' ? 'badge-warning' :
                        sale.paymentStatus === 'pending' ? 'badge-danger' : 'badge-neutral'
                      )}>
                        {sale.paymentStatus === 'paid' ? 'Pagado' :
                         sale.paymentStatus === 'partial' ? 'Parcial' :
                         sale.paymentStatus === 'pending' ? 'Pendiente' : sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
