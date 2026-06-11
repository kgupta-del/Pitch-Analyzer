export default function DealEvaluation({ insights }) {
  const ask = insights?.currentAsk;
  const fair = insights?.fairDeal;
  const best = insights?.bestPotentialDeal;

  return (
    <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white text-sm font-semibold uppercase tracking-wide">Deal Evaluation</span>
      </div>

      {/* Current Ask */}
      <div className="bg-[#060d1e] border border-[#1a2d4d] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Current Ask</span>
          <span className="text-gray-400 text-xs">
            {ask?.amount} @ {ask?.equity}
          </span>
        </div>
        <p className="text-white text-2xl font-bold">{ask?.valuation ?? '—'}</p>
      </div>

      {/* Fair Deal */}
      <div className="flex items-start gap-3 py-3 border-b border-[#1a2d4d]">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-blue-400" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
            <path d="M8 12h8M12 8v8" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-0.5">{fair?.title ?? 'Fair Deal (AI Target)'}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{fair?.description ?? '—'}</p>
        </div>
      </div>

      {/* Best Deal */}
      <div className="flex items-start gap-3 pt-3">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-green-400" stroke="currentColor" strokeWidth={1.5}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-0.5">{best?.title ?? 'Best Potential Deal'}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{best?.description ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
