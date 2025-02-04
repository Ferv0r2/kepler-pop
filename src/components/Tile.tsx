import React, { useEffect } from 'react'
import { Text } from 'react-native'
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
