import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
