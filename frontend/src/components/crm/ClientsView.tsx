import { useState } from 'react';
import { 
  Search, Plus, Download, Upload, MoreHorizontal, 
  Mail, Phone, Star, Eye, Edit,
  User, Building2, TrendingUp, Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { clients } from '../../data/mockData';

export default function ClientsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSegment = filterSegment === 'all' || client.segment === filterSegment;
    const matchesType = filterType === 'all' || client.type === filterType;
    return matchesSearch && matchesSegment && matchesType;
  });

  const segmentColors: Record<string, string> = {
    vip: 'badge-warning',
    regular: 'badge-info',
    new: 'badge-success',
    inactive: 'badge-neutral'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalPurchases, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const vipClients = clients.filter(c => c.segment === 'vip').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona tu base de clientes y relaciones comerciales</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <Upload size={16} /> Importar
          </button>
          <button className="px-4 py-2 bg-dark-700 border border-white/5 rounded-xl text-sm text-dark-200 hover:text-white hover:bg-dark-600 transition-all flex items-center gap-2">
            <Download size={16} /> Exportar
          </button>
          <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Clientes</p>
              <p className="text-xl font-bold text-white">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Activos</p>
              <p className="text-xl font-bold text-white">{activeClients}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">VIP</p>
              <p className="text-xl font-bold text-white">{vipClients}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Revenue Total</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none focus:border-beer-500/30 appearance-none cursor-pointer"
            >
              <option value="all">Todos los segmentos</option>
              <option value="vip">VIP</option>
              <option value="regular">Regular</option>
              <option value="new">Nuevo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none focus:border-beer-500/30 appearance-none cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporativo</option>
            </select>
            <div className="flex items-center bg-dark-800 border border-white/5 rounded-xl overflow-hidden">
              <button 
                onClick={() => setViewMode('table')}
                className={cn('p-2.5 transition-colors', viewMode === 'table' ? 'bg-beer-500/20 text-beer-400' : 'text-dark-400 hover:text-white')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="16" height="3" rx="1"/><rect x="0" y="6.5" width="16" height="3" rx="1"/><rect x="0" y="13" width="16" height="3" rx="1"/></svg>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn('p-2.5 transition-colors', viewMode === 'grid' ? 'bg-beer-500/20 text-beer-400' : 'text-dark-400 hover:text-white')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="7" height="7" rx="1"/><rect x="9" y="0" width="7" height="7" rx="1"/><rect x="0" y="9" width="7" height="7" rx="1"/><rect x="9" y="9" width="7" height="7" rx="1"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Segmento</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Compras Totales</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Puntos</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm',
                          client.type === 'corporate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        )}>
                          {client.type === 'corporate' ? <Building2 size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{client.name}</p>
                          {client.company && <p className="text-xs text-dark-400">{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-dark-300">
                          <Mail size={12} /> {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-dark-300">
                          <Phone size={12} /> {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-neutral capitalize">{client.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('badge capitalize', segmentColors[client.segment])}>
                        {client.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-white">{formatCurrency(client.totalPurchases)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-beer-400 font-medium">{client.loyaltyPoints.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'badge',
                        client.status === 'active' ? 'badge-success' : 'badge-neutral'
                      )}>
                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
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
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-xs text-dark-400">Mostrando {filteredClients.length} de {clients.length} clientes</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-dark-700 border border-white/5 rounded-lg text-xs text-dark-300 hover:text-white transition-colors">Anterior</button>
              <button className="px-3 py-1.5 bg-beer-500/20 border border-beer-500/30 rounded-lg text-xs text-beer-400 font-medium">1</button>
              <button className="px-3 py-1.5 bg-dark-700 border border-white/5 rounded-lg text-xs text-dark-300 hover:text-white transition-colors">Siguiente</button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold',
                  client.type === 'corporate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                )}>
                  {client.type === 'corporate' ? <Building2 size={22} /> : <User size={22} />}
                </div>
                <span className={cn('badge capitalize', segmentColors[client.segment])}>{client.segment}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-0.5">{client.name}</h3>
              {client.company && <p className="text-xs text-dark-400 mb-3">{client.company}</p>}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <Mail size={12} /> {client.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <Phone size={12} /> {client.phone}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-dark-400">Total Compras</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(client.totalPurchases)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-dark-400">Puntos</p>
                  <p className="text-sm font-semibold text-beer-400">{client.loyaltyPoints.toLocaleString()}</p>
                </div>
              </div>
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {client.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-300">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
