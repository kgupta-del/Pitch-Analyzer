import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const INVEST_BADGE = {
  High: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Low: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function Archive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, 'analyses'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
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

  const filtered = analyses.filter((a) => {
    const term = search.toLowerCase();
    return (
      !term ||
      (a.insights?.companyName ?? a.title ?? '').toLowerCase().includes(term) ||
      (a.insights?.productDescription ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Archive</h1>
          <p className="text-gray-400 text-sm mt-0.5">All your saved pitch analyses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <Link
            to="/new-analysis"
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            New Analysis
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-white font-semibold mb-1">{search ? 'No results found' : 'Archive is empty'}</p>
          <p className="text-gray-400 text-sm">
            {search ? 'Try a different search term' : 'Start analyzing pitches to build your archive'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const dateStr = a.createdAt?.toDate
              ? a.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            return (
              <div
                key={a.id}
                onClick={() => navigate(`/analysis/${a.id}`)}
                className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5 cursor-pointer hover:border-cyan-500/30 hover:bg-[#0f2040] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    {a.mediaType === 'video' ? (
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <polygon points="10,9 16,12 10,15" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  {a.insights?.investability && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${INVEST_BADGE[a.insights.investability]}`}>
                      {a.insights.investability}
                    </span>
                  )}
                </div>

                <h3 className="text-white font-semibold mb-0.5 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {a.insights?.companyName ?? a.title ?? 'Untitled Pitch'}
                </h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                  {a.insights?.productDescription ?? 'No description available'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-400 text-lg font-bold">{a.insights?.pitchScore ?? '—'}</span>
                    <span className="text-gray-500 text-xs">/10</span>
                  </div>
                  <span className="text-gray-500 text-xs">{dateStr}</span>
                </div>

                {/* Mini shark verdicts */}
                {a.insights?.sharkVerdicts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1a2d4d] flex items-center gap-1">
                    <span className="text-gray-500 text-xs mr-1">Sharks:</span>
                    {a.insights.sharkVerdicts.slice(0, 5).map((s) => (
                      <span
                        key={s.name}
                        title={`${s.name}: ${s.status}`}
                        className={`text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border ${
                          s.status === 'OFFER MADE' ? 'bg-green-400/10 border-green-400/20 text-green-400' :
                          s.status === 'NEGOTIATING' ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                          s.status === 'INTERESTED' ? 'bg-blue-400/10 border-blue-400/20 text-blue-400' :
                          'bg-gray-700/30 border-gray-600/20 text-gray-500'
                        }`}
                      >
                        {s.avatar}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
