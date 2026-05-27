import { 
  Headphones, Plus, AlertTriangle,
  Clock, CheckCircle2, XCircle, MoreHorizontal, Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { tickets } from '../../data/mockData';

export default function SupportView() {
  const priorityColors: Record<string, string> = {
    low: 'badge-neutral',
    medium: 'badge-info',
    high: 'badge-warning',
    critical: 'badge-danger'
  };

  const statusColors: Record<string, string> = {
    open: 'badge-info',
    in_progress: 'badge-warning',
    resolved: 'badge-success',
    closed: 'badge-neutral'
  };

  const statusLabels: Record<string, string> = {
    open: 'Abierto',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado'
  };

  const statusIcons: Record<string, React.ReactNode> = {
    open: <Clock size={14} />,
    in_progress: <AlertTriangle size={14} />,
    resolved: <CheckCircle2 size={14} />,
    closed: <XCircle size={14} />
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Soporte</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona tickets de soporte y mantenimiento</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nuevo Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Headphones size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Tickets</p>
              <p className="text-xl font-bold text-white">{tickets.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Abiertos</p>
              <p className="text-xl font-bold text-white">{tickets.filter(t => t.status === 'open').length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">En Progreso</p>
              <p className="text-xl font-bold text-white">{tickets.filter(t => t.status === 'in_progress').length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Críticos</p>
              <p className="text-xl font-bold text-white">{tickets.filter(t => t.priority === 'critical').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className={cn(
            'glass-card rounded-xl p-5 border-l-4',
            ticket.priority === 'critical' ? 'border-l-red-500' :
            ticket.priority === 'high' ? 'border-l-orange-500' :
            ticket.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                )}>
                  <Headphones size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{ticket.subject}</h4>
                  <p className="text-xs text-dark-400 mt-0.5">{ticket.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={cn('badge text-[10px]', priorityColors[ticket.priority])}>
                      {ticket.priority === 'critical' ? 'Crítico' :
                       ticket.priority === 'high' ? 'Alto' :
                       ticket.priority === 'medium' ? 'Medio' : 'Bajo'}
                    </span>
                    <span className={cn('badge text-[10px] flex items-center gap-1', statusColors[ticket.status])}>
                      {statusIcons[ticket.status]}
                      {statusLabels[ticket.status]}
                    </span>
                    <span className="text-[10px] text-dark-500">{ticket.category}</span>
                    <span className="text-[10px] text-dark-500">Creado: {ticket.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                  <Eye size={15} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
