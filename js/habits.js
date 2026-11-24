/* =====================================================================
   HABITS, PHASES & BADGES  —  your starting routine.
   ---------------------------------------------------------------------
   These are only the DEFAULTS used the first time the site opens.
   After that, edit habits inside the app (Settings → Habits); your
   edits are saved in your browser and in your Export file.

   Habit fields:
     id      unique short name (letters, no spaces). Never change it once
             you have history, or old ticks will be orphaned.
     name    what you see
     emoji   icon
     section 'flow'   = ordered morning flow (with the phone gate)
             'daily'  = daily habits, grouped by `time`
             'weekly' = weekly targets with progress rings (`target`)
             'other'  = your custom "other good habits"
     time    'morning' | 'afternoon' | 'evening' | 'night'
     phase   1–5: the phase in which the habit appears
     wisdom  which entry in js/wisdom.js to show on the "Why it works" card
     gate    true = locked until every earlier flow step is ticked
     extra   'study' | 'article' | 'home' | 'journal'  = adds a little input box
             ('study' and 'article' feed the Learning charts on Insights)
   ===================================================================== */

const MAX_PHASE = 5;

const DEFAULT_HABITS = [
  // ---------- Morning flow (order matters!) ----------
  { id: 'wake',      name: 'Wake up early',          emoji: '🌅', section: 'flow', time: 'morning', phase: 1, wisdom: 'wake' },
  { id: 'noscreens', name: 'No screens (yet)',       emoji: '📵', section: 'flow', time: 'morning', phase: 3, wisdom: 'noscreens' },
  { id: 'meditate',  name: 'Meditation',             emoji: '🧘', section: 'flow', time: 'morning', phase: 3, wisdom: 'meditate' },
  { id: 'yoga',      name: 'Yoga / stretching',      emoji: '🤸', section: 'flow', time: 'morning', phase: 4, wisdom: 'yoga' },
  { id: 'lemon',     name: 'Lemon water',            emoji: '🍋', section: 'flow', time: 'morning', phase: 2, wisdom: 'lemon' },
  { id: 'journal',   name: 'Journal',                emoji: '📓', section: 'flow', time: 'morning', phase: 1, wisdom: 'journal', extra: 'journal' },
  { id: 'plan',      name: 'Plan the day',           emoji: '🗓️', section: 'flow', time: 'morning', phase: 2, wisdom: 'plan' },
  { id: 'phone',     name: 'Phone time (earned!)',   emoji: '📱', section: 'flow', time: 'morning', phase: 2, wisdom: 'phone', gate: true },

  // ---------- Daily ----------
  { id: 'skin_am',   name: 'Skincare (morning)',     emoji: '🧴', section: 'daily', time: 'morning',   phase: 3, wisdom: 'skin_am' },
  { id: 'brunch',    name: 'Make brunch',            emoji: '🍳', section: 'daily', time: 'morning',   phase: 3, wisdom: 'brunch' },
  { id: 'study',     name: 'Study session',          emoji: '📚', section: 'daily', time: 'afternoon', phase: 1, wisdom: 'study', extra: 'study' },
  { id: 'class',     name: 'Attend class',           emoji: '🎓', section: 'daily', time: 'afternoon', phase: 4, wisdom: 'class' },
  { id: 'article',   name: 'Read a random article',  emoji: '📰', section: 'daily', time: 'afternoon', phase: 4, wisdom: 'article', extra: 'article' },
  { id: 'snack',     name: 'A nourishing snack',     emoji: '🍎', section: 'daily', time: 'afternoon', phase: 4, wisdom: 'snack' },
  { id: 'walk',      name: 'Walk or jog',            emoji: '🚶', section: 'daily', time: 'evening',   phase: 2, wisdom: 'walk' },
  { id: 'productive',name: 'One more productive block', emoji: '⏱️', section: 'daily', time: 'evening', phase: 5, wisdom: 'productive' },
  { id: 'unwind',    name: 'Unwind',                 emoji: '🎧', section: 'daily', time: 'evening',   phase: 4, wisdom: 'unwind' },
  { id: 'skin_pm',   name: 'Skincare (night)',       emoji: '🌙', section: 'daily', time: 'night',     phase: 3, wisdom: 'skin_pm' },
  { id: 'castor',    name: 'Castor oil on lashes',   emoji: '👁️', section: 'daily', time: 'night',     phase: 5, wisdom: 'castor' },
  { id: 'readbed',   name: 'Read before bed',        emoji: '📖', section: 'daily', time: 'night',     phase: 2, wisdom: 'readbed' },

  // ---------- Weekly targets ----------
  { id: 'paint',     name: 'Paint',                  emoji: '🎨', section: 'weekly', target: 2, phase: 5, wisdom: 'paint' },
  { id: 'clean',     name: 'Clean my room',          emoji: '🧹', section: 'weekly', target: 2, phase: 5, wisdom: 'clean' },
  { id: 'gym',       name: 'Gym',                    emoji: '🏋️', section: 'weekly', target: 2, phase: 4, wisdom: 'gym' },
  { id: 'jog',       name: 'Jog session',            emoji: '🏃', section: 'weekly', target: 2, phase: 5, wisdom: 'jog' },
  { id: 'laundry',   name: 'Laundry done',           emoji: '🧺', section: 'weekly', target: 1, phase: 4, wisdom: 'laundry' },
  { id: 'home',      name: 'Message someone from home', emoji: '💌', section: 'weekly', target: 2, phase: 3, wisdom: 'home', extra: 'home' },

  // ---------- Other good habits (customise me!) ----------
  { id: 'other1',    name: 'Other good habit (tap Settings to rename)', emoji: '✨', section: 'other', time: 'evening', phase: 5, wisdom: 'other' }
];

/* Short descriptions shown when a phase unlocks. */
const PHASE_INFO = {
  1: { title: 'Phase 1 · The Anchors',  blurb: 'Just three anchor habits. That’s it. Make them feel easy.' },
  2: { title: 'Phase 2 · The Rhythm',   blurb: 'A gentle morning flow, a walk and a bedtime book join in.' },
  3: { title: 'Phase 3 · The Care',     blurb: 'Screen-free mornings, meditation, skincare, brunch and calls home.' },
  4: { title: 'Phase 4 · The Stretch',  blurb: 'Yoga, class, curiosity, snacks, unwinding and the gym.' },
  5: { title: 'Phase 5 · Full Routine', blurb: 'Painting, cleaning, jogging, lashes and your custom habits. Everything!' }
};

/* =====================================================================
   BADGES  —  `test` receives a stats object (see App.stats() in app.js)
   `accessory` = the mascot accessory unlocked with the badge.
   ===================================================================== */
const BADGES = [
  { id: 'first-light',  icon: '🌤️', name: 'First Light',       desc: 'Tick your very first habit.',               test: s => s.totalChecks >= 1 },
  { id: 'dawn-keeper',  icon: '🌅', name: 'Dawn Keeper',       desc: 'Wake up early 7 times.',                    test: s => s.wake >= 7, accessory: 'star' },
  { id: 'seven-suns',   icon: '☀️', name: 'Seven Suns',        desc: 'Reach a 7-day streak.',                     test: s => s.best >= 7, accessory: 'crown' },
  { id: 'full-moon',    icon: '🌕', name: 'Full Moon',         desc: 'Reach a 28-day streak.',                    test: s => s.best >= 28 },
  { id: 'perfect',      icon: '🎼', name: 'Perfect Harmony',   desc: 'Complete every visible daily habit in a day.', test: s => s.perfectDays >= 1, accessory: 'flower' },
  { id: 'brush',        icon: '🎨', name: 'Brush and Palette', desc: 'Hit your painting target in a week.',      test: s => s.paintWeek, accessory: 'brush' },
  { id: 'lamp-reader',  icon: '📖', name: 'Lamp-Lit Reader',   desc: 'Read before bed 7 times.',                  test: s => s.read >= 7, accessory: 'book' },
  { id: 'curious',      icon: '🧠', name: 'Curious Mind',      desc: 'Log 10 things you learned from articles.',  test: s => s.articles >= 10 },
  { id: 'polymath',     icon: '🧭', name: 'Polymath',          desc: 'Log study in 5 different subjects.',        test: s => s.subjects >= 5 },
  { id: 'ten-hours',    icon: '⏳', name: 'Ten Quiet Hours',   desc: 'Log 10 hours of study in total.',           test: s => s.studyMinutes >= 600 },
  { id: 'letters-home', icon: '💌', name: 'Letters Home',      desc: 'Reach out to someone from home 5 times.',   test: s => s.home >= 5 },
  { id: 'scribe',       icon: '🪶', name: 'Scribe of Wins',    desc: 'Save 10 wins or gratitudes.',               test: s => s.wins >= 10 },
  { id: 'night-watch',  icon: '🌙', name: 'Night Watch',       desc: 'Log your sleep 7 times.',                   test: s => s.sleepLogs >= 7 },
  { id: 'iron-will',    icon: '🏋️', name: 'Iron Will',         desc: 'Go to the gym 8 times.',                    test: s => s.gym >= 8 },
  { id: 'clean-sweep',  icon: '🧹', name: 'Clean Sweep',       desc: 'Hit your room-cleaning target in a week.',  test: s => s.cleanWeek },
  { id: 'phoenix',      icon: '🔥', name: 'Phoenix Rising',    desc: 'Come back after a missed day. Kindness wins.', test: s => s.comebacks >= 1 },
  { id: 'new-chapter',  icon: '📜', name: 'New Chapter',       desc: 'Unlock Phase 2.',                           test: s => s.phase >= 2, accessory: 'garland' },
  { id: 'halfway',      icon: '🌿', name: 'Halfway Hero',      desc: 'Unlock Phase 3.',                           test: s => s.phase >= 3 },
  { id: 'full-routine', icon: '👑', name: 'Full Routine',      desc: 'Unlock Phase 5.',                           test: s => s.phase >= 5 },
  { id: 'reflector',    icon: '🪞', name: 'Reflector',         desc: 'Complete a weekly review.',                 test: s => s.reviews >= 1 }
];
