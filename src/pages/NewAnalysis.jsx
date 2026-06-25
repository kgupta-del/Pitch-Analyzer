import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { transcribeMedia } from '../services/assemblyai';
import { analyzePitch, analyzePDFPlan } from '../services/gemini';
import { setMedia } from '../services/mediaStore';

const MEDIA_STEPS = [
  { key: 'processing', label: 'Processing audio...' },
  { key: 'transcribing', label: 'Transcribing pitch...' },
  { key: 'analyzing', label: 'Analyzing pitch with AI...' },
  { key: 'saving', label: 'Saving report...' },
  { key: 'done', label: 'Analysis complete!' },
];

const PDF_STEPS = [
  { key: 'reading', label: 'Reading business plan...' },
  { key: 'analyzing', label: 'Analyzing with AI...' },
  { key: 'saving', label: 'Saving report...' },
  { key: 'done', label: 'Analysis complete!' },
];

export default function NewAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('media'); // 'media' | 'pdf'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [step, setStep] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted) => {
    if (accepted.length) setFile(accepted[0]);
  }, []);

  const mediaDropzone = useDropzone({
    onDrop,
    accept: { 'video/*': [], 'audio/*': [] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled: step !== null,
  });

  const pdfDropzone = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: step !== null,
  });

  const dropzone = mode === 'media' ? mediaDropzone : pdfDropzone;
  const steps = mode === 'media' ? MEDIA_STEPS : PDF_STEPS;
  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const isAnalyzing = step !== null && step !== 'done';

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setFile(null);
    setStep(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setError('');

    try {
      if (mode === 'media') {
        const transcript = await transcribeMedia(file, (s) => setStep(s));
        setStep('analyzing');
        const insights = await analyzePitch(transcript.text);
        setStep('saving');
        const docRef = await addDoc(collection(db, 'analyses'), {
          uid: user.uid,
          title: title || file.name.replace(/\.[^.]+$/, ''),
          mediaType: file.type.startsWith('video') ? 'video' : 'audio',
          fileName: file.name,
          sourceType: 'media',
          transcript,
          insights,
          createdAt: serverTimestamp(),
        });
        setMedia(docRef.id, file);
        setStep('done');
        setTimeout(() => navigate(`/analysis/${docRef.id}`), 800);
      } else {
        setStep('reading');
        setStep('analyzing');
        const insights = await analyzePDFPlan(file);
        setStep('saving');
        const docRef = await addDoc(collection(db, 'analyses'), {
          uid: user.uid,
          title: title || file.name.replace(/\.[^.]+$/, ''),
          fileName: file.name,
          sourceType: 'pdf',
          insights,
          createdAt: serverTimestamp(),
        });
        setStep('done');
        setTimeout(() => navigate(`/analysis/${docRef.id}`), 800);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPDF = file?.type === 'application/pdf';
  const isVideo = file?.type?.startsWith('video');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <nav className="text-xs text-gray-400 flex items-center gap-2 mb-2">
          <span>ANALYSES</span>
          <span>›</span>
          <span className="text-cyan-400">NEW ANALYSIS</span>
        </nav>
        <h1 className="text-2xl font-bold text-white">Analyze a Pitch</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload a pitch video, audio, or a PDF business plan for AI-powered feedback.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-1 mb-5">
        <button
          onClick={() => handleModeSwitch('media')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'media'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
            <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Pitch Video / Audio
        </button>
        <button
          onClick={() => handleModeSwitch('pdf')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'pdf'
              ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          Business Plan PDF
        </button>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1.5 font-medium">
          {mode === 'media' ? 'Pitch Title (optional)' : 'Plan Title (optional)'}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === 'media' ? 'e.g. EcoStream: Smart Irrigation' : 'e.g. EcoStream Business Plan 2025'}
          disabled={isAnalyzing}
          className="w-full bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Dropzone */}
      <div
        {...dropzone.getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6 ${dropzone.isDragActive
            ? mode === 'pdf' ? 'border-violet-400 bg-violet-400/5' : 'border-cyan-400 bg-cyan-400/5'
            : file
              ? 'border-[#1a2d4d] bg-[#0d1f3a]'
              : mode === 'pdf'
                ? 'border-[#1a2d4d] bg-[#0d1f3a] hover:border-violet-500/50 hover:bg-violet-500/5'
                : 'border-[#1a2d4d] bg-[#0d1f3a] hover:border-cyan-500/50 hover:bg-cyan-500/5'
          } ${isAnalyzing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...dropzone.getInputProps()} />
        {file ? (
          <div>
            <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center border ${isPDF ? 'bg-violet-500/10 border-violet-500/20' : 'bg-cyan-500/10 border-cyan-500/20'
              }`}>
              {isPDF ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-violet-400" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              ) : isVideo ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <polygon points="10,9 16,12 10,15" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-cyan-400" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-gray-400 text-sm mt-1">{formatSize(file.size)} · {file.type}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-3 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#0d1f3a] border border-[#1a2d4d] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-gray-400" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">
              {dropzone.isDragActive ? 'Drop it here!' : mode === 'pdf' ? 'Drop your business plan here' : 'Drop your pitch here'}
            </p>
            <p className="text-gray-400 text-sm">
              {mode === 'pdf'
                ? 'or click to browse · PDF only · Up to 50 MB'
                : 'or click to browse · MP4, MOV, MP3, WAV, M4A · Up to 500 MB'}
            </p>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className={`flex items-start gap-2 rounded-xl px-4 py-3 mb-5 border ${mode === 'pdf'
          ? 'bg-violet-500/5 border-violet-500/15'
          : 'bg-cyan-500/5 border-cyan-500/15'
        }`}>
        <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'pdf' ? 'text-violet-400' : 'text-cyan-400'}`} stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p
          className={`text-xs leading-relaxed ${mode === 'pdf' ? 'text-violet-300/80' : 'text-cyan-300/80'
            }`}
        >
          {mode === 'pdf' ? (
            <>
              Your PDF is sent directly to Gemini AI for analysis and is{' '}
              <strong>never stored</strong> in cloud storage. Only the text feedback
              is saved to your account.
            </>
          ) : (
            <>
              Your media file is <strong>never uploaded to cloud storage</strong>. It's
              sent directly to AssemblyAI for transcription and stays in your browser
              for this session only.
            </>
          )}
        </p>
      </div>

      {/* Progress */}
      {step && (
        <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5 mb-5">
          <div className="space-y-3">
            {steps.map((s, i) => {
              const done = currentStepIndex > i || step === 'done';
              const active = s.key === step;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-400/20' : active ? 'bg-cyan-400/20' : 'bg-[#1a2d4d]'
                    }`}>
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-green-400" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : active ? (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                    )}
                  </div>
                  <span className={`text-sm ${done ? 'text-gray-400 line-through' : active ? 'text-white font-medium' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className={`w-full disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${mode === 'pdf'
            ? 'bg-violet-500 hover:bg-violet-400 text-white'
            : 'bg-cyan-500 hover:bg-cyan-400 text-black'
          }`}
      >
        {isAnalyzing ? (
          <>
            <div className={`w-4 h-4 border-2 rounded-full animate-spin ${mode === 'pdf' ? 'border-white/30 border-t-white' : 'border-black/30 border-t-black'}`} />
            {mode === 'pdf' ? 'Analyzing plan...' : 'Analyzing pitch...'}
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {mode === 'pdf' ? 'Analyze Business Plan' : 'Start Analysis'}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-3">
        {mode === 'pdf'
          ? 'PDF analysis typically takes 15–30 seconds'
          : 'Analysis typically takes 2–5 minutes depending on pitch length'}
      </p>
    </div>
  );
}
