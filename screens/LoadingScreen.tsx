import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, SafeAreaView } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface ItemProps {
  position: { x: number; y: number };
  size: number;
  delay?: number;
}

const Star = ({ size, position, delay = 0 }: ItemProps) => {
  const opacity = useRef(new Animated.Value(0.2)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          left: position.x,
          top: position.y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const Sparkle = ({ position, size, delay = 0 }: ItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(Math.random() * 2000),
      ]),
    ).start();
  }, [delay, opacity, rotation, scale]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        opacity,
        transform: [{ scale }, { rotate: spin }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="#FFEB3B"
          stroke="#FFF"
          strokeWidth="1"
        />
      </Svg>
    </Animated.View>
  );
};

const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(Animated.parallel([animateDot(dot1, 0), animateDot(dot2, 200), animateDot(dot3, 400)])).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1,
            transform: [
              {
                translateY: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2,
            transform: [
              {
                translateY: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3,
            transform: [
              {
                translateY: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

interface LoadingScreenProps {
  visible?: boolean;
  onFadeOutEnd?: () => void;
}

const LoadingScreen = ({ visible = true, onFadeOutEnd }: LoadingScreenProps) => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    position: {
      x: Math.random() * width,
      y: Math.random() * height,
    },
    delay: Math.random() * 2000,
  }));

  // Generate sparkles
  const sparkles = [
    { id: 1, size: 24, position: { x: width * 0.2, y: height * 0.3 }, delay: 0 },
    { id: 2, size: 16, position: { x: width * 0.8, y: height * 0.2 }, delay: 500 },
    { id: 3, size: 20, position: { x: width * 0.3, y: height * 0.7 }, delay: 1000 },
    { id: 4, size: 18, position: { x: width * 0.7, y: height * 0.6 }, delay: 1500 },
  ];

  // titleImage scale 애니메이션
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scale]);

  // fade 애니메이션
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onFadeOutEnd) onFadeOutEnd();
      });
    } else {
      opacity.setValue(1);
    }
  }, [visible, onFadeOutEnd, opacity]);

  return (
    <Animated.View style={[styles.fullScreen, { opacity }]}>
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.container}>
          {/* Stars background */}
          {stars.map((star) => (
            <Star key={star.id} size={star.size} position={star.position} delay={star.delay} />
          ))}

          {/* Sparkles */}
          {sparkles.map((sparkle) => (
            <Sparkle key={sparkle.id} size={sparkle.size} position={sparkle.position} delay={sparkle.delay} />
          ))}

          {/* Title */}
          <View style={styles.titleContainer}>
            <Animated.Image
              source={require('../assets/images/title.png')}
              style={[styles.titleImage, { transform: [{ scale }] }]}
              resizeMode="contain"
            />
          </View>

          {/* Loading text */}
          <View style={styles.loadingContainer}>
            <LoadingDots />
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#0A1128',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleImage: {
    marginBottom: 16,
    marginTop: 96,
    alignSelf: 'center',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFEB3B',
    borderRadius: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
});

export default LoadingScreen;
