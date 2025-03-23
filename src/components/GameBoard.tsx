import React, { useState } from 'react'
import { View, Text, Dimensions } from 'react-native'
import styled from 'styled-components/native'
import { Tile } from '@/components/Tile'
import { BOARD_SIZE, UI_COLORS, LAYOUT } from '@/constants/basicConfig'
import { useGameLogic } from '@/hooks/usePuzzleLogic'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'

const windowWidth = Dimensions.get('window').width
// 보드 크기 계산 (패딩 고려)
const calculatedTileSize = (windowWidth - 60) / BOARD_SIZE
const calculatedBoardSize = calculatedTileSize * BOARD_SIZE

export const GameBoard = () => {
  const { gameState, handleTileSwap } = useGameLogic()
  const { score, moves, isAnimating } = gameState
  const scoreAnimation = useSharedValue(1)
  const movesAnimation = useSharedValue(1)

  const [selectedTile, setSelectedTile] = useState<{
    row: number
    col: number
  } | null>(null)

  const triggerScoreAnimation = () => {
    scoreAnimation.value = withSpring(1.3, {}, () => {
      scoreAnimation.value = withTiming(1)
    })
  }

  const handleTilePress = (row: number, col: number) => {
    if (isAnimating) return

    if (!selectedTile) {
      setSelectedTile({ row, col })
      return
    }

    const { row: prevRow, col: prevCol } = selectedTile
    // 인접한 타일만 허용
    if (Math.abs(prevRow - row) + Math.abs(prevCol - col) === 1) {
      // 타일 스왑 처리 및 매치 여부 확인 (점수 애니메이션 콜백 전달)
      const isMatched = handleTileSwap(
        prevRow,
        prevCol,
        row,
        col,
        triggerScoreAnimation,
      )

      // 매치 실패시에만 이동 애니메이션 적용
      if (!isMatched) {
        movesAnimation.value = withSpring(1.3, {}, () => {
          movesAnimation.value = withTiming(1)
        })
      }
    }
    setSelectedTile(null)
  }

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreAnimation.value }],
  }))

  const movesAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: movesAnimation.value }],
  }))

  return (
    <GameContainer>
      <BackgroundGradient colors={['#f8f9fa', '#e9ecef']} />

      <InfoPanel>
        <ScoreWrapper>
          <ScoreLabel>점수</ScoreLabel>
          <Animated.View style={scoreAnimStyle}>
            <ScoreText>{score}</ScoreText>
          </Animated.View>
        </ScoreWrapper>

        <MovesWrapper>
          <MovesLabel>이동</MovesLabel>
          <Animated.View style={movesAnimStyle}>
            <MovesText>{moves}</MovesText>
          </Animated.View>
        </MovesWrapper>
      </InfoPanel>

      <BoardContainer boardSize={calculatedBoardSize}>
        {gameState.grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            // 타일의 상태 확인
            const isMatched =
              gameState.matchedTiles?.some(
                (tile) => tile.row === rowIndex && tile.col === colIndex,
              ) || false

            const isNew =
              gameState.newTiles?.some(
                (tile) => tile.row === rowIndex && tile.col === colIndex,
              ) || false

            // 주요 변경: 값이 0이면 타일을 렌더링하지 않음
            if (value === 0) {
              return null // 빈 공간은 렌더링하지 않음
            }

            return (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                value={value}
                onPress={() => handleTilePress(rowIndex, colIndex)}
                x={colIndex * calculatedTileSize}
                y={rowIndex * calculatedTileSize}
                isMatched={isMatched}
                isNew={isNew}
              />
            )
          }),
        )}
      </BoardContainer>
    </GameContainer>
  )
}

const GameContainer = styled(View)`
  align-items: center;
  justify-content: center;
  padding: ${LAYOUT.padding.container}px;
  flex: 1;
  position: relative;
`

const BackgroundGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const InfoPanel = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: ${LAYOUT.padding.panel}px;
  background-color: ${UI_COLORS.board.background};
  border-radius: ${LAYOUT.borderRadius.panel}px;
  margin-bottom: 20px;
  box-shadow: 0px ${LAYOUT.shadow.panel.offset}px
    ${LAYOUT.shadow.panel.radius}px
    rgba(0, 0, 0, ${LAYOUT.shadow.panel.opacity});
  elevation: 5;
`

const ScoreWrapper = styled(View)`
  align-items: center;
`

const ScoreLabel = styled(Text)`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
`

const ScoreText = styled(Text)`
  font-size: 28px;
  font-weight: bold;
  color: ${UI_COLORS.score.text};
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
`

const MovesWrapper = styled(View)`
  align-items: center;
`

const MovesLabel = styled(Text)`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
`

const MovesText = styled(Text)`
  font-size: 28px;
  font-weight: bold;
  color: #4ecdc4;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
`

const BoardContainer = styled(View)<{ boardSize: number }>`
  width: ${(props) => props.boardSize}px;
  height: ${(props) => props.boardSize}px;
  position: relative;
  margin: 10px auto;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  elevation: 8;
`
