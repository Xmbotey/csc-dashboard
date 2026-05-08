export const SIM_DEFAULTS = {
  pe: 2000,
  io: 26000,
  ns: 1000,
  apr: 40,
  dias: 30,
  ltv: 70,
  comision: 50,
};

export function computeSimulation(params) {
  const { pe, io, ns, apr, dias, ltv, comision } = params;
  if (pe <= 0 || io <= 0 || ns <= 0 || pe <= ns) return null;

  const ltvF = ltv / 100;
  const aprF = apr / 100;
  const comF = comision / 100;

  const v31Cap = io * 0.40;
  const v32Cap = io * 0.40;
  const v33Cap = io * 0.20;

  const v31Inf = pe - 200, v31Sup = pe + 500;
  const v32Inf = pe - 400, v32Sup = pe + 300;
  const v33Inf = pe - 600, v33Sup = pe + 200;

  const exit1 = pe - 200;
  const exit2 = pe - 400;
  const exit3 = pe - 600;

  const eth1 = v31Cap / exit1;
  const eth1Col = eth1 * 0.40;
  const eth1V32 = eth1 * 0.60;
  const v32CapAmp = v32Cap + eth1V32 * exit1;

  const eth2 = v32CapAmp / exit2;
  const eth2Col = eth2 * 0.40;
  const eth2V33 = eth2 * 0.60;
  const v33CapAmp = v33Cap + eth2V33 * exit2;

  const eth3 = v33CapAmp / exit3;
  const eth3Col = eth3 * 1.0;

  const range = pe - ns;
  const lim1 = pe - range * 0.25;
  const lim2 = pe - range * 0.50;
  const lim3 = pe - range * 0.75;

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

  const totalDrop = pe - ns;
  const dayExit1 = ((pe - exit1) / totalDrop) * dias;
  const dayExit2 = ((pe - exit2) / totalDrop) * dias;
  const dayExit3 = ((pe - exit3) / totalDrop) * dias;

  const apr1 = (v31Cap + v32Cap + v33Cap) * aprF * (dayExit1 / 365);
  const apr2 = (v32CapAmp + v33Cap) * aprF * ((dayExit2 - dayExit1) / 365);
  const apr3 = v33CapAmp * aprF * ((dayExit3 - dayExit2) / 365);
  const aprTotal = apr1 + apr2 + apr3;

  const colNs1 = d1.wstETH * ns;
  const colNs2 = d2.wstETH * ns;
  const colNs3 = d3.wstETH * ns;
  const totalColNs = colNs1 + colNs2 + colNs3;

  const beneficioBruto = d1.botin + d2.botin + d3.botin + aprTotal;
  const comisionCSC = beneficioBruto * comF;
  const beneficioNeto = beneficioBruto * (1 - comF);
  const capitalFinal = totalColNs + beneficioNeto;
  const variacion = ((capitalFinal - io) / io) * 100;

  const sinEstrategia = io * (ns / pe);
  const capitalSalvado = capitalFinal - sinEstrategia;
  const caida = ((pe - ns) / pe) * 100;

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
}
