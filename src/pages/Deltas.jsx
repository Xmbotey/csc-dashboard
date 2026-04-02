import { useApp } from '../context/AppContext';
import { formatUSD } from '../data/investors';
import { KpiCard, SectionHeader, Table, Th, Td, Badge } from '../components/ui';

export default function Deltas() {
  const { investors } = useApp();

  const allDeltas = investors.flatMap(inv =>
    (inv.deltas || []).map(d => ({
      ...d,
      investorName: inv.name,
      investorId: inv.id,
    }))
  );

  const active = allDeltas.filter(d => d.status === 'ACTIVO');
  const totalBounty = allDeltas.reduce((s, d) => s + (d.estimatedBounty || 0), 0);

  const bountyD1 = allDeltas.filter(d => d.name === 'D1').reduce((s, d) => s + (d.estimatedBounty || 0), 0);
  const bountyD2 = allDeltas.filter(d => d.name === 'D2').reduce((s, d) => s + (d.estimatedBounty || 0), 0);
  const bountyD3 = allDeltas.filter(d => d.name === 'D3').reduce((s, d) => s + (d.estimatedBounty || 0), 0);

  const deltaColor = { D1: 'green', D2: 'orange', D3: 'red' };

  return (
    <div>
      <SectionHeader title="Deltas" sub="Vista agregada de todos los deltas activos y cerrados" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Deltas Activos" value={active.length.toString()} color="blue" />
        <KpiCard label="Botín Total Est." value={formatUSD(totalBounty)} color="green" />
        <KpiCard label="Botín D1" value={formatUSD(bountyD1)} color="green" />
        <KpiCard label="Botín D2+D3" value={formatUSD(bountyD2 + bountyD3)} color="orange" />
      </div>

      {allDeltas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-400 text-base">No hay deltas activos actualmente.</p>
          <p className="text-gray-300 text-sm mt-2">Los deltas aparecerán aquí cuando se activen posiciones apalancadas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <Table>
            <thead>
              <tr>
                <Th>Inversor</Th>
                <Th>Delta</Th>
                <Th>Oruga</Th>
                <Th>Fecha Act.</Th>
                <Th>Precio Act.</Th>
                <Th>ETH Deuda</Th>
                <Th>USDC</Th>
                <Th>Precio Limit</Th>
                <Th>Botín Est.</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {allDeltas.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <Td className="font-semibold text-[#1E2A6E]">{d.investorName}</Td>
                  <Td><Badge variant={deltaColor[d.name] || 'default'}>{d.name}</Badge></Td>
                  <Td>{d.oruga}</Td>
                  <Td className="text-gray-600 text-xs">{d.activationDate}</Td>
                  <Td>{formatUSD(d.activationPrice)}</Td>
                  <Td>{d.ethBorrowed} ETH</Td>
                  <Td>{formatUSD(d.usdcObtained)}</Td>
                  <Td>
                    <span className={`font-semibold ${d.name === 'D1' ? 'text-[#1A5C2A]' : d.name === 'D2' ? 'text-[#E06000]' : 'text-[#8B0000]'}`}>
                      {formatUSD(d.limitPrice)}
                    </span>
                  </Td>
                  <Td className="text-[#1A5C2A] font-medium">{formatUSD(d.estimatedBounty)}</Td>
                  <Td>
                    <Badge variant={d.status === 'ACTIVO' ? 'green' : d.status === 'SUPERVISADO' ? 'orange' : 'default'}>
                      {d.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
