import 'react-native-gesture-handler';
import React, { Component, ReactNode, useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import TradeScreen from './src/screens/TradeScreen';
import ShareScreen from './src/screens/ShareScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AlbumProvider } from './src/contexts/AlbumContext';

// ── Error boundary — prevents blank screen on unhandled render errors ─────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={errStyles.container}>
          <Text style={errStyles.title}>Algo deu errado</Text>
          <Text style={errStyles.msg}>{(this.state.error as Error).message}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
const errStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0B0F19' },
  title: { fontSize: 18, fontWeight: '800', color: '#F43F5E', marginBottom: 12 },
  msg: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ icon, active, color }: { icon: IoniconsName; active: boolean; color: string }) {
  return <Ionicons name={active ? icon : (`${icon}-outline` as IoniconsName)} size={24} color={color} />;
}

function MainTabs() {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <AlbumProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.nav,
            borderTopColor: colors.navBorder,
            borderTopWidth: 1,
            height: 60 + bottom,
            paddingBottom: 8 + bottom,
            paddingTop: 4,
          },
          tabBarActiveTintColor: colors.tabActiveTint,
          tabBarInactiveTintColor: colors.tabInactiveTint,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="home" active={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Album"
          component={AlbumScreen}
          options={{
            tabBarLabel: 'Meu Álbum',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="albums" active={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Friends"
          component={FriendsScreen}
          options={{
            tabBarLabel: 'Amigos',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="people" active={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Trade"
          component={TradeScreen}
          options={{
            tabBarLabel: 'Troca QR',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="qr-code" active={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Share"
          component={ShareScreen}
          options={{
            tabBarLabel: 'Exportar',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="share-social" active={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ focused, color }) => <TabIcon icon="person-circle" active={focused} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </AlbumProvider>
  );
}

const SPLASH_MIN_MS = 2000;

type Screen = 'auth' | 'verify' | 'main';

function AppGate() {
  const { user, loading, emailVerified } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);
  const initialLoadDone = useRef(false);
  const lastScreen = useRef<Screen>('auth');

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  const showSplash = !initialLoadDone.current && (loading || !minElapsed);
  if (!showSplash) initialLoadDone.current = true;

  if (showSplash) return <SplashScreen />;

  // Só atualiza a tela destino quando o auth está estável (loading=false),
  // evitando telas intermediárias durante transições (ex: token antes do home)
  if (!loading) {
    if (!user)           lastScreen.current = 'auth';
    else if (!emailVerified) lastScreen.current = 'verify';
    else                 lastScreen.current = 'main';
  }

  if (lastScreen.current === 'verify') return <EmailVerificationScreen />;
  if (lastScreen.current === 'main')   return <MainTabs />;
  return <AuthScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar style="light" />
              <AppGate />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
