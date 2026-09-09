export interface MasteringPreset {
  id: string;
  name: string;
  desc: string;
  icon: string;
  bass: number; // dB
  treble: number; // dB
  gain: number; // dB
  compression: boolean;
}

export const MASTERING_PRESETS: MasteringPreset[] = [
  {
    id: 'studio_reference',
    name: 'Studio Reference',
    desc: 'Transparent, flat frequency response with gentle limiting',
    icon: 'sliders',
    bass: 0,
    treble: 0,
    gain: 0,
    compression: false,
  },
  {
    id: 'warm_podcast',
    name: 'Warm Podcast',
    desc: 'Enhanced low-mid warmth and intimacy for spoken word',
    icon: 'mic',
    bass: 2.5,
    treble: -0.5,
    gain: 1.0,
    compression: true,
  },
  {
    id: 'crisp_commercial',
    name: 'Crisp Commercial',
    desc: 'Airy high-end sparkle and punchy presence',
    icon: 'sparkles',
    bass: 0.5,
    treble: 3.0,
    gain: 1.5,
    compression: true,
  },
  {
    id: 'radio_broadcast',
    name: 'Radio Broadcast',
    desc: 'Dense, upfront FM broadcast sound',
    icon: 'radio',
    bass: 3.5,
    treble: 2.0,
    gain: 2.0,
    compression: true,
  },
  {
    id: 'raw_unprocessed',
    name: 'Raw Unprocessed',
    desc: 'Pure 24kHz direct neural output',
    icon: 'volume-2',
    bass: 0,
    treble: 0,
    gain: 0,
    compression: false,
  },
];
