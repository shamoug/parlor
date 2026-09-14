/* =========================================================================
 * THE PARLOR  ·  words.js
 * All therapy content. Stimuli favour high-frequency, highly picturable,
 * early-acquired words with high name agreement (see docs/RESEARCH.md).
 * Sounds are tagged by PHONEME, not spelling ("phone" is /f/).
 * Clinicians can extend these lists freely — every game reads from here.
 * ========================================================================= */
(function (root) {
  const P = (root.P = root.P || {});
  const D = (P.DATA = {});

  /* ---------- Word Lock: [word, emoji, category, clue, rhyme] ---------- */
  D.wordlock = {
    3: [
      ["cat", "🐱", "an animal", "It says meow and chases mice", "hat"],
      ["dog", "🐶", "an animal", "It barks and wags its tail", "log"],
      ["sun", "☀️", "something in the sky", "It shines in the daytime", "fun"],
      ["bus", "🚌", "a vehicle", "A big vehicle that carries lots of people", "plus"],
      ["cup", "☕", "something in the kitchen", "You drink from it", "pup"],
      ["hat", "👒", "clothing", "You wear it on your head", "cat"],
      ["bed", "🛏️", "furniture", "You sleep in it", "red"],
      ["pig", "🐷", "an animal", "A pink farm animal that oinks", "big"],
      ["cow", "🐮", "an animal", "A farm animal that gives us milk", "now"],
      ["egg", "🥚", "food", "A hen lays it", "leg"],
      ["key", "🔑", "a tool", "It opens a lock", "tea"],
      ["bee", "🐝", "an insect", "It buzzes and makes honey", "tree"],
      ["car", "🚗", "a vehicle", "You drive it on the road", "star"],
      ["pen", "🖊️", "something for school", "You write with it", "ten"],
      ["map", "🗺️", "something for travel", "It shows you the way", "cap"],
      ["box", "📦", "a container", "You pack things inside it", "fox"],
      ["fox", "🦊", "an animal", "An orange wild animal with a bushy tail", "box"],
      ["owl", "🦉", "a bird", "A bird that hoots at night", "towel"],
      ["bat", "🦇", "an animal", "It flies at night and hangs upside down", "hat"],
      ["van", "🚐", "a vehicle", "A vehicle bigger than a car", "fan"],
      ["pie", "🥧", "food", "A baked dessert with a crust", "tie"],
      ["ant", "🐜", "an insect", "A tiny insect that lives in a hill", "plant"],
      ["ear", "👂", "a body part", "You hear with it", "near"],
      ["leg", "🦵", "a body part", "You walk with it", "egg"],
      ["tea", "🍵", "a drink", "A hot drink made with leaves", "key"],
      ["ice", "🧊", "something cold", "Frozen water", "rice"],
      ["web", "🕸️", "something in nature", "A spider makes it", "bed"],
      ["bag", "👜", "a container", "You carry things in it", "flag"],
    ],
    4: [
      ["fish", "🐟", "an animal", "It swims in water", "dish"],
      ["cake", "🎂", "food", "You eat it on your birthday", "lake"],
      ["book", "📖", "something to read", "It has pages and a story", "cook"],
      ["ball", "⚽", "a toy", "You kick it or throw it", "wall"],
      ["frog", "🐸", "an animal", "A green animal that hops", "log"],
      ["duck", "🦆", "a bird", "A bird that quacks and swims", "truck"],
      ["milk", "🥛", "a drink", "A white drink that comes from cows", "silk"],
      ["moon", "🌙", "something in the sky", "It shines at night", "spoon"],
      ["star", "⭐", "something in the sky", "It twinkles in the night sky", "car"],
      ["tree", "🌳", "a plant", "It has leaves and branches", "bee"],
      ["bear", "🐻", "an animal", "A big furry animal that loves honey", "chair"],
      ["boat", "⛵", "a vehicle", "It floats on the water", "coat"],
      ["lion", "🦁", "an animal", "The king of the jungle", "iron"],
      ["shoe", "👟", "clothing", "You wear it on your foot", "two"],
      ["sock", "🧦", "clothing", "You wear it under your shoe", "clock"],
      ["drum", "🥁", "an instrument", "You bang it to make a beat", "thumb"],
      ["bell", "🔔", "something that makes noise", "It rings", "shell"],
      ["kite", "🪁", "a toy", "It flies in the wind on a string", "light"],
      ["corn", "🌽", "a vegetable", "A yellow vegetable that grows on a cob", "horn"],
      ["door", "🚪", "part of a house", "You open it to go inside", "floor"],
      ["ring", "💍", "jewelry", "You wear it on your finger", "king"],
      ["rose", "🌹", "a flower", "A red flower with thorns", "nose"],
      ["leaf", "🍃", "part of a plant", "It grows on a tree and falls in autumn", "beef"],
      ["soup", "🍲", "food", "A hot food you eat with a spoon", "hoop"],
      ["bike", "🚲", "a vehicle", "It has two wheels and pedals", "hike"],
      ["coat", "🧥", "clothing", "You wear it when it is cold", "boat"],
      ["king", "🤴", "a person", "He wears a crown", "ring"],
      ["hand", "✋", "a body part", "It has five fingers", "sand"],
      ["nose", "👃", "a body part", "You smell with it", "rose"],
      ["rain", "🌧️", "weather", "Water that falls from the clouds", "train"],
      ["bird", "🐦", "an animal", "It has wings and sings", "word"],
      ["wolf", "🐺", "an animal", "A wild animal that howls", "golf"],
    ],
    5: [
      ["apple", "🍎", "a fruit", "A crunchy red or green fruit", "chapel"],
      ["bread", "🍞", "food", "You make toast and sandwiches with it", "red"],
      ["chair", "🪑", "furniture", "You sit on it", "bear"],
      ["house", "🏠", "a building", "People live in it", "mouse"],
      ["horse", "🐴", "an animal", "A big animal you can ride", "course"],
      ["snake", "🐍", "an animal", "A long animal with no legs", "cake"],
      ["train", "🚆", "a vehicle", "It runs on tracks", "rain"],
      ["clock", "⏰", "something at home", "It tells the time", "sock"],
      ["pizza", "🍕", "food", "A round food with cheese on top", "pizza"],
      ["tiger", "🐯", "an animal", "A big orange cat with stripes", "spider"],
      ["zebra", "🦓", "an animal", "A horse-like animal with black and white stripes", "zebra"],
      ["mouse", "🐭", "an animal", "A small animal that squeaks", "house"],
      ["sheep", "🐑", "an animal", "A farm animal covered in wool", "jeep"],
      ["shirt", "👕", "clothing", "You wear it on the top half of your body", "skirt"],
      ["piano", "🎹", "an instrument", "You play music on its black and white keys", "piano"],
      ["lemon", "🍋", "a fruit", "A sour yellow fruit", "melon"],
      ["juice", "🧃", "a drink", "You squeeze fruit to make it", "moose"],
      ["phone", "📱", "a device", "You call people with it", "bone"],
      ["heart", "❤️", "a body part", "It beats inside your chest", "art"],
      ["robot", "🤖", "a machine", "A machine that can move like a person", "robot"],
      ["grape", "🍇", "a fruit", "A small fruit that grows in bunches", "cape"],
      ["spoon", "🥄", "something in the kitchen", "You eat soup with it", "moon"],
      ["truck", "🚚", "a vehicle", "A big vehicle that carries heavy loads", "duck"],
      ["whale", "🐋", "an animal", "The biggest animal in the sea", "tail"],
      ["camel", "🐫", "an animal", "A desert animal with humps", "camel"],
      ["honey", "🍯", "food", "Bees make this sweet food", "money"],
      ["plane", "✈️", "a vehicle", "It flies high in the sky", "rain"],
      ["water", "💧", "a drink", "You drink it when you are thirsty", "otter"],
      ["smile", "😊", "something you do", "You do it when you are happy", "mile"],
      ["money", "💵", "something you use", "You pay for things with it", "honey"],
    ],
  };

  /* ---------- Feature Garden (Semantic Feature Analysis) ---------- */
  D.petals = [
    { key: "group", icon: "🗂️", label: "Group", q: "What kind of thing is it?" },
    { key: "use", icon: "🛠️", label: "Use", q: "What is it used for?" },
    { key: "action", icon: "🏃", label: "Action", q: "What does it do, or what do you do with it?" },
    { key: "looks", icon: "👀", label: "Looks", q: "What does it look like?" },
    { key: "place", icon: "📍", label: "Place", q: "Where do you find it?" },
    { key: "link", icon: "🔗", label: "Link", q: "What goes with it?" },
  ];
  D.garden = [
    ["dog", "🐶", { group: "a pet", use: "a loyal friend", action: "it barks", looks: "furry with four legs", place: "at home", link: "a bone" }],
    ["cat", "🐱", { group: "a pet", use: "catches mice", action: "it purrs", looks: "soft with whiskers", place: "on the sofa", link: "a ball of yarn" }],
    ["apple", "🍎", { group: "a fruit", use: "a healthy snack", action: "you crunch it", looks: "round and red", place: "on a tree", link: "a pie" }],
    ["bed", "🛏️", { group: "furniture", use: "for sleeping", action: "you lie down on it", looks: "soft with a pillow", place: "in the bedroom", link: "a blanket" }],
    ["car", "🚗", { group: "a vehicle", use: "to get places", action: "it drives on roads", looks: "has four wheels", place: "in the garage", link: "car keys" }],
    ["toothbrush", "🪥", { group: "a bathroom item", use: "to clean teeth", action: "you scrub with it", looks: "long with bristles", place: "in the bathroom", link: "toothpaste" }],
    ["umbrella", "☂️", { group: "a rain item", use: "keeps you dry", action: "it opens up", looks: "has a handle and a canopy", place: "by the front door", link: "rain" }],
    ["cup", "☕", { group: "a dish", use: "to hold drinks", action: "you sip from it", looks: "has a handle", place: "in the kitchen", link: "tea" }],
    ["key", "🔑", { group: "a tool", use: "to open locks", action: "you turn it", looks: "small and metal", place: "on a keyring", link: "a door" }],
    ["banana", "🍌", { group: "a fruit", use: "a sweet snack", action: "you peel it", looks: "long and yellow", place: "in a fruit bowl", link: "a monkey" }],
    ["chair", "🪑", { group: "furniture", use: "for sitting", action: "you sit on it", looks: "four legs and a back", place: "at the table", link: "a table" }],
    ["phone", "📱", { group: "a device", use: "to call people", action: "it rings", looks: "flat with a screen", place: "in your pocket", link: "a charger" }],
    ["bird", "🐦", { group: "an animal", use: "sings songs", action: "it flies", looks: "has feathers and wings", place: "in a tree", link: "a nest" }],
    ["shoe", "👟", { group: "clothing", use: "protects your feet", action: "you tie the laces", looks: "has laces and a sole", place: "on your feet", link: "socks" }],
    ["clock", "⏰", { group: "a household object", use: "tells the time", action: "it ticks", looks: "round with hands", place: "on the wall", link: "an alarm" }],
    ["bread", "🍞", { group: "food", use: "for sandwiches", action: "you slice it", looks: "brown with a crust", place: "at the bakery", link: "butter" }],
    ["guitar", "🎸", { group: "an instrument", use: "to make music", action: "you strum it", looks: "has six strings", place: "on a stage", link: "a song" }],
    ["scissors", "✂️", { group: "a tool", use: "to cut paper", action: "they snip", looks: "two sharp blades", place: "in a drawer", link: "paper" }],
    ["fish", "🐟", { group: "a sea animal", use: "a food for many people", action: "it swims", looks: "has fins and scales", place: "in the water", link: "a fishing rod" }],
    ["sun", "☀️", { group: "something in the sky", use: "gives light and warmth", action: "it shines", looks: "round, yellow and bright", place: "up in the sky", link: "sunglasses" }],
    ["bus", "🚌", { group: "a vehicle", use: "carries many people", action: "it stops at bus stops", looks: "big and long", place: "on the road", link: "a ticket" }],
    ["hammer", "🔨", { group: "a tool", use: "to hit nails", action: "you bang with it", looks: "a handle with a heavy head", place: "in a toolbox", link: "a nail" }],
    ["cake", "🎂", { group: "a dessert", use: "for celebrations", action: "you slice and share it", looks: "sweet with candles", place: "at a party", link: "birthday" }],
    ["bath", "🛁", { group: "a bathroom item", use: "for washing", action: "you soak in it", looks: "big, white and deep", place: "in the bathroom", link: "bubbles" }],
  ];

  /* ---------- Sound Detective (Phonological Components Analysis) ----------
   * [word, emoji, firstSound, lastSound, syllables, rhyme] */
  D.detective = [
    ["cat", "🐱", "k", "t", 1, "hat"],
    ["dog", "🐶", "d", "g", 1, "log"],
    ["fish", "🐟", "f", "sh", 1, "dish"],
    ["bus", "🚌", "b", "s", 1, "plus"],
    ["moon", "🌙", "m", "n", 1, "spoon"],
    ["cake", "🎂", "k", "k", 1, "lake"],
    ["book", "📖", "b", "k", 1, "cook"],
    ["sun", "☀️", "s", "n", 1, "fun"],
    ["bed", "🛏️", "b", "d", 1, "red"],
    ["pig", "🐷", "p", "g", 1, "big"],
    ["ship", "🚢", "sh", "p", 1, "lip"],
    ["chair", "🪑", "ch", "r", 1, "bear"],
    ["goat", "🐐", "g", "t", 1, "coat"],
    ["thumb", "👍", "th", "m", 1, "drum"],
    ["rocket", "🚀", "r", "t", 2, "pocket"],
    ["candle", "🕯️", "k", "l", 2, "handle"],
    ["letter", "✉️", "l", "r", 2, "better"],
    ["bunny", "🐰", "b", "ee", 2, "funny"],
    ["kitten", "🐈", "k", "n", 2, "mitten"],
    ["potato", "🥔", "p", "o", 3, "tomato"],
    ["tomato", "🍅", "t", "o", 3, "potato"],
    ["dinosaur", "🦖", "d", "r", 3, "more"],
  ];
  D.soundLabels = {
    p: "p", b: "b", m: "m", t: "t", d: "d", k: "k", g: "g", f: "f", s: "s",
    sh: "sh", ch: "ch", l: "l", r: "r", th: "th", n: "n", ee: "ee", o: "oh",
  };
  // What the voice says when a sound tile is tapped (isolated phonemes are
  // unreliable in text-to-speech, so we model the sound inside a word too).
  D.soundSay = {
    p: "puh, as in pig", b: "buh, as in ball", m: "mmm, as in moon", t: "tuh, as in top",
    d: "duh, as in dog", k: "kuh, as in cat", g: "guh, as in goat", f: "fff, as in fish",
    s: "sss, as in sun", sh: "shh, as in ship", ch: "ch, as in chair", l: "lll, as in leaf",
    r: "rrr, as in rocket", th: "th, as in thumb", n: "nnn, as in nose", ee: "ee, as in bee",
    o: "oh, as in go",
  };

  /* ---------- Pair Up (minimal pairs, organised by error pattern) ----------
   * Each pair: [target, emoji, foil, emoji] — foil is what the listener
   * would hear if the child uses the error pattern. */
  D.patterns = {
    fronting: {
      name: "Fronting", icon: "👅", sub: "k → t, g → d",
      tip: "Use the BACK of your tongue. Lift it up, like a cough: k, k, k.",
      pairs: [["key", "🔑", "tea", "🍵"], ["cape", "🦸", "tape", "📼"], ["car", "🚗", "tar", "🛢️"],
        ["cub", "🐻", "tub", "🛁"], ["coat", "🧥", "tote", "👜"], ["gate", "🚧", "date", "📅"],
        ["cop", "👮", "top", "🔝"], ["gown", "👗", "down", "⬇️"]],
    },
    stopping: {
      name: "Stopping", icon: "🌬️", sub: "s, f, sh → t, p",
      tip: "Make the sound LONG, like air leaking out of a tyre: sssss, fffff.",
      pairs: [["sea", "🌊", "tea", "🍵"], ["fan", "🪭", "pan", "🍳"], ["shoe", "👟", "two", "2️⃣"],
        ["sock", "🧦", "dock", "⚓"], ["four", "4️⃣", "pour", "🫗"], ["sew", "🪡", "toe", "🦶"],
        ["fin", "🦈", "pin", "📌"], ["sun", "☀️", "ton", "🏋️"]],
    },
    finals: {
      name: "Final sounds", icon: "🔚", sub: "keep the last sound",
      tip: "Don't forget the END of the word! Finish it with a little pop.",
      pairs: [["boat", "⛵", "bow", "🎀"], ["seat", "💺", "sea", "🌊"], ["nose", "👃", "no", "🙅"],
        ["bead", "📿", "bee", "🐝"], ["tooth", "🦷", "two", "2️⃣"], ["rope", "🪢", "row", "🚣"],
        ["bone", "🦴", "bow", "🎀"], ["cone", "🍦", "cow", "🐮"]],
    },
    gliding: {
      name: "Gliding", icon: "🌀", sub: "r, l → w",
      tip: "For L, put your tongue tip up behind your top teeth. For R, pull your tongue back and growl: rrr.",
      pairs: [["ring", "💍", "wing", "🪽"], ["red", "🟥", "wed", "💒"], ["light", "💡", "white", "⚪"],
        ["lock", "🔒", "walk", "🚶"], ["read", "📖", "weed", "🌿"], ["rake", "🍂", "wake", "⏰"],
        ["lick", "👅", "wick", "🕯️"], ["late", "⏰", "wait", "⏳"]],
    },
    voicing: {
      name: "Voicing", icon: "🔊", sub: "p → b, t → d, k → g",
      tip: "For p, t and k, your voice box stays quiet — just a puff of air. Hold a tissue and make it wiggle!",
      pairs: [["pea", "🫛", "bee", "🐝"], ["pear", "🍐", "bear", "🐻"], ["coat", "🧥", "goat", "🐐"],
        ["tie", "👔", "die", "🎲"], ["fan", "🪭", "van", "🚐"], ["pig", "🐷", "big", "🐘"],
        ["cap", "🧢", "gap", "🕳️"], ["tuck", "🛌", "duck", "🦆"]],
    },
    clusters: {
      name: "Clusters", icon: "🔗", sub: "keep both sounds",
      tip: "Two sounds are holding hands at the start. Say them both: s-nail, c-lock.",
      pairs: [["snail", "🐌", "nail", "💅"], ["clock", "⏰", "lock", "🔒"], ["train", "🚆", "rain", "🌧️"],
        ["bread", "🍞", "red", "🟥"], ["star", "⭐", "tar", "🛢️"], ["slide", "🛝", "side", "↔️"],
        ["smile", "😊", "mile", "🛣️"], ["plane", "✈️", "pain", "🤕"]],
    },
  };

  /* ---------- Beat Keeper ---------- */
  D.beatWords = [
    ["sun", "🌞"], ["dog", "🐶"], ["pen·cil", "✏️"], ["rab·bit", "🐰"], ["mon·key", "🐒"],
    ["pop·corn", "🍿"], ["cup·cake", "🧁"], ["ba·na·na", "🍌"], ["but·ter·fly", "🦋"],
    ["el·e·phant", "🐘"], ["com·pu·ter", "💻"], ["um·brel·la", "☂️"], ["to·ma·to", "🍅"],
    ["pi·an·o", "🎹"], ["di·no·saur", "🦖"], ["kan·ga·roo", "🦘"], ["ham·bur·ger", "🍔"],
    ["straw·ber·ry", "🍓"], ["oc·to·pus", "🐙"], ["hel·i·cop·ter", "🚁"], ["wa·ter·mel·on", "🍉"],
    ["al·li·ga·tor", "🐊"], ["cat·er·pil·lar", "🐛"],
  ];
  // Melodic-intonation phrases: syllables with H (high) or L (low) pitch.
  D.singPhrases = [
    { t: "Hel-lo", p: "LH", e: "👋" }, { t: "Thank you", p: "HL", e: "🙏" },
    { t: "Good-bye", p: "LH", e: "👋" }, { t: "I love you", p: "LHL", e: "❤️" },
    { t: "I need help", p: "LHH", e: "🆘" }, { t: "Let's go home", p: "LHH", e: "🏠" },
    { t: "How are you", p: "HLH", e: "😊" }, { t: "Good mor-ning", p: "LHL", e: "🌅" },
    { t: "Cup of cof-fee", p: "HLHL", e: "☕" }, { t: "See you la-ter", p: "HLHL", e: "👋" },
    { t: "Hap-py birth-day", p: "HLHL", e: "🎂" }, { t: "Nice to meet you", p: "HLHL", e: "🤝" },
    { t: "I want wa-ter", p: "LHHL", e: "💧" }, { t: "Turn on the light", p: "HLLH", e: "💡" },
    { t: "Have a good day", p: "HLHH", e: "🌞" }, { t: "I am hun-gry", p: "LLHL", e: "🍽️" },
  ];
  D.ddk = [
    { id: "pa", say: "pa", label: "pa", tip: "Lips pop together", e: "💋" },
    { id: "ta", say: "ta", label: "ta", tip: "Tongue tip taps behind your teeth", e: "👅" },
    { id: "ka", say: "ka", label: "ka", tip: "Back of the tongue lifts up", e: "🎯" },
    { id: "pataka", say: "pa ta ka", label: "pa-ta-ka", tip: "Front, middle, back — lips, tip, back", e: "🥁" },
  ];

  /* ---------- Finish the Line ----------
   * { s: stem with ___, a: [answer, emoji], f: [[foil, emoji], ...] } */
  D.lines = {
    1: [
      { s: "One, two, three, ___", a: ["four", "4️⃣"], f: [["nine", "9️⃣"], ["seven", "7️⃣"]] },
      { s: "Twinkle, twinkle, little ___", a: ["star", "⭐"], f: [["car", "🚗"], ["moon", "🌙"]] },
      { s: "Ready, set, ___!", a: ["go", "🟢"], f: [["stop", "🛑"], ["sit", "🪑"]] },
      { s: "Once upon a ___", a: ["time", "⏳"], f: [["chair", "🪑"], ["cake", "🎂"]] },
      { s: "Rock, paper, ___", a: ["scissors", "✂️"], f: [["spoon", "🥄"], ["pencil", "✏️"]] },
      { s: "Happy birthday to ___", a: ["you", "🫵"], f: [["shoe", "👟"], ["tree", "🌳"]] },
      { s: "Monday, Tuesday, ___", a: ["Wednesday", "📅"], f: [["Sunday", "🌞"], ["Friday", "🎉"]] },
      { s: "A, B, C, ___", a: ["D", "🔤"], f: [["Z", "💤"], ["Q", "👑"]] },
      { s: "Thank you very ___", a: ["much", "🙏"], f: [["cake", "🎂"], ["hat", "👒"]] },
      { s: "Head, shoulders, knees and ___", a: ["toes", "🦶"], f: [["nose", "👃"], ["cheese", "🧀"]] },
    ],
    2: [
      { s: "Salt and ___", a: ["pepper", "🌶️"], f: [["sugar", "🍬"], ["milk", "🥛"]] },
      { s: "Bread and ___", a: ["butter", "🧈"], f: [["soap", "🧼"], ["rain", "🌧️"]] },
      { s: "Knife and ___", a: ["fork", "🍴"], f: [["hat", "👒"], ["tree", "🌳"]] },
      { s: "Brush your ___", a: ["teeth", "🦷"], f: [["car", "🚗"], ["cake", "🎂"]] },
      { s: "A cup of ___", a: ["coffee", "☕"], f: [["socks", "🧦"], ["shoes", "👟"]] },
      { s: "Thunder and ___", a: ["lightning", "⚡"], f: [["cheese", "🧀"], ["pillow", "🛏️"]] },
      { s: "Bacon and ___", a: ["eggs", "🍳"], f: [["books", "📚"], ["keys", "🔑"]] },
      { s: "Fish and ___", a: ["chips", "🍟"], f: [["boots", "🥾"], ["clocks", "⏰"]] },
      { s: "Shoes and ___", a: ["socks", "🧦"], f: [["soup", "🍲"], ["stars", "⭐"]] },
      { s: "Peanut butter and ___", a: ["jelly", "🍇"], f: [["pencils", "✏️"], ["tires", "🛞"]] },
    ],
    3: [
      { s: "I sleep in a ___", a: ["bed", "🛏️"], f: [["tree", "🌳"], ["cup", "☕"]] },
      { s: "I drink water from a ___", a: ["glass", "🥛"], f: [["shoe", "👟"], ["book", "📖"]] },
      { s: "I open the door with a ___", a: ["key", "🔑"], f: [["spoon", "🥄"], ["sock", "🧦"]] },
      { s: "I wear shoes on my ___", a: ["feet", "🦶"], f: [["ears", "👂"], ["nose", "👃"]] },
      { s: "When it rains, I use an ___", a: ["umbrella", "☂️"], f: [["orange", "🍊"], ["egg", "🥚"]] },
      { s: "I call my friend on the ___", a: ["phone", "📱"], f: [["banana", "🍌"], ["pillow", "🛏️"]] },
      { s: "I cook eggs in a ___", a: ["pan", "🍳"], f: [["hat", "👒"], ["bed", "🛏️"]] },
      { s: "I cut paper with ___", a: ["scissors", "✂️"], f: [["a fork", "🍴"], ["a sock", "🧦"]] },
      { s: "At night, I see the ___", a: ["moon", "🌙"], f: [["sandwich", "🥪"], ["shoe", "👟"]] },
      { s: "The cow says ___", a: ["moo", "🐮"], f: [["woof", "🐶"], ["quack", "🦆"]] },
    ],
  };
  // Who does it? (Verb Network Strengthening, simplified)
  D.verbs = [
    { v: "chop", e: "🔪", pairs: [["chef", "🧑‍🍳", "onion", "🧅", "The chef chops the onion."], ["woodcutter", "🪓", "wood", "🪵", "The woodcutter chops the wood."]], no: [["fish", "🐟"], ["baby", "👶"]], noWhat: [["cloud", "☁️"], ["music", "🎵"]] },
    { v: "drive", e: "🚗", pairs: [["mom", "👩", "car", "🚗", "Mom drives the car."], ["farmer", "🧑‍🌾", "tractor", "🚜", "The farmer drives the tractor."]], no: [["cat", "🐱"], ["tree", "🌳"]], noWhat: [["banana", "🍌"], ["pillow", "🛏️"]] },
    { v: "read", e: "📖", pairs: [["student", "🧑‍🎓", "book", "📖", "The student reads the book."], ["grandpa", "👴", "newspaper", "📰", "Grandpa reads the newspaper."]], no: [["dog", "🐶"], ["rock", "🪨"]], noWhat: [["soup", "🍲"], ["shoe", "👟"]] },
    { v: "throw", e: "🤾", pairs: [["boy", "👦", "ball", "⚾", "The boy throws the ball."], ["girl", "👧", "frisbee", "🥏", "The girl throws the frisbee."]], no: [["flower", "🌸"], ["moon", "🌙"]], noWhat: [["house", "🏠"], ["cloud", "☁️"]] },
    { v: "paint", e: "🎨", pairs: [["artist", "🧑‍🎨", "picture", "🖼️", "The artist paints a picture."], ["dad", "👨", "fence", "🚧", "Dad paints the fence."]], no: [["fish", "🐟"], ["egg", "🥚"]], noWhat: [["music", "🎵"], ["wind", "🌬️"]] },
    { v: "eat", e: "🍽️", pairs: [["baby", "👶", "banana", "🍌", "The baby eats a banana."], ["dog", "🐶", "bone", "🦴", "The dog eats a bone."]], no: [["chair", "🪑"], ["car", "🚗"]], noWhat: [["phone", "📱"], ["shoe", "👟"]] },
    { v: "wash", e: "🧼", pairs: [["grandma", "👵", "dishes", "🍽️", "Grandma washes the dishes."], ["man", "👨", "car", "🚗", "The man washes the car."]], no: [["tree", "🌳"], ["cloud", "☁️"]], noWhat: [["sun", "☀️"], ["song", "🎵"]] },
    { v: "play", e: "🎵", pairs: [["musician", "🧑‍🎤", "guitar", "🎸", "The musician plays the guitar."], ["kids", "🧒", "soccer", "⚽", "The kids play soccer."]], no: [["rock", "🪨"], ["cup", "☕"]], noWhat: [["sandwich", "🥪"], ["door", "🚪"]] },
    { v: "write", e: "✍️", pairs: [["teacher", "🧑‍🏫", "note", "📝", "The teacher writes a note."], ["author", "🧑‍💻", "story", "📚", "The author writes a story."]], no: [["goat", "🐐"], ["lamp", "💡"]], noWhat: [["ice", "🧊"], ["river", "🏞️"]] },
    { v: "fix", e: "🔧", pairs: [["mechanic", "🧑‍🔧", "car", "🚗", "The mechanic fixes the car."], ["plumber", "🪠", "sink", "🚰", "The plumber fixes the sink."]], no: [["bird", "🐦"], ["cake", "🎂"]], noWhat: [["rainbow", "🌈"], ["smile", "😊"]] },
  ];

  /* ---------- Hundred Club (high-repetition articulation drill) ----------
   * Developmental groups after Shriberg's Early / Middle / Late 8. */
  D.sounds = {
    p: { group: "Early", tip: "Press your lips together, then pop! 💋", iso: "puh", syl: ["pa", "pee", "poe", "pie", "poo"],
      initial: [["pig", "🐷"], ["pie", "🥧"], ["pen", "🖊️"], ["pear", "🍐"], ["peach", "🍑"], ["pan", "🍳"], ["paint", "🎨"], ["purse", "👛"], ["pizza", "🍕"], ["panda", "🐼"], ["penguin", "🐧"], ["popcorn", "🍿"], ["pumpkin", "🎃"], ["pineapple", "🍍"]],
      final: [["cup", "🥤"], ["map", "🗺️"], ["soap", "🧼"], ["sheep", "🐑"], ["rope", "🪢"], ["grape", "🍇"], ["jeep", "🚙"], ["ship", "🚢"], ["cap", "🧢"], ["top", "🔝"]] },
    b: { group: "Early", tip: "Lips together, turn your voice on, and pop! 🎈", iso: "buh", syl: ["ba", "bee", "boe", "buy", "boo"],
      initial: [["bee", "🐝"], ["bus", "🚌"], ["bear", "🐻"], ["bed", "🛏️"], ["book", "📖"], ["boat", "⛵"], ["bike", "🚲"], ["bell", "🔔"], ["bone", "🦴"], ["ball", "🏀"], ["bird", "🐦"], ["baby", "👶"], ["banana", "🍌"], ["balloon", "🎈"], ["butterfly", "🦋"]],
      final: [["web", "🕸️"], ["crab", "🦀"], ["tub", "🛁"], ["cub", "🐻"], ["cube", "🧊"], ["globe", "🌍"], ["cob", "🌽"], ["bib", "👶"]] },
    m: { group: "Early", tip: "Close your lips and hum: mmmm. Feel the buzz! 🐝", iso: "mmm", syl: ["ma", "me", "moe", "my", "moo"],
      initial: [["moon", "🌙"], ["mouse", "🐭"], ["milk", "🥛"], ["map", "🗺️"], ["man", "👨"], ["mask", "🎭"], ["money", "💵"], ["mango", "🥭"], ["medal", "🏅"], ["melon", "🍈"], ["monkey", "🐒"], ["magnet", "🧲"], ["mushroom", "🍄"], ["mailbox", "📬"]],
      final: [["drum", "🥁"], ["broom", "🧹"], ["ham", "🍖"], ["arm", "💪"], ["thumb", "👍"], ["farm", "🚜"], ["worm", "🪱"], ["gum", "🍬"], ["ice cream", "🍦"]] },
    t: { group: "Middle", tip: "Tap your tongue tip just behind your top teeth: t, t, t. ⏱️", iso: "tuh", syl: ["ta", "tee", "toe", "tie", "too"],
      initial: [["tie", "👔"], ["tea", "🍵"], ["ten", "🔟"], ["tent", "⛺"], ["tooth", "🦷"], ["taco", "🌮"], ["taxi", "🚕"], ["tiger", "🐯"], ["turtle", "🐢"], ["turkey", "🦃"], ["tulip", "🌷"], ["tomato", "🍅"], ["teddy bear", "🧸"], ["telephone", "☎️"]],
      final: [["cat", "🐱"], ["hat", "👒"], ["boat", "⛵"], ["kite", "🪁"], ["coat", "🧥"], ["bat", "🦇"], ["goat", "🐐"], ["feet", "🦶"], ["nut", "🥜"], ["rocket", "🚀"], ["carrot", "🥕"]] },
    d: { group: "Early", tip: "Tongue tip up behind your teeth, voice on: d, d, d. 🥁", iso: "duh", syl: ["da", "dee", "doe", "die", "do"],
      initial: [["dog", "🐶"], ["duck", "🦆"], ["door", "🚪"], ["deer", "🦌"], ["dice", "🎲"], ["dart", "🎯"], ["donut", "🍩"], ["doctor", "🧑‍⚕️"], ["dancer", "💃"], ["dolphin", "🐬"], ["diamond", "💎"], ["dinosaur", "🦖"]],
      final: [["bed", "🛏️"], ["bread", "🍞"], ["bird", "🐦"], ["road", "🛣️"], ["cloud", "☁️"], ["sled", "🛷"], ["hand", "✋"], ["salad", "🥗"], ["seed", "🌱"], ["card", "🃏"]] },
    k: { group: "Middle", tip: "Lift the BACK of your tongue, like a little cough: k, k. 🎯", iso: "kuh", syl: ["ka", "key", "coe", "kai", "coo"],
      initial: [["cat", "🐱"], ["cow", "🐮"], ["car", "🚗"], ["cake", "🎂"], ["key", "🔑"], ["kite", "🪁"], ["corn", "🌽"], ["coat", "🧥"], ["king", "🤴"], ["candy", "🍬"], ["cookie", "🍪"], ["koala", "🐨"], ["carrot", "🥕"], ["camera", "📷"], ["kangaroo", "🦘"]],
      final: [["book", "📖"], ["duck", "🦆"], ["sock", "🧦"], ["cake", "🎂"], ["clock", "⏰"], ["truck", "🚚"], ["rock", "🪨"], ["milk", "🥛"], ["snake", "🐍"], ["lock", "🔒"]] },
    g: { group: "Middle", tip: "Back of the tongue up, voice on: g, g, g. 🐸", iso: "guh", syl: ["ga", "gee", "go", "guy", "goo"],
      initial: [["goat", "🐐"], ["gift", "🎁"], ["girl", "👧"], ["goose", "🪿"], ["golf", "⛳"], ["ghost", "👻"], ["gas", "⛽"], ["game", "🎮"], ["garlic", "🧄"], ["gecko", "🦎"], ["goggles", "🥽"], ["guitar", "🎸"], ["gorilla", "🦍"]],
      final: [["pig", "🐷"], ["dog", "🐶"], ["egg", "🥚"], ["bug", "🐛"], ["flag", "🚩"], ["frog", "🐸"], ["mug", "☕"], ["bag", "👜"], ["leg", "🦵"]] },
    f: { group: "Middle", tip: "Top teeth gently on your bottom lip, blow: fffff. 🌬️", iso: "fff", syl: ["fa", "fee", "foe", "fie", "foo"],
      initial: [["fish", "🐟"], ["fox", "🦊"], ["fire", "🔥"], ["foot", "🦶"], ["fork", "🍴"], ["fan", "🪭"], ["face", "😀"], ["phone", "📱"], ["fairy", "🧚"], ["farmer", "🧑‍🌾"], ["feather", "🪶"], ["football", "🏈"], ["fountain", "⛲"]],
      final: [["leaf", "🍃"], ["knife", "🔪"], ["giraffe", "🦒"], ["roof", "🏠"], ["wolf", "🐺"], ["beef", "🥩"], ["chef", "🧑‍🍳"], ["cliff", "🏔️"]] },
    s: { group: "Late", tip: "Teeth together, smile, and let the snake out: ssss. 🐍", iso: "sss", syl: ["sa", "see", "so", "sigh", "sue"],
      initial: [["sun", "☀️"], ["sock", "🧦"], ["soap", "🧼"], ["saw", "🪚"], ["seal", "🦭"], ["soup", "🍲"], ["sofa", "🛋️"], ["salad", "🥗"], ["sushi", "🍣"], ["seven", "7️⃣"], ["circle", "⭕"], ["sandwich", "🥪"], ["saxophone", "🎷"]],
      final: [["bus", "🚌"], ["house", "🏠"], ["horse", "🐴"], ["mouse", "🐭"], ["dress", "👗"], ["glass", "🥛"], ["ice", "🧊"], ["rice", "🍚"], ["juice", "🧃"], ["face", "😀"]] },
    sh: { group: "Late", tip: "Round your lips like a kiss and whisper: shhhh. 🤫", iso: "shh", syl: ["sha", "she", "show", "shy", "shoe"],
      initial: [["shoe", "👟"], ["ship", "🚢"], ["shell", "🐚"], ["sheep", "🐑"], ["shark", "🦈"], ["shirt", "👕"], ["shorts", "🩳"], ["shield", "🛡️"], ["chef", "🧑‍🍳"], ["shower", "🚿"], ["shamrock", "☘️"], ["shampoo", "🧴"]],
      final: [["fish", "🐟"], ["dish", "🍽️"], ["bush", "🌳"], ["toothbrush", "🪥"], ["cash", "💵"], ["splash", "💦"], ["wash", "🧼"]] },
    ch: { group: "Middle", tip: "Start with a t, then a sh — like a sneeze: ch, ch! 🚂", iso: "ch", syl: ["cha", "chee", "cho", "chai", "choo"],
      initial: [["cheese", "🧀"], ["chair", "🪑"], ["chick", "🐤"], ["chess", "♟️"], ["church", "⛪"], ["child", "🧒"], ["cherry", "🍒"], ["chicken", "🐔"], ["chestnut", "🌰"], ["chipmunk", "🐿️"], ["chili", "🌶️"], ["chopsticks", "🥢"], ["chocolate", "🍫"]],
      final: [["watch", "⌚"], ["peach", "🍑"], ["beach", "🏖️"], ["sandwich", "🥪"], ["couch", "🛋️"], ["lunch", "🍱"], ["witch", "🧙"], ["torch", "🔦"]] },
    l: { group: "Late", tip: "Tongue tip up behind your top teeth and sing: lalala. 🎶", iso: "lll", syl: ["la", "lee", "low", "lie", "loo"],
      initial: [["leaf", "🍃"], ["lock", "🔒"], ["leg", "🦵"], ["lips", "👄"], ["log", "🪵"], ["lion", "🦁"], ["lemon", "🍋"], ["llama", "🦙"], ["ladder", "🪜"], ["lizard", "🦎"], ["laptop", "💻"], ["lettuce", "🥬"], ["ladybug", "🐞"], ["lollipop", "🍭"]],
      final: [["ball", "⚽"], ["bell", "🔔"], ["owl", "🦉"], ["shell", "🐚"], ["doll", "🪆"], ["apple", "🍎"], ["bowl", "🥣"], ["snail", "🐌"], ["whale", "🐋"], ["pool", "🏊"]] },
    r: { group: "Late", tip: "Pull your tongue back, lips a little round, and growl: rrrr. 🐯", iso: "rrr", syl: ["ra", "ree", "row", "rye", "roo"],
      initial: [["rain", "🌧️"], ["ring", "💍"], ["rose", "🌹"], ["rock", "🪨"], ["rope", "🪢"], ["rabbit", "🐰"], ["rocket", "🚀"], ["robot", "🤖"], ["rhino", "🦏"], ["radio", "📻"], ["raccoon", "🦝"], ["rooster", "🐓"], ["rainbow", "🌈"]],
      final: [["car", "🚗"], ["star", "⭐"], ["bear", "🐻"], ["pear", "🍐"], ["door", "🚪"], ["chair", "🪑"], ["deer", "🦌"], ["tiger", "🐯"], ["flower", "🌸"], ["guitar", "🎸"]] },
    th: { group: "Late", tip: "Peek your tongue tip out between your teeth and blow: thhh. 👅", iso: "th", syl: ["tha", "thee", "tho", "thigh", "thoo"],
      initial: [["thumb", "👍"], ["three", "3️⃣"], ["think", "🤔"], ["thorn", "🌹"], ["thank you", "🙏"], ["thunder", "⛈️"], ["thermometer", "🌡️"], ["thirsty", "🥤"], ["Thursday", "📅"]],
      final: [["tooth", "🦷"], ["mouth", "👄"], ["bath", "🛁"], ["moth", "🦋"], ["math", "➗"], ["teeth", "🦷"], ["earth", "🌍"], ["north", "🧭"]] },
  };
  D.carriers = {
    phrase: ["a ___", "my ___", "the big ___", "I see a ___", "one more ___"],
    sentence: ["I like the ___.", "Look at my ___!", "Where is the ___?", "I found a ___ today.", "Can you see the ___?"],
  };

  /* ---------- Smooth Sailing (fluency shaping and loudness) ---------- */
  D.easyStarts = [
    "apple", "egg", "ice", "ocean", "open", "up", "only", "always", "every", "under",
    "I am okay", "Oh, hello", "I agree", "Excuse me", "I'm here", "Are you ready",
    "Hello", "How are you", "Have a nice day", "I would like tea", "Where is the bus",
  ];
  D.stretchPhrases = [
    "Good morning", "My name is", "I would like a coffee", "Can I help you",
    "It is a lovely day", "See you tomorrow", "I am going home now", "Thank you very much",
    "What time is it", "Let's go to the park", "I really like this song", "Nice to meet you",
  ];
  D.loudPhrases = [
    "Ahhh", "Hello!", "Good morning!", "I'm here!", "Come here!", "Let's go!",
    "Thank you!", "Watch out!", "I need help!", "That's great!",
  ];

  /* ---------- Encouragement (warm, specific, never shaming) ---------- */
  D.praise = {
    playful: ["You did it! 🎉", "Super star! ⭐", "Brilliant! 🌈", "Wow, awesome! 🚀", "High five! ✋", "Amazing work! 💫", "You rock! 🎸", "Fantastic! 🦄"],
    calm: ["Well done.", "Excellent.", "Nicely done.", "That's it.", "Great work.", "Very good.", "Lovely.", "Spot on."],
    retry: ["Let's try it together.", "Good try — one more?", "Nearly! Listen again.", "Keep going, you've got this.", "Let's hear it once more."],
  };
})(typeof window !== "undefined" ? window : globalThis);
