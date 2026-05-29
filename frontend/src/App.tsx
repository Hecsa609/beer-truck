import { useState } from 'react';
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
import { cn } from './utils/cn';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
      case 'crm/clients':
        return <ClientsView />;
      case 'crm/leads':
        return <LeadsView />;
      case 'crm/pipeline':
        return <LeadsView />;
      case 'crm/campaigns':
        return <CampaignsView />;
      case 'crm/loyalty':
        return <LoyaltyView />;
      case 'sales':
      case 'sales/pos':
        return <POSView />;
      case 'sales/orders':
      case 'sales/quotes':
      case 'sales/history':
        return <SalesHistoryView />;
      case 'inventory':
      case 'inventory/products':
      case 'inventory/kegs':
      case 'inventory/stock':
      case 'inventory/alerts':
      case 'inventory/transfers':
        return <InventoryView />;
      case 'events':
      case 'events/calendar':
      case 'events/list':
      case 'events/bookings':
        return <EventsView />;
      case 'logistics':
      case 'logistics/fleet':
      case 'logistics/routes':
      case 'logistics/map':
      case 'logistics/maintenance':
        return <LogisticsView />;
      case 'finance':
      case 'finance/overview':
      case 'finance/invoices':
      case 'finance/transactions':
      case 'finance/receivable':
        return <FinanceView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
      case 'users/list':
      case 'users/roles':
      case 'users/schedule':
        return <UsersView />;
      case 'support':
        return <SupportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Sidebar
        activeModule={activeModule}
        onNavigate={setActiveModule}
        collapsed={sidebarCollapsed}
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
  );
}