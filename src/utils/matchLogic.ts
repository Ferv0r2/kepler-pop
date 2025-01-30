import { BOARD_SIZE, TILE_TYPES } from '@/constants/basicConfig'

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
export const processCascade = (grid: number[][]): number[][] => {
  let newGrid = [...grid]

  while (true) {
    const matches = checkMatches(newGrid)
    if (!matches.some((row) => row.includes(true))) break // 더 이상 매칭이 없으면 중단

    newGrid = removeAndFillTiles(newGrid) // 매칭된 타일 제거 후 새로운 타일 추가
  }

  return newGrid
}
