import jsPDF from 'jspdf';

const C = {
  bg: [6, 13, 30],
  card: [13, 31, 58],
  border: [26, 45, 77],
  cyan: [0, 212, 255],
  white: [255, 255, 255],
  gray: [148, 163, 184],
  green: [52, 211, 153],
  yellow: [251, 191, 36],
  red: [248, 113, 113],
};

function hex(rgb) {
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function statusColor(status) {
  if (status === 'OFFER MADE') return C.green;
  if (status === 'NEGOTIATING') return C.yellow;
  if (status === 'INTERESTED') return [96, 165, 250];
  return C.red;
}

export function exportToPDF(analysis) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { insights, transcript } = analysis;
  const W = 210;
  const margin = 14;
  const colW = (W - margin * 2 - 5) / 2;
  let y = 0;

  // ── helpers ──
  const fill = (color) => doc.setFillColor(...color);
  const text = (color) => doc.setTextColor(...color);
  const font = (size, style = 'normal') => { doc.setFontSize(size); doc.setFont('helvetica', style); };
  const rect = (x, ry, w, h, r = 2) => doc.roundedRect(x, ry, w, h, r, r, 'F');
  const line = (x1, ly, x2) => { doc.setDrawColor(...C.border); doc.line(x1, ly, x2, ly); };

  // ── background ──
  fill(C.bg); rect(0, 0, W, 297, 0);

  // ── header bar ──
  fill(C.card); rect(0, 0, W, 22, 0);
  text(C.cyan); font(10, 'bold');
  doc.text('PITCHANALYZER AI', margin, 9);
  text(C.gray); font(7);
  doc.text('AI-Powered Shark Tank Analysis Report', margin, 15);
  text(C.gray); font(7);
  const dateStr = analysis.createdAt?.toDate
    ? analysis.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString();
  doc.text(dateStr, W - margin, 9, { align: 'right' });
  const sessionId = `#PX-${analysis.id?.slice(0, 5).toUpperCase() ?? 'XXXXX'}`;
  doc.text(`Session: ${sessionId}`, W - margin, 15, { align: 'right' });

  y = 28;

  // ── company + score row ──
  text(C.white); font(14, 'bold');
  doc.text(insights?.companyName ?? analysis.title ?? 'Pitch Report', margin, y);
  y += 5;
  text(C.gray); font(8);
  if (insights?.productDescription) {
    doc.text(insights.productDescription, margin, y, { maxWidth: W - margin * 2 });
    y += 5;
  }
  y += 2; line(margin, y, W - margin); y += 5;

  // Score + Investability + AI Confidence cards (3 columns)
  const cards3W = (W - margin * 2 - 4) / 3;
  const cardH = 16;
  [
    ['PITCH SCORE', `${insights?.pitchScore ?? '—'}/10`, C.white],
    ['INVESTABILITY', insights?.investability ?? '—', insights?.investability === 'High' ? C.green : insights?.investability === 'Medium' ? C.yellow : C.red],
    ['AI CONFIDENCE', `${insights?.aiConfidence ?? '—'}%`, C.cyan],
  ].forEach(([label, value, color], i) => {
    const cx = margin + i * (cards3W + 2);
    fill(C.card); rect(cx, y, cards3W, cardH);
    text(C.gray); font(6);
    doc.text(label, cx + 4, y + 5);
    text(color); font(11, 'bold');
    doc.text(String(value), cx + 4, y + 13);
  });
  y += cardH + 6;

  // ── two column layout ──
  const leftX = margin;
  const rightX = margin + colW + 5;

  // LEFT: Deal Evaluation
  let ly = y;
  fill(C.card); rect(leftX, ly, colW, 52);
  text(C.cyan); font(7, 'bold');
  doc.text('DEAL EVALUATION', leftX + 4, ly + 6);
  ly += 9;
  fill(C.bg); rect(leftX + 3, ly, colW - 6, 13);
  text(C.gray); font(6);
  doc.text('CURRENT ASK', leftX + 6, ly + 4.5);
  doc.text(`${insights?.currentAsk?.amount ?? ''} @ ${insights?.currentAsk?.equity ?? ''}`, leftX + colW - 9, ly + 4.5, { align: 'right' });
  text(C.white); font(9, 'bold');
  doc.text(insights?.currentAsk?.valuation ?? '—', leftX + 6, ly + 11);
  ly += 17;
  text(C.white); font(7, 'bold');
  doc.text('Fair Deal (AI Target)', leftX + 4, ly);
  ly += 4; text(C.gray); font(6);
  const fairLines = doc.splitTextToSize(insights?.fairDeal?.description ?? '—', colW - 8);
  doc.text(fairLines.slice(0, 2), leftX + 4, ly);
  ly += fairLines.slice(0, 2).length * 3.5 + 2;
  text(C.white); font(7, 'bold');
  doc.text('Best Potential Deal', leftX + 4, ly);
  ly += 4; text(C.gray); font(6);
  const bestLines = doc.splitTextToSize(insights?.bestPotentialDeal?.description ?? '—', colW - 8);
  doc.text(bestLines.slice(0, 2), leftX + 4, ly);

  // RIGHT: Confidence Markers
  let ry = y;
  fill(C.card); rect(rightX, ry, colW, 52);
  text(C.cyan); font(7, 'bold');
  doc.text('CONFIDENCE MARKERS', rightX + 4, ry + 6);
  ry += 10;
  (insights?.confidenceMarkers ?? []).forEach((m) => {
    text(C.white); font(6.5);
    doc.text(m.name, rightX + 4, ry);
    text(C.cyan); font(6.5, 'bold');
    doc.text(`${m.score}%`, rightX + colW - 8, ry, { align: 'right' });
    ry += 4;
    fill(C.border); rect(rightX + 4, ry, colW - 8, 2, 1);
    fill(C.cyan); rect(rightX + 4, ry, (colW - 8) * m.score / 100, 2, 1);
    ry += 5;
  });

  y = Math.max(ly, ry) + 7;

  // ── Shark Verdicts ──
  fill(C.card); rect(margin, y, W - margin * 2, 6 + (insights?.sharkVerdicts?.length ?? 0) * 16);
  text(C.cyan); font(7, 'bold');
  doc.text('SHARK VERDICTS', margin + 4, y + 6);
  let sy = y + 12;
  (insights?.sharkVerdicts ?? []).forEach((shark, i) => {
    const col = statusColor(shark.status);
    text(C.white); font(7, 'bold');
    doc.text(shark.name, margin + 4, sy);
    fill(col);
    const badgeW = doc.getTextWidth(shark.status) + 6;
    rect(margin + 42, sy - 4, badgeW, 5.5, 1);
    text(C.bg); font(5.5, 'bold');
    doc.text(shark.status, margin + 42 + badgeW / 2, sy - 0.2, { align: 'center' });
    text(C.gray); font(6);
    const q = doc.splitTextToSize(`"${shark.quote}"`, W - margin * 2 - 10);
    doc.text(q[0], margin + 4, sy + 5);
    sy += 16;
  });
  y = sy + 4;

  // ── Key phrases + Next step ──
  const halfW = (W - margin * 2 - 4) / 2;
  fill(C.card); rect(margin, y, halfW, 28);
  text(C.cyan); font(7, 'bold');
  doc.text('KEY PHRASES', margin + 4, y + 6);
  let ky = y + 12;
  let kx = margin + 4;
  (insights?.keyPhrases ?? []).forEach((phrase) => {
    const pw = doc.getTextWidth(phrase) + 6;
    if (kx + pw > margin + halfW - 4) { kx = margin + 4; ky += 7; }
    fill(C.border); rect(kx, ky - 4, pw, 5.5, 1);
    text(C.gray); font(5.5);
    doc.text(phrase, kx + 3, ky);
    kx += pw + 3;
  });

  fill(C.card); rect(margin + halfW + 4, y, halfW, 28);
  text(C.cyan); font(7, 'bold');
  doc.text('NEXT BEST STEP', margin + halfW + 8, y + 6);
  text(C.gray); font(6);
  const stepLines = doc.splitTextToSize(insights?.nextBestStep ?? '—', halfW - 8);
  doc.text(stepLines.slice(0, 3), margin + halfW + 8, y + 13);

  y += 34;

  // ── Overall Summary ──
  if (insights?.overallSummary) {
    fill(C.card); rect(margin, y, W - margin * 2, 24);
    text(C.cyan); font(7, 'bold');
    doc.text('OVERALL SUMMARY', margin + 4, y + 6);
    text(C.gray); font(6.5);
    const sumLines = doc.splitTextToSize(insights.overallSummary, W - margin * 2 - 8);
    doc.text(sumLines.slice(0, 3), margin + 4, y + 13);
    y += 30;
  }

  // ── Transcript snippet ──
  if (transcript?.text) {
    fill(C.card); rect(margin, y, W - margin * 2, 22);
    text(C.cyan); font(7, 'bold');
    doc.text('TRANSCRIPT EXCERPT', margin + 4, y + 6);
    text(C.gray); font(6);
    const snippet = transcript.text.slice(0, 300) + '...';
    const tLines = doc.splitTextToSize(snippet, W - margin * 2 - 8);
    doc.text(tLines.slice(0, 3), margin + 4, y + 12);
  }

  // ── footer ──
  text(C.border); font(6);
  doc.text(`Generated by PitchAnalyzer AI · ${dateStr}`, W / 2, 290, { align: 'center' });

  doc.save(`${insights?.companyName ?? 'pitch'}-analysis.pdf`);
}
