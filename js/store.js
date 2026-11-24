/* =====================================================================
   STORE  —  dates + saving/loading your data (localStorage).
   ---------------------------------------------------------------------
   Everything lives in ONE object (Store.state) saved under the key
   below. Export/Import in Settings just downloads/uploads this object
   as JSON, so a backup file is your complete history.
   ===================================================================== */

const STORAGE_KEY = 'laurelLedger.v1';

/* ---------- Date helpers (always local time, 'YYYY-MM-DD' keys) ---------- */
const D = {
  key(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  parse(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); },
  add(k, n) { const d = D.parse(k); d.setDate(d.getDate() + n); return D.key(d); },
  diff(a, b) { return Math.round((D.parse(a) - D.parse(b)) / 86400000); },   // days from b to a
  weekStart(k) { const d = D.parse(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.key(d); }, // Monday
  dow(k) { return D.parse(k).getDay(); },   // 0 = Sunday
  pretty(k, opts = { weekday: 'short', day: 'numeric', month: 'short' }) { return D.parse(k).toLocaleDateString(undefined, opts); }
};

/* ---------- The shape of your saved data ---------- */
function defaultState() {
  const today = D.key();
  return {
    version: 1,
    settings: {
      userName: 'Vidhya',
      siteName: '',            // blank = use the theme's name
      themeId: 'greek',
      dayNight: 'auto',        // 'auto' | 'day' | 'night'
      phase: 1,
      phaseStart: today,
      autoUnlock: true,
      unlockThreshold: 70,     // % average daily score over 7 days
      streakThreshold: 50,     // % of daily habits needed for a day to count
      wakeGoal: '06:30',       // drawn as a dashed line on the sleep chart
      viewFull: false,         // show the full routine regardless of phase
      showCards: true          // show the "Why it works" card on each tick
    },
    habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
    log: {},          // { 'YYYY-MM-DD': { done: {habitId: true}, score: 0-100, total: n } }
    sleep: {},        // { 'YYYY-MM-DD': { bed: '23:30', wake: '06:30' } }  (date = the morning you woke)
    wins: [],         // [{ date, text }]
    articles: [],     // [{ date, text, subject? }]  one-line "what did I learn" notes
    study: [],        // [{ date, kind: 'study'|'article'|'class'|'video', subject, topic, minutes }]
    homeLog: [],      // [{ date, who, note }]
    restTokens: {},   // { weekStartKey: dateProtected }
    badges: {},       // { badgeId: dateEarned }
    wisdomIdx: {},    // rotation position per wisdom key
    worn: [],         // accessories the mascot is wearing
    reviews: {},      // { weekStartKey: { improve, step, date, forWeek } }
    comebacks: {},    // { date: true } days you came back after a miss
    startDate: today,
    lastOpen: null,
    flags: { best: 0, welcomed: false, notices: {} }
  };
}

const Store = {
  state: null,

  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { saved = null; }
    this.state = this.merge(saved);
    return this.state;
  },

  /* Fill in any fields missing from older saves or imported files. */
  merge(saved) {
    const base = defaultState();
    if (!saved || typeof saved !== 'object') return base;
    const s = Object.assign(base, saved);
    s.settings = Object.assign(defaultState().settings, saved.settings || {});
    s.flags = Object.assign(defaultState().flags, saved.flags || {});
    if (!Array.isArray(s.habits) || !s.habits.length) s.habits = defaultState().habits;
    if (!Array.isArray(s.study)) s.study = [];
    // Older saves: give the study habit its study-log box.
    s.habits.forEach(h => { if (h.id === 'study' && !h.extra) h.extra = 'study'; });
    if (!THEMES[s.settings.themeId]) s.settings.themeId = 'greek';
    return s;
  },

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); return true; }
    catch (e) { console.warn('Could not save', e); return false; }
  },

  exportFile() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `laurel-ledger-backup-${D.key()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },

  /* Returns a merged state object, or throws with a friendly message. */
  parseImport(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error('That file isn’t valid JSON.'); }
    if (!data || !Array.isArray(data.habits) || typeof data.log !== 'object') {
      throw new Error('That doesn’t look like a Ledger backup (no habits or log found).');
    }
    return this.merge(data);
  },

  reset() { this.state = defaultState(); this.save(); }
};
