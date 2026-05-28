import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, Eye, Edit, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { productsAPI } from '../../api';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  unit: string;
  active: boolean;
  categories: { name: string; color: string } | null;
  inventory: { stock_current: number; stock_minimum: number; stock_maximum: number } | null;
}

export default function InventoryView() {
  const [activeTab, setActiveTab] = useState<'products' | 'alerts'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products);
    } catch (err: any) {
      setError('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => {
    const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
    return inv && inv.stock_current <= inv.stock_minimum;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0
    }).format(value);
  };

  const tabs = [
    { id: 'products' as const, label: 'Productos', icon: <Package size={16} />, count: products.length },
    { id: 'alerts' as const, label: 'Alertas Stock', icon: <AlertTriangle size={16} />, count: lowStockProducts.length },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-sm text-dark-300 mt-1">Control de stock y productos reales</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
          <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-dark-400 mb-1">Total Productos</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-dark-400 mb-1">Unidades en Stock</p>
          <p className="text-2xl font-bold text-white">
            {products.reduce((sum, p) => { const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory; return sum + (inv?.stock_current || 0); }, 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-dark-400 mb-1">Valor del Inventario</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(products.reduce((sum, p) =>
              sum + ((p.inventory?.stock_current || 0) * p.cost), 0))}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-dark-400 mb-1">Alertas Stock Bajo</p>
          <p className={cn('text-2xl font-bold', lowStockProducts.length > 0 ? 'text-red-400' : 'text-green-400')}>
            {lowStockProducts.length}
          </p>
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
              activeTab === tab.id ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            )}
          >
            {tab.icon}
            {tab.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
              activeTab === tab.id ? 'bg-beer-500/20 text-beer-400' : 'bg-dark-700 text-dark-400'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar producto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-dark-400">Cargando productos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
          <p className="text-red-400">{error}</p>
          <button onClick={loadProducts} className="mt-3 text-sm text-beer-400 hover:text-beer-300">
            Reintentar
          </button>
        </div>
      )}

      {/* Products Tab */}
      {!loading && !error && activeTab === 'products' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Categoría</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Precio</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Costo</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Margen</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const margin = product.cost > 0
                    ? ((product.price - product.cost) / product.price * 100).toFixed(0)
                    : '0';
                  const inv = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory;
                  const stock = inv?.stock_current || 0;
                  const minStock = inv?.stock_minimum || 5;
                  const isLow = stock <= minStock;

                  return (
                    <tr key={product.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-xs text-dark-400">{product.unit}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-dark-300">{product.sku || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-warning">
                          {product.categories?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-white">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-dark-300">{formatCurrency(product.cost)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          'text-sm font-medium',
                          Number(margin) > 50 ? 'text-green-400' :
                          Number(margin) > 30 ? 'text-beer-400' : 'text-red-400'
                        )}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            'text-sm font-bold',
                            isLow ? 'text-red-400' : 'text-green-400'
                          )}>
                            {stock}
                          </span>
                          <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                isLow ? 'bg-red-500' : 'bg-green-500'
                              )}
                              style={{ width: `${Math.min((stock / (minStock * 2)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-dark-500">min: {minStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge', product.active ? 'badge-success' : 'badge-neutral')}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                            <Edit size={15} />
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

      {/* Alerts Tab */}
      {!loading && !error && activeTab === 'alerts' && (
        <div className="space-y-4">
          {lowStockProducts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-green-400 text-lg font-medium">✅ Todo el inventario está en niveles normales</p>
            </div>
          ) : (
            lowStockProducts.map((product) => (
              <div key={product.id} className="glass-card rounded-xl p-5 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{product.name}</h4>
                      <p className="text-xs text-dark-300 mt-0.5">SKU: {product.sku || '—'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-xs">
                          <span className="text-dark-400">Stock actual: </span>
                          <span className="text-red-400 font-bold">{(Array.isArray(product.inventory) ? product.inventory[0] : product.inventory)?.stock_current}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-dark-400">Mínimo: </span>
                          <span className="text-white font-medium">{(Array.isArray(product.inventory) ? product.inventory[0] : product.inventory)?.stock_minimum}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-danger">Stock bajo</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}