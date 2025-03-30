import React, { useEffect } from 'react'
import styled from 'styled-components/native'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Animated from 'react-native-reanimated'
import {
  TILE_SIZE,
  TILE_CONTENT_SIZE,
  TILE_BORDER_RADIUS,
  TILE_CONTENT_BORDER_RADIUS,
  UI_COLORS,
  ANIMATION_SPRING_CONFIG,
  ANIMATION_TIMING,
} from '@/constants/basicConfig'

interface TileProps {
  value: number
  onPress: () => void
  x: number
  y: number
  isMatched?: boolean
  isNew?: boolean
  isDropped?: boolean
  fromY?: number // 드롭 시작 위치
}

const getTileColor = (value: number) => {
  'worklet'
  return UI_COLORS.tile.values[(value - 1) % UI_COLORS.tile.values.length]
}

const AnimatedTouchable = Animated.createAnimatedComponent(
  styled.TouchableOpacity`
    width: ${TILE_SIZE}px;
    height: ${TILE_SIZE}px;
    position: absolute;
    align-items: center;
    justify-content: center;
    border-radius: ${TILE_BORDER_RADIUS}px;
  `,
)

const TileContent = styled.View<{ backgroundColor: string }>`
  width: ${TILE_CONTENT_SIZE}px;
  height: ${TILE_CONTENT_SIZE}px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${TILE_CONTENT_BORDER_RADIUS}px;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  elevation: 5;
`

export const Tile: React.FC<TileProps> = ({
  value,
  onPress,
  x,
  y,
  isMatched = false,
  isNew = false,
  isDropped = false,
  fromY,
}) => {
  const offsetX = useSharedValue(x)
  const offsetY = useSharedValue(isDropped && fromY !== undefined ? fromY : y)
  const scale = useSharedValue(isNew ? 0 : 1)
  const rotate = useSharedValue('0deg')
  const opacity = useSharedValue(1)
  const shimmer = useSharedValue(0)

  // 위치 변경 시 애니메이션
  useEffect(() => {
    offsetX.value = withSpring(x, ANIMATION_SPRING_CONFIG)

    // 드롭 애니메이션
    if (isDropped && fromY !== undefined) {
      // 초기 위치 설정
      offsetY.value = fromY

      // 약간의 지연 후에 드롭 애니메이션 시작 (새 타일일수록 더 지연)
      setTimeout(
        () => {
          // 새 타일은 더 빠르게 떨어지고, 바운스 효과 강화
          const config = isNew
            ? {
                damping: 12,
                stiffness: 140,
                mass: 1.1,
                overshootClamping: false,
              }
            : ANIMATION_TIMING.dropTileBounce

          offsetY.value = withSpring(y, config)
        },
        isNew ? 100 + Math.abs(fromY) / 5 : 50 + Math.abs(y - fromY) / 10,
      )
    } else {
      offsetY.value = withSpring(y, ANIMATION_SPRING_CONFIG)
    }
  }, [x, y, offsetX, offsetY, isDropped, isNew, fromY])

  // 매치된 타일과 새 타일 효과
  useEffect(() => {
    if (isMatched) {
      // 매치된 타일 효과 - 반짝이고 스케일 변화 (하지만 완전히 사라지지 않도록)
      scale.value = withSequence(
        withTiming(1.2, { duration: ANIMATION_TIMING.tile.grow }),
        withTiming(0.8, { duration: ANIMATION_TIMING.tile.shrink }),
        withTiming(1, { duration: ANIMATION_TIMING.tile.restore }), // 다시 1로 설정
      )

      shimmer.value = withSequence(
        withTiming(0.8, { duration: ANIMATION_TIMING.shimmer.on }),
        withTiming(0, { duration: ANIMATION_TIMING.shimmer.off }),
      )
    } else if (isNew) {
      // 새 타일 효과
      scale.value = 0.7 // 약간 작은 크기로 시작
      opacity.value = 1

      // 약간 지연 후 정상 크기로
      setTimeout(() => {
        scale.value = withTiming(1, { duration: ANIMATION_TIMING.tile.appear })
      }, 100)
    } else if (isDropped) {
      // 떨어지는 타일은 크기 변화 없음
      scale.value = 1
      opacity.value = 1
    } else {
      // 기본 상태
      scale.value = withTiming(1, { duration: ANIMATION_TIMING.tile.disappear })
      opacity.value = withTiming(1, {
        duration: ANIMATION_TIMING.tile.disappear,
      })
      rotate.value = withTiming('0deg', {
        duration: ANIMATION_TIMING.tile.press,
      })
      shimmer.value = withTiming(0, { duration: ANIMATION_TIMING.tile.press })
    }
  }, [isMatched, isNew, isDropped, scale, opacity, rotate, shimmer])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
      { rotate: rotate.value },
    ],
    opacity: opacity.value,
    backgroundColor: getTileColor(value),
    zIndex: isMatched ? 10 : isDropped ? 8 : isNew ? 5 : 1,
  }))

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      opacity: shimmer.value,
    }
  })

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: ANIMATION_TIMING.tile.press }),
      withTiming(1.1, { duration: ANIMATION_TIMING.tile.press }),
      withTiming(1, { duration: ANIMATION_TIMING.tile.press }),
    )
    onPress()
  }

  return (
    <AnimatedTouchable style={animatedStyle} onPress={handlePress}>
      <TileContent backgroundColor={getTileColor(value)}>
        <Animated.View style={shimmerStyle} />
      </TileContent>
    </AnimatedTouchable>
  )
}
