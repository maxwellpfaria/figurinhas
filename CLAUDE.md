# Meu Álbum Completo — Base de Conhecimento

Álbum digital das figurinhas da Copa do Mundo 2026. O usuário registra quais figurinhas possui, compara com amigos e identifica possíveis trocas.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ^56.0.5 / React Native ^0.85.3 |
| Linguagem | TypeScript ~6.0.3 (`strict: true`) |
| Navegação | React Navigation v6 (Bottom Tabs) |
| Backend | Firebase JS SDK ^12.13.0 (Auth + Firestore + Functions) |
| Persistência local | `@react-native-async-storage/async-storage` 2.2.0 |
| Cloud Functions | Firebase Functions v1 (Node.js 20, `us-central1`) |
| Bundler web | Metro (`"output": "single"`) |
| Build Android | EAS Build + build local via Gradle |
| Gradiente | `expo-linear-gradient` (shimmer especiais + splash) |

## Regras Invioláveis

### TypeScript
Sempre executar `npx tsc --noEmit` após mudanças antes de reportar como concluído. Zero erros é obrigatório.

### Cloud Functions — Região
Todas as funções usam `us-central1`. A constante `FUNCTIONS_REGION` em `src/services/functions.ts` define a região do cliente — deve sempre coincidir com o deploy em `functions/src/index.ts`.

```typescript
// CORRETO
const FUNCTIONS_REGION = 'us-central1';
export const minhaFuncao = functions.https.onCall(async (data, context) => { ... });

// ERRADO — se implantar sem região e chamar de região errada, resulta em 404
```

### Dev bypass de e-mail
`DEV_SKIP_EMAIL_VERIFICATION` em `src/services/functions.ts` é `true` apenas quando `__DEV__` (dev server local). Token `"123456"` valida o e-mail localmente via Firestore direto. Em qualquer build EAS (`__DEV__ = false`) o fluxo real é ativado.

### Cores — usar sempre o tema
Não usar cores hex hardcoded dentro de `StyleSheet.create()`. Usar `colors.*` do hook `useTheme()`. Exceções aceitas:
- Branco puro `'#FFFFFF'` em texto sobre botão colorido (contraste garantido)
- `'rgba(0,0,0,0.6)'` em overlays de câmera
- `'#25D366'` no botão WhatsApp (cor de marca externa, não muda com tema)
- `'#0F172A'` / `'#FFFFFF'` como avatarTextColor dependente de `isDark`

### Nomes de campos no Firestore
| Campo | Coleção | Nome correto |
|-------|---------|--------------|
| Verificado | `users` | `emailVerified` (boolean) |
| Quantidades | `users/{uid}/album/quantities` | `data` (mapa stickerId → número) |
| Lista de amigos | `users` | `friends` (array de UIDs) |

## Comandos

```bash
npx expo start            # dev (escolhe plataforma)
npx expo start --web      # web no browser
npx tsc --noEmit          # type check (obrigatório antes de reportar como concluído)
eas build --platform android --profile preview   # APK via EAS cloud
eas login                 # autenticar na conta Expo

# Cloud Functions
cd functions && npm run build     # compilar TypeScript
firebase deploy --only functions  # deploy todas as funções
```

## Estrutura de pastas

```
figurinhas/
├── App.tsx                        # Raiz: ErrorBoundary + providers + navegação (6 tabs)
├── app.config.js                  # Config Expo: lê .env + versão/versionCode hardcoded
├── eas.json                       # Perfis de build EAS
├── .env                           # Credenciais Firebase (NÃO vai pro git)
├── .env.example                   # Template das variáveis (vai pro git)
├── build-local-android.sh         # Gera APK de debug localmente via Gradle
├── build-production-android.sh    # Gera AAB de release para Play Store
├── firestore.rules                # Regras de segurança do Firestore
├── functions/
│   ├── src/index.ts               # sendVerificationToken + verifyEmailToken (v1, us-central1)
│   └── .env.example               # Template: MAIL_USER, MAIL_PASS
├── docs/                          # Páginas HTML estáticas (hospedadas no Firebase Hosting)
│   ├── privacy-policy.html        # Política de Privacidade (URL pública Play Store)
│   └── delete-account.html        # Instruções de exclusão de conta (Play Store)
└── src/
    ├── data/
    │   └── copaData.ts            # ÚNICA fonte de dados das seções/figurinhas
    ├── screens/
    │   ├── HomeScreen.tsx         # Início: stats do álbum + progresso dos amigos
    │   ├── AlbumScreen.tsx        # Meu Álbum: índice de seleções → grade (TeamDetail)
    │   ├── FriendsScreen.tsx      # Amigos, convites, álbum do amigo, sugestão de trocas
    │   ├── TradeScreen.tsx        # Troca QR: gerar QR Code + escanear + match de trocas
    │   ├── ShareScreen.tsx        # Exportar: compartilhar lista de faltantes/repetidas
    │   ├── ProfileScreen.tsx      # Perfil: dados, convite, tema, FAQ, políticas, exclusão
    │   ├── AuthScreen.tsx         # Login / cadastro / recuperação de senha
    │   └── EmailVerificationScreen.tsx  # Código de 6 dígitos enviado por Cloud Function
    ├── components/
    │   ├── AlbumIndex.tsx         # Lista de seleções com busca, sort e filtro de grupo
    │   ├── TeamDetail.tsx         # Grade de figurinhas + swipe entre seleções
    │   ├── StickerCard.tsx        # Card individual da figurinha (3:4, shimmer especial)
    │   ├── SectionTabs.tsx        # Carrossel horizontal de abas (dentro de TeamDetail)
    │   ├── GroupTabs.tsx          # Pills de filtro por grupo (FWC, A–L, CC)
    │   ├── BottomSheetEditor.tsx  # Modal slide-up para editar quantidade exata
    │   ├── TradeMatchModal.tsx    # Modal com resultado do match de troca (pós-scan QR)
    │   ├── WelcomeWizard.tsx      # Onboarding de 4 passos (exibido 1 vez via AsyncStorage)
    │   ├── AppDialog.tsx          # Modal de alerta customizado (substitui Alert nativo)
    │   ├── AppLogo.tsx            # Ícone SVG do app (usado em AuthScreen e SplashScreen)
    │   ├── AlbumContent.tsx       # FlatList de figurinhas reutilizável (modo readOnly para amigos)
    │   └── SplashScreen.tsx       # Tela animada com logo + dots pulsantes
    ├── hooks/
    │   ├── useAlbum.ts            # Estado das quantidades + sync Firestore (debounce 1.5s)
    │   └── useFaq.ts              # Fetch FAQ do /config/faq com cache AsyncStorage (TTL 6h)
    ├── contexts/
    │   ├── AlbumContext.tsx       # Provider global do álbum (expõe useAlbumContext)
    │   └── AuthContext.tsx        # Auth Firebase: user, profile, emailVerified, loading
    ├── services/
    │   ├── firebase.ts            # Init Firebase com persistência por plataforma
    │   ├── firestore.ts           # CRUD: perfil, álbum (subcollection), amigos
    │   ├── auth.ts                # signUp / signIn / signOut / resetPassword
    │   ├── functions.ts           # Callable wrappers (FUNCTIONS_REGION = 'us-central1')
    │   └── faq.ts                 # Fetch FAQ do Firestore /config/faq
    ├── utils/
    │   └── tradeQR.ts             # Encode/decode QR bitmask, cálculo de trocas, stats, share text
    ├── theme/
    │   ├── index.ts               # ColorsType, LightColors, DarkColors, Spacing, Radius, Typography
    │   └── ThemeContext.tsx       # ThemeProvider + useTheme hook
    └── types/
        └── index.ts               # Sticker, Section, StickerState, getStickerState()
```

## Estrutura Firestore

```
/users/{uid}
  uid, email, displayName, inviteCode, friends[], createdAt, emailVerified

/users/{uid}/album/quantities
  data: { "bra_1": 2, "fwc_3": 1, ... }   ← mapa stickerId → quantidade
  updatedAt: timestamp

/emailVerifications/{uid}
  token, expiresAt, attempts   ← allow read, write: if false (apenas Admin SDK)

/config/faq
  items: [{ id, q, a, order }]   ← FAQ remoto lido pelo useFaq (cache 6h)
```

**Regras importantes:**
- `loadAlbumQuantities` tem fallback de migração automática: se o doc da subcollection não existir, lê do campo legado no doc do usuário e migra
- O projeto usa Firebase **JS SDK** (não `@react-native-firebase`), portanto `google-services.json` **não é necessário** no build
- `emailVerifications` tem `allow read, write: if false` — só acessível via Admin SDK nas Cloud Functions

## Dados das figurinhas

**Arquivo:** `src/data/copaData.ts`

- **993 figurinhas** no total: 19 (FWC) + 48 seleções × 20 + 14 (CC Coca-Cola)
- **67 especiais**: 19 FWC (todas holográficas) + 48 escudos (figurinha 1 de cada seleção)
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

Arquivo `.env` na raiz (não commitado). Copiar de `.env.example` e preencher:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

`app.config.js` carrega o `.env` manualmente (compatível com EAS cloud e dev server).

Para as Cloud Functions, arquivo `functions/.env` (não commitado):

```
MAIL_USER=seuemail@gmail.com
MAIL_PASS=sua-senha-de-app-gmail
```

## Decisões arquiteturais relevantes

### Firebase Auth — persistência por plataforma
`src/services/firebase.ts` usa `browserLocalPersistence` (IndexedDB) na web e `getReactNativePersistence(AsyncStorage)` no nativo. O SDK v12+ ainda exporta `getReactNativePersistence` no bundle nativo via require dinâmico.

### Sync de álbum — debounce + AppState
`useAlbum.ts` salva no Firestore 1,5s após a última alteração. Também escuta `AppState` para flush imediato ao ir para background/inactive. A flag `needsSave.current` evita salvar o estado inicial vazio ao carregar.

### SectionTabs — scroll para aba ativa
`SectionTabs.tsx` mede a posição real de cada aba via `onLayout` e centraliza a aba selecionada no viewport. Não usa estimativa por `TAB_MIN_WIDTH` (abas têm larguras variáveis).

### AlbumContent — sem getItemLayout
`getItemLayout` foi removido do `FlatList` porque o `ListHeaderComponent` (abas) tem altura dinâmica. Sem isso, o FlatList calcula offsets errados ao scrollar para um índice.

### Web — Clipboard
`Clipboard` do React Native é `undefined` na web. `ShareScreen.tsx` e `FriendsScreen.tsx` usam `navigator.clipboard.writeText()` na web e `require('react-native').Clipboard` no nativo.

### AuthContext — emailVerified customizado
O campo `emailVerified` é gerenciado no Firestore (`users/{uid}.emailVerified`), não via `FirebaseUser.emailVerified` nativo. Isso permite controle completo de rate-limit e expiração via Cloud Function. O `AppGate` em `App.tsx` consulta `profile.emailVerified ?? true` (grandfathering de usuários antigos).

### ErrorBoundary
`App.tsx` envolve tudo em um `ErrorBoundary` de classe que exibe a mensagem de erro ao invés de tela branca. Crítico para web onde erros de render são silenciosos.

### TradeQR — bitmask compacto
`encodeQRPayload` codifica faltantes e repetidas como dois bitmasks base64 (≈125 bytes para 993 figurinhas), mantendo o QR Code escaneável. `decodeQRPayload` detecta payloads malformados e retorna `null`.

## Tema

- Dark mode por padrão; toggle no ProfileScreen
- Cores em `src/theme/index.ts` — `LightColors` e `DarkColors`
- Hook `useTheme()` retorna `{ colors, isDark, toggleTheme }`
- `AlbumContent` e `StickerCard` recebem `colors` e `isDark` como props (evita re-subscribe ao contexto em cada card da FlatList)

## Navegação (App.tsx)

```
AppGate
├── (loading)               → SplashScreen animada (mínimo 2s)
├── (sem usuário)           → AuthScreen
├── (e-mail não verificado) → EmailVerificationScreen
└── (com usuário)           → MainTabs (6 abas)
    ├── Home     (🏠)  HomeScreen
    ├── Album    (📚)  AlbumScreen → AlbumIndex → TeamDetail
    ├── Friends  (👥)  FriendsScreen
    ├── Trade    (📲)  TradeScreen
    ├── Share    (🔗)  ShareScreen
    └── Profile  (👤)  ProfileScreen
```

## Build Android

**Perfis EAS** (`eas.json`):
- `development` — dev client, distribuição interna
- `preview` — **APK** para instalar direto no dispositivo
- `production` — AAB para Google Play

```bash
eas build --platform android --profile preview   # APK via EAS cloud
./build-production-android.sh                    # AAB local (requer JDK + keystore)
```

**Observações:**
- `google-services.json` não é necessário (Firebase JS SDK, não nativo)
- As variáveis `EXPO_PUBLIC_*` do `.env` são injetadas pelo EAS automaticamente no build
- EAS projectId: `dbba3105-e1cd-4067-83be-2aaa5f4e646e` (owner: `maxwellfaria`)
- `versionCode` e `version` estão hardcoded em `app.config.js` — incrementar manualmente antes de cada release

## Plano de ação — hardcoded a remover futuramente

| Item | Arquivo | Ação |
|---|---|---|
| `version` e `versionCode` | `app.config.js` | Migrar para `version.properties` (padrão Nossa Liga) + script `bump_version.sh` |
| `1500` ms debounce | `src/hooks/useAlbum.ts:60` | Extrair para constante `SAVE_DEBOUNCE_MS` no topo do arquivo |
| Política de Privacidade embutida | `src/screens/ProfileScreen.tsx` | Mover para URL remota ou doc Firestore para evitar release a cada atualização |
| `expo-font` em `package.json` | `package.json` | Remover dependência não utilizada em nenhum arquivo do projeto |
| `assets/unused/` | `assets/unused/` | Deletar pasta com assets obsoletos (ícones e splashs antigos) |

## Segurança

- Credenciais Firebase em `.env` local e EAS Secrets na nuvem — nunca commitadas
- Regras Firestore: álbum escrito apenas pelo próprio dono; perfis legíveis por qualquer autenticado (necessário para busca por código de convite)
- `emailVerifications` inacessível pelo cliente — apenas Admin SDK
- `DEV_SKIP_EMAIL_VERIFICATION` ativo apenas em `__DEV__` (dev server local), nunca em builds EAS

## Arquivos que NÃO vão pro git

- `.env` — credenciais Firebase do app
- `functions/.env` — credenciais de e-mail (MAIL_USER, MAIL_PASS)
- `google-services.json` — não necessário mas presente localmente (não commitado)
- `node_modules/`, `dist/`, `.expo/`
- `*.aab`, `*.apk` — builds gerados
- `.claude/`, `memory/` — dados locais do Claude Code
