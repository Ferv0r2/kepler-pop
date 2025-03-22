import { useState, useCallback, useEffect } from 'react'
import {
  BOARD_SIZE,
  INITIAL_MOVES,
  ANIMATION_TIMING,
} from '@/constants/basicConfig'

type Grid = number[][]

interface GameState {
  grid: Grid
  score: number
  moves: number
  isAnimating: boolean
  matchedTiles?: { row: number; col: number }[]
  newTiles?: { row: number; col: number }[]
}

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: initializeGrid(),
    score: 0,
    moves: INITIAL_MOVES,
    isAnimating: false,
    matchedTiles: [],
    newTiles: [],
  })

  function initializeGrid(): Grid {
    const grid: Grid = []
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row: number[] = []
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push(Math.floor(Math.random() * 4) + 1)
      }
      grid.push(row)
    }

    // 매칭된 상태 확인하고 수정
    return preventInitialMatches(grid)
  }

  function preventInitialMatches(grid: Grid): Grid {
    const result = [...grid.map((row) => [...row])]

    // 가로 방향 매칭 검사 및 수정
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        if (
          result[i][j] === result[i][j + 1] &&
          result[i][j] === result[i][j + 2]
        ) {
          let newValue
          do {
            newValue = Math.floor(Math.random() * 4) + 1
          } while (newValue === result[i][j])
          result[i][j + 2] = newValue
        }
      }
    }

    // 세로 방향 매칭 검사 및 수정
    for (let i = 0; i < BOARD_SIZE - 2; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (
          result[i][j] === result[i + 1][j] &&
          result[i][j] === result[i + 2][j]
        ) {
          let newValue
          do {
            newValue = Math.floor(Math.random() * 4) + 1
          } while (newValue === result[i][j])
          result[i + 2][j] = newValue
        }
      }
    }

    return result
  }

  const checkMatches = useCallback((grid: Grid) => {
    const matches: { row: number; col: number }[] = []

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        if (
          grid[r][c] !== 0 &&
          grid[r][c] === grid[r][c + 1] &&
          grid[r][c] === grid[r][c + 2]
        ) {
          matches.push({ row: r, col: c })
          matches.push({ row: r, col: c + 1 })
          matches.push({ row: r, col: c + 2 })
        }
      }
    }

    for (let r = 0; r < BOARD_SIZE - 2; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (
          grid[r][c] !== 0 &&
          grid[r][c] === grid[r + 1][c] &&
          grid[r][c] === grid[r + 2][c]
        ) {
          matches.push({ row: r, col: c })
          matches.push({ row: r + 1, col: c })
          matches.push({ row: r + 2, col: c })
        }
      }
    }

    const uniqueMatches = matches.filter(
      (match, index, self) =>
        index ===
        self.findIndex((m) => m.row === match.row && m.col === match.col),
    )

    return uniqueMatches
  }, [])

  const removeMatches = useCallback(
    (grid: Grid, matches: { row: number; col: number }[]) => {
      const newGrid = [...grid.map((row) => [...row])]
      let scoreGain = 0

      matches.forEach(({ row, col }) => {
        scoreGain += newGrid[row][col] * 10
        newGrid[row][col] = 0
      })

      return { newGrid, scoreGain }
    },
    [],
  )

  const dropTiles = useCallback((grid: Grid) => {
    const newGrid = [...grid.map((row) => [...row])]
    const newTiles: { row: number; col: number }[] = []

    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyCount = 0
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] === 0) {
          emptyCount++
        } else if (emptyCount > 0) {
          newGrid[r + emptyCount][c] = newGrid[r][c]
          newGrid[r][c] = 0
        }
      }

      for (let r = 0; r < emptyCount; r++) {
        newGrid[r][c] = Math.floor(Math.random() * 4) + 1
        newTiles.push({ row: r, col: c })
      }
    }

    return { newGrid, newTiles }
  }, [])

  const handleCascadeMatches = useCallback(
    (grid: Grid, matches: { row: number; col: number }[]) => {
      setGameState((prev) => ({
        ...prev,
        isAnimating: true,
        matchedTiles: matches,
      }))

      // 매칭된 타일 표시 후 충분한 시간 대기
      setTimeout(() => {
        const { newGrid: gridAfterRemoval, scoreGain } = removeMatches(
          grid,
          matches,
        )

        setGameState((prev) => ({
          ...prev,
          grid: gridAfterRemoval,
          score: prev.score + scoreGain * 2,
          matchedTiles: [], // 매치된 타일 표시 초기화
        }))

        // 타일 드롭 애니메이션을 위한 충분한 시간 대기
        setTimeout(() => {
          const { newGrid: gridAfterDrop, newTiles } =
            dropTiles(gridAfterRemoval)

          setGameState((prev) => ({
            ...prev,
            grid: gridAfterDrop,
            newTiles,
          }))

          const newCascadeMatches = checkMatches(gridAfterDrop)

          // 매치 확인 전에 애니메이션 완료를 위한 시간 확보
          setTimeout(() => {
            if (newCascadeMatches.length > 0) {
              handleCascadeMatches(gridAfterDrop, newCascadeMatches)
            } else {
              setGameState((prev) => ({
                ...prev,
                isAnimating: false,
                matchedTiles: [], // 최종적으로 모든 매치 표시 초기화
                newTiles: [],
              }))
            }
          }, ANIMATION_TIMING.cascade.newMatchCheck)
        }, ANIMATION_TIMING.cascade.dropDelay) // 드롭 애니메이션을 위한 시간 증가
      }, ANIMATION_TIMING.cascade.matchDisplay) // 매칭 애니메이션을 위한 시간 증가
    },
    [checkMatches, removeMatches, dropTiles],
  )

  const handleTileSwap = useCallback(
    (row1: number, col1: number, row2: number, col2: number) => {
      if (gameState.isAnimating) return

      setGameState((prev) => ({ ...prev, isAnimating: true }))

      const newGrid = [...gameState.grid.map((row) => [...row])]
      const temp = newGrid[row1][col1]
      newGrid[row1][col1] = newGrid[row2][col2]
      newGrid[row2][col2] = temp

      const matches = checkMatches(newGrid)

      if (matches.length > 0) {
        setGameState((prev) => ({
          ...prev,
          grid: newGrid,
          matchedTiles: matches,
        }))

        setTimeout(() => {
          const { newGrid: gridAfterRemoval, scoreGain } = removeMatches(
            newGrid,
            matches,
          )

          setGameState((prev) => ({
            ...prev,
            grid: gridAfterRemoval,
            score: prev.score + scoreGain,
          }))

          setTimeout(() => {
            const { newGrid: gridAfterDrop, newTiles } =
              dropTiles(gridAfterRemoval)

            setGameState((prev) => ({
              ...prev,
              grid: gridAfterDrop,
              matchedTiles: [],
              newTiles,
            }))

            const cascadeMatches = checkMatches(gridAfterDrop)
            if (cascadeMatches.length > 0) {
              setTimeout(() => {
                handleCascadeMatches(gridAfterDrop, cascadeMatches)
              }, ANIMATION_TIMING.cascade.newMatchCheck)
            } else {
              setGameState((prev) => ({ ...prev, isAnimating: false }))
            }
          }, ANIMATION_TIMING.swap.duration)
        }, ANIMATION_TIMING.match.duration)
      } else {
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            grid: gameState.grid,
            moves: prev.moves - 1,
            isAnimating: false,
          }))
        }, ANIMATION_TIMING.swap.duration)
      }
    },
    [gameState, checkMatches, removeMatches, dropTiles, handleCascadeMatches],
  )

  const processChain = useCallback(
    (grid: Grid, matches: { row: number; col: number }[]) => {
      setGameState((prev) => ({
        ...prev,
        matchedTiles: matches,
      }))

      setTimeout(() => {
        const { newGrid: gridAfterRemoval, scoreGain } = removeMatches(
          grid,
          matches,
        )

        setGameState((prev) => ({
          ...prev,
          grid: gridAfterRemoval,
          score: prev.score + scoreGain * 2,
        }))

        setTimeout(() => {
          const { newGrid: gridAfterDrop, newTiles } =
            dropTiles(gridAfterRemoval)

          setGameState((prev) => ({
            ...prev,
            grid: gridAfterDrop,
            matchedTiles: [],
            newTiles,
          }))

          const newCascadeMatches = checkMatches(gridAfterDrop)
          if (newCascadeMatches.length > 0) {
            setTimeout(() => {
              processChain(gridAfterDrop, newCascadeMatches)
            }, ANIMATION_TIMING.cascade.newMatchCheck)
          } else {
            setGameState((prev) => ({
              ...prev,
              isAnimating: false,
            }))
          }
        }, ANIMATION_TIMING.swap.duration)
      }, ANIMATION_TIMING.match.duration)
    },
    [checkMatches, removeMatches, dropTiles],
  )

  useEffect(() => {
    if (gameState.isAnimating) {
      const timer = setTimeout(() => {
        setGameState((prevState) => ({
          ...prevState,
          isAnimating: false,
          matchedTiles: [],
          newTiles: [],
        }))
      }, ANIMATION_TIMING.safetyTimeout)

      return () => {
        clearTimeout(timer)
        setGameState((prevState) => ({
          ...prevState,
          isAnimating: false,
        }))
      }
    } else {
      setGameState((prevState) => ({
        ...prevState,
        matchedTiles: [],
        newTiles: [],
      }))
    }
  }, [gameState.isAnimating])

  return {
    gameState,
    handleTileSwap,
  }
}
