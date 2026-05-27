#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build de produção — Google Play Store
# Gera um .aab (Android App Bundle) assinado via EAS Cloud
#
# Pré-requisitos:
#   npm install -g eas-cli     (instalar EAS CLI, se ainda não tiver)
#   eas login                  (fazer login na conta Expo)
#
# Como usar:
#   chmod +x build-production.sh   (somente na primeira vez)
#   ./build-production.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # interrompe se qualquer comando falhar

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Meu Álbum Completo — Build Google Play Store       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Verifica se o EAS CLI está instalado ───────────────────────────────────
if ! command -v eas &> /dev/null; then
  echo "❌  EAS CLI não encontrado."
  echo "    Instale com:  npm install -g eas-cli"
  echo "    Depois execute:  eas login"
  exit 1
fi

echo "✅  EAS CLI encontrado: $(eas --version 2>/dev/null | head -1)"

# ── 2. Verifica login ─────────────────────────────────────────────────────────
echo ""
echo "👤  Conta EAS:"
eas whoami

# ── 3. Dispara o build de produção ────────────────────────────────────────────
echo ""
echo "🚀  Iniciando build de produção (Android App Bundle)..."
echo "    Perfil : production"
echo "    Saída  : .aab (Android App Bundle para o Google Play)"
echo "    Assina : EAS Managed Credentials (keystore na nuvem)"
echo ""

eas build \
  --platform android \
  --profile production \
  --non-interactive

# ── 4. Próximos passos ────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅  Build concluído!"
echo ""
echo "Próximos passos para publicar na Google Play:"
echo ""
echo "  1. Acesse: https://play.google.com/console"
echo "  2. Crie o app (se ainda não existir)"
echo "       • Package: com.figurinha.copa2026"
echo "       • Categoria: Entretenimento"
echo "  3. Vá em 'Produção' → 'Criar nova versão'"
echo "  4. Faça upload do arquivo .aab gerado"
echo "       (o link de download aparece no terminal acima)"
echo "  5. Preencha as informações obrigatórias:"
echo "       • Descrição curta e longa"
echo "       • Screenshots (mínimo 2 por tela)"
echo "       • Ícone 512×512 px"
echo "       • Banner 1024×500 px"
echo "  6. Envie para revisão"
echo ""
echo "════════════════════════════════════════════════════════"
