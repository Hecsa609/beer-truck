import { useState } from 'react';
import { 
  Truck, MapPin, Fuel, Thermometer, Wrench, Route, 
  Plus, Eye, Edit, MoreHorizontal,
  Gauge, Calendar, CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { trucks } from '../../data/mockData';

export default function LogisticsView() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'map' | 'maintenance'>('fleet');

  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    on_route: 'bg-blue-500',
    at_event: 'bg-purple-500',
    maintenance: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    on_route: 'En Ruta',
    at_event: 'En Evento',
    maintenance: 'Mantenimiento',
    offline: 'Offline'
  };

  const tabs = [
    { id: 'fleet' as const, label: 'Flotilla', icon: <Truck size={16} /> },
    { id: 'routes' as const, label: 'Rutas', icon: <Route size={16} /> },
    { id: 'map' as const, label: 'Mapa en Vivo', icon: <MapPin size={16} /> },
    { id: 'maintenance' as const, label: 'Mantenimiento', icon: <Wrench size={16} /> },
  ];

  // Mock routes
  const routes = [
    { id: 'r1', name: 'Ruta Centro CDMX', truck: 'BT-02 Fiesta', driver: 'Pedro Hernández', stops: 5, completed: 3, distance: '45 km', status: 'in_progress', startTime: '08:00', estimatedEnd: '14:00' },
    { id: 'r2', name: 'Ruta Polanco-Norte', truck: 'BT-01 Cerveza', driver: 'Sin asignar', stops: 4, completed: 0, distance: '32 km', status: 'planned', startTime: '10:00', estimatedEnd: '15:00' },
    { id: 'r3', name: 'Ruta Evento Centro Banamex', truck: 'BT-03 Craft', driver: 'Pedro Hernández', stops: 1, completed: 1, distance: '18 km', status: 'completed', startTime: '06:00', estimatedEnd: '08:00' },
  ];

  // Mock maintenance records
  const maintenanceRecords = [
    { id: 'm1', truck: 'BT-04 Express', type: 'Preventivo', description: 'Cambio de aceite y filtros', status: 'in_progress', scheduledDate: '2026-01-15', cost: 12000 },
    { id: 'm2', truck: 'BT-01 Cerveza', type: 'Correctivo', description: 'Reparación grifo #3', status: 'completed', scheduledDate: '2026-01-10', cost: 3500 },
    { id: 'm3', truck: 'BT-02 Fiesta', type: 'Preventivo', description: 'Revisión sistema refrigeración', status: 'scheduled', scheduledDate: '2026-01-20', cost: 5000 },
    { id: 'm4', truck: 'BT-03 Craft', type: 'Preventivo', description: 'Calibración dispensadores', status: 'scheduled', scheduledDate: '2026-01-25', cost: 2800 },
  ];

  const maintenanceStatusColors: Record<string, string> = {
    scheduled: 'badge-info',
    in_progress: 'badge-warning',
    completed: 'badge-success'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logística</h1>
          <p className="text-sm text-dark-300 mt-1">Gestión de flotilla, rutas y mantenimiento</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nueva Ruta
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
          </button>
        ))}
      </div>

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trucks.map((truck) => (
            <div key={truck.id} className="glass-card-hover rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-beer-500/10 flex items-center justify-center text-beer-400">
                    <Truck size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{truck.name}</h3>
                    <p className="text-xs text-dark-400">{truck.plate} · {truck.model} · {truck.year}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', statusColors[truck.status])} />
                      <span className="text-xs text-dark-200">{statusLabels[truck.status]}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Fuel size={12} className="text-dark-400" />
                    <span className="text-[10px] text-dark-400">Combustible</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{truck.fuelLevel || 0}%</p>
                  <div className="h-1 bg-dark-700 rounded-full overflow-hidden mt-1">
                    <div 
                      className={cn(
                        'h-full rounded-full',
                        (truck.fuelLevel || 0) > 50 ? 'bg-green-500' :
                        (truck.fuelLevel || 0) > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${truck.fuelLevel || 0}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Thermometer size={12} className="text-blue-400" />
                    <span className="text-[10px] text-dark-400">Temperatura</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-400">{truck.temperature || '-'}°C</p>
                  <span className="text-[10px] text-dark-500">Refrigeración OK</span>
                </div>
                <div className="p-3 rounded-xl bg-white/3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Gauge size={12} className="text-dark-400" />
                    <span className="text-[10px] text-dark-400">Kilometraje</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{(truck.mileage || 0).toLocaleString()} km</p>
                  <span className="text-[10px] text-dark-500">Total acumulado</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <span className="text-xs text-dark-400">Grifos</span>
                  <span className="text-sm font-medium text-white">{truck.taps}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <span className="text-xs text-dark-400">Max Barriles</span>
                  <span className="text-sm font-medium text-white">{truck.maxKegs}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-dark-400" />
                  <span className="text-xs text-dark-300">
                    Próximo mantto: {truck.nextMaintenance || 'No programado'}
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
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    route.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    route.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-dark-700 text-dark-300'
                  )}>
                    <Route size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{route.name}</h3>
                    <p className="text-xs text-dark-400 mt-0.5">{route.truck} · {route.driver}</p>
                  </div>
                </div>
                <span className={cn(
                  'badge',
                  route.status === 'in_progress' ? 'badge-info' :
                  route.status === 'completed' ? 'badge-success' : 'badge-neutral'
                )}>
                  {route.status === 'in_progress' ? 'En Progreso' :
                   route.status === 'completed' ? 'Completada' : 'Planificada'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl bg-white/3">
                  <p className="text-lg font-bold text-white">{route.stops}</p>
                  <p className="text-[10px] text-dark-400">Paradas</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/3">
                  <p className="text-lg font-bold text-white">{route.completed}</p>
                  <p className="text-[10px] text-dark-400">Completadas</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/3">
                  <p className="text-lg font-bold text-white">{route.distance}</p>
                  <p className="text-[10px] text-dark-400">Distancia</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/3">
                  <p className="text-lg font-bold text-white">{route.startTime} - {route.estimatedEnd}</p>
                  <p className="text-[10px] text-dark-400">Horario</p>
                </div>
              </div>

              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    route.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${(route.completed / route.stops) * 100}%` }}
                />
              </div>
              <p className="text-xs text-dark-400 mt-1 text-right">{Math.round((route.completed / route.stops) * 100)}% completado</p>
            </div>
          ))}
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-[600px] bg-dark-800 relative flex items-center justify-center">
            {/* Simulated map */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="absolute h-px bg-white/20" style={{ top: `${(i + 1) * 10}%`, left: 0, right: 0 }} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="absolute w-px bg-white/20" style={{ left: `${(i + 1) * 10}%`, top: 0, bottom: 0 }} />
                ))}
              </div>
              
              {/* Truck markers */}
              {trucks.filter(t => t.location).map((truck, i) => (
                <div 
                  key={truck.id}
                  className="absolute flex flex-col items-center cursor-pointer group"
                  style={{ 
                    left: `${20 + i * 20}%`, 
                    top: `${25 + (i % 2) * 25}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110',
                    truck.status === 'available' ? 'bg-green-500' :
                    truck.status === 'on_route' ? 'bg-blue-500' :
                    truck.status === 'at_event' ? 'bg-purple-500' : 'bg-yellow-500'
                  )}>
                    <Truck size={18} className="text-white" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-dark-800/90 rounded text-[10px] text-white font-medium whitespace-nowrap">
                    {truck.name}
                  </div>
                  {/* Pulse animation for active trucks */}
                  {truck.status !== 'available' && truck.status !== 'maintenance' && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30" 
                      style={{ 
                        backgroundColor: truck.status === 'on_route' ? '#3b82f6' : '#a855f7'
                      }} 
                    />
                  )}
                </div>
              ))}

              {/* Routes lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="20%" y1="25%" x2="40%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
                <line x1="40%" y1="50%" x2="60%" y2="25%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              </svg>
            </div>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 glass-card rounded-xl p-4">
              <p className="text-xs font-medium text-white mb-2">Leyenda</p>
              <div className="space-y-2">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', statusColors[key])} />
                    <span className="text-[10px] text-dark-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Truck info panel */}
            <div className="absolute top-4 right-4 glass-card rounded-xl p-4 w-64">
              <p className="text-xs font-medium text-white mb-3">Resumen de Flotilla</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">Total Trucks</span>
                  <span className="text-white font-medium">{trucks.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">En Operación</span>
                  <span className="text-green-400 font-medium">{trucks.filter(t => ['on_route', 'at_event'].includes(t.status)).length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">Disponibles</span>
                  <span className="text-blue-400 font-medium">{trucks.filter(t => t.status === 'available').length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">En Mantenimiento</span>
                  <span className="text-yellow-400 font-medium">{trucks.filter(t => t.status === 'maintenance').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {maintenanceRecords.map((record) => (
            <div key={record.id} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    record.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    record.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  )}>
                    {record.status === 'completed' ? <CheckCircle2 size={20} /> : <Wrench size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{record.description}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-dark-300">{record.truck}</span>
                      <span className="text-xs text-dark-400">·</span>
                      <span className="text-xs text-dark-300">{record.type}</span>
                      <span className="text-xs text-dark-400">·</span>
                      <span className="text-xs text-dark-300">{record.scheduledDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">${record.cost.toLocaleString()}</p>
                    <p className="text-[10px] text-dark-400">Costo estimado</p>
                  </div>
                  <span className={cn('badge', maintenanceStatusColors[record.status])}>
                    {record.status === 'scheduled' ? 'Programado' :
                     record.status === 'in_progress' ? 'En Progreso' : 'Completado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
