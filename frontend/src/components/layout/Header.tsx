import { useState } from 'react';
import { 
  Search, Bell, Menu, ChevronDown,
  LogOut, User, Settings, HelpCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { currentUser, notifications } from '../../data/mockData';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <header className={cn(
      'fixed top-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-[72px]' : 'left-[280px]'
    )}>
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className={cn(
          'relative flex items-center transition-all duration-300',
          searchFocused ? 'w-96' : 'w-72'
        )}>
          <Search size={16} className="absolute left-3 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar clientes, productos, eventos..."
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30 focus:ring-1 focus:ring-beer-500/20 transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:flex absolute right-3 items-center gap-0.5 px-1.5 py-0.5 bg-dark-700 rounded text-[10px] text-dark-400 border border-white/5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Quick stats */}
        <div className="hidden lg:flex items-center gap-4 mr-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
            <span className="text-xs text-dark-300">4 Trucks activos</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-xs text-dark-300">
            <span className="text-beer-400 font-semibold">$45,415</span> hoy
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
                <button className="text-xs text-beer-400 hover:text-beer-300">Marcar todo leído</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={cn(
                    'flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors',
                    !n.read && 'bg-beer-500/5'
                  )}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', !n.read ? 'text-white' : 'text-dark-200')}>{n.title}</p>
                      <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-dark-500 mt-1">Hace 2 horas</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-beer-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5">
                <button className="w-full text-center text-xs text-beer-400 hover:text-beer-300 py-1">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg gradient-beer flex items-center justify-center text-white text-sm font-bold">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none">{currentUser.name}</p>
              <p className="text-[11px] text-dark-400 mt-0.5 capitalize">{currentUser.role.replace(/_/g, ' ')}</p>
            </div>
            <ChevronDown size={14} className="text-dark-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-dark-400 mt-0.5">{currentUser.email}</p>
              </div>
              <div className="p-2">
                {[
                  { icon: <User size={16} />, label: 'Mi Perfil' },
                  { icon: <Settings size={16} />, label: 'Configuración' },
                  { icon: <HelpCircle size={16} />, label: 'Ayuda' },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-200 hover:text-white hover:bg-white/5 transition-all">
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
