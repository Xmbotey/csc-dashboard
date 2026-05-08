import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import { computeLendingPosition } from '../data/investors';
import { ExternalLink, FileText, Loader2, AlertTriangle, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAmt(n) {
  if (n === 0 || n == null) return '0';
  if (Math.abs(n) < 0.0001) return n.toFixed(8);
  if (Math.abs(n) < 0.01)   return n.toFixed(6);
  if (Math.abs(n) < 1)      return n.toFixed(4);
  if (Math.abs(n) < 1000)   return n.toFixed(4);
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtHF(hf) {
  if (hf === null || hf === undefined) return '—';
  if (!isFinite(hf) || hf > 99) return '> 9.99';
  return hf.toFixed(2);
}

function hfTextColor(hf) {
  if (hf === null || !isFinite(hf) || hf > 99) return 'text-green-600';
  if (hf < 1.5) return 'text-red-600';
  if (hf < 2.0) return 'text-orange-500';
  return 'text-green-600';
}

function hfBorderBg(hf) {
  if (hf === null || !isFinite(hf) || hf > 99) return 'bg-green-50 border-green-200';
  if (hf < 1.5) return 'bg-red-50 border-red-300';
  if (hf < 2.0) return 'bg-orange-50 border-orange-300';
  return 'bg-green-50 border-green-200';
}

function computeInvestorTotals(investor, prices) {
  const totalRewards = (investor.v3Positions || []).reduce((s, p) => s + (p.rewardsPending || 0), 0);
  const totalV3Liquidity = (investor.v3Positions || []).reduce((s, p) => s + (p.liquidity || 0), 0);
  let totalCollateral = 0, totalDebt = 0;
  (investor.lending || []).forEach(l => {
    const c = computeLendingPosition(l, prices);
    totalCollateral += c.totalCollateral;
    totalDebt += c.totalDebt;
  });
  const walletTotal = (investor.wallet || []).reduce((s, t) => s + (t.valueUSD || 0), 0);
  return { totalRewards, totalV3Liquidity, totalCollateral, totalDebt, walletTotal };
}

function SummaryPanel({ investors, prices, lastUpdated }) {
  const rows = investors.map(inv => ({ inv, ...computeInvestorTotals(inv, prices) }));
  const totals = rows.reduce((acc, r) => ({
    portfolio:  acc.portfolio  + (r.inv.portfolioTotal || 0),
    rewards:    acc.rewards    + r.totalRewards,
    liquidity:  acc.liquidity  + r.totalV3Liquidity,
    collateral: acc.collateral + r.totalCollateral,
    debt:       acc.debt       + r.totalDebt,
    wallet:     acc.wallet     + r.walletTotal,
  }), { portfolio: 0, rewards: 0, liquidity: 0, collateral: 0, debt: 0, wallet: 0 });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-x-auto">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[#1E2A6E]">Resumen del Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">Totales consolidados de todos los inversores</p>
        </div>
        {lastUpdated && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Calendar size={11} className="text-blue-400" />
            Última actualización: <strong className="text-[#1E2A6E]">{lastUpdated}</strong>
          </span>
        )}
      </div>
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="bg-[#1E2A6E] text-white">
            <th className="text-left px-3 py-2">Inversor</th>
            <th className="text-right px-3 py-2">Portfolio</th>
            <th className="text-right px-3 py-2">Liquidez V3</th>
            <th className="text-right px-3 py-2">Rewards Pend.</th>
            <th className="text-right px-3 py-2">Colateral</th>
            <th className="text-right px-3 py-2">Deuda</th>
            <th className="text-right px-3 py-2">Wallet</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ inv, totalRewards, totalV3Liquidity, totalCollateral, totalDebt, walletTotal }, i) => (
            <tr key={inv.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="px-3 py-1.5 font-medium text-[#1E2A6E]">{inv.name}</td>
              <td className="px-3 py-1.5 text-right font-mono">{fmt(inv.portfolioTotal)}</td>
              <td className="px-3 py-1.5 text-right font-mono">{totalV3Liquidity > 0 ? fmt(totalV3Liquidity) : '—'}</td>
              <td className={`px-3 py-1.5 text-right font-mono font-semibold ${totalRewards > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                {totalRewards > 0 ? fmt(totalRewards) : '—'}
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-green-700">{totalCollateral > 0 ? fmt(totalCollateral) : '—'}</td>
              <td className="px-3 py-1.5 text-right font-mono text-red-700">{totalDebt > 0 ? fmt(totalDebt) : '—'}</td>
              <td className="px-3 py-1.5 text-right font-mono">{walletTotal > 0 ? fmt(walletTotal) : '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#1E2A6E] text-white font-bold">
            <td className="px-3 py-2">TOTAL</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(totals.portfolio)}</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(totals.liquidity)}</td>
            <td className="px-3 py-2 text-right font-mono text-yellow-300">{fmt(totals.rewards)}</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(totals.collateral)}</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(totals.debt)}</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(totals.wallet)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function InvestorReportCard({ investor, prices }) {
  const totals = computeInvestorTotals(investor, prices);
  const lendingWithComputed = (investor.lending || []).map(l => ({
    ...l,
    computed: computeLendingPosition(l, prices),
    displayHF: l.reportedHF != null ? l.reportedHF : computeLendingPosition(l, prices).healthFactor,
  }));
  const hfValues = lendingWithComputed.map(l => l.displayHF).filter(h => h !== null && isFinite(h));
  const minHF = hfValues.length > 0 ? Math.min(...hfValues) : null;

  const walletFiltered = (investor.wallet || []).filter(t => (t.valueUSD || 0) >= 0.01 || t.amount > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="bg-[#1E2A6E] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {investor.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{investor.name}</h3>
            <span className="text-blue-200 text-xs font-mono">{fmt(investor.portfolioTotal)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {minHF !== null && minHF < 1.5 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={10} /> CRÍTICO · HF {fmtHF(minHF)}
            </span>
          )}
          {minHF !== null && minHF >= 1.5 && minHF < 2.0 && (
            <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={10} /> VIGILANCIA · HF {fmtHF(minHF)}
            </span>
          )}
          <a href={investor.debankUrl} target="_blank" rel="noreferrer"
             className="text-blue-200 hover:text-white text-xs flex items-center gap-1 transition">
            DeBank <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 bg-gray-50 border-b border-gray-100 text-xs">
        {[
          { label: 'Wallet',      value: fmt(totals.walletTotal),      color: 'text-gray-700' },
          { label: 'Liquidez V3', value: totals.totalV3Liquidity > 0 ? fmt(totals.totalV3Liquidity) : '—', color: 'text-[#1E2A6E]' },
          { label: 'Colateral',   value: totals.totalCollateral > 0 ? fmt(totals.totalCollateral) : '—',   color: 'text-green-700' },
          { label: 'Deuda',       value: totals.totalDebt > 0 ? fmt(totals.totalDebt) : '—',               color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="px-4 py-2 text-center">
            <div className="text-gray-400 text-[10px] uppercase tracking-wide">{s.label}</div>
            <div className={`font-mono font-semibold mt-0.5 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="p-4 space-y-5">
        {/* Wallet */}
        {walletFiltered.length > 0 && (
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-1 font-medium text-gray-400 w-24">Activo</th>
                  <th className="text-right pb-1 font-medium text-gray-400">Cantidad</th>
                  <th className="text-right pb-1 font-medium text-gray-400">Valor USD</th>
                </tr>
              </thead>
              <tbody>
                {walletFiltered.map((t, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1 font-semibold text-[#1E2A6E]">{t.asset}</td>
                    <td className="py-1 text-right font-mono text-gray-600">{fmtAmt(t.amount)}</td>
                    <td className="py-1 text-right font-mono text-gray-800">{fmt(t.valueUSD)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="py-1 text-gray-500 font-semibold text-[10px] uppercase">Total</td>
                  <td></td>
                  <td className="py-1 text-right font-mono font-semibold text-gray-700">{fmt(totals.walletTotal)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* V3 / DeFi Positions */}
        {(investor.v3Positions || []).length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posiciones DeFi</h4>
              {totals.totalRewards > 0 && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Rewards: {fmt(totals.totalRewards)}
                </span>
              )}
            </div>
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-1 font-medium text-gray-400">ID / Posición</th>
                  <th className="text-left pb-1 font-medium text-gray-400">Protocolo · Red</th>
                  <th className="text-right pb-1 font-medium text-gray-400">Liquidez</th>
                  <th className="text-right pb-1 font-medium text-gray-400">Rewards Pend.</th>
                </tr>
              </thead>
              <tbody>
                {investor.v3Positions.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1">
                      <span className="font-mono text-[10px] text-gray-500">{p.id}</span>
                      <span className="ml-1 text-gray-700">{p.pool}</span>
                    </td>
                    <td className="py-1 text-gray-500">{p.protocol} · {p.network}</td>
                    <td className="py-1 text-right font-mono">{p.liquidity > 0 ? fmt(p.liquidity) : '—'}</td>
                    <td className={`py-1 text-right font-mono font-semibold ${p.rewardsPending > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                      {p.rewardsPending > 0 ? fmt(p.rewardsPending) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Lending */}
        {lendingWithComputed.length > 0 && (
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lending</h4>
            <div className="space-y-3">
              {lendingWithComputed.map((l, i) => {
                const hf = l.displayHF;
                return (
                  <div key={i} className={`rounded-lg border p-3 ${hfBorderBg(hf)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xs text-gray-700">{l.protocol} · {l.network}</span>
                      <span className={`font-bold text-base font-mono ${hfTextColor(hf)}`}>
                        HF {fmtHF(hf)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Collateral */}
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Colateral</div>
                        <table className="w-full">
                          <tbody>
                            {l.computed.collateralItems.map((c, ci) => (
                              <tr key={ci}>
                                <td className="py-0.5 text-gray-600 font-medium">{c.asset}</td>
                                <td className="py-0.5 text-right font-mono text-gray-500">{fmtAmt(c.amount)}</td>
                                <td className="py-0.5 text-right font-mono text-green-700 pl-2">{fmt(c.computedValueUSD)}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-200 font-semibold">
                              <td className="pt-1 text-gray-500 text-[10px] uppercase">Total</td>
                              <td></td>
                              <td className="pt-1 text-right font-mono text-green-700">{fmt(l.computed.totalCollateral)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      {/* Debt */}
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Deuda</div>
                        <table className="w-full">
                          <tbody>
                            {l.computed.debtItems.map((d, di) => (
                              <tr key={di}>
                                <td className="py-0.5 text-gray-600 font-medium">{d.asset}</td>
                                <td className="py-0.5 text-right font-mono text-gray-500">{fmtAmt(d.amount)}</td>
                                <td className="py-0.5 text-right font-mono text-red-700 pl-2">{fmt(d.computedValueUSD)}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-200 font-semibold">
                              <td className="pt-1 text-gray-500 text-[10px] uppercase">Total</td>
                              <td></td>
                              <td className="pt-1 text-right font-mono text-red-700">{fmt(l.computed.totalDebt)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Liquidation reference */}
                    {(l.liquidationPriceETH || l.liquidationPriceXRP || l.liquidationPriceBNB) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
                        {l.liquidationPriceETH && <>Liq. ETH: <span className="font-mono text-gray-600">${l.liquidationPriceETH.toLocaleString()}</span></>}
                        {l.liquidationPriceXRP && <>Liq. XRP: <span className="font-mono text-gray-600">${l.liquidationPriceXRP}</span></>}
                        {l.liquidationPriceBNB && <>{l.liquidationPriceETH || l.liquidationPriceXRP ? ' · ' : ''}Liq. BNB: <span className="font-mono text-gray-600">${l.liquidationPriceBNB.toLocaleString()}</span></>}
                      </div>
                    )}
                    {l.reportedHF != null && (
                      <div className="mt-1 text-[10px] text-gray-400 italic">* HF reportado por el protocolo</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(investor.v3Positions || []).length === 0 && lendingWithComputed.length === 0 && (
          <p className="text-xs text-gray-400 italic">Sin posiciones DeFi activas</p>
        )}
      </div>
    </div>
  );
}

export default function DatosActuales() {
  const { investors, prices } = useApp();
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const lastUpdated = prices.lastUpdated
    ? new Date(prices.lastUpdated).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const generatePdf = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 36;

      // ── COVER ──────────────────────────────────────────────────────────
      pdf.setFillColor(30, 42, 110);
      pdf.rect(0, 0, pageW, 120, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.setTextColor(255);
      pdf.text('CSC Dashboard', margin, 55);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Informe de Datos Actuales', margin, 80);
      pdf.setFontSize(10);
      pdf.setTextColor(180, 200, 255);
      pdf.text(`Actualización: ${lastUpdated || '—'}`, margin, 100);
      pdf.setTextColor(0);

      // Global totals on cover
      let cy = 145;
      const allTotals = investors.reduce((acc, inv) => {
        const t = computeInvestorTotals(inv, prices);
        return {
          portfolio:  acc.portfolio  + (inv.portfolioTotal || 0),
          rewards:    acc.rewards    + t.totalRewards,
          liquidity:  acc.liquidity  + t.totalV3Liquidity,
          collateral: acc.collateral + t.totalCollateral,
          debt:       acc.debt       + t.totalDebt,
          wallet:     acc.wallet     + t.walletTotal,
        };
      }, { portfolio: 0, rewards: 0, liquidity: 0, collateral: 0, debt: 0, wallet: 0 });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 42, 110);
      pdf.text('RESUMEN GLOBAL', margin, cy);
      cy += 15;

      const coverStats = [
        { label: 'Portfolio Total AUM', value: fmt(allTotals.portfolio) },
        { label: 'Rewards Pendientes', value: fmt(allTotals.rewards) },
        { label: 'Liquidez V3 Total', value: fmt(allTotals.liquidity) },
        { label: 'Inversores', value: investors.length.toString() },
        { label: 'Colateral Total', value: fmt(allTotals.collateral) },
        { label: 'Deuda Total', value: fmt(allTotals.debt) },
      ];

      coverStats.forEach((s, i) => {
        const col = i % 2 === 0 ? margin : pageW / 2;
        if (i % 2 === 0 && i > 0) cy += 30;
        pdf.setFillColor(244, 246, 255);
        pdf.rect(col, cy, pageW / 2 - 10, 26, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(s.label, col + 6, cy + 11);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 42, 110);
        pdf.text(s.value, col + 6, cy + 23);
        pdf.setTextColor(0);
        if (i % 2 === 1) cy += 30;
      });

      // ── PER INVESTOR ───────────────────────────────────────────────────
      for (const investor of investors) {
        pdf.addPage();
        const t = computeInvestorTotals(investor, prices);
        const lendingData = (investor.lending || []).map(l => ({
          ...l,
          computed: computeLendingPosition(l, prices),
          displayHF: l.reportedHF != null ? l.reportedHF : computeLendingPosition(l, prices).healthFactor,
        }));

        // Investor header
        pdf.setFillColor(30, 42, 110);
        pdf.rect(0, 0, pageW, 50, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(255);
        pdf.text(investor.name, margin, 28);
        pdf.setFontSize(11);
        pdf.text(fmt(investor.portfolioTotal), margin + 80, 28);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(180, 200, 255);
        pdf.text(investor.debankUrl, margin, 42);
        pdf.setTextColor(0);

        // Stats bar
        let mx = margin;
        const mw = (pageW - margin * 2) / 4;
        [
          { label: 'Wallet', value: fmt(t.walletTotal) },
          { label: 'Liquidez V3', value: fmt(t.totalV3Liquidity) },
          { label: 'Colateral', value: fmt(t.totalCollateral) },
          { label: 'Deuda', value: fmt(t.totalDebt) },
        ].forEach(m => {
          pdf.setFillColor(245, 247, 255);
          pdf.rect(mx, 54, mw - 4, 26, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text(m.label, mx + 4, 64);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(30, 42, 110);
          pdf.text(m.value, mx + 4, 76);
          mx += mw;
        });
        pdf.setTextColor(0);

        let py = 92;

        // Wallet table
        if ((investor.wallet || []).some(w => (w.valueUSD || 0) > 0.01)) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(30, 42, 110);
          pdf.text('WALLET', margin, py);
          py += 8;
          pdf.setFillColor(30, 42, 110);
          pdf.rect(margin, py, pageW - margin * 2, 13, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(255);
          pdf.text('Activo', margin + 3, py + 9);
          pdf.text('Cantidad', margin + 80, py + 9);
          pdf.text('Valor USD', margin + 180, py + 9);
          py += 13;
          investor.wallet.filter(w => (w.valueUSD || 0) > 0).forEach((w, wi) => {
            if (wi % 2 === 0) { pdf.setFillColor(248, 249, 255); pdf.rect(margin, py, pageW - margin * 2, 12, 'F'); }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0);
            pdf.text(w.asset, margin + 3, py + 8);
            pdf.text(fmtAmt(w.amount), margin + 80, py + 8);
            pdf.text(fmt(w.valueUSD), margin + 180, py + 8);
            py += 12;
          });
          py += 6;
        }

        // V3 positions
        if ((investor.v3Positions || []).length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(30, 42, 110);
          pdf.text('POSICIONES DeFi', margin, py);
          py += 8;
          pdf.setFillColor(30, 42, 110);
          pdf.rect(margin, py, pageW - margin * 2, 13, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(255);
          pdf.text('ID', margin + 3, py + 9);
          pdf.text('Pool · Protocolo', margin + 70, py + 9);
          pdf.text('Liquidez', margin + 260, py + 9);
          pdf.text('Rewards Pend.', margin + 350, py + 9);
          py += 13;
          investor.v3Positions.forEach((p, pi) => {
            if (pi % 2 === 0) { pdf.setFillColor(248, 249, 255); pdf.rect(margin, py, pageW - margin * 2, 12, 'F'); }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0);
            pdf.text(p.id, margin + 3, py + 8);
            pdf.text(`${p.pool} · ${p.protocol} · ${p.network}`, margin + 70, py + 8);
            pdf.text(p.liquidity > 0 ? fmt(p.liquidity) : '—', margin + 260, py + 8);
            if (p.rewardsPending > 0) pdf.setTextColor(26, 120, 50);
            pdf.text(p.rewardsPending > 0 ? fmt(p.rewardsPending) : '—', margin + 350, py + 8);
            pdf.setTextColor(0);
            py += 12;
          });
          if (t.totalRewards > 0) {
            pdf.setFillColor(220, 240, 220);
            pdf.rect(margin, py, pageW - margin * 2, 13, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(26, 120, 50);
            pdf.text('Total Rewards Pendientes', margin + 3, py + 9);
            pdf.text(fmt(t.totalRewards), margin + 350, py + 9);
            pdf.setTextColor(0);
            py += 13;
          }
          py += 6;
        }

        // Lending
        lendingData.forEach(l => {
          if (py > pageH - 80) { pdf.addPage(); py = margin; }
          const hf = l.displayHF;
          const hfStr = fmtHF(hf);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(30, 42, 110);
          pdf.text(`LENDING: ${l.protocol} · ${l.network}`, margin, py);
          const hfColor = hf !== null && isFinite(hf) && hf < 1.5 ? [200, 0, 0] :
                          hf !== null && isFinite(hf) && hf < 2.0 ? [200, 100, 0] : [26, 120, 50];
          pdf.setTextColor(...hfColor);
          pdf.text(`HF ${hfStr}`, pageW - margin - 50, py);
          pdf.setTextColor(0);
          py += 8;

          pdf.setFillColor(30, 42, 110);
          pdf.rect(margin, py, (pageW - margin * 2) / 2 - 4, 12, 'F');
          pdf.setFontSize(7.5);
          pdf.setTextColor(255);
          pdf.text('Colateral', margin + 3, py + 8);
          const rightX = margin + (pageW - margin * 2) / 2 + 4;
          pdf.setFillColor(30, 42, 110);
          pdf.rect(rightX, py, (pageW - margin * 2) / 2 - 4, 12, 'F');
          pdf.text('Deuda', rightX + 3, py + 8);
          py += 12;

          const maxRows = Math.max(l.computed.collateralItems.length, l.computed.debtItems.length);
          for (let r = 0; r < maxRows; r++) {
            const c = l.computed.collateralItems[r];
            const d = l.computed.debtItems[r];
            if (r % 2 === 0) {
              pdf.setFillColor(248, 249, 255);
              pdf.rect(margin, py, pageW - margin * 2, 12, 'F');
            }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0);
            if (c) {
              pdf.text(`${c.asset}  ${fmtAmt(c.amount)}`, margin + 3, py + 8);
              pdf.setTextColor(26, 120, 50);
              pdf.text(fmt(c.computedValueUSD), margin + (pageW - margin * 2) / 2 - 55, py + 8);
              pdf.setTextColor(0);
            }
            if (d) {
              pdf.text(`${d.asset}  ${fmtAmt(d.amount)}`, rightX + 3, py + 8);
              pdf.setTextColor(160, 0, 0);
              pdf.text(fmt(d.computedValueUSD), rightX + (pageW - margin * 2) / 2 - 55, py + 8);
              pdf.setTextColor(0);
            }
            py += 12;
          }
          py += 8;
        });
      }

      // ── SUMMARY TABLE ──────────────────────────────────────────────────
      pdf.addPage();
      pdf.setFillColor(30, 42, 110);
      pdf.rect(0, 0, pageW, 50, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255);
      pdf.text('Resumen Total — Todos los Inversores', margin, 32);
      pdf.setTextColor(0);

      let sy = 65;
      const colW = (pageW - margin * 2) / 7;
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 15, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(255);
      ['Inversor', 'Portfolio', 'Liquidez V3', 'Rewards Pend.', 'Colateral', 'Deuda', 'Wallet'].forEach((h, i) => {
        pdf.text(h, margin + 3 + i * colW, sy + 10);
      });
      sy += 15;

      let grandTotals = { portfolio: 0, liquidity: 0, rewards: 0, collateral: 0, debt: 0, wallet: 0 };
      investors.forEach((investor, idx) => {
        const t = computeInvestorTotals(investor, prices);
        grandTotals.portfolio  += investor.portfolioTotal || 0;
        grandTotals.liquidity  += t.totalV3Liquidity;
        grandTotals.rewards    += t.totalRewards;
        grandTotals.collateral += t.totalCollateral;
        grandTotals.debt       += t.totalDebt;
        grandTotals.wallet     += t.walletTotal;
        if (idx % 2 === 0) { pdf.setFillColor(246, 248, 255); pdf.rect(margin, sy, pageW - margin * 2, 15, 'F'); }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(0);
        [
          investor.name,
          fmt(investor.portfolioTotal),
          t.totalV3Liquidity > 0 ? fmt(t.totalV3Liquidity) : '—',
          t.totalRewards > 0 ? fmt(t.totalRewards) : '—',
          t.totalCollateral > 0 ? fmt(t.totalCollateral) : '—',
          t.totalDebt > 0 ? fmt(t.totalDebt) : '—',
          t.walletTotal > 0 ? fmt(t.walletTotal) : '—',
        ].forEach((v, i) => {
          if (i === 3 && t.totalRewards > 0) pdf.setTextColor(26, 120, 50);
          else if (i === 5 && t.totalDebt > 0) pdf.setTextColor(160, 0, 0);
          else if (i === 4 && t.totalCollateral > 0) pdf.setTextColor(26, 120, 50);
          else pdf.setTextColor(0);
          pdf.text(v, margin + 3 + i * colW, sy + 10);
        });
        sy += 15;
      });

      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 18, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      ['TOTAL', fmt(grandTotals.portfolio), fmt(grandTotals.liquidity), fmt(grandTotals.rewards), fmt(grandTotals.collateral), fmt(grandTotals.debt), fmt(grandTotals.wallet)].forEach((v, i) => {
        pdf.setTextColor(i === 3 ? 255 : i === 3 ? 255 : 255);
        if (i === 3) pdf.setTextColor(255, 230, 100);
        else pdf.setTextColor(255);
        pdf.text(v, margin + 3 + i * colW, sy + 12);
      });

      pdf.save(`CSC-Informe-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="pb-10">
      <SectionHeader
        title="Datos Actuales"
        sub={lastUpdated ? `Informe estructurado de posiciones — Última actualización: ${lastUpdated}` : 'Informe estructurado de posiciones'}
      />

      <SummaryPanel investors={investors} prices={prices} lastUpdated={lastUpdated} />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={generatePdf}
          disabled={generatingPdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1E2A6E] text-[#1E2A6E] text-sm font-semibold hover:bg-blue-50 transition disabled:opacity-60"
        >
          {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {generatingPdf ? 'Generando PDF…' : 'Exportar Informe PDF'}
        </button>

        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <Calendar size={12} className="text-blue-400" />
          Precios: ETH ${prices.ETH?.toLocaleString()} · BNB ${prices.BNB?.toLocaleString()} · XRP ${prices.XRP}
        </span>
      </div>

      <div className="space-y-5">
        {investors.map(inv => (
          <InvestorReportCard key={inv.id} investor={inv} prices={prices} />
        ))}
      </div>
    </div>
  );
}
