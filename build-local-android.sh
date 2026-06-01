#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build local Android — APK (para instalar direto no dispositivo)
# Perfil EAS: preview
#
# Pré-requisitos:
#   npm install -g eas-cli     (instalar EAS CLI)
#   eas login                  (fazer login uma vez)
#   ANDROID_HOME configurado   (Android SDK instalado)
#   Java 17+                   (JDK instalado)
#
# Como usar:
#   chmod +x build-local-android.sh   (somente na primeira vez)
#   ./build-local-android.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Local Android (APK)     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Carrega variáveis do .env ──────────────────────────────────────────────
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a && source "$SCRIPT_DIR/.env" && set +a
  echo "✅  .env carregado"
else
  echo "⚠️   Arquivo .env não encontrado — as variáveis EXPO_PUBLIC_* precisam"
  echo "     estar no ambiente para o build funcionar corretamente."
fi

# ── 2. Verifica dependências ──────────────────────────────────────────────────
echo ""
echo "🔍  Verificando dependências..."

if ! command -v eas &> /dev/null; then
  echo "❌  EAS CLI não encontrado. Instale com:"
  echo "      npm install -g eas-cli"
  exit 1
fi
echo "   EAS CLI  : $(eas --version 2>/dev/null | head -1)"

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

# ── 3. Exibe versão atual ─────────────────────────────────────────────────────
echo ""
echo "📋  Versão atual:"
VERSION=$(node -e "const c=require('./app.config.js'); console.log(c.version)")
VCODE=$(node -e "const c=require('./app.config.js'); console.log(c.android.versionCode)")
echo "    version      : $VERSION"
echo "    versionCode  : $VCODE"

# ── 4. Conta EAS ─────────────────────────────────────────────────────────────
echo ""
echo "👤  Conta EAS:"
eas whoami

# ── 5. Dispara o build local ──────────────────────────────────────────────────
echo ""
echo "🏗️   Iniciando build LOCAL de desenvolvimento..."
echo "    Perfil  : preview"
echo "    Saída   : .apk (instalar direto no dispositivo)"
echo "    Obs     : o processo roda inteiro na sua máquina (~10–20 min)"
echo ""

eas build \
  --platform android \
  --profile preview \
  --local \
  --non-interactive

# ── 6. Localiza o .apk gerado ─────────────────────────────────────────────────
echo ""
APK_PATH=$(find "$SCRIPT_DIR" -maxdepth 2 -name "*.apk" -newer "$SCRIPT_DIR/package.json" 2>/dev/null | sort | tail -1)

echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo ""

if [ -n "$APK_PATH" ]; then
  echo "📦  Arquivo gerado:"
  echo "    $APK_PATH"
  echo "    Tamanho: $(du -sh "$APK_PATH" | cut -f1)"
  echo ""
  echo "    Para instalar via ADB:"
  echo "    adb install \"$APK_PATH\""
else
  echo "📦  Arquivo .apk gerado na pasta do projeto."
  echo "    (procure por *.apk na raiz do projeto)"
fi

echo ""
echo "════════════════════════════════════════════════════════"
