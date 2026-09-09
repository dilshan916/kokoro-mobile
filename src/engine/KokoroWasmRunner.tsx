import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';

export interface WasmSynthesisPayload {
  requestId: string;
  tokens: number[];
  style: number[];
  speed: number;
}

export interface WasmSynthesisResponse {
  requestId: string;
  success: boolean;
  wavBase64?: string;
  duration?: number;
  error?: string;
}

export type StatusCallback = (status: string) => void;

export interface KokoroWasmRunnerRef {
  synthesize: (payload: WasmSynthesisPayload, onStatus?: StatusCallback) => Promise<WasmSynthesisResponse>;
  loadModel: (modelPath: string, onStatus?: StatusCallback) => Promise<boolean>;
  isReady: () => boolean;
}

const pendingRequests = new Map<string, {
  resolve: (res: any) => void;
  reject: (err: any) => void;
  onStatus?: StatusCallback;
  timeout: any;
}>();

const activeStatusCallbacks = new Set<StatusCallback>();

function broadcastStatus(status: string) {
  for (const cb of activeStatusCallbacks) {
    try {
      cb(status);
    } catch (_) {}
  }
}

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.min.js"></script>
</head>
<body>
  <script>
    var currentSession = null;
    var modelChunks = null;
    var modelOffset = 0;
    var isOrtReady = false;

    async function ensureOrt() {
      if (typeof ort !== 'undefined') {
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;
        ort.env.wasm.proxy = false;
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
        isOrtReady = true;
        return true;
      }
      var tries = 0;
      while (typeof ort === 'undefined' && tries < 60) {
        await new Promise(function(r) { setTimeout(r, 100); });
        tries++;
      }
      if (typeof ort !== 'undefined') {
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;
        ort.env.wasm.proxy = false;
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
        isOrtReady = true;
        return true;
      }
      return false;
    }
    ensureOrt();

    function applyBoundaryFades(samples, fadeMs, sampleRate) {
      if (!samples || samples.length === 0) return samples;
      if (!fadeMs) fadeMs = 8;
      if (!sampleRate) sampleRate = 24000;
      var fadeLen = Math.floor((fadeMs / 1000) * sampleRate);
      fadeLen = Math.min(fadeLen, Math.floor(samples.length / 2));
      if (fadeLen <= 1) return samples;

      for (var i = 0; i < fadeLen; i++) {
        var ratio = i / fadeLen;
        samples[i] *= ratio;
        samples[samples.length - 1 - i] *= ratio;
      }
      return samples;
    }

    function pcmToWavBase64(samples, sampleRate) {
      if (!sampleRate) sampleRate = 24000;
      var numChannels = 1;
      var bitsPerSample = 16;
      var byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
      var blockAlign = (numChannels * bitsPerSample) / 8;
      var dataSize = samples.length * 2;
      var buffer = new ArrayBuffer(44 + dataSize);
      var view = new DataView(buffer);

      function writeString(offset, string) {
        for (var i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);

      var offset = 44;
      for (var i = 0; i < samples.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, samples[i]));
        var val = s < 0 ? s * 0x8000 : s * 0x7fff;
        view.setInt16(offset, val, true);
      }

      var bytes = new Uint8Array(buffer);
      var binary = '';
      var len = bytes.byteLength;
      var chunkSize = 8192;
      for (var i = 0; i < len; i += chunkSize) {
        var chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    }

    async function handleMessage(event) {
      var rawData = event.data;
      var data;
      try {
        data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      } catch (e) {
        return;
      }

      var action = data.action;

      try {
        if (action === 'INIT_MODEL_TRANSFER') {
          await ensureOrt();
          modelChunks = new Uint8Array(data.totalBytes);
          modelOffset = 0;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MODEL_TRANSFER_READY'
          }));
        } else if (action === 'MODEL_CHUNK') {
          if (!modelChunks) {
            throw new Error('Model transfer buffer not allocated.');
          }
          var b64 = data.base64;
          var binary = atob(b64);
          var len = binary.length;
          for (var k = 0; k < len; k++) {
            modelChunks[modelOffset++] = binary.charCodeAt(k);
          }

          if (data.chunkIndex === data.totalChunks - 1) {
            var ready = await ensureOrt();
            if (!ready) {
              throw new Error('ONNX Runtime Web library could not be loaded. Please ensure an active internet connection on first app start.');
            }

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'STATUS_UPDATE',
              requestId: 'LOAD_MODEL',
              status: 'Compiling neural graph in WebAssembly SIMD...'
            }));

            // Using pure WASM SIMD provider to natively support INT64 tokens and nodes
            var sessionOptions = {
              executionProviders: ['wasm'],
              graphOptimizationLevel: 'basic',
              enableCpuMemArena: true,
              enableMemPattern: true
            };

            currentSession = await ort.InferenceSession.create(modelChunks.buffer, sessionOptions);

            // Free transfer array from RAM
            modelChunks = null;

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MODEL_LOADED',
              success: true
            }));
          }
        } else if (action === 'SYNTHESIZE') {
          var payload = data.payload || {};
          var requestId = payload.requestId || 'req_' + Date.now();

          if (!currentSession) {
            throw new Error('Neural model is not loaded yet. Please wait for model initialization.');
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'STATUS_UPDATE',
            requestId: requestId,
            status: 'Running Kokoro neural inference...'
          }));

          var tokens = payload.tokens || [];
          var style = payload.style || [];
          var speed = payload.speed || 1.0;

          var tokensBigInt = new BigInt64Array(tokens.map(function(t) { return BigInt(t); }));
          var tokensTensor = new ort.Tensor('int64', tokensBigInt, [1, tokens.length]);
          var styleTensor = new ort.Tensor('float32', new Float32Array(style), [1, style.length]);
          var speedTensor = new ort.Tensor('float32', new Float32Array([speed]), [1]);

          var feeds = {
            tokens: tokensTensor,
            style: styleTensor,
            speed: speedTensor
          };

          var results = await currentSession.run(feeds);
          var outputKey = Object.keys(results)[0];
          var audioTensor = results[outputKey];
          var audioSamples = audioTensor.data;

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'STATUS_UPDATE',
            requestId: requestId,
            status: 'Mastering 24kHz audio...'
          }));

          var duration = audioSamples.length / 24000;
          applyBoundaryFades(audioSamples, 8, 24000);
          var wavBase64 = pcmToWavBase64(audioSamples, 24000);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SYNTHESIS_RESULT',
            requestId: requestId,
            success: true,
            wavBase64: wavBase64,
            duration: duration
          }));
        }
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: action === 'SYNTHESIZE' ? 'SYNTHESIS_RESULT' : 'ERROR',
          requestId: (data && data.payload && data.payload.requestId) || 'LOAD_MODEL',
          success: false,
          error: err.message || String(err)
        }));
      }
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);
  </script>
</body>
</html>
`;

export interface KokoroWasmRunnerProps {}

export const KokoroWasmRunner = forwardRef<KokoroWasmRunnerRef, KokoroWasmRunnerProps>((_props, ref) => {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef<boolean>(false);
  const loadedModelPathRef = useRef<string | null>(null);
  const activeLoadPromiseRef = useRef<Promise<boolean> | null>(null);

  useImperativeHandle(ref, () => ({
    isReady: () => isLoadedRef.current,

    loadModel: async (modelPath: string, onStatus?: StatusCallback): Promise<boolean> => {
      if (isLoadedRef.current && loadedModelPathRef.current === modelPath) {
        return true;
      }

      // If already loading, register the onStatus callback and wait for the in-progress promise!
      if (activeLoadPromiseRef.current) {
        if (onStatus) {
          activeStatusCallbacks.add(onStatus);
          onStatus('Loading neural weights in background...');
        }
        return activeLoadPromiseRef.current;
      }

      if (onStatus) {
        activeStatusCallbacks.add(onStatus);
        onStatus('Reading neural model from storage...');
      }

      activeLoadPromiseRef.current = (async () => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(modelPath);
          if (!fileInfo.exists || !fileInfo.size) {
            throw new Error('Model file not found on device');
          }

          const totalBytes = fileInfo.size;
          // 4MB chunk size for fast streaming transfer across React Native bridge
          const CHUNK_SIZE = 4 * 1024 * 1024;
          const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

          webViewRef.current?.postMessage(
            JSON.stringify({
              action: 'INIT_MODEL_TRANSFER',
              totalBytes,
              totalChunks,
            })
          );

          await new Promise((r) => setTimeout(r, 60));

          for (let i = 0; i < totalChunks; i++) {
            const position = i * CHUNK_SIZE;
            const length = Math.min(CHUNK_SIZE, totalBytes - position);

            const chunkB64 = await FileSystem.readAsStringAsync(modelPath, {
              encoding: FileSystem.EncodingType.Base64,
              position,
              length,
            });

            webViewRef.current?.postMessage(
              JSON.stringify({
                action: 'MODEL_CHUNK',
                chunkIndex: i,
                totalChunks,
                base64: chunkB64,
              })
            );

            const pct = Math.round(((i + 1) / totalChunks) * 100);
            broadcastStatus(`Loading neural weights (${pct}%)...`);

            await new Promise((r) => setTimeout(r, 2));
          }

          return new Promise<boolean>((resolve, reject) => {
            const timeout = setTimeout(() => {
              activeLoadPromiseRef.current = null;
              pendingRequests.delete('LOAD_MODEL');
              reject(new Error('Model loading timed out in ONNX WebAssembly.'));
            }, 180000);

            pendingRequests.set('LOAD_MODEL', {
              resolve: () => {
                clearTimeout(timeout);
                isLoadedRef.current = true;
                loadedModelPathRef.current = modelPath;
                activeLoadPromiseRef.current = null;
                activeStatusCallbacks.clear();
                resolve(true);
              },
              reject: (err) => {
                clearTimeout(timeout);
                activeLoadPromiseRef.current = null;
                activeStatusCallbacks.clear();
                reject(err);
              },
              onStatus,
              timeout,
            });
          });
        } catch (err) {
          activeLoadPromiseRef.current = null;
          activeStatusCallbacks.clear();
          throw err;
        }
      })();

      return activeLoadPromiseRef.current;
    },

    synthesize: async (payload: WasmSynthesisPayload, onStatus?: StatusCallback): Promise<WasmSynthesisResponse> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pendingRequests.delete(payload.requestId);
          reject(new Error('On-device neural synthesis timed out (180s).'));
        }, 180000);

        pendingRequests.set(payload.requestId, {
          resolve: resolve as any,
          reject,
          onStatus,
          timeout,
        });

        webViewRef.current?.postMessage(
          JSON.stringify({ action: 'SYNTHESIZE', payload })
        );
      });
    },
  }));

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'STATUS_UPDATE') {
        if (data.requestId === 'LOAD_MODEL') {
          broadcastStatus(data.status);
        } else {
          const req = pendingRequests.get(data.requestId);
          if (req && req.onStatus) {
            req.onStatus(data.status);
          }
        }
      } else if (data.type === 'MODEL_LOADED') {
        const req = pendingRequests.get('LOAD_MODEL');
        if (req) {
          req.resolve(true);
          pendingRequests.delete('LOAD_MODEL');
        }
      } else if (data.type === 'SYNTHESIS_RESULT') {
        const req = pendingRequests.get(data.requestId);
        if (req) {
          clearTimeout(req.timeout);
          req.resolve(data);
          pendingRequests.delete(data.requestId);
        }
      } else if (data.type === 'ERROR') {
        console.warn('[Kokoro WASM Engine Error]:', data.error);
        const req = pendingRequests.get(data.requestId || 'LOAD_MODEL');
        if (req) {
          clearTimeout(req.timeout);
          req.reject(new Error(data.error));
          pendingRequests.delete(data.requestId || 'LOAD_MODEL');
        }
      }
    } catch (e) {
      console.warn('Failed to parse message from Kokoro WASM runner:', e);
    }
  };

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: HTML_CONTENT, baseUrl: 'https://cdn.jsdelivr.net/' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        mixedContentMode="always"
        androidLayerType="hardware"
        style={styles.webView}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
  },
  webView: {
    width: 1,
    height: 1,
  },
});
