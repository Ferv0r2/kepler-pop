import React, { useEffect } from 'react'
import styled from 'styled-components/native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

interface TileProps {
  value: number
  onPress: () => void
  x: number
  y: number
  // isMatched: boolean
  // isNew: boolean
}

const getTileColor = (value: number) => {
  const colors = ['#F4A7B9', '#F4D06F', '#A1C6EA', '#B8E0D2']
  return colors[value - 1] || '#ffcc00'
}

const AnimatedTouchable = Animated.createAnimatedComponent(
  styled.TouchableOpacity<{ backgroundColor: string }>`
    width: 60px;
    height: 60px;
    position: absolute;
    background-color: ${({ backgroundColor }) => backgroundColor};
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  `,
)

export const Tile = ({ value, onPress, x, y }: TileProps) => {
  const offsetX = useSharedValue(x)
  const offsetY = useSharedValue(y)

  useEffect(() => {
    offsetX.value = withSpring(x)
    offsetY.value = withSpring(y) // grid 업데이트에 따라 부드럽게 이동
  }, [x, y, offsetX, offsetY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    // opacity: opacity.value, // 제거하거나 필요시 다른 애니메이션으로 대체
  }))

  return (
    <AnimatedTouchable
      style={animatedStyle}
      backgroundColor={getTileColor(value)}
      onPress={onPress}
    />
  )
}
