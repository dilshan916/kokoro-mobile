# 📱 Kokoro Mobile — On-Device Neural AI Text-to-Speech & Studio Mobile Workstation

<div align="center">

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-success?style=for-the-badge&logo=android&logoColor=white)](https://expo.dev/)
[![Model Weights](https://img.shields.io/badge/Model-Kokoro--82M%20ONNX-3b82f6?style=for-the-badge&logo=onnx&logoColor=white)](https://huggingface.co/hexgrad/Kokoro-82M)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

### **Pocket-Sized Studio-Grade AI Text-to-Speech Workstation with Zero Cloud Latency**
*Synthesize 54 neural voices offline on your smartphone, blend custom voice styles in real time, export master 24kHz WAV audio, generate synchronized SRT subtitles, and sync with your desktop workstation.*

### 🔗 **Desktop & Web Companion: [Kokoro Voice Studio (SayTTS)](https://saytts.site)**

</div>

---

## 🌟 Overview

**Kokoro Mobile** is a high-performance mobile speech synthesis studio built with **React Native**, **Expo SDK 54**, and **TypeScript**. It puts the revolutionary **Kokoro-82M** neural TTS engine directly into your pocket.

Equipped with 54 studio-grade voice profiles across 8 international language families, Kokoro Mobile allows creators, video editors, and mobile producers to generate lifelike voiceovers anywhere without relying on cloud servers or internet connections. 

Whether you need rapid offline voiceovers while traveling, dual-voice hybrid blending for custom podcast personas, or automated `.srt` subtitle files ready for CapCut, Premiere Pro, or DaVinci Resolve, Kokoro Mobile provides a seamless, friction-free creative environment.

---

## ✨ Key Features

### 🎙️ 100% On-Device Offline Neural TTS
* **Zero Internet Dependency**: Generates natural speech locally using embedded ONNX neural weights and a 114 IPA phoneme tokenizer.
* **Instant Mobile Audio Rendering**: Optimized CPU inference delivers fast audio synthesis directly on modern smartphones without overheating or battery drain.

### 🌐 54-Voice International Catalog
| Language / Region | Voice Profiles |
| :--- | :--- |
| **🇺🇸 English (US)** | Heart, Bella, Sarah, Nicole, Sky, Michael, Adam, Echo, Eric, Liam |
| **🇬🇧 English (UK)** | Emma, Isabella, George, Lewis, Alice, Lily |
| **🇯🇵 Japanese (日本語)** | Alpha, Gongitsune, Nezumi, Tebukuro, Kumo |
| **🇨🇳 Mandarin (普通话)** | Xiaobei, Xiaoni, Xiaoxiao, Xiaoyi, Yunjian, Yunxi, Yunxia, Yunyang |
| **🇪🇸 Spanish (Español)** | Dora, Alex, Santa |
| **🇫🇷 French (Français)** | Siwis |
| **🇮🇳 Hindi (हिन्दी)** | Alpha, Beta, Omega, Psi |
| **🇮🇹 Italian (Italiano)** | Sara, Nicola |
| **🇧🇷 Portuguese (Português)** | Dora, Alex, Santa |

### 🎛️ Dual-Voice Neural Blender
* **Real-Time Voice Interpolation**: Smoothly blend any two character voices at custom percentage ratios (e.g., 70% Heart + 30% Michael) to create entirely new, proprietary vocal identities.
* **Acoustic Energy Preservation**: Dynamic mathematical normalization ensures vocal timbre and clarity remain crystal clear across all blend values.

### 🎚️ Master Audio Suite & Subtitle Exporter
* **Interactive Waveform Scrubber**: Touch-controlled playback with live audio progress tracking, seek scrubbing, and pause/resume controls.
* **24,000 Hz Master WAV Export**: Generates broadcast-quality uncompressed 16-bit mono PCM audio ready for professional production.
* **One-Tap `.srt` Subtitle Generator**: Synchronized subtitle files generated in tandem with your audio for instant import into CapCut, TikTok, Premiere Pro, and DaVinci Resolve.
* **Native System Sharing**: Export and share directly via iOS & Android system share sheets (`expo-sharing`).

### 🔄 Dual-Mode Engine Architecture
* **Mode 1 — Pure Offline Mode**: Runs entirely on your phone's processor for complete privacy and offline usability.
* **Mode 2 — Studio LAN Sync**: Automatically detects and connects to your local desktop workstation running [Kokoro Voice Studio](https://github.com/dilshan916/kokoro-voice-studio) at `http://<desktop-ip>:8000` for accelerated rendering and extended DSP mastering.

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             React Native + Expo SDK 54 Frontend             │
│        (TypeScript • Lucide Icons • Responsive Layout)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│  Mode 1: On-Device Engine    ││  Mode 2: Local LAN Sync      │
├──────────────────────────────┤├──────────────────────────────┤
│  • 114 IPA Phonemizer        ││  • REST API Client           │
│  • 54 Voice Style Embeddings ││  • http://<desktop-ip>:8000  │
│  • Local Audio Buffer Cache  ││  • Desktop GPU Acceleration  │
└──────────────┬───────────────┘└──────────────┬───────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Audio & File Operations                     │
├──────────────────────────────┬──────────────────────────────┤
│       expo-av (Player)       │  expo-file-system (Storage)  │
├──────────────────────────────┼──────────────────────────────┤
│    expo-sharing (AirDrop)    │  SRT Subtitle Exporter       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `18.x` or higher installed.
* **Smartphone**: Android or iOS device with the **Expo Go** app installed.

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/dilshan916/kokoro-mobile.git
cd kokoro-mobile

# Install dependencies
npm install
```

### 2. Running in Expo Go

1. Start the development server:
   ```bash
   npm start
   # or on Windows: double-click run_mobile.bat
   ```
2. **Scan the QR Code**:
   * **Android**: Open the **Expo Go** app and tap "Scan QR Code".
   * **iOS**: Open the native **Camera app** and scan the displayed QR code.
3. The studio interface will load instantly with live fast-refresh!

---

## 📦 Building Standalone APK (Android)

To compile a standalone Android `.apk` package without requiring Expo Go:

### Option A: Using the Automated Batch Script (Windows)
Double click **`build_apk.bat`** in the repository root.

### Option B: Using EAS CLI (Expo Application Services)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build standalone Android APK
eas build -p android --profile preview
```

---

## 📄 License & Credits

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Acknowledgments
* Neural TTS Architecture: **[Hexgrad Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)**
* Desktop Companion: **[dilshan916/kokoro-voice-studio](https://github.com/dilshan916/kokoro-voice-studio)**
* Developed & Maintained by: **[Dilshan Chandrarathne](https://github.com/dilshan916)**
