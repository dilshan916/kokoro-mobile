@echo off
title Kokoro Voice Studio Mobile - Expo Go Server
echo ============================================================
echo   Kokoro Voice Studio Mobile (Expo Go)
echo   Lead Developer: Dilshan Chandrarathne
echo   Neural TTS Engine + Hotspot Proxy (Port 8080)
echo ============================================================
echo.
cd /d "%~dp0"
echo [*] Starting Hotspot Bridge Proxy on Port 8080...
start /b "" node server_proxy.js
echo [*] Starting Metro Bundler for Expo Go...
echo [*] Open the Expo Go app on your phone and scan the QR code.
echo.
npm start
pause
