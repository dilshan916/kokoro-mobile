export interface VoiceItem {
  id: string;
  name: string;
  lang: string;
  langName: string;
  flag: string;
  gender: 'Female' | 'Male';
  traits: string;
  grade: string;
  recommended?: boolean;
}

export const VOICES_CATALOG: VoiceItem[] = [
  // American English (Female)
  { id: 'af_heart', name: 'Heart', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Warm, Expressive, Premium Narration', grade: 'A+', recommended: true },
  { id: 'af_bella', name: 'Bella', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Bright, Dynamic, Natural', grade: 'A', recommended: true },
  { id: 'af_sarah', name: 'Sarah', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Professional, Calm, Clear', grade: 'A' },
  { id: 'af_nicole', name: 'Nicole', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Friendly, Conversational', grade: 'B+' },
  { id: 'af_sky', name: 'Sky', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Youthful, Energetic', grade: 'B' },
  { id: 'af_alloy', name: 'Alloy', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Modern, Balanced, Neutral', grade: 'B+' },
  { id: 'af_aoede', name: 'Aoede', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Soft, Melodic, Storytelling', grade: 'B+' },
  { id: 'af_jessica', name: 'Jessica', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Articulate, Corporate', grade: 'B' },
  { id: 'af_kore', name: 'Kore', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Deep, Resonant, Warm', grade: 'B' },
  { id: 'af_nova', name: 'Nova', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Contemporary, Crisp', grade: 'B+' },
  { id: 'af_river', name: 'River', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Female', traits: 'Gentle, ASMR-style', grade: 'B' },

  // American English (Male)
  { id: 'am_michael', name: 'Michael', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Authoritative, Deep, Announcer', grade: 'A', recommended: true },
  { id: 'am_adam', name: 'Adam', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Engaging, Casual, Podcast', grade: 'A' },
  { id: 'am_echo', name: 'Echo', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Smooth, Documentary', grade: 'B+' },
  { id: 'am_eric', name: 'Eric', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Confident, Technical', grade: 'B+' },
  { id: 'am_fenrir', name: 'Fenrir', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Gravelly, Powerful, Dramatic', grade: 'B' },
  { id: 'am_liam', name: 'Liam', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Modern, Friendly, Young', grade: 'B+' },
  { id: 'am_onyx', name: 'Onyx', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Deep Baritone, Bold', grade: 'B+' },
  { id: 'am_puck', name: 'Puck', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Lively, Animated, Character', grade: 'B' },
  { id: 'am_santa', name: 'Santa', lang: 'en-us', langName: 'American English', flag: '🇺🇸', gender: 'Male', traits: 'Jovial, Deep, Warm', grade: 'B' },

  // British English (Female)
  { id: 'bf_emma', name: 'Emma', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Female', traits: 'Elegant, BBC English, Polished', grade: 'A', recommended: true },
  { id: 'bf_isabella', name: 'Isabella', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Female', traits: 'Sophisticated, Audiobook', grade: 'A' },
  { id: 'bf_alice', name: 'Alice', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Female', traits: 'Classic, Crisp, Narrative', grade: 'B+' },
  { id: 'bf_lily', name: 'Lily', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Female', traits: 'Gentle, Delicate, Calm', grade: 'B+' },

  // British English (Male)
  { id: 'bm_george', name: 'George', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Male', traits: 'Distinguished, Formal, Documentary', grade: 'A', recommended: true },
  { id: 'bm_fable', name: 'Fable', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Male', traits: 'Theatrical, Storyteller', grade: 'B+' },
  { id: 'bm_lewis', name: 'Lewis', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Male', traits: 'Approachable, Clear', grade: 'B+' },
  { id: 'bm_daniel', name: 'Daniel', lang: 'en-gb', langName: 'British English', flag: '🇬🇧', gender: 'Male', traits: 'Warm, Trustworthy', grade: 'B' },

  // Japanese
  { id: 'jf_alpha', name: 'Alpha (アルファ)', lang: 'ja', langName: 'Japanese', flag: '🇯🇵', gender: 'Female', traits: 'Anime Style, Energetic, Crisp', grade: 'A', recommended: true },
  { id: 'jf_gongitsune', name: 'Gongitsune (ごんぎつね)', lang: 'ja', langName: 'Japanese', flag: '🇯🇵', gender: 'Female', traits: 'Traditional Narrator, Gentle', grade: 'A' },
  { id: 'jf_nezumi', name: 'Nezumi (ねずみ)', lang: 'ja', langName: 'Japanese', flag: '🇯🇵', gender: 'Female', traits: 'Cute, Playful', grade: 'B+' },
  { id: 'jf_tebukuro', name: 'Tebukuro (手袋)', lang: 'ja', langName: 'Japanese', flag: '🇯🇵', gender: 'Female', traits: 'Soft, Soothing, Bedtime', grade: 'B+' },
  { id: 'jm_kumo', name: 'Kumo (蜘蛛)', lang: 'ja', langName: 'Japanese', flag: '🇯🇵', gender: 'Male', traits: 'Deep Voice, Anime Hero, Strong', grade: 'A' },

  // Mandarin Chinese
  { id: 'zf_xiaobei', name: 'Xiaobei (小北)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Female', traits: 'Standard Putonghua, Expressive', grade: 'A', recommended: true },
  { id: 'zf_xiaoni', name: 'Xiaoni (小妮)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Female', traits: 'Sweet, Commercial, Dynamic', grade: 'A' },
  { id: 'zf_xiaoxiao', name: 'Xiaoxiao (小小)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Female', traits: 'Natural, Conversational', grade: 'B+' },
  { id: 'zf_xiaoyi', name: 'Xiaoyi (小艺)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Female', traits: 'Clear, News Broadcast', grade: 'B+' },
  { id: 'zm_yunjian', name: 'Yunjian (云健)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Male', traits: 'Professional, Deep, Narrative', grade: 'A' },
  { id: 'zm_yunxi', name: 'Yunxi (云希)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Male', traits: 'Young, Friendly, Vlog', grade: 'A' },
  { id: 'zm_yunxia', name: 'Yunxia (云夏)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Male', traits: 'Warm, Casual', grade: 'B+' },
  { id: 'zm_yunyang', name: 'Yunyang (云扬)', lang: 'zh', langName: 'Mandarin Chinese', flag: '🇨🇳', gender: 'Male', traits: 'Heroic, Resonant', grade: 'B+' },

  // Spanish
  { id: 'ef_dora', name: 'Dora', lang: 'es', langName: 'Spanish', flag: '🇪🇸', gender: 'Female', traits: 'Castilian, Melodic, Vibrant', grade: 'A', recommended: true },
  { id: 'em_alex', name: 'Alex', lang: 'es', langName: 'Spanish', flag: '🇪🇸', gender: 'Male', traits: 'Neutral Latin Spanish, Confident', grade: 'A' },
  { id: 'em_santa', name: 'Santa (ES)', lang: 'es', langName: 'Spanish', flag: '🇪🇸', gender: 'Male', traits: 'Deep, Resonant, Warm', grade: 'B' },

  // French
  { id: 'ff_siwis', name: 'Siwis', lang: 'fr', langName: 'French', flag: '🇫🇷', gender: 'Female', traits: 'Parisian French, Refined, Elegant', grade: 'A', recommended: true },

  // Hindi
  { id: 'hf_alpha', name: 'Alpha (अल्फा)', lang: 'hi', langName: 'Hindi', flag: '🇮🇳', gender: 'Female', traits: 'Expressive Hindi, Melodic', grade: 'A', recommended: true },
  { id: 'hf_beta', name: 'Beta (बीटा)', lang: 'hi', langName: 'Hindi', flag: '🇮🇳', gender: 'Female', traits: 'Clear, Educational, Calm', grade: 'B+' },
  { id: 'hm_omega', name: 'Omega (ओमेगा)', lang: 'hi', langName: 'Hindi', flag: '🇮🇳', gender: 'Male', traits: 'Deep, Confident, Podcast', grade: 'A' },
  { id: 'hm_psi', name: 'Psi (साई)', lang: 'hi', langName: 'Hindi', flag: '🇮🇳', gender: 'Male', traits: 'Engaging, Storytelling', grade: 'B+' },

  // Italian
  { id: 'if_sara', name: 'Sara', lang: 'it', langName: 'Italian', flag: '🇮🇹', gender: 'Female', traits: 'Musical, Fluent, Warm', grade: 'A', recommended: true },
  { id: 'im_nicola', name: 'Nicola', lang: 'it', langName: 'Italian', flag: '🇮🇹', gender: 'Male', traits: 'Articulate, Rich Italian Tone', grade: 'A' },

  // Brazilian Portuguese
  { id: 'pf_dora', name: 'Dora (PT)', lang: 'pt-br', langName: 'Portuguese (BR)', flag: '🇧🇷', gender: 'Female', traits: 'Vibrant, Warm, Friendly', grade: 'A', recommended: true },
  { id: 'pm_alex', name: 'Alex (PT)', lang: 'pt-br', langName: 'Portuguese (BR)', flag: '🇧🇷', gender: 'Male', traits: 'Smooth, Engaging', grade: 'A' },
  { id: 'pm_santa', name: 'Santa (PT)', lang: 'pt-br', langName: 'Portuguese (BR)', flag: '🇧🇷', gender: 'Male', traits: 'Deep, Storyteller', grade: 'B' },
];

export const LANGUAGES_FILTER = [
  { code: 'all', label: 'All Voices', flag: '🌐' },
  { code: 'en-us', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-gb', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt-br', label: 'Portuguese', flag: '🇧🇷' },
];
