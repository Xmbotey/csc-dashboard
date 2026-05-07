import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import { RefreshCw, ExternalLink, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

// Use our Vercel proxy to avoid CORS and get base64 screenshots
async function captureViaProxy(debankUrl) {
  const res = await fetch(`/api/capture?url=${encodeURIComponent(debankUrl)}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Error en la captura');
  return { dataUrl: data.screenshotDataUrl, capturedAt: new Date().toLocaleString('es-ES') };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
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
          {status === 'loading' && (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Capturando…
            </span>
          )}
          {status === 'done' && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Listo
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> Error
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-300 gap-1">
            <RefreshCw size={22} />
            <p className="text-xs text-gray-400">Pendiente de captura</p>
          </div>
        )}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400 gap-1">
            <Loader2 size={22} className="animate-spin opacity-50" />
            <p className="text-xs">Capturando DeBank…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-20 text-red-400 gap-1">
            <AlertCircle size={22} className="opacity-70" />
            <p className="text-xs text-center">{errorMsg}</p>
          </div>
        )}
        {status === 'done' && dataUrl && (
          <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: '80vh', borderRadius: 8, border: '1px solid #f3f4f6' }}>
            <img
              src={dataUrl}
              alt={`DeBank ${investor.name}`}
              style={{ display: 'block', width: '100%', minWidth: 900 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatosActuales() {
  const { investors } = useApp();
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
      let firstPage = true;

      for (const investor of withDebank) {
        const cap = captures[investor.id];
        if (!firstPage) pdf.addPage();
        firstPage = false;

        // Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(30, 42, 110);
        pdf.text(investor.name, margin, margin + 14);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(120);
        pdf.text(investor.debankUrl, margin, margin + 28, { maxWidth: pageW - margin * 2 });
        if (cap.capturedAt) pdf.text(`Capturado: ${cap.capturedAt}`, margin, margin + 40);
        pdf.setTextColor(0);

        let y = margin + 55;

        if (cap.status === 'done' && cap.dataUrl) {
          try {
            const img = await new Promise((resolve, reject) => {
              const im = new Image();
              im.onload = () => resolve(im);
              im.onerror = reject;
              im.src = cap.dataUrl;
            });
            const maxW = pageW - margin * 2;
            const ratio = maxW / img.width;
            const pageSliceH = Math.floor((pageH - y - margin) / ratio);
            let sourceY = 0;

            while (sourceY < img.height) {
              if (sourceY > 0) { pdf.addPage(); y = margin; }
              const sliceH = Math.min(pageSliceH, img.height - sourceY);
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = sliceH;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, sourceY, img.width, sliceH, 0, 0, img.width, sliceH);
              pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', margin, y, maxW, sliceH * ratio);
              sourceY += sliceH;
            }
          } catch {
            pdf.setTextColor(150);
            pdf.text('(captura no disponible)', margin, y);
            pdf.setTextColor(0);
          }
        } else {
          pdf.setTextColor(150);
          pdf.text('Sin captura disponible', margin, y);
          pdf.setTextColor(0);
        }
      }

      // ── RESUMEN REWARDS ────────────────────────────────────────────────
      pdf.addPage();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 42, 110);
      pdf.text('Resumen — Rewards Pendientes', margin, margin + 14);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, margin + 28);
      pdf.setTextColor(0);

      let sy = margin + 50;

      // Table header
      const cols = { name: margin + 6, portfolio: margin + 140, rewards: margin + 280 };
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 18, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255);
      pdf.text('Inversor', cols.name, sy + 12);
      pdf.text('Portfolio Total', cols.portfolio, sy + 12);
      pdf.text('Rewards Pendientes', cols.rewards, sy + 12);
      sy += 18;

      let totalRewards = 0;
      withDebank.forEach((investor, idx) => {
        const rewards = investor.v3Positions?.reduce((s, p) => s + (p.rewardsPending || 0), 0) || 0;
        totalRewards += rewards;

        if (idx % 2 === 0) {
          pdf.setFillColor(245, 247, 255);
          pdf.rect(margin, sy, pageW - margin * 2, 16, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0);
        pdf.text(investor.name, cols.name, sy + 11);
        pdf.text(`$${(investor.portfolioTotal || 0).toLocaleString('en-US')}`, cols.portfolio, sy + 11);
        pdf.setTextColor(rewards > 0 ? 26 : 120, rewards > 0 ? 92 : 120, rewards > 0 ? 42 : 120);
        pdf.text(rewards > 0 ? `$${rewards.toFixed(2)}` : '—', cols.rewards, sy + 11);
        pdf.setTextColor(0);
        sy += 16;
      });

      // Total
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 20, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255);
      pdf.text('TOTAL REWARDS PENDIENTES', cols.name, sy + 14);
      pdf.text(`$${totalRewards.toFixed(2)}`, cols.rewards, sy + 14);

      pdf.save(`CSC-Informe-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const anyDone = Object.values(captures).some(c => c.status === 'done');
  const doneCount = Object.values(captures).filter(c => c.status === 'done').length;

  return (
    <div className="pb-10">
      <SectionHeader
        title="Datos Actuales"
        sub="Capturas en tiempo real de DeBank para cada inversor"
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={captureAll}
          disabled={globalLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E2A6E] text-white text-sm font-semibold hover:bg-[#2E4A9E] transition disabled:opacity-60"
        >
          {globalLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {globalLoading ? 'Actualizando…' : 'Actualizar Todo'}
        </button>

        {anyDone && (
          <button
            onClick={generatePdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1E2A6E] text-[#1E2A6E] text-sm font-semibold hover:bg-blue-50 transition disabled:opacity-60"
          >
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
