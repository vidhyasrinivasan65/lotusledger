/* =====================================================================
   APP  —  ties everything together: scoring, streaks, phases, badges,
   the "Why it works" cards, and rendering of every screen.
   ---------------------------------------------------------------------
   Map of this file:
     1. Helpers
     2. Theme + day/night
     3. Habits, scores, streaks, XP
     4. Mascot speech & moods
     5. Actions (tick, cards, logs, phases, badges)
     6. Screens: Today, Review, Insights, Wins, Mascot, Settings
     7. Sheets, toasts, confetti
     8. Events + start-up
   ===================================================================== */
(function () {
  'use strict';

  /* =========================== 1. HELPERS =========================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const toMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + m; };
  const fmtMin = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

  let S;                       // the saved state (Store.state)
  let today = D.key();
  let view = 'today';
  let hero = null, profile = null;
  let reviewWeek = null;       // week shown on the Review screen
  let winsTab = 'wins';
  let streakNow = 0;
  let cardState = null;        // which wisdom card is open
  let lastFocusId = null;
  const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  const save = () => Store.save();

  /* ===================== 2. THEME + DAY/NIGHT ====================== */
  const theme = () => THEMES[S.settings.themeId] || THEMES.greek;
  const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  const baseVars = () => ({ name: S.settings.userName || 'friend' });

  function line(kind, vars = {}) {
    const arr = theme().lines[kind] || THEMES.greek.lines[kind] || [''];
    return fill(pick(arr), Object.assign(baseVars(), vars));
  }
  /* Same text every render for a given seed (used on the Review screen). */
  function lineStable(kind, seed, vars = {}) {
    const arr = theme().lines[kind] || [''];
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return fill(arr[Math.abs(h) % arr.length], Object.assign(baseVars(), vars));
  }
  const siteName = () => (S.settings.siteName || '').trim() || theme().siteName;

  function daypart() {
    const mode = S.settings.dayNight;
    if (mode === 'day' || mode === 'night') return mode;
    const h = new Date().getHours();
    if (h >= 5 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 20) return 'dusk';
    return 'night';
  }
  const palette = () => (daypart() === 'night' ? theme().night : theme().day);
  const svgUrl = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  function applyTheme() {
    const t = theme(), dp = daypart(), pal = palette();
    const root = document.documentElement;
    Object.entries(pal).forEach(([k, v]) => root.style.setProperty('--' + k, v));
    root.style.setProperty('--sky', t.sky[dp]);
    root.style.setProperty('--font-display', t.fonts.display);
    root.style.setProperty('--border-img', svgUrl(t.decor.border(pal)));
    root.style.setProperty('--pattern-img', svgUrl(t.decor.pattern(pal)));
    root.style.colorScheme = dp === 'night' ? 'dark' : 'light';
    document.body.dataset.theme = t.id;
    document.body.dataset.daypart = dp;
    $('meta[name="theme-color"]').setAttribute('content', pal.bg);
    $('#siteName').textContent = siteName();
    document.title = siteName();
    $('#ornament').textContent = t.ornament;
    const icon = $('#daypartIcon');
    icon.textContent = { dawn: '🌄', day: '☀️', dusk: '🌇', night: '🌙' }[dp];
    icon.title = dp;
    updateMascots();
  }

  /* ================ 3. HABITS, SCORES, STREAKS, XP ================= */
  const isDaily = h => h.section !== 'weekly';
  const habit = id => S.habits.find(h => h.id === id);
  const visible = () => S.habits.filter(h => S.settings.viewFull || (h.phase || 1) <= S.settings.phase);
  const entry = (d = today) => S.log[d] || (S.log[d] = { done: {}, score: 0, total: 0 });
  const isDone = (id, d = today) => !!(S.log[d] && S.log[d].done[id]);
  const scoreOf = d => (S.log[d] && S.log[d].score) || 0;
  const qualifies = d => { const L = S.log[d]; return !!L && L.total > 0 && L.score >= S.settings.streakThreshold; };
  const isProtected = d => S.restTokens[D.weekStart(d)] === d;
  const tokensLeft = () => (S.restTokens[D.weekStart(today)] ? 0 : 1);

  /* Today's score is a snapshot of the habits visible right now, so past
     days keep the score they had under the phase you were in. */
  function recompute(d = today) {
    const daily = visible().filter(isDaily);
    const L = entry(d);
    const n = daily.filter(h => L.done[h.id]).length;
    L.total = daily.length;
    L.score = daily.length ? Math.round((n * 100) / daily.length) : 0;
    return L.score;
  }

  function weekCount(id, wk = D.weekStart(today)) {
    let n = 0;
    for (let i = 0; i < 7; i++) if (isDone(id, D.add(wk, i))) n++;
    return n;
  }

  function gateLocked(h) {
    if (!h.gate) return false;
    const flow = visible().filter(x => x.section === 'flow');
    const idx = flow.findIndex(x => x.id === h.id);
    return flow.slice(0, idx).some(x => !isDone(x.id));
  }

  /* STREAK with forgiveness: walk back day by day. A missed day can be
     covered by that week's single rest token, but the token is only
     spent if it actually bridges to an earlier good day. */
  function computeStreak() {
    let count = qualifies(today) ? 1 : 0;
    const pending = [];
    let d = D.add(today, -1);
    while (D.diff(d, S.startDate) >= 0) {
      if (qualifies(d)) {
        count++;
        pending.forEach(p => { S.restTokens[p.wk] = p.d; });
        pending.length = 0;
      } else {
        const wk = D.weekStart(d), used = S.restTokens[wk];
        if (used === d) { /* already protected */ }
        else if (!used && !pending.some(p => p.wk === wk)) pending.push({ wk, d });
        else break;
      }
      d = D.add(d, -1);
    }
    return count;
  }

  function refresh() {
    streakNow = computeStreak();
    S.flags.best = Math.max(S.flags.best || 0, streakNow);
  }

  /* Mascot stage = current phase, or higher if your streak is long. */
  function stage() {
    const s = streakNow;
    const fromStreak = s >= 60 ? 5 : s >= 30 ? 4 : s >= 14 ? 3 : s >= 7 ? 2 : 1;
    return Math.min(5, Math.max(S.settings.phase, fromStreak));
  }

  /* XP: 10 per daily tick, 15 per weekly tick, +50 perfect day,
     +30 comeback day (any tick on a day you came back), +25 per badge. */
  function levelInfo() {
    let xp = 0;
    const weeklyIds = new Set(S.habits.filter(h => h.section === 'weekly').map(h => h.id));
    for (const [d, L] of Object.entries(S.log)) {
      let any = 0;
      for (const id of Object.keys(L.done)) { if (!L.done[id]) continue; any++; xp += weeklyIds.has(id) ? 15 : 10; }
      if (L.total > 0 && L.score === 100) xp += 50;
      if (S.comebacks[d] && any) xp += 30;
    }
    xp += Object.keys(S.badges).length * 25;
    const per = 250;
    return { xp, level: Math.floor(xp / per) + 1, into: xp % per, per };
  }

  function phaseCheck() {
    const days = Math.max(0, D.diff(today, S.settings.phaseStart));
    const n = Math.min(7, days);
    let sum = 0;
    for (let i = 1; i <= n; i++) sum += scoreOf(D.add(today, -i));
    const avg = n ? Math.round(sum / n) : 0;
    return { days, avg, ready: days >= 7 && avg >= S.settings.unlockThreshold };
  }

  function focusReview() {
    const r = S.reviews[D.add(D.weekStart(today), -7)];
    return r && r.improve ? r : null;
  }

  /* ===================== 4. MASCOT SPEECH & MOODS ==================== */
  function say(text) {
    const b = $('#bubble');
    b.textContent = text;
    b.classList.remove('pop');
    void b.offsetWidth;          // restart the CSS animation
    b.classList.add('pop');
  }

  function updateMascots() {
    const t = theme(), st = stage();
    [hero, profile].forEach(m => m && m.setTheme(t).setStage(st).setWorn(S.worn));
    $('#mascotName').textContent = t.mascot.name;
    $('#mascotStage').textContent = t.mascot.stageNames[st - 1];
  }

  function greetingKind() {
    const h = new Date().getHours();
    return h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
  }

  /* ============================ 5. ACTIONS ============================ */
  function toggle(id) {
    const h = habit(id);
    if (!h) return;
    if (gateLocked(h)) {
      say(line('gateLocked'));
      const el = document.querySelector(`.habit-btn[data-id="${id}"]`);
      if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
      return;
    }
    const L = entry();
    const was = !!L.done[id];
    const gateH = visible().find(x => x.gate && x.section === 'flow');
    const gateWasLocked = gateH ? gateLocked(gateH) : false;
    const prevScore = L.score;
    const qualifiedBefore = qualifies(today);
    const levelBefore = levelInfo().level;

    if (was) delete L.done[id]; else L.done[id] = true;
    recompute();
    refresh();
    save();

    if (!was) {
      if (hero.getMood() !== 'idle') hero.setMood('idle');
      hero.cheer();
      let msg = line('checkoff', { habit: h.name });
      if (isDaily(h) && L.score === 100 && prevScore < 100) { celebrate(); msg = line('perfect'); }
      else if (gateH && gateWasLocked && !gateLocked(gateH) && h.id !== gateH.id) msg = line('gate');
      if (!qualifiedBefore && qualifies(today) && MILESTONES.includes(streakNow)) {
        msg = line('milestone', { n: streakNow });
        toast(`🔥 ${streakNow}-day streak!`);
      }
      if (S.comebacks[today] && Object.keys(L.done).length === 1) toast('✨ Comeback bonus: +30 XP. Welcome back!');
      say(msg);
      const levelAfter = levelInfo().level;
      if (levelAfter > levelBefore) toast(`⭐ Level ${levelAfter}! Your ${theme().mascot.name} is proud.`);
      if (S.settings.showCards) openWisdom(h, true);
    }
    checkBadges();
    updateMascots();
    render();
  }

  /* ---------- The "Why it works" card ---------- */
  function wisdomKey(h) { return WISDOM[h.wisdom] ? h.wisdom : 'other'; }

  function openWisdom(h, advance) {
    const key = wisdomKey(h);
    const W = WISDOM[key];
    const i = (S.wisdomIdx[key] || 0) % W.entries.length;
    if (advance) { S.wisdomIdx[key] = i + 1; save(); }
    cardState = { id: h.id, key, i };
    lastFocusId = h.id;
    renderCard();
  }

  function renderCard() {
    const h = habit(cardState.id);
    const W = WISDOM[cardState.key];
    const n = W.entries.length;
    const e = W.entries[cardState.i % n];
    const ev = String(e.evidence || 'early');
    const nutrients = W.nutrients ? `
      <section class="card-sec">
        <h3><span aria-hidden="true">🥗</span> Nutrients involved</h3>
        <ul class="nutrients">${W.nutrients.map(x => `<li><strong>${esc(x.name)}</strong><span>${esc(x.why)}</span></li>`).join('')}</ul>
      </section>` : '';
    openSheet(`
      <div class="sheet-head">
        <span class="sheet-emoji" aria-hidden="true">${esc(h.emoji)}</span>
        <div><p class="eyebrow">Why it works</p><h2 id="sheetTitle">${esc(h.name)}</h2></div>
        <button class="icon-btn" data-act="sheet-close" aria-label="Close">✕</button>
      </div>
      <section class="card-sec">
        <h3><span aria-hidden="true">💪</span> Benefits</h3>
        <p>${esc(e.benefit)}</p>
      </section>
      ${nutrients}
      <section class="card-sec">
        <h3><span aria-hidden="true">🔬</span> Fun fact</h3>
        <p>${esc(e.fact)} <span class="evidence ev-${esc(ev.replace(/[^a-z]/g, ''))}">(evidence: ${esc(ev)})</span></p>
      </section>
      <section class="card-sec mascot-says">
        <p><strong>${esc(theme().mascot.name)}:</strong> “${esc(line('card', { habit: h.name }))}”</p>
      </section>
      <div class="sheet-actions">
        <button class="btn ghost" data-act="card-next">Another fact ↻</button>
        <button class="btn" data-act="sheet-close">Lovely, thanks</button>
      </div>
      <p class="tiny muted">Card ${(cardState.i % n) + 1} of ${n} · General wellness info, not medical advice.</p>`);
  }

  /* ---------- Study log: what you studied or read, and for how long ---------- */
  const STUDY_KINDS = {
    study:   { icon: '📚', label: 'Study session',    habit: 'study' },
    article: { icon: '📰', label: 'Article',          habit: 'article' },
    class:   { icon: '🎓', label: 'Class or lecture', habit: 'class' },
    video:   { icon: '🎧', label: 'Video or podcast' }
  };
  const SUBJECT_SLOTS = 7;     // subject colours --s1 … --s7 (style.css); any more share "Other" grey
  let studyRange = 14;         // days shown on Insights → Learning

  const fmtDur = m => {
    m = Math.round(m || 0);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h}h ${r}m` : `${h}h`;
  };

  /* Subjects in the order you first logged them. A subject keeps its colour for good,
     whatever date range or ranking is on screen. Matching ignores upper/lower case. */
  function subjectOrder() {
    const seen = new Map();
    S.study.map((e, i) => ({ e, i }))
      .sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i))
      .forEach(({ e }) => {
        const name = String(e.subject || '').trim();
        if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
      });
    return [...seen.values()];
  }
  function canonSubject(name) {
    const n = name.trim().replace(/\s+/g, ' ');
    return subjectOrder().find(s => s.toLowerCase() === n.toLowerCase()) || n;
  }
  const subjectSlot = (order, name) => {
    const i = order.findIndex(s => s.toLowerCase() === String(name).toLowerCase());
    return i >= 0 && i < SUBJECT_SLOTS ? i + 1 : 0;           // 0 = "Other"
  };
  const slotColor = s => (s ? `var(--s${s})` : 'var(--s-other)');
  const subjectDatalist = () => `<datalist id="subjectList">${subjectOrder().map(s => `<option value="${esc(s)}"></option>`).join('')}</datalist>`;
  const studyLine = e => `<p class="saved">${(STUDY_KINDS[e.kind] || STUDY_KINDS.study).icon} <strong>${esc(e.subject)}</strong>${e.topic ? ` · ${esc(e.topic)}` : ''}${e.minutes ? ` · ${fmtDur(e.minutes)}` : ''}</p>`;

  /* ---------- Little logs (article, home, wins) ---------- */
  function handleForm(form) {
    const kind = form.dataset.form;
    const data = Object.fromEntries(new FormData(form).entries());
    const text = (data.text || '').trim();

    if (kind === 'article' || kind === 'home' || kind === 'win') {
      if (!text) return;
      if (kind === 'article') S.articles.push({ date: today, text });
      if (kind === 'home') S.homeLog.push({ date: today, who: text, note: (data.note || '').trim() });
      if (kind === 'win') S.wins.push({ date: today, text });
      save();
      // Logging counts as doing the habit, if it isn't ticked yet.
      const autoId = form.dataset.habit;
      if (autoId && habit(autoId) && !isDone(autoId)) { toggle(autoId); }
      else {
        say(kind === 'win' ? 'Saved to your Wins. Future-you will love reading this.' : kind === 'home' ? 'Logged! Somewhere, someone is smiling at their phone.' : 'Ooh, a new thing learned. Saved!');
        hero.cheer(); checkBadges(); render();
      }
      toast(kind === 'win' ? '🌟 Win saved' : kind === 'home' ? '💌 Reach-out logged' : '💡 Learning saved');
      return;
    }

    if (kind === 'study') {
      const k = STUDY_KINDS[data.kind || form.dataset.kind] ? (data.kind || form.dataset.kind) : 'study';
      const topic = (data.topic || '').trim();
      let subject = (data.subject || '').trim();
      if (!subject && !topic && !text) { toast('✏️ Add a subject or topic first'); return; }
      subject = canonSubject(subject || (k === 'article' ? 'General reading' : 'General'));
      const minutes = Math.max(0, Math.min(720, Math.round(Number(data.minutes) || 0)));
      const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date || '') && D.diff(data.date, today) <= 0 ? data.date : today;
      S.study.push({ date, kind: k, subject, topic, minutes });
      if (text) S.articles.push({ date, text, subject });          // "what did I learn" also goes to Wins → Learned
      save();
      // Logging today's session ticks the matching habit (if it's on your list right now).
      const autoId = STUDY_KINDS[k].habit, h = autoId && habit(autoId);
      if (date === today && h && visible().includes(h) && !isDone(autoId)) toggle(autoId);
      else {
        say(minutes >= 90 ? `${fmtDur(minutes)} of ${subject}? Your brain is doing push-ups.` : `Logged: ${subject}. Every session adds up.`);
        hero.cheer(); checkBadges(); render();
      }
      toast(`${STUDY_KINDS[k].icon} Logged ${minutes ? fmtDur(minutes) + ' of ' : ''}${subject}${date !== today ? ` for ${D.pretty(date)}` : ''}`);
      return;
    }

    if (kind === 'sleep') {
      if (!data.date || !data.bed || !data.wake) return;
      S.sleep[data.date] = { bed: data.bed, wake: data.wake };
      save();
      const goal = toMin(S.settings.wakeGoal);
      const early = toMin(data.wake) <= goal + 15;
      say(early ? 'Up with the dawn! Your future self thanks you.' : 'Logged. No judgement, just data. Tomorrow is another sunrise.');
      toast('🌙 Sleep logged');
      checkBadges(); render();
      return;
    }

    if (kind === 'review') {
      const wk = form.dataset.week;
      S.reviews[wk] = { improve: data.improve, step: (data.step || '').trim(), date: today, forWeek: D.add(wk, 7) };
      save();
      say(lineStable('reflectOk', wk));
      toast('🪞 Review saved. That habit will be your focus next week.');
      checkBadges(); render();
      return;
    }

    if (kind === 'add-habit') {
      const name = text || 'New habit';
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20) + '_' + Math.random().toString(36).slice(2, 6);
      const h = { id, name, emoji: (data.emoji || '✨').trim() || '✨', section: data.section || 'daily', time: data.time || 'evening', phase: Number(data.phase) || S.settings.phase, wisdom: data.wisdom || 'other' };
      if (h.section === 'weekly') h.target = 2;
      S.habits.push(h);
      recompute(); refresh(); save();
      toast(`${h.emoji} “${h.name}” added`);
      render();
    }
  }

  /* ---------- Phases ---------- */
  function unlockPhase(manual) {
    const p = S.settings.phase;
    if (p >= MAX_PHASE) return;
    if (manual) {
      const pc = phaseCheck();
      if (pc.days < 7 && !confirm(`You’re ${plural(pc.days + 1, 'day')} into this phase. The gentle plan is week by week, but you’re the boss. Unlock Phase ${p + 1} now?`)) return;
    }
    S.settings.phase = p + 1;
    S.settings.phaseStart = today;
    recompute(); refresh(); save();
    const fresh = S.habits.filter(h => h.phase === p + 1);
    celebrate();
    say(line('phaseUp', { phase: p + 1 }));
    const info = PHASE_INFO[p + 1] || { title: `Phase ${p + 1}`, blurb: '' };
    openSheet(`
      <div class="sheet-head"><span class="sheet-emoji" aria-hidden="true">🗝️</span>
        <div><p class="eyebrow">New phase unlocked</p><h2 id="sheetTitle">${esc(info.title)}</h2></div>
        <button class="icon-btn" data-act="sheet-close" aria-label="Close">✕</button></div>
      <p>${esc(info.blurb)}</p>
      ${fresh.length ? `<ul class="plain-list">${fresh.map(h => `<li><span aria-hidden="true">${esc(h.emoji)}</span> ${esc(h.name)}</li>`).join('')}</ul>` : ''}
      <p class="muted small">Your ${esc(theme().mascot.name)} evolved too. Take the new habits one at a time; nobody is grading you.</p>
      <div class="sheet-actions"><button class="btn" data-act="sheet-close">Let’s go</button></div>`);
    checkBadges(); updateMascots(); render();
  }

  /* ---------- Badges ---------- */
  function stats() {
    let totalChecks = 0, perfectDays = 0;
    const count = id => Object.values(S.log).filter(L => L.done[id]).length;
    for (const L of Object.values(S.log)) {
      totalChecks += Object.values(L.done).filter(Boolean).length;
      if (L.total > 0 && L.score === 100) perfectDays++;
    }
    const target = id => (habit(id) || {}).target || 2;
    return {
      totalChecks, perfectDays, streak: streakNow, best: S.flags.best || 0, phase: S.settings.phase,
      wake: count('wake'), read: count('readbed'), gym: count('gym'),
      articles: S.articles.length, home: S.homeLog.length, wins: S.wins.length,
      subjects: subjectOrder().length, studyMinutes: S.study.reduce((a, e) => a + (e.minutes || 0), 0),
      sleepLogs: Object.keys(S.sleep).length, comebacks: Object.keys(S.comebacks).length,
      reviews: Object.keys(S.reviews).length,
      paintWeek: weekCount('paint') >= target('paint'), cleanWeek: weekCount('clean') >= target('clean')
    };
  }

  function checkBadges() {
    const st = stats();
    const fresh = BADGES.filter(b => !S.badges[b.id] && b.test(st));
    if (!fresh.length) return;
    fresh.forEach(b => {
      S.badges[b.id] = today;
      if (b.accessory && !S.worn.includes(b.accessory)) S.worn.push(b.accessory);
    });
    save();
    updateMascots();
    fresh.forEach((b, i) => setTimeout(() => {
      toast(`${b.icon} Badge unlocked: ${b.name}`);
      say(line('badge', { badge: b.name }));
      if (b.accessory) toast(`🎁 New accessory: ${theme().accessoryNames[b.accessory]}`);
    }, 900 + i * 1600));
  }

  /* ============================ 6. SCREENS ============================ */
  function render() {
    $('#hero').hidden = view === 'mascot';
    $$('.bottomnav button').forEach(b => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
    if (profile && view !== 'mascot') { profile.destroy(); profile = null; }
    const screens = { today: renderToday, review: renderReview, insights: renderInsights, wins: renderWins, mascot: renderMascot, settings: renderSettings };
    $('#view').innerHTML = (screens[view] || renderToday)();
    if (view === 'mascot') mountMascotScreen();
  }

  /* ---------------------------- TODAY ---------------------------- */
  function renderToday() {
    const vis = visible();
    const L = entry();
    const daily = vis.filter(isDaily);
    const done = daily.filter(h => L.done[h.id]).length;
    const score = L.score;
    const lv = levelInfo();
    const p = S.settings.phase;
    const pc = phaseCheck();
    const focus = focusReview();
    const info = PHASE_INFO[p] || { title: `Phase ${p}`, blurb: '' };

    const banners = [];
    if (S.comebacks[today]) banners.push(`<div class="banner warm"><span aria-hidden="true">🌱</span><p><strong>Comeback day!</strong> Your first tick today earns a +30 XP bonus. No catching up needed; just start where you are.</p></div>`);
    if (D.dow(today) === 0 && !S.reviews[D.weekStart(today)]) banners.push(`<div class="banner"><span aria-hidden="true">🪞</span><p><strong>It’s Sunday, review day.</strong> Five calm minutes to see what went well.</p><button class="btn small" data-act="nav" data-view="review">Open review</button></div>`);
    if (focus && habit(focus.improve)) banners.push(`<div class="banner"><span aria-hidden="true">⭐</span><p><strong>This week’s focus:</strong> ${esc(habit(focus.improve).name)}${focus.step ? ` · <em>${esc(focus.step)}</em>` : ''}</p></div>`);
    if (pc.ready && p < MAX_PHASE && !S.settings.autoUnlock) banners.push(`<div class="banner"><span aria-hidden="true">🗝️</span><p><strong>You’re ready for Phase ${p + 1}!</strong> Your 7-day average is ${pc.avg}%.</p><button class="btn small" data-act="unlock-phase">Unlock</button></div>`);

    const now = greetingKind();
    const timeGroups = [
      { key: 'morning', title: '☀️ Morning', icon: '' },
      { key: 'afternoon', title: '🌤️ Afternoon' },
      { key: 'evening', title: '🌆 Evening' },
      { key: 'night', title: '🌙 Night' }
    ];
    const flow = vis.filter(h => h.section === 'flow');
    const weekly = vis.filter(h => h.section === 'weekly');
    const other = vis.filter(h => h.section === 'other');

    const group = (title, items, opts = {}) => items.length ? `
      <section class="card group ${opts.now ? 'is-now' : ''}" aria-label="${esc(title.replace(/^\S+\s/, ''))}">
        <div class="group-head"><h2>${title}</h2>${opts.now ? '<span class="chip">now</span>' : ''}${opts.meta ? `<span class="muted small">${opts.meta}</span>` : ''}</div>
        <${opts.ordered ? 'ol' : 'ul'} class="habits">${items.map((h, i) => opts.weekly ? weeklyRow(h) : habitRow(h, i, opts.ordered, focus)).join('')}</${opts.ordered ? 'ol' : 'ul'}>
      </section>` : '';

    const flowDone = flow.filter(h => isDone(h.id)).length;

    // "Coming up next": a read-only peek at locked habits, so it's clear more is on the way.
    let preview = '';
    if (!S.settings.viewFull && p < MAX_PHASE) {
      const byPhase = {};
      S.habits.filter(h => (h.phase || 1) > p).forEach(h => (byPhase[h.phase] = byPhase[h.phase] || []).push(h));
      const phases = Object.keys(byPhase).map(Number).sort((a, b) => a - b);
      if (phases.length) {
        const pills = list => `<ul class="peek-list">${list.map(h => `<li><span aria-hidden="true">${esc(h.emoji || '•')}</span>${esc(h.name)}</li>`).join('')}</ul>`;
        const [next, ...later] = phases;
        const laterCount = later.reduce((n, k) => n + byPhase[k].length, 0);
        preview = `
          <section class="card peek-card" aria-label="Coming up next">
            <div class="group-head"><h2>🔭 Coming up in Phase ${next}</h2><span class="muted small">🔒 ${byPhase[next].length}</span></div>
            <p class="small muted"><strong>${esc(((PHASE_INFO[next] || {}).title || '').split('·').pop().trim())}.</strong> These join your list when the phase unlocks. No need to do them yet!</p>
            ${pills(byPhase[next])}
            ${later.length ? `
              <details class="peek-later">
                <summary>And ${laterCount} more in Phase${later.length > 1 ? 's' : ''} ${later.length > 1 ? `${later[0]}–${later[later.length - 1]}` : later[0]}</summary>
                ${later.map(k => `<p class="eyebrow">${esc((PHASE_INFO[k] || {}).title || `Phase ${k}`)}</p>${pills(byPhase[k])}`).join('')}
              </details>` : ''}
          </section>`;
      }
    }

    return `
      <section class="card stats-card">
        <div class="score-ring" style="--p:${score}" role="img" aria-label="Daily score ${score} out of 100">
          <span><strong>${score}</strong><small>daily score</small></span>
        </div>
        <ul class="stat-list">
          <li><span aria-hidden="true">🔥</span><span><strong>${streakNow}</strong> day streak <small class="muted">(best ${S.flags.best || 0})</small></span></li>
          <li><span aria-hidden="true">🛡️</span><span>${tokensLeft() ? '<strong>1</strong> rest token this week' : 'Rest token used this week'}</span></li>
          <li><span aria-hidden="true">⭐</span><span>Level <strong>${lv.level}</strong> · ${lv.xp} XP</span></li>
        </ul>
        <div class="progress" role="progressbar" aria-label="Daily habits done" aria-valuemin="0" aria-valuemax="${daily.length}" aria-valuenow="${done}">
          <div style="width:${score}%"></div>
        </div>
        <p class="muted small">${done} of ${daily.length} daily habits · a day counts toward your streak at ${S.settings.streakThreshold}%</p>
      </section>

      ${banners.join('')}

      <section class="card phase-card">
        <div class="phase-row">
          <div>
            <p class="eyebrow">${S.settings.viewFull ? 'Full routine view' : esc(info.title)}</p>
            <p class="small">${S.settings.viewFull ? 'Showing every habit. Your phase progress is still saved underneath.' : esc(info.blurb)}</p>
          </div>
          <label class="switch"><input type="checkbox" data-act="toggle-full" ${S.settings.viewFull ? 'checked' : ''}><span class="switch-ui" aria-hidden="true"></span><span class="small">Full routine</span></label>
        </div>
        ${p < MAX_PHASE ? `
          <div class="phase-progress">
            <div class="mini-bar" aria-hidden="true"><div style="width:${Math.min(100, Math.round(pc.avg / Math.max(1, S.settings.unlockThreshold) * 100))}%"></div></div>
            <p class="small muted">Day ${pc.days + 1} of Phase ${p} · 7-day average <strong>${pc.avg}%</strong> · ${S.settings.autoUnlock ? `unlocks itself after a week at ${S.settings.unlockThreshold}%` : 'unlock whenever you feel ready'}</p>
            <button class="btn small ${pc.ready ? '' : 'ghost'}" data-act="unlock-phase">Unlock Phase ${p + 1}</button>
          </div>` : `<p class="small muted">Every phase unlocked. Legendary.</p>`}
      </section>

      ${group('🌅 Morning flow', flow, { ordered: true, meta: `${flowDone}/${flow.length}`, now: now === 'morning' })}
      ${timeGroups.map(g => group(g.title, vis.filter(h => h.section === 'daily' && (h.time || 'evening') === g.key), { now: now === g.key && g.key !== 'morning' })).join('')}
      ${group('✨ Other good habits', other)}
      ${group('📅 This week', weekly, { weekly: true, meta: `week of ${D.pretty(D.weekStart(today), { day: 'numeric', month: 'short' })}` })}
      ${preview}
      ${subjectDatalist()}
      ${!vis.length ? `<section class="card"><p>No habits visible yet. Add some in <button class="linklike" data-act="nav" data-view="settings">Settings</button>.</p></section>` : ''}
    `;
  }

  function habitRow(h, idx, ordered, focus) {
    const done = isDone(h.id);
    const locked = gateLocked(h);
    const isFocus = focus && focus.improve === h.id;
    let sub = '';
    if (h.gate) sub = locked ? '<small>🔒 Finish the steps above to unlock</small>' : '<small>🔓 Unlocked. Enjoy it mindfully</small>';
    if (isFocus) sub += '<small>⭐ This week’s focus</small>';
    return `
      <li class="habit ${done ? 'done' : ''} ${locked ? 'locked' : ''} ${isFocus ? 'focus' : ''}">
        <button class="habit-btn" role="checkbox" aria-checked="${done}" ${locked ? 'aria-disabled="true"' : ''} data-act="toggle" data-id="${esc(h.id)}">
          ${ordered ? `<span class="step" aria-hidden="true">${idx + 1}</span>` : ''}
          <span class="emoji" aria-hidden="true">${esc(h.emoji)}</span>
          <span class="hname">${esc(h.name)}${sub}</span>
          <span class="tick" aria-hidden="true"></span>
        </button>
        <button class="why-btn" data-act="why" data-id="${esc(h.id)}" aria-label="Why ${esc(h.name)} works">?</button>
        ${h.extra ? extraHTML(h) : ''}
      </li>`;
  }

  function weeklyRow(h) {
    const n = weekCount(h.id), t = Math.max(1, h.target || 1);
    const pct = Math.min(100, Math.round((n / t) * 100));
    const doneToday = isDone(h.id);
    return `
      <li class="habit weekly ${n >= t ? 'met' : ''}">
        <div class="ring" style="--p:${pct}" role="img" aria-label="${n} of ${t} this week"><span>${n}/${t}</span></div>
        <div class="wk-body">
          <span class="hname"><span aria-hidden="true">${esc(h.emoji)}</span> ${esc(h.name)}</span>
          <small class="muted">${n >= t ? 'Target met this week ✨' : `${t - n} to go this week`}</small>
        </div>
        <button class="btn small ${doneToday ? '' : 'ghost'}" data-act="toggle" data-id="${esc(h.id)}" aria-pressed="${doneToday}" aria-label="${esc(h.name)} done today">${doneToday ? '✓ Today' : '+ Today'}</button>
        <button class="why-btn" data-act="why" data-id="${esc(h.id)}" aria-label="Why ${esc(h.name)} works">?</button>
        ${h.extra ? extraHTML(h) : ''}
      </li>`;
  }

  function extraHTML(h) {
    const id = esc(h.id);
    if (h.extra === 'study') {
      const items = S.study.filter(e => e.date === today);
      const total = items.reduce((a, e) => a + (e.minutes || 0), 0);
      const subj = new Set(items.map(e => e.subject.toLowerCase())).size;
      return `<div class="extra">
        <form class="study-form" data-form="study" data-kind="study">
          <div class="sf-row">
            <input name="subject" list="subjectList" maxlength="40" placeholder="Subject (e.g. Statistics)" aria-label="Subject" autocomplete="off" required>
            <input name="minutes" class="mins" type="number" inputmode="numeric" min="1" max="720" placeholder="Min" aria-label="Minutes">
          </div>
          <div class="sf-row">
            <input name="topic" maxlength="120" placeholder="What exactly? (chapter, topic, paper)" aria-label="Topic" autocomplete="off">
            <button class="btn small">Log</button>
          </div>
        </form>
        ${items.map(studyLine).join('')}
        ${items.length > 1 ? `<p class="small muted">Today so far: <strong>${fmtDur(total)}</strong> across ${plural(subj, 'subject')}</p>` : ''}
      </div>`;
    }
    if (h.extra === 'article') {
      const items = S.study.filter(e => e.date === today && e.kind === 'article');
      const notes = S.articles.filter(a => a.date === today);
      return `<div class="extra">
        <a class="btn small ghost" href="https://en.wikipedia.org/wiki/Special:Random" target="_blank" rel="noopener">🎲 Surprise me</a>
        <form class="study-form" data-form="study" data-kind="article">
          <div class="sf-row">
            <input name="topic" maxlength="120" placeholder="Article title or topic" aria-label="Article title or topic" autocomplete="off">
            <input name="minutes" class="mins" type="number" inputmode="numeric" min="1" max="720" placeholder="Min" aria-label="Minutes">
          </div>
          <div class="sf-row">
            <input name="subject" list="subjectList" maxlength="40" placeholder="Subject (optional, e.g. Biology)" aria-label="Subject" autocomplete="off">
          </div>
          <div class="sf-row">
            <input name="text" maxlength="240" placeholder="What did I learn? (one line)" aria-label="What did I learn?" autocomplete="off">
            <button class="btn small">Save</button>
          </div>
        </form>
        ${items.map(studyLine).join('')}
        ${notes.map(a => `<p class="saved">💡 ${esc(a.text)}</p>`).join('')}
      </div>`;
    }
    if (h.extra === 'home') {
      const wk = D.weekStart(today);
      const items = S.homeLog.filter(x => x.date >= wk);
      return `<div class="extra">
        <form class="inline-form" data-form="home" data-habit="${id}">
          <label class="sr" for="who-${id}">Who did I reach out to?</label>
          <input id="who-${id}" name="text" maxlength="80" placeholder="Who did I reach out to?" autocomplete="off">
          <button class="btn small">Log</button>
        </form>
        ${items.map(x => `<p class="saved">💌 ${esc(x.who)} <span class="muted">· ${D.pretty(x.date)}</span></p>`).join('')}
      </div>`;
    }
    if (h.extra === 'journal') {
      const items = S.wins.filter(x => x.date === today);
      return `<div class="extra">
        <form class="inline-form" data-form="win" data-habit="${id}">
          <label class="sr" for="win-${id}">Today’s one-line journal or gratitude</label>
          <input id="win-${id}" name="text" maxlength="240" placeholder="One line: a win or a gratitude" autocomplete="off">
          <button class="btn small">Save</button>
        </form>
        ${items.map(x => `<p class="saved">🌟 ${esc(x.text)}</p>`).join('')}
      </div>`;
    }
    return '';
  }

  /* ---------------------------- REVIEW ---------------------------- */
  function renderReview() {
    const thisWk = D.weekStart(today);
    const wk = reviewWeek || thisWk;
    const days = Array.from({ length: 7 }, (_, i) => D.add(wk, i));
    const past = days.filter(d => D.diff(d, today) <= 0);
    const showed = past.filter(qualifies).length;
    const tokenDay = past.find(isProtected);
    const scored = past.filter(d => S.log[d] && S.log[d].total > 0);
    const avg = scored.length ? Math.round(scored.reduce((a, d) => a + scoreOf(d), 0) / scored.length) : 0;
    const daily = visible().filter(isDaily);
    const counts = daily.map(h => ({ h, n: past.filter(d => isDone(h.id, d)).length })).sort((a, b) => b.n - a.n);
    const top = counts.filter(c => c.n > 0).slice(0, 3);
    const weekly = visible().filter(h => h.section === 'weekly').map(h => ({ h, n: weekCount(h.id, wk), t: h.target || 1 }));
    const met = weekly.filter(w => w.n >= w.t);
    const sleeps = past.map(d => S.sleep[d]).filter(Boolean);
    const avgWake = sleeps.length ? fmtMin(sleeps.reduce((a, s) => a + toMin(s.wake), 0) / sleeps.length) : '—';
    const wins = S.wins.filter(w => w.date >= wk && w.date <= days[6]);
    const band = avg >= 70 ? 'reflectGreat' : avg >= 40 ? 'reflectOk' : 'reflectGentle';
    const rev = S.reviews[wk];
    const isFuture = D.diff(wk, thisWk) > 0;
    const label = wk === thisWk ? 'This week' : `Week of ${D.pretty(wk, { day: 'numeric', month: 'short', year: 'numeric' })}`;

    const strip = days.map(d => {
      const fut = D.diff(d, today) > 0;
      const cls = fut ? 'future' : isProtected(d) ? 'prot' : qualifies(d) ? 'good' : (S.log[d] && Object.keys(S.log[d].done).length) ? 'some' : 'rest';
      return `<li class="day ${cls}"><span>${D.pretty(d, { weekday: 'narrow' })}</span><b>${fut ? '' : cls === 'prot' ? '🛡️' : cls === 'good' ? '✓' : cls === 'some' ? '·' : ''}</b></li>`;
    }).join('');

    return `
      <section class="card">
        <div class="week-nav">
          <button class="icon-btn" data-act="review-prev" aria-label="Previous week">‹</button>
          <h2>${esc(label)}</h2>
          <button class="icon-btn" data-act="review-next" aria-label="Next week" ${wk === thisWk ? 'disabled' : ''}>›</button>
        </div>
        ${D.dow(today) !== 0 && wk === thisWk ? '<p class="small muted">Your full review opens up on Sunday, but you can peek any time.</p>' : ''}
        <ul class="week-strip" aria-label="Days this week">${strip}</ul>
        <div class="kpis">
          <div><strong>${showed}/${past.length || 7}</strong><span>days showed up</span></div>
          <div><strong>${avg}%</strong><span>average score</span></div>
          <div><strong>${avgWake}</strong><span>average wake</span></div>
          <div><strong>${met.length}/${weekly.length}</strong><span>weekly targets</span></div>
        </div>
        ${tokenDay ? `<p class="small">🛡️ Your rest token covered ${D.pretty(tokenDay)}. Rest is part of the plan.</p>` : ''}
      </section>

      <section class="card mascot-reflect">
        <h2>${esc(theme().mascot.name)} reflects</h2>
        <p class="quote">“${esc(lineStable(band, wk))}”</p>
      </section>

      <section class="card">
        <h2>What went well</h2>
        ${top.length || met.length ? `<ul class="plain-list">
          ${top.map(c => `<li><span aria-hidden="true">${esc(c.h.emoji)}</span> <strong>${esc(c.h.name)}</strong> · ${plural(c.n, 'day')}</li>`).join('')}
          ${met.map(w => `<li><span aria-hidden="true">${esc(w.h.emoji)}</span> <strong>${esc(w.h.name)}</strong> target met (${w.n}/${w.t}) ✨</li>`).join('')}
        </ul>` : `<p class="muted">A gentle week. Showing up here to reflect still counts.</p>`}
        ${wins.length ? `<h3>Wins you wrote</h3><ul class="plain-list">${wins.map(w => `<li>🌟 ${esc(w.text)} <span class="muted small">· ${D.pretty(w.date)}</span></li>`).join('')}</ul>` : ''}
      </section>

      ${isFuture ? '' : `
      <section class="card">
        <h2>Pick one thing to improve</h2>
        ${rev ? `<p class="saved">⭐ Next week’s focus: <strong>${esc((habit(rev.improve) || { name: 'a habit' }).name)}</strong>${rev.step ? ` · ${esc(rev.step)}` : ''}</p><p class="small muted">You can change it below.</p>` : '<p class="small muted">Just one. Small and specific beats big and vague.</p>'}
        <form class="stack-form" data-form="review" data-week="${wk}">
          <label>Habit
            <select name="improve">${visible().map(h => `<option value="${esc(h.id)}" ${rev && rev.improve === h.id ? 'selected' : ''}>${esc(h.emoji)} ${esc(h.name)}</option>`).join('')}</select>
          </label>
          <label>One tiny step
            <input name="step" maxlength="120" placeholder="e.g. lay out yoga mat the night before" value="${esc(rev ? rev.step : '')}">
          </label>
          <button class="btn">Save my focus</button>
        </form>
      </section>`}`;
  }

  /* --------------------------- INSIGHTS --------------------------- */
  function renderInsights() {
    return `
      ${learningCard()}
      <section class="card">
        <h2>Consistency</h2>
        ${heatmap()}
      </section>
      <section class="card">
        <h2>Sleep log</h2>
        <p class="small muted">Gentle tracking for your key habit: waking early. Log the night that ended this morning.</p>
        ${sleepForm()}
        ${sleepChart()}
      </section>
      <section class="card">
        <h2>Habit rhythm · last 30 days</h2>
        ${habitBars()}
      </section>`;
  }

  /* ---------- Learning: how much you study, how it varies, and what ---------- */
  function learningCard() {
    const order = subjectOrder();
    const n = studyRange;
    const days = Array.from({ length: n }, (_, i) => D.add(today, i - n + 1));
    const byDate = {};
    S.study.forEach(e => (byDate[e.date] = byDate[e.date] || []).push(e));
    // Only judge days since you started (or since your earliest back-filled entry).
    const first = S.study.reduce((m, e) => (!m || e.date < m ? e.date : m), null);
    const effStart = first && first < S.startDate ? first : S.startDate;
    const tracked = days.filter(d => d >= effStart);
    const dayMins = d => (byDate[d] || []).reduce((a, e) => a + (e.minutes || 0), 0);
    const mins = tracked.map(dayMins);
    const total = mins.reduce((a, b) => a + b, 0);
    const studyDays = tracked.filter(d => byDate[d]).length;
    const withMins = mins.filter(m => m > 0);
    const avgStudyDay = withMins.length ? total / withMins.length : 0;

    // per-subject totals in range
    const subs = {};
    tracked.forEach(d => (byDate[d] || []).forEach(e => {
      const key = e.subject.toLowerCase();
      const s = subs[key] || (subs[key] = { name: canonSubject(e.subject), slot: subjectSlot(order, e.subject), minutes: 0, count: 0 });
      s.minutes += e.minutes || 0; s.count++;
    }));
    const subList = Object.values(subs).sort((a, b) => b.minutes - a.minutes || b.count - a.count);

    const rangeTabs = `<div class="tabs" role="tablist" aria-label="Time range">${[7, 14, 30].map(r =>
      `<button role="tab" aria-selected="${studyRange === r}" data-act="study-range" data-range="${r}">${r} days</button>`).join('')}</div>`;

    const form = `
      <form class="study-form" data-form="study">
        <div class="sf-row">
          <select name="kind" aria-label="Type">${Object.entries(STUDY_KINDS).map(([k, v]) => `<option value="${k}">${v.icon} ${esc(v.label)}</option>`).join('')}</select>
          <input type="date" name="date" value="${today}" max="${today}" aria-label="Date">
        </div>
        <div class="sf-row">
          <input name="subject" list="subjectList" maxlength="40" placeholder="Subject" aria-label="Subject" autocomplete="off" required>
          <input name="minutes" class="mins" type="number" inputmode="numeric" min="1" max="720" placeholder="Min" aria-label="Minutes">
        </div>
        <div class="sf-row">
          <input name="topic" maxlength="120" placeholder="What exactly? (chapter, article, lecture)" aria-label="Topic" autocomplete="off">
          <button class="btn small">Log</button>
        </div>
      </form>`;

    const head = `
      <div class="group-head"><h2>📚 Learning</h2><button class="linklike small" data-act="study-log">Full log</button></div>
      <p class="small muted">Log what you studied or read, and roughly how long. You can back-fill past days too.</p>
      ${form}`;

    if (!S.study.length) {
      return `<section class="card learning">${head}
        <p class="muted small chart-empty">Your first entry starts the charts: time per day, how much it varies, and your subject mix.</p>
        ${subjectDatalist()}</section>`;
    }

    // ---- variation: how even is your daily study time? ----
    let variation;
    if (tracked.length < 3 || withMins.length < 2) {
      variation = `Log a few more days with minutes and ${esc(theme().mascot.name)} will spot your rhythm.`;
    } else {
      const mean = total / tracked.length;
      const sd = Math.sqrt(mins.reduce((a, m) => a + (m - mean) ** 2, 0) / mins.length);
      const cv = sd / mean;                                   // spread relative to the average
      const word = cv < 0.35 ? 'very steady' : cv < 0.7 ? 'fairly steady' : cv < 1.1 ? 'up and down' : 'in bursts';
      const sorted = [...withMins].sort((a, b) => a - b);
      const q = p => sorted[Math.round(p * (sorted.length - 1))];
      const lo = sorted.length >= 4 ? q(0.25) : sorted[0], hi = sorted.length >= 4 ? q(0.75) : sorted[sorted.length - 1];
      let bigDay = tracked[0];
      tracked.forEach(d => { if (dayMins(d) > dayMins(bigDay)) bigDay = d; });
      let run = 0, best = 0;
      tracked.forEach(d => { run = byDate[d] ? run + 1 : 0; best = Math.max(best, run); });
      variation = `Your daily study time is <strong>${word}</strong>. On days you study, it’s usually <strong>${lo === hi ? `about ${fmtDur(lo)}` : `${fmtDur(lo)} to ${fmtDur(hi)}`}</strong>.
        Biggest day: <strong>${D.pretty(bigDay)}</strong> (${fmtDur(dayMins(bigDay))}). Longest run: <strong>${plural(best, 'day')}</strong> in a row.
        ${cv >= 0.7 ? 'Big days are great. Spreading the same hours over more days (the spacing effect) is one of the best-supported findings in learning research.' : ''}`;
    }

    // ---- weekday rhythm over the last 8 weeks ----
    const wkDays = Array.from({ length: 56 }, (_, i) => D.add(today, i - 55)).filter(d => d >= effStart);
    let rhythm = '';
    if (wkDays.length >= 7 && wkDays.some(d => dayMins(d) > 0)) {
      const names = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
      const avgs = [1, 2, 3, 4, 5, 6, 0].map(w => {
        const ds = wkDays.filter(d => D.dow(d) === w);
        return { w, avg: ds.length ? ds.reduce((a, d) => a + dayMins(d), 0) / ds.length : 0 };
      });
      const top = Math.max(...avgs.map(a => a.avg), 1);
      const bestW = avgs.reduce((a, b) => (b.avg > a.avg ? b : a));
      rhythm = `
        <h3>Your week, on average</h3>
        <div class="wk-rhythm" role="img" aria-label="Average study time by weekday. Most on ${names[bestW.w]}, about ${fmtDur(bestW.avg)}.">
          ${avgs.map(a => `<div class="wr-col" tabindex="0" data-tip="${esc(`${names[a.w]}: about ${fmtDur(a.avg)} on average`)}">
            <span class="wr-bar"><span style="height:${Math.round((a.avg / top) * 100)}%"></span></span>
            <small>${names[a.w].slice(0, 2)}</small></div>`).join('')}
        </div>
        <p class="small">You tend to study most on <strong>${names[bestW.w]}</strong> <span class="muted">(average minutes per weekday, last 8 weeks)</span>.</p>`;
    }

    // ---- subject mix ----
    const countTotal = subList.reduce((a, s) => a + s.count, 0);
    const shares = subList.map(s => (total ? s.minutes / total : s.count / countTotal)).filter(p => p > 0);
    const H = -shares.reduce((a, p) => a + p * Math.log(p), 0);
    const even = shares.length > 1 ? H / Math.log(shares.length) : 0;
    const mixWord = subList.length <= 1 ? 'all in one subject. Deep focus!' : even < 0.5 ? 'mostly one main subject' : even < 0.8 ? 'a main subject plus a few side quests' : 'a nicely balanced mix';
    const mix = subList.length ? `
      <h3>Subject mix</h3>
      <p class="small"><strong>${plural(subList.length, 'subject')}</strong> in the last ${n} days: ${mixWord}.</p>
      <ul class="bars subj-bars">${subList.map(s => {
        const share = total ? Math.round((s.minutes / total) * 100) : Math.round((s.count / countTotal) * 100);
        return `<li><span class="bar-label"><i class="dot" style="background:${slotColor(s.slot)}" aria-hidden="true"></i>${esc(s.name)}</span>
          <span class="bar" aria-hidden="true"><span style="width:${share}%;background:${slotColor(s.slot)}"></span></span>
          <span class="bar-val">${total ? `${fmtDur(s.minutes)} · ${share}%` : plural(s.count, 'entry').replace('entrys', 'entries')}</span></li>`;
      }).join('')}</ul>` : `<p class="muted small">Nothing logged in the last ${n} days.</p>`;

    const recent = S.study.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date < b.e.date ? 1 : a.e.date > b.e.date ? -1 : b.i - a.i)).slice(0, 4);

    return `
      <section class="card learning">
        ${head}
        ${rangeTabs}
        <div class="kpis">
          <div><strong>${fmtDur(total)}</strong><span>total, last ${n} days</span></div>
          <div><strong>${studyDays}/${tracked.length}</strong><span>days you studied</span></div>
          <div><strong>${fmtDur(avgStudyDay)}</strong><span>average on a study day</span></div>
          <div><strong>${subList.length}</strong><span>${subList.length === 1 ? 'subject' : 'subjects'}</span></div>
        </div>
        ${studyChart(days, byDate, order, effStart, tracked.length ? total / tracked.length : 0)}
        <p class="small">${variation}</p>
        ${rhythm}
        ${mix}
        <h3>Recent</h3>
        ${recent.map(({ e }) => studyLine(e).replace('</p>', ` <span class="muted small">· ${D.pretty(e.date)}</span></p>`)).join('')}
        ${subjectDatalist()}
      </section>`;
  }

  /* Stacked bars: minutes per day, one colour per subject, with a dashed daily-average line. */
  function studyChart(days, byDate, order, effStart, avg) {
    const W = 340, H = 176, pl = 34, pr = 8, pt = 14, pb = 22, ph = H - pt - pb;
    const n = days.length;
    const totals = days.map(d => (byDate[d] || []).reduce((a, e) => a + (e.minutes || 0), 0));
    const peak = Math.max(...totals, avg, 1);
    const step = peak <= 60 ? 15 : peak <= 120 ? 30 : peak <= 300 ? 60 : 120;
    const top = Math.ceil(peak / step) * step;
    const y = m => pt + ph - (m / top) * ph;
    const slot = (W - pl - pr) / n, bw = Math.max(4, Math.min(24, slot * 0.66));
    const axisLab = v => (v < 60 ? `${v}m` : v % 60 ? `${(v / 60).toFixed(1)}h` : `${v / 60}h`);
    const usedSlots = new Set();

    let grid = '';
    for (let v = step; v <= top; v += step) grid += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${pl - 6}" y="${y(v) + 3.5}" class="axis" text-anchor="end">${axisLab(v)}</text>`;

    const cols = days.map((d, i) => {
      const es = byDate[d] || [];
      const bySlot = {};
      es.forEach(e => { const s = subjectSlot(order, e.subject); bySlot[s] = (bySlot[s] || 0) + (e.minutes || 0); });
      const segs = Object.entries(bySlot).map(([s, m]) => ({ s: Number(s), m })).filter(x => x.m > 0)
        .sort((a, b) => (a.s || 99) - (b.s || 99));
      const x = pl + i * slot + (slot - bw) / 2;
      let acc = 0, bars = '';
      segs.forEach((g, j) => {
        usedSlots.add(g.s);
        let y0 = y(acc), y1 = y(acc + g.m);
        acc += g.m;
        if (j > 0 && y0 - y1 > 3) y0 -= 2;                      // 2px surface gap between stacked subjects
        const h = y0 - y1, fill = slotColor(g.s);
        if (j === segs.length - 1) {                             // rounded top on the last segment only
          const r = Math.min(4, bw / 2, h);
          bars += `<path d="M${x} ${y0} V${y1 + r} Q${x} ${y1} ${x + r} ${y1} H${x + bw - r} Q${x + bw} ${y1} ${x + bw} ${y1 + r} V${y0} Z" fill="${fill}"/>`;
        } else bars += `<rect x="${x}" y="${y1}" width="${bw}" height="${h}" fill="${fill}"/>`;
      });
      if (es.length && !acc) bars += `<circle cx="${x + bw / 2}" cy="${y(0) - 5}" r="3" class="no-time"/>`;   // logged, no minutes
      const tip = es.length
        ? [`${D.pretty(d)} · ${fmtDur(totals[i])}`, ...es.map(e => `${(STUDY_KINDS[e.kind] || STUDY_KINDS.study).icon} ${e.subject}${e.topic ? ` (${e.topic})` : ''}${e.minutes ? ` · ${fmtDur(e.minutes)}` : ''}`)].join('\n')
        : `${D.pretty(d)} · ${d < effStart ? 'before you started' : 'no study logged'}`;
      return `<g class="day-col" data-tip="${esc(tip)}"${es.length ? ' tabindex="0"' : ''}>
        <rect class="hit" x="${pl + i * slot}" y="${pt - 4}" width="${slot}" height="${ph + 8}" rx="4"/>${bars}</g>`;
    }).join('');

    const labIdx = n <= 7 ? days.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];
    const anchor = i => (n <= 7 ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle');
    const lx = i => (anchor(i) === 'start' ? pl + i * slot : anchor(i) === 'end' ? pl + (i + 1) * slot : pl + i * slot + slot / 2);
    const xLabels = labIdx.map(i => `<text x="${lx(i)}" y="${H - 6}" class="axis" text-anchor="${anchor(i)}">${esc(n <= 7 ? D.pretty(days[i], { weekday: 'short' }) : D.pretty(days[i], { day: 'numeric', month: 'short' }))}</text>`).join('');
    const avgLine = avg > 0 ? `<line x1="${pl}" x2="${W - pr}" y1="${y(avg)}" y2="${y(avg)}" class="avg-line"/>` : '';

    // Legend: one key per subject on screen (a single subject is named in the tooltip instead), plus the average line.
    const keys = [...usedSlots].sort((a, b) => (a || 99) - (b || 99));
    const legendKeys = (keys.length > 1 ? keys.map(s => `<span class="key"><i class="dot" style="background:${slotColor(s)}"></i>${esc(s ? order[s - 1] : 'Other')}</span>`) : [])
      .concat(avg > 0 ? [`<span class="key"><i class="sw avg"></i>daily avg ${esc(fmtDur(avg))}</span>`] : []);
    const legend = legendKeys.length ? `<figcaption>${legendKeys.join('')}</figcaption>` : '';

    const rows = days.slice().reverse().filter(d => d >= effStart).map(d => {
      const es = byDate[d] || [];
      return `<tr><td>${esc(D.pretty(d))}</td><td>${es.length ? fmtDur(es.reduce((a, e) => a + (e.minutes || 0), 0)) : '—'}</td><td>${esc([...new Set(es.map(e => e.subject))].join(', ')) || '—'}</td></tr>`;
    }).join('');

    return `
      <figure class="chart study-chart">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Study minutes per day for the last ${n} days, coloured by subject. Daily average ${fmtDur(avg)}.">
          ${grid}
          <line x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}" class="baseline"/>
          ${cols}
          ${avgLine}
          ${xLabels}
        </svg>
        ${legend}
      </figure>
      <details class="table-view"><summary>Show as a table</summary>
        <table class="mini-table"><thead><tr><th scope="col">Day</th><th scope="col">Time</th><th scope="col">Subjects</th></tr></thead><tbody>${rows}</tbody></table>
      </details>`;
  }

  function heatmap() {
    const weeks = 16;
    const start = D.add(D.weekStart(today), -7 * (weeks - 1));
    let cols = '';
    let active = 0, good = 0;
    for (let w = 0; w < weeks; w++) {
      cols += '<div class="hm-col">';
      for (let d = 0; d < 7; d++) {
        const k = D.add(start, w * 7 + d);
        const future = D.diff(k, today) > 0;
        const L = S.log[k];
        let lvl = 'none';
        if (!future && L && L.total > 0) {
          const s = L.score;
          lvl = s === 0 ? '0' : s < 50 ? '1' : s < 80 ? '2' : s < 100 ? '3' : '4';
          active++; if (qualifies(k)) good++;
        }
        const prot = isProtected(k);
        const title = future ? '' : `${D.pretty(k)}: ${L && L.total ? L.score + '%' : 'no data'}${prot ? ' · rest token' : ''}`;
        cols += `<span class="hm-cell lv-${lvl}${prot ? ' prot' : ''}${k === today ? ' today' : ''}${future ? ' future' : ''}" title="${esc(title)}"></span>`;
      }
      cols += '</div>';
    }
    return `
      <div class="heatmap" role="img" aria-label="Calendar heatmap of the last ${weeks} weeks: ${good} of ${active} tracked days counted toward your streak.">
        <div class="hm-days" aria-hidden="true"><span>M</span><span></span><span>W</span><span></span><span>F</span><span></span><span>S</span></div>
        <div class="hm-grid">${cols}</div>
      </div>
      <div class="hm-legend" aria-hidden="true">Less <span class="hm-cell lv-0"></span><span class="hm-cell lv-1"></span><span class="hm-cell lv-2"></span><span class="hm-cell lv-3"></span><span class="hm-cell lv-4"></span> More · <span class="hm-cell lv-2 prot"></span> rest token</div>`;
  }

  function sleepForm() {
    const cur = S.sleep[today];
    const keys = Object.keys(S.sleep).sort();
    const last = keys.length ? S.sleep[keys[keys.length - 1]] : null;
    const bed = cur ? cur.bed : last ? last.bed : '23:00';
    const wake = cur ? cur.wake : last ? last.wake : S.settings.wakeGoal;
    return `
      <form class="sleep-form" data-form="sleep">
        <label>Woke on<input type="date" name="date" value="${today}" max="${today}" required></label>
        <label>Bedtime<input type="time" name="bed" value="${esc(bed)}" required></label>
        <label>Wake time<input type="time" name="wake" value="${esc(wake)}" required></label>
        <button class="btn">${cur ? 'Update' : 'Save'}</button>
      </form>`;
  }

  /* Times are plotted from 18:00 (top) to 12:00 next day (bottom). */
  function sleepChart() {
    const keys = Object.keys(S.sleep).sort().slice(-14);
    if (keys.length < 2) return '<p class="muted small chart-empty">Log at least two nights to see your trend line.</p>';
    const W = 340, H = 200, pl = 44, pr = 12, pt = 12, pb = 28;
    const v = t => ((toMin(t) - 1080) % 1440 + 1440) % 1440;           // minutes after 18:00
    const y = val => pt + (Math.min(1080, val) / 1080) * (H - pt - pb);
    const x = i => pl + (keys.length === 1 ? 0 : (i / (keys.length - 1)) * (W - pl - pr));
    const bed = keys.map(k => v(S.sleep[k].bed));
    const wake = keys.map(k => v(S.sleep[k].wake));
    const path = arr => arr.map((val, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(val).toFixed(1)}`).join(' ');

    // least-squares trend line for wake time
    const n = wake.length, mx = (n - 1) / 2, my = wake.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    wake.forEach((val, i) => { num += (i - mx) * (val - my); den += (i - mx) ** 2; });
    const slope = den ? num / den : 0;
    const t0 = my - slope * mx, t1 = my + slope * (n - 1 - mx);
    const trendWord = slope < -2 ? 'getting earlier 🌅' : slope > 2 ? 'drifting later' : 'holding steady';

    const grid = [['21:00', 180], ['00:00', 360], ['03:00', 540], ['06:00', 720], ['09:00', 900]]
      .map(([lab, val]) => `<line x1="${pl}" x2="${W - pr}" y1="${y(val)}" y2="${y(val)}" class="grid"/><text x="${pl - 6}" y="${y(val) + 4}" class="axis" text-anchor="end">${lab}</text>`).join('');
    const goal = v(S.settings.wakeGoal);
    const durations = keys.map((k, i) => wake[i] - bed[i]).filter(m => m > 0 && m < 1000);
    const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const avgWake = fmtMin(my + 1080);
    const pts = (arr, cls, label) => arr.map((val, i) => `<circle cx="${x(i)}" cy="${y(val)}" r="3.5" class="${cls}"><title>${D.pretty(keys[i])} ${label} ${fmtMin(val + 1080)}</title></circle>`).join('');

    return `
      <figure class="chart">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sleep chart for the last ${n} nights. Average wake time ${avgWake}, trend ${trendWord}.">
          ${grid}
          <line x1="${pl}" x2="${W - pr}" y1="${y(goal)}" y2="${y(goal)}" class="goal"/>
          <text x="${W - pr}" y="${y(goal) - 4}" class="axis goal-label" text-anchor="end">goal ${esc(S.settings.wakeGoal)}</text>
          <path d="${path(bed)}" class="line bed"/>
          <path d="${path(wake)}" class="line wake"/>
          <line x1="${x(0)}" y1="${y(t0)}" x2="${x(n - 1)}" y2="${y(t1)}" class="trend"/>
          ${pts(bed, 'dot bed', 'bedtime')}${pts(wake, 'dot wake', 'woke')}
          <text x="${pl}" y="${H - 8}" class="axis">${D.pretty(keys[0], { day: 'numeric', month: 'short' })}</text>
          <text x="${W - pr}" y="${H - 8}" class="axis" text-anchor="end">${D.pretty(keys[n - 1], { day: 'numeric', month: 'short' })}</text>
        </svg>
        <figcaption>
          <span class="key"><i class="sw bed"></i>Bedtime</span>
          <span class="key"><i class="sw wake"></i>Wake time</span>
          <span class="key"><i class="sw trend"></i>Wake trend</span>
        </figcaption>
      </figure>
      <p class="small">Average wake <strong>${avgWake}</strong> · average sleep <strong>${Math.floor(avgDur / 60)}h ${String(Math.round(avgDur % 60)).padStart(2, '0')}m</strong> · your wake time is <strong>${trendWord}</strong>.</p>`;
  }

  function habitBars() {
    const span = Math.min(30, D.diff(today, S.startDate) + 1);
    const days = Array.from({ length: span }, (_, i) => D.add(today, -i));
    const rows = visible().filter(isDaily).map(h => {
      const n = days.filter(d => isDone(h.id, d)).length;
      return { h, n, pct: Math.round((n / span) * 100) };
    });
    if (!rows.length) return '<p class="muted">No daily habits visible yet.</p>';
    return `<ul class="bars">${rows.map(r => `
      <li><span class="bar-label"><span aria-hidden="true">${esc(r.h.emoji)}</span> ${esc(r.h.name)}</span>
        <span class="bar" aria-hidden="true"><span style="width:${r.pct}%"></span></span>
        <span class="bar-val">${r.n}/${span}</span></li>`).join('')}</ul>`;
  }

  /* ----------------------------- WINS ----------------------------- */
  function renderWins() {
    const tabs = [['wins', '🌟 Wins'], ['learned', '💡 Learned'], ['study', '📚 Studied'], ['home', '💌 Reached out']];
    let items = [], form = '';
    if (winsTab === 'study') {
      items = S.study.map((e, i) => ({ i, date: e.date, html: `${(STUDY_KINDS[e.kind] || STUDY_KINDS.study).icon} <strong>${esc(e.subject)}</strong>${e.topic ? ` · ${esc(e.topic)}` : ''}${e.minutes ? ` · <span class="muted">${fmtDur(e.minutes)}</span>` : ''}` }));
      form = `<p class="small muted">Log sessions from the 📚 Study session habit on Today, or from <button class="linklike" data-act="nav" data-view="insights">Insights → Learning</button> (which has the charts).</p>`;
    } else if (winsTab === 'wins') {
      items = S.wins.map((w, i) => ({ i, date: w.date, html: esc(w.text) }));
      form = `<form class="inline-form" data-form="win"><label class="sr" for="newWin">New win or gratitude</label><input id="newWin" name="text" maxlength="240" placeholder="A win or gratitude from today" autocomplete="off"><button class="btn small">Add</button></form>`;
    } else if (winsTab === 'learned') {
      items = S.articles.map((a, i) => ({ i, date: a.date, html: esc(a.text) }));
      form = `<form class="inline-form" data-form="article"><label class="sr" for="newLearn">Something I learned</label><input id="newLearn" name="text" maxlength="240" placeholder="Something I learned today" autocomplete="off"><button class="btn small">Add</button></form>`;
    } else {
      items = S.homeLog.map((x, i) => ({ i, date: x.date, html: `<strong>${esc(x.who)}</strong>${x.note ? ` · ${esc(x.note)}` : ''}` }));
      form = `<form class="inline-form" data-form="home"><label class="sr" for="newWho">Who did I reach out to?</label><input id="newWho" name="text" maxlength="80" placeholder="Who did I reach out to?" autocomplete="off"><button class="btn small">Log</button></form>`;
    }
    items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.i - a.i));
    let month = '';
    const list = items.map(it => {
      const m = D.pretty(it.date, { month: 'long', year: 'numeric' });
      const head = m !== month ? `<li class="month">${esc(m)}</li>` : '';
      month = m;
      return `${head}<li class="win-item"><span class="win-date">${D.pretty(it.date, { day: 'numeric', weekday: 'short' })}</span><span class="win-text">${it.html}</span><button class="icon-btn small" data-act="del-entry" data-kind="${winsTab}" data-idx="${it.i}" aria-label="Delete entry">✕</button></li>`;
    }).join('');

    return `
      <section class="card">
        <h2>Your Wins journal</h2>
        <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${winsTab === k}" data-act="wins-tab" data-tab="${k}">${l}</button>`).join('')}</div>
        ${form}
        <label class="sr" for="winSearch">Search</label>
        <input type="search" id="winSearch" class="search" placeholder="Search…" autocomplete="off">
        ${items.length ? `<ul class="win-list">${list}</ul>` : `<p class="muted">Nothing here yet. Your first entry will be lovely.</p>`}
      </section>`;
  }

  /* ---------------------------- MASCOT ---------------------------- */
  function renderMascot() {
    const t = theme(), st = stage(), lv = levelInfo();
    const unlockedAcc = new Set(BADGES.filter(b => b.accessory && S.badges[b.id]).map(b => b.accessory));
    const stageRule = i => (i === 0 ? 'Where everyone begins' : `Phase ${i + 1} or a ${[0, 7, 14, 30, 60][i]}-day streak`);
    return `
      <section class="card profile">
        <button class="mascot-wrap big" data-act="poke" aria-label="Poke ${esc(t.mascot.name)}"><canvas id="profileCanvas" class="mascot-canvas big" aria-hidden="true"></canvas></button>
        <h2>${esc(t.mascot.name)}</h2>
        <p class="muted">${esc(t.mascot.species)} · <strong>${esc(t.mascot.stageNames[st - 1])}</strong> (stage ${st} of 5)</p>
        <div class="level">
          <div class="progress" role="progressbar" aria-label="XP to next level" aria-valuemin="0" aria-valuemax="${lv.per}" aria-valuenow="${lv.into}"><div style="width:${(lv.into / lv.per) * 100}%"></div></div>
          <p class="small">Level <strong>${lv.level}</strong> · ${lv.into}/${lv.per} XP to the next level · 🔥 ${streakNow} (best ${S.flags.best || 0})</p>
        </div>
      </section>

      <section class="card">
        <h2>Badges <span class="muted small">${Object.keys(S.badges).length}/${BADGES.length}</span></h2>
        <ul class="badges">${BADGES.map(b => {
          const got = S.badges[b.id];
          return `<li class="badge ${got ? 'got' : ''}"><span class="b-icon" aria-hidden="true">${got ? b.icon : '🔒'}</span><strong>${esc(b.name)}</strong><small>${esc(b.desc)}${got ? `<br><em>Earned ${D.pretty(got)}</em>` : ''}${b.accessory ? `<br>🎁 ${esc(t.accessoryNames[b.accessory])}` : ''}</small></li>`;
        }).join('')}</ul>
      </section>

      <section class="card">
        <h2>Accessories</h2>
        <ul class="acc-list">${Mascot.ACCESSORY_ORDER.map(a => {
          const badge = BADGES.find(b => b.accessory === a);
          const open = unlockedAcc.has(a);
          return `<li><label class="check ${open ? '' : 'disabled'}"><input type="checkbox" data-act="wear" data-acc="${a}" ${S.worn.includes(a) ? 'checked' : ''} ${open ? '' : 'disabled'}> ${esc(t.accessoryNames[a])}</label>${open ? '' : `<small class="muted">Unlock with “${esc(badge ? badge.name : '?')}”</small>`}</li>`;
        }).join('')}</ul>
      </section>

      <section class="card">
        <h2>Choose a mythology</h2>
        <div class="theme-grid">${Object.values(THEMES).map(th => `
          <button class="theme-card ${th.id === t.id ? 'active' : ''}" data-act="theme-set" data-theme="${th.id}" aria-pressed="${th.id === t.id}">
            <canvas class="mascot-canvas mini" data-preview="${th.id}" aria-hidden="true"></canvas>
            <strong>${esc(th.label)}</strong><small>${esc(th.mascot.name)} · ${esc(th.tagline)}</small>
          </button>`).join('')}</div>
      </section>

      <section class="card">
        <h2>Evolution path</h2>
        <ol class="evo">${t.mascot.stageNames.map((n, i) => `<li class="${i + 1 <= st ? 'reached' : ''}"><strong>${esc(n)}</strong><small>${stageRule(i)}</small></li>`).join('')}</ol>
      </section>`;
  }

  function mountMascotScreen() {
    const c = $('#profileCanvas');
    if (c) { profile = Mascot.create(c); profile.setTheme(theme()).setStage(stage()).setWorn(S.worn); }
    $$('canvas[data-preview]').forEach(cv => {
      Mascot.create(cv, { static: true }).setTheme(THEMES[cv.dataset.preview]).setStage(3);
    });
  }

  /* --------------------------- SETTINGS --------------------------- */
  function renderSettings() {
    const s = S.settings;
    const opt = (val, label, cur) => `<option value="${esc(val)}" ${String(cur) === String(val) ? 'selected' : ''}>${esc(label)}</option>`;
    const sections = [['flow', '🌅 Morning flow (ordered)'], ['daily', '📋 Daily'], ['weekly', '📅 Weekly targets'], ['other', '✨ Other good habits']];
    const times = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['night', 'Night']];
    const wisdomKeys = Object.keys(WISDOM);

    const editRow = h => `
      <li class="edit-row" data-hid="${esc(h.id)}">
        <div class="edit-main">
          <input class="emoji-input" data-hfield="emoji" value="${esc(h.emoji)}" maxlength="8" aria-label="Emoji for ${esc(h.name)}">
          <input class="name-input" data-hfield="name" value="${esc(h.name)}" maxlength="60" aria-label="Name">
          <div class="edit-actions">
            <button class="icon-btn small" data-act="h-up" aria-label="Move ${esc(h.name)} up">↑</button>
            <button class="icon-btn small" data-act="h-down" aria-label="Move ${esc(h.name)} down">↓</button>
            <button class="icon-btn small" data-act="h-del" aria-label="Remove ${esc(h.name)}">🗑</button>
          </div>
        </div>
        <div class="edit-meta">
          <label>Phase<select data-hfield="phase">${[1, 2, 3, 4, 5].map(n => opt(n, n, h.phase)).join('')}</select></label>
          <label>Section<select data-hfield="section">${sections.map(([v, l]) => opt(v, l.replace(/^\S+\s/, '').replace(' (ordered)', ''), h.section)).join('')}</select></label>
          ${h.section === 'weekly'
            ? `<label>Target / week<input type="number" min="1" max="7" data-hfield="target" value="${h.target || 1}"></label>`
            : `<label>Time<select data-hfield="time">${times.map(([v, l]) => opt(v, l, h.time || 'evening')).join('')}</select></label>`}
          <label>Facts<select data-hfield="wisdom">${wisdomKeys.map(k => opt(k, k, h.wisdom || 'other')).join('')}</select></label>
          ${h.section === 'flow' ? `<label class="check"><input type="checkbox" data-hfield="gate" ${h.gate ? 'checked' : ''}> Phone gate</label>` : ''}
        </div>
      </li>`;

    const anchors = S.habits.filter(h => (h.phase || 1) === 1);

    return `
      <section class="card">
        <h2>About you</h2>
        <div class="stack-form">
          <label>Your name<input data-setting="userName" value="${esc(s.userName)}" maxlength="40"></label>
          <label>Site name<input data-setting="siteName" value="${esc(s.siteName)}" maxlength="40" placeholder="${esc(theme().siteName)} (follows the theme)"></label>
        </div>
      </section>

      <section class="card">
        <h2>Look &amp; feel</h2>
        <div class="stack-form">
          <label>Mythology<select data-setting="themeId">${Object.values(THEMES).map(t => opt(t.id, `${t.label} · ${t.mascot.name}`, s.themeId)).join('')}</select></label>
          <label>Day / night<select data-setting="dayNight">${opt('auto', 'Follow the clock', s.dayNight)}${opt('day', 'Always day', s.dayNight)}${opt('night', 'Always night', s.dayNight)}</select></label>
          <label class="check"><input type="checkbox" data-setting="showCards" ${s.showCards ? 'checked' : ''}> Show the “Why it works” card when I tick a habit</label>
        </div>
      </section>

      <section class="card">
        <h2>Phases &amp; streaks</h2>
        <p class="small">Phase 1 shows only habits set to <strong>Phase 1</strong>. Your anchors right now: ${anchors.length ? anchors.map(h => `${esc(h.emoji)} ${esc(h.name)}`).join(', ') : '<em>none yet</em>'}${anchors.length !== 3 ? ' <span class="muted">(three is the sweet spot)</span>' : ''}.</p>
        <div class="stack-form">
          <label>Current phase<select data-setting="phase">${[1, 2, 3, 4, 5].map(n => opt(n, (PHASE_INFO[n] || {}).title || n, s.phase)).join('')}</select></label>
          <label class="check"><input type="checkbox" data-setting="autoUnlock" ${s.autoUnlock ? 'checked' : ''}> Unlock the next phase automatically</label>
          <label>Auto-unlock at a 7-day average of (%)<input type="number" min="30" max="100" step="5" data-setting="unlockThreshold" value="${s.unlockThreshold}"></label>
          <label>A day counts toward my streak at (%)<input type="number" min="10" max="100" step="5" data-setting="streakThreshold" value="${s.streakThreshold}"></label>
          <label>Wake-up goal<input type="time" data-setting="wakeGoal" value="${esc(s.wakeGoal)}"></label>
        </div>
      </section>

      <section class="card">
        <h2>Habits</h2>
        <p class="small muted">Edits save as you go. Reorder with the arrows; morning flow order sets the phone gate.</p>
        ${sections.map(([sec, label]) => {
          const list = S.habits.filter(h => h.section === sec);
          return `<h3>${label}</h3>${list.length ? `<ul class="edit-list">${list.map(editRow).join('')}</ul>` : '<p class="muted small">None yet.</p>'}`;
        }).join('')}
        <h3>Add a habit</h3>
        <form class="stack-form add-form" data-form="add-habit">
          <div class="row2">
            <label>Emoji<input name="emoji" maxlength="8" value="✨"></label>
            <label>Name<input name="text" maxlength="60" placeholder="e.g. Drink 2 glasses of water" required></label>
          </div>
          <div class="row2">
            <label>Section<select name="section">${sections.map(([v, l]) => opt(v, l.replace(/^\S+\s/, ''), 'other')).join('')}</select></label>
            <label>Time<select name="time">${times.map(([v, l]) => opt(v, l, 'evening')).join('')}</select></label>
          </div>
          <div class="row2">
            <label>Phase<select name="phase">${[1, 2, 3, 4, 5].map(n => opt(n, n, s.phase)).join('')}</select></label>
            <label>Facts<select name="wisdom">${wisdomKeys.map(k => opt(k, k, 'other')).join('')}</select></label>
          </div>
          <button class="btn">Add habit</button>
        </form>
      </section>

      <section class="card">
        <h2>Your data</h2>
        <p class="small">Everything is stored in this browser only. Export a backup now and then (and before switching phones).</p>
        <div class="btn-row">
          <button class="btn" data-act="export">⬇️ Export JSON</button>
          <label class="btn ghost file-btn">⬆️ Import JSON<input type="file" id="importFile" accept="application/json,.json"></label>
          <button class="btn danger" data-act="reset">Reset everything</button>
        </div>
      </section>`;
  }

  function moveHabit(id, dir) {
    const i = S.habits.findIndex(h => h.id === id);
    if (i < 0) return;
    const sec = S.habits[i].section;
    let j = i + dir;
    while (j >= 0 && j < S.habits.length && S.habits[j].section !== sec) j += dir;
    if (j < 0 || j >= S.habits.length) return;
    [S.habits[i], S.habits[j]] = [S.habits[j], S.habits[i]];
    save(); render();
    const btn = document.querySelector(`[data-hid="${CSS.escape(id)}"] [data-act="${dir < 0 ? 'h-up' : 'h-down'}"]`);
    if (btn) btn.focus();
  }

  /* ================= 7. SHEETS, TOASTS, CONFETTI ================== */
  let sheetTimer = null;
  function openSheet(html) {
    clearTimeout(sheetTimer);   // a sheet that is still closing must not wipe this one
    const bd = $('#sheetBackdrop'), sh = $('#sheet');
    sh.innerHTML = html;
    bd.hidden = false;
    requestAnimationFrame(() => bd.classList.add('open'));
    const f = sh.querySelector('[data-act="sheet-close"]');
    if (f) f.focus({ preventScroll: true });
  }
  function closeSheet() {
    const bd = $('#sheetBackdrop');
    if (bd.hidden) return;
    bd.classList.remove('open');
    sheetTimer = setTimeout(() => { bd.hidden = true; $('#sheet').innerHTML = ''; }, reduced() ? 0 : 220);
    if (lastFocusId) {
      const el = document.querySelector(`[data-act="toggle"][data-id="${CSS.escape(lastFocusId)}"]`);
      if (el) el.focus({ preventScroll: true });
      lastFocusId = null;
    }
  }
  const sheetOpen = () => !$('#sheetBackdrop').hidden;

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3700);
  }

  function celebrate() {
    hero && hero.celebrate();
    if (reduced()) return;
    const layer = $('#confetti');
    const pal = palette();
    const colors = [pal.gold, pal.accent, pal.accent2, pal.good];
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      s.style.setProperty('--drift', Math.random() * 160 - 80 + 'px');
      s.style.setProperty('--spin', Math.random() * 720 - 360 + 'deg');
      layer.appendChild(s);
    }
    setTimeout(() => { layer.innerHTML = ''; }, 4000);
  }

  /* ===================== 8. EVENTS + START-UP ===================== */
  function setView(v) {
    view = v;
    if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    render();
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  }

  function setTheme(id) {
    S.settings.themeId = id;
    save();
    applyTheme();
    say(line(greetingKind()));
    hero.cheer();
    render();
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'sheetBackdrop') return closeSheet();
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const id = el.dataset.id;
    switch (act) {
      case 'toggle': toggle(id); break;
      case 'why': { const h = habit(id); if (h) openWisdom(h, true); break; }
      case 'card-next': {
        cardState.i++;
        S.wisdomIdx[cardState.key] = cardState.i + 1;
        save(); renderCard(); break;
      }
      case 'sheet-close': closeSheet(); break;
      case 'nav': closeSheet(); setView(el.dataset.view); break;
      case 'unlock-phase': unlockPhase(true); break;
      case 'poke': {
        const target = view === 'mascot' && profile ? profile : hero;
        if (hero.getMood() === 'sleepy') { hero.setMood('hopeful'); say(line('hopeful')); }
        else say(line('poke'));
        target.poke();
        break;
      }
      case 'theme-next': {
        const ids = Object.keys(THEMES);
        setTheme(ids[(ids.indexOf(S.settings.themeId) + 1) % ids.length]);
        break;
      }
      case 'theme-set': setTheme(el.dataset.theme); break;
      case 'review-prev': reviewWeek = D.add(reviewWeek || D.weekStart(today), -7); render(); break;
      case 'review-next': {
        const next = D.add(reviewWeek || D.weekStart(today), 7);
        reviewWeek = D.diff(next, D.weekStart(today)) >= 0 ? null : next;
        render(); break;
      }
      case 'wins-tab': winsTab = el.dataset.tab; render(); break;
      case 'study-range': studyRange = Number(el.dataset.range) || 14; render(); break;
      case 'study-log': winsTab = 'study'; setView('wins'); break;
      case 'del-entry': {
        const arr = { wins: S.wins, learned: S.articles, study: S.study, home: S.homeLog }[el.dataset.kind];
        const i = Number(el.dataset.idx);
        if (arr && arr[i] && confirm('Delete this entry? This can’t be undone (unless you have a backup).')) { arr.splice(i, 1); save(); render(); }
        break;
      }
      case 'h-up': moveHabit(el.closest('[data-hid]').dataset.hid, -1); break;
      case 'h-down': moveHabit(el.closest('[data-hid]').dataset.hid, 1); break;
      case 'h-del': {
        const hid = el.closest('[data-hid]').dataset.hid;
        const h = habit(hid);
        if (h && confirm(`Remove “${h.name}”? Past ticks stay in your saved history but won’t be shown.`)) {
          S.habits = S.habits.filter(x => x.id !== hid);
          recompute(); refresh(); save(); render();
        }
        break;
      }
      case 'export': Store.exportFile(); toast('⬇️ Backup downloaded'); break;
      case 'reset':
        if (confirm('Reset EVERYTHING? All habits, history, badges and logs will be erased from this browser.') &&
            confirm('Really sure? Export a backup first if you might want it back.')) {
          Store.reset(); S = Store.state; boot(true);
        }
        break;
    }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.act === 'toggle-full') {
      S.settings.viewFull = el.checked;
      recompute(); refresh(); save(); updateMascots(); render();
      say(el.checked ? 'The full routine! Remember: you don’t have to do it all at once.' : `Back to Phase ${S.settings.phase}. Focus is a superpower.`);
      return;
    }
    if (el.dataset.act === 'wear') {
      const a = el.dataset.acc;
      S.worn = el.checked ? Array.from(new Set([...S.worn, a])) : S.worn.filter(x => x !== a);
      save(); updateMascots(); (profile || hero).cheer();
      return;
    }
    if (el.dataset.setting) {
      const key = el.dataset.setting;
      let val = el.type === 'checkbox' ? el.checked : el.value;
      if (el.type === 'number') val = Math.max(Number(el.min) || 0, Math.min(Number(el.max) || 100, Number(val) || 0));
      if (key === 'phase') { val = Number(val); if (val !== S.settings.phase) S.settings.phaseStart = today; }
      S.settings[key] = val;
      recompute(); refresh(); save(); applyTheme();
      if (key === 'themeId') say(line(greetingKind()));
      checkBadges();
      render();
      return;
    }
    if (el.dataset.hfield) {
      const h = habit(el.closest('[data-hid]').dataset.hid);
      if (!h) return;
      const f = el.dataset.hfield;
      let val = el.type === 'checkbox' ? el.checked : el.value;
      if (f === 'phase' || f === 'target') val = Math.max(1, Number(val) || 1);
      if (f === 'name' && !String(val).trim()) val = h.name;
      h[f] = val;
      if (f === 'section' && val === 'weekly' && !h.target) h.target = 2;
      recompute(); refresh(); save();
      if (['section', 'phase', 'gate'].includes(f)) render();
      return;
    }
    if (el.id === 'importFile' && el.files && el.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = Store.parseImport(reader.result);
          if (!confirm('Replace your current data with this backup?')) return;
          Store.state = data; S = data; save();
          boot(true);
          toast('⬆️ Backup restored');
        } catch (err) { alert(err.message); }
      };
      reader.readAsText(el.files[0]);
      el.value = '';
    }
  });

  document.addEventListener('submit', e => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    handleForm(form);
  });

  document.addEventListener('input', e => {
    if (e.target.id !== 'winSearch') return;
    const q = e.target.value.trim().toLowerCase();
    $$('.win-list .win-item').forEach(li => { li.hidden = q && !li.textContent.toLowerCase().includes(q); });
    $$('.win-list .month').forEach(li => { li.hidden = !!q; });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheetOpen()) closeSheet();
    // keep keyboard focus inside the open sheet
    if (e.key === 'Tab' && sheetOpen()) {
      const f = $$('#sheet button, #sheet a, #sheet input, #sheet select').filter(x => !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* Chart tooltips: anything with data-tip shows it on hover, tap or keyboard focus. */
  const tip = document.createElement('div');
  tip.className = 'tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
  document.body.appendChild(tip);
  function showTip(el) {
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    let x, yy;
    if (r.height > 60) {            // tall chart columns: sit beside the column, inside the chart
      x = r.right + 6 + tw <= window.innerWidth - 8 ? r.right + 6 : r.left - tw - 6;
      yy = r.top + 4;
    } else {                        // small things: centred above (or below if there's no room)
      x = r.left + r.width / 2 - tw / 2;
      yy = r.top - th - 8 >= 70 ? r.top - th - 8 : r.bottom + 8;
    }
    x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
    yy = Math.max(70, Math.min(window.innerHeight - th - 8, yy));
    tip.style.left = `${x}px`; tip.style.top = `${yy}px`;
  }
  const hideTip = () => { tip.hidden = true; };
  document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); t ? showTip(t) : hideTip(); });
  document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('[data-tip]'); t ? showTip(t) : hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  window.addEventListener('hashchange', () => {
    const v = location.hash.slice(1);
    if (v && v !== view) { view = v; render(); }
  });

  /* Runs on load and when the date changes while the page is open. */
  function startOfDay() {
    const last = S.lastOpen;
    refresh();
    let comeback = false, tokenUsed = false;
    if (last && last !== today) {
      const y = D.add(today, -1);
      if (D.diff(y, S.startDate) >= 0) {
        if (isProtected(y)) tokenUsed = true;
        else if (!qualifies(y)) comeback = true;
      }
    }
    if (comeback) S.comebacks[today] = true;
    S.lastOpen = today;
    save();
    return { comeback, tokenUsed, first: !last };
  }

  function welcome() {
    openSheet(`
      <div class="sheet-head"><span class="sheet-emoji" aria-hidden="true">${esc(theme().ornament.split(' ')[0])}</span>
        <div><p class="eyebrow">Welcome</p><h2 id="sheetTitle">Hello, ${esc(S.settings.userName)}!</h2></div>
        <button class="icon-btn" data-act="sheet-close" aria-label="Close">✕</button></div>
      <p>I’m ${esc(theme().mascot.name)}, your ${esc(theme().mascot.species)}. We’re starting small on purpose.</p>
      <ul class="plain-list">
        <li>🌱 <strong>Phase 1</strong> is just three anchors: ${S.habits.filter(h => h.phase === 1).map(h => esc(h.name)).join(', ')}.</li>
        <li>🗝️ New habits unlock week by week, automatically or when you choose.</li>
        <li>🛡️ One <strong>rest token</strong> a week protects your streak. Missing a day gives you a comeback bonus, never a scolding.</li>
        <li>❓ Tap any habit’s <strong>?</strong> to see why it works, with honest evidence labels.</li>
        <li>🎭 Tap the mask up top to switch mythology.</li>
      </ul>
      <div class="sheet-actions">
        <button class="btn ghost" data-act="nav" data-view="settings">Choose my anchors</button>
        <button class="btn" data-act="sheet-close">Let’s begin</button>
      </div>`);
  }

  function boot(isReset) {
    S = Store.state;
    today = D.key();
    reviewWeek = null;
    const day = startOfDay();
    recompute();
    refresh();
    applyTheme();

    // gentle automatic phase unlock
    const pc = phaseCheck();
    if (S.settings.autoUnlock && pc.ready && S.settings.phase < MAX_PHASE && !S.settings.viewFull) unlockPhase(false);

    if (day.comeback) {
      hero.setMood('sleepy');
      say(line('sleepy'));
      setTimeout(() => { hero.setMood('hopeful'); say(line('comeback')); }, 2600);
    } else if (day.tokenUsed && !S.flags.notices['token-' + today]) {
      S.flags.notices['token-' + today] = true; save();
      say(line('tokenSaved'));
      toast('🛡️ A rest token protected your streak yesterday');
    } else {
      hero.setMood(greetingKind() === 'night' && new Date().getHours() >= 22 ? 'sleepy' : 'idle');
      say(line(greetingKind()));
    }

    checkBadges();
    updateMascots();
    const hv = location.hash.slice(1);
    view = isReset ? 'today' : (['today', 'review', 'insights', 'wins', 'mascot', 'settings'].includes(hv) ? hv : 'today');
    render();
    if (!S.flags.welcomed) { S.flags.welcomed = true; save(); welcome(); }
  }

  // ---------- start ----------
  Store.load();
  S = Store.state;
  hero = Mascot.create($('#heroCanvas'));
  boot(false);

  // Keep the day/night shift and the date fresh while the page stays open.
  let lastPart = daypart();
  setInterval(() => {
    if (D.key() !== today) { boot(false); return; }
    const dp = daypart();
    if (dp !== lastPart) { lastPart = dp; applyTheme(); }
  }, 60 * 1000);
})();
