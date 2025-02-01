import {
  ANIMATION_DURATION,
  BOARD_SIZE,
  TILE_TYPES,
} from '@/constants/basicConfig'

// 초기 매칭 없이 보드를 생성 (논리 좌표: row 0은 바닥)
export const generateBoard = (): number[][] => {
  let board: number[][] = []
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from(
        { length: BOARD_SIZE },
        () => Math.floor(Math.random() * 4) + 1,
      ),
    )
  } while (checkMatches(board).some((row) => row.includes(true)))
  return board
}

// 매칭 확인 함수
export const checkMatches = (grid: number[][]): boolean[][] => {
  const matches = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false),
  )

  // 가로 방향 매칭 체크
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      if (
        grid[row][col] &&
        grid[row][col] === grid[row][col + 1] &&
        grid[row][col] === grid[row][col + 2]
      ) {
        matches[row][col] = matches[row][col + 1] = matches[row][col + 2] = true
      }
    }
  }

  // 세로 방향 매칭 체크
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      if (
        grid[row][col] &&
        grid[row][col] === grid[row + 1][col] &&
        grid[row][col] === grid[row + 2][col]
      ) {
        matches[row][col] = matches[row + 1][col] = matches[row + 2][col] = true
      }
    }
  }

  return matches
}

// 타일 제거 후 새롭게 채우는 함수
export const removeAndFillTiles = (grid: number[][]): number[][] => {
  let newGrid = [...grid]

  // 매칭된 타일 제거
  const matches = checkMatches(newGrid)
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (matches[row][col]) {
        newGrid[row][col] = 0 // 0으로 설정하여 비워두기
      }
    }
  }

  // 빈 공간 채우기 (위에서 아래로 떨어지도록)
  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptyCells = 0
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newGrid[row][col] === 0) {
        emptyCells++
      } else if (emptyCells > 0) {
        newGrid[row + emptyCells][col] = newGrid[row][col]
        newGrid[row][col] = 0
      }
    }

    // 위에서 새로운 타일 채우기
    for (let row = 0; row < emptyCells; row++) {
      newGrid[row][col] = Math.floor(Math.random() * TILE_TYPES) + 1
    }
  }

  return newGrid
}

// 매칭된 타일을 제거하고 중력 효과 및 새 블럭 생성 처리
export const processCascade = (
  grid: number[][],
): { grid: number[][]; newCells: boolean[][] } => {
  // 논리 좌표: row 0 = 바닥, row BOARD_SIZE-1 = 최상단
  const newGrid = grid.map((row) => [...row])
  const newCells = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false),
  )

  // 1. 매칭된 타일 제거 (0으로 표시)
  const matches = checkMatches(newGrid)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < newGrid[r].length; c++) {
      if (matches[r][c]) {
        newGrid[r][c] = 0
      }
    }
  }

  // 2. 중력 효과 적용: 각 열에서, 바닥(row=0)부터 위로 진행하면서 빈 칸(0)이 있으면 위에 있는 블럭을 내려보내기
  for (let c = 0; c < newGrid[0].length; c++) {
    let emptyCount = 0
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newGrid[r][c] === 0) {
        emptyCount++
      } else if (emptyCount > 0) {
        newGrid[r - emptyCount][c] = newGrid[r][c]
        newGrid[r][c] = 0
      }
    }
    // 3. 최상단의 빈 칸에 새 블럭 생성 (그리고 새 블럭임을 표시)
    for (let r = BOARD_SIZE - emptyCount; r < BOARD_SIZE; r++) {
      newGrid[r][c] = Math.floor(Math.random() * TILE_TYPES) + 1
      newCells[r][c] = true
    }
  }

  return { grid: newGrid, newCells }
}

// 비동기 처리되어 딜레이 후 매칭된 타일을 제거
export const cascadeOnce = async (
  grid: number[][],
): Promise<{
  grid: number[][]
  newCells: boolean[][]
  hasMatch: boolean
}> => {
  const newGrid = grid.map((row) => [...row])
  const newCells = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false),
  )

  const matches = checkMatches(newGrid)
  const hasMatch = matches.some((row) => row.includes(true))
  if (!hasMatch) {
    return { grid: newGrid, newCells, hasMatch: false }
  }

  // 딜레이로 매칭 애니메이션 완료 대기
  await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION))

  // 매칭된 타일 제거 (0으로 처리)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (matches[r][c]) {
        newGrid[r][c] = 0
      }
    }
  }

  // 중력 적용 및 새 블럭 생성 (새 블럭은 newCells로 표시)
  for (let c = 0; c < newGrid[0].length; c++) {
    let emptyCount = 0
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newGrid[r][c] === 0) {
        emptyCount++
      } else if (emptyCount > 0) {
        newGrid[r - emptyCount][c] = newGrid[r][c]
        newGrid[r][c] = 0
      }
    }
    for (let r = BOARD_SIZE - emptyCount; r < BOARD_SIZE; r++) {
      newGrid[r][c] = Math.floor(Math.random() * TILE_TYPES) + 1
      newCells[r][c] = true
    }
  }

  return { grid: newGrid, newCells, hasMatch: true }
}
