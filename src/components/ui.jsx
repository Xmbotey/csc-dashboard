// Shared UI Components

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function KpiCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue: 'bg-[#D6E4F7] text-[#1E2A6E]',
    green: 'bg-[#D6F0DC] text-[#1A5C2A]',
    red: 'bg-[#FFE8E8] text-[#8B0000]',
    orange: 'bg-[#FFF3E0] text-[#E06000]',
    purple: 'bg-purple-50 text-purple-800',
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        {icon && <span className="opacity-50">{icon}</span>}
      </div>
      <p className="text-xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    green: 'bg-[#D6F0DC] text-[#1A5C2A]',
    red: 'bg-[#FFE8E8] text-[#8B0000]',
    orange: 'bg-[#FFF3E0] text-[#E06000]',
    blue: 'bg-[#D6E4F7] text-[#1E2A6E]',
    critical: 'bg-[#8B0000] text-white animate-pulse-red',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function HFBadge({ hf }) {
  if (hf === null || hf === undefined) return <span className="text-gray-400">—</span>;
  let variant = 'green';
  let label = hf.toFixed(2);
  if (hf < 1.5) variant = 'critical';
  else if (hf < 2.0) variant = 'orange';
  return <Badge variant={variant}>{label}{hf < 1.5 ? ' ⚠' : ''}</Badge>;
}

export function V3StatusBadge({ status }) {
  if (status === 'IN_RANGE') return <Badge variant="green">EN RANGO</Badge>;
  if (status === 'OUT_OF_RANGE') return <Badge variant="red">FUERA DE RANGO</Badge>;
  return <Badge>—</Badge>;
}

export function InvestorStatusBadge({ status }) {
  const map = {
    'ACTIVO': 'green',
    'VIGILANCIA': 'orange',
    'CRÍTICO': 'critical',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
}

export function SectionHeader({ title, sub }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-[#1E2A6E]">{title}</h1>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th className={`bg-[#1E2A6E] text-white text-xs font-semibold uppercase tracking-wide px-3 py-2.5 text-left whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-3 py-2.5 border-b border-gray-50 ${className}`}>
      {children}
    </td>
  );
}

export function HFGauge({ hf }) {
  if (!hf) return null;
  const max = 3;
  const capped = Math.min(hf, max);
  const angle = -90 + (capped / max) * 180;
  const color = hf >= 2.0 ? '#1A5C2A' : hf >= 1.5 ? '#E06000' : '#8B0000';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-32 h-20">
        {/* Background arc */}
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        {/* Colored arc */}
        <path
          d="M10,60 A50,50 0 0,1 110,60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * 50 * (capped / max)} ${Math.PI * 50}`}
        />
        {/* Needle */}
        <line
          x1="60" y1="60"
          x2={60 + 35 * Math.cos((angle * Math.PI) / 180)}
          y2={60 + 35 * Math.sin((angle * Math.PI) / 180)}
          stroke="#1E2A6E" strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="4" fill="#1E2A6E" />
        <text x="60" y="72" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{hf.toFixed(2)}</text>
      </svg>
      <div className="flex gap-3 text-xs mt-1">
        <span className="text-[#8B0000]">Crítico &lt;1.5</span>
        <span className="text-[#E06000]">Vigilancia &lt;2.0</span>
        <span className="text-[#1A5C2A]">Seguro ≥2.0</span>
      </div>
    </div>
  );
}

export function EditableInput({ value, onChange, prefix = '$', suffix = '' }) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-gray-400 text-xs">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 px-2 py-1 text-sm border border-yellow-300 rounded bg-[#FFF9C4] text-gray-800 focus:outline-none focus:border-yellow-500"
        style={{ minWidth: '60px' }}
      />
      {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
    </div>
  );
}
