import { useState, useEffect } from 'react';
import { RefreshCw, Receipt, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { cn } from '../../utils/cn';
import { salesAPI } from '../../api';

interface Sale {
  id: string;
  folio: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  payment_method: string;
  payment_status: string;
  sale_date: string;
  notes: string;
  customers: { name: string; phone: string } | null;
  events: { name: string } | null;
  sale_items: { quantity: number; subtotal: number; products: { name: string; sku: string } }[]
}

interface DailySummary {
  fecha: string;
  total_ventas: number;
  total_ingresos: string;
  por_metodo: { efectivo: string; tarjeta: string; transferencia: string }
}

export default function SalesHistoryView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const loadData = async () => {
    setLoading(true)
    try {
      const [salesData, summaryData] = await Promise.all([
        salesAPI.getAll(),
        salesAPI.getDailySummary()
      ])
      setSales(salesData.sales)
      setSummary(summaryData)
    } catch (err) {
      console.error('Error cargando ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN'
    }).format(Number(value))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const paymentIcons: Record<string, string> = {
    efectivo: '💵',
    tarjeta: '💳',
    transferencia: '📱'
  }

  const statusColors: Record<string, string> = {
    pagado: 'badge-success',
    pendiente: 'badge-warning',
    cancelado: 'badge-danger'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de Ventas</h1>
          <p className="text-sm text-dark-300 mt-1">Todas las transacciones registradas</p>
        </div>
        <button onClick={loadData} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Daily Summary */}
      {summary && (
        <div className="glass-card rounded-2xl p-5 border border-beer-500/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-beer-400" />
            <h3 className="text-sm font-semibold text-white">Resumen de hoy — {summary.fecha}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">Ventas</p>
              <p className="text-2xl font-bold text-white">{summary.total_ventas}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">Total</p>
              <p className="text-lg font-bold text-beer-400">{formatCurrency(summary.total_ingresos)}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">💵 Efectivo</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(summary.por_metodo.efectivo)}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">💳 Tarjeta</p>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(summary.por_metodo.tarjeta)}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">📱 Transferencia</p>
              <p className="text-lg font-bold text-purple-400">{formatCurrency(summary.por_metodo.transferencia)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Ventas</p>
              <p className="text-xl font-bold text-white">{sales.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Revenue Total</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(sales.reduce((sum, s) => sum + Number(s.total), 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Ticket Promedio</p>
              <p className="text-xl font-bold text-white">
                {sales.length > 0
                  ? formatCurrency(sales.reduce((sum, s) => sum + Number(s.total), 0) / sales.length)
                  : '$0'}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">IVA Generado</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(sales.reduce((sum, s) => sum + Number(s.tax), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Folio: {selectedSale.folio}</h3>
              <button onClick={() => setSelectedSale(null)} className="text-dark-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-3 mb-4">
              {selectedSale.sale_items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.products?.name}</p>
                    <p className="text-xs text-dark-400">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-white">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-white">{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">IVA 16%</span>
                <span className="text-white">{formatCurrency(selectedSale.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/5">
                <span className="text-white">Total</span>
                <span className="text-beer-400">{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-xs text-dark-400">Método: {paymentIcons[selectedSale.payment_method]} {selectedSale.payment_method}</p>
              <p className="text-xs text-dark-400 mt-1">Fecha: {formatDate(selectedSale.sale_date)}</p>
              {selectedSale.notes && <p className="text-xs text-dark-400 mt-1">Nota: {selectedSale.notes}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-dark-400">Cargando ventas...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Folio</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Método</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Ver</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-dark-400">
                      No hay ventas registradas aún
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-beer-400">{sale.folio}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-300">{formatDate(sale.sale_date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{sale.customers?.name || 'Mostrador'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm">{paymentIcons[sale.payment_method]} {sale.payment_method}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-white">{formatCurrency(sale.total)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge', statusColors[sale.payment_status] || 'badge-neutral')}>
                          {sale.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-beer-400 transition-colors"
                        >
                          <Receipt size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-xs text-dark-400">{sales.length} ventas registradas</p>
          </div>
        </div>
      )}
    </div>
  )
}