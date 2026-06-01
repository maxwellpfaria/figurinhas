#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build de produção LOCAL — Google Play Store
# Gera um .aab (Android App Bundle) e incrementa version + versionCode
#
# Pré-requisitos:
#   npm install -g eas-cli     (instalar EAS CLI)
#   eas login                  (fazer login uma vez para baixar o keystore)
#   ANDROID_HOME configurado   (Android SDK instalado)
#   Java 17+                   (JDK instalado)
#
# Como usar:
#   chmod +x build-production-android.sh   (somente na primeira vez)
#   ./build-production-android.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Produção Android (AAB)  ║"
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

if ! command -v node &> /dev/null; then
  echo "❌  Node.js não encontrado."
  exit 1
fi
echo "   Node.js  : $(node --version)"

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

# ── 3. Conta EAS ─────────────────────────────────────────────────────────────
echo ""
echo "👤  Conta EAS:"
eas whoami

# ── 4. Incrementa version (patch +1) e versionCode (+1) ──────────────────────
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

# ── 5. Dispara o build local ──────────────────────────────────────────────────
echo ""
echo "🏗️   Iniciando build LOCAL de produção..."
echo "    Perfil  : production"
echo "    Saída   : .aab (Android App Bundle para o Google Play)"
echo "    Keystore: EAS Managed Credentials (baixado automaticamente)"
echo "    Obs     : o processo roda inteiro na sua máquina (~10–20 min)"
echo ""

eas build \
  --platform android \
  --profile production \
  --local \
  --non-interactive

# ── 6. Localiza o .aab gerado ─────────────────────────────────────────────────
echo ""
AAB_PATH=$(find "$SCRIPT_DIR" -maxdepth 2 -name "*.aab" -newer "$SCRIPT_DIR/package.json" 2>/dev/null | sort | tail -1)

echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo "    Versão publicada: $NEW_VERSION (versionCode $NEW_CODE)"
echo ""

if [ -n "$AAB_PATH" ]; then
  echo "📦  Arquivo gerado:"
  echo "    $AAB_PATH"
  echo "    Tamanho: $(du -sh "$AAB_PATH" | cut -f1)"
else
  echo "📦  Arquivo .aab gerado na pasta do projeto."
  echo "    (procure por *.aab na raiz do projeto)"
fi

echo ""
echo "Próximos passos:"
echo ""
echo "  1. Commit do bump de versão:"
echo "       git add app.config.js"
echo "       git commit -m \"chore: bump version to $NEW_VERSION (versionCode $NEW_CODE)\""
echo ""
echo "  2. Acesse: https://play.google.com/console"
echo "  3. Selecione o app  →  Produção  →  Criar nova versão"
echo "  4. Faça upload do arquivo .aab acima"
echo "  5. Preencha as Notas da versão e envie para revisão"
echo ""
echo "════════════════════════════════════════════════════════"
