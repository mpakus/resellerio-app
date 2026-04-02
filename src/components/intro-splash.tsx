import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/src/theme/colors';

const LOGO_SOURCE = require('../../assets/images/resellerio-logo.png');
const INTRO_DURATION_MS = 1900;

type IntroSplashProps = {
  onFinish: () => void;
};

export function IntroSplash({ onFinish }: IntroSplashProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoRotate = useRef(new Animated.Value(-5)).current;
  const shimmer = useRef(new Animated.Value(0.88)).current;
  const halo = useRef(new Animated.Value(0.72)).current;

  const rotateInterpolate = useMemo(
    () =>
      logoRotate.interpolate({
        inputRange: [-8, 0, 8],
        outputRange: ['-8deg', '0deg', '8deg'],
      }),
    [logoRotate],
  );

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 820,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 0,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(halo, {
          toValue: 0.74,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    entranceAnimation.start();
    shimmerLoop.start();
    haloLoop.start();

    const timeoutId = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 360,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: -14,
          duration: 360,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.03,
          duration: 360,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, INTRO_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
      entranceAnimation.stop();
      shimmerLoop.stop();
      haloLoop.stop();
      fade.stopAnimation();
      rise.stopAnimation();
      logoScale.stopAnimation();
      logoRotate.stopAnimation();
      shimmer.stopAnimation();
      halo.stopAnimation();
    };
  }, [fade, halo, logoRotate, logoScale, onFinish, rise, shimmer]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fade,
          transform: [{ translateY: rise }],
        },
      ]}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.haloLarge,
            {
              opacity: halo,
              transform: [{ scale: halo }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.haloSmall,
            {
              opacity: shimmer,
              transform: [{ scale: shimmer }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [{ scale: logoScale }, { rotate: rotateInterpolate }],
            },
          ]}
        >
          <Image
            accessibilityLabel="ResellerIO logo"
            source={LOGO_SOURCE}
            style={styles.logo}
          />
        </Animated.View>

        <View style={styles.copyWrap}>
          <Text style={styles.title}>ResellerIO</Text>
          <Text style={styles.subtitle}>Inventory, AI, and storefront flow in your pocket.</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: colors.background,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  haloLarge: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  haloSmall: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#fff6ea',
  },
  logoWrap: {
    borderRadius: 44,
    padding: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 10,
  },
  logo: {
    width: 172,
    height: 172,
  },
  copyWrap: {
    marginTop: 26,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    maxWidth: 280,
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
