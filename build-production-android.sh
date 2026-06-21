#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build de produção LOCAL — Google Play Store
# Gera um .aab (Android App Bundle) e incrementa version + versionCode
#
# Pré-requisitos:
#   ANDROID_HOME configurado   (Android SDK instalado)
#   Java 17+                   (JDK instalado)
#   android/app/release.keystore existente
#   android/gradle.properties com MYAPP_RELEASE_* preenchidos
#
# Como usar:
#   chmod +x build-production-android.sh   (somente na primeira vez)
#   ./build-production-android.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Produção Android (AAB)  ║"
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

# ── 2. Incrementa version (patch +1) e versionCode (+1) ──────────────────────
echo ""
echo "🔖  Incrementando versão..."

VERSION_INFO=$(node -e "
const fs = require('fs');
const filePath = '$SCRIPT_DIR/app.config.js';
const content = fs.readFileSync(filePath, 'utf8');

const vMatch = content.match(/version:\s*\"(\d+)\.(\d+)\.(\d+)\"/);
if (!vMatch) { process.stderr.write('ERRO: version não encontrado em app.config.js\n'); process.exit(1); }
const [, major, minor, patch] = vMatch;
const oldVersion = major + '.' + minor + '.' + patch;
const newVersion = major + '.' + minor + '.' + (parseInt(patch) + 1);

const vcMatch = content.match(/versionCode:\s*(\d+)/);
if (!vcMatch) { process.stderr.write('ERRO: versionCode não encontrado em app.config.js\n'); process.exit(1); }
const oldCode = parseInt(vcMatch[1]);
const newCode = oldCode + 1;

const updated = content
  .replace(/version:\s*\"[\d.]+\"/, 'version: \"' + newVersion + '\"')
  .replace(/versionCode:\s*\d+/, 'versionCode: ' + newCode);

fs.writeFileSync(filePath, updated);
console.log(oldVersion + '|' + newVersion + '|' + oldCode + '|' + newCode);
")

OLD_VERSION=$(echo "$VERSION_INFO" | cut -d'|' -f1)
NEW_VERSION=$(echo "$VERSION_INFO" | cut -d'|' -f2)
OLD_CODE=$(echo "$VERSION_INFO" | cut -d'|' -f3)
NEW_CODE=$(echo "$VERSION_INFO" | cut -d'|' -f4)

echo "    version      : $OLD_VERSION  →  $NEW_VERSION"
echo "    versionCode  : $OLD_CODE  →  $NEW_CODE"

# ── 3. Sincroniza versão no build.gradle ──────────────────────────────────────
echo ""
echo "🔄  Sincronizando versão no build.gradle..."

sed -i "s/versionCode [0-9]*/versionCode $NEW_CODE/" "$ANDROID_DIR/app/build.gradle"
sed -i "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" "$ANDROID_DIR/app/build.gradle"

echo "    OK"

# ── 4. Build com Gradle ───────────────────────────────────────────────────────
echo ""
echo "🏗️   Iniciando build via Gradle..."
echo "    Saída   : .aab (Android App Bundle para o Google Play)"
echo ""

cd "$ANDROID_DIR"
./gradlew bundleRelease --no-daemon

# ── 5. Localiza e renomeia o .aab gerado ─────────────────────────────────────
cd "$SCRIPT_DIR"
AAB_SRC="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
AAB_DEST="$SCRIPT_DIR/app-release-$NEW_VERSION.aab"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo "    Versão publicada: $NEW_VERSION (versionCode $NEW_CODE)"
echo ""

if [ -f "$AAB_SRC" ]; then
  cp "$AAB_SRC" "$AAB_DEST"
  echo "📦  Arquivo gerado:"
  echo "    $AAB_DEST"
  echo "    Tamanho: $(du -sh "$AAB_DEST" | cut -f1)"
else
  echo "⚠️   AAB não encontrado no caminho esperado:"
  echo "    $AAB_SRC"
fi

echo ""
echo "Próximos passos:"
echo ""
echo "  1. Commit do bump de versão:"
echo "       git add app.config.js android/app/build.gradle"
echo "       git commit -m \"chore: bump version to $NEW_VERSION (versionCode $NEW_CODE)\""
echo ""
echo "  2. Acesse: https://play.google.com/console"
echo "  3. Selecione o app  →  Produção  →  Criar nova versão"
echo "  4. Faça upload do arquivo .aab acima"
echo "  5. Preencha as Notas da versão e envie para revisão"
echo ""
echo "════════════════════════════════════════════════════════"
