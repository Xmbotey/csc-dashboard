import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getInvestorSummary, getV3Status, formatUSD } from '../data/investors';
import {
  KpiCard, SectionHeader, Table, Th, Td,
  HFBadge, InvestorStatusBadge,
} from '../components/ui';
import { Eye } from 'lucide-react';

function ActiveDot() {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
  );
}

export default function Overview() {
  const { investors, prices } = useApp();
  const navigate = useNavigate();

  const summaries = investors.map(inv => ({
    investor: inv,
    summary: getInvestorSummary(inv, prices),
  }));

  const totalCSC    = investors.reduce((s, i) => s + i.portfolioTotal, 0);
  const totalRewards = summaries.reduce((s, { summary }) => s + summary.totalRewards, 0);
  const totalInRange = summaries.reduce((s, { summary }) => s + summary.activeV3Count, 0);
  const totalV3      = summaries.reduce((s, { summary }) => s + summary.totalV3Count, 0);
  const hfs          = summaries.map(({ summary }) => summary.minHF).filter(h => h !== null);
  const avgHF        = hfs.length ? hfs.reduce((a, b) => a + b, 0) / hfs.length : 0;
  const totalCSCFee  = summaries.reduce((s, { summary }) => s + summary.cscFee, 0);
  const criticalCount = summaries.filter(({ summary }) => summary.status === 'CRÍTICO').length;

  // Liquidez activa = suma de V3 en rango de todos los inversores
  const activeLiquidity = investors.reduce((sum, inv) => {
    return sum + inv.v3Positions
      .filter(p => getV3Status(p, prices) === 'IN_RANGE')
      .reduce((s, p) => s + (p.liquidity || 0), 0);
  }, 0);
  const pausedLiquidity = totalCSC - activeLiquidity;
  const activePct = totalCSC > 0 ? (activeLiquidity / totalCSC) * 100 : 0;
  const pausedPct = totalCSC > 0 ? (pausedLiquidity / totalCSC) * 100 : 0;

  return (
    <div>
      <SectionHeader
        title="Overview — Vista General"
        sub={`Última actualización: ${new Date(prices.lastUpdated).toLocaleString('es-ES')}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Liquidez Total CSC"    value={formatUSD(totalCSC)}        color="blue" />
        <KpiCard label="Rewards Pendientes"    value={formatUSD(totalRewards)}    color="green" />
        <KpiCard label="Posiciones En Rango"   value={`${totalInRange} / ${totalV3}`} color="blue" />
        <KpiCard label="Health Factor Medio"   value={avgHF.toFixed(2)}           color={avgHF >= 2 ? 'green' : avgHF >= 1.5 ? 'orange' : 'red'} />
        <KpiCard label="Comisión CSC 30d"      value={formatUSD(totalCSCFee)}     color="purple" />
        <KpiCard label="Inversores"            value={`${investors.length}`}      sub={criticalCount > 0 ? `${criticalCount} crítico(s)` : undefined} color={criticalCount > 0 ? 'red' : 'green'} />
      </div>

      {/* Liquidez activa / parada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Liquidez Total CSC</p>
          <p className="text-2xl font-bold text-[#1E2A6E]">{formatUSD(totalCSC)}</p>
          <p className="text-xs text-gray-400 mt-1">AUM consolidado</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm px-5 py-4 text-center">
          <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Liquidez Activa</p>
          <p className="text-2xl font-bold text-green-700">{formatUSD(activeLiquidity)}</p>
          <div className="mt-1.5">
            <span className="inline-block bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {activePct.toFixed(1)}% del total
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">V3 en rango generando fees</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm px-5 py-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Liquidez Parada</p>
          <p className="text-2xl font-bold text-gray-600">{formatUSD(pausedLiquidity)}</p>
          <div className="mt-1.5">
            <span className="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pausedPct.toFixed(1)}% del total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Lending + wallet + V3 fuera de rango</p>
        </div>
      </div>

      {/* Master table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-[#1E2A6E] text-sm">Tabla de Inversores</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Inversor</Th>
              <Th>Portfolio</Th>
              <Th>PE Actual</Th>
              <Th>V3 En Rango</Th>
              <Th>Rewards</Th>
              <Th>HF Mínimo</Th>
              <Th>Estado</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {summaries.map(({ investor, summary }) => (
              <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                <Td>
                  <span className="font-semibold text-[#1E2A6E]">{investor.name}</span>
                </Td>
                <Td className="font-medium">{formatUSD(investor.portfolioTotal)}</Td>
                <Td className="text-gray-600">{formatUSD(investor.pe)}</Td>
                <Td>
                  <span className={`text-xs font-semibold ${summary.activeV3Count > 0 ? 'text-[#1A5C2A]' : 'text-[#8B0000]'}`}>
                    {summary.activeV3Count}/{summary.totalV3Count}
                  </span>
                </Td>
                <Td className={summary.totalRewards > 0 ? 'text-[#1A5C2A] font-medium' : 'text-gray-400'}>
                  {formatUSD(summary.totalRewards)}
                </Td>
                <Td><HFBadge hf={summary.minHF} /></Td>
                <Td>
                  {summary.isActive ? (
                    <span className="flex items-center gap-1.5">
                      <ActiveDot />
                      <span className="text-green-600 font-semibold text-xs">Activo</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No activo</span>
                  )}
                </Td>
                <Td>
                  <button
                    onClick={() => navigate(`/inversores/${investor.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2A6E] text-white text-xs rounded-lg hover:bg-[#2E4A9E] transition-colors"
                  >
                    <Eye size={13} />
                    Ver
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
