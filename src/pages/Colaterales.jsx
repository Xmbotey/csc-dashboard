import { useApp } from '../context/AppContext';
import { formatUSD, computeLendingPosition } from '../data/investors';
import { KpiCard, SectionHeader } from '../components/ui';

export default function Colaterales() {
  const { investors, prices } = useApp();

  const allLending = investors.flatMap(inv =>
    inv.lending.map(l => {
      const computed = computeLendingPosition(l, prices);
      return {
        ...l,
        investorName: inv.name,
        investorId: inv.id,
        totalCollateral: computed.totalCollateral,
        totalDebt: computed.totalDebt,
        healthFactor: computed.healthFactor,
        collateralItems: computed.collateralItems,
        debtItems: computed.debtItems,
      };
    })
  ).sort((a, b) => (a.healthFactor ?? 99) - (b.healthFactor ?? 99));

  const totalCollateral = allLending.reduce((s, l) => s + l.totalCollateral, 0);
  const totalDebt = allLending.reduce((s, l) => s + l.totalDebt, 0);

  const investorMinHF = {};
  allLending.forEach(l => {
    const hf = l.healthFactor;
    if (hf !== null && (!investorMinHF[l.investorId] || hf < investorMinHF[l.investorId])) {
      investorMinHF[l.investorId] = hf;
    }
  });
  const criticalCount = Object.values(investorMinHF).filter(hf => hf < 1.5).length;
  const vigilanceCount = Object.values(investorMinHF).filter(hf => hf >= 1.5 && hf < 2.0).length;

  return (
    <div>
      <SectionHeader title="Colaterales & Deuda" sub="Posiciones ordenadas por riesgo (menor HF primero) — HF recalculado con precios actuales" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Total Colateral" value={formatUSD(totalCollateral)} color="green" />
        <KpiCard label="Total Deuda" value={formatUSD(totalDebt)} color="red" />
        <KpiCard label="Zona Crítica (HF<1.5)" value={criticalCount.toString()} color={criticalCount > 0 ? 'red' : 'green'} />
        <KpiCard label="Vigilancia (HF<2.0)" value={vigilanceCount.toString()} color={vigilanceCount > 0 ? 'orange' : 'green'} />
      </div>

      <div className="space-y-3">
        {allLending.map((l, i) => {
          const hf = l.healthFactor;
          const hfColor = hf >= 2 ? '#1A5C2A' : hf >= 1.5 ? '#E06000' : '#8B0000';
          const hfBg   = hf >= 2 ? '#D6F0DC' : hf >= 1.5 ? '#FFF3E0' : '#FFE8E8';
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ borderLeftWidth: 4, borderLeftColor: hfColor }}
            >
              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1E2A6E]">{l.investorName}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{l.protocol}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{l.network}</span>
                  </div>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-400">Colateral</p>
                      <p className="font-semibold text-[#1A5C2A]">{formatUSD(l.totalCollateral)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Deuda</p>
                      <p className="font-semibold text-[#8B0000]">{formatUSD(l.totalDebt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ratio</p>
                      <p className="font-semibold">{(l.totalCollateral / (l.totalDebt || 1)).toFixed(2)}x</p>
                    </div>
                    {l.liquidationPriceETH && (
                      <div>
                        <p className="text-xs text-gray-400">Liq. ETH</p>
                        <p className="font-semibold text-[#8B0000]">${l.liquidationPriceETH.toLocaleString()}</p>
                      </div>
                    )}
                    {l.liquidationPriceXRP && (
                      <div>
                        <p className="text-xs text-gray-400">Liq. XRP</p>
                        <p className="font-semibold text-[#8B0000]">${l.liquidationPriceXRP}</p>
                      </div>
                    )}
                    {l.liquidationPriceBNB && (
                      <div>
                        <p className="text-xs text-gray-400">Liq. BNB</p>
                        <p className="font-semibold text-[#8B0000]">${l.liquidationPriceBNB.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="px-4 py-2 rounded-lg text-center" style={{ backgroundColor: hfBg, color: hfColor }}>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Health Factor</p>
                    <p className="text-2xl font-bold">{hf !== null ? hf.toFixed(2) : '—'}</p>
                    {hf < 1.5 && <p className="text-xs font-bold animate-pulse-red">⚠ CRÍTICO</p>}
                    {hf >= 1.5 && hf < 2.0 && <p className="text-xs font-medium">VIGILANCIA</p>}
                    {hf >= 2.0 && <p className="text-xs font-medium">SEGURO</p>}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#D6F0DC] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#1A5C2A] mb-2 uppercase tracking-wide">Colaterales</p>
                    <div className="space-y-1">
                      {l.collateralItems.map((c, j) => (
                        <div key={j} className="flex justify-between text-xs">
                          <span className="font-medium text-[#1A5C2A]">{c.amount.toLocaleString()} {c.asset}</span>
                          <span className="text-[#1A5C2A]">{formatUSD(c.computedValueUSD)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FFE8E8] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#8B0000] mb-2 uppercase tracking-wide">Deudas</p>
                    <div className="space-y-1">
                      {l.debtItems.filter(d => d.amount > 0).map((d, j) => (
                        <div key={j} className="flex justify-between text-xs">
                          <span className="font-medium text-[#8B0000]">{d.amount.toLocaleString()} {d.asset}</span>
                          <span className="text-[#8B0000]">{formatUSD(d.computedValueUSD)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
