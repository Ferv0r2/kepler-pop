import { create } from 'zustand'
import type { GridItem, GameState, GameMode, TileSwapMode, Position, SessionBonus } from '@/types/game.types'
import { CASUAL_MODE_MOVE_COUNT, CHALLENGE_MODE_MOVE_COUNT, SESSION_CONFIG } from '@/constants/gameConfig'

interface GameStore extends GameState {
  // Grid
  grid: GridItem[][]
  setGrid: (grid: GridItem[][]) => void
  
  // Game mode
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  
  // Tile swap mode
  tileSwapMode: TileSwapMode
  setTileSwapMode: (mode: TileSwapMode) => void
  
  // Selected tile for select mode
  selectedTile: Position | null
  setSelectedTile: (position: Position | null) => void
  
  // Dragged tile for drag mode
  draggedTile: Position | null
  setDraggedTile: (position: Position | null) => void
  
  // Session bonus
  sessionBonus: SessionBonus
  updateSessionBonus: (updates: Partial<SessionBonus>) => void
  
  // Game actions
  updateGameState: (updates: Partial<GameState>) => void
  startNewGame: (mode: GameMode) => void
  incrementScore: (points: number) => void
  decrementMoves: () => void
  incrementCombo: () => void
  resetCombo: () => void
  setGameOver: () => void
  
  // Animations
  animatingTiles: Set<string>
  addAnimatingTile: (tileId: string) => void
  removeAnimatingTile: (tileId: string) => void
  clearAnimatingTiles: () => void
  
  // Effects
  showScorePopup: { score: number; x: number; y: number } | null
  setShowScorePopup: (popup: { score: number; x: number; y: number } | null) => void
  
  // Lucky match
  lastLuckyMatch: { type: string; timestamp: number } | null
  setLastLuckyMatch: (match: { type: string; timestamp: number } | null) => void
}

const initialGameState: GameState = {
  score: 0,
  moves: 30,
  isSwapping: false,
  isChecking: false,
  isGameOver: false,
  combo: 1,
  turn: 1,
  isProcessingMatches: false,
  highScore: 0,
  currentStreak: 0,
}

const initialSessionBonus: SessionBonus = {
  playStreak: 0,
  bonusMultiplier: 1,
  hotHand: false,
  rushMode: false,
  lastPlayTime: 0,
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial states
  ...initialGameState,
  grid: [],
  gameMode: 'casual',
  tileSwapMode: 'drag',
  selectedTile: null,
  draggedTile: null,
  sessionBonus: initialSessionBonus,
  animatingTiles: new Set(),
  showScorePopup: null,
  lastLuckyMatch: null,
  
  // Grid actions
  setGrid: (grid) => set({ grid }),
  
  // Mode setters
  setGameMode: (gameMode) => set({ gameMode }),
  setTileSwapMode: (tileSwapMode) => set({ tileSwapMode }),
  
  // Tile selection
  setSelectedTile: (selectedTile) => set({ selectedTile }),
  setDraggedTile: (draggedTile) => set({ draggedTile }),
  
  // Session bonus
  updateSessionBonus: (updates) => set((state) => ({
    sessionBonus: { ...state.sessionBonus, ...updates }
  })),
  
  // Game state updates
  updateGameState: (updates) => set((state) => ({
    ...state,
    ...updates,
    highScore: updates.score && updates.score > state.highScore 
      ? updates.score 
      : state.highScore
  })),
  
  startNewGame: (mode) => {
    const moves = mode === 'casual' ? CASUAL_MODE_MOVE_COUNT : CHALLENGE_MODE_MOVE_COUNT
    const now = Date.now()
    const { sessionBonus, highScore } = get()
    
    // Check session streak
    const timeSinceLastPlay = now - sessionBonus.lastPlayTime
    const keepStreak = timeSinceLastPlay < SESSION_CONFIG.STREAK_TIMEOUT_MS
    
    set({
      ...initialGameState,
      gameMode: mode,
      moves,
      highScore, // Keep high score
      // Don't reset grid here - let initializeGame handle it
      selectedTile: null,
      draggedTile: null,
      sessionBonus: {
        ...sessionBonus,
        playStreak: keepStreak ? sessionBonus.playStreak + 1 : 1,
        bonusMultiplier: keepStreak 
          ? Math.min(sessionBonus.bonusMultiplier + SESSION_CONFIG.BONUS_INCREMENT, SESSION_CONFIG.MAX_BONUS_MULTIPLIER)
          : 1,
        lastPlayTime: now,
      },
      animatingTiles: new Set(),
      showScorePopup: null,
    })
  },
  
  incrementScore: (points) => set((state) => {
    const bonusPoints = Math.floor(points * state.sessionBonus.bonusMultiplier)
    const newScore = state.score + bonusPoints
    return {
      score: newScore,
      highScore: newScore > state.highScore ? newScore : state.highScore
    }
  }),
  
  decrementMoves: () => set((state) => ({
    moves: Math.max(0, state.moves - 1),
    isGameOver: state.moves - 1 <= 0
  })),
  
  incrementCombo: () => set((state) => ({
    combo: state.combo + 1
  })),
  
  resetCombo: () => set({ combo: 1 }),
  
  setGameOver: () => set({ isGameOver: true }),
  
  // Animation management
  addAnimatingTile: (tileId) => set((state) => {
    const newSet = new Set(state.animatingTiles)
    newSet.add(tileId)
    return { animatingTiles: newSet }
  }),
  
  removeAnimatingTile: (tileId) => set((state) => {
    const newSet = new Set(state.animatingTiles)
    newSet.delete(tileId)
    return { animatingTiles: newSet }
  }),
  
  clearAnimatingTiles: () => set({ animatingTiles: new Set() }),
  
  // Effects
  setShowScorePopup: (showScorePopup) => set({ showScorePopup }),
  setLastLuckyMatch: (lastLuckyMatch) => set({ lastLuckyMatch }),
}))