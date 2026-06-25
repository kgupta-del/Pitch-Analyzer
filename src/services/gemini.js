import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ANALYSIS_PROMPT = `You are an expert Shark Tank pitch analyst with deep knowledge of startup valuations, investment strategies, and the personalities of each Shark.

Analyze the following pitch transcript and return ONLY a valid JSON object with no markdown, no code fences, just raw JSON.

Required JSON structure:
{
  "pitchScore": <number 0-10 with one decimal>,
  "investability": <"High" | "Medium" | "Low">,
  "companyName": <string>,
  "productDescription": <one sentence string>,
  "aiConfidence": <number 0-100>,
  "overallSummary": <2-3 sentence string>,
  "currentAsk": {
    "amount": <string e.g. "$500k">,
    "equity": <string e.g. "5%">,
    "valuation": <string e.g. "$10M Valuation">
  },
  "fairDeal": {
    "title": "Fair Deal (AI Target)",
    "description": <string recommending equity % and reasoning>
  },
  "bestPotentialDeal": {
    "title": "Best Potential Deal",
    "description": <string describing aggressive but realistic terms>
  },
  "confidenceMarkers": [
    { "name": <string>, "score": <number 0-100> },
    { "name": <string>, "score": <number 0-100> },
    { "name": <string>, "score": <number 0-100> }
  ],
  "concernMarkers": [
    { "level": <"high" | "medium" | "low">, "description": <string> },
    { "level": <"high" | "medium" | "low">, "description": <string> }
  ],
  "sharkVerdicts": [
    {
      "name": "Mark Cuban",
      "status": <"OFFER MADE" | "OUT" | "NEGOTIATING" | "INTERESTED">,
      "quote": <in-character short quote string>,
      "avatar": "MC"
    },
    {
      "name": "Lori Greiner",
      "status": <"OFFER MADE" | "OUT" | "NEGOTIATING" | "INTERESTED">,
      "quote": <in-character short quote string>,
      "avatar": "LG"
    },
    {
      "name": "Kevin O'Leary",
      "status": <"OFFER MADE" | "OUT" | "NEGOTIATING" | "INTERESTED">,
      "quote": <in-character short quote string>,
      "avatar": "KO"
    },
    {
      "name": "Daymond John",
      "status": <"OFFER MADE" | "OUT" | "NEGOTIATING" | "INTERESTED">,
      "quote": <in-character short quote string>,
      "avatar": "DJ"
    },
    {
      "name": "Robert Herjavec",
      "status": <"OFFER MADE" | "OUT" | "NEGOTIATING" | "INTERESTED">,
      "quote": <in-character short quote string>,
      "avatar": "RH"
    }
  ],
  "keyPhrases": [<string>, <string>, <string>, <string>],
  "nextBestStep": <string - one actionable recommendation>,
  "sentimentOverTime": [<8 numbers 0-100 representing sentiment arc across the pitch>]
}

Transcript:
`;

export async function analyzePitch(transcriptText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(ANALYSIS_PROMPT + transcriptText);
  const text = result.response.text().trim();

  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini returned invalid JSON');

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

const PDF_PLAN_PROMPT = `You are a top-tier startup advisor and venture capitalist who has reviewed thousands of business plans and pitch decks. Analyze the provided business plan or startup document and return ONLY a valid JSON object with no markdown, no code fences, just raw JSON.

Required JSON structure:
{
  "companyName": <string — extracted company or startup name>,
  "planTitle": <string — document title or inferred name>,
  "pitchScore": <number 0-10 with one decimal — overall plan quality>,
  "investability": <"High" | "Medium" | "Low">,
  "executiveSummary": <2-3 sentence overall assessment>,
  "strengths": [
    { "area": <string>, "detail": <string — specific strength observed in the plan> },
    { "area": <string>, "detail": <string> },
    { "area": <string>, "detail": <string> }
  ],
  "improvements": [
    { "priority": <"high" | "medium" | "low">, "area": <string>, "suggestion": <string — specific actionable improvement>, "impact": <string — why this matters to investors> },
    { "priority": <"high" | "medium" | "low">, "area": <string>, "suggestion": <string>, "impact": <string> },
    { "priority": <"high" | "medium" | "low">, "area": <string>, "suggestion": <string>, "impact": <string> },
    { "priority": <"high" | "medium" | "low">, "area": <string>, "suggestion": <string>, "impact": <string> }
  ],
  "missingElements": [<string — key section or data point missing from the plan>, <string>, <string>],
  "sectionScores": {
    "problem": <number 0-10>,
    "solution": <number 0-10>,
    "market": <number 0-10>,
    "businessModel": <number 0-10>,
    "team": <number 0-10>,
    "financials": <number 0-10>,
    "traction": <number 0-10>
  },
  "investorReadinessScore": <number 0-100>,
  "nextSteps": [<string — specific action>, <string>, <string>]
}`;

export async function analyzePDFPlan(file) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const base64 = await fileToBase64(file);
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: base64 } },
    PDF_PLAN_PROMPT,
  ]);
  const text = result.response.text().trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini returned invalid JSON');
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

const PITCH_BUILDER_PROMPT = `You are an elite pitch coach who has helped startups raise over $500M. Based on the startup details provided, create a complete slide-by-slide pitch presentation plan. Return ONLY a valid JSON object with no markdown, no code fences, just raw JSON.

Required JSON structure:
{
  "pitchTitle": <string — punchy title for the pitch>,
  "totalDuration": <string e.g. "3-4 minutes">,
  "openingHook": <string — a compelling opening line the founder should say verbatim>,
  "closingStatement": <string — a strong closing line to leave on>,
  "slides": [
    {
      "number": <integer>,
      "title": <string — slide name>,
      "duration": <string e.g. "30 seconds">,
      "keyPoints": [<string>, <string>],
      "scriptGuide": <string — what to say on this slide, 2-3 sentences>,
      "deliveryTip": <string — one tip on body language, pacing, or emphasis>
    }
  ],
  "powerPhrases": [<string — memorable phrase to use>, <string>, <string>],
  "mistakesToAvoid": [<string>, <string>, <string>],
  "confidenceTips": [<string — mindset or prep tip>, <string>]
}

The slides array should cover: Hook/Problem, Solution, Market Size, Business Model, Traction, Team, The Ask. Generate exactly 7 slides.

Startup Details:
`;

export async function generatePitchPlan(formData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(
    PITCH_BUILDER_PROMPT + JSON.stringify(formData, null, 2)
  );
  const text = result.response.text().trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini returned invalid JSON');
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}
