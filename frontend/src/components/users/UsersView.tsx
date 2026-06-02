import { useState, useEffect } from 'react';
import {
  Shield, Plus, Search, Mail, Eye, Edit,
  Users, RefreshCw, Check, X
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  active: boolean;
  created_at: string;
  last_sign_in: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const getToken = () => localStorage.getItem('beer_truck_token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'roles' | 'new'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'staff', phone: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users`, { headers: authHeaders() })
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = async () => {
    if (!formData.email || !formData.password) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess('Usuario creado correctamente')
      await loadUsers()
      setActiveTab('list')
      setFormData({ name: '', email: '', password: '', role: 'staff', phone: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Error creando usuario')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roleColors: Record<string, string> = {
    owner: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-red-500/20 text-red-400',
    gerente: 'bg-blue-500/20 text-blue-400',
    staff: 'bg-green-500/20 text-green-400',
    bartender: 'bg-orange-500/20 text-orange-400',
    chofer: 'bg-cyan-500/20 text-cyan-400',
    vendedor: 'bg-teal-500/20 text-teal-400',
  }

  const roles = [
    { name: 'owner', label: 'Propietario', description: 'Acceso completo al sistema', permissions: ['Todos los módulos', 'Configuración', 'Facturación', 'Reportes'] },
    { name: 'admin', label: 'Administrador', description: 'Gestión completa excepto configuración financiera', permissions: ['CRM', 'Ventas', 'Inventario', 'Eventos', 'Usuarios'] },
    { name: 'gerente', label: 'Gerente', description: 'Supervisión de operaciones', permissions: ['Inventario', 'Eventos', 'Reportes'] },
    { name: 'staff', label: 'Staff', description: 'Operación del punto de venta', permissions: ['POS', 'Inventario (lectura)'] },
    { name: 'bartender', label: 'Bartender', description: 'Operación del punto de venta', permissions: ['POS', 'Inventario (lectura)'] },
    { name: 'chofer', label: 'Chofer', description: 'Operación de vehículo', permissions: ['Rutas', 'GPS'] },
    { name: 'vendedor', label: 'Vendedor', description: 'Ventas y clientes', permissions: ['POS', 'Clientes', 'Cotizaciones'] },
  ]

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios y Roles</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona el acceso a tu plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadUsers} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="glass-card rounded-xl p-4 border border-green-500/20 flex items-center gap-3">
          <Check size={16} className="text-green-400" />
          <span className="text-sm text-green-400">{success}</span>
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
              <p className="text-xs text-dark-400">Total Usuarios</p>
              <p className="text-xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <Check size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Activos</p>
              <p className="text-xl font-bold text-white">{users.filter(u => u.active).length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Roles</p>
              <p className="text-xl font-bold text-white">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Admins</p>
              <p className="text-xl font-bold text-white">
                {users.filter(u => ['owner', 'admin'].includes(u.role)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl w-fit">
        {[
          { id: 'list', label: 'Usuarios' },
          { id: 'roles', label: 'Roles y Permisos' },
          { id: 'new', label: '+ Nuevo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New User Form */}
      {activeTab === 'new' && (
        <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
          <h3 className="text-base font-semibold text-white mb-4">Crear nuevo usuario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Nombre</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Email *</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@beertruck.mx"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Contraseña *</label>
              <input type="password" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Teléfono</label>
              <input type="text" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="55 1234 5678"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Rol</label>
              <select value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none"
              >
                {roles.map(r => (
                  <option key={r.name} value={r.name}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <X size={14} className="text-red-400" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setActiveTab('list')}
              className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreate}
              disabled={saving || !formData.email || !formData.password}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      {activeTab === 'list' && (
        <>
          <div className="glass-card rounded-xl p-4">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="Buscar usuario..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
              />
            </div>
          </div>

          {loading ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-dark-400">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg',
                        roleColors[user.role] || 'bg-dark-700 text-dark-300'
                      )}>
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{user.name || '—'}</h3>
                        <span className={cn('badge text-[10px]', roleColors[user.role] || 'badge-neutral')}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full mt-1', user.active ? 'bg-green-500' : 'bg-gray-500')} />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <Mail size={12} /> {user.email}
                    </div>
                    <div className="text-xs text-dark-400">
                      Creado: {formatDate(user.created_at)}
                    </div>
                    <div className="text-xs text-dark-400">
                      Último acceso: {formatDate(user.last_sign_in)}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Eye size={15} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="glass-card rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', roleColors[role.name] || 'bg-dark-700 text-dark-300')}>
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{role.label}</h4>
                    <span className="text-xs text-dark-400">
                      {users.filter(u => u.role === role.name).length} usuarios
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">{role.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {role.permissions.map((perm, i) => (
                      <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-300">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}