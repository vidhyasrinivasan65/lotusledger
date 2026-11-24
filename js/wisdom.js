/* =====================================================================
   THE "WHY IT WORKS" ENGINE  —  content for every habit card.
   ---------------------------------------------------------------------
   Each key matches a habit's `wisdom` field (see js/habits.js).

     nutrients : optional list of { name, why } for food & drink habits
     entries   : rotate one at a time, so you rarely see repeats.
                 { benefit, fact, evidence }
                 evidence = 'strong' | 'moderate' | 'early' | 'traditional-use'

   ADDING YOUR OWN: copy any { benefit, fact, evidence } line inside an
   `entries` list, paste it below, and edit the words. Done!

   ACCURACY HOUSE RULES (please keep them when you add entries):
     • only well-established findings; describe studies by type
       ("a randomised trial", "large observational studies") rather than
       inventing authors, years or exact numbers;
     • say clearly when evidence is thin or traditional;
     • no medical advice or diagnosis. This is general wellness info.
   ===================================================================== */

const WISDOM = {

  wake: {
    entries: [
      { benefit: 'A steady wake time sets your body’s master clock. Hunger, alertness, hormones and body temperature all run on it, so regular mornings feel less like a fight.',
        fact: 'Light is the strongest signal your internal clock listens to. Lab and field studies consistently show that morning daylight nudges the clock earlier, which tends to make you sleepy at a sensible hour that night. A few minutes on the balcony after waking genuinely helps tomorrow’s early start.', evidence: 'strong' },
      { benefit: 'Early hours are quiet hours: unhurried time for your routine before Singapore’s day gets loud.',
        fact: 'Large observational studies of sleep timing have found that irregular schedules (very different bed and wake times from day to day) are linked with poorer mood and health markers, even when total sleep is similar. Consistency seems to matter, not just hours.', evidence: 'moderate' },
      { benefit: 'Waking at a similar time on weekends too reduces “social jet lag”, that groggy Monday feeling of having changed time zones without leaving the island.',
        fact: 'Researchers coined “social jet lag” for the gap between weekday and weekend sleep timing. Survey studies across many countries link a bigger gap with more tiredness and lower mood. The fix is mostly keeping your weekend wake-up close to your weekday one.', evidence: 'moderate' },
      { benefit: 'Early rising is a win only when bedtime moves earlier too. The goal is enough sleep at a regular time, not less sleep.',
        fact: 'Sleep-restriction experiments show that cutting sleep short affects attention, memory and mood within days, and people are famously bad at noticing their own impairment. Protect the bedtime and the early wake-up gets easy.', evidence: 'strong' },
      { benefit: 'One decisive alarm tends to leave you clearer-headed than a string of snoozes.',
        fact: 'There’s limited research on snoozing, but small studies suggest that repeated alarms fragment the last, light stretch of sleep without adding much real rest. Setting one alarm for the real time is a kinder deal for your brain.', evidence: 'early' }
    ]
  },

  noscreens: {
    entries: [
      { benefit: 'Starting without your phone lets your own thoughts set the agenda before the world’s notifications do.',
        fact: 'Experiments on task-switching show a reliable “switch cost”: you’re slower and make more errors right after changing tasks. A screen-free first hour means fewer switches before you’ve even begun.', evidence: 'strong' },
      { benefit: 'Morning scrolling can drag your mood into other people’s news and highlights. A buffer protects your calm.',
        fact: 'In a field experiment, people asked to check email only a few times a day reported lower daily stress than when they checked constantly. Batching your attention seems kinder to the nervous system.', evidence: 'early' },
      { benefit: 'Your eyes get a gentler start: daylight and distance instead of a bright rectangle at arm’s length.',
        fact: 'Eye-care guidance on long near-work sessions recommends regular breaks to look at something far away, and studies suggest breaks reduce symptoms of digital eye strain. Gazing out of a window first thing is a lovely way to bank some distance time.', evidence: 'moderate' },
      { benefit: 'You notice your own needs (hungry, thirsty, anxious, excited) before an app tells you what to feel.',
        fact: 'Some lab studies found that simply having a smartphone visible on the desk slightly reduced performance on attention tasks, though later replications have been mixed. Out of sight is an easy experiment to run on yourself.', evidence: 'early' },
      { benefit: 'It turns the phone into a reward instead of a reflex, which is exactly what your morning gate is for.',
        fact: 'Behavioural research on “temptation bundling” suggests that pairing a less-fun task with something you enjoy can increase follow-through. Unlocking your phone at the end of the flow is a tiny built-in reward.', evidence: 'early' }
    ]
  },

  meditate: {
    entries: [
      { benefit: 'Meditation trains attention like a muscle: notice you’ve wandered, come back, repeat. Every “come back” is a rep.',
        fact: 'Meta-analyses pooling many randomised trials of mindfulness programmes find modest reductions in anxiety, low mood and stress compared with no treatment. Not a magic cure, but a real, measurable nudge.', evidence: 'moderate' },
      { benefit: 'Slow breathing can shift your body toward “rest and digest”, easing that tight-chest feeling.',
        fact: 'Physiology studies show slow, paced breathing tends to increase heart rate variability, a marker associated with a calmer, more flexible stress response.', evidence: 'moderate' },
      { benefit: 'Short sessions count. Five calm minutes every day beats one heroic hour a month.',
        fact: 'Studies of brief mindfulness training, sometimes only a week or two of short daily sessions, have found small improvements in attention and mood. The research is younger, but encouraging for beginners.', evidence: 'early' },
      { benefit: 'It gets easier to notice a thought without obeying it, which helps with homesick spirals and exam worry.',
        fact: 'Mindfulness-based cognitive therapy, a structured clinical programme, has been tested in randomised trials and can reduce the chance of depression returning in people with a history of it. Your app session isn’t therapy, but it practises the same core skill.', evidence: 'strong' },
      { benefit: 'You’re joining a very long lineage, from dhyana in classical yoga to Buddhist practice across Asia.',
        fact: 'Dhyana appears in classical yoga texts as one of the limbs of practice, centuries before any lab studied it. Modern science has only recently started measuring what practitioners described for a very long time.', evidence: 'traditional-use' }
    ]
  },

  yoga: {
    entries: [
      { benefit: 'Stretching wakes up stiff muscles and joints, especially after hours hunched over a laptop.',
        fact: 'Randomised trials of yoga for long-lasting low back pain have found modest improvements in pain and function, similar to other exercise programmes. Your desk-bound back will be grateful.', evidence: 'moderate' },
      { benefit: 'Yoga blends strength, balance and flexibility in one session, with nothing more than a mat or a towel.',
        fact: 'Reviews of yoga studies in older adults found improvements in balance and mobility, which matter for preventing falls later in life. Building the habit in your twenties is a gift to future you.', evidence: 'moderate' },
      { benefit: 'Moving with your breath creates a calm-but-alert feeling that bridges nicely into the rest of the morning.',
        fact: 'Several trials suggest yoga can reduce perceived stress and anxiety, though study quality varies and it’s hard to design a convincing “fake yoga” comparison. Encouraging, not conclusive.', evidence: 'moderate' },
      { benefit: 'Flexibility improves over weeks, and consistency matters far more than how deep you go.',
        fact: 'Stretching studies show flexibility gains come from regular practice over weeks, partly because your nervous system becomes more comfortable with the stretch. It’s a slow, steady skill.', evidence: 'moderate' },
      { benefit: 'A few rounds of Surya Namaskar is a full-body flow that fits in the smallest Singapore room.',
        fact: 'Small studies suggest brisk rounds of sun salutations can raise your heart rate into a light-to-moderate exercise zone. A tradition that doubles as a little cardio.', evidence: 'early' }
    ]
  },

  lemon: {
    nutrients: [
      { name: 'Water', why: 'The main event. Hydration supports energy, concentration and comfortable digestion after hours without a drink.' },
      { name: 'Vitamin C', why: 'A small amount from the juice. Vitamin C helps your body make collagen (for skin, gums and blood vessels) and helps you absorb iron from plant foods.' },
      { name: 'Citric acid / citrate', why: 'Gives lemon its zing. Researchers study citrate in kidney health, but that’s a doctor’s topic, not a self-treatment.' },
      { name: 'Potassium (a trace)', why: 'Supports normal nerve and muscle function, though whole fruit and vegetables are much better sources.' }
    ],
    entries: [
      { benefit: 'Mostly, it’s a pleasant way to drink a glass of water first thing, after a whole night without any.',
        fact: 'Studies on mild dehydration (losing just a little body water) have found effects on mood, fatigue and concentration in some people. The lemon makes it tasty; the water does the work.', evidence: 'moderate' },
      { benefit: 'A splash of lemon adds a little vitamin C, which helps build collagen and absorb iron from plant foods.',
        fact: 'It’s well established that vitamin C helps your gut absorb non-heme iron, the kind in lentils, spinach and fortified cereals. Squeezing lemon over your dal is a classic, clever pairing.', evidence: 'strong' },
      { benefit: 'Honest corner: it is NOT a detox. Your liver and kidneys detox you around the clock, and they’re very good at it.',
        fact: 'There’s no good evidence that lemon water flushes toxins or melts fat, and reviews of commercial “detox” products find little support for their claims. Hydration plus a nice taste is plenty to celebrate.', evidence: 'strong' },
      { benefit: 'Be kind to your teeth: drink it through a straw or follow with plain water, and wait a while before brushing.',
        fact: 'Dental research shows acidic drinks can temporarily soften tooth enamel, and brushing straight afterwards may wear the softened surface. Dentists commonly suggest rinsing with water and waiting before you brush.', evidence: 'moderate' },
      { benefit: 'A warm drink is a calming ritual, a little cue that says “morning flow has begun”.',
        fact: 'Habit research shows that a consistent cue at the start of a routine makes the whole sequence more automatic over time. Your lemon water is that cue, and it smells good too.', evidence: 'moderate' }
    ]
  },

  journal: {
    entries: [
      { benefit: 'Writing moves thoughts out of your head and onto paper, which can make worries smaller and plans clearer.',
        fact: 'In classic “expressive writing” experiments, people who wrote about their thoughts and feelings for short sessions over a few days often reported small improvements in wellbeing. The effects are modest and vary, but they show up again and again.', evidence: 'moderate' },
      { benefit: 'Gratitude lines train your attention to catch the good bits, even tiny ones like a perfect kopi.',
        fact: 'Randomised studies of gratitude journaling find small boosts in positive mood and life satisfaction. Not a life overhaul, more a gentle tilt in the right direction.', evidence: 'moderate' },
      { benefit: 'Your journal is proof you’ve been showing up, for the days your memory insists you haven’t.',
        fact: 'In diary studies of professionals, the days people felt best were the ones where they made progress on meaningful work, even small progress. Writing down wins helps you notice that progress.', evidence: 'moderate' },
      { benefit: 'Writing about being far from home helps you process homesickness instead of bottling it up.',
        fact: 'Studies of students adjusting to university have used short expressive-writing exercises as low-cost support, with some finding small benefits for adjustment and mood. Moving countries for a master’s is a big transition; this habit fits it.', evidence: 'early' },
      { benefit: 'One line is a real journal. Short and daily beats long and rare.',
        fact: 'In a small sleep-lab study, people who wrote a specific to-do list before bed fell asleep a little faster than those who wrote about tasks they had finished. Offloading tomorrow onto paper may quiet the mind.', evidence: 'early' }
    ]
  },

  plan: {
    entries: [
      { benefit: 'A plan turns “I should study” into “library, 10am, chapter 3”, which is far easier to start.',
        fact: '“If-then” plans (also called implementation intentions, e.g. “If it’s 10am, then I open my notes”) have been tested in many studies, and meta-analyses find they reliably improve follow-through on goals.', evidence: 'strong' },
      { benefit: 'Fewer decisions in the moment: future-you just follows the map instead of negotiating.',
        fact: 'Experiments on unfinished goals suggest that making a concrete plan can reduce intrusive thoughts about them, as if the brain is reassured the task is handled. Planning is a form of peace.', evidence: 'early' },
      { benefit: 'Choosing a top three for the day makes it easier to end feeling successful rather than behind.',
        fact: 'Research on the “planning fallacy” shows people consistently underestimate how long tasks take, even when they know about the bias. Planning fewer things, with buffers, is the evidence-based fix.', evidence: 'strong' },
      { benefit: 'Scheduling the fun stuff (painting, calls home) protects it from being eaten by deadlines.',
        fact: 'Studies suggest that writing down when and where you’ll do a healthy behaviour, like exercise, increases the chance you actually do it compared with only intending to. The trick works for any habit you want to protect.', evidence: 'moderate' },
      { benefit: 'A quick look at your day is a moment of agency: you decide, rather than react.',
        fact: 'Research on time-blocking itself is still thin, but work on attention shows that grouping similar tasks reduces costly switching. Plan in blocks, not fragments.', evidence: 'early' }
    ]
  },

  phone: {
    entries: [
      { benefit: 'You earned this! Meeting the world after your morning flow means meeting it with a settled mind.',
        fact: 'In an experiment where people received phone notifications in a few daily batches instead of instantly, they reported feeling more in control and less stressed. Notification summaries are worth a try for non-urgent apps.', evidence: 'early' },
      { benefit: 'Intentional phone time means you choose what to open (class updates, a call home) and then put it down.',
        fact: 'Research on smartphone use and wellbeing is mostly correlational and quite mixed, so screens aren’t simply “bad”. Many people do report feeling better when use is purposeful rather than automatic.', evidence: 'early' },
      { benefit: 'Perfect moment for a good-morning message home; Chennai is just two and a half hours behind.',
        fact: 'Studies of daily social life find that even brief, friendly interactions are associated with better mood that day. A quick “good morning” to family counts.', evidence: 'moderate' },
      { benefit: 'Make the first app something nourishing (music, a podcast, a language app) before the endless feeds.',
        fact: 'Habit research highlights friction: making a behaviour slightly harder, like moving a social app off your home screen, tends to reduce how often you do it. Tiny barriers are surprisingly powerful.', evidence: 'moderate' },
      { benefit: 'The gate isn’t a ban. It just puts YOU first in the queue.',
        fact: 'Studies of workplace interruptions find that people take time to get back on track after an interruption and sometimes resume a different task than intended. Guarding your first hour guards the rest of the morning.', evidence: 'moderate' }
    ]
  },

  study: {
    entries: [
      { benefit: 'Focused study compounds: today’s chapter makes next week’s lecture easier.',
        fact: 'Spacing, reviewing material across several days instead of cramming, is one of the most robust findings in learning science. Short, spread-out sessions beat marathons for long-term memory.', evidence: 'strong' },
      { benefit: 'Testing yourself (flashcards, explaining aloud, past papers) is more powerful than re-reading.',
        fact: 'The “testing effect” is well replicated: actively recalling information strengthens memory more than reviewing it again. Close the notes, write what you remember, then check.', evidence: 'strong' },
      { benefit: 'Short breaks keep focus fresher than pushing through the fog.',
        fact: 'Breaks during long study sessions seem to help maintain attention and reduce fatigue, though research on specific systems like the Pomodoro technique is limited. Experiment with a rhythm that suits you.', evidence: 'early' },
      { benefit: 'Sleep after studying is part of studying: your brain consolidates new memories overnight.',
        fact: 'Decades of sleep research show sleep helps consolidate newly learned information. An all-nighter trades tomorrow’s memory for tonight’s hours.', evidence: 'strong' },
      { benefit: 'Mixing related topics in one session deepens understanding, even though it feels harder.',
        fact: '“Interleaving”, alternating between different types of problems, has improved learning in classroom and lab studies, especially in maths. It feels clunkier, which is part of why it works.', evidence: 'moderate' }
    ]
  },

  article: {
    entries: [
      { benefit: 'A random article stretches your curiosity and hands you surprising connections for class discussions.',
        fact: 'Memory experiments suggest that when people are curious, they remember not only the answer they wanted but also unrelated information they met at the same time. Curiosity seems to put memory in a more receptive mood.', evidence: 'early' },
      { benefit: 'Summarising what you learned in one line is a tiny retrieval-practice session.',
        fact: 'Studies on “generative learning” show that explaining or summarising in your own words improves understanding and memory compared with passive reading. Your “what did I learn?” box is doing real cognitive work.', evidence: 'moderate' },
      { benefit: 'Broad reading builds general knowledge, which makes all future learning easier.',
        fact: 'Reading research shows background knowledge strongly predicts how well people understand new texts. Every random article adds hooks for future ideas to hang on.', evidence: 'strong' },
      { benefit: 'It’s a five-minute adventure: low stakes, high delight.',
        fact: 'Observational studies have linked lifelong learning and mentally engaging activities with better cognitive health later in life. They can’t prove cause and effect, but the association is consistent.', evidence: 'moderate' },
      { benefit: 'A fun fact is great conversation fuel with classmates.',
        fact: 'Studies of the “protégé effect” suggest that learning something in order to teach it, or actually explaining it to someone, improves recall. Tell someone your fact today!', evidence: 'moderate' }
    ]
  },

  brunch: {
    nutrients: [
      { name: 'Protein', why: 'Eggs, paneer, dal, tofu, curd. Builds and repairs tissue and keeps you full for longer.' },
      { name: 'Fibre', why: 'Whole grains, vegetables, fruit, lentils. Supports digestion and steadier energy, and feeds your gut bacteria.' },
      { name: 'Iron', why: 'Dal, leafy greens, eggs. Helps carry oxygen in your blood; low iron can leave you tired.' },
      { name: 'B vitamins', why: 'Whole grains, eggs, dairy. Help your body turn food into usable energy.' },
      { name: 'Calcium', why: 'Curd, milk, paneer, tofu. Bones, teeth and normal muscle function.' },
      { name: 'Vitamin C', why: 'Tomatoes, fruit, a squeeze of lime. Helps you absorb the iron from plant foods.' }
    ],
    entries: [
      { benefit: 'Protein plus fibre keeps your energy steady instead of spiking and crashing before class.',
        fact: 'Nutrition studies show protein and fibre both increase fullness and slow digestion, which helps avoid the mid-afternoon raid on the vending machine.', evidence: 'moderate' },
      { benefit: 'Cooking for yourself is quiet self-respect, and a skill that makes life abroad feel more like home.',
        fact: 'Observational studies link cooking at home more often with better overall diet quality. Cause and effect are hard to untangle, but home cooking tends to mean more vegetables and fewer ultra-processed foods.', evidence: 'moderate' },
      { benefit: 'Idli, dosa and curd are fermented foods. Make brunch Chennai-style when you can!',
        fact: 'In a small randomised study, people who ate more fermented foods for several weeks showed greater gut-microbe diversity and lower markers of inflammation. Promising, though it needs more research.', evidence: 'early' },
      { benefit: 'Pair iron-rich foods (dal, spinach, eggs) with vitamin C (tomato, lime, fruit) to absorb more iron.',
        fact: 'It’s well established that vitamin C boosts absorption of plant-based iron. This matters especially for vegetarians and people who menstruate, who are more likely to run low on iron.', evidence: 'strong' },
      { benefit: 'Eating at 8am or 11am matters less than eating something nourishing. Brunch counts!',
        fact: 'Trials comparing breakfast eaters with breakfast skippers haven’t found breakfast to be a magic key for weight or metabolism. What you eat across the day matters more than the clock.', evidence: 'moderate' }
    ]
  },

  class: {
    entries: [
      { benefit: 'Being in the room is where you catch the professor’s emphasis, the “this will matter” energy slides never show.',
        fact: 'Meta-analyses of university students find class attendance is one of the strongest predictors of grades, stronger than many study habits. It’s correlational, but the link is robust.', evidence: 'moderate' },
      { benefit: 'Asking even one question keeps your brain active instead of passively absorbing.',
        fact: 'A large meta-analysis of science and engineering courses found active learning (discussion and problem-solving in class) led to better exam results and fewer failures than lecture-only teaching.', evidence: 'strong' },
      { benefit: 'Class is community: classmates become study partners, friends and future colleagues.',
        fact: 'Research on “sense of belonging” at university links feeling connected to peers with motivation, wellbeing and persistence, which matters a lot for students far from home.', evidence: 'moderate' },
      { benefit: 'Notes in your own words help you process ideas as you hear them.',
        fact: 'A well-known study suggested handwritten notes beat laptop notes because people summarised instead of transcribing, but replications have been mixed. The durable lesson: paraphrase rather than type every word.', evidence: 'early' },
      { benefit: 'Glancing over your notes the same evening can save hours before exams.',
        fact: 'Memory research on the “forgetting curve” shows we forget quickly without review, and an early revisit slows that forgetting. Ten minutes tonight beats an hour next month.', evidence: 'strong' }
    ]
  },

  snack: {
    nutrients: [
      { name: 'Vitamin C', why: 'Guava, papaya, oranges. Supports collagen, immunity and iron absorption. Guava is a superstar here.' },
      { name: 'Potassium', why: 'Bananas, coconut water. Supports normal muscle and nerve function and healthy blood pressure.' },
      { name: 'Healthy fats & vitamin E', why: 'Nuts and seeds. Vitamin E helps protect cells from damage; fats keep you full.' },
      { name: 'Magnesium', why: 'Nuts, seeds, dark chocolate. Involved in muscle, nerve and energy processes.' },
      { name: 'Protein & calcium', why: 'Yogurt, roasted chana, boiled egg. Fullness, plus support for bones.' },
      { name: 'Fibre', why: 'Whole fruit, chana, sundal. Slows sugar absorption and keeps energy steady.' }
    ],
    entries: [
      { benefit: 'A smart snack bridges the gap between meals so you’re not starving (and hangry) by dinner.',
        fact: 'Studies show snacks with protein or fibre are more filling than refined-carb snacks with the same calories, which helps keep energy steady.', evidence: 'moderate' },
      { benefit: 'A handful of nuts delivers healthy fats, vitamin E and magnesium in one easy pack.',
        fact: 'Large cohort studies following people for many years found that eating nuts regularly is associated with lower heart-disease risk. Observational, but the pattern is consistent across many populations.', evidence: 'moderate' },
      { benefit: 'Whole fruit beats juice: the fibre slows the sugar and keeps you fuller.',
        fact: 'Nutrition research consistently links whole fruit with better health outcomes, while juicing removes much of the fibre. Singapore’s fruit stalls make this an easy win. Hello, guava and papaya.', evidence: 'strong' },
      { benefit: 'Roasted chana, sundal or a boiled egg are protein-rich snacks that taste like home.',
        fact: 'Legumes like chickpeas provide protein, fibre and minerals, and dietary guidelines around the world recommend them. Sundal is basically a nutrition textbook in a paper cone.', evidence: 'strong' },
      { benefit: 'Noticing when you’re actually hungry is a skill as valuable as any diet.',
        fact: 'Research on mindful eating is still developing, but early studies suggest paying attention while eating may help people recognise fullness and enjoy food more.', evidence: 'early' }
    ]
  },

  unwind: {
    entries: [
      { benefit: 'Unwinding switches off “study mode”, which makes rest actually restful.',
        fact: 'Studies on “psychological detachment” (mentally switching off from work in your free time) link it with better recovery, mood and sleep. Rest is a skill, not a prize.', evidence: 'moderate' },
      { benefit: 'Music you love can lift your mood and lower stress quickly.',
        fact: 'Meta-analyses of music-listening studies suggest music can reduce stress responses and anxiety. Your A. R. Rahman playlist is doing evidence-based work.', evidence: 'moderate' },
      { benefit: 'Green spaces are extra restorative. Singapore’s parks and park connectors count!',
        fact: 'Large observational studies link regular time in nature with lower stress and better wellbeing, with benefits appearing at around a couple of hours a week. Cause and effect aren’t fully proven, but it’s a pleasant experiment.', evidence: 'moderate' },
      { benefit: 'Laughing with friends or at a silly show is legitimate stress relief.',
        fact: 'Small studies suggest laughter can reduce feelings of stress and tension, though research on its physical effects is still limited.', evidence: 'early' },
      { benefit: 'A calm evening tells your body that sleep is coming, which protects your early wake-up.',
        fact: 'Sleep experts recommend a consistent wind-down routine, and studies in both children and adults link regular bedtime routines with better sleep.', evidence: 'moderate' }
    ]
  },

  walk: {
    entries: [
      { benefit: 'Walking lifts mood, clears your head and gets blood moving after hours of sitting.',
        fact: 'Large reviews of physical-activity research find that regular exercise, including brisk walking, is linked with a lower risk of depression and better mood. Movement is one of the best-supported mood tools we have.', evidence: 'strong' },
      { benefit: 'A short walk after a meal can help steady blood sugar.',
        fact: 'Studies show light walking after eating reduces the rise in blood sugar compared with sitting still, and even a few minutes helps. The after-dinner family stroll has science on its side.', evidence: 'moderate' },
      { benefit: 'Walking sparks ideas, perfect for mulling over an assignment or your next painting.',
        fact: 'Experiments have found people came up with more creative ideas while walking, and shortly afterwards, than while sitting, even on a treadmill facing a wall.', evidence: 'early' },
      { benefit: 'Every step counts. You don’t need 10,000 for benefits.',
        fact: 'Large observational studies of step counts found health benefits rising with steps but levelling off for many people below 10,000, a number that famously began as a pedometer marketing slogan rather than science.', evidence: 'moderate' },
      { benefit: 'Go early or after sunset to enjoy walks in Singapore’s heat, and carry water.',
        fact: 'Exercising in hot, humid weather makes your body work harder to cool down, and health agencies advise hydrating and avoiding the hottest part of the day.', evidence: 'strong' }
    ]
  },

  productive: {
    entries: [
      { benefit: 'One more focused block moves your goals further than a scattered afternoon.',
        fact: 'Research on “attention residue” suggests that after switching tasks, part of your attention stays stuck on the previous one. Single-tasking for one block gives your whole brain to one thing.', evidence: 'early' },
      { benefit: 'Small wins snowball: finishing one meaningful chunk builds motivation for the next.',
        fact: 'Diary studies of knowledge workers found that making progress on meaningful work was the strongest driver of a good day. Small wins absolutely count.', evidence: 'moderate' },
      { benefit: 'Phone in another room = focus on easy mode.',
        fact: 'Behaviour research shows that reducing easy access to distractions often works better than relying on willpower to resist them. Out of reach, out of mind.', evidence: 'moderate' },
      { benefit: 'A clear, small goal (“finish the intro paragraph”) makes the block easy to start.',
        fact: 'Decades of goal-setting research find that specific goals lead to better performance than vague “do your best” intentions across many settings.', evidence: 'strong' },
      { benefit: 'End with a note on where to resume and tomorrow’s start becomes effortless.',
        fact: 'Studies on interruptions suggest that jotting a quick “next step” before stopping helps people resume faster and with less frustration.', evidence: 'early' }
    ]
  },

  skin_am: {
    entries: [
      { benefit: 'Sunscreen is the most powerful anti-ageing product on any shelf, and in Singapore it’s a daily essential.',
        fact: 'A large randomised trial in a very sunny country found that adults who applied sunscreen daily showed less visible skin ageing after several years than those who used it whenever they felt like it. Daily beats occasional.', evidence: 'strong' },
      { benefit: 'Singapore sits near the equator, so UV is high all year, even on cloudy days.',
        fact: 'UV index readings near the equator are frequently high to extreme year-round, and clouds don’t block all UV. Health agencies recommend sun protection whenever UV is moderate or higher, which here is most of the daytime.', evidence: 'strong' },
      { benefit: 'A gentle cleanse and moisturiser support your skin barrier, keeping water in and irritants out.',
        fact: 'Dermatology research shows a healthy skin barrier reduces water loss and irritation, and moisturisers help restore barrier function in dry or sensitive skin.', evidence: 'strong' },
      { benefit: 'Vitamin C serums are a popular antioxidant step: nice to have, not essential.',
        fact: 'Lab and small clinical studies suggest topical vitamin C can help defend against some sun-related damage and brighten skin, but it works alongside sunscreen, never instead of it.', evidence: 'moderate' },
      { benefit: 'Humid outside, air-conditioned inside: a light gel moisturiser still helps.',
        fact: 'Skin hydration depends on your barrier as well as the air, and low-humidity indoor air from air-conditioning can dry skin out. Research on this specific situation is limited, but the logic is sound.', evidence: 'early' }
    ]
  },

  skin_pm: {
    entries: [
      { benefit: 'Cleansing at night removes sunscreen, sweat and city grime so your skin can recover.',
        fact: 'Dermatologists commonly recommend thorough evening cleansing, especially after sunscreen or makeup. “Double cleansing” is popular, though studies comparing methods are limited.', evidence: 'early' },
      { benefit: 'Night is a good time for richer products, when your skin isn’t facing sun and sweat.',
        fact: 'Studies suggest skin has its own daily rhythm, with things like water loss and some repair processes varying between day and night. The research is young, but fascinating.', evidence: 'early' },
      { benefit: 'Retinoids are among the best-studied skincare ingredients for signs of sun damage. Go slowly if you try one.',
        fact: 'Clinical trials have shown prescription retinoids improve fine lines and texture from sun damage. Over-the-counter retinol is milder and less studied. A pharmacist or dermatologist can help you choose.', evidence: 'strong' },
      { benefit: 'Niacinamide is a gentle, well-tolerated ingredient that supports the skin barrier.',
        fact: 'Small clinical studies suggest topical niacinamide may help with barrier function, redness and uneven tone, and it’s generally well tolerated, which makes it beginner-friendly.', evidence: 'moderate' },
      { benefit: 'A skincare routine doubles as a self-care ritual: calm minutes that say “the day is done”.',
        fact: 'Sleep research links consistent, calming pre-bed routines with better sleep. Your skincare steps are also a wind-down cue for your brain.', evidence: 'moderate' }
    ]
  },

  castor: {
    entries: [
      { benefit: 'Mostly, this is a soothing wind-down ritual, a quiet moment of care before sleep.',
        fact: 'Castor oil for lash growth is traditional use, not proven science. There are no robust clinical trials showing it makes lashes longer or thicker. Enjoy it as a ritual, not a miracle.', evidence: 'traditional-use' },
      { benefit: 'Oil can coat lashes so they may feel softer and look glossier.',
        fact: 'Castor oil is rich in ricinoleic acid, which gives it that thick texture, and it’s used in many cosmetics as a moisturising ingredient. Being moisturising doesn’t mean it makes hair grow.', evidence: 'traditional-use' },
      { benefit: 'Patch-test first and keep it out of your eyes. A tiny amount along the lash line is plenty.',
        fact: 'Dermatology case reports document allergic reactions to castor oil and its derivatives in some people. Testing a little on your inner arm for a day or two before using it near the eyes is sensible. If your eyes sting or redden, stop.', evidence: 'moderate' },
      { benefit: 'For many families in India this is a cherished tradition, a nightly link to home.',
        fact: 'Castor oil has been used for thousands of years; it appears in ancient Egyptian medical texts and in traditional Indian remedies. A long history is lovely, but it isn’t the same as evidence that it grows lashes.', evidence: 'traditional-use' },
      { benefit: 'Think of it as gentle care, not a treatment.',
        fact: 'Prescription lash serums contain a medicine first developed for glaucoma, and trials show they do lengthen lashes, but they need a doctor and can have side effects. Castor oil is far gentler and far less proven. (The strong evidence here is for the prescription drug, not castor oil.)', evidence: 'strong' }
    ]
  },

  readbed: {
    entries: [
      { benefit: 'Reading shifts your mind from busy to calm, a perfect off-ramp from the day.',
        fact: 'Sleep-hygiene guidance commonly recommends a relaxing activity before bed, and a paper book is a classic: absorbing, gentle and blessedly free of infinite scroll.', evidence: 'moderate' },
      { benefit: 'Paper over a bright screen at night protects your natural sleepiness.',
        fact: 'In a controlled lab study, people who read on a light-emitting tablet before bed took longer to feel sleepy and showed delayed melatonin compared with reading a printed book. Night mode and dim light help, but paper is easiest.', evidence: 'moderate' },
      { benefit: 'Fiction lets you live other lives for a while.',
        fact: 'Some studies found that reading literary fiction briefly improved performance on tests of understanding other people’s feelings, but larger replications were mixed. Read for joy; any empathy boost is a bonus.', evidence: 'early' },
      { benefit: 'A regular reading habit quietly grows vocabulary and knowledge over the years.',
        fact: 'Reading research consistently finds that people who read more build bigger vocabularies and broader knowledge, which makes reading easier and more enjoyable: a happy loop.', evidence: 'strong' },
      { benefit: 'Book lovers, rejoice: reading is linked with lots of good things.',
        fact: 'One large observational study found that book readers lived slightly longer on average than non-readers, even after accounting for things like education. It can’t prove books cause longevity, but it’s a lovely finding.', evidence: 'early' }
    ]
  },

  paint: {
    entries: [
      { benefit: 'Painting invites “flow”, that absorbing state where time disappears and worries go quiet.',
        fact: 'Psychology research describes flow as deep absorption in a challenging-but-doable activity, and people rate it among their most enjoyable experiences. Art-making is a classic flow activity.', evidence: 'moderate' },
      { benefit: 'Making art is linked with lower stress, whatever your skill level.',
        fact: 'In a small study, adults who spent under an hour making art had lower levels of the stress hormone cortisol afterwards, and prior art experience didn’t matter.', evidence: 'early' },
      { benefit: 'A creative hobby builds an identity beyond grades and deadlines.',
        fact: 'Diary studies of young adults found that on days they did something creative, they reported more positive emotion and a greater sense of flourishing the following day.', evidence: 'early' },
      { benefit: 'Twice a week is enough to see your skills grow and keep the joy.',
        fact: 'A large World Health Organization review of research on the arts and health concluded that engaging with the arts can support both mental and physical wellbeing.', evidence: 'moderate' },
      { benefit: 'Your brush joins a grand tradition. Raja Ravi Varma blended Indian myth with European oil technique.',
        fact: 'Ravi Varma set up a printing press to reproduce his paintings as affordable prints, which is why his images of gods and goddesses ended up in so many Indian homes. Art travels further than you think.', evidence: 'strong' }
    ]
  },

  clean: {
    entries: [
      { benefit: 'A tidy room makes starting easier: no digging for notes under yesterday’s laundry.',
        fact: 'Some observational studies have linked describing your home as cluttered with higher stress. It’s correlational, but many people feel calmer in an orderly space.', evidence: 'early' },
      { benefit: 'Clutter competes for your attention; clearing it helps you focus.',
        fact: 'Neuroscience research on visual attention shows that multiple objects in view compete for your brain’s processing. Fewer visual distractions can make focusing a little easier.', evidence: 'early' },
      { benefit: 'Cleaning is sneaky exercise: sweeping, mopping and scrubbing all count.',
        fact: 'Physical-activity guidelines count household chores as activity, and observational studies link everyday movement like housework with health benefits.', evidence: 'moderate' },
      { benefit: 'Dusting and fresh sheets cut down allergens, a big help if you get sneezy.',
        fact: 'Dust mites thrive in warm, humid climates like Singapore’s. Allergy guidance recommends washing bedding regularly in hot water and reducing dust to limit exposure.', evidence: 'strong' },
      { benefit: 'A weekly reset ritual makes Monday feel like a fresh start.',
        fact: 'Research on the “fresh start effect” found people are more likely to pursue goals after time landmarks like a new week or month. A clean room is a fresh start you can see.', evidence: 'moderate' }
    ]
  },

  gym: {
    entries: [
      { benefit: 'Strength training builds muscle, supports your joints and makes everyday life physically easier.',
        fact: 'The World Health Organization recommends muscle-strengthening activity on two or more days a week for adults, alongside aerobic activity. Your twice-a-week target is right on the guideline.', evidence: 'strong' },
      { benefit: 'Lifting helps build and protect bone density, which matters more and more with age.',
        fact: 'Studies show resistance and impact exercise can help maintain or improve bone density, and peak bone mass is built in early adulthood. Now is prime time to invest.', evidence: 'moderate' },
      { benefit: 'Strength training can lift mood and ease anxiety.',
        fact: 'A meta-analysis of randomised trials found resistance exercise reduced symptoms of low mood compared with control groups, whether or not people got noticeably stronger.', evidence: 'moderate' },
      { benefit: 'Muscle helps your body handle blood sugar, for steadier energy.',
        fact: 'Muscle is a major site for glucose uptake, and trials show resistance training improves insulin sensitivity.', evidence: 'strong' },
      { benefit: 'Progress comes from adding a little more over time: weight, reps or sets.',
        fact: '“Progressive overload”, gradually increasing the challenge, is a core principle of strength training backed by decades of exercise science. Slow and steady wins here too.', evidence: 'strong' }
    ]
  },

  jog: {
    entries: [
      { benefit: 'Jogging builds cardio fitness for your heart, lungs and stamina.',
        fact: 'In large observational studies, cardiorespiratory fitness is one of the strongest predictors of long-term health. Good news: it responds quickly to regular training.', evidence: 'strong' },
      { benefit: 'You don’t need to run far or fast. Modest running counts.',
        fact: 'Large cohort studies found runners had a lower risk of early death than non-runners, and even small weekly amounts of running were associated with benefits.', evidence: 'moderate' },
      { benefit: 'That post-run glow is real.',
        fact: 'Research suggests the “runner’s high” may involve the body’s endocannabinoid system, not only endorphins as long believed. Either way, many people feel calmer after a run.', evidence: 'early' },
      { benefit: 'Running in Singapore? Early morning or evening, plus water, is the move.',
        fact: 'Heat-illness guidance recommends getting used to the heat gradually, hydrating, and avoiding the hottest hours. Bodies adapt to heat with regular, sensible exposure.', evidence: 'strong' },
      { benefit: 'Run-walk intervals are a completely valid way to build up.',
        fact: 'Beginner programmes often use run-walk intervals, and studies suggest they help people stick with running while managing the load on their bodies.', evidence: 'early' }
    ]
  },

  laundry: {
    entries: [
      { benefit: 'Clean clothes and sheets: a small reset that makes your space feel cared for.',
        fact: 'Sweat, skin flakes and dust mites build up in bedding, especially in humid climates. Allergy guidance suggests washing sheets often, ideally in hot water.', evidence: 'moderate' },
      { benefit: 'Once a week means no “nothing to wear” panic before class.',
        fact: 'Habit research shows that tying a chore to a fixed time (say, Saturday morning) helps it become automatic, so it stops taking up mental space.', evidence: 'moderate' },
      { benefit: 'Drying clothes properly prevents musty smells and mould in humid weather.',
        fact: 'Mould grows readily in damp, humid conditions. Health agencies advise drying clothes thoroughly and keeping indoor spaces ventilated.', evidence: 'strong' },
      { benefit: 'Finishing a chore feels good. Tick it and enjoy the sense of completion.',
        fact: 'Psychology research suggests that completing tasks, even small ones, can boost mood and motivation, which is partly why ticking boxes is so satisfying (hi, this app).', evidence: 'early' },
      { benefit: 'Wash new clothes before wearing them, especially if your skin is sensitive.',
        fact: 'Dermatologists often advise washing new garments first because leftover dyes and fabric finishes can irritate sensitive skin. It’s sensible advice, though not heavily studied.', evidence: 'early' }
    ]
  },

  home: {
    entries: [
      { benefit: 'Reaching out to family and friends keeps you rooted and softens homesickness.',
        fact: 'A major meta-analysis found that stronger social relationships are linked with a meaningfully higher likelihood of survival over time, an effect comparable to well-known lifestyle risk factors. Connection is health.', evidence: 'strong' },
      { benefit: 'People love hearing from you more than you think.',
        fact: 'In experiments, people who reached out to someone they hadn’t contacted in a while consistently underestimated how much the other person would appreciate it. Send the message!', evidence: 'moderate' },
      { benefit: 'Homesickness is a normal part of moving abroad, not a sign you’re doing it wrong.',
        fact: 'Studies of international students show homesickness is common, especially early on, and that staying connected to home while building new friendships supports adjustment.', evidence: 'moderate' },
      { benefit: 'A voice can feel closer than text. Try a quick call or a voice note.',
        fact: 'In experiments, people expected phone calls to feel more awkward than texting, yet calls created stronger feelings of connection without being more awkward.', evidence: 'early' },
      { benefit: 'Small, regular check-ins keep relationships warm across the distance.',
        fact: 'Research on long-distance relationships suggests frequent, everyday communication is linked with stronger bonds. A meme to your cousin counts!', evidence: 'early' }
    ]
  },

  /* Used for any habit without its own entry (e.g. your custom habits). */
  other: {
    entries: [
      { benefit: 'Every good habit is a small vote for the person you’re becoming.',
        fact: 'A study tracking people forming new daily habits found it took around two months on average for a behaviour to feel automatic, with a huge range between people and habits. Patience is part of the plan.', evidence: 'moderate' },
      { benefit: 'Missing a day doesn’t erase your progress. Just come back.',
        fact: 'In that same habit-formation research, missing a single day didn’t meaningfully derail the process. That’s exactly why this app has rest tokens instead of guilt.', evidence: 'moderate' },
      { benefit: 'Linking a new habit to an existing one makes it easier to remember.',
        fact: 'Research on habit cues shows behaviours become automatic more reliably when tied to a consistent trigger, like “after I brush my teeth, I…”.', evidence: 'moderate' },
      { benefit: 'Make it tiny: shrink the habit until it’s almost too small to skip.',
        fact: 'Behaviour-change research repeatedly finds that reducing friction and making a habit easy to start boosts follow-through more than relying on motivation alone.', evidence: 'moderate' },
      { benefit: 'Celebrate small wins. A little reward helps the habit stick.',
        fact: 'Learning research suggests that positive feelings soon after a behaviour help it become habitual. Hence: confetti.', evidence: 'early' }
    ]
  }
};
