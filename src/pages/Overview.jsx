import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getInvestorSummary, getV3Status, formatUSD } from '../data/investors';
import {
  KpiCard, SectionHeader, Table, Th, Td,
  HFBadge, InvestorStatusBadge, V3StatusBadge
} from '../components/ui';
import { Eye } from 'lucide-react';

export default function Overview() {
  const { investors, prices } = useApp();
  const navigate = useNavigate();

  const summaries = investors.map(inv => ({
    investor: inv,
    summary: getInvestorSummary(inv, prices),
  }));

  const totalAUM = investors.reduce((s, i) => s + i.portfolioTotal, 0);
  const totalRewards = summaries.reduce((s, { summary }) => s + summary.totalRewards, 0);
  const totalInRange = summaries.reduce((s, { summary }) => s + summary.activeV3Count, 0);
  const totalV3 = summaries.reduce((s, { summary }) => s + summary.totalV3Count, 0);
  const hfs = summaries.map(({ summary }) => summary.minHF).filter(h => h !== null);
  const avgHF = hfs.length ? hfs.reduce((a, b) => a + b, 0) / hfs.length : 0;
  const totalCSCFee = summaries.reduce((s, { summary }) => s + summary.cscFee, 0);
  const criticalCount = summaries.filter(({ summary }) => summary.status === 'CRÍTICO').length;

  return (
    <div>
      <SectionHeader title="Overview — Vista General" sub={`Última actualización: ${new Date(prices.lastUpdated).toLocaleString('es-ES')}`} />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="AUM Total" value={formatUSD(totalAUM)} color="blue" />
        <KpiCard label="Rewards Pendientes" value={formatUSD(totalRewards)} color="green" />
        <KpiCard label="Posiciones En Rango" value={`${totalInRange} / ${totalV3}`} color="blue" />
        <KpiCard label="Health Factor Medio" value={avgHF.toFixed(2)} color={avgHF >= 2 ? 'green' : avgHF >= 1.5 ? 'orange' : 'red'} />
        <KpiCard label="Comisión CSC 30d" value={formatUSD(totalCSCFee)} color="purple" />
        <KpiCard label="Inversores Activos" value={`${investors.length}`} sub={criticalCount > 0 ? `${criticalCount} crítico(s)` : undefined} color={criticalCount > 0 ? 'red' : 'green'} />
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
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${summary.activeV3Count > 0 ? 'text-[#1A5C2A]' : 'text-[#8B0000]'}`}>
                      {summary.activeV3Count}/{summary.totalV3Count}
                    </span>
                  </div>
                </Td>
                <Td className={summary.totalRewards > 0 ? 'text-[#1A5C2A] font-medium' : 'text-gray-400'}>
                  {formatUSD(summary.totalRewards)}
                </Td>
                <Td><HFBadge hf={summary.minHF} /></Td>
                <Td><InvestorStatusBadge status={summary.status} /></Td>
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
