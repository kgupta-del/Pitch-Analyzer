import { getAnalytics, isSupported, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { app, measurementId } from './firebase';

// Analytics is optional: it needs a measurementId and a supported browser
// environment (no SSR, no unsupported/embedded webviews, cookies enabled).
// Until it resolves, calls are queued so no early event is lost.
let analytics = null;
const queue = [];

const ready = (async () => {
  if (!measurementId || !(await isSupported().catch(() => false))) return;
  try {
    analytics = getAnalytics(app);
    queue.splice(0).forEach((fn) => fn(analytics));
  } catch (e) {
    console.warn('[analytics] init failed', e);
  }
})();

function run(fn) {
  if (analytics) fn(analytics);
  else queue.push(fn);
  return ready;
}

/** Strip undefined/null and truncate strings — GA4 rejects oversized params. */
function clean(params) {
  const out = {};
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === 'string' ? v.slice(0, 100) : v;
  }
  return out;
}

export function trackEvent(name, params) {
  return run((a) => logEvent(a, name, clean(params)));
}

export function trackPageView(path, title) {
  return run((a) =>
    logEvent(a, 'page_view', {
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    })
  );
}

/** Call with the signed-in user, or null on sign-out. */
export function identifyUser(user) {
  return run((a) => {
    setUserId(a, user?.uid ?? null);
    if (user) {
      setUserProperties(a, {
        signup_method: user.providerData?.[0]?.providerId ?? 'unknown',
      });
    }
  });
}
