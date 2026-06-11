const STATUS_STYLE = {
  'OFFER MADE': 'bg-green-400/10 text-green-400 border-green-400/20',
  'NEGOTIATING': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  'INTERESTED': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  'OUT': 'bg-red-400/10 text-red-400 border-red-400/20',
};

const AVATAR_COLORS = {
  MC: 'from-blue-600 to-blue-800',
  LG: 'from-pink-500 to-rose-700',
  KO: 'from-emerald-600 to-teal-800',
  DJ: 'from-purple-600 to-purple-800',
  RH: 'from-orange-500 to-red-700',
};

export default function SharkVerdicts({ sharks = [] }) {
  return (
    <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white text-sm font-semibold uppercase tracking-wide">Shark Verdicts</span>
      </div>

      <div className="space-y-3">
        {sharks.map((shark) => (
          <div key={shark.name} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[shark.avatar] ?? 'from-gray-600 to-gray-800'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {shark.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-medium">{shark.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLE[shark.status] ?? STATUS_STYLE['OUT']}`}>
                  {shark.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed italic">"{shark.quote}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
