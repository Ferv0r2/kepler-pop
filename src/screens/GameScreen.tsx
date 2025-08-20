import React, { useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { GameBoard } from '@/components/game/GameBoard'
import { ScoreDisplay } from '@/components/game/ScoreDisplay'
import { useGameLogic } from '@/hooks/game/useGameLogic'
import { useGameStore } from '@/state/gameStore'
import type { Position } from '@/types/game.types'

interface GameScreenProps {
  onBack?: () => void
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBack }) => {
  const {
    grid,
    score,
    moves,
    isGameOver,
    initializeGame,
    swapTiles,
    handleShuffle,
  } = useGameLogic()
  
  const { highScore, sessionBonus, showScorePopup } = useGameStore()
  
  // Game over modal animation
  const gameOverScale = useSharedValue(0)
  const gameOverOpacity = useSharedValue(0)
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame()
  }, [])
  
  // Animate game over modal
  useEffect(() => {
    if (isGameOver) {
      gameOverScale.value = withSpring(1, { damping: 15, stiffness: 150 })
      gameOverOpacity.value = withTiming(1, { duration: 300 })
    } else {
      gameOverScale.value = withTiming(0, { duration: 200 })
      gameOverOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [isGameOver])
  
  const handleTilePress = useCallback((position: Position) => {
    console.log('Tile pressed:', position)
  }, [])
  
  const handleTileSwap = useCallback((from: Position, to: Position) => {
    swapTiles(from, to)
  }, [swapTiles])
  
  const handleRestart = useCallback(() => {
    initializeGame()
  }, [initializeGame])
  
  const gameOverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gameOverScale.value }],
    opacity: gameOverOpacity.value,
  }))
  
  // Score popup
  const renderScorePopup = () => {
    if (!showScorePopup) return null
    
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(500)}
        style={[
          styles.scorePopup,
          {
            left: `${(showScorePopup.x / 8) * 100}%`,
            top: `${(showScorePopup.y / 8) * 100}%`,
          },
        ]}
      >
        <Text style={styles.scorePopupText}>+{showScorePopup.score}</Text>
      </Animated.View>
    )
  }
  
  return (
    <LinearGradient
      colors={['#1a1a2e', '#0f3460', '#16213e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent 
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Kepler Pop</Text>
            <TouchableOpacity onPress={handleShuffle} style={styles.shuffleButton}>
              <Text style={styles.shuffleButtonText}>🔀</Text>
            </TouchableOpacity>
          </View>
          
          {/* Score Display */}
          <ScoreDisplay />
          
          {/* Game Board */}
          <View style={styles.boardContainer}>
            <GameBoard onTilePress={handleTilePress} onTileSwap={handleTileSwap} />
            {renderScorePopup()}
          </View>
          
          {/* Session Streak */}
          {sessionBonus.playStreak > 1 && (
            <View style={styles.streakContainer}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.streakCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.streakText}>
                  🔥 {sessionBonus.playStreak} Game Streak!
                </Text>
              </LinearGradient>
            </View>
          )}
        </SafeAreaView>
        
        {/* Game Over Modal */}
        <Modal
          visible={isGameOver}
          transparent
          animationType="none"
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, gameOverAnimatedStyle]}>
              <LinearGradient
                colors={['#9333EA', '#7C3AED', '#6B21A8']}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.gameOverTitle}>Game Over!</Text>
                
                <View style={styles.scoreSection}>
                  <Text style={styles.finalScoreLabel}>Final Score</Text>
                  <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
                  
                  {score > highScore && (
                    <View style={styles.newHighScore}>
                      <Text style={styles.newHighScoreText}>
                        🎉 NEW HIGH SCORE! 🎉
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Session Stats */}
                <View style={styles.statsSection}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Streak Bonus</Text>
                    <Text style={styles.statValue}>
                      x{sessionBonus.bonusMultiplier.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Games Today</Text>
                    <Text style={styles.statValue}>{sessionBonus.playStreak}</Text>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.playAgainButton}
                    onPress={handleRestart}
                  >
                    <LinearGradient
                      colors={['#22C55E', '#16A34A']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.playAgainText}>Play Again</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.homeButton}
                    onPress={onBack}
                  >
                    <Text style={styles.homeButtonText}>Home</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shuffleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  shuffleButtonText: {
    fontSize: 20,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scorePopup: {
    position: 'absolute',
    zIndex: 100,
  },
  scorePopupText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  streakContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  streakCard: {
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newHighScore: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
  },
  newHighScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  playAgainButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  homeButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})