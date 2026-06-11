import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

const STATUS_COLORS = {
  'High': 'text-green-400 bg-green-400/10 border-green-400/20',
  'Medium': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Low': 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, 'analyses'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setAnalyses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = {
    total: analyses.length,
    highInvest: analyses.filter((a) => a.insights?.investability === 'High').length,
    avgScore: analyses.length
      ? (analyses.reduce((s, a) => s + (a.insights?.pitchScore ?? 0), 0) / analyses.length).toFixed(1)
      : '—',
  };

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Analyses', value: stats.total, icon: '📊', color: 'cyan' },
          { label: 'Avg Pitch Score', value: stats.avgScore, icon: '🎯', color: 'blue' },
          { label: 'High Investability', value: stats.highInvest, icon: '🦈', color: 'green' },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{s.label}</span>
              <span className="text-xl">{s.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '—' : s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Analyses */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Recent Analyses</h2>
        <Link
          to="/new-analysis"
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Analysis
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🦈</div>
          <p className="text-white font-semibold mb-1">No analyses yet</p>
          <p className="text-gray-400 text-sm mb-5">Upload your first pitch to get started</p>
          <button
            onClick={() => navigate('/new-analysis')}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Analyze a Pitch
          </button>
        </div>
      ) : (
        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2d4d]">
                {['Pitch', 'Score', 'Investability', 'Session ID', 'Date', ''].map((h) => (
                  <th key={h} className="text-left text-gray-400 font-medium px-5 py-3 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate(`/analysis/${a.id}`)}
                  className="border-b border-[#1a2d4d] last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{a.insights?.companyName ?? a.title ?? 'Untitled'}</div>
                    <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">
                      {a.insights?.productDescription ?? ''}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-cyan-400 font-bold">{a.insights?.pitchScore ?? '—'}</span>
                    <span className="text-gray-500">/10</span>
                  </td>
                  <td className="px-5 py-4">
                    {a.insights?.investability ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[a.insights.investability]}`}>
                        {a.insights.investability}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{a.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
