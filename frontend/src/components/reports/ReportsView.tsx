import { 
  Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Users, Package, Truck
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from '../../utils/cn';
import { salesByDay, topProducts, revenueByChannel } from '../../data/mockData';

export default function ReportsView() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const kpiCards = [
    { label: 'Revenue Total', value: 847500, change: 12.5, positive: true, icon: <DollarSign size={20} />, color: 'from-green-500/20 to-green-600/5 text-green-400' },
    { label: 'Ventas Totales', value: 156, change: 8.3, positive: true, icon: <ShoppingCart size={20} />, color: 'from-beer-500/20 to-beer-600/5 text-beer-400' },
    { label: 'Clientes Nuevos', value: 24, change: 15.2, positive: true, icon: <Users size={20} />, color: 'from-purple-500/20 to-purple-600/5 text-purple-400' },
    { label: 'Productos Vendidos', value: 2340, change: -3.1, positive: false, icon: <Package size={20} />, color: 'from-blue-500/20 to-blue-600/5 text-blue-400' },
    { label: 'Eventos Realizados', value: 8, change: 33.3, positive: true, icon: <Calendar size={20} />, color: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400' },
    { label: 'Trucks Operando', value: 3, change: 0, positive: true, icon: <Truck size={20} />, color: 'from-orange-500/20 to-orange-600/5 text-orange-400' },
  ];

  // Additional data for reports
  const monthlyRevenue = [
    { month: 'Ago', revenue: 520000 }, { month: 'Sep', revenue: 580000 },
    { month: 'Oct', revenue: 650000 }, { month: 'Nov', revenue: 720000 },
    { month: 'Dic', revenue: 890000 }, { month: 'Ene', revenue: 847500 },
  ];

  const customerSegments = [
    { name: 'VIP', value: 15, fill: '#ef9a11' },
    { name: 'Regular', value: 45, fill: '#3b82f6' },
    { name: 'Nuevo', value: 25, fill: '#22c55e' },
    { name: 'Inactivo', value: 15, fill: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes y Analítica</h1>
          <p className="text-sm text-dark-300 mt-1">KPIs, métricas y análisis de rendimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none">
            <option>Enero 2026</option>
            <option>Diciembre 2025</option>
            <option>Noviembre 2025</option>
          </select>
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="stat-card glass-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', kpi.color)}>
                {kpi.icon}
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                kpi.positive ? 'text-green-400' : 'text-red-400'
              )}>
                {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-xs text-dark-400 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-white">
              {typeof kpi.value === 'number' && kpi.value > 1000 ? formatCurrency(kpi.value) : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Tendencia de Revenue</h3>
          <p className="text-xs text-dark-400 mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b6b85" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#ef9a11" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Channel */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Distribución por Canal</h3>
          <p className="text-xs text-dark-400 mb-4">Revenue por canal de venta</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={revenueByChannel}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {revenueByChannel.map((ch, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: ch.fill }} />
                <span className="text-dark-200">{ch.name}</span>
                <span className="text-white font-medium ml-auto">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Top Productos</h3>
          <p className="text-xs text-dark-400 mb-4">Productos más vendidos</p>
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
                      className="h-full gradient-beer rounded-full"
                      style={{ width: `${(product.ventas / topProducts[0].ventas) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Segmentos de Clientes</h3>
          <p className="text-xs text-dark-400 mb-4">Distribución por tipo de cliente</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {customerSegments.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {customerSegments.map((seg, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.fill }} />
                <span className="text-dark-200">{seg.name}</span>
                <span className="text-white font-medium ml-auto">{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by Day Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-1">Ventas por Día de la Semana</h3>
        <p className="text-xs text-dark-400 mb-4">Comparativa ventas directas vs eventos</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByDay} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b6b85" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
            <Tooltip 
              contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
            />
            <Bar dataKey="ventas" fill="#ef9a11" radius={[4, 4, 0, 0]} name="Ventas Directas" />
            <Bar dataKey="eventos" fill="#78350f" radius={[4, 4, 0, 0]} name="Eventos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
