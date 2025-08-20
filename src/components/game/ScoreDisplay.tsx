import React, { useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { useGameStore } from '@/state/gameStore'
import { SPRING_CONFIG } from '@/utils/animation/animationHelpers'

export const ScoreDisplay: React.FC = () => {
  const { score, moves, combo, highScore, isGameOver, sessionBonus } = useGameStore()
  
  // Animation values
  const scoreScale = useSharedValue(1)
  const movesScale = useSharedValue(1)
  const comboScale = useSharedValue(1)
  const comboOpacity = useSharedValue(0)
  const newHighScore = useSharedValue(0)
  
  // Animate score changes
  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 5, stiffness: 200 }),
      withSpring(1, SPRING_CONFIG)
    )
  }, [score])
  
  // Animate moves changes
  useEffect(() => {
    movesScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 200 }),
      withSpring(1, SPRING_CONFIG)
    )
  }, [moves])
  
  // Animate combo
  useEffect(() => {
    if (combo > 1) {
      comboOpacity.value = withTiming(1, { duration: 200 })
      comboScale.value = withSequence(
        withSpring(1.3, { damping: 5, stiffness: 200 }),
        withSpring(1, SPRING_CONFIG)
      )
    } else {
      comboOpacity.value = withTiming(0, { duration: 500 })
    }
  }, [combo])
  
  // Check for new high score
  useEffect(() => {
    if (score > highScore && highScore > 0) {
      newHighScore.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 2000 }), // Hold
        withTiming(0, { duration: 300 })
      )
    }
  }, [score, highScore])
  
  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }))
  
  const movesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: movesScale.value }],
  }))
  
  const comboAnimatedStyle = useAnimatedStyle(() => ({
    opacity: comboOpacity.value,
    transform: [
      { scale: comboScale.value },
      { rotate: `${interpolate(comboScale.value, [1, 1.3], [0, 10])}deg` },
    ],
  }))
  
  const highScoreAnimatedStyle = useAnimatedStyle(() => ({
    opacity: newHighScore.value,
    transform: [
      { scale: interpolate(newHighScore.value, [0, 1], [0.8, 1]) },
      { translateY: interpolate(newHighScore.value, [0, 1], [-20, 0]) },
    ],
  }))
  
  return (
    <View style={styles.container}>
      {/* Score Section */}
      <View style={styles.scoreSection}>
        <LinearGradient
          colors={['#9333EA', '#7C3AED']}
          style={styles.scoreCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.label}>SCORE</Text>
          <Animated.View style={scoreAnimatedStyle}>
            <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
          </Animated.View>
          
          {/* High Score Indicator */}
          <Animated.View style={[styles.highScoreIndicator, highScoreAnimatedStyle]}>
            <Text style={styles.highScoreText}>NEW HIGH SCORE! 🎉</Text>
          </Animated.View>
          
          {/* Session Bonus */}
          {sessionBonus.bonusMultiplier > 1 && (
            <View style={styles.bonusIndicator}>
              <Text style={styles.bonusText}>
                {`${sessionBonus.bonusMultiplier.toFixed(1)}x`}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
      
      {/* Moves Section */}
      <View style={styles.movesSection}>
        <LinearGradient
          colors={moves <= 5 ? ['#DC2626', '#B91C1C'] : ['#0284C7', '#0369A1']}
          style={styles.movesCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.label}>MOVES</Text>
          <Animated.View style={movesAnimatedStyle}>
            <Text style={[styles.movesText, moves <= 5 && styles.lowMoves]}>
              {moves}
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
      
      {/* Combo Indicator */}
      <Animated.View style={[styles.comboContainer, comboAnimatedStyle]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.comboCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.comboText}>{combo}x COMBO!</Text>
        </LinearGradient>
      </Animated.View>
      
      {/* Hot Hand Indicator */}
      {sessionBonus.hotHand && (
        <View style={styles.hotHandContainer}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.hotHandCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.hotHandText}>🔥 HOT HAND!</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  scoreSection: {
    flex: 1.5,
  },
  movesSection: {
    flex: 1,
  },
  scoreCard: {
    padding: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  movesCard: {
    padding: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  movesText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  lowMoves: {
    color: '#FFE4E1',
  },
  comboContainer: {
    position: 'absolute',
    top: -10,
    right: 16,
    zIndex: 10,
  },
  comboCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  comboText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  highScoreIndicator: {
    position: 'absolute',
    top: -25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  highScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bonusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bonusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  hotHandContainer: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
  },
  hotHandCard: {
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  hotHandText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})