import 'react-native-gesture-handler';
import React, { Component, ReactNode, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppLogo from './src/components/AppLogo';
import HomeScreen from './src/screens/HomeScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import TradeScreen from './src/screens/TradeScreen';
import ShareScreen from './src/screens/ShareScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
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
            height: 60,
            paddingBottom: 8,
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

function AppGate() {
  const { user, loading } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minElapsed) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashContent}>
          <AppLogo size={130} />
          <Text style={styles.splashTitle}>Meu Álbum Completo</Text>
          <Text style={styles.splashTagline}>Organize. Troque. Zere.</Text>
        </View>
        <ActivityIndicator color="#10B981" size="large" style={styles.splashSpinner} />
      </View>
    );
  }

  if (!user) return <AuthScreen />;
  return <MainTabs />;
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
  splash: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
    gap: 12,
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  splashTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  splashSpinner: {
    marginTop: 48,
  },
});
