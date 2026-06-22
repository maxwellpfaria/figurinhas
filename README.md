# Meu Álbum Completo — Copa do Mundo 2026

Álbum digital das figurinhas da Copa do Mundo 2026. Registre quais figurinhas você possui, compare com amigos e identifique possíveis trocas — tudo sincronizado na nuvem.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ^56.0.5 / React Native ^0.85.3 |
| Linguagem | TypeScript ~6.0.3 (`strict: true`) |
| Navegação | React Navigation v6 (Bottom Tabs) |
| Gestos | `react-native-gesture-handler` ~2.31.1 |
| Backend | Firebase JS SDK ^12.13.0 (Auth + Firestore + Functions) |
| Persistência local | `@react-native-async-storage/async-storage` 2.2.0 |
| Câmera / QR | `expo-camera` ~56.0.7 |
| QR Code gerador | `react-native-qrcode-svg` ^6.3.21 |
| Gradiente | `expo-linear-gradient` ~56.0.4 |
| Ícones | `@expo/vector-icons` ^15.0.2 (Ionicons) |
| Cloud Functions | Firebase Functions v1 (Node.js 20, us-central1) |
| Build Android | EAS Build / build local via Gradle |

---

## Como executar

### Pré-requisitos

- Node.js 20 LTS
- Firebase CLI (`npm install -g firebase-tools`)
- Conta Firebase com projeto configurado (Firestore + Authentication + Functions habilitados)

### Configuração

1. Clone o repositório e instale as dependências:

```bash
git clone <repo-url>
cd figurinhas
npm install
```

2. Copie o arquivo de variáveis de ambiente e preencha com suas credenciais Firebase:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Rodando o projeto

```bash
npx expo start            # inicia o dev server (escolhe a plataforma)
npx expo start --web      # abre no browser
npx tsc --noEmit          # verifica tipos TypeScript
```

### Build Android (APK)

```bash
eas login                                          # autentica na conta Expo
eas build --platform android --profile preview     # gera APK para instalação direta
```

> O Firebase JS SDK é utilizado (não o `@react-native-firebase`), portanto `google-services.json` **não é necessário**.

---

## Estrutura de pastas

```
figurinhas/
├── App.tsx                         # Raiz: ErrorBoundary + providers + 6 tabs
├── app.config.js                   # Config Expo lida de .env + versionCode/Name
├── eas.json                        # Perfis de build EAS
├── .env                            # Credenciais Firebase (não commitado)
├── .env.example                    # Template das variáveis
├── build-local-android.sh          # Gera APK de debug localmente via Gradle
├── build-production-android.sh     # Gera AAB de release para Play Store
├── functions/                      # Backend Cloud Functions (Node.js 20)
│   ├── src/index.ts                # sendVerificationToken + verifyEmailToken
│   └── .env.example                # Template: MAIL_USER, MAIL_PASS
├── docs/                           # Páginas HTML estáticas hospedadas no Firebase
│   ├── privacy-policy.html         # Política de Privacidade (URL pública Play Store)
│   └── delete-account.html         # Instruções de exclusão de conta (Play Store)
└── src/
    ├── data/
    │   └── copaData.ts             # ÚNICA fonte de dados (993 figurinhas, 50 seções)
    ├── screens/
    │   ├── HomeScreen.tsx          # Início: stats do álbum + progresso dos amigos
    │   ├── AlbumScreen.tsx         # Meu Álbum: índice de seleções → grade de figurinhas
    │   ├── FriendsScreen.tsx       # Amigos: adicionar, comparar álbum e sugestão de trocas
    │   ├── TradeScreen.tsx         # Troca QR: gerar QR Code + escanear + match de trocas
    │   ├── ShareScreen.tsx         # Exportar: compartilhar lista de faltantes/repetidas
    │   ├── ProfileScreen.tsx       # Perfil: dados, código de convite, tema, FAQ, políticas
    │   ├── AuthScreen.tsx          # Login / cadastro / recuperação de senha
    │   └── EmailVerificationScreen.tsx  # Verificação de e-mail por token de 6 dígitos
    ├── components/
    │   ├── AlbumIndex.tsx          # Lista de seleções com busca, ordenação e filtro de grupo
    │   ├── TeamDetail.tsx          # Grade de figurinhas da seleção + swipe entre seleções
    │   ├── StickerCard.tsx         # Card individual (3:4, shimmer especial, badge de cópias)
    │   ├── SectionTabs.tsx         # Carrossel de abas horizontais dentro de TeamDetail
    │   ├── GroupTabs.tsx           # Pills de filtro por grupo (FWC, A–L, CC)
    │   ├── BottomSheetEditor.tsx   # Modal slide-up para editar quantidade exata
    │   ├── TradeMatchModal.tsx     # Modal com resultado de match de troca (pós-scan QR)
    │   ├── WelcomeWizard.tsx       # Onboarding de 4 passos exibido na primeira abertura
    │   ├── AppDialog.tsx           # Modal de alerta customizado (substitui Alert nativo)
    │   ├── AppLogo.tsx             # Ícone SVG do app (figurinhas + bola de futebol)
    │   ├── AlbumContent.tsx        # FlatList de figurinhas reutilizável (modo readOnly)
    │   └── SplashScreen.tsx        # Tela animada exibida durante carregamento inicial
    ├── hooks/
    │   ├── useAlbum.ts             # Estado das quantidades + sync Firestore (debounce 1.5s)
    │   └── useFaq.ts               # Busca FAQ do Firestore com cache AsyncStorage (TTL 6h)
    ├── contexts/
    │   ├── AlbumContext.tsx        # Provider global do álbum (expõe useAlbumContext)
    │   └── AuthContext.tsx         # Auth Firebase: user, profile, emailVerified, loading
    ├── services/
    │   ├── firebase.ts             # Init Firebase (auth + db) com persistência por plataforma
    │   ├── firestore.ts            # CRUD: perfil, álbum (subcollection), amigos
    │   ├── auth.ts                 # signUp / signIn / signOut / resetPassword
    │   ├── functions.ts            # Callable wrappers: sendVerificationToken, verifyEmailToken
    │   └── faq.ts                  # Fetch FAQ do Firestore /config/faq com cache local
    ├── utils/
    │   └── tradeQR.ts              # Encode/decode QR bitmask, cálculo de trocas, stats, share text
    ├── theme/
    │   ├── index.ts                # ColorsType, LightColors, DarkColors, Spacing, Radius, Typography
    │   └── ThemeContext.tsx        # ThemeProvider + useTheme hook
    └── types/
        └── index.ts                # Sticker, Section, StickerState, getStickerState()
```

---

## Funcionalidades

### 🏠 Início
- Resumo do álbum: total coletado, faltantes, repetidas e progresso em %
- Ranking de progresso dos amigos (ordenado por % de conclusão)
- Acesso rápido às seções com mais faltantes

### 📚 Meu Álbum
- **Índice de seleções**: lista todas as 50 seções agrupadas (FWC, Grupos A–L, CC Coca-Cola)
  - Filtro por grupo via pills horizontais
  - Busca por nome de seleção ou código de figurinha (ex: "brasil 7")
  - Ordenação: ordem do álbum ou alfabética (A–Z)
- **Grade de figurinhas**: abre ao tocar em uma seleção
  - Layout por formação (3-4-3) nas seleções com 20 figurinhas
  - Swipe horizontal para navegar entre seleções do mesmo grupo
  - Toque simples: adiciona 1 cópia (card cinza → verde)
  - Toque em card já coletado: abre editor de quantidade
  - Long press: atalho direto para o editor de quantidade
- **Onboarding**: wizard de 3 passos exibido uma única vez na primeira abertura
- **Sync**: salva automaticamente no Firestore 1,5s após a última alteração

### 👥 Amigos
- Adicionar amigos via código de convite de 6 caracteres
- Ver o álbum de um amigo em modo somente leitura
- Sugestões automáticas de troca: o que ele tem repetido que você falta e vice-versa

### 📲 Troca QR
- **Gerar**: exibe um QR Code codificado com suas faltantes e repetidas
- **Escanear**: usa a câmera para ler o QR Code do amigo
- Cálculo automático de match: lista exata das figurinhas que cada um pode dar e receber
- Resultado exibido em modal com chips por figurinha (especiais destacadas em dourado)

### 🔗 Exportar
- Gera um texto formatado com o resumo do álbum (faltantes e repetidas por seção)
- Compartilha direto no WhatsApp, via menu nativo do sistema ou copia para a área de transferência

### 👤 Perfil
- Editar nome de exibição
- Ver e copiar código de convite pessoal
- Alterar e-mail / senha
- Toggle de tema claro/escuro
- Perguntas Frequentes (9 itens)
- Política de Privacidade e Termos de Uso

### 🔐 Autenticação
- Cadastro com e-mail e senha
- Login, recuperação de senha por e-mail
- Verificação de e-mail obrigatória via código de 6 dígitos enviado por Cloud Function (nodemailer/Gmail)
- Persistência de sessão: IndexedDB (web) / AsyncStorage (nativo)

---

## Cloud Functions (Backend)

Todas as funções rodam em `us-central1` (Firebase Functions v1, Node.js 20).

| Função | Tipo | Descrição |
|--------|------|-----------|
| `sendVerificationToken` | Callable | Gera código de 6 dígitos (TTL 15min), armazena em `/emailVerifications/{uid}` e envia por e-mail via nodemailer |
| `verifyEmailToken` | Callable | Valida o código, marca `users/{uid}.emailVerified = true` e apaga o documento. Máximo 5 tentativas. |

### Secrets necessários (Firebase)

```
MAIL_USER   → e-mail Gmail que envia os códigos
MAIL_PASS   → Senha de app do Gmail (não a senha normal)
```

Configure via `firebase functions:config:set` ou arquivo `.env` em `functions/`.

### Estrutura Firestore

```
/users/{uid}
  uid, email, displayName, inviteCode, friends[], createdAt, emailVerified

/users/{uid}/album/quantities
  data: { "bra_1": 2, "fwc_3": 1, ... }   ← stickerId → quantidade
  updatedAt: timestamp

/emailVerifications/{uid}
  token, expiresAt, attempts   ← acesso exclusivo via Admin SDK

/config/faq
  items: [{ id, q, a, order }]   ← FAQ remoto (lido via useFaq com cache 6h)
```

---

## Dados das figurinhas

| Item | Quantidade |
|---|---|
| Total de figurinhas | 993 |
| Seções | 50 (FWC + 48 seleções + CC Coca-Cola) |
| Figurinhas especiais | 67 (19 holográficas FWC + 48 escudos) |

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


---

## Navegação

```
AppGate
├── (loading)           → SplashScreen animada (mínimo 2s)
├── (sem usuário)       → AuthScreen
├── (e-mail não verificado) → EmailVerificationScreen
└── (com usuário)       → MainTabs (6 abas)
    ├── Início     (🏠)  HomeScreen
    ├── Meu Álbum  (📚)  AlbumScreen  → índice → TeamDetail (grade)
    ├── Amigos     (👥)  FriendsScreen
    ├── Troca QR   (📲)  TradeScreen  → gerar / escanear
    ├── Exportar   (🔗)  ShareScreen
    └── Perfil     (👤)  ProfileScreen
```

---

## Build Android

**Perfis EAS** (`eas.json`):

| Perfil | Tipo | Uso |
|---|---|---|
| `development` | dev client | testes internos |
| `preview` | APK | instalação direta no dispositivo |
| `production` | AAB | Google Play |

```bash
eas build --platform android --profile preview
```

**Observações:**
- `google-services.json` **não é necessário** (Firebase JS SDK, não o nativo)
- As variáveis `EXPO_PUBLIC_*` do `.env` são injetadas pelo EAS automaticamente via `app.config.js`
- EAS projectId: `dbba3105-e1cd-4067-83be-2aaa5f4e646e` (owner: `maxwellfaria`)

---

## Segurança

- Credenciais Firebase em `.env` local e EAS Secrets na nuvem — nunca commitadas
- Regras Firestore: perfis de usuário legíveis por qualquer autenticado (necessário para busca por código de convite); álbum escrito apenas pelo próprio dono
- Verificação de e-mail obrigatória via Cloud Function (não via Firebase Auth nativo) para manter controle de rate-limit e expiração customizados
- `emailVerifications/{uid}` inacessível pelo cliente (`allow read, write: if false`); modificado apenas pelo Admin SDK
- `DEV_SKIP_EMAIL_VERIFICATION` em `services/functions.ts` é `true` apenas em `__DEV__` (dev server local), nunca em builds EAS
