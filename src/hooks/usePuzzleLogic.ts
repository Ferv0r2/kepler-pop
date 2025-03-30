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
  newTiles?: { row: number; col: number; fromRow: number }[]
  droppedTiles: { row: number; col: number; fromRow: number }[]
}

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: initializeGrid(),
    score: 0,
    moves: INITIAL_MOVES,
    isAnimating: false,
    matchedTiles: [],
    newTiles: [],
    droppedTiles: [],
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
    const newTiles: { row: number; col: number; fromRow: number }[] = []
    const droppedTiles: { row: number; col: number; fromRow: number }[] = []

    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyCount = 0
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] === 0) {
          emptyCount++
        } else if (emptyCount > 0) {
          // 타일이 떨어지는 애니메이션을 위해 시작 위치 기록
          droppedTiles.push({
            row: r + emptyCount,
            col: c,
            fromRow: r,
          })
          newGrid[r + emptyCount][c] = newGrid[r][c]
          newGrid[r][c] = 0
        }
      }

      // 새 타일도 보드 위에서 떨어지도록 fromRow를 음수 값으로 설정
      for (let r = 0; r < emptyCount; r++) {
        newGrid[r][c] = Math.floor(Math.random() * 4) + 1
        newTiles.push({
          row: r,
          col: c,
          fromRow: -1 - (emptyCount - r - 1), // 위에서부터 순차적으로 떨어지도록 음수 위치 설정
        })
      }
    }

    return { newGrid, newTiles, droppedTiles }
  }, [])

  const handleCascadeMatches = useCallback(
    (
      grid: Grid,
      matches: { row: number; col: number }[],
      onScoreChange?: () => void,
    ) => {
      // 1. 먼저 매치된 타일 표시 (깜빡임 애니메이션)
      setGameState((prev) => ({
        ...prev,
        isAnimating: true,
        matchedTiles: matches,
        newTiles: [], // 새 타일 초기화
        droppedTiles: [], // 드롭된 타일 초기화
      }))

      // 2. 매치된 타일 표시 후 제거
      setTimeout(() => {
        const { newGrid: gridAfterRemoval, scoreGain } = removeMatches(
          grid,
          matches,
        )

        // 점수 변경 시 콜백 실행 (애니메이션 트리거)
        if (onScoreChange) {
          onScoreChange()
        }

        // 매치된 타일을 완전히 제거하고 그리드 업데이트
        setGameState((prev) => ({
          ...prev,
          grid: gridAfterRemoval,
          score: prev.score + scoreGain * 2,
          matchedTiles: [], // 매치된 타일 표시 완전히 초기화
        }))

        // 잠시 지연 후 타일 드롭 처리 시작 (매치된 타일이 완전히 사라지도록)
        setTimeout(() => {
          const {
            newGrid: gridAfterDrop,
            newTiles,
            droppedTiles,
          } = dropTiles(gridAfterRemoval)

          // 그리드 업데이트하고 드롭된 타일만 설정
          setGameState((prev) => ({
            ...prev,
            grid: gridAfterDrop,
            droppedTiles, // 드롭 타일 설정
            newTiles: [], // 새 타일은 아직 설정하지 않음
          }))

          // 드롭 애니메이션 후 새 타일 생성
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              newTiles, // 새 타일 설정
            }))

            // 새로운 매치 확인
            setTimeout(() => {
              const newMatches = checkMatches(gridAfterDrop)

              if (newMatches.length > 0) {
                // 연쇄 매칭 발생
                handleCascadeMatches(gridAfterDrop, newMatches, onScoreChange)
              } else {
                // 더 이상 매치가 없으면 애니메이션 종료
                setTimeout(() => {
                  setGameState((prev) => ({
                    ...prev,
                    isAnimating: false,
                    matchedTiles: [],
                    newTiles: [],
                    droppedTiles: [],
                  }))
                }, ANIMATION_TIMING.cascade.animationComplete)
              }
            }, ANIMATION_TIMING.cascade.newMatchCheck)
          }, ANIMATION_TIMING.cascade.newTileDelay + 50) // 약간 더 지연
        }, ANIMATION_TIMING.cascade.dropDelay + 50) // 약간 더 지연
      }, ANIMATION_TIMING.cascade.matchDisplay)
    },
    [checkMatches, removeMatches, dropTiles],
  )

  const handleTileSwap = useCallback(
    (
      row1: number,
      col1: number,
      row2: number,
      col2: number,
      onScoreChange?: () => void,
    ) => {
      // 애니메이션 중이거나 남은 이동이 없으면 무시
      if (gameState.isAnimating || gameState.moves <= 0) return false

      const { grid } = gameState
      const newGrid = [...grid.map((row) => [...row])]

      // 타일 교환
      const temp = newGrid[row1][col1]
      newGrid[row1][col1] = newGrid[row2][col2]
      newGrid[row2][col2] = temp

      // 매치 확인
      const matches = checkMatches(newGrid)

      if (matches.length > 0) {
        // 매치 시 처리 - 동일한 방식으로 처리하도록 수정
        setGameState((prev) => ({
          ...prev,
          grid: newGrid,
          moves: prev.moves - 1,
          isAnimating: true,
          matchedTiles: matches, // 매치된 타일 표시
          newTiles: [], // 초기화
          droppedTiles: [], // 초기화
        }))

        // handleCascadeMatches와 동일한 방식으로 애니메이션 처리
        setTimeout(() => {
          const { newGrid: gridAfterRemoval, scoreGain } = removeMatches(
            newGrid,
            matches,
          )

          if (onScoreChange) {
            onScoreChange()
          }

          // 매치된 타일 제거 및 점수 업데이트
          setGameState((prev) => ({
            ...prev,
            grid: gridAfterRemoval,
            score: prev.score + scoreGain,
            matchedTiles: [], // 매치된 타일 표시 초기화
          }))

          // 3. 타일 드롭 시작
          setTimeout(() => {
            const {
              newGrid: gridAfterDrop,
              newTiles,
              droppedTiles,
            } = dropTiles(gridAfterRemoval)

            // 먼저 그리드를 업데이트하고 드롭 타일 설정
            setGameState((prev) => ({
              ...prev,
              grid: gridAfterDrop,
              droppedTiles,
            }))

            // 4. 새 타일 생성
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                newTiles, // 새 타일 설정
              }))

              // 5. 새로운 매치 확인
              setTimeout(() => {
                const newCascadeMatches = checkMatches(gridAfterDrop)

                if (newCascadeMatches.length > 0) {
                  // 연쇄 매칭 발생 - 기존 함수 호출
                  handleCascadeMatches(
                    gridAfterDrop,
                    newCascadeMatches,
                    onScoreChange,
                  )
                } else {
                  // 더 이상 매치가 없으면 애니메이션 완료
                  setTimeout(() => {
                    setGameState((prev) => ({
                      ...prev,
                      isAnimating: false,
                      matchedTiles: [],
                      newTiles: [],
                      droppedTiles: [],
                    }))
                  }, ANIMATION_TIMING.cascade.animationComplete)
                }
              }, ANIMATION_TIMING.cascade.newMatchCheck)
            }, ANIMATION_TIMING.cascade.newTileDelay)
          }, ANIMATION_TIMING.cascade.dropDelay)
        }, ANIMATION_TIMING.cascade.matchDisplay)

        return true
      } else {
        // 매치가 실패하면 원래 위치로 되돌림
        setGameState((prev) => ({
          ...prev,
          moves: prev.moves - 1,
        }))
        return false
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
          droppedTiles: [],
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
        droppedTiles: [],
      }))
    }
  }, [gameState.isAnimating])

  return {
    gameState,
    handleTileSwap,
  }
}
