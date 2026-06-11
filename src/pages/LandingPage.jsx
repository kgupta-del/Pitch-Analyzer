import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Common/Logo';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Auto Transcription',
    desc: 'High-accuracy speech-to-text via AssemblyAI converts your pitch audio into a searchable transcript in minutes.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" />
      </svg>
    ),
    title: 'AI Pitch Scoring',
    desc: 'Gemini AI reads your transcript and returns a 0–10 pitch score, investability rating, and a plain-English summary.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    title: 'Shark Verdicts',
    desc: 'See how Mark Cuban, Kevin O\'Leary, Lori Greiner, Daymond John and Robert Herjavec would each react to your pitch.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
    title: 'Deal Evaluation',
    desc: 'AI targets a fair equity split based on your ARR and growth rate, and suggests the best counter-offer terms.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Sentiment Analysis',
    desc: 'Confidence and concern markers surface exactly where your pitch lands strongest — and where it loses the room.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'PDF Reports',
    desc: 'Export a polished, shareable PDF report of every analysis — perfect for investor prep or team debriefs.',
  },
];

const STEPS = [
  { n: '01', title: 'Upload your pitch', desc: 'Drop a video or audio file. Your media stays local — it\'s never stored in the cloud.' },
  { n: '02', title: 'AI does the work', desc: 'AssemblyAI transcribes the audio, then Gemini analyzes the full transcript for deep insights.' },
  { n: '03', title: 'Read your report', desc: 'Get a scored report with shark verdicts, deal terms, concern flags, and a next-best-step recommendation.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const ctaTarget = user ? '/dashboard' : '/auth';

  return (
    <div className="min-h-screen bg-[#060d1e] text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-md bg-[#060d1e]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-sm font-bold tracking-wide">PITCHANALYZER <span className="text-cyan-400">AI</span></span>
          </button>

          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
            <button onClick={() => scrollTo(featuresRef)} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollTo(howRef)} className="hover:text-white transition-colors">How It Works</button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Open App
              </button>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
                <Link to="/auth" className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full bg-blue-600/8 blur-[80px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-medium mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Powered by AssemblyAI + Google Gemini
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-4xl sm:text-6xl font-bold leading-tight mb-5"
          >
            Would the Sharks{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              fund your pitch?
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Upload your pitch video or audio and get an AI-powered Shark Tank analysis — score, shark verdicts, deal terms, and what to fix — in minutes.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate(ctaTarget)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              Analyze Your Pitch Free →
            </button>
            <button
              onClick={() => scrollTo(howRef)}
              className="text-gray-400 hover:text-white text-sm px-6 py-3 rounded-xl border border-[#1a2d4d] hover:border-gray-500 transition-colors"
            >
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* Mock UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto mt-16"
        >
          <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-2xl p-5 shadow-2xl shadow-black/60">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 bg-[#060d1e] rounded ml-2 h-5" />
            </div>
            {/* Fake score cards */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[['Pitch Score', '8.4/10', 'text-white'], ['Investability', 'High', 'text-green-400'], ['AI Confidence', '92%', 'text-cyan-400']].map(([l, v, c]) => (
                <div key={l} className="bg-[#060d1e] border border-[#1a2d4d] rounded-xl p-3">
                  <p className="text-gray-500 text-[10px] mb-1">{l}</p>
                  <p className={`text-xl font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>
            {/* Fake bars */}
            <div className="space-y-2">
              {[['Market Knowledge', 98], ['Tech Scalability', 84], ['Revenue Logic', 76]].map(([label, pct]) => (
                <div key={label}>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>{label}</span><span className="text-cyan-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a2d4d] rounded-full">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under mock UI */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-cyan-500/10 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} className="py-24 px-6 border-t border-[#1a2d4d]">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold">Everything you need to nail your pitch</motion.h2>
          </Section>
          <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i * 0.5}
                whileHover={{ y: -4, borderColor: 'rgba(6,182,212,0.3)' }}
                className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howRef} className="py-24 px-6 border-t border-[#1a2d4d]">
        <div className="max-w-4xl mx-auto">
          <Section className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">How It Works</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold">From upload to insights in minutes</motion.h2>
          </Section>
          <Section className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-cyan-500/30 via-[#1a2d4d] to-transparent hidden sm:block" />
            <div className="space-y-8">
              {STEPS.map((s, i) => (
                <motion.div key={s.n} variants={fadeUp} custom={i} className="flex gap-5">
                  <div className="w-10 h-10 rounded-full bg-[#0d1f3a] border border-[#1a2d4d] flex items-center justify-center shrink-0 relative z-10">
                    <span className="text-cyan-400 text-xs font-bold">{s.n}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-[#1a2d4d]">
        <Section className="max-w-2xl mx-auto text-center">
          <motion.div variants={fadeUp} className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-6">
            🦈
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to swim with the sharks?
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-gray-400 mb-8">
            Free to start. No credit card required.
          </motion.p>
          <motion.button
            variants={fadeUp}
            custom={3}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(ctaTarget)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-colors"
          >
            Start Analyzing Free →
          </motion.button>
        </Section>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a2d4d] py-6 px-6 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} PitchAnalyzer AI · Built with AssemblyAI + Google Gemini
      </footer>
    </div>
  );
}
