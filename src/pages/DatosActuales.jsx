import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import { RefreshCw, ExternalLink, Loader2, AlertCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const MICROLINK_BASE = 'https://api.microlink.io';

function buildMicrolinkUrl(targetUrl) {
  const params = new URLSearchParams({
    url: targetUrl,
    screenshot: 'true',
    meta: 'false',
    'viewport.width': '1280',
    'viewport.height': '900',
    'screenshot.fullPage': 'true',
    'screenshot.type': 'jpeg',
    waitForTimeout: '6000',
  });
  return `${MICROLINK_BASE}?${params.toString()}`;
}

async function fetchScreenshot(debankUrl) {
  const res = await fetch(buildMicrolinkUrl(debankUrl));
  const data = await res.json();
  if (data.status !== 'success' || !data.data?.screenshot?.url) {
    throw new Error(data.message || 'No se pudo capturar la página');
  }
  return { url: data.data.screenshot.url, capturedAt: new Date().toLocaleString('es-ES') };
}

async function fetchAsDataUrl(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function InvestorCard({ investor, captureData, isLoading, onCapture }) {
  const { status, screenshotUrl, capturedAt, errorMsg } = captureData;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E2A6E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {investor.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#1E2A6E]">{investor.name}</p>
            <a
              href={investor.debankUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              Ver en DeBank <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {capturedAt && (
            <span className="text-xs text-gray-400 hidden sm:block">{capturedAt}</span>
          )}
          {status === 'loading' && (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Capturando…
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-24 text-gray-300 gap-2">
            <RefreshCw size={24} />
            <p className="text-xs text-gray-400">Pendiente de captura</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-24 text-gray-400 gap-2">
            <Loader2 size={24} className="animate-spin opacity-50" />
            <p className="text-xs">Capturando DeBank…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-24 text-red-500 gap-2">
            <AlertCircle size={24} className="opacity-60" />
            <p className="text-xs">{errorMsg}</p>
            <button onClick={() => onCapture(investor)} className="text-xs underline">Reintentar</button>
          </div>
        )}

        {status === 'done' && screenshotUrl && (
          <div className="overflow-y-auto overflow-x-auto rounded-lg border border-gray-100"
               style={{ maxHeight: '75vh' }}>
            <img
              src={screenshotUrl}
              alt={`DeBank ${investor.name}`}
              className="block"
              style={{ width: '100%', minWidth: '900px', display: 'block' }}
              loading="lazy"
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

  const [captures, setCaptures] = useState(() =>
    Object.fromEntries(withDebank.map(inv => [inv.id, { status: 'idle', screenshotUrl: null, capturedAt: null, errorMsg: '' }]))
  );
  const [globalLoading, setGlobalLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const screenshotUrlsRef = useRef({});

  const captureOne = useCallback(async (investor) => {
    setCaptures(prev => ({ ...prev, [investor.id]: { ...prev[investor.id], status: 'loading', errorMsg: '' } }));
    try {
      const { url, capturedAt } = await fetchScreenshot(investor.debankUrl);
      screenshotUrlsRef.current[investor.id] = url;
      setCaptures(prev => ({ ...prev, [investor.id]: { status: 'done', screenshotUrl: url, capturedAt, errorMsg: '' } }));
    } catch (e) {
      setCaptures(prev => ({ ...prev, [investor.id]: { status: 'error', screenshotUrl: null, capturedAt: null, errorMsg: e.message || 'Error' } }));
    }
  }, []);

  const captureAll = async () => {
    setGlobalLoading(true);
    await Promise.all(withDebank.map(inv => captureOne(inv)));
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

        // Investor header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(30, 42, 110);
        pdf.text(investor.name, margin, margin + 14);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(120);
        pdf.text(investor.debankUrl, margin, margin + 28, { maxWidth: pageW - margin * 2 });
        if (cap.capturedAt) {
          pdf.text(`Capturado: ${cap.capturedAt}`, margin, margin + 40);
        }
        pdf.setTextColor(0);

        let y = margin + 55;

        if (cap.status === 'done' && cap.screenshotUrl) {
          const dataUrl = await fetchAsDataUrl(cap.screenshotUrl);
          if (dataUrl) {
            try {
              const img = await new Promise((resolve, reject) => {
                const im = new Image();
                im.onload = () => resolve(im);
                im.onerror = reject;
                im.src = dataUrl;
              });
              const maxW = pageW - margin * 2;
              const maxH = pageH - y - margin;
              const ratio = maxW / img.width;
              const pageSliceH = Math.floor(maxH / ratio);
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
              pdf.setTextColor(180, 0, 0);
              pdf.text('(no se pudo insertar la captura)', margin, y);
              pdf.setTextColor(0);
            }
          }
        } else {
          pdf.setTextColor(150);
          pdf.text('Sin captura disponible', margin, y);
          pdf.setTextColor(0);
        }
      }

      // ── RESUMEN FINAL ─────────────────────────────────────────────────
      pdf.addPage();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 42, 110);
      pdf.text('Resumen — Rewards Pendientes', margin, margin + 14);

      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, margin + 28);
      pdf.setTextColor(0);

      let sy = margin + 50;

      // Table header
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 18, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255);
      pdf.text('Inversor', margin + 6, sy + 12);
      pdf.text('Portfolio', margin + 130, sy + 12);
      pdf.text('Rewards pendientes (USD)', margin + 230, sy + 12);
      pdf.setTextColor(0);
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
        pdf.text(investor.name, margin + 6, sy + 11);
        pdf.text(`$${(investor.portfolioTotal || 0).toLocaleString()}`, margin + 130, sy + 11);
        pdf.setTextColor(rewards > 0 ? 26 : 100, rewards > 0 ? 92 : 100, rewards > 0 ? 42 : 100);
        pdf.text(rewards > 0 ? `$${rewards.toFixed(2)}` : '—', margin + 230, sy + 11);
        pdf.setTextColor(0);
        sy += 16;
      });

      // Total row
      pdf.setFillColor(30, 42, 110);
      pdf.rect(margin, sy, pageW - margin * 2, 18, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255);
      pdf.text('TOTAL REWARDS', margin + 6, sy + 13);
      pdf.text(`$${totalRewards.toFixed(2)}`, margin + 230, sy + 13);
      pdf.setTextColor(0);

      pdf.save(`CSC-Datos-Actuales-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const anyDone = Object.values(captures).some(c => c.status === 'done');
  const allLoading = globalLoading;

  return (
    <div className="pb-10">
      <SectionHeader
        title="Datos Actuales"
        sub="Capturas en tiempo real de DeBank para cada inversor"
      />

      {/* Action bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={captureAll}
          disabled={allLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E2A6E] text-white text-sm font-semibold hover:bg-[#2E4A9E] transition disabled:opacity-60"
        >
          {allLoading
            ? <Loader2 size={16} className="animate-spin" />
            : <RefreshCw size={16} />
          }
          {allLoading ? 'Actualizando todo…' : 'Actualizar Todo'}
        </button>

        {anyDone && (
          <button
            onClick={generatePdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1E2A6E] text-[#1E2A6E] text-sm font-semibold hover:bg-blue-50 transition disabled:opacity-60"
          >
            {generatingPdf
              ? <Loader2 size={16} className="animate-spin" />
              : <FileText size={16} />
            }
            {generatingPdf ? 'Generando PDF…' : 'Generar Informe PDF'}
          </button>
        )}
      </div>

      {withDebank.length === 0 ? (
        <p className="text-gray-400 text-sm">Ningún inversor tiene URL de DeBank configurada.</p>
      ) : (
        <div className="space-y-5">
          {withDebank.map(inv => (
            <InvestorCard
              key={inv.id}
              investor={inv}
              captureData={captures[inv.id]}
              isLoading={captures[inv.id].status === 'loading'}
              onCapture={captureOne}
            />
          ))}
        </div>
      )}
    </div>
  );
}
