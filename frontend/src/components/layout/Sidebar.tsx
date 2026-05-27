import { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, Calendar, 
  Truck, DollarSign, BarChart3, Settings, ChevronDown, 
  ChevronRight, Beer, UserCircle, Headphones, Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  collapsed: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: { id: string; label: string; badge?: string | number }[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { 
    id: 'crm', label: 'CRM', icon: <Users size={20} />,
    children: [
      { id: 'crm/clients', label: 'Clientes' },
      { id: 'crm/leads', label: 'Leads', badge: '5' },
      { id: 'crm/pipeline', label: 'Pipeline' },
      { id: 'crm/campaigns', label: 'Campañas' },
      { id: 'crm/loyalty', label: 'Fidelización' },
    ]
  },
  { 
    id: 'sales', label: 'Ventas', icon: <ShoppingCart size={20} />,
    children: [
      { id: 'sales/pos', label: 'POS' },
      { id: 'sales/orders', label: 'Pedidos' },
      { id: 'sales/quotes', label: 'Cotizaciones' },
      { id: 'sales/history', label: 'Historial' },
    ]
  },
  { 
    id: 'inventory', label: 'Inventario', icon: <Package size={20} />, badge: '!',
    children: [
      { id: 'inventory/products', label: 'Productos' },
      { id: 'inventory/kegs', label: 'Barriles' },
      { id: 'inventory/stock', label: 'Stock por Truck' },
      { id: 'inventory/alerts', label: 'Alertas', badge: '3' },
      { id: 'inventory/transfers', label: 'Transferencias' },
    ]
  },
  { 
    id: 'events', label: 'Eventos', icon: <Calendar size={20} />,
    children: [
      { id: 'events/calendar', label: 'Calendario' },
      { id: 'events/list', label: 'Lista de Eventos' },
      { id: 'events/bookings', label: 'Reservas', badge: '2' },
    ]
  },
  { 
    id: 'logistics', label: 'Logística', icon: <Truck size={20} />,
    children: [
      { id: 'logistics/fleet', label: 'Flotilla' },
      { id: 'logistics/routes', label: 'Rutas' },
      { id: 'logistics/map', label: 'Mapa en Vivo' },
      { id: 'logistics/maintenance', label: 'Mantenimiento' },
    ]
  },
  { 
    id: 'finance', label: 'Finanzas', icon: <DollarSign size={20} />,
    children: [
      { id: 'finance/overview', label: 'Resumen' },
      { id: 'finance/invoices', label: 'Facturas' },
      { id: 'finance/transactions', label: 'Transacciones' },
      { id: 'finance/receivable', label: 'Cuentas por Cobrar' },
    ]
  },
  { id: 'reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
  { 
    id: 'users', label: 'Usuarios', icon: <UserCircle size={20} />,
    children: [
      { id: 'users/list', label: 'Lista de Usuarios' },
      { id: 'users/roles', label: 'Roles y Permisos' },
      { id: 'users/schedule', label: 'Turnos' },
    ]
  },
  { id: 'support', label: 'Soporte', icon: <Headphones size={20} />, badge: '2' },
  { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function Sidebar({ activeModule, onNavigate, collapsed }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['crm', 'sales']);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (id: string) => activeModule === id;
  const isParentActive = (item: MenuItem) => 
    item.children?.some(c => activeModule === c.id) || activeModule === item.id;

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-dark-900 border-r border-white/5 flex flex-col z-50 transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-[280px]'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl gradient-beer flex items-center justify-center flex-shrink-0">
            <Beer size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">BEER TRUCK</h1>
              <p className="text-[10px] text-dark-300 font-medium tracking-wider">ERP + CRM PLATFORM</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={cn(
                  'sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isParentActive(item) 
                    ? 'text-beer-400 bg-beer-500/10 active' 
                    : 'text-dark-200 hover:text-white hover:bg-white/5',
                  collapsed && 'justify-center px-0'
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  isParentActive(item) ? 'text-beer-400' : 'text-dark-400'
                )}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'badge text-[10px] px-1.5 py-0.5',
                        item.badge === '!' ? 'badge-danger' : 'badge-warning'
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <span className="text-dark-400">
                        {expandedItems.includes(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </>
                )}
              </button>
              
              {item.children && expandedItems.includes(item.id) && !collapsed && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all',
                        isActive(child.id)
                          ? 'text-beer-400 bg-beer-500/10'
                          : 'text-dark-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="truncate">{child.label}</span>
                      {child.badge && (
                        <span className="badge badge-warning text-[10px] px-1.5 py-0.5">
                          {child.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5">
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-beer-400" />
              <span className="text-xs font-medium text-beer-400">Plan Enterprise</span>
            </div>
            <p className="text-[11px] text-dark-300 mb-2">Acceso completo a todos los módulos</p>
            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full w-[65%] gradient-beer rounded-full" />
            </div>
            <p className="text-[10px] text-dark-400 mt-1">65% del ciclo de facturación</p>
          </div>
        </div>
      )}
    </aside>
  );
}
