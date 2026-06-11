export default function SentimentAnalysis({ insights }) {
  const confidence = insights?.confidenceMarkers ?? [];
  const concerns = insights?.concernMarkers ?? [];
  const aiConfidence = insights?.aiConfidence ?? 0;

  const concernIcon = (level) => {
    if (level === 'high') return { bg: 'bg-amber-500/10 border-amber-500/20', dot: 'text-amber-400', icon: '⚠' };
    if (level === 'medium') return { bg: 'bg-blue-500/10 border-blue-500/20', dot: 'text-blue-400', icon: 'ℹ' };
    return { bg: 'bg-gray-500/10 border-gray-500/20', dot: 'text-gray-400', icon: '·' };
  };

  return (
    <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-white text-sm font-semibold uppercase tracking-wide">AI Sentiment Analysis</span>
        </div>
        <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
          {aiConfidence}% CONFIDENCE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Confidence Markers */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Confidence Markers</p>
          <div className="space-y-3">
            {confidence.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="text-cyan-400 font-bold">{c.score}%</span>
                </div>
                <div className="h-1.5 bg-[#1a2d4d] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concern Markers */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Concern Markers</p>
          <div className="space-y-2">
            {concerns.map((c, i) => {
              const style = concernIcon(c.level);
              return (
                <div key={i} className={`border rounded-lg p-2.5 ${style.bg}`}>
                  <div className="flex items-start gap-2">
                    <span className={`text-sm mt-0.5 shrink-0 ${style.dot}`}>{style.icon}</span>
                    <p className="text-gray-300 text-xs leading-relaxed">{c.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
