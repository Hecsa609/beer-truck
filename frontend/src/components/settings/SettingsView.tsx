import { useState } from 'react';
import { 
  Settings, Building2, Bell, Shield, Globe,
  CreditCard, Save
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'company', label: 'Empresa', icon: <Building2 size={18} /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} /> },
    { id: 'security', label: 'Seguridad', icon: <Shield size={18} /> },
    { id: 'billing', label: 'Facturación', icon: <CreditCard size={18} /> },
    { id: 'integrations', label: 'Integraciones', icon: <Globe size={18} /> },
  ];

  const integrations = [
    { name: 'Stripe', description: 'Pasarela de pagos', status: 'connected', icon: '💳' },
    { name: 'PayPal', description: 'Pagos internacionales', status: 'connected', icon: '🅿️' },
    { name: 'Mercado Pago', description: 'Pagos LATAM', status: 'disconnected', icon: '💙' },
    { name: 'WhatsApp Business', description: 'Mensajería y ventas', status: 'connected', icon: '💬' },
    { name: 'Google Maps', description: 'Geolocalización', status: 'connected', icon: '🗺️' },
    { name: 'QuickBooks', description: 'Contabilidad', status: 'disconnected', icon: '📊' },
    { name: 'Shopify', description: 'E-commerce', status: 'disconnected', icon: '🛒' },
    { name: 'Twilio', description: 'SMS y llamadas', status: 'connected', icon: '📱' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-dark-300 mt-1">Administra la configuración del sistema</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="glass-card rounded-xl p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  activeSection === section.id
                    ? 'bg-beer-500/10 text-beer-400'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'general' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Configuración General</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Nombre de la Empresa</label>
                  <input type="text" defaultValue="BEER TRUCK MX" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-dark-300 mb-2 block">Moneda</label>
                    <select className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none">
                      <option>MXN - Peso Mexicano</option>
                      <option>USD - Dólar Americano</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-dark-300 mb-2 block">Zona Horaria</label>
                    <select className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none">
                      <option>America/Mexico_City (GMT-6)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Idioma</label>
                  <select className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none">
                    <option>Español (México)</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Tasa de IVA (%)</label>
                  <input type="number" defaultValue="16" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                </div>
              </div>

              <button className="px-6 py-2.5 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          )}

          {activeSection === 'company' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Información de la Empresa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">RFC</label>
                  <input type="text" defaultValue="BTM230101ABC" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Razón Social</label>
                  <input type="text" defaultValue="Beer Truck México S.A. de C.V." className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Dirección Fiscal</label>
                  <input type="text" defaultValue="Av. Reforma 123, Col. Centro, CDMX" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-dark-300 mb-2 block">Teléfono</label>
                    <input type="text" defaultValue="+52 55 1234 5678" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-300 mb-2 block">Email</label>
                    <input type="email" defaultValue="contacto@beertruck.mx" className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Régimen Fiscal</label>
                  <select className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none">
                    <option>Régimen General de Ley Personas Morales</option>
                  </select>
                </div>
              </div>

              <button className="px-6 py-2.5 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center gap-2">
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Preferencias de Notificaciones</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Nuevas ventas', description: 'Notificar cuando se complete una venta', enabled: true },
                  { label: 'Stock bajo', description: 'Alertas de inventario por debajo del mínimo', enabled: true },
                  { label: 'Facturas vencidas', description: 'Recordatorios de facturas pendientes', enabled: true },
                  { label: 'Nuevos leads', description: 'Notificar nuevos prospectos', enabled: true },
                  { label: 'Eventos próximos', description: 'Recordatorios de eventos', enabled: true },
                  { label: 'Reportes semanales', description: 'Envío automático de reportes', enabled: false },
                  { label: 'Mantenimiento trucks', description: 'Alertas de mantenimiento', enabled: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/3">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{item.description}</p>
                    </div>
                    <button className={cn(
                      'w-11 h-6 rounded-full transition-colors relative',
                      item.enabled ? 'bg-beer-500' : 'bg-dark-600'
                    )}>
                      <div className={cn(
                        'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                        item.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Seguridad</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Autenticación de Dos Factores</p>
                      <p className="text-xs text-dark-400 mt-0.5">Agrega una capa extra de seguridad</p>
                    </div>
                    <button className="px-4 py-2 bg-beer-500/20 text-beer-400 rounded-lg text-sm font-medium">
                      Activar MFA
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Cambiar Contraseña</p>
                      <p className="text-xs text-dark-400 mt-0.5">Actualiza tu contraseña regularmente</p>
                    </div>
                    <button className="px-4 py-2 bg-dark-700 border border-white/5 text-dark-200 rounded-lg text-sm">
                      Cambiar
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Sesiones Activas</p>
                      <p className="text-xs text-dark-400 mt-0.5">3 dispositivos activos</p>
                    </div>
                    <button className="px-4 py-2 bg-dark-700 border border-white/5 text-dark-200 rounded-lg text-sm">
                      Gestionar
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Registro de Auditoría</p>
                      <p className="text-xs text-dark-400 mt-0.5">Historial de acciones del sistema</p>
                    </div>
                    <button className="px-4 py-2 bg-dark-700 border border-white/5 text-dark-200 rounded-lg text-sm">
                      Ver Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Integraciones</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-dark-400">{integration.description}</p>
                    </div>
                    <span className={cn(
                      'badge',
                      integration.status === 'connected' ? 'badge-success' : 'badge-neutral'
                    )}>
                      {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Plan y Facturación</h2>
              
              <div className="p-6 rounded-xl bg-gradient-to-br from-beer-500/20 to-beer-600/5 border border-beer-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-beer-400 font-medium mb-1">PLAN ACTUAL</p>
                    <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                    <p className="text-sm text-dark-300 mt-1">Acceso completo a todos los módulos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">$4,999</p>
                    <p className="text-xs text-dark-400">MXN / mes</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-dark-400">Usuarios</p>
                    <p className="text-sm font-semibold text-white">Ilimitados</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Trucks</p>
                    <p className="text-sm font-semibold text-white">Ilimitados</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Almacenamiento</p>
                    <p className="text-sm font-semibold text-white">100 GB</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Soporte</p>
                    <p className="text-sm font-semibold text-white">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
