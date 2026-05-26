# Meu Álbum Completo — Copa do Mundo 2026

Álbum digital das figurinhas da Copa do Mundo 2026. Registre quais figurinhas você possui, compare com amigos e identifique possíveis trocas.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~51 / React Native 0.74 |
| Linguagem | TypeScript 5.3.3 (`strict: true`) |
| Navegação | React Navigation v6 (Bottom Tabs) |
| Backend | Firebase JS SDK v12 (Auth + Firestore) |
| Persistência local | `@react-native-async-storage/async-storage` |
| Build Android | EAS Build |

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
eas login                                                   # autentica na conta Expo
eas build --platform android --profile preview              # gera APK para instalação direta
```

> O Firebase JS SDK é utilizado (não o `@react-native-firebase`), portanto `google-services.json` **não é necessário**.

## Estrutura de pastas

```
figurinhas/
├── App.tsx                        # Raiz: ErrorBoundary + providers + navegação
├── app.json                       # Config Expo (slug, package, EAS projectId)
├── eas.json                       # Perfis de build EAS
├── .env                           # Credenciais Firebase (não commitado)
├── .env.example                   # Template das variáveis
└── src/
    ├── data/
    │   └── copaData.ts            # Única fonte de dados das seções/figurinhas
    ├── screens/
    │   ├── AlbumScreen.tsx        # Tela principal: grid + header + stats
    │   ├── FriendsScreen.tsx      # Amigos, convites, álbum do amigo, sugestão de trocas
    │   ├── TradeScreen.tsx        # Placeholder (QR Code)
    │   ├── ShareScreen.tsx        # Placeholder (Exportar)
    │   └── AuthScreen.tsx         # Login / cadastro / recuperação de senha
    ├── components/
    │   ├── AlbumContent.tsx       # FlatList de figurinhas + SectionTabs
    │   ├── StickerCard.tsx        # Card individual da figurinha (shimmer especial)
    │   ├── SectionTabs.tsx        # Carrossel horizontal de abas por seção
    │   └── BottomSheetEditor.tsx  # Modal slide-up para editar quantidade
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
    │   └── ThemeContext.tsx       # ThemeProvider + useTheme hook
    └── types/
        └── index.ts               # Sticker, Section, StickerState, getStickerState()
```

## Funcionalidades

- **Álbum completo** — 994 figurinhas em 50 seções (FWC, 48 seleções, CC Coca-Cola)
- **68 especiais** — 20 FWC holográficas + 48 escudos das seleções
- **Sync em nuvem** — quantidades salvas no Firestore com debounce de 1,5s
- **Amigos** — compare seu álbum com amigos via código de convite e veja sugestões de troca
- **Tema escuro/claro** — dark mode por padrão com toggle no header
- **Multi-plataforma** — Android, iOS e Web

## Estrutura Firestore

```
/users/{uid}
  uid, email, displayName, inviteCode, friends[], createdAt

/users/{uid}/album/quantities
  data: { "bra_1": 2, "fwc_3": 1, ... }   ← stickerId → quantidade
  updatedAt: timestamp
```

## Grupos Copa 2026

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

## Navegação

```
AppGate
├── (loading)      → splash com ActivityIndicator
├── (sem usuário)  → AuthScreen
└── (com usuário)  → MainTabs
    ├── Álbum    (📚)
    ├── Amigos   (👥)
    ├── Troca    (📱) ← em desenvolvimento
    └── Exportar (🔗) ← em desenvolvimento
```

## Funcionalidades pendentes

| Tela | Descrição |
|---|---|
| TradeScreen | Gerar/escanear QR Code para troca presencial |
| ShareScreen | Exportar lista de figurinhas faltando/repetidas |
