import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ClientsView from './components/crm/ClientsView';
import LeadsView from './components/crm/LeadsView';
import CampaignsView from './components/crm/CampaignsView';
import LoyaltyView from './components/crm/LoyaltyView';
import POSView from './components/sales/POSView';
import SalesHistoryView from './components/sales/SalesHistoryView';
import InventoryView from './components/inventory/InventoryView';
import EventsView from './components/events/EventsView';
import LogisticsView from './components/logistics/LogisticsView';
import FinanceView from './components/finance/FinanceView';
import ReportsView from './components/reports/ReportsView';
import UsersView from './components/users/UsersView';
import SupportView from './components/support/SupportView';
import SettingsView from './components/settings/SettingsView';
import LoginView from './components/LoginView';
import { authAPI } from './api';
import { canAccess } from './permissions';
import { cn } from './utils/cn';
import InvoicesView from './components/finance/InvoicesView';

const getDefaultModuleForRole = (role: string) => {
  if (canAccess(role, 'dashboard')) return 'dashboard'
  if (canAccess(role, 'ventas')) return 'sales/pos'
  if (canAccess(role, 'inventario')) return 'inventory/products'
  if (canAccess(role, 'crm')) return 'crm/clients'
  if (canAccess(role, 'eventos')) return 'events/calendar'
  if (canAccess(role, 'logistica')) return 'logistics/routes'
  if (canAccess(role, 'finanzas')) return 'finance/overview'
  if (canAccess(role, 'reportes')) return 'reports'
  if (canAccess(role, 'usuarios')) return 'users/list'
  return 'support'
}

const getPermissionForModule = (module: string) => {
  if (module.startsWith('crm')) return 'crm'
  if (module.startsWith('sales')) return 'ventas'
  if (module.startsWith('inventory')) return 'inventario'
  if (module.startsWith('events')) return 'eventos'
  if (module.startsWith('logistics')) return 'logistica'
  if (module.startsWith('finance')) return 'finanzas'
  if (module.startsWith('reports')) return 'reportes'
  if (module.startsWith('users')) return 'usuarios'
  if (module.startsWith('settings')) return 'configuracion'
  if (module === 'dashboard') return 'dashboard'
  return null
}

const getAllowedActiveModule = (activeModule: string, role: string) => {
  if (activeModule === 'support' && role !== 'owner' && role !== 'admin') {
    return getDefaultModuleForRole(role)
  }
  const permission = getPermissionForModule(activeModule)
  if (!permission || canAccess(role, permission as any)) return activeModule
  return getDefaultModuleForRole(role)
}

const AccessDenied = ({ module }: { module: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
      <span className="text-4xl">🔒</span>
    </div>
    <h2 className="text-xl font-bold text-white mb-2">Acceso restringido</h2>
    <p className="text-dark-400 text-sm max-w-md">
      No tienes permisos para acceder al módulo de <strong className="text-white">{module}</strong>.
      Contacta al administrador si necesitas acceso.
    </p>
  </div>
)

export default function App() {
  const [activeModule, setActiveModule] = useState(() => {
    const user = authAPI.getUser()
    return getDefaultModuleForRole(user?.role || 'staff')
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated())

  // Escucha cuando cualquier llamada a la API detecta sesión expirada
  useEffect(() => {
    const handleExpired = () => {
      setIsAuthenticated(false)
      setActiveModule(getDefaultModuleForRole('staff'))
    }
    window.addEventListener('beer_truck_session_expired', handleExpired)
    return () => window.removeEventListener('beer_truck_session_expired', handleExpired)
  }, [])

  const handleLogin = () => {
    const user = authAPI.getUser()
    setActiveModule(getDefaultModuleForRole(user?.role || 'staff'))
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authAPI.logout()
    setActiveModule(getDefaultModuleForRole('staff'))
    setIsAuthenticated(false)
  }

  const user = authAPI.getUser()
  const role = user?.role || 'staff'
  const allowedActiveModule = getAllowedActiveModule(activeModule, role)

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (allowedActiveModule) {
      case 'dashboard':
        return canAccess(role, 'dashboard') ? <Dashboard /> : <AccessDenied module="Dashboard" />

      case 'crm':
      case 'crm/clients':
        return canAccess(role, 'crm') ? <ClientsView /> : <AccessDenied module="CRM - Clientes" />
      case 'crm/leads':
      case 'crm/pipeline':
        return canAccess(role, 'crm') ? <LeadsView /> : <AccessDenied module="CRM - Leads" />
      case 'crm/campaigns':
        return canAccess(role, 'crm') ? <CampaignsView /> : <AccessDenied module="CRM - Campañas" />
      case 'crm/loyalty':
        return canAccess(role, 'crm') ? <LoyaltyView /> : <AccessDenied module="Fidelización" />

      case 'sales':
      case 'sales/pos':
        return canAccess(role, 'ventas') ? <POSView /> : <AccessDenied module="Punto de Venta" />
      case 'sales/history':
        return canAccess(role, 'ventas') ? <SalesHistoryView /> : <AccessDenied module="Historial de Ventas" />
      case 'sales/orders':
      case 'sales/quotes':
        return canAccess(role, 'ventas') ? <POSView /> : <AccessDenied module="Ventas" />

      case 'inventory':
      case 'inventory/products':
      case 'inventory/kegs':
      case 'inventory/stock':
      case 'inventory/alerts':
      case 'inventory/transfers':
        return canAccess(role, 'inventario') ? <InventoryView /> : <AccessDenied module="Inventario" />

      case 'events':
      case 'events/calendar':
      case 'events/list':
      case 'events/bookings':
        return canAccess(role, 'eventos') ? <EventsView /> : <AccessDenied module="Eventos" />

      case 'logistics':
      case 'logistics/fleet':
      case 'logistics/routes':
      case 'logistics/map':
      case 'logistics/maintenance':
        return canAccess(role, 'logistica') ? <LogisticsView /> : <AccessDenied module="Logística" />

      case 'finance/invoices':
        return canAccess(role, 'finanzas') ? <InvoicesView /> : <AccessDenied module="Facturas" />
      case 'finance':
      case 'finance/overview':
      case 'finance/transactions':
      case 'finance/payable':
      case 'finance/bank':
      case 'finance/assets':
        return canAccess(role, 'finanzas') ? <FinanceView /> : <AccessDenied module="Finanzas" />

      case 'reports':
        return canAccess(role, 'reportes') ? <ReportsView /> : <AccessDenied module="Reportes" />

      case 'users':
      case 'users/list':
      case 'users/roles':
      case 'users/schedule':
        return canAccess(role, 'usuarios') ? <UsersView /> : <AccessDenied module="Usuarios" />

      case 'support':
        return <SupportView />

      case 'settings':
      case 'settings/general':
      case 'settings/company':
      case 'settings/notifications':
      case 'settings/security':
      case 'settings/billing':
      case 'settings/integrations':
        return canAccess(role, 'configuracion') ? <SettingsView /> : <AccessDenied module="Configuración" />

      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Sidebar
        activeModule={allowedActiveModule}
        onNavigate={setActiveModule}
        collapsed={sidebarCollapsed}
        userRole={role}
      />
      <Header
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={handleLogout}
      />
      <main className={cn(
        'pt-16 min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'pl-[72px]' : 'pl-[280px]'
      )}>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}