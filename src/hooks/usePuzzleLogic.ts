// useGameLogic.ts
import { useState, useCallback } from 'react'
import { generateBoard, checkMatches, cascadeOnce } from '@/utils/matchLogic'
import { ANIMATION_DURATION } from '@/constants/basicConfig'

export interface GameState {
  grid: number[][]
  score: number
  moves: number
  isAnimating: boolean
}

export const useGameLogic = () => {
  const [grid, setGrid] = useState<number[][]>(generateBoard())
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(10)
  const [isAnimating, setIsAnimating] = useState(false)

  // 매칭 및 캐스케이드 로직을 비동기로 처리하는 함수
  // - 첫 매칭은 기본 점수만 적용 (예: 10점)
  // - 추가 매칭부터는 chain 번호에 따라 추가 보너스가 붙음 (예: chain 배)
  const handleCascade = useCallback(async (startingGrid: number[][]) => {
    let currentGrid = startingGrid
    let chain = 0 // 연쇄 단계 카운터
    setIsAnimating(true)

    while (true) {
      const {
        grid: newGrid,
        newCells,
        hasMatch,
      } = await cascadeOnce(currentGrid)
      console.log(newCells)
      if (!hasMatch) break

      chain++ // 연쇄 카운터 증가

      // 첫 매칭은 기본 점수, 이후부터는 연쇄 보너스 점수 적용
      if (chain === 1) {
        setScore((prev) => prev + 10)
      } else {
        setScore((prev) => prev + 10 * chain)
      }

      setGrid(newGrid)
      currentGrid = newGrid

      // 각 캐스케이드 단계 사이에 딜레이 적용
      await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION))
    }

    setIsAnimating(false)
    return currentGrid
  }, [])

  //   const hasPossibleMoves = useCallback((board: number[][]) => {
  //     for (let r = 0; r < BOARD_SIZE; r++) {
  //       for (let c = 0; c < BOARD_SIZE; c++) {
  //         // 오른쪽 스왑 검사
  //         if (c < BOARD_SIZE - 1) {
  //           const newBoard = board.map((row) => [...row])
  //           ;[newBoard[r][c], newBoard[r][c + 1]] = [
  //             newBoard[r][c + 1],
  //             newBoard[r][c],
  //           ]
  //           if (checkMatches(newBoard).some((row) => row.includes(true)))
  //             return true
  //         }
  //         // 위쪽 스왑 검사
  //         if (r < BOARD_SIZE - 1) {
  //           const newBoard = board.map((row) => [...row])
  //           ;[newBoard[r][c], newBoard[r + 1][c]] = [
  //             newBoard[r + 1][c],
  //             newBoard[r][c],
  //           ]
  //           if (checkMatches(newBoard).some((row) => row.includes(true)))
  //             return true
  //         }
  //       }
  //     }
  //     return false
  //   }, [])

  const handleTileSwap = useCallback(
    async (prevRow: number, prevCol: number, row: number, col: number) => {
      if (isAnimating || moves <= 0) return

      // 그리드 깊은 복사 후 스왑
      const newGrid = grid.map((r) => [...r])
      ;[newGrid[prevRow][prevCol], newGrid[row][col]] = [
        newGrid[row][col],
        newGrid[prevRow][prevCol],
      ]
      setGrid(newGrid)

      const matches = checkMatches(newGrid)
      if (matches.some((r) => r.includes(true))) {
        // 스왑 성공 시
        await handleCascade(newGrid)
      } else {
        // 매칭이 없으면 스왑 원복 후 움직임 차감
        setTimeout(() => {
          ;[newGrid[prevRow][prevCol], newGrid[row][col]] = [
            newGrid[row][col],
            newGrid[prevRow][prevCol],
          ]
          setGrid(newGrid)
          setMoves((prev) => prev - 1)
        }, ANIMATION_DURATION)
      }
    },
    [grid, isAnimating, moves, handleCascade],
  )

  return {
    gameState: { grid, score, moves, isAnimating },
    handleTileSwap,
  }
}
