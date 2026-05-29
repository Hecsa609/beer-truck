import { useState, useEffect } from 'react';
import {
  Search, Plus, Mail, Phone, Eye, Edit,
  User, Building2, TrendingUp, Users, RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { customersAPI } from '../../api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  rfc: string;
  address: string;
  city: string;
  customer_type: string;
  notes: string;
  active: boolean;
  created_at: string;
}

export default function ClientsView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    city: '', customer_type: 'regular', notes: ''
  });

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await customersAPI.getAll()
      setCustomers(data.customers)
    } catch (err) {
      console.error('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleSave = async () => {
    if (!formData.name) return
    setSaving(true)
    try {
      await customersAPI.create(formData)
      await loadCustomers()
      setShowForm(false)
      setFormData({ name: '', email: '', phone: '', city: '', customer_type: 'regular', notes: '' })
    } catch (err) {
      console.error('Error guardando cliente')
    } finally {
      setSaving(false)
    }
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
    const matchesType = filterType === 'all' || c.customer_type === filterType
    return matchesSearch && matchesType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
  }

  const typeColors: Record<string, string> = {
    empresa: 'badge-info',
    regular: 'badge-success',
    vip: 'badge-warning',
    evento: 'badge-neutral'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona tu base de clientes reales</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCustomers}
            className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
          <h3 className="text-base font-semibold text-white mb-4">Nuevo Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo o empresa"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="55 1234 5678"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Ciudad</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ciudad de México"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Tipo</label>
              <select
                value={formData.customer_type}
                onChange={e => setFormData({ ...formData, customer_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none focus:border-beer-500/30"
              >
                <option value="regular">Regular</option>
                <option value="empresa">Empresa</option>
                <option value="vip">VIP</option>
                <option value="evento">Evento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Notas</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {saving ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Clientes</p>
              <p className="text-xl font-bold text-white">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Activos</p>
              <p className="text-xl font-bold text-white">{customers.filter(c => c.active).length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Empresas</p>
              <p className="text-xl font-bold text-white">{customers.filter(c => c.customer_type === 'empresa').length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">VIP</p>
              <p className="text-xl font-bold text-white">{customers.filter(c => c.customer_type === 'vip').length}</p>
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
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none"
          >
            <option value="all">Todos los tipos</option>
            <option value="regular">Regular</option>
            <option value="empresa">Empresa</option>
            <option value="vip">VIP</option>
            <option value="evento">Evento</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-dark-400">Cargando clientes...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Ciudad</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Notas</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-dark-400">
                      {customers.length === 0 ? 'No hay clientes aún. ¡Agrega el primero!' : 'No se encontraron clientes'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="table-row border-b border-white/3">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            {customer.customer_type === 'empresa' ? <Building2 size={18} /> : <User size={18} />}
                          </div>
                          <p className="text-sm font-medium text-white">{customer.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-dark-300">
                              <Mail size={12} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-xs text-dark-300">
                              <Phone size={12} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-300">{customer.city || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('badge capitalize', typeColors[customer.customer_type] || 'badge-neutral')}>
                          {customer.customer_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge', customer.active ? 'badge-success' : 'badge-neutral')}>
                          {customer.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-dark-400">{customer.notes || '—'}</span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-xs text-dark-400">Mostrando {filteredCustomers.length} de {customers.length} clientes</p>
          </div>
        </div>
      )}
    </div>
  )
}