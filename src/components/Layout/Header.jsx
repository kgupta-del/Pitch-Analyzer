import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Common/Logo';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="h-14 bg-[#08122a] border-b border-[#1a2d4d] flex items-center px-6 gap-4 shrink-0">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mr-4">
        <Logo size={28} />
        <span className="text-sm font-bold text-white tracking-wide hidden sm:block">
          PITCHANALYZER <span className="text-cyan-400">AI</span>
        </span>
      </button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search analyses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => navigate('/')}
          title="Home"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
