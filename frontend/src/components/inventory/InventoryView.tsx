import { useState } from 'react';
import { 
  Search, Plus, Package, AlertTriangle,
  Eye, Edit, Truck, Beer, RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { products, trucks, stockAlerts } from '../../data/mockData';

export default function InventoryView() {
  const [activeTab, setActiveTab] = useState<'products' | 'kegs' | 'stock' | 'alerts'>('products');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'products' as const, label: 'Productos', icon: <Package size={16} />, count: products.length },
    { id: 'kegs' as const, label: 'Barriles', icon: <Beer size={16} />, count: 24 },
    { id: 'stock' as const, label: 'Stock por Truck', icon: <Truck size={16} />, count: trucks.length },
    { id: 'alerts' as const, label: 'Alertas', icon: <AlertTriangle size={16} />, count: stockAlerts.length },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const categoryColors: Record<string, string> = {
    cerveza_artesanal: 'badge-warning',
    cerveza_comercial: 'badge-info',
    snack: 'badge-success',
    merchandising: 'badge-neutral',
    combo: 'badge-info',
    servicio: 'badge-neutral'
  };

  const presentationIcons: Record<string, string> = {
    keg: '🪣',
    can: '🥫',
    bottle: '🍺',
    draft: '🍻',
    package: '📦'
  };

  // Mock keg data
  const kegs = [
    { id: 'k1', number: 'K-001', product: 'Hazy IPA', size: '20L', remaining: 18, status: 'full', truck: 'BT-01', temp: 3.5, pressure: 14 },
    { id: 'k2', number: 'K-002', product: 'Lager Premium', size: '50L', remaining: 32, status: 'partial', truck: 'BT-01', temp: 2.8, pressure: 12 },
    { id: 'k3', number: 'K-003', product: 'Stout Imperial', size: '20L', remaining: 0, status: 'empty', truck: 'Almacén', temp: 0, pressure: 0 },
    { id: 'k4', number: 'K-004', product: 'Wheat Ale', size: '20L', remaining: 15, status: 'partial', truck: 'BT-02', temp: 3.0, pressure: 13 },
    { id: 'k5', number: 'K-005', product: 'Pilsner', size: '50L', remaining: 48, status: 'full', truck: 'BT-02', temp: 2.5, pressure: 14 },
    { id: 'k6', number: 'K-006', product: 'Hazy IPA', size: '20L', remaining: 20, status: 'full', truck: 'BT-03', temp: 3.2, pressure: 14 },
  ];

  const kegStatusColors: Record<string, string> = {
    full: 'badge-success',
    partial: 'badge-warning',
    empty: 'badge-danger',
    cleaning: 'badge-info',
    maintenance: 'badge-neutral'
  };

  // Mock truck stock
  const truckStock: Record<string, { product: string; quantity: number; min: number }[]> = {
    'BT-01': [
      { product: 'Hazy IPA Keg', quantity: 4, min: 3 },
      { product: 'Lager Keg', quantity: 3, min: 3 },
      { product: 'IPA Lata', quantity: 45, min: 100 },
      { product: 'Nachos', quantity: 15, min: 20 },
    ],
    'BT-02': [
      { product: 'Wheat Ale Keg', quantity: 5, min: 3 },
      { product: 'Pilsner Keg', quantity: 6, min: 4 },
      { product: 'Stout Botella', quantity: 80, min: 50 },
      { product: 'Pretzel', quantity: 25, min: 15 },
    ],
    'BT-03': [
      { product: 'Hazy IPA Keg', quantity: 2, min: 2 },
      { product: 'Lager Keg', quantity: 2, min: 2 },
      { product: 'Camiseta', quantity: 15, min: 10 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-sm text-dark-300 mt-1">Control de stock, productos y barriles</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <RefreshCw size={16} /> Sincronizar
          </button>
          <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
            <Plus size={16} /> Nuevo Producto
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
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
            />
          </div>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Presentación</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Precio</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Costo</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Margen</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const margin = ((product.price - product.cost) / product.price * 100).toFixed(0);
                  return (
                    <tr key={product.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{presentationIcons[product.presentation]}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{product.name}</p>
                            <p className="text-xs text-dark-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-dark-300">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('badge capitalize', categoryColors[product.category])}>
                          {product.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-200 capitalize">{product.presentation}</span>
                        {product.volume && <span className="text-xs text-dark-400 ml-1">({product.volume})</span>}
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
                        <span className={cn(
                          'badge',
                          product.isActive ? 'badge-success' : 'badge-neutral'
                        )}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
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

      {/* Kegs Tab */}
      {activeTab === 'kegs' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Barril</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Tamaño</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Nivel</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Ubicación</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Temp</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Presión</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {kegs.map((keg) => (
                  <tr key={keg.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-beer-400">{keg.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{keg.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{keg.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all',
                              keg.remaining > 10 ? 'bg-green-500' : 
                              keg.remaining > 0 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${(keg.remaining / parseInt(keg.size)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-300">{keg.remaining}L</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{keg.truck}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-blue-400">{keg.temp > 0 ? `${keg.temp}°C` : '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-dark-200">{keg.pressure > 0 ? `${keg.pressure} PSI` : '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn('badge capitalize', kegStatusColors[keg.status])}>
                        {keg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock by Truck Tab */}
      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trucks.filter(t => t.status !== 'maintenance').map((truck) => (
            <div key={truck.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{truck.name}</h3>
                    <p className="text-xs text-dark-400">{truck.plate} · {truck.model}</p>
                  </div>
                </div>
                <span className={cn(
                  'badge',
                  truck.status === 'available' ? 'badge-success' :
                  truck.status === 'on_route' ? 'badge-info' :
                  truck.status === 'at_event' ? 'badge-warning' : 'badge-neutral'
                )}>
                  {truck.status === 'available' ? 'Disponible' :
                   truck.status === 'on_route' ? 'En Ruta' :
                   truck.status === 'at_event' ? 'En Evento' : truck.status}
                </span>
              </div>
              <div className="space-y-3">
                {(truckStock[truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1]] || truckStock['BT-01']).map((item, i) => {
                  const percentage = (item.quantity / item.min) * 100;
                  const isLow = item.quantity < item.min;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{item.product}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-medium', isLow ? 'text-red-400' : 'text-white')}>
                              {item.quantity}
                            </span>
                            <span className="text-xs text-dark-400">/ {item.min} min</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all',
                              percentage >= 100 ? 'bg-green-500' :
                              percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      {isLow && (
                        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {stockAlerts.map((alert) => {
            const product = products.find(p => p.id === alert.productId);
            return (
              <div key={alert.id} className={cn(
                'glass-card rounded-xl p-5 border-l-4',
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    )}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{product?.name}</h4>
                      <p className="text-xs text-dark-300 mt-0.5">
                        {alert.type === 'low_stock' ? 'Stock bajo en' : 
                         alert.type === 'out_of_stock' ? 'Sin stock en' :
                         alert.type === 'expiring' ? 'Próximo a vencer en' : 'Alerta en'} {alert.location}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-xs">
                          <span className="text-dark-400">Actual: </span>
                          <span className="text-white font-medium">{alert.currentStock}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-dark-400">Mínimo: </span>
                          <span className="text-white font-medium">{alert.minStock}</span>
                        </div>
                        <span className={cn(
                          'badge text-[10px] capitalize',
                          alert.severity === 'critical' ? 'badge-danger' :
                          alert.severity === 'high' ? 'badge-danger' :
                          alert.severity === 'medium' ? 'badge-warning' : 'badge-info'
                        )}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-dark-700 border border-white/5 rounded-lg text-xs text-dark-200 hover:text-white transition-colors">
                    Resolver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
