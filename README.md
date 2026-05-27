# Meu Álbum Completo — Copa do Mundo 2026

Álbum digital das figurinhas da Copa do Mundo 2026. Registre quais figurinhas você possui, compare com amigos e identifique possíveis trocas — tudo sincronizado na nuvem.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~51 / React Native 0.74 |
| Linguagem | TypeScript 5.3.3 (`strict: true`) |
| Navegação | React Navigation v6 (Bottom Tabs) |
| Gestos | `react-native-gesture-handler` |
| Backend | Firebase JS SDK v12 (Auth + Firestore) |
| Persistência local | `@react-native-async-storage/async-storage` |
| Câmera / QR | `expo-camera` |
| QR Code gerador | `react-native-qrcode-svg` |
| Gradiente | `expo-linear-gradient` |
| Ícones | `@expo/vector-icons` (Ionicons) |
| Build Android | EAS Build |

---

## Como executar

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Conta Firebase com projeto configurado

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
├── app.json                        # Config Expo (slug, package, EAS projectId)
├── eas.json                        # Perfis de build EAS
├── .env                            # Credenciais Firebase (não commitado)
├── .env.example                    # Template das variáveis
└── src/
    ├── data/
    │   └── copaData.ts             # Única fonte de dados (994 figurinhas, 50 seções)
    ├── screens/
    │   ├── HomeScreen.tsx          # Início: stats do álbum + progresso dos amigos
    │   ├── AlbumScreen.tsx         # Meu Álbum: índice de seleções → grade de figurinhas
    │   ├── FriendsScreen.tsx       # Amigos: adicionar, comparar álbum e sugestão de trocas
    │   ├── TradeScreen.tsx         # Troca QR: gerar QR Code + escanear + match de trocas
    │   ├── ShareScreen.tsx         # Exportar: compartilhar lista de faltantes/repetidas
    │   ├── ProfileScreen.tsx       # Perfil: dados, código de convite, tema, FAQ, políticas
    │   └── AuthScreen.tsx          # Login / cadastro / recuperação de senha
    ├── components/
    │   ├── AlbumIndex.tsx          # Lista de seleções com busca, ordenação e filtro de grupo
    │   ├── TeamDetail.tsx          # Grade de figurinhas da seleção + swipe entre seleções
    │   ├── StickerCard.tsx         # Card individual (3:4, shimmer especial, badge de cópias)
    │   ├── SectionTabs.tsx         # Carrossel de abas horizontais por seção (legado)
    │   ├── GroupTabs.tsx           # Pills de filtro por grupo (FWC, A–L, CC)
    │   ├── BottomSheetEditor.tsx   # Modal slide-up para editar quantidade exata
    │   ├── TradeMatchModal.tsx     # Modal com resultado de match de troca (pós-scan QR)
    │   ├── WelcomeWizard.tsx       # Onboarding de 4 passos exibido na primeira abertura
    │   ├── AppDialog.tsx           # Modal de alerta customizado (substitui Alert nativo)
    │   ├── AppLogo.tsx             # Ícone SVG do app (figurinhas + bola de futebol)
    │   └── AlbumContent.tsx        # FlatList de figurinhas reutilizável (modo readOnly)
    ├── hooks/
    │   └── useAlbum.ts             # Estado das quantidades + sync Firestore (debounce 1.5s)
    ├── contexts/
    │   ├── AlbumContext.tsx        # Provider global do álbum (expõe useAlbumContext)
    │   └── AuthContext.tsx         # Auth Firebase: user, profile, loading, refreshProfile
    ├── services/
    │   ├── firebase.ts             # Init Firebase (auth + db) com persistência por plataforma
    │   ├── firestore.ts            # CRUD: perfil, álbum (subcollection), amigos
    │   └── auth.ts                 # signUp / signIn / signOut / resetPassword
    ├── utils/
    │   └── tradeQR.ts              # Encode/decode QR, cálculo de trocas, stats, share text
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
  - Long press: abre editor de quantidade exata
  - Modo edição (✏️): toggle rápido de 0 ↔ 1 cópia em lote
- **Onboarding**: wizard de 4 passos exibido uma única vez na primeira abertura
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
- Login, recuperação de senha
- Persistência de sessão: IndexedDB (web) / AsyncStorage (nativo)

---

## Dados das figurinhas

| Item | Quantidade |
|---|---|
| Total de figurinhas | 994 |
| Seções | 50 (FWC + 48 seleções + CC Coca-Cola) |
| Figurinhas especiais | 68 (20 holográficas FWC + 48 escudos) |

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

## Estrutura Firestore

```
/users/{uid}
  uid, email, displayName, inviteCode, friends[], createdAt

/users/{uid}/album/quantities
  data: { "bra_1": 2, "fwc_3": 1, ... }   ← stickerId → quantidade
  updatedAt: timestamp
```

> O campo `quantities` foi migrado para subcollection. Existe fallback automático de migração: se o documento da subcollection não existir, o app lê do campo legado no doc do usuário e migra automaticamente.

---

## Navegação

```
AppGate
├── (loading)      → splash com ActivityIndicator (mínimo 2s)
├── (sem usuário)  → AuthScreen
└── (com usuário)  → MainTabs (6 abas)
    ├── Início     (🏠)  HomeScreen
    ├── Meu Álbum  (📚)  AlbumScreen  → índice → seleção
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
- `google-services.json` **não é necessário** (Firebase JS SDK)
- As variáveis `EXPO_PUBLIC_*` do `.env` são injetadas pelo EAS automaticamente
- EAS projectId: `dbba3105-e1cd-4067-83be-2aaa5f4e646e` (owner: `maxwellfaria`)
