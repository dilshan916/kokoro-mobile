import React, { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '../src/constants/Colors';
import { KokoroWasmRunner, KokoroWasmRunnerRef } from '../src/engine/KokoroWasmRunner';
import { KokoroOnDeviceEngine } from '../src/engine/KokoroOnDeviceEngine';

export default function RootLayout() {
  const wasmRef = useRef<KokoroWasmRunnerRef | null>(null);

  useEffect(() => {
    if (wasmRef.current) {
      KokoroOnDeviceEngine.getInstance().registerWasmRunner(wasmRef.current);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {/* Headless On-Device Neural ONNX Execution Engine */}
      <KokoroWasmRunner
        ref={(el) => {
          wasmRef.current = el;
          if (el) {
            KokoroOnDeviceEngine.getInstance().registerWasmRunner(el);
          }
        }}
      />
    </SafeAreaProvider>
  );
}
