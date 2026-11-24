# Laurel Ledger 🦉

A warm, mythology-themed habit ledger with an animated mascot that grows with you: Olive the owl (Greek), Hamsa the swan (Indian), Runa the raven (Norse) or Cleo the cat (Egyptian).
It's a single-page static site (HTML + CSS + vanilla JS, no backend, no build step).
Your data is saved in your browser (localStorage), and you can export or import a JSON backup.

> General wellness information, not medical advice.

## What's inside

```
laurel-ledger/
├── index.html        page shell (header, mascot, nav, footer)
├── css/style.css     all styling: mobile-first, day/night, reduced motion
└── js/
    ├── themes.js     ✏️ mythologies: colours, mascot drawing, speech lines, borders
    ├── habits.js     ✏️ default habits, phase descriptions, badges
    ├── wisdom.js     ✏️ "Why it works" content: benefits, nutrients, facts
    ├── mascot.js     mascot drawing kit and animation (canvas)
    ├── store.js      dates, saving/loading, export/import
    └── app.js        scoring, streaks, phases, all the screens
```

The ✏️ files are the ones you'll edit for content. You don't need to touch the others.

## Try it locally

Double-click `index.html`. It opens in your browser and works as it is.
(Data saved while it runs from a `file://` address is kept separately from your hosted site. Use Export/Import to move it across.)

## Host it on GitHub Pages (free)

1. Create a new **public** repository on GitHub, for example `laurel-ledger`.
2. Upload everything inside this folder (`index.html`, `css/`, `js/`, `README.md`) to the repository root.
   Either drag and drop with **Add file → Upload files**, or use git:
   ```bash
   git init
   git add .
   git commit -m "Laurel Ledger"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/laurel-ledger.git
   git push -u origin main
   ```
3. On GitHub, open **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/laurel-ledger/`.
5. On your phone, open that link and choose **Add to Home Screen** so it feels like an app.

**Your data:** it lives only in the browser you use. Go to **Settings → Export JSON** now and then (especially before you change phone or clear your browser). **Import JSON** restores everything.

## How it works (quick tour)

- **Today:** your habits grouped into the morning flow and the times of day, plus weekly rings. Shows the daily score, streak, rest token and level. The 📱 phone step stays locked until every earlier morning-flow step is ticked.
- **Why it works:** ticking a habit (or tapping its **?**) opens a card with benefits, nutrients for food and drink, a fun fact with an evidence label, and a line from the mascot. Cards rotate so you don't keep seeing the same one.
- **Phases:** Phase 1 shows your 3 anchors. After a week, the next phase unlocks automatically when your 7-day average reaches the threshold (70% by default), or you can unlock it yourself. The **Full routine** switch shows everything.
- **Forgiveness:** a day counts toward your streak at 50% (you can change this). You get one rest token per week, and it's only spent when it actually saves your streak. Missing a day starts a *comeback day* with bonus XP instead of guilt.
- **Review:** Sunday is review day. You see what went well, a reflection from the mascot, and you pick one thing to improve, which becomes next week's ⭐ focus.
- **Study log:** the 📚 Study session habit has a box for the subject, topic and minutes, and the 📰 article habit records the article, subject and what you learned. Logging ticks the habit for you. Subjects autocomplete, so "statistics" and "Statistics" count as one.
- **Insights:** a **Learning** card first, with 7, 14 or 30 days of study time per day coloured by subject. It shows how much your study time varies (steady, up and down, or in bursts, plus your usual range), your best weekday, your subject mix and a table view. Below that: a calendar heatmap, a sleep log with a bedtime/wake chart and trend line, and 30-day habit bars.
- **Wins:** your one-line journal entries, things you learned, your full study log and people you reached out to, all searchable.
- **Mascot:** stage, level, badges, accessories you've unlocked, and the theme switcher.

## Add a new fact ("Why it works" card)

Open `js/wisdom.js`, find the habit's section (e.g. `lemon:`), and add a line to its `entries` list:

```js
{ benefit: 'What it does for you, in plain words.',
  fact: 'A conversational summary of a real finding, describing the study type rather than authors or exact numbers.',
  evidence: 'moderate' },   // 'strong' | 'moderate' | 'early' | 'traditional-use'
```

Keep the house rules: only well-established findings, say plainly when evidence is thin, and no medical advice.
To add nutrients for a food or drink habit, add a `nutrients: [{ name: 'Vitamin C', why: '…' }]` list, as `lemon`, `brunch` and `snack` do.

## Add a habit

**The easy way:** in the app, go to **Settings → Habits → Add a habit**. You can also rename habits, change emoji, reorder them, delete them, or move them between phases and sections. Changes save straight away.

**As a default** (for a fresh install), add a line to `DEFAULT_HABITS` in `js/habits.js`:

```js
{ id: 'water', name: 'Drink water', emoji: '💧', section: 'daily', time: 'afternoon', phase: 2, wisdom: 'other' },
```

- `section`: `flow` (ordered morning flow), `daily`, `weekly` (add `target: 2`) or `other`
- `time`: `morning` · `afternoon` · `evening` · `night`
- `wisdom`: which `js/wisdom.js` entry to show. Add your own key there for custom facts.
- `extra`: optional `'article'`, `'home'` or `'journal'` adds the little input boxes.

Defaults only apply on first launch (or after **Reset**). After that, the in-app editor is the source of truth.

## Add a theme (mythology)

1. Open `js/themes.js` and copy a whole block, e.g. `egyptian: { … },`.
2. Give it a new key and `id` (e.g. `japanese`), a `label`, a `siteName` and an `ornament`.
3. Change the `day` and `night` palettes. Keep the text colour (`ink`) readable against `bg` and `surface`.
4. Change `decor.border` (the strip along the header and cards) and `decor.pattern` (the faint background). Both are small SVG strings.
5. Draw the mascot in its `draw(k, st)` function. You're painting on a 100 × 100 stage with the ground at y = 90. Shapes are SVG path strings (`k.shape('M30 40 L50 20 …', colour)`), plus `k.ellipse`, `k.circle` and `k.line`, all outlined in the `outline` colour. Use `k.eye(x, y, radius, st, { iris, pupil })` for eyes, and blinking, sleepy eyes, happy squints and glancing around come for free. Then place accessories with `anchors`. The four existing mascots are good examples to copy.
6. Write its `lines` (morning, checkoff, comeback, milestone and so on). `{name}`, `{habit}`, `{n}`, `{phase}` and `{badge}` are filled in for you.

Save and reload. The new theme appears in the 🎭 switcher and on the Mascot page automatically.

## Accessibility and comfort

- Mobile-first layout with large tap targets (44px or more) and visible keyboard focus.
- The mascot, the confetti and all transitions respect **prefers-reduced-motion**. In that mode, effects appear as still frames.
- The colours shift softly through dawn, day, dusk and night (or you can fix day or night in Settings).
