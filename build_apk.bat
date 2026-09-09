@echo off
title Kokoro Voice Studio — Android APK Builder
color 0b

echo ============================================================
echo   Kokoro Voice Studio Mobile — Standalone APK Builder
echo   Lead Developer: Dilshan Chandrarathne
echo ============================================================
echo.
echo Select Build Mode:
echo   [1] Cloud EAS Build (Recommended - Generates .apk directly via EAS)
echo   [2] Local Gradle Android Build (Requires Android SDK & NDK installed)
echo   [3] Exit
echo.

set /p choice="Enter option (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo [*] Running EAS Build for Android APK...
    npx eas-cli build --platform android --profile preview
) else if "%choice%"=="2" (
    echo.
    echo [*] Generating Android native project and building APK locally...
    npx expo run:android --variant release
) else (
    echo Exiting builder.
)

pause
