export const VOCAB_MAP: Record<string, number> = {
  "$": 0,
  ";": 1,
  ":": 2,
  ",": 3,
  ".": 4,
  "!": 5,
  "?": 6,
  "—": 9,
  "…": 10,
  "\"": 11,
  "(": 12,
  ")": 13,
  "“": 14,
  "”": 15,
  " ": 16,
  "̃": 17,
  "ʣ": 18,
  "ʥ": 19,
  "ʦ": 20,
  "ʨ": 21,
  "ᵝ": 22,
  "ꭧ": 23,
  "A": 24,
  "I": 25,
  "O": 31,
  "Q": 33,
  "S": 35,
  "T": 36,
  "W": 39,
  "Y": 41,
  "ᵊ": 42,
  "a": 43,
  "b": 44,
  "c": 45,
  "d": 46,
  "e": 47,
  "f": 48,
  "h": 50,
  "i": 51,
  "j": 52,
  "k": 53,
  "l": 54,
  "m": 55,
  "n": 56,
  "o": 57,
  "p": 58,
  "q": 59,
  "r": 60,
  "s": 61,
  "t": 62,
  "u": 63,
  "v": 64,
  "w": 65,
  "x": 66,
  "y": 67,
  "z": 68,
  "ɑ": 69,
  "ɐ": 70,
  "ɒ": 71,
  "æ": 72,
  "β": 75,
  "ɔ": 76,
  "ɕ": 77,
  "ç": 78,
  "ɖ": 80,
  "ð": 81,
  "ʤ": 82,
  "ə": 83,
  "ɚ": 85,
  "ɛ": 86,
  "ɜ": 87,
  "ɟ": 90,
  "ɡ": 92,
  "ɥ": 99,
  "ɨ": 101,
  "ɪ": 102,
  "ʝ": 103,
  "ɯ": 110,
  "ɰ": 111,
  "ŋ": 112,
  "ɳ": 113,
  "ɲ": 114,
  "ɴ": 115,
  "ø": 116,
  "ɸ": 118,
  "θ": 119,
  "œ": 120,
  "ɹ": 123,
  "ɾ": 125,
  "ɻ": 126,
  "ʁ": 128,
  "ɽ": 129,
  "ʂ": 130,
  "ʃ": 131,
  "ʈ": 132,
  "ʧ": 133,
  "ʊ": 135,
  "ʋ": 136,
  "ʌ": 138,
  "ɣ": 139,
  "ɤ": 140,
  "χ": 142,
  "ʎ": 143,
  "ʒ": 147,
  "ʔ": 148,
  "ˈ": 156,
  "ˌ": 157,
  "ː": 158,
  "ʰ": 162,
  "ʲ": 164,
  "↓": 169,
  "→": 171,
  "↗": 172,
  "↘": 173,
  "ᵻ": 177
};

const VOCAB: Record<string, number> = VOCAB_MAP;

/**
 * High-Frequency CMU / Misaki English Word to IPA Phoneme Dictionary
 */
const IPA_DICTIONARY: Record<string, string> = {
  // Common greetings & introductions
  welcome: 'wˈɛlkəm',
  to: 'tuː',
  kokoro: 'kˈoʊkəɹoʊ',
  studio: 'stˈuːdiˌoʊ',
  hello: 'həlˈoʊ',
  hi: 'hˈaɪ',
  hey: 'hˈeɪ',
  world: 'wˈɜːld',
  good: 'ɡˈʊd',
  morning: 'mˈɔːnɪŋ',
  afternoon: 'ˌæftɚnˈuːn',
  evening: 'ˈiːvnɪŋ',
  night: 'nˈaɪt',
  today: 'tədˈeɪ',
  tomorrow: 'təmˈɑːɹoʊ',
  yesterday: 'jˈɛstɚdˌeɪ',
  how: 'hˈaʊ',
  are: 'ɑːɹ',
  you: 'juː',
  your: 'jˈɔːɹ',
  yours: 'jˈɔːɹz',
  i: 'aɪ',
  me: 'mˈiː',
  my: 'mˈaɪ',
  mine: 'mˈaɪn',
  we: 'wˈiː',
  us: 'ˈʌs',
  our: 'ˈaʊɚ',
  ours: 'ˈaʊɚz',
  he: 'hˈiː',
  him: 'hˈɪm',
  his: 'hˈɪz',
  she: 'ʃˈiː',
  her: 'hˈɜː',
  hers: 'hˈɜːz',
  it: 'ˈɪt',
  its: 'ˈɪts',
  they: 'ðˈeɪ',
  them: 'ðˈɛm',
  their: 'ðˈɛɹ',
  theirs: 'ðˈɛɹz',
  this: 'ðˈɪs',
  that: 'ðˈæt',
  these: 'ðˈiːz',
  those: 'ðˈoʊz',
  the: 'ðə',
  a: 'ə',
  an: 'ən',
  and: 'ænd',
  or: 'ɔːɹ',
  but: 'bˈʌt',
  if: 'ˈɪf',
  because: 'bɪkˈʌz',
  as: 'æz',
  what: 'wˈʌt',
  which: 'wˈɪtʃ',
  who: 'hˈuː',
  whom: 'hˈuːm',
  whose: 'hˈuːz',
  when: 'wˈɛn',
  where: 'wˈɛɹ',
  why: 'wˈaɪ',
  there: 'ðˈɛɹ',
  here: 'hˈɪɹ',
  then: 'ðˈɛn',
  now: 'nˈaʊ',
  please: 'plˈiːz',
  thank: 'θˈæŋk',
  thanks: 'θˈæŋks',
  yes: 'jˈɛs',
  no: 'nˈoʊ',
  not: 'nˈɑːt',
  all: 'ˈɔːl',
  any: 'ˈɛni',
  every: 'ˈɛvɹi',
  some: 'sˈʌm',
  many: 'mˈɛni',
  much: 'mˈʌtʃ',
  more: 'mˈɔːɹ',
  most: 'mˈoʊst',
  other: 'ˈʌðɚ',
  another: 'ənˈʌðɚ',
  such: 'sˈʌtʃ',
  only: 'ˈoʊnli',
  own: 'ˈoʊn',
  same: 'sˈeɪm',
  so: 'sˈoʊ',
  than: 'ðæn',
  too: 'tˈuː',
  very: 'vˈɛɹi',
  just: 'dʒˈʌst',
  about: 'əbˈaʊt',
  above: 'əbˈʌv',
  across: 'əkɹˈɔːs',
  after: 'ˈæftɚ',
  against: 'əɡˈɛnst',
  along: 'əlˈɔːŋ',
  among: 'əmˈʌŋ',
  around: 'ɚˈaʊnd',
  at: 'æt',
  before: 'bɪfˈɔːɹ',
  behind: 'bɪhˈaɪnd',
  below: 'bɪlˈoʊ',
  beneath: 'bɪnˈiːθ',
  beside: 'bɪsˈaɪd',
  between: 'bɪtwˈiːn',
  beyond: 'bɪjˈɑːnd',
  by: 'bˈaɪ',
  down: 'dˈaʊn',
  during: 'dˈʊɹɪŋ',
  for: 'fˈɔːɹ',
  from: 'fɹˈʌm',
  in: 'ˈɪn',
  into: 'ˈɪntuː',
  near: 'nˈɪɹ',
  of: 'ʌv',
  off: 'ˈɔːf',
  on: 'ˈɑːn',
  onto: 'ˈɑːntuː',
  out: 'ˈaʊt',
  outside: 'ˌaʊtsˈaɪd',
  over: 'ˈoʊvɚ',
  through: 'θɹˈuː',
  throughout: 'θɹuːˈaʊt',
  till: 'tˈɪl',
  under: 'ˈʌndɚ',
  until: 'əntˈɪl',
  up: 'ˈʌp',
  upon: 'əpˈɑːn',
  with: 'wˈɪð',
  within: 'wɪðˈɪn',
  without: 'wɪðˈaʊt',

  // Tech, Speech & AI terms
  speech: 'spˈiːtʃ',
  voice: 'vˈɔɪs',
  voices: 'vˈɔɪsɪz',
  audio: 'ˈɔːdiˌoʊ',
  sound: 'sˈaʊnd',
  sounds: 'sˈaʊndz',
  text: 'tˈɛkst',
  texts: 'tˈɛksts',
  tts: 'tˌiːtˌiːˈɛs',
  ai: 'ˌeɪˈaɪ',
  model: 'mˈɑːdəl',
  models: 'mˈɑːdəlz',
  neural: 'nˈjʊəɹəl',
  network: 'nˈɛtwˌɜːk',
  networks: 'nˈɛtwˌɜːks',
  synthesis: 'sˈɪnθəsɪs',
  synthesizer: 'sˈɪnθəsˌaɪzɚ',
  synthesize: 'sˈɪnθəsˌaɪz',
  synthesizing: 'sˈɪnθəsˌaɪzɪŋ',
  synthesized: 'sˈɪnθəsˌaɪzd',
  generate: 'dʒˈɛnɚˌeɪt',
  generating: 'dʒˈɛnɚˌeɪtɪŋ',
  generation: 'dʒˌɛnɚˈeɪʃən',
  device: 'dɪvˈaɪs',
  mobile: 'mˈoʊbəl',
  offline: 'ˈɔːflˌaɪn',
  online: 'ˈɑːnlˌaɪn',
  turbo: 'tˈɜːboʊ',
  master: 'mˈæstɚ',
  quality: 'kwˈɑːləti',
  high: 'hˈaɪ',
  speed: 'spˈiːd',
  fast: 'fˈæst',
  faster: 'fˈæstɚ',
  fastest: 'fˈæstɪst',
  natural: 'nˈætʃɚəl',
  human: 'hjˈuːmən',
  real: 'ɹˈiːl',
  realistic: 'ɹˌiːəlˈɪstɪk',
  crystal: 'kɹˈɪstəl',
  clear: 'klˈɪɹ',
  clean: 'klˈiːn',
  sample: 'sˈæmpəl',
  rate: 'ɹˈeɪt',
  test: 'tˈɛst',
  testing: 'tˈɛstɪŋ',
  preview: 'pɹˈiːvjˌuː',
  render: 'ɹˈɛndɚ',
  rendering: 'ɹˈɛndɚɪŋ',
  playback: 'plˈeɪbˌæk',
  play: 'plˈeɪ',
  stop: 'stˈɑːp',
  pause: 'pˈɔːz',
  volume: 'vˈɑːljuːm',
  pitch: 'pˈɪtʃ',
  blend: 'blˈɛnd',
  blending: 'blˈɛndɪŋ',
  preset: 'pɹˈiːsˌɛt',
  presets: 'pɹˈiːsˌɛts',
  history: 'hˈɪstɚi',
  settings: 'sˈɛtɪŋz',
  download: 'dˈaʊnlˌoʊd',
  downloaded: 'dˈaʊnlˌoʊdɪd',
  downloading: 'dˈaʊnlˌoʊdɪŋ',
  file: 'fˈaɪl',
  files: 'fˈaɪlz',
  save: 'sˈeɪv',
  saved: 'sˈeɪvd',
  share: 'ʃˈɛɹ',
  export: 'ˈɛkspɔːɹt',
  exporting: 'ˈɛkspɔːɹtɪŋ',

  // Common verbs & auxiliaries
  is: 'ˈɪz',
  am: 'æm',
  was: 'wˈʌz',
  were: 'wˈɜː',
  be: 'bˈiː',
  been: 'bˈɪn',
  being: 'bˈiːɪŋ',
  have: 'hæv',
  has: 'hæz',
  had: 'hæd',
  do: 'dˈuː',
  does: 'dˈʌz',
  did: 'dˈɪd',
  done: 'dˈʌn',
  doing: 'dˈuːɪŋ',
  can: 'kæn',
  could: 'kˈʊd',
  will: 'wˈɪl',
  would: 'wˈʊd',
  shall: 'ʃæl',
  should: 'ʃˈʊd',
  may: 'mˈeɪ',
  might: 'mˈaɪt',
  must: 'mˈʌst',
  say: 'sˈeɪ',
  says: 'sˈɛz',
  said: 'sˈɛd',
  tell: 'tˈɛl',
  told: 'tˈoʊld',
  speak: 'spˈiːk',
  speaks: 'spˈiːks',
  speaking: 'spˈiːkɪŋ',
  spoken: 'spˈoʊkən',
  talk: 'tˈɔːk',
  talking: 'tˈɔːkɪŋ',
  listen: 'lˈɪsən',
  listening: 'lˈɪsənɪŋ',
  hear: 'hˈɪɹ',
  heard: 'hˈɜːd',
  look: 'lˈʊk',
  see: 'sˈiː',
  seen: 'sˈiːn',
  saw: 'sˈɔː',
  know: 'nˈoʊ',
  knew: 'nˈuː',
  known: 'nˈoʊn',
  think: 'θˈɪŋk',
  thought: 'θˈɔːt',
  make: 'mˈeɪk',
  made: 'mˈeɪd',
  get: 'ɡˈɛt',
  got: 'ɡˈɑːt',
  gotten: 'ɡˈɑːtən',
  go: 'ɡˈoʊ',
  goes: 'ɡˈoʊz',
  went: 'wˈɛnt',
  gone: 'ɡˈɔːn',
  going: 'ɡˈoʊɪŋ',
  come: 'kˈʌm',
  came: 'kˈeɪm',
  coming: 'kˈʌmɪŋ',
  take: 'tˈeɪk',
  took: 'tˈʊk',
  taken: 'tˈeɪkən',
  give: 'ɡˈɪv',
  gave: 'ɡˈeɪv',
  given: 'ɡˈɪvən',
  find: 'fˈaɪnd',
  found: 'fˈaʊnd',
  feel: 'fˈiːl',
  felt: 'fˈɛlt',
  try: 'tɹˈaɪ',
  tried: 'tɹˈaɪd',
  use: 'jˈuːz',
  used: 'jˈuːzd',
  work: 'wˈɜːk',
  works: 'wˈɜːks',
  working: 'wˈɜːkɪŋ',
  call: 'kˈɔːl',
  called: 'kˈɔːld',
  need: 'nˈiːd',
  needed: 'nˈiːdɪd',
  want: 'wˈɑːnt',
  wanted: 'wˈɑːntɪd',
  help: 'hˈɛlp',
  helped: 'hˈɛlpt',
  start: 'stˈɑːɹt',
  started: 'stˈɑːɹtɪd',
  show: 'ʃˈoʊ',
  showed: 'ʃˈoʊd',
  shown: 'ʃˈoʊn',
  live: 'lˈɪv',
  love: 'lˈʌv',
  like: 'lˈaɪk',
  liked: 'lˈaɪkt',
  learn: 'lˈɜːn',
  read: 'ɹˈiːd',
  write: 'ɹˈaɪt',
  written: 'ɹˈɪtən',

  // Numbers (words)
  zero: 'zˈɪɹoʊ',
  one: 'wˈʌn',
  two: 'tˈuː',
  three: 'θɹˈiː',
  four: 'fˈɔːɹ',
  five: 'fˈaɪv',
  six: 'sˈɪks',
  seven: 'sˈɛvən',
  eight: 'ˈeɪt',
  nine: 'nˈaɪn',
  ten: 'tˈɛn',
  eleven: 'ɪlˈɛvən',
  twelve: 'twˈɛlv',
  thirteen: 'θɚtˈiːn',
  fourteen: 'fɔːɹtˈiːn',
  fifteen: 'fɪftˈiːn',
  sixteen: 'sɪkstˈiːn',
  seventeen: 'sɛvəntˈiːn',
  eighteen: 'eɪtˈiːn',
  nineteen: 'naɪntˈiːn',
  twenty: 'twˈɛnti',
  thirty: 'θˈɜːti',
  forty: 'fˈɔːɹti',
  fifty: 'fˈɪfti',
  sixty: 'sˈɪksti',
  seventy: 'sˈɛvənti',
  eighty: 'ˈeɪti',
  ninety: 'nˈaɪnti',
  hundred: 'hˈʌndɹəd',
  thousand: 'θˈaʊzənd',
  million: 'mˈɪljən',
  billion: 'bˈɪljən',
  first: 'fˈɜːst',
  second: 'sˈɛkənd',
  third: 'θˈɜːd',
  fourth: 'fˈɔːɹθ',
  fifth: 'fˈɪfθ',
  sixth: 'sˈɪksθ',
  seventh: 'sˈɛvənθ',
  eighth: 'ˈeɪtθ',
  ninth: 'nˈaɪnθ',
  tenth: 'tˈɛnθ',
  percent: 'pɚsˈɛnt',
  dollar: 'dˈɑːlɚ',
  dollars: 'dˈɑːlɚz',
  cent: 'sˈɛnt',
  cents: 'sˈɛnts',
  euro: 'jˈʊɹoʊ',
  euros: 'jˈʊɹoʊz',
  pound: 'pˈaʊnd',
  pounds: 'pˈaʊndz',
};

const NUMBER_WORDS: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
  '13': 'thirteen',
  '14': 'fourteen',
  '15': 'fifteen',
  '16': 'sixteen',
  '17': 'seventeen',
  '18': 'eighteen',
  '19': 'nineteen',
  '20': 'twenty',
  '30': 'thirty',
  '40': 'forty',
  '50': 'fifty',
  '60': 'sixty',
  '70': 'seventy',
  '80': 'eighty',
};

const JA_KANJI_DICT: Record<string, string> = {
  '音声合成': 'オンセイゴーセイ',
  '音声': 'オンセイ',
  '合成': 'ゴーセイ',
  '日本語': 'ニホンゴ',
  '日本': 'ニホン',
  '再現性': 'サイゲンセイ',
  '再現': 'サイゲン',
  '技術': 'ギジュツ',
  '世界': 'セカイ',
  '東京': 'トーキョー',
  '今日': 'キョー',
  '明日': 'アシタ',
  '友達': 'トモダチ',
  '学校': 'ガッコー',
  '会社': 'カイシャ',
  '仕事': 'シゴト',
  '勉強': 'ベンキョー',
  '音楽': 'オンガク',
  '映画': 'エイガ',
  '言葉': 'コトバ',
  '先生': 'センセイ',
  '学生': 'ガクセイ',
  '私': 'ワタシ',
  '僕': 'ボク',
  '人': 'ヒト',
  '人間': 'ニンゲン',
  '時間': 'ジカン',
  '電話': 'デンワ',
  '写真': 'シャシン',
  '旅行': 'リョコー',
  '食事': 'ショクジ',
  '料理': 'リョーリ',
  '朝': 'アサ',
  '夜': 'ヨル',
  '昼': 'ヒル',
  '今': 'イマ',
  '前': 'マエ',
  '後': 'アト',
  '水': 'ミズ',
  '火': 'ヒ',
  '木': 'キ',
  '金': 'カネ',
  '土': 'ツチ',
  '月': 'ツキ',
  '日': 'ヒ',
  '本': 'ホン',
  '車': 'クルマ',
  '電車': 'デンシャ',
  '駅': 'エキ',
  '家': 'イエ',
  '家族': 'カゾク',
  '父': 'チチ',
  '母': 'ハハ',
  '兄': 'アニ',
  '姉': 'アネ',
  '弟': 'オトウト',
  '妹': 'イモウト',
  '男': 'オトコ',
  '女': 'オンナ',
  '子': 'コ',
  '子供': 'コドモ',
  '手': 'テ',
  '目': 'メ',
  '口': 'クチ',
  '耳': 'ミミ',
  '足': 'アシ',
  '心': 'ココロ',
  '道': 'ミチ',
  '空': 'ソラ',
  '海': 'ウミ',
  '山': 'ヤマ',
  '川': 'カワ',
  '花': 'ハナ',
  '雨': 'アメ',
  '雪': 'ユキ',
  '風': 'カゼ',
  '春': 'ハル',
  '夏': 'ナツ',
  '秋': 'アキ',
  '冬': 'フユ',
};

const JA_M2P: Record<string, string> = {
  'ア': 'a', 'イ': 'i', 'ウ': 'ɯ', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'kɯ', 'ケ': 'ke', 'コ': 'ko',
  'ガ': 'ɡa', 'ギ': 'ɡi', 'グ': 'ɡɯ', 'ゲ': 'ɡe', 'ゴ': 'ɡo',
  'サ': 'sa', 'シ': 'ɕi', 'ス': 'sɯ', 'セ': 'se', 'ソ': 'so',
  'ザ': 'za', 'ジ': 'ʥi', 'ズ': 'zɯ', 'ゼ': 'ze', 'ゾ': 'zo',
  'タ': 'ta', 'チ': 'ʨi', 'ツ': 'ʦɯ', 'テ': 'te', 'ト': 'to',
  'ダ': 'da', 'ヂ': 'ʥi', 'ヅ': 'zɯ', 'デ': 'de', 'ド': 'do',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nɯ', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'ɸɯ', 'ヘ': 'he', 'ホ': 'ho',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bɯ', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pɯ', 'ペ': 'pe', 'ポ': 'po',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mɯ', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ja', 'ユ': 'jɯ', 'ヨ': 'jo',
  'ラ': 'ɾa', 'リ': 'ɾi', 'ル': 'ɾɯ', 'レ': 'ɾe', 'ロ': 'ɾo',
  'ワ': 'wa', 'ヲ': 'o', 'ン': 'ɴ', 'ッ': 'ʔ', 'ー': 'ː',
  'キャ': 'kʲa', 'キュ': 'kʲɯ', 'キョ': 'kʲo',
  'ギャ': 'ɡʲa', 'ギュ': 'ɡʲɯ', 'ギョ': 'ɡʲo',
  'シャ': 'ɕa', 'シュ': 'ɕɯ', 'ショ': 'ɕo', 'シェ': 'ɕe',
  'ジャ': 'ʥa', 'ジュ': 'ʥɯ', 'ジョ': 'ʥo', 'ジェ': 'ʥe',
  'チャ': 'ʨa', 'チュ': 'ʨɯ', 'チョ': 'ʨo', 'チェ': 'ʨe',
  'ニャ': 'ɲa', 'ニュ': 'ɲɯ', 'ニョ': 'ɲo',
  'ヒャ': 'ça', 'ヒュ': 'çɯ', 'ヒョ': 'ço',
  'ビャ': 'bʲa', 'ビュ': 'bʲɯ', 'ビョ': 'bʲo',
  'ピャ': 'pʲa', 'ピュ': 'pʲɯ', 'ピョ': 'pʲo',
  'ミャ': 'mʲa', 'ミュ': 'mʲɯ', 'ミョ': 'mʲo',
  'リャ': 'ɾʲa', 'リュ': 'ɾʲɯ', 'リョ': 'ɾʲo',
  'ファ': 'ɸa', 'フィ': 'ɸi', 'フェ': 'ɸe', 'フォ': 'ɸo',
  'ティ': 'ti', 'ディ': 'di', 'トゥ': 'tɯ', 'ドゥ': 'dɯ',
  'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
};

export class Tokenizer {
  /**
   * Convert an integer (0 to 999,999,999) to English words
   */
  private static numberToWords(num: number): string {
    if (num === 0) return 'zero';
    if (num < 0) return 'minus ' + this.numberToWords(Math.abs(num));

    let words = '';

    if (Math.floor(num / 1000000) > 0) {
      words += this.numberToWords(Math.floor(num / 1000000)) + ' million ';
      num %= 1000000;
    }

    if (Math.floor(num / 1000) > 0) {
      words += this.numberToWords(Math.floor(num / 1000)) + ' thousand ';
      num %= 1000;
    }

    if (Math.floor(num / 100) > 0) {
      words += this.numberToWords(Math.floor(num / 100)) + ' hundred ';
      num %= 100;
    }

    if (num > 0) {
      if (num < 20) {
        words += NUMBER_WORDS[String(num)] || '';
      } else {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        words += NUMBER_WORDS[String(tens)] || '';
        if (ones > 0) {
          words += '-' + (NUMBER_WORDS[String(ones)] || '');
        }
      }
    }

    return words.trim();
  }

  /**
   * Comprehensive text normalization for TTS synthesis
   */
  public static normalizeText(rawText: string): string {
    if (!rawText) return '';
    let text = rawText.normalize ? rawText.normalize('NFC') : rawText;

    // Standardize all apostrophe variants to ASCII single quote (') for perfect French/English elision
    text = text.replace(/[’‘ʼ`´ʹꞌ\u2019\u2018\u02bc]/g, "'");

    // Standardize smart quotes and guillemets
    text = text.replace(/[“”«»\u201c\u201d\u00ab\u00bb]/g, '"');

    // 1. Currency expansions
    text = text.replace(/\$(\d+(\.\d+)?)/g, (_match, num) => {
      const parts = num.split('.');
      const dollars = parseInt(parts[0], 10);
      let res = `${this.numberToWords(dollars)} ${dollars === 1 ? 'dollar' : 'dollars'}`;
      if (parts[1]) {
        const cents = parseInt(parts[1].slice(0, 2), 10);
        if (cents > 0) {
          res += ` and ${this.numberToWords(cents)} ${cents === 1 ? 'cent' : 'cents'}`;
        }
      }
      return res;
    });

    text = text.replace(/€(\d+(\.\d+)?)/g, (_match, num) => {
      const euros = parseInt(num, 10);
      return `${this.numberToWords(euros)} ${euros === 1 ? 'euro' : 'euros'}`;
    });

    text = text.replace(/£(\d+(\.\d+)?)/g, (_match, num) => {
      const pounds = parseInt(num, 10);
      return `${this.numberToWords(pounds)} ${pounds === 1 ? 'pound' : 'pounds'}`;
    });

    // 2. Percentages & symbols
    text = text.replace(/(\d+)%/g, (_match, num) => `${this.numberToWords(parseInt(num, 10))} percent`);
    text = text.replace(/&/g, ' and ');
    text = text.replace(/@/g, ' at ');
    text = text.replace(/\+/g, ' plus ');
    text = text.replace(/=/g, ' equals ');
    text = text.replace(/#/g, ' number ');

    // 3. Ordinals (1st, 2nd, 3rd, 4th, ...)
    text = text.replace(/\b1st\b/gi, 'first');
    text = text.replace(/\b2nd\b/gi, 'second');
    text = text.replace(/\b3rd\b/gi, 'third');
    text = text.replace(/\b4th\b/gi, 'fourth');
    text = text.replace(/\b5th\b/gi, 'fifth');
    text = text.replace(/\b6th\b/gi, 'sixth');
    text = text.replace(/\b7th\b/gi, 'seventh');
    text = text.replace(/\b8th\b/gi, 'eighth');
    text = text.replace(/\b9th\b/gi, 'ninth');
    text = text.replace(/\b10th\b/gi, 'tenth');
    text = text.replace(/(\d+)th\b/gi, (_match, num) => `${this.numberToWords(parseInt(num, 10))}th`);

    // 4. Standalone decimal numbers (e.g. 3.14 -> three point one four)
    text = text.replace(/(\d+)\.(\d+)/g, (_match, intPart, decPart) => {
      const intWords = this.numberToWords(parseInt(intPart, 10));
      const decWords = decPart
        .split('')
        .map((d: string) => NUMBER_WORDS[d] || d)
        .join(' ');
      return `${intWords} point ${decWords}`;
    });

    // 5. Standalone integers (e.g. 2026 -> twenty twenty-six or two thousand twenty-six)
    text = text.replace(/\b\d{1,9}\b/g, (match) => {
      const val = parseInt(match, 10);
      if (match.length === 4 && val >= 1900 && val <= 2099) {
        const century = Math.floor(val / 100);
        const year = val % 100;
        if (year === 0) return `${this.numberToWords(century)} hundred`;
        if (year < 10) return `${this.numberToWords(century)} o ${this.numberToWords(year)}`;
        return `${this.numberToWords(century)} ${this.numberToWords(year)}`;
      }
      return this.numberToWords(val);
    });

    // 6. Common abbreviations
    text = text.replace(/\bDr\./gi, 'Doctor');
    text = text.replace(/\bMr\./gi, 'Mister');
    text = text.replace(/\bMrs\./gi, 'Missus');
    text = text.replace(/\bMs\./gi, 'Miss');
    text = text.replace(/\bProf\./gi, 'Professor');
    text = text.replace(/\bSt\./gi, 'Saint');
    text = text.replace(/\bAve\./gi, 'Avenue');
    text = text.replace(/\bRd\./gi, 'Road');
    text = text.replace(/\bBlvd\./gi, 'Boulevard');
    text = text.replace(/\betc\./gi, 'et cetera');
    text = text.replace(/\be\.g\./gi, 'for example');
    text = text.replace(/\bi\.e\./gi, 'that is');
    text = text.replace(/\bvs\./gi, 'versus');
    text = text.replace(/\bvs\b/gi, 'versus');

    // 7. Expand contractions
    text = text.replace(/\bwon't\b/gi, 'will not');
    text = text.replace(/\bcan't\b/gi, 'cannot');
    text = text.replace(/\bain't\b/gi, 'is not');
    text = text.replace(/\bdon't\b/gi, 'do not');
    text = text.replace(/\bdoesn't\b/gi, 'does not');
    text = text.replace(/\bdidn't\b/gi, 'did not');
    text = text.replace(/\bshouldn't\b/gi, 'should not');
    text = text.replace(/\bwouldn't\b/gi, 'would not');
    text = text.replace(/\bcouldn't\b/gi, 'could not');
    text = text.replace(/\bi'm\b/gi, 'I am');
    text = text.replace(/\byou're\b/gi, 'you are');
    text = text.replace(/\bwe're\b/gi, 'we are');
    text = text.replace(/\bthey're\b/gi, 'they are');
    text = text.replace(/\bit's\b/gi, 'it is');
    text = text.replace(/\bthat's\b/gi, 'that is');
    text = text.replace(/\bwhat's\b/gi, 'what is');
    text = text.replace(/\bthere's\b/gi, 'there is');
    text = text.replace(/\bhere's\b/gi, 'here is');

    // 8. Clean up whitespace
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Rule-based Letter-to-Phoneme (LTS) converter for OOD/unseen English words
   */
  private static ruleBasedG2P(word: string): string {
    const w = word.toLowerCase();
    let ipa = '';
    let i = 0;
    const len = w.length;

    while (i < len) {
      const rest = w.slice(i);

      // Digraphs & trigraphs
      if (rest.startsWith('tch')) {
        ipa += 'tʃ';
        i += 3;
      } else if (rest.startsWith('ch')) {
        ipa += 'tʃ';
        i += 2;
      } else if (rest.startsWith('sh')) {
        ipa += 'ʃ';
        i += 2;
      } else if (rest.startsWith('th')) {
        ipa += 'θ';
        i += 2;
      } else if (rest.startsWith('ph')) {
        ipa += 'f';
        i += 2;
      } else if (rest.startsWith('wh')) {
        ipa += 'w';
        i += 2;
      } else if (rest.startsWith('ck')) {
        ipa += 'k';
        i += 2;
      } else if (rest.startsWith('ng')) {
        ipa += 'ŋ';
        i += 2;
      } else if (rest.startsWith('qu')) {
        ipa += 'kw';
        i += 2;
      } else if (rest.startsWith('igh')) {
        ipa += 'aɪ';
        i += 3;
      } else if (rest.startsWith('ee') || rest.startsWith('ea')) {
        ipa += 'iː';
        i += 2;
      } else if (rest.startsWith('oo')) {
        ipa += 'uː';
        i += 2;
      } else if (rest.startsWith('ou') || rest.startsWith('ow')) {
        ipa += 'aʊ';
        i += 2;
      } else if (rest.startsWith('oi') || rest.startsWith('oy')) {
        ipa += 'ɔɪ';
        i += 2;
      } else if (rest.startsWith('ai') || rest.startsWith('ay')) {
        ipa += 'eɪ';
        i += 2;
      } else if (rest.startsWith('oa')) {
        ipa += 'oʊ';
        i += 2;
      } else if (rest.startsWith('au') || rest.startsWith('aw')) {
        ipa += 'ɔː';
        i += 2;
      } else if (rest.startsWith('er') || rest.startsWith('ir') || rest.startsWith('ur')) {
        ipa += 'ɚ';
        i += 2;
      } else if (rest.startsWith('ar')) {
        ipa += 'ɑːɹ';
        i += 2;
      } else if (rest.startsWith('or')) {
        ipa += 'ɔːɹ';
        i += 2;
      } else {
        const char = w[i];
        switch (char) {
          case 'a':
            ipa += (i + 2 < len && w[i + 2] === 'e') ? 'eɪ' : 'æ';
            break;
          case 'b':
            ipa += 'b';
            break;
          case 'c':
            ipa += (i + 1 < len && 'eiy'.includes(w[i + 1])) ? 's' : 'k';
            break;
          case 'd':
            ipa += 'd';
            break;
          case 'e':
            if (i === len - 1 && len > 2) {
              // Silent final 'e'
            } else {
              ipa += 'ɛ';
            }
            break;
          case 'f':
            ipa += 'f';
            break;
          case 'g':
            ipa += (i + 1 < len && 'eiy'.includes(w[i + 1])) ? 'dʒ' : 'ɡ';
            break;
          case 'h':
            ipa += 'h';
            break;
          case 'i':
            ipa += (i + 2 < len && w[i + 2] === 'e') ? 'aɪ' : 'ɪ';
            break;
          case 'j':
            ipa += 'dʒ';
            break;
          case 'k':
            ipa += 'k';
            break;
          case 'l':
            ipa += 'l';
            break;
          case 'm':
            ipa += 'm';
            break;
          case 'n':
            ipa += 'n';
            break;
          case 'o':
            ipa += (i + 2 < len && w[i + 2] === 'e') ? 'oʊ' : 'ɑ';
            break;
          case 'p':
            ipa += 'p';
            break;
          case 'q':
            ipa += 'k';
            break;
          case 'r':
            ipa += 'ɹ';
            break;
          case 's':
            ipa += 's';
            break;
          case 't':
            ipa += 't';
            break;
          case 'u':
            ipa += (i + 2 < len && w[i + 2] === 'e') ? 'uː' : 'ʌ';
            break;
          case 'v':
            ipa += 'v';
            break;
          case 'w':
            ipa += 'w';
            break;
          case 'x':
            ipa += 'ks';
            break;
          case 'y':
            ipa += (i === 0) ? 'j' : 'i';
            break;
          case 'z':
            ipa += 'z';
            break;
          case 'â':
            ipa += 'ɑː';
            break;
          case 'à':
            ipa += 'a';
            break;
          case 'é':
            ipa += 'e';
            break;
          case 'è':
            ipa += 'ɛ';
            break;
          case 'ê':
          case 'ë':
            ipa += 'ɛː';
            break;
          case 'ç':
            ipa += 's';
            break;
          case 'î':
            ipa += 'iː';
            break;
          case 'ï':
            ipa += 'i';
            break;
          case 'ô':
            ipa += 'oː';
            break;
          case 'ù':
          case 'û':
          case 'ü':
            ipa += 'y';
            break;
          case 'œ':
            ipa += 'œ';
            break;
          case 'æ':
            ipa += 'e';
            break;
          case 'ñ':
            ipa += 'ɲ';
            break;
          default:
            ipa += char;
            break;
        }
        i += 1;
      }
    }

    return ipa ? `ˈ${ipa}` : ipa;
  }

  /**
   * Convert Japanese Hiragana to Katakana
   */
  private static hiraToKata(str: string): string {
    return str.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  }

  /**
   * Morphological Japanese preprocessor for topic/direction particles
   */
  private static preprocessJapaneseParticles(text: string): string {
    let processed = text.replace(/こんにちは/g, 'コンニチ_WA_').replace(/こんばんは/g, 'コンバン_WA_');
    processed = processed.replace(/ではありません/g, 'デワアリマセン');
    processed = processed.replace(/ではない/g, 'デワナイ');
    processed = processed.replace(/では/g, 'デワ');
    processed = processed.replace(/ては/g, 'テワ');
    processed = processed.replace(/には/g, 'ニワ');
    processed = processed.replace(/からは/g, 'カラワ');
    processed = processed.replace(/までは/g, 'マデワ');
    processed = processed.replace(/とは/g, 'トワ');
    processed = processed.replace(/へは/g, 'エワ');
    processed = processed.replace(/よりは/g, 'ヨリワ');
    return processed;
  }

  /**
   * Japanese Kanji/Kana to Kokoro IPA phoneme converter
   */
  public static japaneseTextToKokoroIpa(rawText: string): string {
    let text = this.preprocessJapaneseParticles(rawText);

    // Apply Kanji dictionary substitutions (longest match first)
    const kanjiKeys = Object.keys(JA_KANJI_DICT).sort((a, b) => b.length - a.length);
    for (const k of kanjiKeys) {
      if (text.includes(k)) {
        text = text.split(k).join(JA_KANJI_DICT[k]);
      }
    }

    text = this.hiraToKata(text);
    text = text.replace(/_WA_/g, 'ワ');

    let ipa = '';
    let i = 0;
    const len = text.length;

    while (i < len) {
      if (i + 1 < len && JA_M2P[text.slice(i, i + 2)]) {
        ipa += JA_M2P[text.slice(i, i + 2)];
        i += 2;
      } else if (JA_M2P[text[i]]) {
        ipa += JA_M2P[text[i]];
        i += 1;
      } else if (text[i] === ' ' || text[i] === '　') {
        ipa += ' ';
        i += 1;
      } else if (/[、,，]/.test(text[i])) {
        ipa += ', ';
        i += 1;
      } else if (/[。.]/.test(text[i])) {
        ipa += '. ';
        i += 1;
      } else if (/[！？!?]/.test(text[i])) {
        ipa += '! ';
        i += 1;
      } else {
        ipa += text[i];
        i += 1;
      }
    }

    // Filter strictly through Kokoro vocabulary
    const validIpa = ipa
      .split('')
      .filter((char) => VOCAB_MAP[char] !== undefined || char === ' ')
      .join('');

    return validIpa.replace(/\s+/g, ' ').trim();
  }

  /**
   * Check if text contains Japanese characters (Hiragana, Katakana, Kanji)
   */
  public static isJapaneseText(text: string): boolean {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  }

  /**
   * Convert normalized input text to full Kokoro-compatible IPA phoneme string
   */
  public static textToPhonemes(text: string): string {
    if (this.isJapaneseText(text)) {
      return this.japaneseTextToKokoroIpa(text);
    }
    const normalized = this.normalizeText(text);
    const tokens = normalized.split(/([.,!?;:—…()"“"\s]+)/);

    const ipaParts: string[] = [];

    for (const token of tokens) {
      if (!token) continue;

      if (/^[.,!?;:—…()"“”\s]+$/.test(token)) {
        ipaParts.push(token);
      } else {
        const cleanWord = token.toLowerCase().replace(/[^a-zà-öø-ÿ\u0100-\u017f']/g, '');
        if (cleanWord) {
          if (cleanWord.includes("'")) {
            // Handle French/English contractions like l'arbre, qu'il, d'accord, c'est, j'ai
            const subparts = cleanWord.split("'");
            for (let sIdx = 0; sIdx < subparts.length; sIdx++) {
              const sub = subparts[sIdx];
              if (!sub) continue;
              if (IPA_DICTIONARY[sub]) {
                ipaParts.push(IPA_DICTIONARY[sub]);
              } else {
                ipaParts.push(this.ruleBasedG2P(sub));
              }
            }
          } else if (IPA_DICTIONARY[cleanWord]) {
            ipaParts.push(IPA_DICTIONARY[cleanWord]);
          } else {
            ipaParts.push(this.ruleBasedG2P(cleanWord));
          }
        }
      }
    }

    return ipaParts.join('');
  }

  /**
   * Convert IPA phoneme sequence directly into Kokoro ONNX token IDs
   */
  public static phonemesToTokens(phonemeText: string): number[] {
    const tokens: number[] = [];

    // Beginning-of-Sequence token '$' is 0
    tokens.push(0);

    for (let i = 0; i < phonemeText.length; i++) {
      const char = phonemeText[i];
      if (VOCAB[char] !== undefined) {
        tokens.push(VOCAB[char]);
      } else if (char === ' ') {
        tokens.push(VOCAB[' '] ?? 16);
      }
    }

    // End-of-Sequence token '$' is 0
    tokens.push(0);
    return tokens;
  }

  /**
   * Main tokenize method: converts raw text to Kokoro token ID sequence
   */
  public static tokenize(text: string): number[] {
    const phonemes = this.textToPhonemes(text);
    return this.phonemesToTokens(phonemes);
  }
}
