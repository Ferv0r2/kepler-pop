import {
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { ANIMATION_DURATION } from '@/constants/gameConfig'

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
}

export const TIMING_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

// Tile swap animation
export const animateTileSwap = (
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  targetX: number,
  targetY: number,
  onComplete?: () => void
) => {
  'worklet'
  
  translateX.value = withSpring(targetX, SPRING_CONFIG, () => {
    if (onComplete) {
      runOnJS(onComplete)()
    }
  })
  translateY.value = withSpring(targetY, SPRING_CONFIG)
}

// Tile match animation (scale down and fade out)
export const animateTileMatch = (
  scale: SharedValue<number>,
  opacity: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet'
  
  scale.value = withSequence(
    withTiming(1.2, { duration: 100 }),
    withTiming(0, { duration: 200 })
  )
  
  opacity.value = withTiming(0, { duration: 300 }, () => {
    if (onComplete) {
      runOnJS(onComplete)()
    }
  })
}

// Tile refill animation (fall from top)
export const animateTileRefill = (
  translateY: SharedValue<number>,
  scale: SharedValue<number>,
  opacity: SharedValue<number>,
  delay: number = 0
) => {
  'worklet'
  
  translateY.value = withDelay(
    delay,
    withSpring(0, {
      ...SPRING_CONFIG,
      damping: 10,
      stiffness: 100,
    })
  )
  
  scale.value = withDelay(
    delay,
    withSequence(
      withTiming(0.8, { duration: 0 }),
      withSpring(1, SPRING_CONFIG)
    )
  )
  
  opacity.value = withDelay(
    delay,
    withTiming(1, { duration: 200 })
  )
}

// Tile selection animation
export const animateTileSelection = (
  scale: SharedValue<number>,
  selected: boolean
) => {
  'worklet'
  
  scale.value = withSpring(selected ? 1.1 : 1, SPRING_CONFIG)
}

// Score popup animation
export const animateScorePopup = (
  translateY: SharedValue<number>,
  opacity: SharedValue<number>,
  scale: SharedValue<number>
) => {
  'worklet'
  
  translateY.value = withSequence(
    withTiming(-30, { duration: 500, easing: Easing.out(Easing.cubic) }),
    withTiming(-50, { duration: 300 })
  )
  
  scale.value = withSequence(
    withSpring(1.5, { damping: 8, stiffness: 200 }),
    withTiming(1, { duration: 200 })
  )
  
  opacity.value = withSequence(
    withTiming(1, { duration: 100 }),
    withDelay(400, withTiming(0, { duration: 300 }))
  )
}

// Combo animation
export const animateCombo = (
  scale: SharedValue<number>,
  rotation: SharedValue<number>,
  combo: number
) => {
  'worklet'
  
  const intensity = Math.min(combo / 10, 1)
  
  scale.value = withSequence(
    withSpring(1 + intensity * 0.5, { damping: 5, stiffness: 200 }),
    withSpring(1, SPRING_CONFIG)
  )
  
  rotation.value = withSequence(
    withTiming(intensity * 15, { duration: 100 }),
    withSpring(0, SPRING_CONFIG)
  )
}

// Lucky tile glow animation
export const animateLuckyGlow = (
  glowIntensity: SharedValue<number>
) => {
  'worklet'
  
  glowIntensity.value = withSequence(
    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
    withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
  )
}

// Near miss shake animation
export const animateNearMiss = (
  translateX: SharedValue<number>
) => {
  'worklet'
  
  translateX.value = withSequence(
    withTiming(-5, { duration: 50 }),
    withTiming(5, { duration: 50 }),
    withTiming(-5, { duration: 50 }),
    withTiming(5, { duration: 50 }),
    withTiming(0, { duration: 50 })
  )
}

// Cascade animation for multiple tiles
export const animateCascade = (
  tiles: { scale: SharedValue<number>; opacity: SharedValue<number> }[],
  delayBetween: number = 50
) => {
  'worklet'
  
  tiles.forEach((tile, index) => {
    const delay = index * delayBetween
    
    tile.scale.value = withDelay(
      delay,
      withSpring(1, SPRING_CONFIG)
    )
    
    tile.opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200 })
    )
  })
}

// Shuffle animation
export const animateShuffle = (
  rotation: SharedValue<number>,
  scale: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet'
  
  rotation.value = withSequence(
    withTiming(360, { duration: 500, easing: Easing.inOut(Easing.cubic) }),
    withTiming(720, { duration: 500, easing: Easing.inOut(Easing.cubic) })
  )
  
  scale.value = withSequence(
    withTiming(0.8, { duration: 250 }),
    withTiming(1.1, { duration: 250 }),
    withTiming(1, { duration: 500 }, () => {
      if (onComplete) {
        runOnJS(onComplete)()
      }
    })
  )
}

// Game over animation
export const animateGameOver = (
  scale: SharedValue<number>,
  opacity: SharedValue<number>,
  blur: SharedValue<number>
) => {
  'worklet'
  
  scale.value = withSpring(0.95, { damping: 20, stiffness: 100 })
  opacity.value = withTiming(0.5, { duration: 500 })
  blur.value = withTiming(10, { duration: 500 })
}

// Calculate animation delay based on position
export const getPositionDelay = (row: number, col: number, type: 'cascade' | 'wave' | 'random' = 'cascade'): number => {
  switch (type) {
    case 'cascade':
      return (row + col) * 30
    case 'wave':
      return row * 50
    case 'random':
      return Math.random() * 300
    default:
      return 0
  }
}