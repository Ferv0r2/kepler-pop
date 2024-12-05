import React, { useState, useEffect } from 'react'
import styled from 'styled-components/native'
import Tile from '@/components/Tile'
import { checkMatches, dropTiles, generateNewTiles } from '@/utils/gameLogic'

const BOARD_SIZE = 8
const TILE_SIZE = 50

export type TileType = {
  id: number
  type: number
  x: number
  y: number
}

const BoardContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  elevation: 4; /* Android의 shadow 효과 */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`

const Row = styled.View`
  flex-direction: row;
`

type GameBoardProps = {
  onScoreChange: (score: number) => void
}

export const GameBoard = ({ onScoreChange }: GameBoardProps) => {
  const [board, setBoard] = useState<TileType[][]>([])
  const [selectedTile, setSelectedTile] = useState<{
    x: number
    y: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    initializeBoard()
  }, [])

  const initializeBoard = () => {
    let newBoard: TileType[][]
    let matches: number[][]

    do {
      newBoard = Array.from({ length: BOARD_SIZE }, (_, y) =>
        Array.from({ length: BOARD_SIZE }, (_, x) => ({
          id: y * BOARD_SIZE + x,
          type: Math.floor(Math.random() * 5),
          x,
          y,
        })),
      )
      matches = checkMatches(newBoard)
    } while (matches.length > 0) // 매칭이 없을 때까지 반복

    console.log('Initialized board:', newBoard)
    setBoard(newBoard)
  }

  const handleTilePress = async (x: number, y: number) => {
    if (isProcessing) return

    if (!selectedTile) {
      setSelectedTile({ x, y })
      return
    }

    if (selectedTile.x === x && selectedTile.y === y) {
      setSelectedTile(null)
      return
    }

    if (isAdjacent(selectedTile, { x, y })) {
      setIsProcessing(true)
      const newBoard = [...board]
      swapTiles(newBoard, selectedTile, { x, y })

      const matches = checkMatches(newBoard)
      if (matches.length > 0) {
        await processMatches(newBoard, matches)
      } else {
        swapTiles(newBoard, selectedTile, { x, y }) // 되돌리기
      }

      setSelectedTile(null)
      setIsProcessing(false)
    } else {
      setSelectedTile({ x, y })
    }
  }

  const isAdjacent = (
    tile1: { x: number; y: number },
    tile2: { x: number; y: number },
  ) => {
    const dx = Math.abs(tile1.x - tile2.x)
    const dy = Math.abs(tile1.y - tile2.y)
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
  }

  const swapTiles = (
    boardBase: TileType[][],
    tile1: { x: number; y: number },
    tile2: { x: number; y: number },
  ) => {
    const temp = { ...boardBase[tile1.y][tile1.x] }
    boardBase[tile1.y][tile1.x] = {
      ...boardBase[tile2.y][tile2.x],
      x: tile1.x,
      y: tile1.y,
    }
    boardBase[tile2.y][tile2.x] = { ...temp, x: tile2.x, y: tile2.y }
    setBoard([...boardBase])
  }

  const processMatches = async (
    boardBase: TileType[][],
    matches: number[][],
  ) => {
    const uniqueTiles = new Set<number>()
    matches.flat().forEach((index) => uniqueTiles.add(index))

    const points = uniqueTiles.size * 100
    onScoreChange(points)

    // Remove matched tiles
    uniqueTiles.forEach((index) => {
      const y = Math.floor(index / BOARD_SIZE)
      const x = index % BOARD_SIZE
      boardBase[y][x] = { ...boardBase[y][x], type: -1 }
    })
    setBoard([...boardBase])

    await new Promise((resolve) => setTimeout(resolve, 200))

    // Drop tiles
    dropTiles(boardBase)
    setBoard([...boardBase])

    await new Promise((resolve) => setTimeout(resolve, 200))

    // Generate new tiles
    generateNewTiles(boardBase)
    setBoard([...boardBase])

    // Check for new matches
    const newMatches = checkMatches(boardBase)
    if (newMatches.length > 0) {
      await processMatches(boardBase, newMatches)
    }
  }

  return (
    <BoardContainer>
      {board.map((row, y) => (
        <Row key={y}>
          {row.map((tile, x) => (
            <Tile
              key={tile.id}
              type={tile.type}
              size={TILE_SIZE}
              isSelected={selectedTile?.x === x && selectedTile?.y === y}
              onPress={() => handleTilePress(x, y)}
            />
          ))}
        </Row>
      ))}
    </BoardContainer>
  )
}
