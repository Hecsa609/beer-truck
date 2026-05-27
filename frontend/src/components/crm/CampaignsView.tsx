import { 
  Plus, Mail, MessageSquare, Smartphone, Bell,
  MoreHorizontal, Eye, Edit, TrendingUp, Send
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { campaigns } from '../../data/mockData';

export default function CampaignsView() {
  const typeIcons: Record<string, React.ReactNode> = {
    email: <Mail size={18} />,
    sms: <Smartphone size={18} />,
    push: <Bell size={18} />,
    whatsapp: <MessageSquare size={18} />
  };

  const typeLabels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push Notification',
    whatsapp: 'WhatsApp'
  };

  const statusColors: Record<string, string> = {
    draft: 'badge-neutral',
    scheduled: 'badge-info',
    active: 'badge-success',
    completed: 'badge-neutral',
    paused: 'badge-warning'
  };

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    scheduled: 'Programada',
    active: 'Activa',
    completed: 'Completada',
    paused: 'Pausada'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campañas de Marketing</h1>
          <p className="text-sm text-dark-300 mt-1">Gestiona campañas de email, SMS, push y WhatsApp</p>
        </div>
        <button className="px-4 py-2 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-beer-500/20 flex items-center gap-2">
          <Plus size={16} /> Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Send size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Campañas</p>
              <p className="text-xl font-bold text-white">{campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Tasa Apertura</p>
              <p className="text-xl font-bold text-white">64.5%</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Conversiones</p>
              <p className="text-xl font-bold text-white">130</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">ROI Promedio</p>
              <p className="text-xl font-bold text-white">340%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="glass-card-hover rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  campaign.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                  campaign.type === 'sms' ? 'bg-green-500/20 text-green-400' :
                  campaign.type === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-purple-500/20 text-purple-400'
                )}>
                  {typeIcons[campaign.type]}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge text-[10px]">{typeLabels[campaign.type]}</span>
                    <span className={cn('badge text-[10px]', statusColors[campaign.status])}>
                      {statusLabels[campaign.status]}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-1 rounded-lg hover:bg-white/5 text-dark-400">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <p className="text-xs text-dark-300 mb-4 line-clamp-2">{campaign.content.body}</p>

            {campaign.stats && (
              <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{campaign.stats.sent}</p>
                  <p className="text-[10px] text-dark-400">Enviados</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{campaign.stats.delivered}</p>
                  <p className="text-[10px] text-dark-400">Entregados</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-blue-400">{campaign.stats.opened}</p>
                  <p className="text-[10px] text-dark-400">Abiertos</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-beer-400">{campaign.stats.clicked}</p>
                  <p className="text-[10px] text-dark-400">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-green-400">{campaign.stats.converted}</p>
                  <p className="text-[10px] text-dark-400">Conversiones</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <span className="text-xs text-dark-400">Segmento: {campaign.targetSegment}</span>
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
    </div>
  );
}
