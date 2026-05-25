# Meu Álbum Completo — Base de Conhecimento

Álbum digital das figurinhas da Copa do Mundo 2026. O usuário registra quais figurinhas possui, compara com amigos e identifica possíveis trocas.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~51 / React Native 0.74 |
| Linguagem | TypeScript 5.3.3 (`strict: true`) |
| Navegação | React Navigation v6 (Bottom Tabs) |
| Backend | Firebase JS SDK v12 (Auth + Firestore) |
| Persistência local | `@react-native-async-storage/async-storage` |
| Bundler web | Metro (`"output": "single"`) |
| Build Android | EAS Build (`eas.json`) |
| Gradiente | `expo-linear-gradient` (shimmer especiais) |

## Comandos

```bash
npx expo start            # dev (escolhe plataforma)
npx expo start --web      # web no browser
npx tsc --noEmit          # type check
eas build --platform android --profile preview   # APK via EAS cloud
eas login                 # autenticar na conta Expo
```

## Estrutura de pastas

```
figurinhas/
├── App.tsx                        # Raiz: ErrorBoundary + providers + navegação
├── app.json                       # Config Expo (slug, package, EAS projectId)
├── eas.json                       # Perfis de build EAS
├── .env                           # Credenciais Firebase (NÃO vai pro git)
├── .env.example                   # Template das variáveis (vai pro git)
├── .vscode/settings.json          # Força VS Code a usar TS do projeto (5.3.3)
└── src/
    ├── data/
    │   ├── copaData.ts            # ÚNICA fonte de dados das seções/figurinhas
    │   └── mockData.ts            # Re-export de copaData (legado, pode ser removido)
    ├── screens/
    │   ├── AlbumScreen.tsx        # Tela principal: grid + header + stats
    │   ├── FriendsScreen.tsx      # Amigos, convites, álbum do amigo, sugestão de trocas
    │   ├── TradeScreen.tsx        # Placeholder (QR Code — não implementado)
    │   ├── ShareScreen.tsx        # Placeholder (Exportar — não implementado)
    │   └── AuthScreen.tsx         # Login / cadastro / recuperação de senha
    ├── components/
    │   ├── AlbumContent.tsx       # FlatList de figurinhas + SectionTabs (reutilizável)
    │   ├── StickerCard.tsx        # Card individual da figurinha (3:4, shimmer especial)
    │   ├── SectionTabs.tsx        # Carrossel horizontal de abas por seção
    │   └── BottomSheetEditor.tsx  # Modal slide-up para editar quantidade exata
    ├── hooks/
    │   └── useAlbum.ts            # Estado das quantidades + sync Firestore (debounce 1.5s)
    ├── contexts/
    │   └── AuthContext.tsx        # Auth Firebase: user, profile, loading, refreshProfile
    ├── services/
    │   ├── firebase.ts            # Init Firebase (auth + db) com persistência por plataforma
    │   ├── firestore.ts           # CRUD: perfil, álbum (subcollection), amigos
    │   └── auth.ts                # signUp / signIn / signOut / resetPassword
    ├── theme/
    │   ├── index.ts               # ColorsType, LightColors, DarkColors, Spacing, Radius
    │   └── ThemeContext.tsx        # ThemeProvider + useTheme hook
    └── types/
        └── index.ts               # Sticker, Section, StickerState, getStickerState()
```

## Estrutura Firestore

```
/users/{uid}
  uid, email, displayName, inviteCode, friends[], createdAt

/users/{uid}/album/quantities
  data: { "bra_1": 2, "fwc_3": 1, ... }   ← mapa stickerId → quantidade
  updatedAt: timestamp
```

**Regras importantes:**
- O documento de perfil `/users/{uid}` não armazena mais as figurinhas (campo `quantities` foi migrado para subcollection)
- `loadAlbumQuantities` tem fallback de migração automática: se o doc da subcollection não existir, lê do campo legado no doc do usuário e migra
- O projeto usa Firebase **JS SDK** (não `@react-native-firebase`), portanto `google-services.json` **não é necessário** no build

## Dados das figurinhas

**Arquivo:** `src/data/copaData.ts`

- **994 figurinhas** no total: 20 (FWC) + 48 seleções × 20 + 14 (CC Coca-Cola)
- **68 especiais**: 20 FWC (todas holográficas) + 48 escudos (figurinha 1 de cada seleção)
- **50 seções**: 1 FWC + 48 seleções + 1 CC
- Ordem segue o álbum oficial: FWC → Grupos A ao L → CC

### Grupos Copa 2026

| Grupo | Seleções |
|---|---|
| A | México, África do Sul, Coreia do Sul, Rep. Tcheca |
| B | Canadá, Bósnia, Catar, Suíça |
| C | Brasil, Marrocos, Haiti, Escócia |
| D | Estados Unidos, Paraguai, Austrália, Turquia |
| E | Alemanha, Curaçao, Costa do Marfim, Equador |
| F | Países Baixos, Japão, Suécia, Tunísia |
| G | Bélgica, Egito, Irã, Nova Zelândia |
| H | Espanha, Cabo Verde, Arábia Saudita, Uruguai |
| I | França, Senegal, Iraque, Noruega |
| J | Argentina, Argélia, Áustria, Jordânia |
| K | Portugal, Congo RD, Uzbequistão, Colômbia |
| L | Inglaterra, Croácia, Gana, Panamá |

### Estrutura de IDs

- Sticker ID: `{sectionId}_{numero}` — ex: `bra_1`, `fwc_3`, `cc_7`
- Section ID: código ISO/custom de 3 letras — ex: `bra`, `fwc`, `cc`, `tch`, `cpv`

## Variáveis de ambiente

Arquivo `.env` (não commitado). Copiar de `.env.example` e preencher:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Expo SDK 51 lê automaticamente `EXPO_PUBLIC_*` do arquivo `.env`.

## Decisões arquiteturais relevantes

### Firebase Auth — persistência por plataforma
`src/services/firebase.ts` usa `browserLocalPersistence` (IndexedDB) na web e um adaptador `AsyncStorage` customizado no nativo. O Firebase JS SDK v12 removeu `getReactNativePersistence`, daí o adaptador manual.

### Sync de álbum — debounce
`useAlbum.ts` salva no Firestore 1,5s após a última alteração (`saveTimer`). A flag `initialized.current` impede salvar durante o carregamento inicial (evita sobrescrever dados do servidor com estado vazio).

### SectionTabs — scroll para aba ativa
`SectionTabs.tsx` mede a posição real de cada aba via `onLayout` e centraliza a aba selecionada no viewport. Não usa estimativa por `TAB_MIN_WIDTH` (abas têm larguras variáveis).

### AlbumContent — sem getItemLayout
`getItemLayout` foi removido do `FlatList` porque o `ListHeaderComponent` (abas) tem altura dinâmica. Sem isso, o FlatList calcula offsets errados.

### Web — Clipboard
`Clipboard` do React Native é `undefined` na web. `FriendsScreen.tsx` usa `navigator.clipboard.writeText()` na web e `require('react-native').Clipboard` no nativo.

### AuthContext — try/catch/finally
O callback do `onAuthStateChanged` é `async`. O `setLoading(false)` fica no `finally` para garantir que o app sai da tela de splash mesmo se `loadProfile` lançar exceção.

### ErrorBoundary
`App.tsx` envolve tudo em um `ErrorBoundary` de classe que exibe a mensagem de erro ao invés de tela branca. Crítico para web onde erros de render são silenciosos.

## Tema

- Dark mode por padrão; toggle no header da tela de álbum
- Cores em `src/theme/index.ts` — `LightColors` e `DarkColors`
- Hook `useTheme()` retorna `{ colors, isDark, toggleTheme }`
- `AlbumContent` e `StickerCard` recebem `colors` e `isDark` como props (evita re-subscribe ao contexto em cada card)

## Navegação (App.tsx)

```
AppGate
├── (loading) → splash com ActivityIndicator
├── (sem usuário) → AuthScreen
└── (com usuário) → MainTabs
    ├── Album (📚)
    ├── Friends (👥)
    ├── Trade (📱) ← placeholder
    └── Share (🔗) ← placeholder
```

## Build Android

**Perfis EAS** (`eas.json`):
- `development` — dev client, distribuição interna
- `preview` — **APK** para instalar direto no dispositivo
- `production` — AAB para Google Play

**Gerar APK:**
```bash
eas build --platform android --profile preview
```

**Observações:**
- `google-services.json` não é necessário (Firebase JS SDK, não nativo)
- As variáveis `EXPO_PUBLIC_*` do `.env` são injetadas pelo EAS automaticamente no build
- EAS projectId: `dbba3105-e1cd-4067-83be-2aaa5f4e646e` (owner: `maxwellfaria`)

## Funcionalidades pendentes

| Tela | Status | Descrição |
|---|---|---|
| TradeScreen | Placeholder | Gerar/escanear QR Code para troca presencial |
| ShareScreen | Placeholder | Exportar lista de figurinhas faltando/repetidas |

## Arquivos que NÃO vão pro git

- `.env` — credenciais Firebase
- `google-services.json` — config Android Firebase (não necessário neste projeto)
- `node_modules/`, `dist/`, `.expo/`
- `.claude/`, `memory/` — dados locais do Claude Code
