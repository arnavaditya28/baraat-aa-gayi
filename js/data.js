// All game content: cast, lines, crises, songs, headlines, titles.
// Everything here is original writing. No real songs, clips or celebrity material.
window.BAG = window.BAG || {};

BAG.CAST = {
  fufaji: {
    name: 'Fufaji Naraaz Singh', skin: '#c68a5a', outfit: '#5b4a9b', hair: 'turban', hat: '#c0392b',
    acc: ['mustache'], voice: 95,
    idle: [
      'Humare time pe ek glass paani bhi pooch lete the.',
      'Kursi itni neeche kyun hai?',
      'Hmph.',
      'Card mein mera naam chhota kyun likha hai?'
    ],
    angry: [
      'Mujhe kisi ne poocha hi nahi.',
      'Theek hai, hum chale jaate hain. Hum kaun hote hain.',
      '{name}, tumne bhi nahi poocha?'
    ],
    calmed: [
      'Achha... theek hai. Paneer thoda kam hai, par chalega.',
      'Hmm. Theek hai. Ek plate aur le aana.'
    ]
  },
  pinky: {
    name: 'Pinky Bua', skin: '#d79b6c', outfit: '#e84393', hair: 'bun', acc: ['bindi'], dupatta: '#fdcb6e', voice: 260,
    idle: [
      '{name} beta, tumhari shaadi kab?',
      'Ek rishta hai mere dhyaan mein!',
      'Bas photo dekh lo, dekhne mein kya jaata hai.',
      'Umar nikal rahi hai, beta.',
      'Doctor hai, Canada mein hai, bas ek baar mil lo!'
    ]
  },
  bablu: {
    name: 'Bablu Chacha', skin: '#b97a4c', outfit: '#00a8a8', hair: 'bald', acc: ['mustache'], voice: 120,
    idle: [
      'DJ! Wo wala gaana laga!',
      'Arre naacho naacho, shaadi roz roz thodi hoti hai!',
      'Mera naagin dance dekhoge? Dekhna padega.',
      'Ek hi step hai, par dil se hai!'
    ]
  },
  sharma: {
    name: 'Sharma Aunty', skin: '#e0a878', outfit: '#8e44ad', hair: 'bun', acc: ['bindi', 'glasses'], dupatta: '#f1c40f', voice: 240,
    idle: [
      'Mere Bunty ne toh 98% laaye the.',
      'Hamari Sweety ki shaadi mein toh 3 DJ the.',
      'Khana theek hai... par hamare yahan toh live counter tha.',
      '{name}, tumhara package kitna hai?'
    ],
    calmed: ['Achha achha, theek hai. Decoration achha hai. Thoda.']
  },
  mama: {
    name: 'Mama Jugaadu', skin: '#a86f45', outfit: '#d35400', hair: 'short', acc: ['mustache'], voice: 110,
    idle: ['Tension mat le, jugaad hai na.', 'Bas ek taar idhar, ek taar udhar...'],
    fail: ['Pehle toh chal raha tha.', 'Ye generator hi kharab hai.'],
    success: ['Dekha? Jugaad zindabad!', 'Mama hai toh mumkin hai!']
  },
  dadi: {
    name: 'Dadi', skin: '#c9946a', outfit: '#f5f0e6', hair: 'grey', acc: ['bindi'], dupatta: '#ffffff', voice: 200,
    idle: [
      'Muhurat nikal jaayega, sab jaldi karo!',
      'Kuch khaya? Kuch nahi khaya. Pehle kha le.',
      '{name}, idhar aa! Ek kaam hai.'
    ],
    lost: ['{name}! Mera chashma kahan hai?', 'Kisi ne mera chashma dekha?'],
    thanks: ['Jeeta reh! Ab dikh raha hai sab.', 'Mera pyaara bachcha! Jeete raho!']
  },
  selfie: {
    name: 'Selfie Didi (Riya)', skin: '#e6b08a', outfit: '#ff7675', hair: 'long', acc: ['phone'], voice: 300,
    idle: [
      'Ek photo, bas ek! Light achhi hai yahan.',
      'Story pe daal rahi hoon, smile karo!',
      '#ShaadiSeason #Blessed',
      'Filter laga ke bhejungi.'
    ]
  },
  chotu: {
    name: 'Chotu Gang', skin: '#c88a5c', outfit: '#fdcb6e', hair: 'kid', voice: 380,
    idle: ['Gulab jamun le ke bhaago!!', 'Rasgulla bhi hai kya?'],
    shooed: ['Hum toh bas khel rahe the...', 'Bhaago! Bade aa gaye!']
  },
  gupta: {
    name: 'Gupta Ji', skin: '#d29a6b', outfit: '#2d3436', hair: 'short', acc: ['phone', 'glasses'], voice: 105,
    idle: [
      'Haan haan, file bhej do, main shaadi mein hoon.',
      'Volume kam karo! Important call hai!',
      'Hello? Hello? Network nahi aa raha.'
    ]
  },
  nani: {
    name: 'Nani', skin: '#c99266', outfit: '#fab1a0', hair: 'grey', acc: ['glasses'], dupatta: '#ffeaa7', voice: 210,
    idle: ['Jeete raho beta, khush raho.', 'Itna kaam? Thoda baith ja beta.'],
    bless: ['Le, 101 rupaye. Kisi ko mat batana.', 'Jeete raho, {name}! Sab theek ho jaayega.']
  },
  dj: {
    name: 'DJ Dhamaka (Bunty)', skin: '#b5784a', outfit: '#111111', hair: 'short', acc: ['headphones', 'shades'], voice: 150,
    idle: ['Bass boost ON!!', 'Ek aur? Ek aur!', 'Shaadi ka sabse bada DJ!'],
    bad: ['Request aayi hai! Sad song chalate hain.'],
    fixed: ['Achha achha, party wala lagata hoon!']
  },
  pandey: {
    name: 'Caterer Pandey Ji', skin: '#c48855', outfit: '#ffffff', hair: 'chef', acc: ['mustache'], voice: 130,
    idle: ['Bas 5 minute, sab ready hai.', 'Paneer? Paneer toh... aa raha hai.'],
    fixed: ['Dekha? Bola tha na, sab ready hai!']
  },
  raju: {
    name: 'Raju Band Master', skin: '#b0764a', outfit: '#c0392b', hair: 'bandcap', acc: ['mustache'], voice: 125,
    idle: ['Ek aur gaana, 500 extra.', 'Band baja denge, tension mat lo!']
  },
  lallan: {
    name: 'Ghodiwala Lallan', skin: '#9c6640', outfit: '#6c5ce7', hair: 'turban', hat: '#f39c12', voice: 115,
    idle: ['Ghodi ka mood nahi hai aaj.', 'Dhol band karo, ghodi dar jaati hai!'],
    caught: ['Shabaash! Rani, chal ab ghar.']
  },
  click: {
    name: 'Click Bhaiya', skin: '#c08050', outfit: '#0984e3', hair: 'short', acc: ['camera'], voice: 160,
    idle: ['Sab log idhar! Ek family photo!', 'Thoda aur paas... aur paas... perfect!', 'Ek candid bhi le lete hain!']
  },
  tentwala: {
    name: 'Tent Wale Chacha', skin: '#a56b42', outfit: '#00b894', hair: 'cap', voice: 115,
    idle: ['Majboot hai, toofan bhi nahi gira sakta.'],
    fail: ['Hawa thodi zyada thi...']
  },
  pandit: {
    name: 'Pandit Ji', skin: '#c99064', outfit: '#f39c12', hair: 'bald', acc: [], voice: 140,
    idle: ['Muhurat 10:42 ka hai. 10:43 nahi chalega.', 'Jaldi karo yajmaan!', 'Shubh samay nikal raha hai!']
  },
  chaiwala: {
    name: 'Chai Wale Kishan', skin: '#a86c40', outfit: '#e17055', hair: 'short', acc: ['mustache'], voice: 120,
    idle: ['Garma garam chai! Ek cutting?', 'Chai pi lo, kaam apne aap ho jaayega.']
  },
  golgappa: {
    name: 'Golgappa Bhaiya', skin: '#9c6640', outfit: '#fdcb6e', hair: 'cap', voice: 125,
    idle: ['Teekha ya meetha?', 'Ek aur? Ek aur! Golgappa kabhi kam nahi padta.']
  },
  dholi: {
    name: 'Dholi Pappu', skin: '#b0764a', outfit: '#d63031', hair: 'turban', hat: '#fdcb6e', acc: ['mustache'], voice: 120,
    idle: ['Dhol bajaun? Dhinchak!', 'Mera dhol sunke ghodi bhi naachti hai.']
  },
  verma: {
    name: 'Gate Wale Verma Ji', skin: '#c48a5a', outfit: '#636e72', hair: 'short', acc: ['glasses', 'mustache'], voice: 110,
    idle: ['Card dikhao! Ladke wale ya ladki wale?', 'Bina card ke entry nahi. Rishtedaar ho toh bhi nahi.']
  },
  tina: {
    name: 'Saheli Tina', skin: '#e0a878', outfit: '#00b894', hair: 'long', acc: ['bindi'], dupatta: '#ffeaa7', voice: 300,
    idle: ['Dulhan taiyar ho rahi hai, andar mat aana!', 'Juta chupaai ka rate 21,000 hai, bata dena dulhe ko.']
  },
  dulha: { name: 'Dulha Raja', skin: '#c68b5e', outfit: '#f6e7c1', hair: 'sehra', hat: '#e17055', voice: 140,
    idle: ['Main kya karun? Main toh dulha hoon.', 'Koi mujhe paani pila do.'] },
  dulhan: { name: 'Dulhan', skin: '#dba27a', outfit: '#c0392b', hair: 'veil', dupatta: '#d63031', voice: 280,
    idle: ['Sab theek hai na? Mujhe sach batao.'] }
};

// Crisis definitions. hold = seconds of holding interact needed (solo).
BAG.CRISES = {
  paneer: {
    icon: '🧀', title: 'Bhaiya, paneer khatam!', hint: 'Kitchen pe jao, paneer banao',
    station: 'kitchen', kind: 'hold', hold: 2.6, time: 26, penalty: 12, phases: [1, 2, 3], weight: 3,
    sfx: 'cooker', fixer: 'pandey',
    fail: ['Paneer: "Main toh gaya."', 'Aur phir... paneer khatam ho gaya.']
  },
  power: {
    icon: '💡', title: 'Light chali gayi!', hint: 'Generator chalu karo',
    station: 'generator', kind: 'hold', hold: 3.2, time: 22, penalty: 14, phases: [1, 2, 3], weight: 2,
    fail: ['Jaimala in 4K: ⬛', 'Generator: "Aaj nahi."']
  },
  tent: {
    icon: '⛺', title: 'Tent tedha ho gaya!', titleRain: 'Baarish! Tent gir raha hai!', hint: 'Tent ko seedha karo',
    station: 'stage', kind: 'hold', hold: 2.8, time: 24, penalty: 12, phases: [1, 2, 3], weight: 2,
    fail: ['Tent wale Chacha: "Majboot hai."', 'Tent: *gir gaya*']
  },
  dj: {
    icon: '🎧', title: 'DJ ne sad song laga diya!', hint: 'DJ booth pe jao',
    station: 'dj', kind: 'hold', hold: 1.4, time: 18, penalty: 8, phases: [1, 2, 3], weight: 2,
    fail: ['DJ Bunty: "Request thi."', 'Dance floor: 😐']
  },
  sharma: {
    icon: '🙄', title: 'Sharma Aunty compare kar rahi hai!', hint: 'Aunty se baat karo',
    target: 'sharma', kind: 'hold', hold: 1.8, time: 20, penalty: 6, phases: [1, 2, 3], weight: 2,
    fail: ['Sharma Aunty: "Hamare yahan aisa nahi hota."']
  },
  chashma: {
    icon: '👓', title: 'Dadi ka chashma kho gaya!', hint: 'Chashma dhoondo, Dadi ko do',
    kind: 'fetch', time: 30, penalty: 5, phases: [1, 2, 3], weight: 1.4, bonus: 150,
    fail: ['Dadi: "Kisi ko meri padi hi nahi."']
  },
  fufaji: {
    icon: '😤', title: 'Fufaji naraaz ho gaye!', hint: 'Buffet se plate lo, Fufaji ko do',
    kind: 'plate', time: 30, penalty: 12, phases: [2, 3], weight: 2.4,
    fail: ['Fufaji ne ghar jaane ka faisla kar liya.', 'Fufaji: "Hum kaun hote hain."']
  },
  ghodi: {
    icon: '🐴', title: 'Ghodi bhaag gayi!!', hint: 'Rani ko pakdo (chhoo lo)',
    kind: 'chase', time: 24, penalty: 15, phases: [2, 3], weight: 1.8,
    fail: ['Ghodi ne apna career change kar liya.', 'Rani: "Main chali."']
  },
  kids: {
    icon: '🍮', title: 'Chotu gang gulab jamun loot rahi hai!', hint: 'Bachchon ko chhoo ke bhagao',
    kind: 'kids', time: 20, penalty: 8, phases: [2, 3], weight: 1.8,
    fail: ['Gulab jamun: 0. Chotu gang: 1.']
  }
};

BAG.PHASES = [
  { id: 1, name: 'Taiyari', sub: 'Sab ready hai (kuch ready nahi)', dur: 80, track: 'setup', spawnEvery: [9, 6], maxActive: [2, 3] },
  { id: 2, name: 'Baraat Aa Gayi!', sub: 'Dhol baja, ghodi saja!', dur: 90, track: 'baraat', spawnEvery: [7, 4.5], maxActive: [3, 4] },
  { id: 3, name: 'Pheras', sub: 'Muhurat 10:42 ka hai!', dur: 80, track: 'pheras', spawnEvery: [6.5, 4], maxActive: [3, 5] }
];

BAG.NEWS = {
  generic: [
    'BREAKING: Baraat raste mein, DJ ka volume 200%',
    'UPDATE: Sharma Aunty ne khane ko 6/10 diya',
    'LIVE: Chotu gang ki nazar dessert counter pe',
    'SOURCES: Tent wale Chacha ne kaha "sab majboot hai"',
    'EXCLUSIVE: Fufaji ne 3 ghante se kuch nahi khaya',
    'WEATHER: Baarish ki sambhavna, tent ki dua karein',
    'TRAFFIC: Baraat ki wajah se poora sheher ruk gaya'
  ],
  paneer: 'BREAKING: Shaadi mein paneer khatam, rishtedaaron mein aakrosh',
  power: 'BREAKING: Generator ne strike ki, Mama Jugaadu maidan mein',
  ghodi: 'LIVE: Ghodi ne apna career change kiya',
  fufaji: 'EXCLUSIVE: Fufaji naraaz, sources ke mutabik "kisi ne poocha nahi"',
  pinky: 'SOURCES: Pinky Bua ne {n} naye rishte "almost fix" kar diye',
  dances: 'VIRAL: Bablu Chacha ka ek hi step, {n} log phas gaye',
  perfect: 'GOOD NEWS: Shaadi ab tak ekdum smooth. Rishtedaar pareshaan.'
};

// Result card titles: rule(stats, ctx) => score. Highest wins.
BAG.TITLES = [
  { t: 'Fufaji Whisperer', f: s => s.fufaji >= 1 ? 2 + s.fufaji : 0 },
  { t: 'Ghodi Pakadne Mein PhD', f: s => s.ghodi >= 1 ? 2 + s.ghodi * 1.2 : 0 },
  { t: 'Paneer Ka Rakhwala', f: s => s.paneer >= 2 ? 1.5 + s.paneer : 0 },
  { t: 'Bijli Vibhag Ka CEO', f: s => s.power >= 2 ? 1.5 + s.power : 0 },
  { t: 'Jugaad Ka Baap', f: s => s.tent >= 2 ? 1.4 + s.tent : 0 },
  { t: 'DJ Ka Remote Control', f: s => s.dj >= 2 ? 1.2 + s.dj : 0 },
  { t: 'Gulab Jamun Ka Bodyguard', f: s => s.kids >= 4 ? 1 + s.kids / 2 : 0 },
  { t: 'Dadi Ka Ladla Bachcha', f: s => s.chashma >= 1 ? 2.5 + s.chashma : 0 },
  { t: 'Sharma Aunty Ka Jawab', f: s => s.sharma >= 2 ? 1.3 + s.sharma : 0 },
  { t: 'Pinky Bua Ka Favourite (Rishta Pakka?)', f: s => s.pinky >= 3 ? 2 + s.pinky : 0 },
  { t: 'Main Bhi Naachunga Champion', f: s => s.dances >= 3 ? 2 + s.dances / 2 : 0 },
  { t: 'Click Bhaiya Ka Supermodel', f: s => s.photos >= 3 ? 1.8 + s.photos / 2 : 0 },
  { t: 'Pinky Bua Se Bach Gaye', f: (s, c) => c.reachedPhase >= 2 && s.pinky === 0 ? 2.2 : 0 },
  { t: 'Shaadi Ka Asli Hero', f: (s, c) => c.won && s.isTop ? 3.5 : 0 },
  { t: 'Shaadi Mein Sirf Khaane Aaya Tha', f: s => s.fixes <= 2 ? 4 : 0 },
  { t: 'Ek Bhi Gulab Jamun Nahi Bacha', f: s => s.fixes <= 5 ? 0.5 : 0 },
  { t: 'Sab Kaam Ka Aadmi', f: () => 0.4 }
];

BAG.ACHIEVEMENTS = {
  vidaai: { t: 'Vidaai Ho Gayi', d: 'Pehli shaadi poori karwa di' },
  sharma_beta: { t: 'Sharma Ji Ka Beta', d: '80+ Izzat ke saath shaadi poori' },
  fufaji_whisperer: { t: 'Fufaji Whisperer', d: 'Fufaji ko 5 baar manaya (total)' },
  naachunga: { t: 'Main Bhi Naachunga', d: 'Ek shaadi mein Bablu Chacha ke saath 5 baar naache' },
  ghodi_dushman: { t: 'Ghodi Ka Dushman', d: 'Rani ko 3 baar bhaagne diya (total)' },
  ek_aur_photo: { t: 'Ek Aur Photo', d: 'Click Bhaiya ne 10 baar roka (total)' },
  paneer_gone: { t: 'Ek Paneer Bhi Nahi Bacha', d: 'Ek shaadi mein paneer 3 baar khatam' },
  jugaad: { t: 'Jugaad Zindabad', d: 'Mama Jugaadu ka jugaad chal gaya' },
  pinky_escape: { t: 'Rishta Proof', d: 'Poori shaadi mein Pinky Bua se ek baar bhi nahi phase' }
};

BAG.ENDINGS = {
  win: { head: 'Vidaai ho gayi!', sub: 'Sab ro rahe hain. Aap bhi.' },
  lose: { head: 'Shaadi cancel.', sub: 'Rishtedaar khush.' }
};

// Simple name filter so shared cards stay clean.
// BAD_WORDS match anywhere in the name; BAD_EXACT only as a whole word
// (so real names like Gandhi, Kuttan or Mcdonald are not blocked).
BAG.BAD_WORDS = ['fuck', 'shit', 'bitch', 'cunt', 'bsdk', 'bhosd', 'madarc', 'behenc', 'bhenc', 'lauda', 'randi', 'harami'];
BAG.BAD_EXACT = ['mc', 'bc', 'chut', 'chutiya', 'gand', 'gaand', 'lund', 'loda', 'kutta', 'kutti', 'kamina', 'chod', 'dick'];

// -------- Songs --------
// Melody tokens are eighth notes: scale degree (1-9, 8 = upper tonic), '_' prefix = lower octave,
// '.' = hold previous, '-' = rest. Bars of 8 tokens, '|' is ignored (readability only).
// Drum patterns are 16 sixteenth-steps per bar.
const KHAMAJ = [0, 2, 4, 5, 7, 9, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const BHAIRAVI = [0, 1, 3, 5, 7, 8, 10];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

BAG.TRACKS = {
  title: {
    bpm: 128, root: 62, scale: KHAMAJ, lead: 'shehnai', chords: [1, 1, 4, 5],
    drums: { dhol: 'B..tB.t.B..tB.tt', chimta: '..k...k...k...k.' },
    bassPat: 'X.....x.X.....x.',
    melody: '5 5 6 5 3 . 2 3 | 5 . 6 8 6 5 3 . | 5 5 6 5 3 . 2 1 | 2 . 3 2 1 . - -',
    lyrics: ['Dhol baja, ghodi saja,', 'Light lagi? Paneer pakka?', 'Sab bhaago, sab daudo —', 'BARAAT AA GAYI!']
  },
  setup: {
    bpm: 116, root: 60, scale: MAJOR, lead: 'flute', chords: [1, 5, 6, 4],
    drums: { dhol: 'b...t.b.b...t...', chimta: 'k.k.k.k.k.k.k.k.' },
    bassPat: 'X.......x.......',
    melody: '1 2 3 5 3 2 1 - | 3 5 6 5 3 . - - | 1 2 3 5 6 5 3 2 | 2 3 2 1 _7 1 . -',
    lyrics: ['Tent khada hai, thoda tedha hai,', 'Caterer bola "bas paanch minute", wo kehta hai.', 'Sab ready hai, sab ready hai —', '(kuch bhi ready nahi hai)']
  },
  baraat: {
    bpm: 138, root: 63, scale: KHAMAJ, lead: 'brass', chords: [1, 4, 1, 5],
    drums: { dhol: 'B.tBt.B.B.tBt.Bt', chimta: 'k.k.k.k.k.k.k.k.', clap: '....c.......c...' },
    bassPat: 'X...X...X...X...',
    melody: '1 1 3 5 5 . 3 5 | 6 5 3 . 2 3 1 . | 1 1 3 5 8 . 7 6 | 5 6 5 3 2 . 1 .',
    lyrics: ['Naachte aa rahe hain, road pe chha rahe hain,', 'Traffic ruk gaya, police bhi naach rahe hain!', 'Bhaiya side do, baraat aayi hai,', 'Mama ne note udaaye, jebein khaali hain!']
  },
  fufaji: {
    bpm: 72, root: 57, scale: BHAIRAVI, lead: 'harmonium', chords: [1, 4, 5, 1], drone: true,
    drums: { dhol: 'b.......t.......' },
    bassPat: 'X...............',
    melody: '5 . . 6 5 . 4 3 | 2 . 3 . 1 . . . | 4 . 5 6 5 . 4 3 | 2 . _7 . 1 . . .',
    lyrics: ['Kursi bhi na di, paani bhi na diya,', 'Main aaya tha pehle, kisi ne dekha bhi na...', 'Mujhe kisi ne poocha hi nahi...', '😢']
  },
  chase: {
    bpm: 168, root: 64, scale: MAJOR, lead: 'whistle', chords: [1, 5, 1, 5],
    drums: { dhol: 'BtBtB.t.BtBtB.tt', chimta: 'kkkkkkkkkkkkkkkk' },
    bassPat: 'X.x.X.x.X.x.X.x.',
    melody: '1 3 5 3 1 3 5 3 | 2 4 5 4 2 4 5 . | 1 3 5 8 5 3 1 3 | 5 4 3 2 1 . - -',
    lyrics: ['Rani bhaagi, Lallan bhaaga,', 'Peeche peeche poora baraat bhaaga!']
  },
  pinky: {
    bpm: 96, root: 60, scale: KHAMAJ, lead: 'flute', chords: [1, 4, 1, 5],
    drums: { dhol: 'b.....t.b.....t.' },
    bassPat: 'X.......X.......',
    melody: '3 . 5 . 3 2 1 . | 2 . 3 . 5 . . - | 6 . 5 . 3 2 1 . | 2 . 1 . _7 1 . -',
    lyrics: ['Ladka hai ek, doctor hai, Canada mein hai,', 'Bas ek baar mil lo beta, isme kya jaata hai...']
  },
  djsad: {
    bpm: 66, root: 55, scale: MINOR, lead: 'harmonium', chords: [1, 6, 4, 5], drone: true,
    drums: {},
    bassPat: 'X...............',
    melody: '1 . . 3 . . 2 1 | _7 . . . _5 . . . | 1 . . 3 . . 5 4 | 3 . . 2 . 1 . .',
    lyrics: ['Dil toota, dance floor bhi toota...', '(DJ Bunty: "request thi bhai")']
  },
  pheras: {
    bpm: 92, root: 62, scale: KHAMAJ, lead: 'shehnai', chords: [1, 1, 4, 1], drone: true,
    drums: { dhol: 'b.......b...t...' },
    bassPat: 'X...............',
    melody: '1 . 2 3 . 5 3 2 | 3 . . 2 1 . . . | 5 . 6 5 3 . 2 3 | 2 . 1 . . . - -',
    lyrics: ['Saat phere, saat vachan,', 'Muhurat bhaage, dil mein lagan...', 'Pandit Ji bole "jaldi karo",', 'Dadi boli "pehle kuch khaa lo"!']
  },
  vidaai: {
    bpm: 84, root: 60, scale: MAJOR, lead: 'shehnai', chords: [1, 4, 5, 1], drone: true,
    drums: { dhol: 'b.......t.......' },
    bassPat: 'X.......x.......',
    melody: '3 . 2 1 2 . 3 5 | 5 . . 3 2 . . . | 3 . 2 1 _6 . 1 2 | 1 . . . - - - -',
    lyrics: ['Sab ro rahe hain, Fufaji bhi ro rahe hain,', 'Paneer khatam, par dil bhar gaye...']
  },
  powercut: {
    bpm: 120, root: 60, scale: MAJOR, lead: null, chords: [1],
    drums: { cricket: 'x.......x..x....' }, bassPat: '................', melody: '', lyrics: ['(sannaata... sirf jhingur)', '"GENERATOR CHALU KARO!!"']
  },
  lose: {
    bpm: 70, root: 53, scale: MINOR, lead: 'harmonium', chords: [1, 6, 4, 5], drone: true,
    drums: { dhol: 'B...............' }, bassPat: 'X...............',
    melody: '5 . 4 . 3 . 2 . | 1 . . . . . . . ',
    lyrics: ['Shaadi cancel... rishtedaar khush...']
  }
};

// -------- Lines when you click a character or press E next to them --------
BAG.POKE = {
  fufaji: ['Kya hai? Ab yaad aaya Fufaji ka?', 'Maine kuch nahi kaha. Bas bata raha hoon.', 'Mera paneer kahan hai?'],
  pinky: ['Aa gaye? Ruko, ladke ki photo dikhati hoon!', '{name}, tum toh bade ho gaye! Shaadi kab?', 'Mere paas teen rishte hain, teeno doctor!'],
  bablu: ['Aaja naach le! Ek step sikhata hoon!', 'Kamar dard? Naachne se theek hota hai!', 'Ek hi step hai, par dil se hai!'],
  sharma: ['Bunty ab Canada mein hai, pata hai?', 'Hamari Sweety ne toh khud mehendi lagayi thi.', 'Decoration theek hai. Bas theek.'],
  mama: ['Kuch bhi kharab ho, Mama ko bolo.', 'Ye taar? Iska bhi jugaad hai.', 'Tape aur taar, zindagi ke do yaar.'],
  dadi: ['Kuch khaya? Jaa pehle kha ke aa!', 'Itna patla kyun ho gaya hai?', 'Humare zamaane mein shaadi saat din chalti thi.'],
  selfie: ['Ruk ruk, ek selfie! Ek, do, teen!', 'Is lighting mein main kitni achhi lag rahi hoon na?', 'Tag kar dungi, tension mat lo.'],
  chotu: ['Hum kuch nahi kar rahe!', 'Gulab jamun kahan hai?', 'Mummy ko mat batana!'],
  gupta: ['Ek minute, call pe hoon!', 'Haan haan, sab bhej diya... nahi bheja.', 'Yahan network kyun nahi aa raha?'],
  nani: ['Aa mere bachche, kuch meetha khayega?', 'Tera naam kya tha beta? Achha achha.', 'Paas aa, aashirwad le ja.'],
  dj: ['Kaunsa gaana? Bolo bolo!', 'Bass full hai, dil full hai!'],
  pandey: ['Haath mat lagao, garam hai!', 'Ek plate extra chahiye? Ho jaayega.', 'Paneer ki tension mat lo. Thodi si lo.'],
  raju: ['Dhun bajaun? Do sau lagenge.', 'Hum 1995 se baja rahe hain!'],
  lallan: ['Rani ko gussa mat dilana.', 'Ghodi ki bhi feelings hoti hain.'],
  click: ['Smile! Thoda aur! Daant dikhao!', 'Ek candid... natural raho... natural!'],
  tentwala: ['Haan haan, majboot hai. Haath mat lagao.', 'Bas teen baans pe khada hai, tension mat lo.'],
  pandit: ['Yajmaan, muhurat yaad hai na?', 'Shubh shubh bolo!'],
  dulha: ['Bhai mujhe bachao, sehra mein garmi lag rahi hai.', 'Mujhe kisi ne khana nahi diya.', 'Main kya karun? Main toh dulha hoon.'],
  dulhan: ['Mera lehenga pacchis kilo ka hai, pata hai?', 'Sab theek hai na? Sach batao!'],
  chaiwala: ['Garma garam chai! Ek cutting?', 'Chai piyo, speed badhao!'],
  golgappa: ['Teekha ya meetha?', 'Ek aur? Golgappa kabhi kam nahi padta.'],
  dholi: ['Dhol bajaun? Dhinchak!', 'Ek taal pe poori baraat naachegi!'],
  verma: ['Card dikhao! Ladke wale ya ladki wale?', 'Aap toh ghar ke ho, jao jao.'],
  tina: ['Dulhan taiyar ho rahi hai, andar mat aana!', 'Juta chupaai ka rate 21,000. Final.'],
  band: ['Pom pom pom!', 'Bhaiya note udao, josh aayega!'],
  ghodi: ['Hiiihiii!', '*Rani ne aapko ghoor ke dekha*'],
  players: ['Kaam pe dhyaan do!', 'Main busy hoon, Fufaji ko dekho!', 'Paneer bacha hai kya?']
};

// Voice settings for speech. g = m/f, pitch and rate for the browser voice.
BAG.VOICES = {
  fufaji: { g: 'm', pitch: 0.7, rate: 0.92 }, pinky: { g: 'f', pitch: 1.35, rate: 1.12 }, bablu: { g: 'm', pitch: 1.05, rate: 1.12 },
  sharma: { g: 'f', pitch: 1.15, rate: 1.0 }, mama: { g: 'm', pitch: 0.9, rate: 1.05 }, dadi: { g: 'f', pitch: 1.05, rate: 0.85 },
  selfie: { g: 'f', pitch: 1.5, rate: 1.15 }, chotu: { g: 'm', pitch: 1.9, rate: 1.25 }, gupta: { g: 'm', pitch: 0.85, rate: 1.18 },
  nani: { g: 'f', pitch: 1.1, rate: 0.82 }, dj: { g: 'm', pitch: 1.1, rate: 1.2 }, pandey: { g: 'm', pitch: 0.8, rate: 1.0 },
  raju: { g: 'm', pitch: 0.9, rate: 1.05 }, lallan: { g: 'm', pitch: 0.95, rate: 1.0 }, click: { g: 'm', pitch: 1.15, rate: 1.15 },
  tentwala: { g: 'm', pitch: 0.85, rate: 0.95 }, pandit: { g: 'm', pitch: 0.8, rate: 0.9 }, dulha: { g: 'm', pitch: 1.0, rate: 1.0 },
  dulhan: { g: 'f', pitch: 1.2, rate: 1.0 }, chaiwala: { g: 'm', pitch: 1.0, rate: 1.1 }, golgappa: { g: 'm', pitch: 0.95, rate: 1.1 },
  dholi: { g: 'm', pitch: 1.0, rate: 1.1 }, verma: { g: 'm', pitch: 0.85, rate: 1.0 }, tina: { g: 'f', pitch: 1.3, rate: 1.1 },
  kurta: { g: 'm', pitch: 1.0, rate: 1.05 }, lehenga: { g: 'f', pitch: 1.15, rate: 1.05 }
};

// DJ song requests (all original; each plays one of the tracks below).
BAG.DJ_REQUESTS = [
  { name: 'Chal Hat Fufaji (Remix)', track: 'dance' },
  { name: 'Paneer Mera Pyaar', track: 'title' },
  { name: 'Ghodi Pe Dil Aa Gaya', track: 'chase' },
  { name: 'Sharma Ji Ka Disco', track: 'dance' },
  { name: 'Hero Ki Entry (Slow Motion)', track: 'hero' },
  { name: 'Mama Jugaadu Anthem', track: 'baraat' }
];

Object.assign(BAG.TRACKS, {
  // Item-number style dance floor track
  dance: {
    bpm: 128, root: 61, scale: [0, 2, 3, 5, 7, 8, 10], lead: 'synth', chords: [1, 6, 7, 1],
    drums: { kick: 'X...X...X...X...', dhol: '..t...t...t..tt.', clap: '....c.......c...', chimta: 'k.k.k.k.k.k.k.k.' },
    bassPat: 'X.xX..x.X.xX..x.',
    melody: '5 5 . 4 3 . 1 . | 3 4 5 . 4 3 4 . | 5 5 . 4 3 . 1 3 | 2 . 1 . _7 . 1 .',
    lyrics: ['Chal hat Fufaji, aaj naachna hai!', 'Paneer khatam, par party abhi baaki hai!', 'DJ wale Bunty, volume badhao!', 'Sharma Aunty bhi naach rahi hai, dekho!']
  },
  // Slow-motion hero entry for the dulha
  hero: {
    bpm: 84, root: 52, scale: [0, 1, 4, 5, 7, 8, 10], lead: 'brass', chords: [1, 1, 2, 1], drone: true,
    drums: { kick: 'X.....X.X.......', dhol: 'B.......B..t....' },
    bassPat: 'X.....X.X.......',
    melody: '1 . . . 2 . 3 . | 5 . . . . . 3 . | 2 . . . 3 . 2 . | 1 . . . . . - -',
    lyrics: ['(slow motion mein dulha aa raha hai...)', 'Sehra bhi, swag bhi, ghodi bhi!']
  }
});

// What a character tells you about an ongoing problem when you go and talk to them.
BAG.CRISIS_TALK = {
  paneer: { npc: 'pandey', fixer: 'Pandey Ji', lines: ['Paneer khatam ho gaya! Rasoi mein haath batao, jaldi!', 'Bas 5 minute... sach mein is baar. Paneer ban raha hai.'] },
  power: { npc: 'mama', fixer: 'Mama Jugaadu', lines: ['Light gayi! Generator dekhna padega, chalo mere saath.', 'Tension mat lo, ek taar idhar, ek taar udhar...'] },
  tent: { npc: 'tentwala', fixer: 'Tent Chacha', lines: ['Tent thoda... tedha hai. Bas thoda. Pakad lo zara!', 'Majboot hai! Bas ek baans hil gaya.'] },
  dj: { npc: 'dj', fixer: 'DJ Bunty', lines: ['Kisi ne sad song ki request di thi, main kya karun?', 'Galti se lag gaya bhai, abhi badalta hoon.'] },
  sharma: { npc: 'sharma', fixer: 'Nani', lines: ['Hamare Bunty ki shaadi mein toh live counter tha. Yahan kya hai?', 'Khana thanda hai. Hamare yahan garam milta hai.'] },
  chashma: { npc: 'dadi', fixer: 'Saheli Tina', lines: ['Mera chashma kho gaya beta! Kahin dikha?', 'Bina chashme ke sab dhundhla dikh raha hai.'] },
  fufaji: { npc: 'fufaji', fixer: 'Dadi', lines: ['Mujhe kisi ne poocha hi nahi.', 'Theek hai, hum kaun hote hain. Khana bhi nahi poocha.'] },
  ghodi: { npc: 'lallan', fixer: 'Lallan', lines: ['Rani bhaag gayi!! Pakdo use!', 'Dhol ki awaaz se dar gayi bechari.'] },
  kids: { npc: 'pandey', fixer: 'Pandey Ji', lines: ['Bachche mithai pe toot pade hain! Bhagao unko!', 'Gulab jamun gin ke rakhe the, ab dekho!'] }
};

BAG.TITLES.unshift(
  { t: 'Sabse Baat Karne Wala Mehmaan', f: s => s.talks >= 8 ? 4 + s.talks / 4 : 0 },
  { t: 'Rishtedaaron Ka Favourite', f: s => s.talks >= 4 ? 3.2 : 0 }
);
