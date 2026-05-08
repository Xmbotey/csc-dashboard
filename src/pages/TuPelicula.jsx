import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeSimulation } from '../utils/simulation';
import { Play, RotateCcw, ChevronLeft } from 'lucide-react';

const FALL_MS = 8000;
const BAR_H = 180;

const fmt$ = (n) => '$' + Math.round(n).toLocaleString('en-US');
const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

export default function TuPelicula() {
  const navigate = useNavigate();
  const { simParams } = useApp();
  const c = useMemo(() => computeSimulation(simParams), [simParams]);

  const [phase, setPhase] = useState('idle');
  const [barDropped, setBarDropped] = useState(false);
  const [firedEvents, setFiredEvents] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [showFinal, setShowFinal] = useState(false);
  const [showSlide, setShowSlide] = useState(false);
  const timers = useRef([]);

  const events = useMemo(() => {
    if (!c) return [];
    const { apr1, apr2, apr3, d1, d2, d3, dayExit1, dayExit2, dayExit3 } = c;
    const { dias } = simParams;
    const t1 = Math.round((dayExit1 / dias) * FALL_MS);
    const t2 = Math.round((dayExit2 / dias) * FALL_MS);
    const t3 = Math.round((dayExit3 / dias) * FALL_MS);
    return [
      { id: 0, emoji: '🐛', label: 'V3.1 · Fees',  income: apr1,     color: '#60A5FA', t: t1 },
      { id: 1, emoji: '⚡', label: 'Delta D1',      income: d1.botin, color: '#4ADE80', t: t1 + 700 },
      { id: 2, emoji: '🐛', label: 'V3.2 · Fees',  income: apr2,     color: '#FB923C', t: t2 },
      { id: 3, emoji: '⚡', label: 'Delta D2',      income: d2.botin, color: '#4ADE80', t: t2 + 700 },
      { id: 4, emoji: '🐛', label: 'V3.3 · Fees',  income: apr3,     color: '#F87171', t: t3 },
      { id: 5, emoji: '⚡', label: 'Delta D3',      income: d3.botin, color: '#4ADE80', t: t3 + 700 },
    ];
  }, [c, simParams]);

  function play() {
    setPhase('playing');
    setTimeout(() => setBarDropped(true), 80);
    events.forEach(ev => {
      const id = setTimeout(() => {
        setFiredEvents(prev => [...prev, ev]);
        const xOff = (Math.random() - 0.5) * 44;
        setFloaters(prev => [...prev, { ...ev, key: `${ev.id}-${Date.now()}`, xOff }]);
      }, ev.t);
      timers.current.push(id);
    });
    timers.current.push(
      setTimeout(() => setShowFinal(true), FALL_MS + 700),
      setTimeout(() => { setShowSlide(true); setPhase('done'); }, FALL_MS + 7000),
    );
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('idle');
    setBarDropped(false);
    setFiredEvents([]);
    setFloaters([]);
    setShowFinal(false);
    setShowSlide(false);
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!c) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#030B1A' }}>
        <p className="text-gray-400 text-lg text-center px-4">Configura los parámetros en el Simulador primero.</p>
        <button onClick={() => navigate('/simulador')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors">
          <ChevronLeft size={18} /> Ir al Simulador
        </button>
      </div>
    );
  }

  const { pe, io, ns, dias, comision } = simParams;
  const caida = ((pe - ns) / pe) * 100;
  const holderFinalH = (ns / pe) * BAR_H;
  const cscFinalH = Math.min((c.capitalFinal / io) * BAR_H, BAR_H);
  const grossEarned = firedEvents.reduce((s, ev) => s + ev.income, 0);
  const netEarned = grossEarned * (1 - comision / 100);
  const lastEvent = firedEvents[firedEvents.length - 1] ?? null;

  // Slide calculations
  const holderVariacion = ((c.sinEstrategia - io) / io) * 100;
  const recoveryCSC = c.totalColNs * (pe / ns) + c.beneficioNeto;
  const recoveryExtra = recoveryCSC - io;
  const recoveryExtraPct = (recoveryExtra / io) * 100;

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #030B1A 0%, #04101F 60%, #020A16 100%)' }}>

      {/* Back button */}
      <button onClick={() => navigate('/simulador')}
        className="absolute top-3 left-4 flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors z-20">
        <ChevronLeft size={15} /> Simulador
      </button>

      {/* ── HEADER ── */}
      <div className="text-center pt-6 pb-3 px-4 flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
          <span className="text-white">Tu </span>
          <span style={{ color: '#FACC15', textShadow: '0 0 30px rgba(250,204,21,0.4)' }}>Película</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-1.5 mt-3 text-xs">
          {[{ label: 'Entrada', val: fmt$(pe) }, { label: 'Capital', val: fmt$(io) }, { label: 'Suelo', val: fmt$(ns) }].map(chip => (
            <span key={chip.label} className="px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D1D5DB' }}>
              {chip.label}: <strong className="text-white">{chip.val}</strong>
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'rgba(127,29,29,0.5)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5' }}>
            Caída: <strong>–{caida.toFixed(0)}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D1D5DB' }}>
            {dias}d
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT (arena + slide comparten espacio) ── */}
      <div className="flex-1 relative min-h-0">

        {/* ── FASE 1: PELÍCULA (barras) ── */}
        <div className="absolute inset-0 flex justify-center items-start gap-5 md:gap-12 px-4 md:px-10 pt-2 transition-opacity duration-700"
          style={{ opacity: showSlide ? 0 : 1, pointerEvents: showSlide ? 'none' : 'auto' }}>

          {/* HOLDER */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]"
            style={{ animation: 'slideInLeft 0.6s ease-out both' }}>
            <div className="text-center">
              <p className="text-lg md:text-xl font-black text-gray-300">El Holder</p>
              <p className="text-gray-600 text-xs">Compra y espera</p>
            </div>
            <p className="text-gray-500 text-xs font-mono">{fmt$(io)}</p>
            <div className="relative w-full rounded-2xl overflow-hidden"
              style={{ height: BAR_H, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-2xl"
                style={{
                  height: barDropped ? holderFinalH : BAR_H,
                  transition: barDropped ? `height ${FALL_MS}ms linear` : 'none',
                  background: 'linear-gradient(180deg, #EF4444 0%, #7F1D1D 100%)',
                }} />
              {phase !== 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-red-400 text-xs font-bold opacity-40">▼ cayendo</span>
                </div>
              )}
            </div>
            {showFinal ? (
              <div className="text-center" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                <p className="text-2xl md:text-3xl font-black text-red-400">{fmt$(c.sinEstrategia)}</p>
                <p className="font-bold text-red-500">{fmtPct(holderVariacion)}</p>
              </div>
            ) : <div style={{ height: 52 }} />}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-start pt-10 gap-2 flex-shrink-0">
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-gray-600 text-xs font-black px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.04)' }}>VS</span>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* CSC */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]"
            style={{ animation: 'slideInRight 0.6s ease-out both' }}>
            <div className="text-center">
              <p className="text-lg md:text-xl font-black" style={{ color: '#60A5FA' }}>Estrategia CSC</p>
              <p className="text-gray-600 text-xs">3 Orugas + Deltas</p>
            </div>
            {firedEvents.length > 0 ? (
              <div key={firedEvents.length} className="text-center" style={{ animation: 'scalePop 0.35s ease-out both' }}>
                <p className="text-xs font-bold" style={{ color: '#4ADE80' }}>+{fmt$(netEarned)} generado</p>
              </div>
            ) : <p className="text-gray-500 text-xs font-mono">{fmt$(io)}</p>}

            <div className="relative w-full" style={{ height: BAR_H + 80 }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-2xl"
                style={{ height: BAR_H, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div className="absolute bottom-0 left-0 right-0 rounded-2xl"
                style={{
                  height: barDropped ? cscFinalH : BAR_H,
                  transition: barDropped ? `height ${FALL_MS}ms linear` : 'none',
                  background: 'linear-gradient(180deg, #3B82F6 0%, #1E3A8A 100%)',
                }} />
              {lastEvent && (
                <div key={firedEvents.length} className="absolute bottom-0 left-0 right-0 rounded-2xl pointer-events-none"
                  style={{
                    height: BAR_H,
                    background: `radial-gradient(circle at 50% 60%, ${lastEvent.color}55, transparent 70%)`,
                    animation: 'flashGlow 1s ease-out forwards',
                  }} />
              )}
              {floaters.map(f => (
                <div key={f.key} className="absolute pointer-events-none"
                  style={{ bottom: Math.round(BAR_H * 0.45), left: `calc(50% + ${f.xOff}px)`, transform: 'translateX(-50%)', zIndex: 10 }}>
                  <div className="text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-xl"
                    style={{ color: f.color, background: 'rgba(3,11,26,0.9)', border: `1px solid ${f.color}70`, animation: 'floatUpY 2.8s ease-out forwards' }}>
                    {f.emoji} +{fmt$(f.income)}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full space-y-1" style={{ minHeight: 44 }}>
              {firedEvents.slice(-2).map(ev => (
                <div key={ev.id} className="flex justify-between items-center px-2 py-1 rounded-lg text-xs"
                  style={{ background: `${ev.color}12`, borderLeft: `2px solid ${ev.color}`, animation: 'fadeInUp 0.3s ease-out both' }}>
                  <span style={{ color: ev.color }}>{ev.emoji} {ev.label}</span>
                  <span className="text-white font-bold ml-1">+{fmt$(ev.income)}</span>
                </div>
              ))}
            </div>

            {showFinal ? (
              <div className="text-center" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                <p className="text-2xl md:text-3xl font-black" style={{ color: '#4ADE80' }}>{fmt$(c.capitalFinal)}</p>
                <p className="font-bold" style={{ color: '#22C55E' }}>{fmtPct(c.variacion)}</p>
              </div>
            ) : <div style={{ height: 52 }} />}
          </div>
        </div>

        {/* ── FASE 2: DIAPOSITIVA DE CIERRE ── */}
        {showSlide && (
          <div className="absolute inset-0 flex flex-col justify-center gap-4 px-5 md:px-12"
            style={{ animation: 'fadeInUp 0.9s ease-out both' }}>

            {/* Comparativa en el suelo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl px-4 py-3 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">El Holder · en el suelo</p>
                <p className="text-2xl md:text-3xl font-black text-red-400">{fmt$(c.sinEstrategia)}</p>
                <p className="text-red-500 font-bold text-sm">{fmtPct(holderVariacion)}</p>
                <p className="text-gray-300 text-xs mt-1">de su capital inicial</p>
              </div>
              <div className="rounded-2xl px-4 py-3 text-center"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Estrategia CSC · en el suelo</p>
                <p className="text-2xl md:text-3xl font-black" style={{ color: '#60A5FA' }}>{fmt$(c.capitalFinal)}</p>
                <p className="font-bold text-sm" style={{ color: '#34D399' }}>{fmtPct(c.variacion)}</p>
                <p className="text-gray-600 text-xs mt-1">+{fmt$(c.capitalSalvado)} generados en la caída</p>
              </div>
            </div>

            {/* Explicación */}
            <div className="rounded-2xl px-5 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base md:text-lg font-black text-white mb-2">¿Qué ha pasado?</h2>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                El mercado cayó un <strong className="text-white">{caida.toFixed(0)}%</strong>. El holder llegó al suelo
                con <strong className="text-red-400">{fmt$(c.sinEstrategia)}</strong> — la mitad de su capital, sin ninguna red.
                La estrategia CSC generó <strong className="text-green-400">{fmt$(c.capitalSalvado)}</strong> neto
                mientras el mercado caía, a través de las fees V3 y los botines de los contratos delta.
              </p>
            </div>

            {/* Recuperación */}
            <div>
              <p className="text-center text-xs text-gray-200 uppercase tracking-widest mb-3">
                Si ambos se quedan quietos y ETH vuelve a {fmt$(pe)}…
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl px-4 py-3 text-center"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">El Holder</p>
                  <p className="text-xl md:text-2xl font-black text-gray-300">{fmt$(io)}</p>
                  <p className="text-gray-200 text-xs mt-1">Recupera lo que tenía.</p>
                  <p className="text-gray-200 text-xs">Ni un dólar más.</p>
                </div>
                <div className="rounded-2xl px-4 py-3 text-center"
                  style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Inversor CSC · sin hacer nada más</p>
                  <p className="text-xl md:text-2xl font-black" style={{ color: '#FACC15' }}>{fmt$(recoveryCSC)}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: '#FACC15' }}>
                    +{fmt$(recoveryExtra)} · +{recoveryExtraPct.toFixed(0)}% más capital
                  </p>
                  <p className="text-white text-xs mt-0.5 font-semibold">La caída trabajó para él.</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── BUTTONS ── */}
      <div className="flex justify-center gap-4 py-5 flex-shrink-0">
        {phase === 'idle' && (
          <button onClick={play}
            className="flex items-center gap-3 font-black rounded-2xl transition-all active:scale-95"
            style={{ padding: '14px 48px', fontSize: '1.15rem', background: '#FACC15', color: '#000', boxShadow: '0 0 40px rgba(250,204,21,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <Play size={24} fill="black" /> INICIAR
          </button>
        )}
        {phase === 'playing' && (
          <button onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RotateCcw size={14} /> Cancelar
          </button>
        )}
        {phase === 'done' && (
          <button onClick={reset}
            className="flex items-center gap-2.5 rounded-2xl font-bold text-base text-white transition-colors"
            style={{ padding: '12px 36px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <RotateCcw size={18} /> RESET
          </button>
        )}
      </div>
    </div>
  );
}
