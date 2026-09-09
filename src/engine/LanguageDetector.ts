import { VOICES_CATALOG, VoiceItem } from '../constants/VoicesCatalog';

export const DEFAULT_LANGUAGE_VOICES: Record<string, string> = {
  'ja': 'jf_alpha',
  'zh': 'zf_xiaobei',
  'es': 'ef_dora',
  'fr': 'ff_siwis',
  'hi': 'hf_alpha',
  'it': 'if_sara',
  'pt-br': 'pf_dora',
  'en-us': 'af_heart',
  'en-gb': 'bf_emma',
};

/**
 * Fast, deterministic & statistical language detection for Kokoro Voice Studio.
 * Detects: English, French, Spanish, Italian, Portuguese, Japanese, Chinese, Hindi.
 */
export function detectLanguage(text: string): string {
  if (!text || !text.trim()) return 'en-us';
  const clean = text.trim();

  // 1. Unicode Script Analysis (100% Deterministic)
  const kanaMatches = (clean.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  const hanziMatches = (clean.match(/[\u4E00-\u9FFF]/g) || []).length;
  const devanagariMatches = (clean.match(/[\u0900-\u097F]/g) || []).length;
  const hangulMatches = (clean.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;

  if (hangulMatches >= 2) return 'ko';
  if (kanaMatches >= 1) return 'ja';
  if (hanziMatches >= 2 && kanaMatches === 0) return 'zh';
  if (devanagariMatches >= 2) return 'hi';

  // 2. Spanish distinctive punctuation check
  if (/[¡¿]/.test(clean)) return 'es';

  // 3. Stopword token matching for Latin scripts
  const words = clean.toLowerCase().replace(/[.,!?;:—…()"“”«»\[\]{}0-9]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'en-us';

  const FR_WORDS = new Set([
    'le','la','les','un','une','des','du','de','et','en','est','sont','dans','pour','avec','sur','vous','nous',
    'ils','elles','je','tu','il','elle','ce','cette','ces','qui','que','quoi','comment','merci','bonjour','très',
    'été','être','avoir','fait','faire','même','aussi','tout','tous','toute','toutes','grâce','votre','notre',
    'aujourd\'hui','mon','ma','mes','ton','ta','tes','son','sa','ses','quand','pourquoi','bien','oui','non'
  ]);
  const ES_WORDS = new Set([
    'el','la','los','las','un','una','unos','unas','de','del','en','y','es','son','por','para','con','sin','sobre',
    'yo','tú','él','ella','nosotros','ellos','ellas','usted','ustedes','gracias','hola','buenos','buenas','cómo','qué',
    'cuándo','dónde','porque','pero','muy','más','bien','también','siempre','nunca','todo','todos','nada','esto','esta',
    'estos','estas','este','su','sus','nuestro','nuestra','amigos','al','bienvenidos','estudio'
  ]);
  const IT_WORDS = new Set([
    'il','lo','la','i','gli','le','un','uno','una','di','del','dello','della','dei','degli','delle','al','allo','alla',
    'ai','agli','alle','da','in','con','su','per','tra','fra','questo','questa','questi','queste','quello','quella',
    'quelli','quelle','che','chi','cosa','come','dove','quando','perché','sono','siamo','sei','abbiamo','hanno','ciao',
    'grazie','prego','molto','tutti','tutto','sempre','anche','solo','bene','mio','mia','miei','mie','tuo','tua','tuoi',
    'tue','suo','sua','suoi','sue','nostro','nostra','vocale','altissima','qualità'
  ]);
  const PT_WORDS = new Set([
    'o','a','os','as','um','uma','uns','umas','do','da','dos','das','no','na','nos','nas','ao','aos','pelo','pela',
    'pelos','pelas','para','com','sem','sob','sobre','você','vocês','nós','eles','elas','eu','ele','ela','não','sim',
    'está','estão','são','é','obrigado','obrigada','olá','oi','tudo','muito','muitos','muita','muitas','também','mas',
    'como','quando','onde','porque','qual','quais','bom','boa','bem','meu','minha','meus','minhas','seu','sua','seus',
    'suas','bem-vindos','bem-vindo','estúdio','fidelidade'
  ]);
  const EN_WORDS = new Set([
    'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this',
    'but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what',
    'so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know',
    'take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only',
    'come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new',
    'want','because','any','these','give','day','most','us','welcome','hello','thank','thanks','voice','studio','speech',
    'audio','generation','high','fidelity','offline','neural'
  ]);

  const scores: Record<string, number> = { fr: 0, es: 0, it: 0, 'pt-br': 0, 'en-us': 0 };

  for (const w of words) {
    if (FR_WORDS.has(w)) scores.fr += 2;
    if (ES_WORDS.has(w)) scores.es += 2;
    if (IT_WORDS.has(w)) scores.it += 2;
    if (PT_WORDS.has(w)) scores['pt-br'] += 2;
    if (EN_WORDS.has(w)) scores['en-us'] += 2;

    // French contractions: c'est, l'arbre, qu'il, d'accord, j'ai
    if (/^[ldcjsnmt]'/.test(w) || /^qu'/.test(w)) scores.fr += 3;
    // Characteristic letters
    if (/[éèêëàâîïôùûüçœæ]/.test(w)) scores.fr += 1.5;
    if (/[ñáíóú]/.test(w)) scores.es += 1.5;
    if (/[ãõâêô]/.test(w)) scores['pt-br'] += 2.0;
    if (/[òìù]/.test(w)) scores.it += 1.5;
    if (w === 'e' || w === 'com' || w === 'ao' || w === 'aos' || w === 'do' || w === 'da' || w === 'em') scores['pt-br'] += 2.5;
    if (w === 'y' || w === 'del' || w === 'al' || w === 'en') scores.es += 2.5;
  }

  let bestLang = 'en-us';
  let maxScore = scores['en-us'];

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  return bestLang;
}

/**
 * Determine if a voice belongs to a language group
 */
export function isVoiceMatchingLanguage(voice: VoiceItem, detectedLang: string): boolean {
  if (!voice || !detectedLang) return false;
  if (detectedLang === 'en-us' || detectedLang === 'en-gb') {
    return voice.lang === 'en-us' || voice.lang === 'en-gb';
  }
  return voice.lang === detectedLang;
}

/**
 * Automatically resolve matching voice for the detected language.
 * If currentVoice already belongs to the detected language, keeps currentVoice.
 * Otherwise, picks the top recommended voice for that language.
 */
export function resolveAutoVoice(text: string, currentVoice: VoiceItem): VoiceItem {
  if (!text || text.trim().length < 3) {
    return currentVoice;
  }

  const detectedLang = detectLanguage(text);

  // If current voice already matches the detected language, preserve user's voice choice
  if (isVoiceMatchingLanguage(currentVoice, detectedLang)) {
    return currentVoice;
  }

  // Find recommended voice for this language
  const targetVoiceId = DEFAULT_LANGUAGE_VOICES[detectedLang];
  if (targetVoiceId) {
    const found = VOICES_CATALOG.find((v) => v.id === targetVoiceId);
    if (found) return found;
  }

  // Fallback to any voice with this language code
  const langMatch = VOICES_CATALOG.find((v) => isVoiceMatchingLanguage(v, detectedLang) && v.recommended) ||
                    VOICES_CATALOG.find((v) => isVoiceMatchingLanguage(v, detectedLang));

  return langMatch || currentVoice;
}
