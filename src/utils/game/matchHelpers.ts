import type { GridItem, Position, TileType, TierType } from '@/types/game.types'
import { GRID_SIZE, MIN_MATCH_COUNT, LUCKY_CONFIG } from '@/constants/gameConfig'

// Get random tile type (1-6)
export const getRandomTileType = (): TileType => {
  return (Math.floor(Math.random() * 6) + 1) as TileType
}

// Check if position is valid
export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE
}

// Create initial grid without any matches
export const createInitialGrid = (): GridItem[][] => {
  const grid: GridItem[][] = []

  for (let row = 0; row < GRID_SIZE; row++) {
    const newRow: GridItem[] = []
    for (let col = 0; col < GRID_SIZE; col++) {
      let type: TileType

      // Ensure no initial matches
      do {
        type = getRandomTileType()
      } while (
        // Check horizontal match
        (col >= 2 && newRow[col - 1]?.type === type && newRow[col - 2]?.type === type) ||
        // Check vertical match
        (row >= 2 && grid[row - 1]?.[col]?.type === type && grid[row - 2]?.[col]?.type === type)
      )

      // Chance for lucky tile
      const isLucky = Math.random() < LUCKY_CONFIG.LUCKY_TILE_SPAWN_CHANCE

      newRow.push({
        id: `${row}-${col}-${Math.random()}`,
        type,
        isMatched: false,
        createdIndex: 0,
        turn: 0,
        tier: 1,
        isLucky,
        multiplier: isLucky ? 2 : 1,
      })
    }
    grid.push(newRow)
  }

  return grid
}

// Find all matches in the grid
export const findMatches = (grid: GridItem[][]): Position[] => {
  const matches = new Set<string>()

  // Check horizontal matches
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col <= GRID_SIZE - MIN_MATCH_COUNT; col++) {
      const type = grid[row][col].type
      const tier = grid[row][col].tier
      let matchLength = 1

      // Count consecutive tiles of same type and tier
      for (let i = col + 1; i < GRID_SIZE; i++) {
        if (grid[row][i].type === type && grid[row][i].tier === tier) {
          matchLength++
        } else {
          break
        }
      }

      // If we have a match, add all positions
      if (matchLength >= MIN_MATCH_COUNT) {
        for (let i = col; i < col + matchLength; i++) {
          matches.add(`${row},${i}`)
        }
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row <= GRID_SIZE - MIN_MATCH_COUNT; row++) {
      const type = grid[row][col].type
      const tier = grid[row][col].tier
      let matchLength = 1

      // Count consecutive tiles of same type and tier
      for (let i = row + 1; i < GRID_SIZE; i++) {
        if (grid[i][col].type === type && grid[i][col].tier === tier) {
          matchLength++
        } else {
          break
        }
      }

      // If we have a match, add all positions
      if (matchLength >= MIN_MATCH_COUNT) {
        for (let i = row; i < row + matchLength; i++) {
          matches.add(`${i},${col}`)
        }
      }
    }
  }

  // Convert set to array of positions
  return Array.from(matches).map((key) => {
    const [row, col] = key.split(',').map(Number)
    return { row, col }
  })
}

// Check if swapping two tiles would create a match
export const wouldCreateMatch = (
  grid: GridItem[][],
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean => {
  // Create a copy and swap
  const testGrid = grid.map((row) => [...row])
  const temp = testGrid[row1][col1]
  testGrid[row1][col1] = testGrid[row2][col2]
  testGrid[row2][col2] = temp

  // Check if either position creates a match
  return checkMatchAt(testGrid, row1, col1) || checkMatchAt(testGrid, row2, col2)
}

// Check if a specific position is part of a match
const checkMatchAt = (grid: GridItem[][], row: number, col: number): boolean => {
  const type = grid[row][col].type
  const tier = grid[row][col].tier

  // Check horizontal
  let horizontalCount = 1
  // Check left
  for (let c = col - 1; c >= 0; c--) {
    if (grid[row][c].type === type && grid[row][c].tier === tier) {
      horizontalCount++
    } else {
      break
    }
  }
  // Check right
  for (let c = col + 1; c < GRID_SIZE; c++) {
    if (grid[row][c].type === type && grid[row][c].tier === tier) {
      horizontalCount++
    } else {
      break
    }
  }

  if (horizontalCount >= MIN_MATCH_COUNT) return true

  // Check vertical
  let verticalCount = 1
  // Check up
  for (let r = row - 1; r >= 0; r--) {
    if (grid[r][col].type === type && grid[r][col].tier === tier) {
      verticalCount++
    } else {
      break
    }
  }
  // Check down
  for (let r = row + 1; r < GRID_SIZE; r++) {
    if (grid[r][col].type === type && grid[r][col].tier === tier) {
      verticalCount++
    } else {
      break
    }
  }

  return verticalCount >= MIN_MATCH_COUNT
}

// Find a possible move (for hints and shuffle detection)
export const findPossibleMove = (grid: GridItem[][]): { from: Position; to: Position } | null => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // Try swapping with right neighbor
      if (col < GRID_SIZE - 1) {
        if (wouldCreateMatch(grid, row, col, row, col + 1)) {
          return {
            from: { row, col },
            to: { row, col: col + 1 },
          }
        }
      }

      // Try swapping with bottom neighbor
      if (row < GRID_SIZE - 1) {
        if (wouldCreateMatch(grid, row, col, row + 1, col)) {
          return {
            from: { row, col },
            to: { row: row + 1, col },
          }
        }
      }
    }
  }

  return null
}

// Remove matched tiles and refill grid
export const removeMatchedTiles = (
  grid: GridItem[][],
  tileChangeIndex: number,
): { newGrid: GridItem[][]; removedCount: number } => {
  const newGrid = grid.map((row) => [...row])
  let removedCount = 0

  // Process each column
  for (let col = 0; col < GRID_SIZE; col++) {
    const columnTiles: GridItem[] = []

    // Collect non-matched tiles
    for (let row = 0; row < GRID_SIZE; row++) {
      if (!newGrid[row][col].isMatched) {
        columnTiles.push(newGrid[row][col])
      } else {
        removedCount++
      }
    }

    // Generate new tiles for empty spaces
    const missingTiles = GRID_SIZE - columnTiles.length
    const newTiles: GridItem[] = []

    for (let i = 0; i < missingTiles; i++) {
      const isLucky = Math.random() < LUCKY_CONFIG.LUCKY_TILE_SPAWN_CHANCE

      newTiles.push({
        id: `${i}-${col}-${Math.random()}`,
        type: getRandomTileType(),
        isMatched: false,
        createdIndex: tileChangeIndex + 1,
        turn: 0,
        tier: 1,
        isLucky,
        multiplier: isLucky ? 2 : 1,
      })
    }

    // Combine new tiles at top with existing tiles below
    const updatedColumn = [...newTiles, ...columnTiles]

    // Update grid column
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row][col] = updatedColumn[row]
    }
  }

  return { newGrid, removedCount }
}

// Shuffle grid when no moves available
export const shuffleGrid = (grid: GridItem[][]): GridItem[][] => {
  const flatGrid = grid.flat()

  // Fisher-Yates shuffle
  for (let i = flatGrid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[flatGrid[i], flatGrid[j]] = [flatGrid[j], flatGrid[i]]
  }

  // Rebuild grid
  const newGrid: GridItem[][] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    newGrid.push(flatGrid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE))
  }

  // Ensure no initial matches and at least one possible move
  const matches = findMatches(newGrid)
  if (matches.length > 0 || !findPossibleMove(newGrid)) {
    return shuffleGrid(grid) // Recursively shuffle until valid
  }

  return newGrid
}

// Calculate combo bonus moves
export const calculateComboBonus = (combo: number): number => {
  if (combo <= 1) return 0
  if (combo <= 3) return 1
  if (combo <= 5) return 2
  if (combo <= 10) return 3
  return 5
}

// Check for near miss
export const checkNearMiss = (
  grid: GridItem[][],
  from: Position,
  to: Position,
): Position[] | null => {
  // Check if we're one tile away from a match
  const testGrid = grid.map((row) => [...row])
  const temp = testGrid[from.row][from.col]
  testGrid[from.row][from.col] = testGrid[to.row][to.col]
  testGrid[to.row][to.col] = temp

  // Check adjacent tiles for potential matches
  const adjacentPositions = [
    { row: from.row - 1, col: from.col },
    { row: from.row + 1, col: from.col },
    { row: from.row, col: from.col - 1 },
    { row: from.row, col: from.col + 1 },
    { row: to.row - 1, col: to.col },
    { row: to.row + 1, col: to.col },
    { row: to.row, col: to.col - 1 },
    { row: to.row, col: to.col + 1 },
  ]

  for (const pos of adjacentPositions) {
    if (isValidPosition(pos.row, pos.col)) {
      // Try one more swap
      for (const adj of adjacentPositions) {
        if (
          isValidPosition(adj.row, adj.col) &&
          Math.abs(pos.row - adj.row) + Math.abs(pos.col - adj.col) === 1
        ) {
          if (wouldCreateMatch(testGrid, pos.row, pos.col, adj.row, adj.col)) {
            return [pos, adj]
          }
        }
      }
    }
  }

  return null
}
