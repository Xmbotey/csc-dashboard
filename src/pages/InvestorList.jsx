import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getInvestorSummary, formatUSD } from '../data/investors';
import { SectionHeader, Card, HFBadge, InvestorStatusBadge } from '../components/ui';
import { Eye, TrendingUp } from 'lucide-react';

export default function InvestorList() {
  const { investors, prices } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader title="Inversores" sub="Vista general de todos los inversores gestionados" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {investors.map(investor => {
          const summary = getInvestorSummary(investor, prices);
          return (
            <Card key={investor.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg text-[#1E2A6E]">{investor.name}</h2>
                  <p className="text-gray-500 text-sm">{formatUSD(investor.portfolioTotal)} portfolio</p>
                </div>
                <InvestorStatusBadge status={summary.status} />
              </div>

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
