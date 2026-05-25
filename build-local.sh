#!/usr/bin/env bash
# Carrega o .env e gera o APK localmente via EAS
set -e
set -a && source "$(dirname "$0")/.env" && set +a
eas build --platform android --profile preview --local "$@"
