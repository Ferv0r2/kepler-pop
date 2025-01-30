import React, { useEffect } from 'react'
import { Text } from 'react-native'
import styled from 'styled-components/native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface TileProps {
  value: number
  onPress: () => void
  x: number
  y: number
  isMatched: boolean
}

const AnimatedTouchable = Animated.createAnimatedComponent(
  styled.TouchableOpacity`
    width: 60px;
    height: 60px;
    position: absolute;
    background-color: #ffcc00;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  `,
)

export const Tile = ({ value, onPress, x, y, isMatched }: TileProps) => {
  const offsetX = useSharedValue(x)
  const offsetY = useSharedValue(y)
  const opacity = useSharedValue(1)

  useEffect(() => {
    offsetX.value = withSpring(x)
    offsetY.value = withSpring(y)
  }, [offsetX, offsetY, x, y])

  useEffect(() => {
    if (isMatched) {
      opacity.value = withTiming(0, { duration: 300 })
    } else {
      opacity.value = withTiming(1)
    }
  }, [isMatched, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    opacity: opacity.value,
  }))

  return (
    <AnimatedTouchable style={animatedStyle} onPress={onPress}>
      <TileText>{value}</TileText>
    </AnimatedTouchable>
  )
}

const TileText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`
