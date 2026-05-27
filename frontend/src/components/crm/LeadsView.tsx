import { 
  Plus, Mail, Phone, Building2, DollarSign,
  MoreHorizontal, Eye, Edit, TrendingUp, Target
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { leads } from '../../data/mockData';

export default function LeadsView() {
  const statusColumns = [
    { id: 'new', label: 'Nuevo', color: 'bg-blue-500' },
    { id: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
    { id: 'qualified', label: 'Calificado', color: 'bg-purple-500' },
    { id: 'proposal', label: 'Propuesta', color: 'bg-orange-500' },
    { id: 'negotiation', label: 'Negociación', color: 'bg-indigo-500' },
    { id: 'won', label: 'Ganado', color: 'bg-green-500' },
    { id: 'lost', label: 'Perdido', color: 'bg-red-500' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const totalPipelineValue = leads.reduce((sum, l) => sum + l.value, 0);
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
  const conversionRate = 35;

  const sourceColors: Record<string, string> = {
    web: 'badge-info',
    referral: 'badge-success',
    event: 'badge-warning',
    social: 'badge-info',
    cold_call: 'badge-neutral',
    whatsapp: 'badge-success',
    instagram: 'badge-warning',
    facebook: 'badge-info',
    tiktok: 'badge-neutral'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline de Leads</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona prospectos y oportunidades de venta</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nuevo Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Leads</p>
              <p className="text-xl font-bold text-white">{leads.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Activos</p>
              <p className="text-xl font-bold text-white">{activeLeads}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Valor Pipeline</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalPipelineValue)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Conversión</p>
              <p className="text-xl font-bold text-white">{conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((col) => {
          const columnLeads = leads.filter(l => l.status === col.id);
          const columnValue = columnLeads.reduce((sum, l) => sum + l.value, 0);
          
          return (
            <div key={col.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                  <span className="text-sm font-medium text-white">{col.label}</span>
                  <span className="badge badge-neutral text-[10px]">{columnLeads.length}</span>
                </div>
              </div>
              {columnValue > 0 && (
                <p className="text-xs text-dark-400 mb-3 pl-5">{formatCurrency(columnValue)}</p>
              )}
              <div className="space-y-3">
                {columnLeads.map((lead) => (
                  <div key={lead.id} className="glass-card-hover rounded-xl p-4 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">{lead.name}</h4>
                      <button className="p-1 rounded hover:bg-white/5 text-dark-400">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                    {lead.company && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 size={12} className="text-dark-400" />
                        <span className="text-xs text-dark-300">{lead.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-dark-400" />
                        <span className="text-xs text-dark-400 truncate max-w-[120px]">{lead.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className={cn('badge text-[10px]', sourceColors[lead.source])}>
                        {lead.source}
                      </span>
                      <span className="text-sm font-semibold text-beer-400">{formatCurrency(lead.value)}</span>
                    </div>
                    {lead.assignedTo && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-[9px] text-dark-300">
                          JD
                        </div>
                        <span className="text-[10px] text-dark-400">Asignado</span>
                      </div>
                    )}
                  </div>
                ))}
                {columnLeads.length === 0 && (
                  <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-xs text-dark-400">Sin leads</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Leads Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Todos los Leads</h3>
            <p className="text-xs text-dark-400 mt-0.5">Vista detallada del pipeline</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Lead</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Fuente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Valor</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="table-row border-b border-white/3">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      {lead.company && <p className="text-xs text-dark-400">{lead.company}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-dark-300">
                        <Mail size={12} /> {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-dark-300">
                        <Phone size={12} /> {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('badge capitalize', sourceColors[lead.source])}>{lead.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'badge capitalize',
                      lead.status === 'won' ? 'badge-success' :
                      lead.status === 'lost' ? 'badge-danger' :
                      lead.status === 'negotiation' ? 'badge-warning' : 'badge-info'
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-beer-400">{formatCurrency(lead.value)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                        <Edit size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
