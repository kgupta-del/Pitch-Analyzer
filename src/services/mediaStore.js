// In-memory store mapping analysisId → object URL for the current tab session.
// Blob URLs are revoked when explicitly cleared or when the tab closes.
const store = new Map();

export function setMedia(id, file) {
  const existing = store.get(id);
  if (existing) URL.revokeObjectURL(existing.url);
  store.set(id, { url: URL.createObjectURL(file), type: file.type });
}

export function getMedia(id) {
  return store.get(id) ?? null;
}

export function revokeMedia(id) {
  const entry = store.get(id);
  if (entry) URL.revokeObjectURL(entry.url);
  store.delete(id);
}
