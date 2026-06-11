import { useRef, useState, useEffect } from 'react';

export default function MediaPlayer({ mediaUrl, mediaType }) {
  const mediaRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  };

  const handleTimeUpdate = () => setCurrentTime(mediaRef.current?.currentTime ?? 0);
  const handleLoadedMetadata = () => setDuration(mediaRef.current?.duration ?? 0);
  const handleEnded = () => setPlaying(false);

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (mediaRef.current) mediaRef.current.currentTime = ratio * duration;
  };

  const toggleMute = () => {
    if (mediaRef.current) mediaRef.current.muted = !muted;
    setMuted(!muted);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!mediaUrl) {
    return (
      <div className="aspect-video bg-[#0a1628] rounded-xl border border-[#1a2d4d] flex items-center justify-center">
        <span className="text-gray-500 text-sm">No media available</span>
      </div>
    );
  }

  return (
    <div className="bg-[#08122a] rounded-xl border border-[#1a2d4d] overflow-hidden">
      {mediaType === 'video' ? (
        <div className="relative bg-black aspect-video group">
          <video
            ref={mediaRef}
            src={mediaUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onClick={toggle}
          />
          {!playing && (
            <button
              onClick={toggle}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center backdrop-blur-sm hover:bg-cyan-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400 translate-x-0.5">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0d1f3a] to-[#08122a] aspect-video flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-white font-medium">Audio Pitch</p>
          <audio
            ref={mediaRef}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          <button
            onClick={toggle}
            className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center hover:bg-cyan-500/30 transition-all"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400 translate-x-0.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="px-4 py-3 space-y-2">
        <div
          className="h-1.5 bg-[#1a2d4d] rounded-full cursor-pointer group"
          onClick={seek}
        >
          <div
            className="h-full bg-cyan-400 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {mediaType === 'video' && (
              <button onClick={toggle} className="hover:text-white transition-colors">
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
            )}
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {muted ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                  <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <span>{fmt(currentTime)}</span>
          </div>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
