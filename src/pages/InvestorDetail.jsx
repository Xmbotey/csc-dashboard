import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { getInvestorSummary, getV3Status, formatUSD, formatUSD2, getHFColor, getDaysInfo, hasLowGas, computeLendingPosition } from '../data/investors';
import {
  Card, Badge, HFBadge, V3StatusBadge, InvestorStatusBadge,
  Table, Th, Td, SectionHeader, HFGauge, EditableInput
} from '../components/ui';
import { ArrowLeft, Edit2, Save } from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'v3', label: 'Posiciones V3' },
  { id: 'deltas', label: 'Deltas' },
  { id: 'colateral', label: 'Colateral & Deuda' },
  { id: 'proyecciones', label: 'Proyecciones' },
];

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investors, prices, updateInvestor } = useApp();
  const [activeTab, setActiveTab] = useState('resumen');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  const investor = investors.find(i => i.id === id);
  if (!investor) return <div className="p-8 text-center text-gray-500">Inversor no encontrado.</div>;

  const summary = getInvestorSummary(investor, prices);

  const handleEdit = () => {
    setEditData({ portfolioTotal: investor.portfolioTotal, pe: investor.pe });
    setEditing(true);
  };
  const handleSave = () => {
    if (editData) updateInvestor(id, editData);
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/inversores')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1E2A6E]">{investor.name}</h1>
          <p className="text-sm text-gray-500">Detalle completo del inversor</p>
        </div>
        <InvestorStatusBadge status={summary.status} />
        {!editing ? (
          <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1E2A6E] text-[#1E2A6E] text-xs rounded-lg hover:bg-[#D6E4F7]">
            <Edit2 size={13} /> Editar
          </button>
        ) : (
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A5C2A] text-white text-xs rounded-lg">
            <Save size={13} /> Guardar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#1E2A6E] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-[#D6E4F7] hover:text-[#1E2A6E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && <TabResumen investor={investor} summary={summary} prices={prices} editing={editing} editData={editData} setEditData={setEditData} />}
      {activeTab === 'v3' && <TabV3 investor={investor} prices={prices} />}
      {activeTab === 'deltas' && <TabDeltas investor={investor} />}
      {activeTab === 'colateral' && <TabColateral investor={investor} prices={prices} />}
      {activeTab === 'proyecciones' && <TabProyecciones investor={investor} summary={summary} updateInvestor={updateInvestor} />}
    </div>
  );
}

function TabResumen({ investor, summary, prices, editing, editData, setEditData }) {
  const totalCollateral = investor.lending.reduce((s, l) => s + l.collateral.reduce((a, c) => a + c.valueUSD, 0), 0);
  const totalDebt = investor.lending.reduce((s, l) => s + l.debt.reduce((a, d) => a + d.valueUSD, 0), 0);
  const totalV3Liq = investor.v3Positions.reduce((s, p) => s + p.liquidity, 0);
  const freeCapital = Math.max(0, investor.portfolioTotal - totalV3Liq - totalCollateral);
  const { daysActive, daysToComplete } = getDaysInfo(investor.startDate);
  const gasInfo = hasLowGas(investor.wallet || []);
  const wallet = investor.wallet || [];
  const totalWallet = wallet.reduce((s, t) => s + t.valueUSD, 0);

  const pieData = [
    { name: 'V3 Liquidez', value: totalV3Liq, color: '#2E4A9E' },
    { name: 'Colateral', value: totalCollateral, color: '#1A5C2A' },
    { name: 'Libre', value: freeCapital, color: '#D6E4F7' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-[#1E2A6E] mb-4 text-sm uppercase tracking-wide">Datos Básicos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Portfolio Total</p>
              {editing ? (
                <EditableInput value={editData.portfolioTotal} onChange={v => setEditData(d => ({ ...d, portfolioTotal: v }))} />
              ) : (
                <p className="font-bold text-[#1E2A6E] text-lg">{formatUSD(investor.portfolioTotal)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">PE Inicial</p>
              {editing ? (
                <EditableInput value={editData.pe} onChange={v => setEditData(d => ({ ...d, pe: v }))} />
              ) : (
                <p className="font-bold text-[#1E2A6E] text-lg">{formatUSD(investor.pe)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">V3 En Rango</p>
              <p className="font-semibold">{summary.activeV3Count} / {summary.totalV3Count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rewards Pendientes</p>
              <p className="font-semibold text-[#1A5C2A]">{formatUSD(summary.totalRewards)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">HF Mínimo</p>
              <HFBadge hf={summary.minHF} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ns Estimado</p>
              <p className="font-semibold">{formatUSD(investor.nsEstimado)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Colateral</p>
              <p className="font-semibold">{formatUSD(totalCollateral)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Deuda</p>
              <p className="font-semibold text-[#8B0000]">{formatUSD(totalDebt)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-[#1E2A6E] mb-3 text-sm uppercase tracking-wide">Composición</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => formatUSD(v)} />
              <Legend iconSize={10} formatter={v => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Días activos ──────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="font-semibold text-[#1E2A6E] mb-3 text-sm uppercase tracking-wide">Actividad de la billetera</h3>
        {daysActive === null ? (
          <p className="text-sm text-gray-400 italic">Pendiente de actualizar</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500">Días activos</p>
              <p className="text-2xl font-bold text-[#1E2A6E]">{daysActive}</p>
              <p className="text-xs text-gray-400">desde {investor.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Días para completar el año</p>
              <p className={`text-2xl font-bold ${daysToComplete === 0 ? 'text-[#1A5C2A]' : 'text-[#E06000]'}`}>
                {daysToComplete === 0 ? '¡Completado!' : daysToComplete}
              </p>
              <p className="text-xs text-gray-400">
                {daysToComplete > 0 ? `vence el ${new Date(new Date(investor.startDate).getTime() + 365 * 86400000).toLocaleDateString('es-ES')}` : '365 días cumplidos'}
              </p>
            </div>
            <div className="flex-1 min-w-40">
              <p className="text-xs text-gray-500 mb-1.5">Progreso anual</p>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (daysActive / 365) * 100).toFixed(1)}%`,
                    background: daysToComplete === 0 ? '#1A5C2A' : '#1E2A6E',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.min(100, ((daysActive / 365) * 100)).toFixed(1)}% completado</p>
            </div>
          </div>
        )}
      </Card>

      {/* ── Wallet / Gas ──────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1E2A6E] text-sm uppercase tracking-wide">Wallet</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Total: {formatUSD(totalWallet)}</span>
            {gasInfo.anyLow && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#8B0000] text-white text-xs font-bold rounded-full animate-pulse-red">
                ⚠ GAS BAJO
              </span>
            )}
          </div>
        </div>

        {wallet.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Pendiente de actualizar</p>
        ) : (
          <div className="space-y-1">
            {wallet.map((token, i) => {
              const isGasToken = token.asset === 'ETH' || token.asset === 'BNB' || token.asset === 'WBNB';
              const isLow = isGasToken && token.valueUSD < 15;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    isLow ? 'bg-[#FFE8E8] border border-[#8B0000]/20' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isLow ? 'text-[#8B0000]' : 'text-[#1E2A6E]'}`}>
                      {token.asset}
                    </span>
                    {isLow && <span className="text-[#8B0000] text-xs font-bold">⚠ Gas bajo</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs mr-3">{token.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                    <span className={`font-medium ${isLow ? 'text-[#8B0000]' : ''}`}>
                      ${token.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function TabV3({ investor, prices }) {
  return (
    <div className="space-y-4">
      {investor.v3Positions.map((pos, i) => {
        const status = getV3Status(pos, prices);
        const currentPrice = prices[pos.priceAsset] || 0;
        return (
          <Card key={i} className={`p-5 border-l-4 ${status === 'IN_RANGE' ? 'border-l-[#1A5C2A]' : 'border-l-[#8B0000]'}`}>
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-400">{pos.id}</span>
                  <V3StatusBadge status={status} />
                </div>
                <h3 className="font-bold text-[#1E2A6E] text-lg">{pos.pool}</h3>
                <p className="text-sm text-gray-500">{pos.protocol} · {pos.network}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Liquidez</p>
                <p className="font-bold text-xl text-[#1E2A6E]">{formatUSD(pos.liquidity)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Rango Inferior</p>
                <p className="font-semibold">{pos.rangeMin != null ? `$${pos.rangeMin.toLocaleString()}` : '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Rango Superior</p>
                <p className="font-semibold">{pos.rangeMax != null ? `$${pos.rangeMax.toLocaleString()}` : '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Precio Actual ({pos.priceAsset})</p>
                <p className="font-semibold">${currentPrice.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Rewards Pendientes</p>
                <p className={`font-semibold ${pos.rewardsPending > 0 ? 'text-[#1A5C2A]' : 'text-gray-400'}`}>{formatUSD(pos.rewardsPending)}</p>
              </div>
            </div>
            {pos.note && <p className="mt-2 text-xs text-[#E06000] bg-[#FFF3E0] px-3 py-1.5 rounded-lg">{pos.note}</p>}
          </Card>
        );
      })}
    </div>
  );
}

function TabDeltas({ investor }) {
  if (!investor.deltas || investor.deltas.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-gray-400 text-sm">No hay deltas activos para este inversor.</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <Th>Delta</Th>
            <Th>Oruga</Th>
            <Th>Activación</Th>
            <Th>Precio Act.</Th>
            <Th>ETH Deuda</Th>
            <Th>USDC</Th>
            <Th>Precio Limit</Th>
            <Th>Botín Est.</Th>
            <Th>Estado</Th>
          </tr>
        </thead>
        <tbody>
          {investor.deltas.map((d, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <Td className="font-semibold">{d.name}</Td>
              <Td>{d.oruga}</Td>
              <Td>{d.activationDate}</Td>
              <Td>{formatUSD(d.activationPrice)}</Td>
              <Td>{d.ethBorrowed} ETH</Td>
              <Td>{formatUSD(d.usdcObtained)}</Td>
              <Td>{formatUSD(d.limitPrice)}</Td>
              <Td className="text-[#1A5C2A] font-medium">{formatUSD(d.estimatedBounty)}</Td>
              <Td><Badge variant={d.status === 'ACTIVO' ? 'green' : 'default'}>{d.status}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function TabColateral({ investor, prices }) {
  return (
    <div className="space-y-4">
      {investor.lending.map((pos, i) => {
        const { collateralItems, debtItems, totalCollateral, totalDebt, healthFactor } =
          computeLendingPosition(pos, prices);
        return (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-[#1E2A6E]">{pos.protocol} · {pos.network}</h3>
                <p className="text-xs text-gray-400 mt-0.5">HF calculado con precios actuales</p>
              </div>
              <HFGauge hf={healthFactor} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colaterales</p>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400"><th className="text-left pb-1">Activo</th><th className="text-right pb-1">Cantidad</th><th className="text-right pb-1">Valor USD</th><th className="text-right pb-1">Liq.%</th></tr></thead>
                  <tbody>
                    {collateralItems.map((c, j) => (
                      <tr key={j} className="border-t border-gray-50">
                        <td className="py-1.5 font-medium text-[#1E2A6E]">{c.asset}</td>
                        <td className="py-1.5 text-right text-gray-600">{c.amount.toLocaleString()}</td>
                        <td className="py-1.5 text-right font-medium">{formatUSD(c.computedValueUSD)}</td>
                        <td className="py-1.5 text-right text-gray-400 text-xs">{c.liqThreshold ? `${(c.liqThreshold * 100).toFixed(0)}%` : '—'}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200 font-bold">
                      <td className="py-1.5" colSpan={2}>Total</td>
                      <td className="py-1.5 text-right text-[#1A5C2A]">{formatUSD(totalCollateral)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Deudas</p>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400"><th className="text-left pb-1">Activo</th><th className="text-right pb-1">Cantidad</th><th className="text-right pb-1">Valor USD</th></tr></thead>
                  <tbody>
                    {debtItems.filter(d => d.amount > 0).map((d, j) => (
                      <tr key={j} className="border-t border-gray-50">
                        <td className="py-1.5 font-medium text-[#1E2A6E]">{d.asset}</td>
                        <td className="py-1.5 text-right text-gray-600">{d.amount.toLocaleString()}</td>
                        <td className="py-1.5 text-right font-medium text-[#8B0000]">{formatUSD(d.computedValueUSD)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200 font-bold">
                      <td className="py-1.5" colSpan={2}>Total</td>
                      <td className="py-1.5 text-right text-[#8B0000]">{formatUSD(totalDebt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#D6F0DC] rounded-lg p-3">
                <p className="text-xs text-[#1A5C2A] opacity-70">Ratio Col/Deuda</p>
                <p className="font-bold text-[#1A5C2A]">{(totalCollateral / (totalDebt || 1)).toFixed(2)}x</p>
              </div>
              {pos.liquidationPriceETH && (
                <div className="bg-[#FFE8E8] rounded-lg p-3">
                  <p className="text-xs text-[#8B0000] opacity-70">Liq. ETH ≈</p>
                  <p className="font-bold text-[#8B0000]">${pos.liquidationPriceETH.toLocaleString()}</p>
                </div>
              )}
              {pos.liquidationPriceXRP && (
                <div className="bg-[#FFE8E8] rounded-lg p-3">
                  <p className="text-xs text-[#8B0000] opacity-70">Liq. XRP ≈</p>
                  <p className="font-bold text-[#8B0000]">${pos.liquidationPriceXRP}</p>
                </div>
              )}
              {pos.liquidationPriceBNB && (
                <div className="bg-[#FFE8E8] rounded-lg p-3">
                  <p className="text-xs text-[#8B0000] opacity-70">Liq. BNB ≈</p>
                  <p className="font-bold text-[#8B0000]">${pos.liquidationPriceBNB.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function TabProyecciones({ investor, summary, updateInvestor }) {
  const [apr, setApr] = useState(investor.aprPrevisto);
  const [dias, setDias] = useState(investor.diasRestantes);
  const [ns, setNs] = useState(investor.nsEstimado);

  const activeV3Liq = investor.v3Positions
    .filter(p => p.liquidity > 0)
    .reduce((s, p) => s + p.liquidity, 0);

  const rewards30d = activeV3Liq * (apr / 100) * (dias / 365);
  const rewardsAnnual = activeV3Liq * (apr / 100);
  const deltaBounty = investor.deltas
    .filter(d => d.status === 'ACTIVO')
    .reduce((s, d) => s + d.ethBorrowed * (d.activationPrice - ns), 0);
  const grossProfit = rewards30d + deltaBounty;
  const cscFee = grossProfit * 0.5;
  const netProfit = grossProfit * 0.5;

  const handleSave = () => {
    updateInvestor(investor.id, { aprPrevisto: apr, diasRestantes: dias, nsEstimado: ns });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <h3 className="font-semibold text-[#1E2A6E] mb-4 text-sm uppercase tracking-wide">Inputs (editables)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-sm">APR Previsto</p>
              <p className="text-xs text-gray-400">Rendimiento anual estimado</p>
            </div>
            <EditableInput value={apr} onChange={setApr} prefix="" suffix="%" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-sm">Días Estimados</p>
              <p className="text-xs text-gray-400">Horizonte de proyección</p>
            </div>
            <EditableInput value={dias} onChange={setDias} prefix="" suffix="d" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-sm">Ns Estimado</p>
              <p className="text-xs text-gray-400">Precio de salida objetivo</p>
            </div>
            <EditableInput value={ns} onChange={setNs} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-sm">Liquidez V3 Activa</p>
              <p className="text-xs text-gray-400">Base de cálculo</p>
            </div>
            <span className="font-semibold text-[#1E2A6E]">{formatUSD(activeV3Liq)}</span>
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 w-full py-2 bg-[#1E2A6E] text-white text-sm rounded-lg hover:bg-[#2E4A9E] transition-colors">
          Guardar configuración
        </button>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-[#1E2A6E] mb-4 text-sm uppercase tracking-wide">Proyecciones calculadas</h3>
        <div className="space-y-3">
          {[
            { label: `Rewards proyectados ${dias}d`, value: rewards30d, color: 'text-[#1A5C2A]' },
            { label: 'Rewards anualizados', value: rewardsAnnual, color: 'text-[#1A5C2A]' },
            { label: 'Botín delta proyectado', value: deltaBounty, color: 'text-[#2E4A9E]' },
            { label: 'Beneficio bruto total', value: grossProfit, color: 'text-[#1E2A6E] font-bold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`font-semibold ${color}`}>{formatUSD(value)}</span>
            </div>
          ))}
          <div className="bg-[#D6E4F7] rounded-lg p-3 mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-[#1E2A6E]">Comisión CSC 50%</span>
              <span className="font-bold text-[#1E2A6E] text-lg">{formatUSD(cscFee)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Beneficio neto inversor</span>
              <span className="font-semibold text-[#1A5C2A]">{formatUSD(netProfit)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
