import { TileType } from '@/components/GameBoard'

const BOARD_SIZE = 8
const MIN_MATCH = 3

export const checkMatches = (board: TileType[][]): number[][] => {
  const visited = new Set<number>()
  const matches: number[][] = []

  const directions = [
    { dx: 0, dy: 1 }, // 아래
    { dx: 1, dy: 0 }, // 오른쪽
    { dx: 0, dy: -1 }, // 위
    { dx: -1, dy: 0 }, // 왼쪽
  ]

  const isValidPosition = (x: number, y: number) =>
    x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE

  const dfs = (x: number, y: number, type: number, group: Set<number>) => {
    const index = y * BOARD_SIZE + x
    if (
      !isValidPosition(x, y) ||
      visited.has(index) ||
      board[y][x].type !== type ||
      type === -1
    ) {
      return
    }

    visited.add(index)
    group.add(index)

    directions.forEach(({ dx, dy }) => {
      dfs(x + dx, y + dy, type, group)
    })
  }

  const findContinuousMatches = (
    x: number,
    y: number,
    dx: number,
    dy: number,
  ) => {
    const type = board[y][x].type
    const group = new Set<number>()
    let nx = x,
      ny = y

    while (isValidPosition(nx, ny) && board[ny][nx].type === type) {
      group.add(ny * BOARD_SIZE + nx)
      nx += dx
      ny += dy
    }

    return group
  }

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (visited.has(y * BOARD_SIZE + x) || board[y][x].type === -1) {
        continue
      }

      // Check horizontal match
      const horizontalGroup = findContinuousMatches(x, y, 1, 0)
      if (horizontalGroup.size >= MIN_MATCH) {
        const expandedGroup = new Set<number>()
        horizontalGroup.forEach((index) => {
          const hx = index % BOARD_SIZE
          const hy = Math.floor(index / BOARD_SIZE)
          dfs(hx, hy, board[hy][hx].type, expandedGroup)
        })
        matches.push(Array.from(expandedGroup))
        expandedGroup.forEach((index) => visited.add(index))
      }

      // Check vertical match
      const verticalGroup = findContinuousMatches(x, y, 0, 1)
      if (verticalGroup.size >= MIN_MATCH) {
        const expandedGroup = new Set<number>()
        verticalGroup.forEach((index) => {
          const vx = index % BOARD_SIZE
          const vy = Math.floor(index / BOARD_SIZE)
          dfs(vx, vy, board[vy][vx].type, expandedGroup)
        })
        matches.push(Array.from(expandedGroup))
        expandedGroup.forEach((index) => visited.add(index))
      }
    }
  }

  return matches
}

export const dropTiles = (board: any[][]) => {
  for (let x = 0; x < BOARD_SIZE; x++) {
    let bottomY = BOARD_SIZE - 1
    for (let y = BOARD_SIZE - 1; y >= 0; y--) {
      if (board[y][x].type !== -1) {
        if (bottomY !== y) {
          board[bottomY][x] = { ...board[y][x], y: bottomY }
          board[y][x] = { ...board[y][x], type: -1 }
        }
        bottomY--
      }
    }
  }
}

export const generateNewTiles = (board: any[][]) => {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x].type === -1) {
        board[y][x] = {
          ...board[y][x],
          type: Math.floor(Math.random() * 5),
        }
      }
    }
  }
}
