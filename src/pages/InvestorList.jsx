import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getInvestorSummary, getDaysInfo, formatUSD } from '../data/investors';
import { SectionHeader, Card, HFBadge, InvestorStatusBadge } from '../components/ui';
import { Eye, TrendingUp, ArrowDownUp, Calendar } from 'lucide-react';

export default function InvestorList() {
  const { investors, prices } = useApp();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('default');

  const sorted = [...investors].sort((a, b) => {
    if (sortBy === 'pe-desc') {
      return (b.pe ?? -1) - (a.pe ?? -1);
    }
    if (sortBy === 'days-desc') {
      const da = getDaysInfo(a.startDate).daysActive ?? -1;
      const db = getDaysInfo(b.startDate).daysActive ?? -1;
      return db - da;
    }
    return 0;
  });

  return (
    <div>
      <SectionHeader title="Inversores" sub="Vista general de todos los inversores gestionados" />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500">Ordenar por:</span>
        <button
          onClick={() => setSortBy(sortBy === 'pe-desc' ? 'default' : 'pe-desc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            sortBy === 'pe-desc'
              ? 'bg-[#1E2A6E] text-white border-[#1E2A6E]'
              : 'bg-white text-[#1E2A6E] border-[#1E2A6E] hover:bg-blue-50'
          }`}
        >
          <ArrowDownUp size={12} />
          PE mayor → menor
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'days-desc' ? 'default' : 'days-desc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            sortBy === 'days-desc'
              ? 'bg-[#1E2A6E] text-white border-[#1E2A6E]'
              : 'bg-white text-[#1E2A6E] border-[#1E2A6E] hover:bg-blue-50'
          }`}
        >
          <Calendar size={12} />
          Días mayor → menor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map(investor => {
          const summary = getInvestorSummary(investor, prices);
          const { daysActive } = getDaysInfo(investor.startDate);
          const hasPnl = investor.inversionTotal != null && daysActive != null && daysActive > 0;
          const pnl = hasPnl ? investor.portfolioTotal - investor.inversionTotal : null;
          const apy = hasPnl ? (pnl / investor.inversionTotal) * (365 / daysActive) * 100 : null;

          return (
            <Card key={investor.id} className="p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="font-bold text-lg text-[#1E2A6E]">{investor.name}</h2>
                  {investor.inversionTotal != null && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Inversión Total: <span className="font-semibold text-gray-700">{formatUSD(investor.inversionTotal)}</span>
                    </p>
                  )}
                </div>
                <InvestorStatusBadge status={summary.status} />
              </div>

              {/* Portfolio total — prominent */}
              <div className="bg-[#1E2A6E] rounded-xl px-4 py-3 mb-3 mt-2">
                <p className="text-xs text-blue-200 uppercase tracking-wide mb-0.5">Portfolio Total</p>
                <p className="text-2xl font-extrabold text-white">{formatUSD(investor.portfolioTotal)}</p>
                {daysActive != null && (
                  <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                    <Calendar size={11} />
                    Total Días Activo: <span className="font-bold text-white ml-0.5">{daysActive}d</span>
                  </p>
                )}
              </div>

              {/* PnL panel */}
              {hasPnl && (
                <div className={`rounded-xl px-4 py-3 mb-3 ${pnl >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs uppercase tracking-wide font-semibold mb-0.5 ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>PnL</p>
                  <p className={`text-xl font-extrabold ${pnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
                  </p>
                  <p className={`text-xs font-semibold mt-0.5 ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ({apy >= 0 ? '+' : ''}{apy.toFixed(2)}% APY anualizado)
                  </p>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#D6E4F7] rounded-lg p-3">
                  <p className="text-xs text-[#1E2A6E] opacity-70 uppercase tracking-wide">PE Actual</p>
                  <p className="font-bold text-[#1E2A6E]">{formatUSD(investor.pe)}</p>
                </div>
                <div className="bg-[#D6F0DC] rounded-lg p-3">
                  <p className="text-xs text-[#1A5C2A] opacity-70 uppercase tracking-wide">Rewards</p>
                  <p className="font-bold text-[#1A5C2A]">{formatUSD(summary.totalRewards)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">V3 En Rango</p>
                  <p className="font-bold text-gray-700">{summary.activeV3Count}/{summary.totalV3Count}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">HF Mínimo</p>
                  <HFBadge hf={summary.minHF} />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <TrendingUp size={13} />
                  <span>Comisión 30d: <span className="font-semibold text-[#1E2A6E]">{formatUSD(summary.cscFee)}</span></span>
                </div>
                <button
                  onClick={() => navigate(`/inversores/${investor.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2A6E] text-white text-xs rounded-lg hover:bg-[#2E4A9E] transition-colors"
                >
                  <Eye size={13} />
                  Ver detalle
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
