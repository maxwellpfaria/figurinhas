#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build local Android — APK assinado (para instalar direto no dispositivo)
#
# Pré-requisitos:
#   ANDROID_HOME configurado   (Android SDK instalado)
#   Java 17+                   (JDK instalado)
#   android/app/release.keystore existente
#   android/gradle.properties com MYAPP_RELEASE_* preenchidos
#
# Como usar:
#   chmod +x build-local-android.sh   (somente na primeira vez)
#   ./build-local-android.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Local Android (APK)     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Verifica dependências ──────────────────────────────────────────────────
echo "🔍  Verificando dependências..."

if ! command -v java &> /dev/null; then
  echo "❌  Java não encontrado. Instale o JDK 17."
  exit 1
fi
echo "   Java     : $(java -version 2>&1 | head -1)"

if [ -z "$ANDROID_HOME" ]; then
  echo "❌  ANDROID_HOME não está definido."
  echo "    Adicione ao ~/.bashrc (ou ~/.zshrc):"
  echo "      export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "      export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
  exit 1
fi
echo "   ANDROID  : $ANDROID_HOME"

if [ ! -f "$ANDROID_DIR/app/release.keystore" ]; then
  echo "❌  Keystore não encontrado: android/app/release.keystore"
  echo "    Execute o script de geração de keystore ou copie o arquivo."
  exit 1
fi
echo "   Keystore : OK"

# ── 2. Exibe versão atual ─────────────────────────────────────────────────────
echo ""
echo "📋  Versão atual:"
VERSION=$(node -e "const c=require('./app.config.js'); console.log(c.version)")
VCODE=$(node -e "const c=require('./app.config.js'); console.log(c.android.versionCode)")
echo "    version      : $VERSION"
echo "    versionCode  : $VCODE"

# ── 3. Build com Gradle ───────────────────────────────────────────────────────
echo ""
echo "🏗️   Iniciando build via Gradle..."
echo "    Saída   : .apk (instalar direto no dispositivo)"
echo ""

cd "$ANDROID_DIR"
./gradlew assembleRelease --no-daemon

# ── 4. Localiza e renomeia o .apk gerado ─────────────────────────────────────
cd "$SCRIPT_DIR"
APK_SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
APK_DEST="$SCRIPT_DIR/app-release-$VERSION.apk"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo ""

if [ -f "$APK_SRC" ]; then
  cp "$APK_SRC" "$APK_DEST"
  echo "📦  Arquivo gerado:"
  echo "    $APK_DEST"
  echo "    Tamanho: $(du -sh "$APK_DEST" | cut -f1)"
  echo ""
  echo "    Para instalar via ADB:"
  echo "    adb install \"$APK_DEST\""
else
  echo "⚠️   APK não encontrado no caminho esperado:"
  echo "    $APK_SRC"
fi

echo ""
echo "════════════════════════════════════════════════════════"
