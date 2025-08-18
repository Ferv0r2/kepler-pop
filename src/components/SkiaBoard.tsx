import React, { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  Canvas,
  Circle,
  Line,
  LinearGradient,
  Paint,
  Rect,
  vec,
} from '@shopify/react-native-skia'
import {
  useSharedValue,
  useAnimatedReaction,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'

export const SkiaBoard: React.FC = () => {
  const { width } = useWindowDimensions()
  const height = width * 1.2

  const circleX = useSharedValue(width / 2)
  const circleY = useSharedValue(height / 2)
  const circleRadius = useSharedValue(20)
  const circleOpacity = useSharedValue(1)

  useEffect(() => {
    circleX.value = withRepeat(
      withSequence(
        withTiming(width * 0.8, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(width * 0.2, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )

    circleY.value = withRepeat(
      withSequence(
        withTiming(height * 0.3, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(height * 0.7, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )

    circleRadius.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(20, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )

    circleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    )
  }, [width, height, circleX, circleY, circleRadius, circleOpacity])

  useAnimatedReaction(
    () => circleX.value,
    (currentX) => {
      console.log('Circle X:', currentX)
    },
    [],
  )

  const gridSize = 30
  const gridLines = []

  for (let i = 0; i <= width; i += gridSize) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        p1={vec(i, 0)}
        p2={vec(i, height)}
        color="rgba(255, 255, 255, 0.1)"
        style="stroke"
        strokeWidth={1}
      />,
    )
  }

  for (let i = 0; i <= height; i += gridSize) {
    gridLines.push(
      <Line
        key={`h-${i}`}
        p1={vec(0, i)}
        p2={vec(width, i)}
        color="rgba(255, 255, 255, 0.1)"
        style="stroke"
        strokeWidth={1}
      />,
    )
  }

  return (
    <Canvas style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={['#16213e', '#0f3460', '#533483']}
        />
      </Rect>

      {gridLines}

      <Circle cx={circleX} cy={circleY} r={circleRadius} opacity={circleOpacity}>
        <Paint color="#00ffff" />
      </Circle>

      <Circle cx={width / 2} cy={height / 2} r={5}>
        <Paint color="#ff00ff" />
      </Circle>
    </Canvas>
  )
}