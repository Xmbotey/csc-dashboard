import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { KpiCard } from '../components/ui';

const DEFAULTS = {
  pe: 2000,
  io: 26000,
  ns: 1000,
  apr: 40,
  dias: 30,
  ltv: 70,
  comision: 50,
};

const $ = (n, d = 2) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const pct = (n, d = 1) =>
  (n >= 0 ? '+' : '') + n.toFixed(d) + '%';

const eth = (n) => n.toFixed(4) + ' ETH';
const num = (n, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

function InputField({ label, field, value, onChange, step = 1, prefix, suffix }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gray-500 text-sm w-4">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          step={step}
          className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#1E2A6E] focus:border-transparent"
          style={{ backgroundColor: '#FFF9C4' }}
        />
        {suffix && <span className="text-gray-500 text-sm w-5">{suffix}</span>}
      </div>
    </div>
  );
}

function Th({ children, right }) {
  return (
    <th className={`py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function Td({ children, right, bold, color }) {
  const colorCls = color === 'green' ? 'text-green-600' : color === 'orange' ? 'text-orange-600' : color === 'red' ? 'text-red-600' : '';
  return (
    <td className={`py-2 px-2 text-sm font-mono ${right ? 'text-right' : ''} ${bold ? 'font-semibold' : ''} ${colorCls}`}>
      {children}
    </td>
  );
}

export default function Simulador() {
  const [params, setParams] = useState(DEFAULTS);

  const handleChange = (field, val) => {
    const parsed = parseFloat(val);
    setParams((prev) => ({ ...prev, [field]: isNaN(parsed) ? prev[field] : parsed }));
  };

  const reset = () => setParams(DEFAULTS);

  const c = useMemo(() => {
    const { pe, io, ns, apr, dias, ltv, comision } = params;
    if (pe <= 0 || io <= 0 || ns <= 0 || pe <= ns) return null;

    const ltvF = ltv / 100;
    const aprF = apr / 100;
    const comF = comision / 100;

    // Distribution
    const v31Cap = io * 0.40;
    const v32Cap = io * 0.40;
    const v33Cap = io * 0.20;

    // Ranges
    const v31Inf = pe - 200, v31Sup = pe + 500;
    const v32Inf = pe - 400, v32Sup = pe + 300;
    const v33Inf = pe - 600, v33Sup = pe + 200;

    // Exit prices
    const exit1 = pe - 200;
    const exit2 = pe - 400;
    const exit3 = pe - 600;

    // V3.1 → V3.2 reinvestment
    const eth1 = v31Cap / exit1;
    const eth1Col = eth1 * 0.40;
    const eth1V32 = eth1 * 0.60;
    const v32CapAmp = v32Cap + eth1V32 * exit1;

    // V3.2 → V3.3 reinvestment
    const eth2 = v32CapAmp / exit2;
    const eth2Col = eth2 * 0.40;
    const eth2V33 = eth2 * 0.60;
    const v33CapAmp = v33Cap + eth2V33 * exit2;

    // V3.3 (100% colateral)
    const eth3 = v33CapAmp / exit3;
    const eth3Col = eth3 * 1.0;

    // Limit prices (25/50/75%)
    const range = pe - ns;
    const lim1 = pe - range * 0.25;
    const lim2 = pe - range * 0.50;
    const lim3 = pe - range * 0.75;

    // Delta calculations
    const calcDelta = (wstETH, activation, limitPrice) => {
      const valCol = wstETH * activation;
      const ethDeuda = (valCol * ltvF) / activation;
      const usdc = ethDeuda * activation;
      const repago = ethDeuda * limitPrice;
      const botin = usdc - repago;
      return { wstETH, valCol, ethDeuda, usdc, repago, botin };
    };

    const d1 = calcDelta(eth1Col, exit1, lim1);
    const d2 = calcDelta(eth2Col, exit2, lim2);
    const d3 = calcDelta(eth3Col, exit3, lim3);

    // APR timing (proportional to price drop)
    const totalDrop = pe - ns;
    const dayExit1 = ((pe - exit1) / totalDrop) * dias;
    const dayExit2 = ((pe - exit2) / totalDrop) * dias;
    const dayExit3 = ((pe - exit3) / totalDrop) * dias;

    // APR — concurrent model (all deployed orugas active simultaneously)
    const apr1 = (v31Cap + v32Cap + v33Cap) * aprF * (dayExit1 / 365);
    const apr2 = (v32CapAmp + v33Cap) * aprF * ((dayExit2 - dayExit1) / 365);
    const apr3 = v33CapAmp * aprF * ((dayExit3 - dayExit2) / 365);
    const aprTotal = apr1 + apr2 + apr3;

    // Colateral en Ns
    const colNs1 = d1.wstETH * ns;
    const colNs2 = d2.wstETH * ns;
    const colNs3 = d3.wstETH * ns;
    const totalColNs = colNs1 + colNs2 + colNs3;

    // Result
    const beneficioBruto = d1.botin + d2.botin + d3.botin + aprTotal;
    const comisionCSC = beneficioBruto * comF;
    const beneficioNeto = beneficioBruto * (1 - comF);
    const capitalFinal = totalColNs + beneficioNeto;
    const variacion = ((capitalFinal - io) / io) * 100;

    // Comparativa
    const sinEstrategia = io * (ns / pe);
    const capitalSalvado = capitalFinal - sinEstrategia;
    const caida = ((pe - ns) / pe) * 100;

    // Chart data — linear price drop PE → Ns over dias days
    const chartData = Array.from({ length: 101 }, (_, i) => {
      const day = (i / 100) * dias;
      const price = Math.round(pe - (pe - ns) * (i / 100));
      return { day: parseFloat(day.toFixed(1)), price };
    });

    return {
      v31Cap, v32Cap, v33Cap,
      v31Inf, v31Sup, v32Inf, v32Sup, v33Inf, v33Sup,
      exit1, exit2, exit3,
      eth1, eth2, eth3,
      v32CapAmp, v33CapAmp,
      d1, d2, d3,
      lim1, lim2, lim3,
      dayExit1, dayExit2, dayExit3,
      apr1, apr2, apr3, aprTotal,
      colNs1, colNs2, colNs3, totalColNs,
      beneficioBruto, comisionCSC, beneficioNeto,
      capitalFinal, variacion,
      sinEstrategia, capitalSalvado, caida,
      chartData,
    };
  }, [params]);

  if (!c) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <p>PE debe ser mayor que Ns para calcular la simulación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-[#1E2A6E]">🧮 Simulador Tres Orugas</h1>

      {/* ---- MAIN GRID ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Inputs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">⚙️ Parámetros del Ciclo</h2>
            <div className="space-y-3">
              <InputField label="Precio de Entrada ($)" field="pe" value={params.pe} onChange={handleChange} step={50} prefix="$" />
              <InputField label="Capital Inicial ($)" field="io" value={params.io} onChange={handleChange} step={1000} prefix="$" />
              <InputField label="Nivel de Soporte ($)" field="ns" value={params.ns} onChange={handleChange} step={50} prefix="$" />
              <InputField label="APR estimado (%)" field="apr" value={params.apr} onChange={handleChange} step={1} suffix="%" />
              <InputField label="Duración estimada (días)" field="dias" value={params.dias} onChange={handleChange} step={1} />
              <InputField label="LTV Aave (%)" field="ltv" value={params.ltv} onChange={handleChange} step={1} suffix="%" />
              <InputField label="Comisión CSC (%)" field="comision" value={params.comision} onChange={handleChange} step={5} suffix="%" />
            </div>
            <button
              onClick={reset}
              className="mt-5 w-full py-2 rounded-lg border border-gray-300 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              ↺ Resetear valores
            </button>
          </div>
        </div>

        {/* RIGHT — Orugas + Deltas */}
        <div className="lg:col-span-2 space-y-5">

          {/* SECTION 1 — Orugas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🐛 Configuración de Orugas</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <Th>Oruga</Th>
                    <Th right>Capital</Th>
                    <Th right>Rango Inf</Th>
                    <Th right>Rango Sup</Th>
                    <Th right>Sale en</Th>
                    <Th right>ETH liberado</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <td className="py-2 px-2 text-sm font-semibold text-blue-700">V3.1</td>
                    <Td right bold>{$(c.v31Cap)}</Td>
                    <Td right>{$(c.v31Inf, 0)}</Td>
                    <Td right>{$(c.v31Sup, 0)}</Td>
                    <Td right>{$(c.exit1, 0)}</Td>
                    <Td right>{eth(c.eth1)}</Td>
                  </tr>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <td className="py-2 px-2 text-sm font-semibold text-orange-700">V3.2 ampliada</td>
                    <Td right bold>{$(c.v32CapAmp)}</Td>
                    <Td right>{$(c.v32Inf, 0)}</Td>
                    <Td right>{$(c.v32Sup, 0)}</Td>
                    <Td right>{$(c.exit2, 0)}</Td>
                    <Td right>{eth(c.eth2)}</Td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="py-2 px-2 text-sm font-semibold text-red-700">V3.3 ampliada</td>
                    <Td right bold>{$(c.v33CapAmp)}</Td>
                    <Td right>{$(c.v33Inf, 0)}</Td>
                    <Td right>{$(c.v33Sup, 0)}</Td>
                    <Td right>{$(c.exit3, 0)}</Td>
                    <Td right>{eth(c.eth3)}</Td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2 — Deltas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">⚡ Deltas (Opción 2 — 25/50/75%)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <Th>Delta</Th>
                    <Th right>Activación</Th>
                    <Th right>Precio Limit</Th>
                    <Th right>wstETH col.</Th>
                    <Th right>ETH deuda</Th>
                    <Th right>USDC obt.</Th>
                    <Th right>Botín</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'D1', d: c.d1, activation: c.exit1, limit: c.lim1, color: 'text-blue-700', botin: 'green' },
                    { label: 'D2', d: c.d2, activation: c.exit2, limit: c.lim2, color: 'text-orange-700', botin: 'orange' },
                    { label: 'D3', d: c.d3, activation: c.exit3, limit: c.lim3, color: 'text-red-700', botin: 'red' },
                  ].map(({ label, d, activation, limit, color, botin }) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0">
                      <td className={`py-2 px-2 text-sm font-semibold ${color}`}>{label}</td>
                      <Td right>{$(activation, 0)}</Td>
                      <Td right>{$(limit, 0)}</Td>
                      <Td right>{num(d.wstETH, 4)}</Td>
                      <Td right>{num(d.ethDeuda, 4)}</Td>
                      <Td right>{$(d.usdc)}</Td>
                      <Td right bold color={botin}>{$(d.botin)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — APR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">📈 Desglose APR</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: `Período 1 (${num(c.dayExit1, 1)} días)`, sub: `Io completo activo → salida V3.1`, val: c.apr1 },
            { label: `Período 2 (${num(c.dayExit2 - c.dayExit1, 1)} días)`, sub: `V3.2 amp + V3.3 base activos`, val: c.apr2 },
            { label: `Período 3 (${num(c.dayExit3 - c.dayExit2, 1)} días)`, sub: `V3.3 amp activa`, val: c.apr3 },
          ].map((p, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">{p.label}</p>
              <p className="text-lg font-bold text-gray-800">{$(p.val)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
            </div>
          ))}
          <div className="bg-[#1E2A6E] rounded-lg p-3">
            <p className="text-xs font-medium text-blue-200 mb-1">Total APR</p>
            <p className="text-xl font-bold text-white">{$(c.aprTotal)}</p>
          </div>
        </div>
      </div>

      {/* SECTION 4 — KPI Results */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">🏆 Resultado Final</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Beneficio Bruto" value={$(c.beneficioBruto)} color="green" />
          <KpiCard label={`Comisión CSC (${params.comision}%)`} value={$(c.comisionCSC)} color="orange" />
          <KpiCard label="Beneficio Neto" value={$(c.beneficioNeto)} color="green" />
          <KpiCard label="Colateral en Ns" value={$(c.totalColNs)} color="blue" />
          <KpiCard label="Capital Final" value={$(c.capitalFinal)} color={c.capitalFinal >= params.io ? 'green' : 'red'} />
          <KpiCard
            label="Variación"
            value={pct(c.variacion)}
            color={c.variacion >= 0 ? 'green' : 'red'}
            sub={`vs ${$(params.io)} inicial`}
          />
        </div>
      </div>

      {/* SECTION 5 — Comparativa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">📊 Comparativa: Con vs Sin estrategia</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <Th>Concepto</Th>
                <Th right>SIN estrategia CSC</Th>
                <Th right>CON estrategia CSC</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 px-2 text-sm text-gray-600">Capital inicial</td>
                <Td right>{$(params.io)}</Td>
                <Td right>{$(params.io)}</Td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-sm text-gray-600">ETH cae {num(c.caida, 0)}%</td>
                <Td right color="red">{$(c.sinEstrategia)}</Td>
                <Td right color="red">{$(c.totalColNs)} colateral</Td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-sm text-gray-600">Botín deltas + APR (neto)</td>
                <Td right color="red">$0.00</Td>
                <Td right color="green">+{$(c.beneficioNeto)}</Td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="py-2 px-2 text-sm font-bold text-gray-700">Capital Final</td>
                <Td right bold color="red">{$(c.sinEstrategia)}</Td>
                <Td right bold color="green">{$(c.capitalFinal)}</Td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-sm text-gray-600">Capital salvado</td>
                <Td right>—</Td>
                <Td right bold color="green">+{$(c.capitalSalvado)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6 — Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">📉 Evolución del precio ETH</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={c.chartData} margin={{ top: 15, right: 80, bottom: 10, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="day"
              type="number"
              domain={[0, params.dias]}
              tickFormatter={(v) => `D${Math.round(v)}`}
              label={{ value: 'Días', position: 'insideBottomRight', offset: -10, fontSize: 11 }}
            />
            <YAxis
              domain={[Math.round(params.ns * 0.88), Math.round(params.pe * 1.03)]}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              width={72}
            />
            <Tooltip
              formatter={(v) => [`$${v.toLocaleString()}`, 'Precio ETH']}
              labelFormatter={(l) => `Día ${l}`}
            />

            {/* Main price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1E2A6E"
              dot={false}
              strokeWidth={2.5}
              name="Precio ETH"
            />

            {/* Vertical — oruga exit days */}
            <ReferenceLine
              x={parseFloat(c.dayExit1.toFixed(1))}
              stroke="#3B82F6"
              strokeDasharray="5 3"
              label={{ value: `V3.1 $${c.exit1}`, position: 'insideTopRight', fill: '#2563EB', fontSize: 10 }}
            />
            <ReferenceLine
              x={parseFloat(c.dayExit2.toFixed(1))}
              stroke="#F97316"
              strokeDasharray="5 3"
              label={{ value: `V3.2 $${c.exit2}`, position: 'insideTopRight', fill: '#EA580C', fontSize: 10 }}
            />
            <ReferenceLine
              x={parseFloat(c.dayExit3.toFixed(1))}
              stroke="#EF4444"
              strokeDasharray="5 3"
              label={{ value: `V3.3 $${c.exit3}`, position: 'insideTopRight', fill: '#DC2626', fontSize: 10 }}
            />

            {/* Horizontal — delta limit prices */}
            <ReferenceLine
              y={c.lim1}
              stroke="#3B82F6"
              strokeDasharray="3 5"
              label={{ value: `D1 Lim $${c.lim1}`, position: 'right', fill: '#2563EB', fontSize: 10 }}
            />
            <ReferenceLine
              y={c.lim2}
              stroke="#F97316"
              strokeDasharray="3 5"
              label={{ value: `D2 Lim $${c.lim2}`, position: 'right', fill: '#EA580C', fontSize: 10 }}
            />
            <ReferenceLine
              y={c.lim3}
              stroke="#EF4444"
              strokeDasharray="3 5"
              label={{ value: `D3 Lim $${c.lim3}`, position: 'right', fill: '#DC2626', fontSize: 10 }}
            />

            {/* Ns support level */}
            <ReferenceLine
              y={params.ns}
              stroke="#16A34A"
              strokeDasharray="8 3"
              strokeWidth={2}
              label={{ value: `Ns $${params.ns}`, position: 'right', fill: '#15803D', fontSize: 10, fontWeight: 600 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-[#1E2A6E]" /> Precio ETH</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3B82F6', background: 'none' }} /> V3.1 / D1</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-orange-500" /> V3.2 / D2</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-red-500" /> V3.3 / D3</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-green-600" /> Ns (soporte)</span>
        </div>
      </div>
    </div>
  );
}
