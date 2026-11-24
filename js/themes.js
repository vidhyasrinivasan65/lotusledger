/* =====================================================================
   THEMES  —  every mythology is one config object.
   ---------------------------------------------------------------------
   To add a theme: copy one block below, give it a new `id`, change the
   colours, mascot drawing, lines and decorations, and it appears
   automatically in the theme switcher. Nothing else needs to change.

   Mascot cheat-sheet:
     - mascot.draw(k, st) paints the character on a 100 x 100 stage
       (x left→right, y top→bottom, ground at y = 90). Shapes are SVG
       path strings, so you can sketch in any vector app and paste the
       path. `k` is the drawing kit described at the top of js/mascot.js.
     - Use k.eye(...) for eyes: blinking, sleepy, happy squints and
       looking around are handled for you via `st`.
     - st.flap (0..1) lets wings/ears lift when the mascot cheers.
     - mascot.outline : the outline colour for every shape
     - mascot.anchors : [x, y] spots where accessories sit
                        (head = crown, neck = garland, side = flower,
                         hand = brush / book, chest = star)
   Speech lines can use {name}, {habit}, {n}, {phase}, {badge}.
   ===================================================================== */

const THEMES = {

  /* ------------------------------------------------------------------ */
  greek: {
    id: 'greek',
    label: 'Greek',
    siteName: 'Laurel Ledger',
    ornament: '❦',
    tagline: 'Marble, gold and the wisdom of Athena',
    fonts: { display: "'Cinzel', Georgia, serif" },
    day: {
      bg: '#f7f3ea', surface: '#fffdf8', surface2: '#efe8d9', ink: '#2a2620', muted: '#5f5647',
      accent: '#9a6f12', accentInk: '#7a5609', accent2: '#2f6487', gold: '#c9a227', good: '#4f7a3a', onAccent: '#ffffff'
    },
    night: {
      bg: '#181d2b', surface: '#222839', surface2: '#2d3449', ink: '#f1ead8', muted: '#bcb39e',
      accent: '#d9b24c', accentInk: '#e8c86e', accent2: '#8fb7d6', gold: '#e2bf55', good: '#9cc17f', onAccent: '#181d2b'
    },
    sky: { dawn: '#f6d9c4', day: '#eaf1f6', dusk: '#f0c9a0', night: '#0e1220' },
    decor: {
      // Greek key (meander) strip
      border: p => `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='16' viewBox='0 0 28 16'><g fill='none' stroke='${p.gold}' stroke-width='2'><path d='M0 15H28M0 1H28'/><path d='M4 15V5H18V12H10V8H14'/></g></svg>`,
      // faint marble veins
      pattern: p => `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><g fill='none' stroke='${p.ink}' stroke-opacity='0.05'><path d='M0 50 Q50 20 110 60 T220 40'/><path d='M0 160 Q70 120 130 170 T220 150'/><path d='M60 0 Q80 90 40 220' stroke-opacity='0.03'/></g></svg>`
    },
    mascot: {
      name: 'Olive',
      species: 'little owl of Athena',
      glow: 'rgba(217,178,76,0.38)',
      outline: '#4a3b2a',
      // A round little owl with big golden eyes, brows and rosy cheeks.
      draw(k, st) {
        const body = '#b89a6e', wing = '#8f7651', cream = '#f4ecd9', disc = '#ebdfc4', gold = '#e0962f';
        k.shape('M31 44 L25 24 L41 35 Z', body);                       // ear tufts
        k.shape('M69 44 L75 24 L59 35 Z', body);
        k.ellipse(42, 89, 5, 3, gold);                                 // feet
        k.ellipse(58, 89, 5, 3, gold);
        k.rotate(30, 60, -st.flap * 0.9, () => k.ellipse(23, 68, 7, 15, wing, { rot: -0.25 }));   // wings flap up when cheering
        k.rotate(70, 60, st.flap * 0.9, () => k.ellipse(77, 68, 7, 15, wing, { rot: 0.25 }));
        k.ellipse(50, 62, 26, 27, body);                               // body
        k.ellipse(50, 74, 16, 12, cream, { stroke: false });           // belly
        k.line('M43 71 l2.5 2.5 l2.5 -2.5 M52 71 l2.5 2.5 l2.5 -2.5 M47.5 77 l2.5 2.5 l2.5 -2.5', '#c9b08a', 1.4);
        k.circle(39, 51, 12, disc, { lw: 1.4 });                       // facial discs
        k.circle(61, 51, 12, disc, { lw: 1.4 });
        k.eye(39, 52, 8, st, { iris: '#f2c94c', pupil: '#1f1a14' });
        k.eye(61, 52, 8, st, { iris: '#f2c94c', pupil: '#1f1a14' });
        k.line('M30 40 Q38 36 46 41 M54 41 Q62 36 70 40', '#4a3b2a', 2);  // brows
        k.blush(29, 62, 3.4);
        k.blush(71, 62, 3.4);
        k.shape(st.eyes === 'happy' ? 'M45.5 59 L54.5 59 L50 68.5 Z' : 'M46 59 L54 59 L50 66 Z', gold, { lw: 1.8 });   // beak
      },
      anchors: { head: [50, 31], neck: [50, 66], side: [68, 33], hand: [79, 72], chest: [50, 80] },
      stageNames: ['Owlet in the olive tree', 'Fledgling of the Agora', 'Owl of Athena', 'Owl of the Parthenon', 'Radiant Olive of Athena']
    },
    accessoryColors: {
      crown: { a: '#5f8a3a', b: '#c9a227', style: 'wreath' }, garland: { a: '#7a9a4a', b: '#f4efe2' },
      flower: { a: '#f3e9f7', b: '#d4a531' }, book: { a: '#efe1bf', b: '#8b5a2b' }, star: { a: '#ffd54f', b: '#fff3b0' }
    },
    accessoryNames: { crown: 'Laurel wreath', garland: 'Olive garland', flower: 'Asphodel bloom', brush: 'Fresco brush', book: 'Scroll of Athena', star: 'Star of Olympus' },
    lines: {
      morning: ['Kalimera, {name}! Rosy-fingered Dawn is already up. Shall we?', 'The agora is quiet and the light is golden. Perfect hour for one small good thing.', 'Hoo! Athena says: wisdom starts with getting out of bed. Mostly.', 'A new day on the ledger, {name}. Blank papyrus, sharp quill.'],
      afternoon: ['Afternoon, {name}. Even Heracles took his labours one at a time.', 'The sun is high over the Acropolis. What shall we tick next?', 'Hoo-hoo, steady progress is very Athenian of you.'],
      evening: ['Evening, {name}. The olive trees are rustling. Time to wind down gently.', 'Golden hour! A fine moment for a walk, a book or a brush.', 'The day is nearly written. Let us finish the page kindly.'],
      night: ['Nyx has drawn her cloak. Lashes, skincare, a book, then sleep.', 'Owls are night creatures, but you are not. To bed soon, {name}!', 'Hoo... the stars are out. Early bed means an early, glorious dawn.'],
      checkoff: ['A laurel leaf for you!', 'Nike approves. Quietly. With wings.', 'Hoo! That one goes in the ledger, in gold ink.', 'Athena nods. That is high praise; she rarely nods.', 'Another column raised on your Parthenon.', 'Kalo! Well done, {name}.'],
      card: ['Athena would file "{habit}" under wisdom. So will I.', 'An owl never forgets: {habit}, done.', 'Even the philosophers in the Stoa would approve of {habit}.', 'Hoo! {habit} is a small labour with a big reward.', 'Socrates said to know thyself. You know thyself does {habit}.', 'One more drachma in the treasury of good habits.'],
      gate: ['The gates of Olympus open! Your phone is unlocked. Go gently.', 'Morning flow complete! Hermes delivers your phone, with ceremony.'],
      gateLocked: ['Patience, hero! Finish the steps above and the gate swings open.', 'The phone stays in the temple until the morning rites are done.'],
      perfect: ['A perfect day! Somewhere on Olympus a golden star is being forged.', 'Every habit, every one! The Muses are writing an ode.', 'Nike herself just landed on your shoulder. Perfect day!'],
      comeback: ['Odysseus took ten years to get home. A day or two? Nothing. Welcome back!', 'The owl kept your seat warm. Shall we start small?', 'Heroes stumble in every myth. The good ones come back. Hello again!'],
      sleepy: ['Hoo... *yawn*... oh! You are here!', 'I was napping on the Parthenon roof. Did I miss you? I did.'],
      hopeful: ['Shall we pick just one habit to begin? I believe in you.', 'One tick today and the ledger glows again.'],
      milestone: ['{n} days! Even the Oracle did not see this coming.', 'A {n}-day streak! Carve it into marble.', '{n} days strong. Achilles could never; his heel would have hurt.'],
      phaseUp: ['Phase {phase} unlocked! I feel taller. Is that a feather?', 'New habits enter the agora. Welcome them one at a time.'],
      badge: ['A new honour: {badge}! I shall wear it proudly.', '{badge}! The Olympians are taking notes.'],
      reflectGreat: ['What a week! You moved like a trireme with every oar in time.', 'A week worthy of a statue. Small, tasteful, in the garden.'],
      reflectOk: ['A solid week. Not every day needs to be an epic; some are just good verses.', 'Some days soared, some rested. That is the rhythm of a real life.'],
      reflectGentle: ['A quieter week. Even Athena has days in the library doing nothing. Next week, one small thing.', 'You came back to reflect, and that counts. The ledger is patient.'],
      poke: ['Hoo?', 'That tickles!', 'Yes? I am very wise. Ask me anything.', 'Feathers, please. Mind the feathers.'],
      tokenSaved: ['Your rest token shielded your streak. Even gods rest on the seventh day... that is a different myth, but still.']
    }
  },

  /* ------------------------------------------------------------------ */
  indian: {
    id: 'indian',
    label: 'Indian',
    siteName: 'Lotus Ledger',
    ornament: '✺',
    tagline: 'Jewel tones, temple borders and Saraswati’s swan',
    fonts: { display: "'Yatra One', Georgia, serif" },
    day: {
      bg: '#fbf1e1', surface: '#fffaf1', surface2: '#f5e2c3', ink: '#2b1420', muted: '#674447',
      accent: '#a5123a', accentInk: '#8d0f31', accent2: '#0f6b6b', gold: '#c8961e', good: '#2f7d32', onAccent: '#ffffff'
    },
    night: {
      bg: '#1a0f24', surface: '#26163a', surface2: '#33204d', ink: '#fbeedd', muted: '#d2bcae',
      accent: '#f0597a', accentInk: '#ff8eaa', accent2: '#3fc1c0', gold: '#e8b84a', good: '#7fd08a', onAccent: '#1a0f24'
    },
    sky: { dawn: '#ffd9b0', day: '#fdebd0', dusk: '#f7b67a', night: '#120a1c' },
    decor: {
      // temple-gopuram triangles with gold bindus
      border: p => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='16' viewBox='0 0 20 16'><path d='M0 16L10 5L20 16Z' fill='${p.accent}'/><circle cx='10' cy='2.6' r='2' fill='${p.gold}'/><circle cx='0' cy='11' r='1.6' fill='${p.accent2}'/><circle cx='20' cy='11' r='1.6' fill='${p.accent2}'/><path d='M0 15.5H20' stroke='${p.gold}'/></svg>`,
      // kolam dots and petals
      pattern: p => `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><circle cx='22' cy='22' r='1.7' fill='${p.accent}' fill-opacity='0.13'/><path d='M22 9 Q34 22 22 35 Q10 22 22 9Z' fill='none' stroke='${p.gold}' stroke-opacity='0.14'/><circle cx='0' cy='0' r='1.4' fill='${p.accent2}' fill-opacity='0.12'/><circle cx='44' cy='44' r='1.4' fill='${p.accent2}' fill-opacity='0.12'/></svg>`
    },
    mascot: {
      name: 'Hamsa',
      species: 'swan of Saraswati',
      glow: 'rgba(232,184,74,0.42)',
      outline: '#3b2346',
      // A graceful swan with an S-curved neck, gliding on a lotus pond.
      draw(k, st) {
        const white = '#fffaf0', wing = '#efe4cc', beak = '#e2621b';
        k.ellipse(50, 90, 40, 4.5, 'rgba(31,138,138,0.35)', { stroke: false });   // pond
        k.line('M14 92 Q20 90 26 92 M72 93 Q79 91 86 93', '#1f8a8a', 1.4);
        const neck = 'M37 74 C27 62 27 50 34 42 C41 34 41 28 33 22';
        k.line(neck, k.outline, 9 + k.lw * 2);                         // neck outline
        k.circle(32, 21, 9, white);                                    // head
        k.line(neck, white, 9);                                        // neck fill (hides the seam)
        k.circle(32, 21, 7.9, white, { stroke: false });
        k.shape('M24 78 C22 66 34 60 50 62 C64 63 76 58 84 45 C91 60 86 82 64 86 L36 86 C28 86 25 83 24 78 Z', white);   // body
        k.rotate(44, 68, -st.flap * 0.5, () => {                       // wing
          k.shape('M40 70 C48 61 66 60 79 64 C72 76 54 80 40 70 Z', wing);
          k.line('M52 70 Q60 67.5 69 67.5 M50 74 Q58 73 66 72', '#cdbf9f', 1.3);
        });
        k.shape(st.eyes === 'happy' ? 'M24.5 18 L12 20.5 L14 25.5 L24.5 26 Z' : 'M24.5 18.5 L13 22.5 L24.5 26 Z', beak, { lw: 1.8 });
        k.circle(25.5, 20.5, 2.2, '#2b1a2e', { stroke: false });
        k.eye(33, 19, 4.8, st, { iris: '#3b2346', pupil: '#120a14' });
        k.line('M30 13.5 Q33.5 12 37 14', k.outline, 1.4);              // brow
        k.blush(35.5, 26, 2.2);
      },
      anchors: { head: [32, 12], neck: [33, 46], side: [40, 14], hand: [72, 56], chest: [56, 73] },
      stageNames: ['Cygnet of the lotus pond', 'Young Hamsa', 'Swan of the Veena', 'Swan of Manasarovar', 'Radiant Hamsa of Saraswati']
    },
    accessoryColors: {
      crown: { a: '#d9a21b', b: '#c2185b' }, garland: { a: '#fbfbf2', b: '#f4a261' },
      flower: { a: '#f48fb1', b: '#ffd54f' }, book: { a: '#d9b56b', b: '#7a4b1f' }, star: { a: '#ffd54f', b: '#fff3b0' }
    },
    accessoryNames: { crown: 'Golden kireetam', garland: 'Malli-poo garland', flower: 'Pink lotus', brush: 'Ravi Varma brush', book: 'Palm-leaf manuscript', star: 'Kolam star' },
    lines: {
      morning: ['Vanakkam, {name}! The veena is tuned and the day is fresh.', 'Suprabhatam! Even the temple bells are up before the city.', 'Good morning, kanna! Filter-coffee energy, but make it lemon water.', 'Brahma muhurtham vibes. Let’s begin softly.'],
      afternoon: ['Afternoon, {name}! Like a slow-cooked sambar, good things take time.', 'Halfway through the day. Saraswati is watching your study session with great interest.', 'Keep flowing, like the Kaveri.'],
      evening: ['Evening, {name}. Light a small lamp in your mind and wind down.', 'Sandhya time. A walk, a call home, a little art?', 'The day is almost a full kolam. A few dots left.'],
      night: ['Rest now. Even Vishnu naps on Adishesha.', 'Castor oil, skincare, a book, then sleep. Paati would approve.', 'Night has come. The early bird needs an early pillow, kanna.'],
      checkoff: ['Like the hamsa separating milk from water, you picked the good thing!', 'Sabash! Well done!', 'Super, {name}! One more lamp lit.', 'Amma would tell the whole street about this.', 'A jasmine flower for your garland!', 'Pakka! Perfectly done.'],
      card: ['Saraswati smiles on "{habit}". So do I.', 'The hamsa approves of {habit}: discerning choice!', 'Even Murugan’s peacock would dance for {habit}.', '{habit}: small offering, big blessing.', 'Paati wisdom and science agree on {habit}. Mostly!', 'One more bead on your japa mala of habits.'],
      gate: ['The temple doors open! Your phone is unlocked. Go peacefully.', 'Morning rituals complete! The phone is your prasadam now.'],
      gateLocked: ['Ah ah, not yet! Finish the morning rituals first, kanna.', 'The phone is waiting outside the temple. Rituals first!'],
      perfect: ['Ayyo, a perfect day! Light all the lamps!', 'Every habit done! This is a Deepavali-level day.', 'Perfect day! The whole Navagraha is aligned in your favour.'],
      comeback: ['Even the moon wanes and returns full. Welcome back, kanna.', 'The Ganga doesn’t stop because of one rock. Neither do you.', 'You’re here! Come, sit. We start small, no pressure.'],
      sleepy: ['*yawn* ...I was floating on the lake. Oh, you’re back!', 'Hmm? I dozed off on a lotus leaf. Welcome!'],
      hopeful: ['Just one habit today? That’s how every kolam begins: one dot.', 'Shall we light just one lamp today?'],
      milestone: ['{n} days! Amma would be proud, and she’d tell the whole family WhatsApp group.', '{n}-day streak! This deserves payasam.', '{n} days! Your discipline is giving Arjuna.'],
      phaseUp: ['Phase {phase} unlocked! My feathers are getting shinier.', 'New habits join the procession. Welcome them slowly.'],
      badge: ['New honour: {badge}! I’ll wear it to the temple festival.', '{badge}! Gold-bordered certificate energy.'],
      reflectGreat: ['What a week! Steady as the Thanjavur temple tower.', 'A week full of lamps. Saraswati is pleased.'],
      reflectOk: ['A good week, with some rest. Even the Kaveri flows slow and fast.', 'Not perfect, but very real. That’s the best kind.'],
      reflectGentle: ['A quiet week, kanna. That’s okay. Next week we plant one seed.', 'You came back to reflect, and that is already dharma.'],
      poke: ['Aiyo, that tickles!', 'Yes, kanna?', '*happy swan noises*', 'Careful with my crown feathers!'],
      tokenSaved: ['Your rest token protected your streak. Rest is also sadhana.']
    }
  },

  /* ------------------------------------------------------------------ */
  norse: {
    id: 'norse',
    label: 'Norse',
    siteName: 'Rune Ledger',
    ornament: 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ',
    tagline: 'Ravens, runes and northern light',
    fonts: { display: "'Pirata One', Georgia, serif" },
    day: {
      bg: '#eef1f2', surface: '#fbfcfc', surface2: '#dfe5e8', ink: '#1c2329', muted: '#4f5c66',
      accent: '#2f5d7c', accentInk: '#24506d', accent2: '#8a3b2e', gold: '#a8843a', good: '#3d7a5a', onAccent: '#ffffff'
    },
    night: {
      bg: '#0f1418', surface: '#182026', surface2: '#212b33', ink: '#e6edf1', muted: '#a3b3bd',
      accent: '#79b4d9', accentInk: '#93c7e9', accent2: '#e08a72', gold: '#d6b25e', good: '#6fd3a8', onAccent: '#0f1418'
    },
    sky: { dawn: '#d9dfe8', day: '#e3edf2', dusk: '#c9b8c9', night: '#0a1a1a' },
    decor: {
      // interlaced zig-zag knotwork
      border: p => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'><g fill='none' stroke-width='2'><path d='M0 4L6 12L12 4L18 12L24 4' stroke='${p.accent}'/><path d='M0 12L6 4L12 12L18 4L24 12' stroke='${p.gold}'/></g></svg>`,
      // drifting snow flecks
      pattern: p => `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'><g stroke='${p.accent}' stroke-opacity='0.12'><path d='M12 10l4 4m0-4l-4 4'/><path d='M50 40l3 3m0-3l-3 3'/><path d='M30 58l3 3m0-3l-3 3'/></g></svg>`
    },
    mascot: {
      name: 'Runa',
      species: 'raven of runes and memory',
      glow: 'rgba(121,180,217,0.38)',
      outline: '#07090d',
      // A cheeky raven perched on an ash branch, one brow raised.
      draw(k, st) {
        const body = '#2b3445', sheen = '#44608a', beak = '#8a93a0';
        k.thick('M8 87 Q50 83 92 86', '#6b4a2f', 4);                       // branch
        k.shape('M80 85 q6 -6 10 -3 q-3 5 -10 3 Z', '#5fa84a', { lw: 1.2 });   // leaf
        k.line('M42 79 L41 86 M51 80 L51 86', beak, 2.6);                  // feet
        k.shape('M31 70 L11 82 L17 86 L36 77 Z', body);                    // tail
        k.ellipse(46, 64, 22, 18, body, { rot: -0.3 });                    // body
        k.rotate(32, 60, -st.flap * 0.8, () => {                           // wing
          k.shape('M30 58 C42 50 60 55 64 66 C54 76 38 78 28 70 Z', sheen);
          k.line('M36 66 Q45 64 54 68 M34 70 Q42 70 50 72', body, 1.3);
        });
        k.circle(62, 40, 14, body);                                        // head
        k.line('M57 27 Q58 19 63 23 Q64 17 68 24', k.outline, 2);          // head tuft
        if (st.eyes === 'happy') {                                         // beak opens with joy
          k.shape('M73 34 C80 34 88 38 91 41 L74 42 Z', beak, { lw: 1.8 });
          k.shape('M74 44 L88 46 C83 49 78 50 73 48 Z', beak, { lw: 1.8 });
        } else {
          k.shape('M72 35 C80 36 88 40 91 43 C86 45 79 47 72 47 Z', beak, { lw: 1.8 });
          k.line('M75 42 L86 43', '#5b6470', 1.2);
        }
        k.eye(64, 38, 6.2, st, { iris: '#5d7fa8', pupil: '#05070a' });
        k.line('M56 29 Q63 26 70 30.5', '#9fb3cc', 1.8);                   // one raised brow
        k.blush(58, 48, 2.8, 'rgba(255,150,170,0.45)');
      },
      anchors: { head: [62, 25], neck: [58, 53], side: [51, 30], hand: [22, 62], chest: [47, 72] },
      stageNames: ['Hatchling of Yggdrasil', 'Fledgling of Asgard', 'Raven of Memory', 'Raven of the High Seat', 'Radiant Runa']
    },
    accessoryColors: {
      crown: { a: '#b8c3cc', b: '#5fb3d9' }, garland: { a: '#8c5a3c', b: '#e3d5c0' },
      flower: { a: '#d6ecff', b: '#ffffff' }, book: { a: '#7a5233', b: '#e3d5c0' }, star: { a: '#ffe08a', b: '#ffffff' }
    },
    accessoryNames: { crown: 'Rune circlet', garland: 'Fur mantle', flower: 'Frost flower', brush: 'Rune-carver’s brush', book: 'Book of sagas', star: 'North star' },
    lines: {
      morning: ['Hail, {name}! Sól rides her chariot. Up you get.', 'Kraa! Odin is already up, and he only has one eye open.', 'The mead hall is quiet. A fine hour for small deeds.', 'A new page of your saga, {name}. Let’s carve the first rune.'],
      afternoon: ['Afternoon, {name}. Even Thor eats a proper meal between battles.', 'The longship rows on. One oar stroke at a time.', 'Kraa! Progress noted in the memory-hoard.'],
      evening: ['Evening, {name}. The northern sky is turning violet.', 'Time to row the longship back to harbour.', 'A walk at dusk is a quiet kind of quest.'],
      night: ['Nótt rides her dark horse across the sky. Bed soon, {name}.', 'The ravens return to Odin at night. You return to your pillow.', 'Kraa... rune-reading, skincare, sleep. In that order.'],
      checkoff: ['I’ll carry this to Odin: you did the thing!', 'Kraa! Another rune carved.', 'Skål to that!', 'Worthy of a verse in the saga.', 'The Norns write it into your thread.', 'Well fought, {name}.'],
      card: ['Runa remembers: {habit}, done. I never forget.', 'Odin traded an eye for wisdom. You only had to do {habit}.', 'The Norns weave {habit} into your fate.', '{habit}: a small rune with big magic.', 'Even the giants of Jötunheim respect {habit}.', 'Into the memory-hoard goes {habit}.'],
      gate: ['The Bifröst opens! Your phone is unlocked. Cross wisely.', 'Morning saga complete! Heimdall lowers his horn: phone time.'],
      gateLocked: ['Heimdall guards this bridge. Finish the steps above first!', 'The phone sleeps in the longhouse until the morning rites are done.'],
      perfect: ['Skål! A perfect day, worthy of Valhalla’s mead hall!', 'Every rune carved! The skalds will sing of this.', 'A perfect day! Even Loki is impressed, and he is never impressed.'],
      comeback: ['The ravens fly far and still return each night. So did you.', 'Welcome back to the hall, {name}. The fire is still warm.', 'Even Thor loses his hammer sometimes. He always gets it back.'],
      sleepy: ['Kraaa... *yawn*... was I asleep in the World Tree?', 'Oh! I was dreaming of the ash tree. Welcome back.'],
      hopeful: ['One rune today. Just one. That’s how sagas start.', 'Shall we raise one small sail?'],
      milestone: ['{n} days! This streak deserves a saga. A short one, with feasting.', '{n}-day streak! Carve it on a runestone.', '{n} days! Valkyries are taking notes.'],
      phaseUp: ['Phase {phase}! My feathers have a new sheen.', 'New warriors join your longship. Welcome them aboard.'],
      badge: ['A new honour: {badge}! Fit for a jarl.', '{badge}! Odin nods from his high seat.'],
      reflectGreat: ['A mighty week! Your longship cut the waves clean.', 'The skalds have material for days.'],
      reflectOk: ['A steady week. Some winds fair, some calm. That’s sailing.', 'Good deeds and good rests. A balanced saga.'],
      reflectGentle: ['A quiet week in the longhouse. Winter teaches patience. One rune next week.', 'You came back to the hall to reflect. That is the bravest bit.'],
      poke: ['Kraa!', 'Don’t ruffle the feathers!', 'Yes? I remember everything, you know.', 'Shiny? Do you have shiny things?'],
      tokenSaved: ['Your rest token held the shield wall. Streak protected.']
    }
  },

  /* ------------------------------------------------------------------ */
  egyptian: {
    id: 'egyptian',
    label: 'Egyptian',
    siteName: 'Papyrus Ledger',
    ornament: '☥',
    tagline: 'Papyrus, lapis and Bastet’s blessing',
    fonts: { display: "'Marcellus', Georgia, serif" },
    day: {
      bg: '#f4e8cc', surface: '#fcf6e6', surface2: '#ead9b0', ink: '#2a1f12', muted: '#5f4d33',
      accent: '#1f5f8b', accentInk: '#1a537a', accent2: '#a84d24', gold: '#c99a2e', good: '#2a7d6f', onAccent: '#ffffff'
    },
    night: {
      bg: '#11182b', surface: '#1b2440', surface2: '#243055', ink: '#f3e7c9', muted: '#c6b791',
      accent: '#6fa8dc', accentInk: '#8dbde6', accent2: '#e88a5a', gold: '#e2b84b', good: '#5ccfb8', onAccent: '#11182b'
    },
    sky: { dawn: '#f6d3a0', day: '#f2e3bf', dusk: '#e9a46a', night: '#0a1020' },
    decor: {
      // usekh-collar colour bands
      border: p => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect width='4' height='13' rx='2' fill='${p.accent}'/><rect x='4' width='4' height='13' rx='2' fill='${p.gold}'/><rect x='8' width='4' height='13' rx='2' fill='${p.accent2}'/><rect x='12' width='4' height='13' rx='2' fill='${p.gold}'/><path d='M0 15H16' stroke='${p.gold}' stroke-width='2'/></svg>`,
      pattern: p => `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M24 8L30 24L24 40L18 24Z' fill='${p.gold}' fill-opacity='0.08'/></svg>`
    },
    mascot: {
      name: 'Cleo',
      species: 'temple cat of Bastet',
      glow: 'rgba(226,184,75,0.4)',
      outline: '#120f1c',
      // A sitting black temple cat with kohl-lined eyes, a gold collar and an earring.
      draw(k, st) {
        const fur = '#2f2c47', gold = '#d4a531', lapis = '#2a6fb0', pink = '#d48a94';
        k.thick('M66 84 C84 85 89 70 80 61', fur, 5);                      // tail
        k.shape('M31 89 C27 73 34 58 50 58 C66 58 73 73 69 89 Z', fur);    // body
        k.ellipse(43, 88.5, 6.5, 3.5, fur);                                // paws
        k.ellipse(57, 88.5, 6.5, 3.5, fur);
        k.rotate(39, 30, -st.flap * 0.25, () => {                          // ears perk up when cheering
          k.shape('M32 37 L31 15 L47 28 Z', fur);
          k.shape('M34.5 32 L34 21 L43 28.5 Z', pink, { stroke: false });
        });
        k.rotate(61, 30, st.flap * 0.25, () => {
          k.shape('M68 37 L69 15 L53 28 Z', fur);
          k.shape('M65.5 32 L66 21 L57 28.5 Z', pink, { stroke: false });
        });
        k.ellipse(50, 42, 21, 17, fur);                                    // head
        k.thick('M35 59 Q50 68 65 59', gold, 3.5);                         // collar
        k.circle(50, 65, 3.2, lapis, { lw: 1.4 });
        k.circle(67, 33, 2, gold, { lw: 1 });                              // earring
        k.eye(42, 42, 6.5, st, { iris: '#d9c84a', pupil: '#120f1c', full: true, slit: true });
        k.eye(58, 42, 6.5, st, { iris: '#d9c84a', pupil: '#120f1c', full: true, slit: true });
        k.line('M35.6 41.5 L30 38 M64.4 41.5 L70 38', k.outline, 2.2);     // kohl flicks
        k.shape('M48 49 L52 49 L50 51.5 Z', pink, { lw: 1 });              // nose
        if (st.eyes === 'happy') k.shape('M46.5 52.5 Q50 59 53.5 52.5 Z', '#b0475a', { lw: 1.3 });
        else k.line('M46.5 52.5 Q48.3 55 50 52.5 Q51.7 55 53.5 52.5', k.outline, 1.4);
        k.line('M38 49 L27 47 M38 51.5 L27 52.5 M62 49 L73 47 M62 51.5 L73 52.5', '#8f8ab0', 1);   // whiskers
        k.blush(37.5, 48.5, 2.6);
        k.blush(62.5, 48.5, 2.6);
      },
      anchors: { head: [50, 26], neck: [50, 62], side: [71, 20], hand: [77, 76], chest: [50, 77] },
      stageNames: ['Kitten of the reeds', 'Young Mau of the Nile', 'Temple cat', 'Guardian of Bubastis', 'Radiant Daughter of Ra']
    },
    accessoryColors: {
      crown: { a: '#d4a531', b: '#1f5f8b' }, garland: { a: '#1f5f8b', b: '#d4a531' },
      flower: { a: '#5c7cd6', b: '#ffd54f' }, book: { a: '#e9d6a6', b: '#8b5a2b' }, star: { a: '#ffd54f', b: '#fff3b0' }
    },
    accessoryNames: { crown: 'Gold circlet', garland: 'Usekh collar', flower: 'Blue lotus', brush: 'Scribe’s reed brush', book: 'Papyrus scroll', star: 'Star of Sopdet' },
    lines: {
      morning: ['Good morning, {name}! Ra’s boat has risen over the horizon.', 'Mrrow. The Nile is calm and the papyrus is blank.', 'The sun disc is up. So are we. Purr.', 'A new day for the scribe’s ledger, {name}.'],
      afternoon: ['Afternoon, {name}. Even cats get up from naps for important things.', 'The sun is high over the pyramids. Keep going, steadily.', 'Purr. The scribe records your progress.'],
      evening: ['Evening, {name}. The desert cools. Time for a gentle stroll.', 'Ra’s boat sinks to the west. Let’s finish the day kindly.', 'The temple lamps are being lit. Wind-down time.'],
      night: ['Ra sails through the night realm. You sail to bed.', 'Mrrp... the stars of Nut are out. Lashes, skincare, sleep.', 'A cat sleeps sixteen hours. You only need eight. Lucky.'],
      checkoff: ['The scribe records it: one more good deed on the papyrus.', 'Purr. Bastet approves (and would like a snack).', 'Mrrow! Well done, {name}.', 'Another stone placed on your pyramid.', 'Excellent! Your heart grows lighter than Ma’at’s feather.', 'Carved in limestone!'],
      card: ['Bastet blesses "{habit}". Purr.', 'Thoth, god of wisdom, would write {habit} in his best hieroglyphs.', '{habit}: approved by the Temple Cat Council.', 'Mrrp. {habit} is self-care, and cats are experts.', 'One more ankh of good health: {habit}.', 'The scribes add {habit} to the great papyrus.'],
      gate: ['The temple doors open! Phone unlocked. Use it like a wise scribe.', 'Morning rites complete! Your phone emerges from the tomb.'],
      gateLocked: ['The phone is sealed in the tomb until the morning rites are done!', 'Mrrow, not yet. Finish the steps above first.'],
      perfect: ['A perfect day! Carve it in limestone!', 'Every habit done! The whole pantheon purrs.', 'Perfect day! Even the Sphinx cracked a smile.'],
      comeback: ['Even the Nile has low seasons before the flood. Welcome back!', 'You’re back! I saved you a sunbeam.', 'Cats always come home. So did you. Purr.'],
      sleepy: ['Mrrrp... *stretch*... oh, it’s you!', 'I was napping in a sunbeam. Welcome back.'],
      hopeful: ['One tiny habit? Cats believe in small, satisfying wins.', 'Shall we begin with just one stone of the pyramid?'],
      milestone: ['{n} days! Your heart is lighter than Ma’at’s feather.', '{n}-day streak! Inscribe it on an obelisk.', '{n} days! Pharaoh-level consistency.'],
      phaseUp: ['Phase {phase}! My fur is shinier. Is that gold?', 'New habits join the procession along the Nile.'],
      badge: ['A new honour: {badge}! I’ll wear it in the temple.', '{badge}! The scribes are carving it now.'],
      reflectGreat: ['What a week! A pyramid of good days.', 'Purr-fect week. The Nile flooded with good habits.'],
      reflectOk: ['A good week. Some sun, some naps. Very cat.', 'Steady as the Nile. Good work.'],
      reflectGentle: ['A quiet week. Cats know rest is sacred. Next week, one small stone.', 'You came back to reflect. That alone is wise.'],
      poke: ['Mrrp!', 'Purr... a little to the left.', 'Do you have treats?', 'Hiss! Just kidding. Purr.'],
      tokenSaved: ['Your rest token guarded your streak like a temple cat. Purr.']
    }
  }
};
