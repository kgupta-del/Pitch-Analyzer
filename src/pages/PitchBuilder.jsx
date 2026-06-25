import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePitchPlan } from '../services/gemini';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FIELDS = [
  { key: 'companyName', label: 'Company / Startup Name', placeholder: 'e.g. EcoStream', required: true, type: 'input' },
  { key: 'oneLiner', label: 'One-Line Description', placeholder: 'e.g. Smart IoT sensors that cut farm water usage by 40%', required: true, type: 'input' },
  { key: 'problem', label: 'Problem Being Solved', placeholder: 'Describe the pain point your startup addresses...', required: true, type: 'textarea' },
  { key: 'solution', label: 'Your Solution', placeholder: 'How does your product/service solve that problem?', required: true, type: 'textarea' },
  { key: 'targetMarket', label: 'Target Market / Customer', placeholder: 'e.g. US commercial farmers with 500+ acres', required: true, type: 'input' },
  { key: 'revenueModel', label: 'Revenue Model', placeholder: 'e.g. SaaS $299/mo + hardware one-time fee', required: true, type: 'input' },
  { key: 'traction', label: 'Current Traction (optional)', placeholder: 'Revenue, customers, pilots, partnerships...', required: false, type: 'textarea' },
  { key: 'fundingAsk', label: 'Funding Ask', placeholder: 'e.g. $500k for 5% equity', required: false, type: 'input' },
];

function SlideCard({ slide, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <span className="text-cyan-400 text-sm font-bold">{slide.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{slide.title}</p>
          <p className="text-gray-500 text-xs mt-0.5">{slide.duration}</p>
        </div>
        <svg
          viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-[#1a2d4d] pt-4">
              {slide.keyPoints?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-[11px] uppercase tracking-wide font-medium mb-2">Key Points</p>
                  <ul className="space-y-1.5">
                    {slide.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5 shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-gray-300 text-sm">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {slide.scriptGuide && (
                <div>
                  <p className="text-gray-400 text-[11px] uppercase tracking-wide font-medium mb-2">What to Say</p>
                  <p className="text-gray-300 text-sm leading-relaxed bg-white/[0.03] border border-[#1a2d4d] rounded-lg px-4 py-3">
                    {slide.scriptGuide}
                  </p>
                </div>
              )}

              {slide.deliveryTip && (
                <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-amber-300/90 text-sm">{slide.deliveryTip}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PitchBuilder() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requiredFilled = FIELDS.filter((f) => f.required).every((f) => form[f.key]?.trim());

  const handleGenerate = async () => {
    if (!requiredFilled) return;
    setError('');
    setLoading(true);
    setPlan(null);
    try {
      const result = await generatePitchPlan(form);
      setPlan(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setForm({});
    setError('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-xs text-gray-400 flex items-center gap-2 mb-2">
          <span>TOOLS</span>
          <span>›</span>
          <span className="text-emerald-400">PITCH BUILDER</span>
        </nav>
        <h1 className="text-2xl font-bold text-white">Pitch Builder</h1>
        <p className="text-gray-400 text-sm mt-1">
          Fill in your startup details and get a slide-by-slide pitch plan with scripts and delivery tips.
        </p>
      </div>

      {!plan ? (
        /* ── Input Form ── */
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          <div className="space-y-4">
            {FIELDS.map((field) => (
              <motion.div key={field.key} variants={fadeUp}>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  {field.label}
                  {field.required && <span className="text-emerald-400 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={form[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {error && (
            <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <motion.button
            variants={fadeUp}
            onClick={handleGenerate}
            disabled={!requiredFilled || loading}
            className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Building your pitch plan...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate Pitch Plan
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-gray-500 mt-3">Takes about 10–20 seconds</p>
        </motion.div>
      ) : (
        /* ── Results ── */
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
          {/* Summary bar */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
            <div>
              <h2 className="text-white font-bold text-lg">{plan.pitchTitle}</h2>
              <p className="text-gray-400 text-sm mt-0.5">Total duration: {plan.totalDuration}</p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-[#1a2d4d] px-4 py-2 rounded-lg transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Start Over
            </button>
          </motion.div>

          {/* Opening Hook */}
          {plan.openingHook && (
            <motion.div variants={fadeUp} custom={1} className="mb-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-emerald-400 text-xs uppercase tracking-wide font-medium mb-2">Opening Hook</p>
              <p className="text-white text-base font-medium leading-relaxed">"{plan.openingHook}"</p>
            </motion.div>
          )}

          {/* Slides */}
          <motion.div variants={fadeUp} custom={2} className="mb-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-3">Slide-by-Slide Plan</p>
            <div className="space-y-2">
              {(plan.slides ?? []).map((slide, i) => (
                <SlideCard key={slide.number} slide={slide} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Closing Statement */}
          {plan.closingStatement && (
            <motion.div variants={fadeUp} custom={3} className="mb-5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
              <p className="text-cyan-400 text-xs uppercase tracking-wide font-medium mb-2">Closing Statement</p>
              <p className="text-white text-base font-medium leading-relaxed">"{plan.closingStatement}"</p>
            </motion.div>
          )}

          {/* Power Phrases + Mistakes to Avoid */}
          <motion.div variants={fadeUp} custom={4} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {plan.powerPhrases?.length > 0 && (
              <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
                <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-3">Power Phrases</p>
                <div className="flex flex-wrap gap-2">
                  {plan.powerPhrases.map((phrase, i) => (
                    <span key={i} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {plan.mistakesToAvoid?.length > 0 && (
              <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
                <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-3">Mistakes to Avoid</p>
                <ul className="space-y-2">
                  {plan.mistakesToAvoid.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
                          <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="text-gray-300 text-sm">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Confidence Tips */}
          {plan.confidenceTips?.length > 0 && (
            <motion.div variants={fadeUp} custom={5} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide font-medium mb-3">Confidence Tips</p>
              <div className="space-y-2">
                {plan.confidenceTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
