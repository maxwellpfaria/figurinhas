---
name: project-figurinha
description: Projeto FiguCopa 2026 — stack, estrutura, decisões arquiteturais e estado atual do MVP
metadata:
  type: project
---

# FiguCopa 2026

App de gerenciamento de álbum de figurinhas da Copa do Mundo 2026.

## Stack
- Expo SDK ~51 / React Native 0.74.1
- TypeScript 5.3
- React Navigation (bottom tabs)
- expo-linear-gradient (shimmer nas figurinhas lendárias)
- react-native-gesture-handler

## Estrutura de pastas
```
src/
  components/
    StickerCard.tsx      — card 3:4, shimmer via LinearGradient + Animated
    SectionTabs.tsx      — pills horizontais com badge de progresso
    BottomSheetEditor.tsx — sheet animado para editar quantidade
  data/
    mockData.ts          — seções + seed de quantidades
  hooks/
    useAlbum.ts          — estado único (quantities map) + useMemo de sections
  screens/
    AlbumScreen.tsx      — tela principal com header, stats, toggle de tema
    TradeScreen.tsx      — placeholder (QR code, em breve)
    ShareScreen.tsx      — placeholder (export WhatsApp, em breve)
  theme/
    index.ts             — ColorsType interface + LightColors + DarkColors + Spacing + Radius
    ThemeContext.tsx      — React Context com toggleTheme(), useTheme()
  types/
    index.ts             — Sticker, Section, StickerState, getStickerState
```

## Decisões arquiteturais
- Estado global de tema via `ThemeContext` (não Redux/Zustand — app pequeno)
- `StickerCard` usa `React.memo` + `areEqual` personalizado: re-renderiza só quando `quantity`, `id` ou `isDark` mudam
- `colors` e `isDark` passados como props para StickerCard/SectionTabs (evita context dentro de listas longas)
- `BottomSheetEditor` lê `useTheme()` diretamente (componente único, fora da FlatList)
- Shimmer nas figurinhas especiais: `LinearGradient` ouro + `Animated.loop(sequence)` translate X
- `isSpecial` flag propagado de Section → Sticker pelo `useAlbum` hook via spread

## Paleta visual (Copa do Mundo)
- Esmeralda: `#10B981` (owned, primary action)
- Dourado: `#D97706` / `#FBBF24` (progress fill, special cards)
- Coral/Rosa: `#F43F5E` (badge de repetidas)
- Header escuro: `#0F172A` (light) / `#0E1524` (dark)

## Why:
- Reformulação visual pedida pelo usuário com base em protótipo HTML (prot_tipo_copa_2026.html)
- Dark mode adicionado com toggle no header da AlbumScreen

## How to apply:
- Ao adicionar novas seções, marcar `isSpecial: true` e `makeStickers(..., true)` para ativar shimmer
- Theme toggle vive no header da AlbumScreen, não no tab bar
