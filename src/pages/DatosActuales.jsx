import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import { computeLendingPosition } from '../data/investors';
import { RefreshCw, ExternalLink, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

async function captureViaProxy(debankUrl) {
  const res = await fetch(`/api/capture?url=${encodeURIComponent(debankUrl)}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Error en la captura');
  return { dataUrl: data.screenshotDataUrl, capturedAt: new Date().toLocaleString('es-ES') };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Compute aggregated data for one investor
function computeInvestorTotals(investor, prices) {
  const totalRewards = (investor.v3Positions || []).reduce((s, p) => s + (p.rewardsPending || 0), 0);
  const totalV3Liquidity = (investor.v3Positions || []).reduce((s, p) => s + (p.liquidity || 0), 0);
  const v3Count = (investor.v3Positions || []).length;

  let totalCollateral = 0, totalDebt = 0;
  (investor.lending || []).forEach(l => {
    const c = computeLendingPosition(l, prices);
    totalCollateral += c.totalCollateral;
    totalDebt += c.totalDebt;
  });

  const walletTotal = (investor.wallet || []).reduce((s, t) => s + (t.valueUSD || 0), 0);

  return { totalRewards, totalV3Liquidity, v3Count, totalCollateral, totalDebt, walletTotal };
}

// Summary panel shown on page
function SummaryPanel({ investors, prices }) {
  const rows = investors.map(inv => ({ inv, ...computeInvestorTotals(inv, prices) }));
  const totals = rows.reduce((acc, r) => ({
    portfolio: acc.portfolio + (r.inv.portfolioTotal || 0),
    rewards: acc.rewards + r.totalRewards,
    liquidity: acc.liquidity + r.totalV3Liquidity,
    collateral: acc.collateral + r.totalCollateral,
    debt: acc.debt + r.totalDebt,
    wallet: acc.wallet + r.walletTotal,
  }), { portfolio: 0, rewards: 0, liquidity: 0, collateral: 0, debt: 0, wallet: 0 });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-x-auto">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#1E2A6E]">📊 Resumen del Dashboard</h2>
        <p className="text-xs text-gray-400 mt-0.5">Datos del dashboard — actualiza rewards manualmente tras revisar las capturas</p>
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
              <td className="px-3 py-1.5 text-right font-mono">{fmt(totalV3Liquidity)}</td>
              <td className={`px-3 py-1.5 text-right font-mono font-semibold ${totalRewards > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {totalRewards > 0 ? fmt(totalRewards) : '—'}
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-green-700">{fmt(totalCollateral)}</td>
              <td className="px-3 py-1.5 text-right font-mono text-red-700">{fmt(totalDebt)}</td>
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

function InvestorCard({ investor, captureData }) {
  const { status, dataUrl, capturedAt, errorMsg } = captureData;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E2A6E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {investor.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#1E2A6E]">{investor.name}</p>
            <a href={investor.debankUrl} target="_blank" rel="noreferrer"
               className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              Ver en DeBank <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {capturedAt && <span className="text-xs text-gray-400 hidden sm:block">{capturedAt}</span>}
          {status === 'loading' && <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Capturando…</span>}
          {status === 'done' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Listo</span>}
          {status === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Error</span>}
        </div>
      </div>
      <div className="p-4">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-300 gap-1">
            <RefreshCw size={22} /><p className="text-xs text-gray-400">Pendiente de captura</p>
          </div>
        )}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400 gap-1">
            <Loader2 size={22} className="animate-spin opacity-50" /><p className="text-xs">Capturando DeBank…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-20 text-red-400 gap-1">
            <AlertCircle size={22} className="opacity-70" /><p className="text-xs text-center">{errorMsg}</p>
          </div>
        )}
        {status === 'done' && dataUrl && (
          <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: '80vh', borderRadius: 8, border: '1px solid #f3f4f6' }}>
            <img src={dataUrl} alt={`DeBank ${investor.name}`} style={{ display: 'block', width: '100%', minWidth: 900 }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatosActuales() {
  const { investors, prices } = useApp();
  const withDebank = investors.filter(inv => inv.debankUrl);

  const initCaptures = () =>
    Object.fromEntries(withDebank.map(inv => [inv.id, { status: 'idle', dataUrl: null, capturedAt: null, errorMsg: '' }]));

  const [captures, setCaptures] = useState(initCaptures);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const setOne = useCallback((id, patch) => {
    setCaptures(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const captureAll = async () => {
    setGlobalLoading(true);
    setCaptures(initCaptures());
    for (let i = 0; i < withDebank.length; i++) {
      const inv = withDebank[i];
      setProgress(`Capturando ${inv.name} (${i + 1}/${withDebank.length})…`);
      setOne(inv.id, { status: 'loading' });
      try {
        const { dataUrl, capturedAt } = await captureViaProxy(inv.debankUrl);
        setOne(inv.id, { status: 'done', dataUrl, capturedAt });
      } catch (e) {
        setOne(inv.id, { status: 'error', errorMsg: e.message || 'Error' });
      }
      if (i < withDebank.length - 1) await sleep(1200);
    }
    setProgress('');
    setGlobalLoading(false);
  };

  const generatePdf = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 36;
      const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

      // ── PORTADA ──────────────────────────────────────────────────────
      pdf.setFillColor(30, 42, 110);
      pdf.rect(0, 0, pageW, 120, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.setTextColor(255);
      pdf.text('CSC Dashboard', margin, 55);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Informe de Datos Actuales — DeBank', margin, 80);
      pdf.setFontSize(10);
      pdf.setTextColor(180, 200, 255);
      pdf.text(`Generado: ${today}`, margin, 100);
      pdf.setTextColor(0);

      // Global totals on cover
      let cy = 145;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 42, 110);
      pdf.text('RESUMEN GLOBAL', margin, cy);
      cy += 15;

      const allTotals = withDebank.reduce((acc, inv) => {
        const t = computeInvestorTotals(inv, prices);
        return {
          portfolio: acc.portfolio + (inv.portfolioTotal || 0),
          rewards: acc.rewards + t.totalRewards,
          liquidity: acc.liquidity + t.totalV3Liquidity,
          collateral: acc.collateral + t.totalCollateral,
          debt: acc.debt + t.totalDebt,
          wallet: acc.wallet + t.walletTotal,
        };
      }, { portfolio: 0, rewards: 0, liquidity: 0, collateral: 0, debt: 0, wallet: 0 });

      const coverStats = [
        { label: 'Portfolio Total', value: fmt(allTotals.portfolio) },
        { label: 'Liquidez V3 Total', value: fmt(allTotals.liquidity) },
        { label: 'Rewards Pendientes', value: fmt(allTotals.rewards) },
        { label: 'Colateral Total', value: fmt(allTotals.collateral) },
        { label: 'Deuda Total', value: fmt(allTotals.debt) },
        { label: 'Inversores', value: withDebank.length.toString() },
      ];

      coverStats.forEach((s, i) => {
        const col = i % 2 === 0 ? margin : pageW / 2;
        if (i % 2 === 0 && i > 0) cy += 28;
        if (i === 0) { }
        pdf.setFillColor(i % 2 === 0 ? 240 : 247, 244, 255);
        pdf.rect(col, cy, pageW / 2 - 10, 24, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(s.label, col + 6, cy + 10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 42, 110);
        pdf.text(s.value, col + 6, cy + 21);
        pdf.setTextColor(0);
        if (i % 2 === 1) cy += 28;
      });

      // ── POR INVERSOR ─────────────────────────────────────────────────
      for (const investor of withDebank) {
        pdf.addPage();
        const cap = captures[investor.id];
        const t = computeInvestorTotals(investor, prices);

        // Investor header bar
        pdf.setFillColor(30, 42, 110);
        pdf.rect(0, 0, pageW, 50, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(255);
        pdf.text(investor.name, margin, 28);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(180, 200, 255);
        pdf.text(investor.debankUrl, margin, 42);
        pdf.setTextColor(0);

        // Key metrics row
        let mx = margin;
        const mw = (pageW - margin * 2) / 4;
        const metrics = [
          { label: 'Portfolio', value: fmt(investor.portfolioTotal) },
          { label: 'Liquidez V3', value: fmt(t.totalV3Liquidity) },
          { label: 'Colateral', value: fmt(t.totalCollateral) },
          { label: 'Deuda', value: fmt(t.totalDebt) },
        ];
        metrics.forEach(m => {
          pdf.setFillColor(245, 247, 255);
          pdf.rect(mx, 55, mw - 4, 28, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text(m.label, mx + 4, 64);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(30, 42, 110);
          pdf.text(m.value, mx + 4, 77);
          mx += mw;
        });
        pdf.setTextColor(0);

        // V3 positions rewards table
        let ry = 92;
        if ((investor.v3Positions || []).length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(30, 42, 110);
          pdf.text('Posiciones V3', margin, ry);
          ry += 8;

          pdf.setFillColor(30, 42, 110);
          pdf.rect(margin, ry, pageW - margin * 2, 14, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(255);
          pdf.text('ID', margin + 3, ry + 10);
          pdf.text('Pool', margin + 55, ry + 10);
          pdf.text('Liquidez', margin + 180, ry + 10);
          pdf.text('Rewards Pend.', margin + 270, ry + 10);
          pdf.text('APR%', margin + 370, ry + 10);
          ry += 14;

          investor.v3Positions.forEach((p, pi) => {
            if (pi % 2 === 0) { pdf.setFillColor(248, 249, 255); pdf.rect(margin, ry, pageW - margin * 2, 13, 'F'); }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0);
            pdf.text(p.id || '—', margin + 3, ry + 9);
            pdf.text(`${p.pool || ''} · ${p.protocol || ''}`, margin + 55, ry + 9);
            pdf.text(fmt(p.liquidity), margin + 180, ry + 9);
            pdf.setTextColor(p.rewardsPending > 0 ? 26 : 120, p.rewardsPending > 0 ? 92 : 120, 42);
            pdf.text(p.rewardsPending > 0 ? fmt(p.rewardsPending) : '—', margin + 270, ry + 9);
            pdf.setTextColor(0);
            pdf.text(p.apr > 0 ? `${p.apr}%` : '—', margin + 370, ry + 9);
            ry += 13;
          });

          // Rewards total for this investor
          pdf.setFillColor(230, 240, 255);
          pdf.rect(margin, ry, pageW - margin * 2, 14, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(30, 42, 110);
          pdf.text('Total Rewards Pendientes', margin + 3, ry + 10);
          pdf.setTextColor(26, 92, 42);
          pdf.text(fmt(t.totalRewards), margin + 270, ry + 10);
          pdf.setTextColor(0);
          ry += 20;
        }

        // Screenshot
        if (cap.status === 'done' && cap.dataUrl) {
          if (cap.capturedAt) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(120);
            pdf.text(`Captura DeBank: ${cap.capturedAt}`, margin, ry + 8);
            ry += 14;
          }
          try {
            const img = await new Promise((resolve, reject) => {
              const im = new Image();
              im.onload = () => resolve(im);
              im.onerror = reject;
              im.src = cap.dataUrl;
            });
            const maxW = pageW - margin * 2;
            const maxH = pageH - ry - margin;
            const ratio = maxW / img.width;
            const pageSliceH = Math.floor(maxH / ratio);
            let sourceY = 0;

            while (sourceY < img.height) {
              if (sourceY > 0) { pdf.addPage(); ry = margin; }
              const sliceH = Math.min(pageSliceH, img.height - sourceY);
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = sliceH;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, sourceY, img.width, sliceH, 0, 0, img.width, sliceH);
              pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', margin, ry, maxW, sliceH * ratio);
              sourceY += sliceH;
            }
          } catch {
            pdf.setTextColor(150);
            pdf.text('(captura no disponible)', margin, ry + 10);
            pdf.setTextColor(0);
          }
        }
      }

      // ── RESUMEN FINAL ────────────────────────────────────────────────
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

      // Table header
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 16, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(255);
      const headers = ['Inversor', 'Portfolio', 'Liquidez V3', 'Rewards Pend.', 'Colateral', 'Deuda', 'Wallet'];
      headers.forEach((h, i) => pdf.text(h, margin + 3 + i * colW, sy + 11));
      sy += 16;

      let grandTotals = { portfolio: 0, liquidity: 0, rewards: 0, collateral: 0, debt: 0, wallet: 0 };

      withDebank.forEach((investor, idx) => {
        const t = computeInvestorTotals(investor, prices);
        grandTotals.portfolio += investor.portfolioTotal || 0;
        grandTotals.liquidity += t.totalV3Liquidity;
        grandTotals.rewards += t.totalRewards;
        grandTotals.collateral += t.totalCollateral;
        grandTotals.debt += t.totalDebt;
        grandTotals.wallet += t.walletTotal;

        if (idx % 2 === 0) { pdf.setFillColor(246, 248, 255); pdf.rect(margin, sy, pageW - margin * 2, 16, 'F'); }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(0);
        const row = [
          investor.name,
          fmt(investor.portfolioTotal),
          fmt(t.totalV3Liquidity),
          t.totalRewards > 0 ? fmt(t.totalRewards) : '—',
          fmt(t.totalCollateral),
          fmt(t.totalDebt),
          t.walletTotal > 0 ? fmt(t.walletTotal) : '—',
        ];
        row.forEach((v, i) => {
          if (i === 3 && t.totalRewards > 0) pdf.setTextColor(26, 92, 42);
          else if (i === 5) pdf.setTextColor(139, 0, 0);
          else if (i === 4) pdf.setTextColor(26, 92, 42);
          else pdf.setTextColor(0);
          pdf.text(v, margin + 3 + i * colW, sy + 11);
        });
        sy += 16;
      });

      // Grand total row
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 20, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255);
      const totalRow = [
        'TOTAL',
        fmt(grandTotals.portfolio),
        fmt(grandTotals.liquidity),
        fmt(grandTotals.rewards),
        fmt(grandTotals.collateral),
        fmt(grandTotals.debt),
        fmt(grandTotals.wallet),
      ];
      totalRow.forEach((v, i) => {
        if (i === 3) pdf.setTextColor(255, 230, 100);
        else pdf.setTextColor(255);
        pdf.text(v, margin + 3 + i * colW, sy + 14);
      });

      pdf.save(`CSC-Informe-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const anyDone = Object.values(captures).some(c => c.status === 'done');
  const doneCount = Object.values(captures).filter(c => c.status === 'done').length;

  return (
    <div className="pb-10">
      <SectionHeader title="Datos Actuales" sub="Capturas en tiempo real de DeBank para cada inversor" />

      <SummaryPanel investors={withDebank} prices={prices} />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={captureAll} disabled={globalLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E2A6E] text-white text-sm font-semibold hover:bg-[#2E4A9E] transition disabled:opacity-60">
          {globalLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {globalLoading ? 'Actualizando…' : 'Actualizar Todo'}
        </button>

        {anyDone && (
          <button onClick={generatePdf} disabled={generatingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1E2A6E] text-[#1E2A6E] text-sm font-semibold hover:bg-blue-50 transition disabled:opacity-60">
            {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {generatingPdf ? 'Generando PDF…' : `Generar Informe PDF (${doneCount}/${withDebank.length})`}
          </button>
        )}

        {progress && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Loader2 size={13} className="animate-spin" /> {progress}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {withDebank.map(inv => (
          <InvestorCard key={inv.id} investor={inv} captureData={captures[inv.id]} />
        ))}
      </div>
    </div>
  );
}
