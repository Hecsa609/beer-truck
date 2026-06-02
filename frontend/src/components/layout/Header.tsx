import { useState } from 'react';
import {
  Search, Bell, Menu, ChevronDown,
  LogOut, User, Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { authAPI } from '../../api';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onLogout: () => void;
}

export default function Header({ onToggleSidebar, sidebarCollapsed, onLogout }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const user = authAPI.getUser()
  const userName = user?.email?.split('@')[0] || 'Usuario'
  const userRole = user?.role || 'staff'
  const userInitial = userName[0].toUpperCase()

  const roleLabels: Record<string, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    comercial: 'Comercial',
    administrativo: 'Administrativo',
    operador: 'Operador',
    staff: 'Staff',
    bartender: 'Bartender',
    chofer: 'Chofer',
    vendedor: 'Vendedor',
  }

  return (
    <header className={cn(
      'fixed top-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-[72px]' : 'left-[280px]'
    )}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
        </button>
        <div className={cn(
          'relative flex items-center transition-all duration-300',
          searchFocused ? 'w-96' : 'w-72'
        )}>
          <Search size={16} className="absolute left-3 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar clientes, productos, eventos..."
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30 transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-4 mr-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-dark-300">Sistema activo</span>
          </div>
        </div>

        {/* Notifications placeholder */}
        <button className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-all">
          <Bell size={20} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg gradient-beer flex items-center justify-center text-white text-sm font-bold">
              {userInitial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none capitalize">{userName}</p>
              <p className="text-[11px] text-dark-400 mt-0.5">{roleLabels[userRole] || userRole}</p>
            </div>
            <ChevronDown size={14} className="text-dark-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-semibold text-white capitalize">{userName}</p>
                <p className="text-xs text-dark-400 mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-beer-500/20 rounded text-[10px] text-beer-400">
                  {roleLabels[userRole] || userRole}
                </span>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-200 hover:text-white hover:bg-white/5 transition-all">
                  <User size={16} /> Mi Perfil
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-200 hover:text-white hover:bg-white/5 transition-all">
                  <Settings size={16} /> Configuración
                </button>
              </div>
              <div className="p-2 border-t border-white/5">
                <button
                  onClick={() => { setShowProfile(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}