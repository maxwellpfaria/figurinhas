import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from './AppLogo';

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dot1        = useRef(new Animated.Value(0.25)).current;
  const dot2        = useRef(new Animated.Value(0.25)).current;
  const dot3        = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Logo: spring scale + fade simultâneos
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 45,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    // Texto: fade após logo pousar
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 480,
      delay: 380,
      useNativeDriver: true,
    }).start();

    // Pontos: pulso contínuo em cascata, começa após texto aparecer
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1,    duration: 420, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.25, duration: 420,        useNativeDriver: true }),
        ])
      );

    const id = setTimeout(() => {
      pulse(dot1,   0).start();
      pulse(dot2, 140).start();
      pulse(dot3, 280).start();
    }, 750);

    return () => clearTimeout(id);
  }, []);

  return (
    <LinearGradient colors={['#05090F', '#0B0F19', '#101C30']} style={styles.root}>

      {/* Glow atrás do logo */}
      <View style={styles.glowRing} />

      {/* Logo animado */}
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <View style={styles.logoShadow}>
          <AppLogo size={128} />
        </View>
      </Animated.View>

      {/* Título + tagline */}
      <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
        <Text style={styles.title}>Meu Álbum</Text>
        <Text style={styles.tagline}>Organize. Troque. Zere.</Text>
      </Animated.View>

      {/* Três pontos pulsantes */}
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#10B981',
    opacity: 0.07,
    // halo maior via shadow
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
  },

  logoShadow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },

  textBlock: {
    alignItems: 'center',
    marginTop: 28,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 56,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
});
