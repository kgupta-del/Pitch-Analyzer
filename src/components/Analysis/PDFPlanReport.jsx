import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const PRIORITY_STYLE = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400' },
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400' },
};

const SECTION_LABELS = {
  problem: 'Problem',
  solution: 'Solution',
  market: 'Market',
  businessModel: 'Biz Model',
  team: 'Team',
  financials: 'Financials',
  traction: 'Traction',
};

function ScoreBar({ label, score }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const color = score >= 7 ? 'bg-green-400' : score >= 5 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-white">{score}/10</span>
      </div>
      <div className="h-1.5 bg-[#1a2d4d] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function PDFPlanReport({ insights }) {
  if (!insights) return null;

  const {
    executiveSummary,
    strengths = [],
    improvements = [],
    missingElements = [],
    sectionScores = {},
    investorReadinessScore,
    nextSteps = [],
  } = insights;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

      {/* Summary */}
      {executiveSummary && (
        <motion.div variants={fadeUp} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2 font-medium">Executive Summary</p>
          <p className="text-gray-300 text-sm leading-relaxed">{executiveSummary}</p>
        </motion.div>
      )}

      {/* Section Scores + Investor Readiness */}
      <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium">Section Scores</p>
          <div className="space-y-3">
            {Object.entries(sectionScores).map(([key, score]) => (
              <ScoreBar key={key} label={SECTION_LABELS[key] ?? key} score={score} />
            ))}
          </div>
        </div>

        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5 flex flex-col">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium">Investor Readiness</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1a2d4d" strokeWidth="2.5" />
                <motion.circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke={investorReadinessScore >= 70 ? '#4ade80' : investorReadinessScore >= 50 ? '#facc15' : '#f87171'}
                  strokeWidth="2.5"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: 100 - (investorReadinessScore ?? 0) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{investorReadinessScore ?? '—'}</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              {investorReadinessScore >= 70 ? 'Ready for investor conversations' : investorReadinessScore >= 50 ? 'Needs some polish before pitching' : 'Significant gaps to address first'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <motion.div variants={fadeUp} custom={2} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium">Strengths</p>
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/15 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-green-400/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-green-400" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{s.area}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <motion.div variants={fadeUp} custom={3} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium">Improvements</p>
          <div className="space-y-3">
            {improvements.map((item, i) => {
              const style = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.medium;
              return (
                <div key={i} className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badge}`}>
                      {item.priority} priority
                    </span>
                    <span className={`text-xs font-semibold ${style.text}`}>{item.area}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{item.suggestion}</p>
                  {item.impact && (
                    <p className="text-gray-500 text-xs italic">Why it matters: {item.impact}</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Missing Elements + Next Steps */}
      <motion.div variants={fadeUp} custom={4} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {missingElements.length > 0 && (
          <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Missing Elements</p>
            <ul className="space-y-2">
              {missingElements.map((el, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-gray-300 text-sm">{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextSteps.length > 0 && (
          <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Next Steps</p>
            <ol className="space-y-2">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-300 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
