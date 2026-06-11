const API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';

async function safeFetch(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.error ?? body.message ?? JSON.stringify(body);
    } catch {
      detail = await response.text().catch(() => detail);
    }
    throw new Error(`AssemblyAI error: ${detail}`);
  }
  return response.json();
}

async function uploadFile(file) {
  const data = await safeFetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      authorization: API_KEY,
      'content-type': 'application/octet-stream',
    },
    body: file,
  });
  return data.upload_url;
}

async function createTranscript(audioUrl) {
  return safeFetch(`${BASE_URL}/transcript`, {
    method: 'POST',
    headers: {
      authorization: API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speech_models: ["universal-2"],
      punctuate: true,
      format_text: true,
    }),
  });
}

async function pollTranscript(transcriptId, onProgress) {
  for (let i = 0; i < 120; i++) {
    const data = await safeFetch(`${BASE_URL}/transcript/${transcriptId}`, {
      headers: { authorization: API_KEY },
    });
    if (data.status === 'completed') return data;
    if (data.status === 'error') throw new Error(`Transcription failed: ${data.error}`);
    onProgress?.('transcribing');
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error('Transcription timed out after 6 minutes');
}

export async function transcribeMedia(file, onProgress) {
  onProgress?.('processing');
  const uploadUrl = await uploadFile(file);

  onProgress?.('processing');
  const { id } = await createTranscript(uploadUrl);

  onProgress?.('transcribing');
  const transcript = await pollTranscript(id, onProgress);

  return {
    text: transcript.text,
    words: transcript.words ?? [],
    speakers: transcript.utterances ?? [],
    audio_duration: transcript.audio_duration,
  };
}
