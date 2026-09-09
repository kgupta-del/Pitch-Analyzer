import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getMedia } from '../services/mediaStore';
import { trackEvent } from '../services/analytics';
import { exportToPDF } from '../services/pdfExport';
import MediaPlayer from '../components/Analysis/MediaPlayer';
import SentimentAnalysis from '../components/Analysis/SentimentAnalysis';
import DealEvaluation from '../components/Analysis/DealEvaluation';
import SharkVerdicts from '../components/Analysis/SharkVerdicts';
import SentimentChart from '../components/Analysis/SentimentChart';
import TranscriptModal from '../components/Analysis/TranscriptModal';
import PDFPlanReport from '../components/Analysis/PDFPlanReport';

const INVEST_STYLE = {
  High: 'text-green-400',
  Medium: 'text-yellow-400',
  Low: 'text-red-400',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function AnalysisDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'analyses', id));
        if (snap.exists() && snap.data().uid === user.uid) {
          setAnalysis({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleDelete = async () => {
    if (!confirm('Permanently delete this pitch report? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'analyses', id));
      trackEvent('analysis_deleted', { analysis_id: id, source_type: analysis?.sourceType });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  const handleSharePDF = async () => {
    if (!analysis) return;
    setExporting(true);
    try {
      exportToPDF(analysis);
      trackEvent('report_exported', {
        analysis_id: id,
        format: 'pdf',
        source_type: analysis.sourceType,
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Analysis not found.</p>
        <Link to="/dashboard" className="text-cyan-400 text-sm mt-2 inline-block hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const { insights, transcript, mediaType, createdAt, sourceType } = analysis;
  const isPDFAnalysis = sourceType === 'pdf';
  const sessionMedia = getMedia(id);
  const sessionId = `#PX-${id.slice(0, 5).toUpperCase()}`;
  const dateStr = createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb + Title */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <nav className="text-xs text-gray-400 flex items-center gap-2 mb-2">
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">ANALYSES</Link>
            <span>›</span>
            <span>{isPDFAnalysis ? 'BUSINESS PLAN' : 'INDIVIDUAL PITCH'}</span>
            <span>›</span>
            <span className={isPDFAnalysis ? 'text-violet-400' : 'text-cyan-400'}>
              {(insights?.companyName ?? analysis.title ?? 'PITCH').toUpperCase()}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {insights?.companyName ?? analysis.title ?? 'Analysis'}
            </h1>
            {isPDFAnalysis && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                PDF Plan
              </span>
            )}
          </div>
          {insights?.productDescription && !isPDFAnalysis && (
            <p className="text-gray-400 text-sm mt-0.5">{insights.productDescription}</p>
          )}
          {insights?.planTitle && isPDFAnalysis && (
            <p className="text-gray-400 text-sm mt-0.5">{insights.planTitle}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Session ID: <span className="text-gray-400 font-mono">{sessionId}</span>
            {dateStr && <span> · {dateStr}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isPDFAnalysis && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSharePDF}
              disabled={exporting}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              Share Insights
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            Delete
          </motion.button>
        </div>
      </motion.div>

      {isPDFAnalysis ? (
        /* ── PDF Business Plan Layout ── */
        <>
          {/* Score row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Plan Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{insights?.pitchScore ?? '—'}</span>
                <span className="text-gray-400 text-sm">/10</span>
              </div>
            </div>
            <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Investability</p>
              <span className={`text-2xl font-bold ${INVEST_STYLE[insights?.investability] ?? 'text-white'}`}>
                {insights?.investability ?? '—'}
              </span>
            </div>
            <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-4 sm:col-span-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Company</p>
              <p className="text-white font-semibold truncate">{insights?.companyName ?? analysis.title ?? '—'}</p>
              <p className="text-gray-500 text-xs mt-0.5">{analysis.fileName}</p>
            </div>
          </motion.div>

          <PDFPlanReport insights={insights} />
        </>
      ) : (
        /* ── Pitch Media Layout ── */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div variants={stagger} className="lg:col-span-2 space-y-5">
              <motion.div variants={fadeUp}>
                {sessionMedia ? (
                  <MediaPlayer
                    mediaUrl={sessionMedia.url}
                    mediaType={mediaType ?? (sessionMedia.type.startsWith('video') ? 'video' : 'audio')}
                  />
                ) : (
                  <div className="aspect-video bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl flex flex-col items-center justify-center gap-3 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-[#1a2d4d] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-500" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Media not available</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {analysis.fileName ? `"${analysis.fileName}" · ` : ''}Files are not stored — re-upload to replay
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
              <motion.div variants={fadeUp} custom={1}><SentimentAnalysis insights={insights} /></motion.div>
            </motion.div>

            <motion.div variants={stagger} className="space-y-5">
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Pitch Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{insights?.pitchScore ?? '—'}</span>
                    <span className="text-gray-400 text-sm">/10</span>
                  </div>
                </div>
                <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Investability</p>
                  <span className={`text-2xl font-bold ${INVEST_STYLE[insights?.investability] ?? 'text-white'}`}>
                    {insights?.investability ?? '—'}
                  </span>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1}><DealEvaluation insights={insights} /></motion.div>
              <motion.div variants={fadeUp} custom={2}><SharkVerdicts sharks={insights?.sharkVerdicts ?? []} /></motion.div>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <motion.div variants={fadeUp}><SentimentChart data={insights?.sentimentOverTime ?? []} /></motion.div>

            <motion.div variants={fadeUp} custom={1} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Key Phrases</p>
              <div className="flex flex-wrap gap-2">
                {(insights?.keyPhrases ?? []).map((phrase) => (
                  <motion.span
                    key={phrase}
                    whileHover={{ scale: 1.05 }}
                    className="text-xs bg-[#1a2d4d] text-gray-300 border border-[#2a3d5d] px-3 py-1.5 rounded-full cursor-default"
                  >
                    {phrase}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Transcription</p>
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                {transcript?.text ? `...${transcript.text.slice(0, 200)}...` : 'No transcript available.'}
              </p>
              <button onClick={() => setShowTranscript(true)} className="text-cyan-400 text-xs font-medium mt-3 hover:underline">
                VIEW FULL LOGS →
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Next Best Step</p>
              <p className="text-gray-300 text-sm leading-relaxed">{insights?.nextBestStep ?? '—'}</p>
              <div className="mt-3 h-0.5 w-12 bg-cyan-400 rounded-full" />
            </motion.div>
          </motion.div>

          {insights?.overallSummary && (
            <motion.div variants={fadeUp} className="mt-5 bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2 font-medium">Overall Summary</p>
              <p className="text-gray-300 text-sm leading-relaxed">{insights.overallSummary}</p>
            </motion.div>
          )}
        </>
      )}

      {showTranscript && (
        <TranscriptModal transcript={transcript} onClose={() => setShowTranscript(false)} />
      )}
    </motion.div>
  );
}
