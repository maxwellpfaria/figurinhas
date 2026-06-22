#!/usr/bin/env bash
# bump_version.sh — incrementa versionCode e atualiza versionName em version.properties
# Uso: ./bump_version.sh [novo_version_name]
# Exemplo: ./bump_version.sh 1.0.9
#          ./bump_version.sh          (pergunta interativamente)

set -euo pipefail

PROPS="$(dirname "$0")/version.properties"

# Lê valores atuais
current_code=$(grep '^VERSION_CODE=' "$PROPS" | cut -d'=' -f2 | tr -d '[:space:]')
current_name=$(grep '^VERSION_NAME=' "$PROPS" | cut -d'=' -f2 | tr -d '[:space:]')

new_code=$((current_code + 1))

if [ -n "${1:-}" ]; then
  new_name="$1"
else
  echo "Versão atual: $current_name (versionCode $current_code)"
  read -rp "Novo versionName (enter para manter $current_name): " input
  new_name="${input:-$current_name}"
fi

# Valida formato X.Y.Z
if ! echo "$new_name" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Erro: versionName deve ter formato X.Y.Z (ex: 1.0.9)" >&2
  exit 1
fi

# Atualiza o arquivo
sed -i "s/^VERSION_CODE=.*/VERSION_CODE=$new_code/" "$PROPS"
sed -i "s/^VERSION_NAME=.*/VERSION_NAME=$new_name/" "$PROPS"

echo "✓ version.properties atualizado: $new_name (versionCode $new_code)"
echo ""
echo "Próximo passo:"
echo "  git add version.properties && git commit -m \"chore: bump version to $new_name ($new_code)\""
