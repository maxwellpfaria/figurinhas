#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build de produção LOCAL — Google Play Store
# Gera um .aab (Android App Bundle) assinado na sua máquina (sem EAS Cloud)
#
# Pré-requisitos:
#   npm install -g eas-cli     (instalar EAS CLI, se ainda não tiver)
#   eas login                  (fazer login uma vez para baixar o keystore)
#   ANDROID_HOME configurado   (Android SDK instalado)
#   Java 17+                   (JDK instalado)
#
# Como usar:
#   chmod +x build-production.sh   (somente na primeira vez)
#   ./build-production.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # interrompe se qualquer comando falhar

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Local Google Play       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Carrega variáveis do .env ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# ── 3. Verifica login no EAS (necessário para baixar o keystore) ──────────────
echo ""
echo "👤  Conta EAS:"
eas whoami

# ── 4. Dispara o build local ──────────────────────────────────────────────────
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

# ── 5. Localiza o .aab gerado ─────────────────────────────────────────────────
echo ""
AAB_PATH=$(find "$SCRIPT_DIR" -maxdepth 2 -name "*.aab" -newer "$SCRIPT_DIR/package.json" 2>/dev/null | sort -t_ -k1 | tail -1)

echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo ""

if [ -n "$AAB_PATH" ]; then
  echo "📦  Arquivo gerado:"
  echo "    $AAB_PATH"
  echo ""
  echo "    Tamanho: $(du -sh "$AAB_PATH" | cut -f1)"
else
  echo "📦  Arquivo .aab gerado na pasta do projeto."
  echo "    (procure por *.aab na raiz do projeto)"
fi

# ── 6. Próximos passos ────────────────────────────────────────────────────────
echo ""
echo "Próximos passos para publicar na Google Play:"
echo ""
echo "  1. Acesse: https://play.google.com/console"
echo "  2. Selecione o app  →  Produção  →  Criar nova versão"
echo "  3. Faça upload do arquivo .aab acima"
echo "  4. Preencha as Notas da versão"
echo "  5. Envie para revisão"
echo ""
echo "════════════════════════════════════════════════════════"
