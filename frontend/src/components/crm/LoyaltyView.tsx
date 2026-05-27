import { 
  Star, Gift, Users, TrendingUp, Crown, Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { clients } from '../../data/mockData';

export default function LoyaltyView() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  };

  const loyaltyTiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 2000, color: 'from-orange-700 to-orange-500', icon: '🥉', clients: 45, benefits: ['5% descuento', 'Acceso a promociones'] },
    { name: 'Plata', minPoints: 2000, maxPoints: 5000, color: 'from-gray-400 to-gray-300', icon: '🥈', clients: 32, benefits: ['10% descuento', 'Envío gratis', 'Acceso anticipado'] },
    { name: 'Oro', minPoints: 5000, maxPoints: 15000, color: 'from-yellow-500 to-amber-400', icon: '🥇', clients: 18, benefits: ['15% descuento', 'Eventos exclusivos', 'Bebida gratis'] },
    { name: 'Platino', minPoints: 15000, maxPoints: Infinity, color: 'from-purple-500 to-indigo-400', icon: '💎', clients: 8, benefits: ['20% descuento', 'VIP en eventos', 'Catas privadas', 'Merch gratis'] },
  ];

  const topLoyaltyClients = [...clients]
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Programa de Fidelización</h1>
        <p className="text-sm text-dark-300 mt-1">Gestiona puntos, niveles y recompensas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-beer-500/20 flex items-center justify-center text-beer-400">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Puntos Activos</p>
              <p className="text-xl font-bold text-white">59,000</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Crown size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Miembros VIP</p>
              <p className="text-xl font-bold text-white">{clients.filter(c => c.segment === 'vip').length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <Gift size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Canjes del Mes</p>
              <p className="text-xl font-bold text-white">47</p>
            </div>
          </div>
        </div>
        <div className="stat-card glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-dark-400">Retención</p>
              <p className="text-xl font-bold text-white">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loyaltyTiers.map((tier, i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden">
            <div className={cn('h-2 bg-gradient-to-r', tier.color)} />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{tier.icon}</span>
                <div>
                  <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                  <p className="text-xs text-dark-400">{tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? '∞' : tier.maxPoints.toLocaleString()} pts</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-dark-400" />
                <span className="text-sm text-dark-200">{tier.clients} miembros</span>
              </div>
              <div className="space-y-1.5">
                {tier.benefits.map((benefit, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-dark-300">
                    <Zap size={10} className="text-beer-400" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Loyalty Clients */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-semibold text-white">Top Clientes por Puntos</h3>
          <p className="text-xs text-dark-400 mt-0.5">Clientes con más puntos acumulados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Segmento</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Puntos</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Total Compras</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {topLoyaltyClients.map((client, i) => {
                const tier = loyaltyTiers.find(t => client.loyaltyPoints >= t.minPoints && client.loyaltyPoints < t.maxPoints) || loyaltyTiers[loyaltyTiers.length - 1];
                return (
                  <tr key={client.id} className="table-row border-b border-white/3">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-dark-300">{i + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-semibold text-dark-300">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{client.name}</p>
                          {client.company && <p className="text-xs text-dark-400">{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'badge capitalize',
                        client.segment === 'vip' ? 'badge-warning' :
                        client.segment === 'regular' ? 'badge-info' : 'badge-neutral'
                      )}>
                        {client.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-beer-400">{client.loyaltyPoints.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-white">{formatCurrency(client.totalPurchases)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg">{tier.icon}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
