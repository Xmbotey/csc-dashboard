import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUSD, getV3Status } from '../data/investors';
import { KpiCard, SectionHeader, Card } from '../components/ui';

function calcProjections(investor, prices, apr, dias, ns) {
  const activeV3Liq = investor.v3Positions
    .filter(p => getV3Status(p, prices) === 'IN_RANGE')
    .reduce((s, p) => s + p.liquidity, 0);

  const rewards = activeV3Liq * (apr / 100) * (dias / 365);
  const rewardsAnnual = activeV3Liq * (apr / 100);
  const deltaBounty = (investor.deltas || [])
    .filter(d => d.status === 'ACTIVO')
    .reduce((s, d) => s + d.ethBorrowed * (d.activationPrice - ns), 0);
  const gross = rewards + deltaBounty;
  const cscFee = gross * 0.5;
  const net = gross * 0.5;
  return { rewards, rewardsAnnual, deltaBounty, gross, cscFee, net, activeV3Liq };
}

export default function Proyecciones() {
  const { investors, prices, updateInvestor } = useApp();

  const [params, setParams] = useState(
    Object.fromEntries(investors.map(inv => [
      inv.id,
      { apr: inv.aprPrevisto, dias: inv.diasRestantes, ns: inv.nsEstimado }
    ]))
  );

  const setParam = (id, key, value) => {
    setParams(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const handleSaveAll = () => {
    investors.forEach(inv => {
      const p = params[inv.id];
      updateInvestor(inv.id, { aprPrevisto: p.apr, diasRestantes: p.dias, nsEstimado: p.ns });
    });
  };

  const rows = investors.map(inv => {
    const p = params[inv.id];
    const proj = calcProjections(inv, prices, p.apr, p.dias, p.ns);
    return { investor: inv, proj };
  });

  const totalRewards = rows.reduce((s, r) => s + r.proj.rewards, 0);
  const totalDelta = rows.reduce((s, r) => s + r.proj.deltaBounty, 0);
  const totalGross = rows.reduce((s, r) => s + r.proj.gross, 0);
  const totalCSC = rows.reduce((s, r) => s + r.proj.cscFee, 0);
  const totalNet = rows.reduce((s, r) => s + r.proj.net, 0);

  const inputCls = "w-16 px-1.5 py-1 text-xs border border-yellow-300 rounded bg-[#FFF9C4] text-center focus:outline-none focus:border-yellow-500";

  return (
    <div>
      <SectionHeader title="Proyecciones" sub="Simulador de rendimientos por inversor — editar valores en amarillo" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <KpiCard label="Total Rewards 30d" value={formatUSD(totalRewards)} color="green" />
        <KpiCard label="Total Botín Delta" value={formatUSD(totalDelta)} color="blue" />
        <KpiCard label="Total Beneficio Bruto" value={formatUSD(totalGross)} color="blue" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1E2A6E] text-white">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Inversor</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-center">APR %</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-center">Días</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-center">Ns ($)</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right">V3 Activa</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right">Rewards</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right">Botín Delta</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right">Beneficio Bruto</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right bg-[#162060]">Comisión CSC</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-right">B. Neto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ investor, proj }, i) => {
                const p = params[investor.id];
                return (
                  <tr key={investor.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30`}>
                    <td className="px-4 py-2.5 font-semibold text-[#1E2A6E]">{investor.name}</td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="number" value={p.apr} onChange={e => setParam(investor.id, 'apr', Number(e.target.value))} className={inputCls} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="number" value={p.dias} onChange={e => setParam(investor.id, 'dias', Number(e.target.value))} className={inputCls} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="number" value={p.ns} onChange={e => setParam(investor.id, 'ns', Number(e.target.value))} className={`${inputCls} w-20`} />
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{formatUSD(proj.activeV3Liq)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-[#1A5C2A]">{formatUSD(proj.rewards)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{formatUSD(proj.deltaBounty)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{formatUSD(proj.gross)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-[#1E2A6E] bg-[#D6E4F7]">{formatUSD(proj.cscFee)}</td>
                    <td className="px-3 py-2.5 text-right text-[#1A5C2A]">{formatUSD(proj.net)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#1E2A6E] text-white font-bold">
                <td className="px-4 py-3 text-sm" colSpan={5}>TOTALES CSC</td>
                <td className="px-3 py-3 text-right">{formatUSD(totalRewards)}</td>
                <td className="px-3 py-3 text-right">{formatUSD(totalDelta)}</td>
                <td className="px-3 py-3 text-right">{formatUSD(totalGross)}</td>
                <td className="px-3 py-3 text-right text-yellow-300 text-base bg-[#162060]">{formatUSD(totalCSC)}</td>
                <td className="px-3 py-3 text-right">{formatUSD(totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-5 bg-[#D6E4F7] border-[#2E4A9E]">
          <p className="text-xs text-[#1E2A6E] opacity-70 uppercase tracking-wide mb-1">Comisiones CSC 30 días</p>
          <p className="text-3xl font-bold text-[#1E2A6E]">{formatUSD(totalCSC)}</p>
        </Card>
        <Card className="p-5 bg-[#D6F0DC] border-[#1A5C2A]">
          <p className="text-xs text-[#1A5C2A] opacity-70 uppercase tracking-wide mb-1">Comisiones CSC Anualizadas</p>
          <p className="text-3xl font-bold text-[#1A5C2A]">{formatUSD(totalCSC * 12)}</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSaveAll} className="px-5 py-2 bg-[#1E2A6E] text-white text-sm rounded-lg hover:bg-[#2E4A9E] transition-colors">
          Guardar todos los parámetros
        </button>
      </div>
    </div>
  );
}
