import 'react-native-gesture-handler';
import React, { Component, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import TradeScreen from './src/screens/TradeScreen';
import ShareScreen from './src/screens/ShareScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import AuthScreen from './src/screens/AuthScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

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
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/splash.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
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
    backgroundColor: '#F1F5F9',
  },
  splashSpinner: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
});
