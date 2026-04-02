import { useApp } from '../context/AppContext';
import { getInvestorSummary, formatUSD, getV3Status } from '../data/investors';
import { KpiCard, SectionHeader } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#1E2A6E', '#2E4A9E', '#1A5C2A', '#E06000', '#8B0000', '#6B21A8'];

export default function TotalesCSC() {
  const { investors, prices } = useApp();

  const summaries = investors.map(inv => ({
    investor: inv,
    summary: getInvestorSummary(inv, prices),
  }));

  const totalAUM = investors.reduce((s, i) => s + i.portfolioTotal, 0);
  const totalCSCFee30d = summaries.reduce((s, { summary }) => s + summary.cscFee, 0);
  const totalCSCFeeAnnual = totalCSCFee30d * 12;
  const avgAPR = investors.reduce((s, i) => s + i.aprPrevisto, 0) / investors.length;

  const barData = summaries.map(({ investor, summary }) => ({
    name: investor.name,
    comision: Math.round(summary.cscFee),
    rewards: Math.round(summary.rewards30d),
  }));

  const pieData = investors.map(inv => ({
    name: inv.name,
    value: inv.portfolioTotal,
  }));

  const totalV3Liq = investors.flatMap(i => i.v3Positions).reduce((s, p) => s + p.liquidity, 0);
  const totalCollateral = investors.flatMap(i => i.lending).reduce((s, l) =>
    s + l.collateral.reduce((a, c) => a + c.valueUSD, 0), 0);
  const totalDebt = investors.flatMap(i => i.lending).reduce((s, l) =>
    s + l.debt.reduce((a, d) => a + d.valueUSD, 0), 0);

  return (
    <div>
      <SectionHeader title="Totales CSC" sub="Vista del negocio CryptoStrategy Consulting" />

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="AUM Total" value={formatUSD(totalAUM)} color="blue" />
        <KpiCard label="Inversores Activos" value={investors.length.toString()} color="blue" />
        <KpiCard label="Total V3 Liquidez" value={formatUSD(totalV3Liq)} color="blue" />
        <KpiCard label="Total Colateral" value={formatUSD(totalCollateral)} color="green" />
        <KpiCard label="Total Deuda" value={formatUSD(totalDebt)} color="red" />
        <KpiCard label="APR Medio" value={`${avgAPR.toFixed(1)}%`} color="purple" />
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1E2A6E] rounded-xl p-6 text-white">
          <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Comisiones CSC proyectadas 30d</p>
          <p className="text-4xl font-bold">{formatUSD(totalCSCFee30d)}</p>
          <p className="text-blue-300 text-sm mt-2">50% del beneficio bruto generado</p>
        </div>
        <div className="bg-[#1A5C2A] rounded-xl p-6 text-white">
          <p className="text-green-200 text-sm uppercase tracking-wide mb-1">Comisiones CSC anualizadas</p>
          <p className="text-4xl font-bold">{formatUSD(totalCSCFeeAnnual)}</p>
          <p className="text-green-300 text-sm mt-2">Proyección basada en parámetros actuales</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1E2A6E] mb-4 text-sm uppercase tracking-wide">Comisiones proyectadas por inversor</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => formatUSD(v)} />
              <Bar dataKey="comision" name="Comisión CSC" fill="#1E2A6E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rewards" name="Rewards" fill="#D6E4F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1E2A6E] mb-4 text-sm uppercase tracking-wide">Distribución AUM por inversor</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatUSD(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-investor breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-[#1E2A6E] text-sm uppercase tracking-wide">Desglose por inversor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Inversor', 'Portfolio', 'APR Prev.', 'V3 Liq.', 'Rewards 30d', 'Botín Delta', 'B. Bruto', 'Com. CSC', 'B. Neto Inv.'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.map(({ investor, summary }, i) => (
                <tr key={investor.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-2.5 font-semibold text-[#1E2A6E]">{investor.name}</td>
                  <td className="px-4 py-2.5">{formatUSD(investor.portfolioTotal)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{investor.aprPrevisto}%</td>
                  <td className="px-4 py-2.5">{formatUSD(investor.v3Positions.reduce((s, p) => s + p.liquidity, 0))}</td>
                  <td className="px-4 py-2.5 text-[#1A5C2A] font-medium">{formatUSD(summary.rewards30d)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatUSD(summary.deltaBounty)}</td>
                  <td className="px-4 py-2.5 font-semibold">{formatUSD(summary.grossProfit)}</td>
                  <td className="px-4 py-2.5 font-bold text-[#1E2A6E]">{formatUSD(summary.cscFee)}</td>
                  <td className="px-4 py-2.5 text-[#1A5C2A]">{formatUSD(summary.netProfit)}</td>
                </tr>
              ))}
              <tr className="bg-[#1E2A6E] text-white font-bold">
                <td className="px-4 py-3" colSpan={4}>TOTALES</td>
                <td className="px-4 py-3">{formatUSD(summaries.reduce((s, r) => s + r.summary.rewards30d, 0))}</td>
                <td className="px-4 py-3">{formatUSD(summaries.reduce((s, r) => s + r.summary.deltaBounty, 0))}</td>
                <td className="px-4 py-3">{formatUSD(summaries.reduce((s, r) => s + r.summary.grossProfit, 0))}</td>
                <td className="px-4 py-3 text-yellow-300">{formatUSD(totalCSCFee30d)}</td>
                <td className="px-4 py-3">{formatUSD(summaries.reduce((s, r) => s + r.summary.netProfit, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
