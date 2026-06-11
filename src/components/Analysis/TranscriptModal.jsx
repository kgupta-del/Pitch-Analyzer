import { useEffect } from 'react';

export default function TranscriptModal({ transcript, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2d4d]">
          <h3 className="text-white font-semibold">Full Transcript</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {transcript?.speakers?.length > 0 ? (
            <div className="space-y-4">
              {transcript.speakers.map((u, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0 mt-0.5">
                    {u.speaker}
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm leading-relaxed">{u.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {transcript?.text ?? 'No transcript available.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
