export type TileType = 1 | 2 | 3 | 4 | 5 | 6
export type TierType = 1 | 2 | 3
export type GameMode = 'casual' | 'challenge'
export type TileSwapMode = 'drag' | 'select'

export interface GridItem {
  id: string
  type: TileType
  isMatched: boolean
  createdIndex: number
  turn: number
  tier: TierType
  isLucky?: boolean
  multiplier?: number
}

export interface Position {
  row: number
  col: number
}

export interface GameState {
  score: number
  moves: number
  isSwapping: boolean
  isChecking: boolean
  isGameOver: boolean
  combo: number
  turn: number
  isProcessingMatches: boolean
  highScore: number
  currentStreak: number
}

export interface GameItem {
  id: string
  count: number
  icon: string
}

export type GameItemType = 'shovel' | 'mole' | 'bomb'

export interface ItemAnimation {
  type: GameItemType
  row: number
  col: number
  direction?: 'row' | 'col'
  x?: number
  y?: number
}

// Lucky match types
export interface LuckyMatch {
  type: 'critical' | 'bonus' | 'mega'
  multiplier: number
  effect: string
  color: string
  sound: string
}

// Near miss types
export interface NearMiss {
  positions: Position[]
  potentialScore: number
  message: string
}

// Flow state types
export interface FlowState {
  difficulty: 'easy' | 'normal' | 'hard'
  playerSkill: number
  sessionTime: number
  avgMoveTime: number
  successRate: number
}

// Session bonus types
export interface SessionBonus {
  playStreak: number
  bonusMultiplier: number
  hotHand: boolean
  rushMode: boolean
  lastPlayTime: number
}