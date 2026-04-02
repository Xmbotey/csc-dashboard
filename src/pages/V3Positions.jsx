import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getV3Status, formatUSD } from '../data/investors';
import { KpiCard, SectionHeader, Table, Th, Td, V3StatusBadge, Badge } from '../components/ui';

export default function V3Positions() {
  const { investors, prices } = useApp();
  const [filterInvestor, setFilterInvestor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');

  const allPositions = investors.flatMap(inv =>
    inv.v3Positions.map(pos => ({
      ...pos,
      investorId: inv.id,
      investorName: inv.name,
      status: getV3Status(pos, prices),
    }))
  );

  const filtered = allPositions.filter(p => {
    if (filterInvestor !== 'all' && p.investorId !== filterInvestor) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterNetwork !== 'all' && p.network !== filterNetwork) return false;
    return true;
  });

  const totalLiquidity = filtered.reduce((s, p) => s + p.liquidity, 0);
  const totalRewards = filtered.reduce((s, p) => s + (p.rewardsPending || 0), 0);
  const inRange = filtered.filter(p => p.status === 'IN_RANGE').length;
  const outRange = filtered.filter(p => p.status === 'OUT_OF_RANGE').length;

  const networks = [...new Set(allPositions.map(p => p.network))];

  return (
    <div>
      <SectionHeader title="Posiciones V3" sub="Vista agregada de todas las posiciones de liquidez concentrada" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Total Liquidez V3" value={formatUSD(totalLiquidity)} color="blue" />
        <KpiCard label="Rewards Pendientes" value={formatUSD(totalRewards)} color="green" />
        <KpiCard label="En Rango" value={inRange.toString()} color="green" />
        <KpiCard label="Fuera de Rango" value={outRange.toString()} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterInvestor}
          onChange={e => setFilterInvestor(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E2A6E]"
        >
          <option value="all">Todos los inversores</option>
          {investors.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E2A6E]"
        >
          <option value="all">Todos los estados</option>
          <option value="IN_RANGE">En Rango</option>
          <option value="OUT_OF_RANGE">Fuera de Rango</option>
        </select>
        <select
          value={filterNetwork}
          onChange={e => setFilterNetwork(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E2A6E]"
        >
          <option value="all">Todas las redes</option>
          {networks.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table>
          <thead>
            <tr>
              <Th>Inversor</Th>
              <Th>ID Posición</Th>
              <Th>Pool</Th>
              <Th>Protocolo</Th>
              <Th>Red</Th>
              <Th>Liquidez</Th>
              <Th>Rango Inf.</Th>
              <Th>Rango Sup.</Th>
              <Th>Precio Act.</Th>
              <Th>Estado</Th>
              <Th>Rewards</Th>
              <Th>APR</Th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filtered.map((pos, i) => (
              <tr key={i} className={`hover:bg-gray-50 ${pos.status === 'OUT_OF_RANGE' ? 'bg-red-50/30' : ''}`}>
                <Td className="font-semibold text-[#1E2A6E]">{pos.investorName}</Td>
                <Td className="font-mono text-xs text-gray-400">{pos.id}</Td>
                <Td className="font-medium">{pos.pool}</Td>
                <Td className="text-gray-600 text-xs">{pos.protocol}</Td>
                <Td>
                  <Badge variant="blue">{pos.network}</Badge>
                </Td>
                <Td className="font-medium">{formatUSD(pos.liquidity)}</Td>
                <Td className="text-gray-600">${pos.rangeMin.toLocaleString()}</Td>
                <Td className="text-gray-600">${pos.rangeMax.toLocaleString()}</Td>
                <Td className="font-medium">${(prices[pos.priceAsset] || 0).toLocaleString()}</Td>
                <Td><V3StatusBadge status={pos.status} /></Td>
                <Td className={pos.rewardsPending > 0 ? 'text-[#1A5C2A] font-medium' : 'text-gray-400'}>
                  {formatUSD(pos.rewardsPending)}
                </Td>
                <Td className="text-gray-600">{pos.apr > 0 ? `${pos.apr}%` : '—'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-sm">No hay posiciones con los filtros seleccionados.</div>
        )}
      </div>
    </div>
  );
}
