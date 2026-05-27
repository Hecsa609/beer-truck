import { useState } from 'react';
import { 
  Plus, Calendar, MapPin, Clock, Users, DollarSign,
  MoreHorizontal, ChevronLeft, ChevronRight,
  Truck, Star, Music, Heart, Briefcase, PartyPopper
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { events, clients } from '../../data/mockData';

export default function EventsView() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'bookings'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 0, 1));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const eventTypeIcons: Record<string, React.ReactNode> = {
    private: <Star size={16} />,
    festival: <Music size={16} />,
    corporate: <Briefcase size={16} />,
    wedding: <Heart size={16} />,
    brand_activation: <Star size={16} />,
    catering: <PartyPopper size={16} />,
    subscription: <Calendar size={16} />,
  };

  const eventTypeLabels: Record<string, string> = {
    private: 'Privado',
    festival: 'Festival',
    corporate: 'Corporativo',
    wedding: 'Boda',
    brand_activation: 'Activación',
    catering: 'Catering',
    subscription: 'Suscripción',
  };

  const eventStatusColors: Record<string, string> = {
    inquiry: 'badge-info',
    quoted: 'badge-warning',
    confirmed: 'badge-success',
    in_progress: 'badge-info',
    completed: 'badge-neutral',
    cancelled: 'badge-danger'
  };

  const eventStatusLabels: Record<string, string> = {
    inquiry: 'Consulta',
    quoted: 'Cotizado',
    confirmed: 'Confirmado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.finalPrice || e.quotedPrice || 0), 0);
  const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
  const pendingEvents = events.filter(e => ['inquiry', 'quoted'].includes(e.status)).length;

  // Calendar data
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.startDate === dateStr || (e.startDate <= dateStr && e.endDate >= dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona eventos, reservas y catering</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Eventos</p>
              <p className="text-xl font-bold text-white">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Confirmados</p>
              <p className="text-xl font-bold text-white">{confirmedEvents}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Pendientes</p>
              <p className="text-xl font-bold text-white">{pendingEvents}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Revenue Eventos</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl w-fit">
        {[
          { id: 'list' as const, label: 'Lista', icon: <Calendar size={16} /> },
          { id: 'calendar' as const, label: 'Calendario', icon: <Calendar size={16} /> },
        ].map((tab) => (
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

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {selectedMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setSelectedMonth(new Date(2026, 0, 1))}
                className="px-3 py-1.5 text-xs text-dark-300 hover:text-white transition-colors"
              >
                Hoy
              </button>
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center py-2 text-xs font-medium text-dark-400">{day}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div key={i} className={cn(
                  'min-h-[100px] p-2 rounded-lg border border-white/3 transition-colors',
                  day ? 'hover:bg-white/3 cursor-pointer' : 'opacity-30',
                  day === 15 && 'border-beer-500/30 bg-beer-500/5'
                )}>
                  {day && (
                    <>
                      <span className={cn(
                        'text-sm font-medium',
                        day === 15 ? 'text-beer-400' : 'text-dark-200'
                      )}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div key={event.id} className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate',
                            event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          )}>
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-dark-400">+{dayEvents.length - 2} más</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => {
            const client = clients.find(c => c.id === event.clientId);
            return (
              <div key={event.id} className="glass-card-hover rounded-2xl p-6 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-beer-500/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-beer-400 leading-none uppercase">
                        {new Date(event.startDate).toLocaleDateString('es-MX', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-beer-400 leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge text-[10px] capitalize">
                          {eventTypeIcons[event.type]}
                          <span className="ml-1">{eventTypeLabels[event.type]}</span>
                        </span>
                        <span className={cn('badge text-[10px] capitalize', eventStatusColors[event.status])}>
                          {eventStatusLabels[event.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <Clock size={14} />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <Users size={14} />
                    <span>{event.attendees.toLocaleString()} asistentes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <MapPin size={14} />
                    <span className="truncate">{event.location.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-300">
                    <DollarSign size={14} />
                    <span>{formatCurrency(event.finalPrice || event.quotedPrice || 0)}</span>
                  </div>
                </div>

                {client && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-[10px] text-dark-300">
                      {client.name[0]}
                    </div>
                    <span className="text-xs text-dark-200">{client.name}</span>
                    {client.company && <span className="text-[10px] text-dark-400">({client.company})</span>}
                  </div>
                )}

                {event.assignedTrucks.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <Truck size={14} className="text-dark-400" />
                    <div className="flex gap-1">
                      {event.assignedTrucks.map((_truckId, i) => (
                        <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-300">
                          BT-{String(i + 1).padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
