export interface GameState {
  grid: number[][]
  score: number
  moves: number
  isAnimating: boolean
  matchedTiles: { row: number; col: number }[]
  newTiles: { row: number; col: number; fromRow: number }[]
  droppedTiles: { row: number; col: number; fromRow: number }[]
}
