import { useState } from 'react';
import { 
  Shield, Clock, Plus, Search, Mail, Phone,
  MoreHorizontal, Eye, Edit, Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { users } from '../../data/mockData';

export default function UsersView() {
  const [activeTab, setActiveTab] = useState<'list' | 'roles' | 'schedule'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'list' as const, label: 'Usuarios', icon: <Users size={16} />, count: users.length },
    { id: 'roles' as const, label: 'Roles y Permisos', icon: <Shield size={16} /> },
    { id: 'schedule' as const, label: 'Turnos', icon: <Clock size={16} /> },
  ];

  const roleLabels: Record<string, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    gerente_operativo: 'Gerente Operativo',
    gerente_comercial: 'Gerente Comercial',
    finanzas: 'Finanzas',
    supervisor_eventos: 'Supervisor de Eventos',
    bartender: 'Bartender',
    chofer: 'Chofer',
    vendedor: 'Vendedor',
    almacen: 'Almacén',
    soporte: 'Soporte',
    cliente_final: 'Cliente Final',
    cliente_corporativo: 'Cliente Corporativo'
  };

  const roleColors: Record<string, string> = {
    owner: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-red-500/20 text-red-400',
    gerente_operativo: 'bg-blue-500/20 text-blue-400',
    gerente_comercial: 'bg-green-500/20 text-green-400',
    finanzas: 'bg-yellow-500/20 text-yellow-400',
    supervisor_eventos: 'bg-indigo-500/20 text-indigo-400',
    bartender: 'bg-orange-500/20 text-orange-400',
    chofer: 'bg-cyan-500/20 text-cyan-400',
    vendedor: 'bg-teal-500/20 text-teal-400',
    almacen: 'bg-gray-500/20 text-gray-400',
    soporte: 'bg-pink-500/20 text-pink-400',
    cliente_final: 'bg-emerald-500/20 text-emerald-400',
    cliente_corporativo: 'bg-amber-500/20 text-amber-400'
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roleLabels[u.role].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Roles and permissions
  const roles = [
    { name: 'owner', label: 'Propietario', description: 'Acceso completo al sistema', users: 1, permissions: ['Todos los módulos', 'Configuración', 'Facturación', 'Reportes'] },
    { name: 'admin', label: 'Administrador', description: 'Gestión completa excepto configuración financiera', users: 0, permissions: ['CRM', 'Ventas', 'Inventario', 'Eventos', 'Logística', 'Usuarios'] },
    { name: 'gerente_operativo', label: 'Gerente Operativo', description: 'Supervisión de operaciones diarias', users: 1, permissions: ['Inventario', 'Eventos', 'Logística', 'Reportes operativos'] },
    { name: 'gerente_comercial', label: 'Gerente Comercial', description: 'Gestión de ventas y clientes', users: 1, permissions: ['CRM', 'Ventas', 'Cotizaciones', 'Reportes comerciales'] },
    { name: 'finanzas', label: 'Finanzas', description: 'Gestión financiera y facturación', users: 1, permissions: ['Facturas', 'Transacciones', 'Cuentas por cobrar', 'Reportes financieros'] },
    { name: 'supervisor_eventos', label: 'Supervisor de Eventos', description: 'Coordinación de eventos y catering', users: 1, permissions: ['Eventos', 'Logística', 'Staff', 'Equipamiento'] },
    { name: 'bartender', label: 'Bartender', description: 'Operación del punto de venta', users: 1, permissions: ['POS', 'Inventario (lectura)', 'Barriles'] },
    { name: 'chofer', label: 'Chofer', description: 'Operación de vehículo y rutas', users: 1, permissions: ['Rutas', 'GPS', 'Check-in/out'] },
    { name: 'vendedor', label: 'Vendedor', description: 'Ventas y seguimiento de clientes', users: 1, permissions: ['POS', 'Clientes', 'Cotizaciones'] },
    { name: 'almacen', label: 'Almacén', description: 'Gestión de inventario y stock', users: 1, permissions: ['Inventario', 'Transferencias', 'Recepción'] },
  ];

  // Mock schedule data
  const scheduleData = [
    { name: 'Pedro Hernández', role: 'Chofer', shift: 'Matutino', time: '06:00 - 14:00', truck: 'BT-02', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
    { name: 'Laura Díaz', role: 'Bartender', shift: 'Vespertino', time: '14:00 - 22:00', truck: 'BT-01', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] },
    { name: 'Miguel Torres', role: 'Vendedor', shift: 'Completo', time: '09:00 - 18:00', truck: 'Todos', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
    { name: 'Roberto Sánchez', role: 'Supervisor', shift: 'Variable', time: 'Según evento', truck: 'Asignado', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios y Roles</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona usuarios, permisos y turnos</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nuevo Usuario
        </button>
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
            {tab.count && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                activeTab === tab.id ? 'bg-beer-500/20 text-beer-400' : 'bg-dark-700 text-dark-400'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users List Tab */}
      {activeTab === 'list' && (
        <>
          <div className="glass-card rounded-xl p-4">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="glass-card-hover rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold', roleColors[user.role])}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{user.name}</h3>
                      <span className={cn('badge text-[10px]', roleColors[user.role])}>
                        {roleLabels[user.role]}
                      </span>
                    </div>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <Mail size={12} /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <Phone size={12} /> {user.phone}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      user.status === 'active' ? 'bg-green-500' : 
                      user.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                    )} />
                    <span className="text-xs text-dark-400 capitalize">
                      {user.status === 'active' ? 'Activo' : 
                       user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Eye size={15} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', roleColors[role.name])}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{role.label}</h4>
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
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{role.users}</p>
                    <p className="text-[10px] text-dark-400">usuarios</p>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                    <Edit size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-base font-semibold text-white">Turnos de la Semana</h3>
            <p className="text-xs text-dark-400 mt-0.5">Horarios asignados del personal operativo</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Turno</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Horario</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Truck</th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Días</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((schedule, i) => (
                  <tr key={i} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">{schedule.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{schedule.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'badge',
                        schedule.shift === 'Matutino' ? 'badge-warning' :
                        schedule.shift === 'Vespertino' ? 'badge-info' :
                        schedule.shift === 'Completo' ? 'badge-success' : 'badge-neutral'
                      )}>
                        {schedule.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{schedule.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">{schedule.truck}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                          <span key={day} className={cn(
                            'w-7 h-7 rounded text-[10px] flex items-center justify-center font-medium',
                            schedule.days.includes(day) 
                              ? 'bg-beer-500/20 text-beer-400' 
                              : 'bg-dark-700 text-dark-500'
                          )}>
                            {day.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
