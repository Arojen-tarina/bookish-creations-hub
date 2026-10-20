#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/android-native"

echo "Running native Android unit tests and building debug/preview APKs."
./gradlew testDebugUnitTest assembleDebug assemblePreview

echo "Debug APK:   android-native/app/build/outputs/apk/debug/app-debug.apk"
echo "Preview APK: android-native/app/build/outputs/apk/preview/app-preview.apk"
