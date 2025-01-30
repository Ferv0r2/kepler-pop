import React, { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import styled from 'styled-components/native'
import { Tile } from '@/components/Tile'
import { checkMatches, processCascade } from '@/utils/matchLogic'
import { BOARD_SIZE, TILE_SIZE } from '@/constants/basicConfig'

export const GameBoard = () => {
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: BOARD_SIZE }, () =>
      Array.from(
        { length: BOARD_SIZE },
        () => Math.floor(Math.random() * 4) + 1,
      ),
    ),
  )

  const [selectedTile, setSelectedTile] = useState<{
    row: number
    col: number
  } | null>(null)
  const [matchedTiles, setMatchedTiles] = useState<boolean[][]>(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false)),
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const [score, setScore] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [moves, setMoves] = useState(10) // ✅ 기본 10회 움직임 제한

  const handleTilePress = (row: number, col: number) => {
    if (isAnimating || moves <= 0) return
    if (!selectedTile) {
      setSelectedTile({ row, col })
    } else {
      setIsAnimating(true)
      const { row: prevRow, col: prevCol } = selectedTile
      if (Math.abs(prevRow - row) + Math.abs(prevCol - col) === 1) {
        let newGrid = [...grid]
        ;[newGrid[prevRow][prevCol], newGrid[row][col]] = [
          newGrid[row][col],
          newGrid[prevRow][prevCol],
        ]
        setGrid(newGrid)

        const matches = checkMatches(newGrid)
        if (matches.some((row) => row.includes(true))) {
          setMatchedTiles(matches)
          setTimeout(() => {
            let updatedGrid = processCascade(newGrid)
            setGrid(updatedGrid)
            setMatchedTiles(
              Array.from({ length: BOARD_SIZE }, () =>
                Array(BOARD_SIZE).fill(false),
              ),
            )

            setScore((prevScore) => prevScore + 10 * comboMultiplier)
            setComboMultiplier((prevCombo) => prevCombo + 1)
            setMoves((prevMoves) => prevMoves + 3)
            setIsAnimating(false)
          }, 500)
        } else {
          setTimeout(() => {
            ;[newGrid[prevRow][prevCol], newGrid[row][col]] = [
              newGrid[row][col],
              newGrid[prevRow][prevCol],
            ]
            setGrid(newGrid)
            setComboMultiplier(1)
            setMoves((prevMoves) => prevMoves - 1)
            setIsAnimating(false)
          }, 300)
        }
      } else {
        setIsAnimating(false)
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
        <ScoreText>점수: {score} </ScoreText>
        {/* ✅ <Text> 내부에서 렌더링 */}
        <MovesText>남은 움직임: {moves} </MovesText>
        {/* ✅ <Text> 내부에서 렌더링 */}
      </InfoPanel>
      <BoardContainer>
        {grid.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              value={tile}
              onPress={() => handleTilePress(rowIndex, colIndex)}
              x={colIndex * TILE_SIZE}
              y={rowIndex * TILE_SIZE}
              isMatched={matchedTiles[rowIndex][colIndex]}
            />
          )),
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
