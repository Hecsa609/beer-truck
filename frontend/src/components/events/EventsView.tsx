import { useState, useEffect } from 'react';
import {
  Plus, Calendar, MapPin, Clock, Users, DollarSign,
  ChevronLeft, ChevronRight, RefreshCw, Edit, Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { eventsAPI, customersAPI } from '../../api';

interface Event {
  id: string;
  name: string;
  description: string;
  customer_id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  city: string;
  status: string;
  estimated_guests: number;
  agreed_price: number;
  notes: string;
  customers: { id: string; name: string; phone: string; email: string } | null;
}

interface Customer {
  id: string;
  name: string;
}

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'new'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', customer_id: '',
    event_date: '', start_time: '', end_time: '',
    location: '', city: '', estimated_guests: '',
    agreed_price: '', notes: ''
  });

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, customersData] = await Promise.all([
        eventsAPI.getAll(),
        customersAPI.getAll()
      ])
      setEvents(eventsData.events)
      setCustomers(customersData.customers)
    } catch (err) {
      console.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.event_date) return
    setSaving(true)
    try {
      await eventsAPI.create({
        ...formData,
        estimated_guests: formData.estimated_guests ? parseInt(formData.estimated_guests) : null,
        agreed_price: formData.agreed_price ? parseFloat(formData.agreed_price) : null,
        customer_id: formData.customer_id || null
      })
      await loadData()
      setActiveTab('list')
      setFormData({
        name: '', description: '', customer_id: '',
        event_date: '', start_time: '', end_time: '',
        location: '', city: '', estimated_guests: '',
        agreed_price: '', notes: ''
      })
    } catch (err) {
      console.error('Error guardando evento')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await eventsAPI.updateStatus(id, status)
      await loadData()
    } catch (err) {
      console.error('Error actualizando estado')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const statusColors: Record<string, string> = {
    prospecto: 'badge-info',
    cotizado: 'badge-warning',
    confirmado: 'badge-success',
    en_curso: 'badge-info',
    completado: 'badge-neutral',
    cancelado: 'badge-danger'
  }

  const statusOptions = ['prospecto', 'cotizado', 'confirmado', 'en_curso', 'completado', 'cancelado']

  const confirmedEvents = events.filter(e => e.status === 'confirmado').length
  const pendingEvents = events.filter(e => ['prospecto', 'cotizado'].includes(e.status)).length
  const totalRevenue = events.reduce((sum, e) => sum + (e.agreed_price || 0), 0)

  // Calendar
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.event_date === dateStr)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona eventos y reservas reales</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo Evento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
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
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Confirmados</p>
              <p className="text-xl font-bold text-white">{confirmedEvents}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
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
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Revenue</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl w-fit">
        {[
          { id: 'list', label: 'Lista' },
          { id: 'calendar', label: 'Calendario' },
          { id: 'new', label: '+ Nuevo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New Event Form */}
      {activeTab === 'new' && (
        <div className="glass-card rounded-2xl p-6 border border-beer-500/20">
          <h3 className="text-base font-semibold text-white mb-4">Nuevo Evento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Nombre del evento *</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Fiesta corporativa, Boda, Festival..."
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Cliente</label>
              <select value={formData.customer_id}
                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-dark-200 focus:outline-none"
              >
                <option value="">Sin cliente asignado</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Fecha *</label>
              <input type="date" value={formData.event_date}
                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-beer-500/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Hora inicio</label>
                <input type="time" value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Hora fin</label>
                <input type="time" value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Lugar</label>
              <input type="text" value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Nombre del lugar"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Ciudad</label>
              <input type="text" value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ciudad de México"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Invitados estimados</label>
              <input type="number" value={formData.estimated_guests}
                onChange={e => setFormData({ ...formData, estimated_guests: e.target.value })}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Precio acordado</label>
              <input type="number" value={formData.agreed_price}
                onChange={e => setFormData({ ...formData, agreed_price: e.target.value })}
                placeholder="15000"
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-dark-400 mb-1">Notas</label>
              <textarea value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Requerimientos especiales, notas del cliente..."
                rows={3}
                className="w-full px-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setActiveTab('list')}
              className="px-4 py-2 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !formData.name || !formData.event_date}
              className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && !loading && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-dark-400">No hay eventos aún. ¡Crea el primero!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-beer-500/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-beer-400 uppercase">
                        {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-beer-400">
                        {new Date(event.event_date + 'T12:00:00').getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{event.name}</h3>
                      {event.description && (
                        <p className="text-xs text-dark-400 mt-0.5">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn('badge text-[10px] capitalize', statusColors[event.status] || 'badge-neutral')}>
                          {event.status}
                        </span>
                        {event.customers && (
                          <span className="text-xs text-dark-400">👤 {event.customers.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={event.status}
                      onChange={e => handleStatusChange(event.id, e.target.value)}
                      className="px-3 py-1.5 bg-dark-800 border border-white/5 rounded-lg text-xs text-dark-200 focus:outline-none"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Eye size={15} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {event.start_time && (
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <Clock size={13} />
                      {event.start_time} — {event.end_time}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <MapPin size={13} />
                      {event.location}
                    </div>
                  )}
                  {event.estimated_guests && (
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <Users size={13} />
                      {event.estimated_guests} invitados
                    </div>
                  )}
                  {event.agreed_price && (
                    <div className="flex items-center gap-2 text-xs text-dark-300">
                      <DollarSign size={13} />
                      {formatCurrency(event.agreed_price)}
                    </div>
                  )}
                </div>
                {event.notes && (
                  <p className="text-xs text-dark-500 mt-3 pt-3 border-t border-white/5">{event.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white capitalize">
              {selectedMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setSelectedMonth(new Date())}
                className="px-3 py-1.5 text-xs text-dark-300 hover:text-white transition-colors">
                Hoy
              </button>
              <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center py-2 text-xs font-medium text-dark-400">{day}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : []
              const isToday = day === new Date().getDate() &&
                selectedMonth.getMonth() === new Date().getMonth() &&
                selectedMonth.getFullYear() === new Date().getFullYear()
              return (
                <div key={i} className={cn(
                  'min-h-[80px] p-2 rounded-lg border border-white/3',
                  day ? 'hover:bg-white/3 cursor-pointer' : 'opacity-20',
                  isToday && 'border-beer-500/30 bg-beer-500/5'
                )}>
                  {day && (
                    <>
                      <span className={cn('text-sm font-medium', isToday ? 'text-beer-400' : 'text-dark-200')}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event.id} className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate',
                            event.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'en_curso' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          )}>
                            {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-dark-400">+{dayEvents.length - 2} más</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-dark-400">Cargando eventos...</p>
        </div>
      )}
    </div>
  )
}