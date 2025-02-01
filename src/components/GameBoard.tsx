// GameBoard.tsx
import React, { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import styled from 'styled-components/native'
import { Tile } from '@/components/Tile'
import { BOARD_SIZE, TILE_SIZE } from '@/constants/basicConfig'
import { useGameLogic } from '@/hooks/usePuzzleLogic'

export const GameBoard = () => {
  const { gameState, handleTileSwap } = useGameLogic()
  const { grid, score, moves, isAnimating } = gameState

  const [selectedTile, setSelectedTile] = useState<{
    row: number
    col: number
  } | null>(null)

  const handleTilePress = (row: number, col: number) => {
    if (isAnimating || moves <= 0) return
    if (!selectedTile) {
      setSelectedTile({ row, col })
    } else {
      const { row: prevRow, col: prevCol } = selectedTile
      // 인접한 타일만 허용
      if (Math.abs(prevRow - row) + Math.abs(prevCol - col) === 1) {
        handleTileSwap(prevRow, prevCol, row, col)
      }
      setSelectedTile(null)
    }
    if (moves - 1 <= 0) {
      setTimeout(() => {
        Alert.alert('게임 종료', '움직임 횟수가 모두 소진되었습니다.')
      }, 500)
    }
  }

  return (
    <GameContainer>
      <InfoPanel>
        <ScoreText>점수: {score}</ScoreText>
        <MovesText>남은 움직임: {moves}</MovesText>
      </InfoPanel>
      <BoardContainer>
        {grid.map((row, r) =>
          row.map((tile, c) => {
            // 논리 좌표 (r, c)를 화면 좌표로 변환
            const screenX = c * TILE_SIZE
            const screenY = (BOARD_SIZE - 1 - r) * TILE_SIZE
            return (
              <Tile
                key={`${r}-${c}`}
                value={tile}
                onPress={() => handleTilePress(r, c)}
                x={screenX}
                y={screenY}
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
`

const InfoPanel = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
`

const ScoreText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`

const MovesText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #ff5733;
`

const BoardContainer = styled(View)`
  width: ${BOARD_SIZE * TILE_SIZE}px;
  height: ${BOARD_SIZE * TILE_SIZE}px;
  position: relative;
  margin: 20px auto;
  background-color: #eee;
  border-radius: 10px;
  padding: 5px;
`
