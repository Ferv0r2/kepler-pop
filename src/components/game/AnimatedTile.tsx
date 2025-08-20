import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { TileEmoji } from './TileEmoji'
import { getTileConfig } from '@/constants/tileConfig'
import type { GridItem } from '@/types/game.types'

interface AnimatedTileProps {
  tile: GridItem
  x: number
  y: number
  size: number
  isNew: boolean
  onAnimationComplete?: () => void
}

export const AnimatedTile: React.FC<AnimatedTileProps> = ({
  tile,
  x,
  y,
  size,
  isNew,
  onAnimationComplete,
}) => {
  const scale = useSharedValue(isNew ? 0 : 1)
  const opacity = useSharedValue(isNew ? 0 : 1)
  const translateY = useSharedValue(isNew ? -size * 2 : 0)
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (tile.isMatched) {
      // Match animation: scale down and fade out
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withTiming(0, { 
          duration: 300, 
          easing: Easing.inOut(Easing.ease) 
        }, () => {
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)()
          }
        })
      )
      
      opacity.value = withTiming(0, { duration: 300 })
      
      // Add rotation for visual interest
      rotation.value = withTiming(180, { duration: 300 })
    } else if (isNew) {
      // New tile animation: fall from top
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 120,
        mass: 0.8,
      })
      
      scale.value = withSequence(
        withDelay(100, withSpring(1.1, { damping: 8, stiffness: 200 })),
        withSpring(1, { damping: 10, stiffness: 150 })
      )
      
      opacity.value = withTiming(1, { duration: 200 })
    } else {
      // Normal state
      scale.value = withSpring(1, { damping: 10, stiffness: 150 })
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withSpring(0, { damping: 10, stiffness: 150 })
    }
  }, [tile.isMatched, isNew])

  // Lucky tile glow animation
  useEffect(() => {
    if (tile.isLucky && !tile.isMatched) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      )
      // Repeat animation
      const interval = setInterval(() => {
        scale.value = withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        )
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [tile.isLucky, tile.isMatched])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: tile.isLucky ? interpolate(scale.value, [1, 1.05], [0.3, 0.6]) : 0,
  }))

  return (
    <Animated.View
      style={[
        styles.container,
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    >
      {/* Lucky glow effect */}
      {tile.isLucky && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size + 8,
              height: size + 8,
              left: -4,
              top: -4,
            },
            glowStyle,
          ]}
        />
      )}
      
      {/* Tile emoji */}
      <TileEmoji type={tile.type} size={size} x={0} y={0} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
})