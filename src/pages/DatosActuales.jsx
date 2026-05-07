import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import { RefreshCw, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

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

function InvestorCapture({ investor }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const capture = async () => {
    setStatus('loading');
    setScreenshotUrl(null);
    setErrorMsg('');
    try {
      const res = await fetch(buildMicrolinkUrl(investor.debankUrl));
      const data = await res.json();
      if (data.status !== 'success' || !data.data?.screenshot?.url) {
        throw new Error(data.message || 'No se pudo capturar la página');
      }
      setScreenshotUrl(data.data.screenshot.url);
      setCapturedAt(new Date().toLocaleString('es-ES'));
      setStatus('done');
    } catch (e) {
      setErrorMsg(e.message || 'Error desconocido');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
            <span className="text-xs text-gray-400 hidden sm:block">
              {capturedAt}
            </span>
          )}
          <button
            onClick={capture}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2A6E] text-white text-xs font-medium hover:bg-[#2E4A9E] transition disabled:opacity-60"
          >
            {status === 'loading'
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />
            }
            {status === 'loading' ? 'Capturando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
            <RefreshCw size={28} className="opacity-30" />
            <p className="text-sm">Pulsa "Actualizar" para capturar DeBank en tiempo real</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
            <Loader2 size={28} className="animate-spin opacity-50" />
            <p className="text-sm">Capturando página… (puede tardar unos segundos)</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-32 text-red-500 gap-2">
            <AlertCircle size={28} className="opacity-60" />
            <p className="text-sm">{errorMsg}</p>
            <button onClick={capture} className="text-xs underline">Reintentar</button>
          </div>
        )}

        {status === 'done' && screenshotUrl && (
          <div className="rounded-lg overflow-auto border border-gray-100 max-h-[70vh]">
            <img
              src={screenshotUrl}
              alt={`DeBank ${investor.name}`}
              className="block w-full min-w-[900px]"
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

  const [capturingAll, setCapturingAll] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Datos Actuales"
        sub="Capturas en tiempo real de DeBank para cada inversor"
      />

      {withDebank.length === 0 ? (
        <p className="text-gray-400 text-sm">Ningún inversor tiene URL de DeBank configurada.</p>
      ) : (
        <div className="space-y-5">
          {withDebank.map(inv => (
            <InvestorCapture key={inv.id} investor={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
