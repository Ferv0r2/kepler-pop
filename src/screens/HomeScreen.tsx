import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { GameScreen } from './GameScreen'
import { useGameStore } from '@/state/gameStore'

const { width: screenWidth } = Dimensions.get('window')

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets()
  const [showGame, setShowGame] = useState(false)
  const { highScore, sessionBonus } = useGameStore()
  
  // Animations
  const titleScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.5)
  const buttonScale = useSharedValue(1)
  const floatY = useSharedValue(0)
  
  useEffect(() => {
    // Title pulse animation
    titleScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      ),
      -1,
      true
    )
    
    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
    
    // Float animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
  }, [])
  
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }))
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))
  
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { translateY: floatY.value },
    ],
  }))
  
  const handlePlayPress = () => {
    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 200 }),
      withSpring(1.1, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    )
    
    setTimeout(() => {
      setShowGame(true)
    }, 300)
  }
  
  const handleBack = () => {
    setShowGame(false)
  }
  
  if (showGame) {
    return <GameScreen onBack={handleBack} />
  }
  
  return (
    <LinearGradient
      colors={['#0f0f1e', '#1a1a2e', '#16213e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent 
      />
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Title Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(800)}
            style={styles.titleSection}
          >
            <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
              <LinearGradient
                colors={['#9333EA', '#C084FC', '#9333EA']}
                style={styles.glowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            <Animated.Text style={[styles.title, titleAnimatedStyle]}>
              KEPLER
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, titleAnimatedStyle]}>
              POP
            </Animated.Text>
            
            <Text style={styles.tagline}>Match • Combo • Win</Text>
          </Animated.View>
          
          {/* Stats Section */}
          {highScore > 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              style={styles.statsSection}
            >
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>High Score</Text>
                <Text style={styles.statValue}>{highScore.toLocaleString()}</Text>
              </View>
              
              {sessionBonus.playStreak > 0 && (
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Today's Streak</Text>
                  <Text style={styles.statValue}>🔥 {sessionBonus.playStreak}</Text>
                </View>
              )}
            </Animated.View>
          )}
          
          {/* Play Button */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handlePlayPress}
              style={styles.playButtonTouch}
            >
              <Animated.View style={playButtonAnimatedStyle}>
                <LinearGradient
                  colors={['#22C55E', '#16A34A', '#15803D']}
                  style={styles.playButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.playButtonInner}>
                    <Text style={styles.playButtonText}>PLAY NOW</Text>
                    <Text style={styles.playButtonSubtext}>No login required!</Text>
                  </View>
                  
                  {/* Button shine effect */}
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                    style={styles.buttonShine}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Game Modes Preview */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            style={styles.modesSection}
          >
            <View style={styles.modeCard}>
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modeTitle}>🎯 CASUAL</Text>
                <Text style={styles.modeDesc}>30 moves</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.modeCard}>
              <LinearGradient
                colors={['#F43F5E', '#E11D48']}
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modeTitle}>⚡ CHALLENGE</Text>
                <Text style={styles.modeDesc}>20 moves</Text>
              </LinearGradient>
            </View>
          </Animated.View>
          
          {/* Features */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            style={styles.featuresSection}
          >
            <Text style={styles.featureText}>✨ Lucky Tiles</Text>
            <Text style={styles.featureText}>🔥 Combo System</Text>
            <Text style={styles.featureText}>🏆 Achievements</Text>
          </Animated.View>
        </View>
        
      {/* Decorative elements */}
      <View style={styles.decoration1} />
      <View style={styles.decoration2} />
      <View style={styles.decoration3} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -20,
    left: -40,
    right: -40,
    bottom: -20,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 100,
    opacity: 0.3,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: '#9333EA',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#C084FC',
    letterSpacing: 8,
    marginTop: -10,
    textShadowColor: '#7C3AED',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    letterSpacing: 2,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginVertical: 30,
  },
  playButtonTouch: {
    borderRadius: 32,
  },
  playButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  playButtonInner: {
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  playButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    transform: [{ rotate: '45deg' }],
  },
  modesSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresSection: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  decoration1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9333EA',
    opacity: 0.1,
  },
  decoration2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    opacity: 0.1,
  },
  decoration3: {
    position: 'absolute',
    top: '40%',
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0EA5E9',
    opacity: 0.05,
  },
})