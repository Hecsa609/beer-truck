import { useState, useEffect } from 'react';
import {
  Shield, Plus, Search, Mail, Eye,
  Users, RefreshCw, Check, X, Edit, Save
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

const ROLES = [
  { value: 'owner', label: 'Propietario' },
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'staff', label: 'Staff' },
  { value: 'bartender', label: 'Bartender' },
  { value: 'chofer', label: 'Chofer' },
  { value: 'vendedor', label: 'Vendedor' },
]

const roleColors: Record<string, string> = {
  owner: 'bg-purple-500/20 text-purple-400',
  admin: 'bg-red-500/20 text-red-400',
  gerente: 'bg-blue-500/20 text-blue-400',
  staff: 'bg-green-500/20 text-green-400',
  bartender: 'bg-orange-500/20 text-orange-400',
  chofer: 'bg-cyan-500/20 text-cyan-400',
  vendedor: 'bg-teal-500/20 text-teal-400',
}

const rolePermissions: Record<string, string[]> = {
  owner: ['Todos los módulos', 'Configuración', 'Facturación', 'Reportes'],
  admin: ['CRM', 'Ventas', 'Inventario', 'Eventos', 'Usuarios'],
  gerente: ['Inventario', 'Eventos', 'Reportes'],
  staff: ['POS', 'Inventario (lectura)'],
  bartender: ['POS', 'Inventario (lectura)'],
  chofer: ['Logística', 'Rutas', 'GPS'],
  vendedor: ['POS', 'Clientes', 'Cotizaciones'],
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'roles' | 'new'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', phone: '' })
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'staff', phone: ''
  })

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

  useEffect(() => { loadUsers() }, [])

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

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ name: user.name || '', role: user.role, phone: user.phone || '' })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess('Usuario actualizado correctamente')
      setEditingUser(null)
      await loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Error actualizando usuario')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <button onClick={() => setActiveTab('new')}
            className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Success/Error */}
      {success && (
        <div className="glass-card rounded-xl p-4 border border-green-500/20 flex items-center gap-3">
          <Check size={16} className="text-green-400" />
          <span className="text-sm text-green-400">{success}</span>
        </div>
      )}
      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/20 flex items-center gap-3">
          <X size={16} className="text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
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
              <p className="text-xl font-bold text-white">{ROLES.length}</p>
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
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modal Ver Usuario */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-white">Detalle del Usuario</h3>
              <button onClick={() => setViewingUser(null)} className="text-dark-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold',
                roleColors[viewingUser.role] || 'bg-dark-700 text-dark-300')}>
                {(viewingUser.name || viewingUser.email)[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{viewingUser.name || '—'}</h4>
                <span className={cn('badge text-xs', roleColors[viewingUser.role] || 'badge-neutral')}>
                  {ROLES.find(r => r.value === viewingUser.role)?.label || viewingUser.role}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Email</span>
                <span className="text-sm text-white">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Teléfono</span>
                <span className="text-sm text-white">{viewingUser.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Estado</span>
                <span className={cn('text-sm font-medium', viewingUser.active ? 'text-green-400' : 'text-red-400')}>
                  {viewingUser.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Creado</span>
                <span className="text-sm text-white">{formatDate(viewingUser.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Último acceso</span>
                <span className="text-sm text-white">{formatDate(viewingUser.last_sign_in)}</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-dark-400 mb-2">Accesos del rol:</p>
              <div className="flex flex-wrap gap-1">
                {(rolePermissions[viewingUser.role] || []).map((perm, i) => (
                  <span key={i} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">{perm}</span>
                ))}
              </div>
            </div>
            <button onClick={() => { setViewingUser(null); handleEdit(viewingUser) }}
              className="w-full mt-4 py-2.5 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Edit size={16} /> Editar este usuario
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-white">Editar Usuario</h3>
              <button onClick={() => setEditingUser(null)} className="text-dark-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Email</label>
                <p className="text-sm text-dark-300 px-4 py-2.5 bg-dark-700 rounded-xl">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Nombre</label>
                <input type="text" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Teléfono</label>
                <input type="text" value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="55 1234 5678"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Rol</label>
                <select value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none focus:border-beer-500/30"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="glass-card rounded-xl p-3 mt-2">
                <p className="text-xs text-dark-400 mb-2">Accesos del rol seleccionado:</p>
                <div className="flex flex-wrap gap-1">
                  {(rolePermissions[editForm.role] || []).map((perm, i) => (
                    <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-300">{perm}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 py-2.5 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="glass-card rounded-xl p-3">
              <p className="text-xs text-dark-400 mb-2">Accesos del rol:</p>
              <div className="flex flex-wrap gap-1">
                {(rolePermissions[formData.role] || []).map((perm, i) => (
                  <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-300">{perm}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setActiveTab('list')}
              className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving || !formData.email || !formData.password}
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
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{user.name || '—'}</h3>
                        <span className={cn('badge text-[10px]', roleColors[user.role] || 'badge-neutral')}>
                          {ROLES.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      </div>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full mt-1', user.active ? 'bg-green-500' : 'bg-gray-500')} />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <Mail size={12} /> {user.email}
                    </div>
                    <div className="text-xs text-dark-400">Creado: {formatDate(user.created_at)}</div>
                    <div className="text-xs text-dark-400">Último acceso: {formatDate(user.last_sign_in)}</div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => setViewingUser(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors text-xs"
                    >
                      <Eye size={13} /> Ver
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-beer-500/20 hover:bg-beer-500/30 text-beer-400 hover:text-beer-300 transition-colors text-xs"
                    >
                      <Edit size={13} /> Editar
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
          {ROLES.map((role) => (
            <div key={role.value} className="glass-card rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  roleColors[role.value] || 'bg-dark-700 text-dark-300')}>
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{role.label}</h4>
                    <span className="text-xs text-dark-400">
                      {users.filter(u => u.role === role.value).length} usuarios
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(rolePermissions[role.value] || []).map((perm, i) => (
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