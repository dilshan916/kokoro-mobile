# 📱 Kokoro Voice Studio Mobile (Expo Go Edition)

> **Lead Developer:** Dilshan Chandrarathne  
> **Architecture:** 100% On-Device Offline Neural TTS + Dual Studio LAN Sync  
> **Framework:** Expo SDK 54 / React Native / TypeScript  

---

## 🌟 Key Features

1. **100% On-Device Offline Speech Synthesis**:
   - Zero internet connection required.
   - Built-in 54-voice style embeddings and 114 IPA phoneme tokenizer.
   - Fast neural audio waveform rendering directly on mobile hardware.

2. **54-Voice International Catalog**:
   - **English (US & UK)**: Heart, Bella, Sarah, Nicole, Sky, Michael, Adam, Echo, Emma, Isabella, George, Lewis, etc.
   - **Japanese (日本語)**: Alpha, Gongitsune, Nezumi, Tebukuro, Kumo.
   - **Mandarin Chinese (普通话)**: Xiaobei, Xiaoni, Xiaoxiao, Xiaoyi, Yunjian, Yunxi, Yunxia, Yunyang.
   - **Spanish (Español)**: Dora, Alex, Santa.
   - **French (Français)**: Siwis.
   - **Hindi (हिन्दी)**: Alpha, Beta, Omega, Psi.
   - **Italian (Italiano)**: Sara, Nicola.
   - **Brazilian Portuguese (Português)**: Dora, Alex, Santa.

3. **Dual-Voice Real-Time Neural Blender**:
   - Mix any two voices together with variable ratio slider (e.g. 70% Heart + 30% Michael).
   - Dynamic acoustic energy preservation.

4. **Studio Audio Suite & Subtitle Exporter**:
   - Interactive waveform scrubber with play/pause/seek.
   - 24,000 Hz 16-bit Master Mono WAV export with native sharing sheet (`expo-sharing`).
   - One-tap `.srt` subtitle generator for CapCut, Premiere Pro, and DaVinci Resolve.

5. **Dual-Mode Engine Switcher**:
   - **Mode 1**: 100% On-Device Offline AI (Runs on your phone's processor).
   - **Mode 2**: Local Studio LAN Sync (Connects to your Desktop PC Studio at `http://<your-pc-ip>:8000`).

---

## 🚀 How to Run in Expo Go

1. **Install Expo Go** on your iOS or Android smartphone from the App Store or Google Play Store.
2. In this folder (`E:\Coding projects\kokoro-mobile`), double-click **`run_mobile.bat`** (or run `npm start` in terminal).
3. **Scan the QR Code**:
   - **Android**: Open the Expo Go app and tap "Scan QR Code".
   - **iOS**: Open the native Camera app and scan the QR code to open in Expo Go.
4. The studio interface will load instantly on your phone with live hot-reloading!
