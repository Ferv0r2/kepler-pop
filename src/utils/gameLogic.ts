import { TileType } from '@/components/GameBoard'
import { BOARD_SIZE } from '@/constants/basicConfig'

export const checkMatches = (board: TileType[][]): number[][] => {
  const matchGroups = new Set<string>()
  const matches: number[][] = []

  // 가로 방향 체크
  for (let y = 0; y < BOARD_SIZE; y++) {
    let count = 1
    let currentType = board[y][0].type
    let matchGroup: number[] = [y * BOARD_SIZE + 0]

    for (let x = 1; x < BOARD_SIZE; x++) {
      const tileType = board[y][x].type

      if (tileType === currentType && tileType !== -1) {
        count++
        matchGroup.push(y * BOARD_SIZE + x)
      } else {
        if (count >= 3) {
          matchGroups.add(matchGroup.sort((a, b) => a - b).join(','))
        }
        count = 1
        currentType = tileType
        matchGroup = [y * BOARD_SIZE + x]
      }
    }

    if (count >= 3) {
      matchGroups.add(matchGroup.sort((a, b) => a - b).join(','))
    }
  }

  // 세로 방향 체크
  for (let x = 0; x < BOARD_SIZE; x++) {
    let count = 1
    let currentType = board[0][x].type
    let matchGroup: number[] = [0 * BOARD_SIZE + x]

    for (let y = 1; y < BOARD_SIZE; y++) {
      const tileType = board[y][x].type

      if (tileType === currentType && tileType !== -1) {
        count++
        matchGroup.push(y * BOARD_SIZE + x)
      } else {
        if (count >= 3) {
          matchGroups.add(matchGroup.sort((a, b) => a - b).join(','))
        }
        count = 1
        currentType = tileType
        matchGroup = [y * BOARD_SIZE + x]
      }
    }

    if (count >= 3) {
      matchGroups.add(matchGroup.sort((a, b) => a - b).join(','))
    }
  }

  matches.push(
    ...Array.from(matchGroups).map((group) => group.split(',').map(Number)),
  )

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
