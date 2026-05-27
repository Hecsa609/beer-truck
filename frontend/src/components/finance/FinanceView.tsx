import { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt,
  ArrowUpRight, ArrowDownRight, Eye, Download,
  FileText, AlertTriangle, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from '../../utils/cn';
import { transactions, invoices, cashFlowData, clients } from '../../data/mockData';

export default function FinanceView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'transactions' | 'receivable'>('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const accountsReceivable = invoices.filter(i => ['pending', 'sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.total, 0);

  const tabs = [
    { id: 'overview' as const, label: 'Resumen', icon: <DollarSign size={16} /> },
    { id: 'invoices' as const, label: 'Facturas', icon: <FileText size={16} /> },
    { id: 'transactions' as const, label: 'Transacciones', icon: <Receipt size={16} /> },
    { id: 'receivable' as const, label: 'Cuentas por Cobrar', icon: <Clock size={16} /> },
  ];

  const invoiceStatusColors: Record<string, string> = {
    draft: 'badge-neutral',
    pending: 'badge-warning',
    sent: 'badge-info',
    paid: 'badge-success',
    cancelled: 'badge-danger',
    overdue: 'badge-danger'
  };

  const invoiceStatusLabels: Record<string, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    sent: 'Enviada',
    paid: 'Pagada',
    cancelled: 'Cancelada',
    overdue: 'Vencida'
  };

  const invoiceStatusIcons: Record<string, React.ReactNode> = {
    draft: <FileText size={14} />,
    pending: <Clock size={14} />,
    sent: <ArrowUpRight size={14} />,
    paid: <CheckCircle2 size={14} />,
    cancelled: <XCircle size={14} />,
    overdue: <AlertTriangle size={14} />
  };

  // Expense breakdown
  const expensesByCategory = [
    { name: 'Nómina', value: 85000, color: '#3b82f6' },
    { name: 'Inventario', value: 18500, color: '#ef9a11' },
    { name: 'Mantenimiento', value: 12000, color: '#f59e0b' },
    { name: 'Combustible', value: 4500, color: '#22c55e' },
    { name: 'Servicios', value: 8000, color: '#a855f7' },
    { name: 'Otros', value: 3500, color: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finanzas</h1>
          <p className="text-sm text-dark-300 mt-1">Control financiero, facturación y cuentas por cobrar</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <Download size={16} /> Exportar
          </button>
          <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
            <Receipt size={16} /> Nueva Factura
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id 
                ? 'bg-dark-700 text-white shadow-sm' 
                : 'text-dark-400 hover:text-dark-200'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                  <ArrowUpRight size={20} />
                </div>
                <span className="text-xs text-dark-400">Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-xs text-green-400">+12.5% vs mes anterior</span>
              </div>
            </div>
            <div className="stat-card glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <ArrowDownRight size={20} />
                </div>
                <span className="text-xs text-dark-400">Gastos</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown size={12} className="text-red-400" />
                <span className="text-xs text-red-400">+8.2% vs mes anterior</span>
              </div>
            </div>
            <div className="stat-card glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
                  <DollarSign size={20} />
                </div>
                <span className="text-xs text-dark-400">Utilidad Neta</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(netProfit)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-xs text-green-400">Margen: {((netProfit / totalIncome) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="stat-card glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Clock size={20} />
                </div>
                <span className="text-xs text-dark-400">Por Cobrar</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(accountsReceivable)}</p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle size={12} className="text-yellow-400" />
                <span className="text-xs text-yellow-400">{invoices.filter(i => i.status === 'overdue').length} vencidas</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-1">Flujo de Caja</h3>
              <p className="text-xs text-dark-400 mb-4">Enero 2026</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef9a11" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef9a11" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6b6b85" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b6b85" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#ef9a11" fill="url(#colorBalance)" strokeWidth={2} name="Balance" />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Ingresos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-1">Gastos por Categoría</h3>
              <p className="text-xs text-dark-400 mb-4">Enero 2026</p>
              <div className="space-y-4">
                {expensesByCategory.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-200">{cat.name}</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(cat.value / expensesByCategory[0].value) * 100}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Factura</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Subtotal</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">IVA</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Vencimiento</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  return (
                    <tr key={invoice.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-beer-400">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">{client?.name}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-dark-200">{formatCurrency(invoice.subtotal)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-dark-200">{formatCurrency(invoice.tax)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-white">{formatCurrency(invoice.total)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge flex items-center justify-center gap-1 w-fit mx-auto', invoiceStatusColors[invoice.status])}>
                          {invoiceStatusIcons[invoice.status]}
                          {invoiceStatusLabels[invoice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'text-sm',
                          invoice.status === 'overdue' ? 'text-red-400' : 'text-dark-300'
                        )}>
                          {invoice.dueDate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Descripción</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Método</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Monto</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">{transaction.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'badge',
                        transaction.type === 'income' ? 'badge-success' : 'badge-danger'
                      )}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{transaction.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{transaction.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300 capitalize">{transaction.paymentMethod || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'text-sm font-semibold',
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="badge badge-success">Completado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accounts Receivable Tab */}
      {activeTab === 'receivable' && (
        <div className="space-y-4">
          {invoices.filter(i => ['pending', 'sent', 'overdue'].includes(i.status)).map((invoice) => {
            const client = clients.find(c => c.id === invoice.clientId);
            return (
              <div key={invoice.id} className={cn(
                'glass-card rounded-xl p-5 border-l-4',
                invoice.status === 'overdue' ? 'border-l-red-500' :
                invoice.status === 'pending' ? 'border-l-yellow-500' : 'border-l-blue-500'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                      invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    )}>
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{invoice.invoiceNumber}</h4>
                      <p className="text-xs text-dark-400 mt-0.5">{client?.name} · Vence: {invoice.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatCurrency(invoice.total)}</p>
                      <span className={cn('badge text-[10px]', invoiceStatusColors[invoice.status])}>
                        {invoiceStatusLabels[invoice.status]}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-lg text-xs text-dark-200 hover:text-white transition-colors">
                      Enviar Recordatorio
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
