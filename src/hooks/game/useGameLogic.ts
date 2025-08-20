import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/state/gameStore'
import {
  createInitialGrid,
  findMatches,
  findPossibleMove,
  removeMatchedTiles,
  shuffleGrid,
  wouldCreateMatch,
  calculateComboBonus,
  checkNearMiss,
} from '@/utils/game/matchHelpers'
import { SCORE, LUCKY_CONFIG, NEAR_MISS_CONFIG } from '@/constants/gameConfig'
import type { Position, GridItem, LuckyMatch } from '@/types/game.types'

export const useGameLogic = () => {
  const {
    grid,
    setGrid,
    gameMode,
    score,
    moves,
    combo,
    isGameOver,
    isSwapping,
    isChecking,
    isProcessingMatches,
    sessionBonus,
    updateGameState,
    incrementScore,
    decrementMoves,
    incrementCombo,
    resetCombo,
    setGameOver,
    setShowScorePopup,
    setLastLuckyMatch,
    startNewGame,
  } = useGameStore()

  const [tileChangeIndex, setTileChangeIndex] = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [lastMatchTime, setLastMatchTime] = useState(Date.now())
  const processingRef = useRef(false)

  // Initialize grid when game starts
  const initializeGame = useCallback(() => {
    startNewGame(gameMode)  // First reset game state
    const newGrid = createInitialGrid()
    setGrid(newGrid)  // Then set the grid
    console.log('Game initialized with grid:', newGrid.length, 'x', newGrid[0]?.length)
  }, [gameMode, setGrid, startNewGame])

  // Calculate match score with bonuses
  const calculateMatchScore = useCallback(
    (matchCount: number, isLucky: boolean = false): number => {
      let baseScore = matchCount * SCORE.BASE
      
      // Apply combo multiplier
      baseScore *= Math.pow(SCORE.COMBO_MULTIPLIER, combo - 1)
      
      // Apply streak multiplier
      if (streakCount > 1) {
        baseScore *= Math.pow(SCORE.STREAK_MULTIPLIER, streakCount - 1)
      }
      
      // Apply session bonus
      baseScore *= sessionBonus.bonusMultiplier
      
      // Apply lucky multiplier
      if (isLucky) {
        baseScore *= LUCKY_CONFIG.EFFECTS.critical.multiplier
      }
      
      return Math.floor(baseScore)
    },
    [combo, streakCount, sessionBonus.bonusMultiplier]
  )

  // Check for lucky matches
  const checkLuckyMatch = useCallback((matches: Position[]): LuckyMatch | null => {
    const luckyTiles = matches.filter(pos => grid[pos.row][pos.col].isLucky)
    
    if (luckyTiles.length > 0) {
      // Critical hit chance
      if (Math.random() < LUCKY_CONFIG.CRITICAL_HIT_CHANCE) {
        return {
          type: 'critical',
          multiplier: LUCKY_CONFIG.EFFECTS.critical.multiplier,
          effect: LUCKY_CONFIG.EFFECTS.critical.effect,
          color: LUCKY_CONFIG.EFFECTS.critical.color,
          sound: LUCKY_CONFIG.EFFECTS.critical.sound,
        }
      }
      
      // Mega combo
      if (combo >= LUCKY_CONFIG.MEGA_COMBO_THRESHOLD) {
        return {
          type: 'mega',
          multiplier: LUCKY_CONFIG.EFFECTS.mega.multiplier,
          effect: LUCKY_CONFIG.EFFECTS.mega.effect,
          color: LUCKY_CONFIG.EFFECTS.mega.color,
          sound: LUCKY_CONFIG.EFFECTS.mega.sound,
        }
      }
      
      // Regular bonus
      return {
        type: 'bonus',
        multiplier: LUCKY_CONFIG.EFFECTS.bonus.multiplier,
        effect: LUCKY_CONFIG.EFFECTS.bonus.effect,
        color: LUCKY_CONFIG.EFFECTS.bonus.color,
        sound: LUCKY_CONFIG.EFFECTS.bonus.sound,
      }
    }
    
    return null
  }, [grid, combo])

  // Process matches after swap or cascade
  const processMatches = useCallback(
    async (matches: Position[], isRecursive = false) => {
      if (matches.length === 0) return
      
      // Only check processing flag on initial call
      if (!isRecursive) {
        if (processingRef.current) return
        processingRef.current = true
        updateGameState({ isProcessingMatches: true })
      }
      
      // Check for lucky match
      const luckyMatch = checkLuckyMatch(matches)
      const isLucky = luckyMatch !== null
      
      // Calculate score
      const matchScore = calculateMatchScore(matches.length, isLucky)
      const bonusMoves = calculateComboBonus(combo)
      
      // Update state
      incrementScore(matchScore)
      incrementCombo()
      
      if (bonusMoves > 0) {
        updateGameState({ moves: moves + bonusMoves })
      }
      
      // Show score popup
      const centerRow = matches.reduce((sum, m) => sum + m.row, 0) / matches.length
      const centerCol = matches.reduce((sum, m) => sum + m.col, 0) / matches.length
      setShowScorePopup({ score: matchScore, x: centerCol, y: centerRow })
      
      // Store lucky match info
      if (luckyMatch) {
        setLastLuckyMatch({
          type: luckyMatch.type,
          timestamp: Date.now(),
        })
      }
      
      // Mark tiles as matched
      const newGrid = grid.map(row => [...row])
      matches.forEach(({ row, col }) => {
        newGrid[row][col].isMatched = true
      })
      setGrid(newGrid)
      
      // Wait for match animation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Remove matched tiles and refill
      const { newGrid: refilledGrid, removedCount } = removeMatchedTiles(
        newGrid,
        tileChangeIndex
      )
      setGrid(refilledGrid)
      setTileChangeIndex(prev => prev + 1)
      
      // Wait for refill animation
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Check for cascading matches
      const cascadeMatches = findMatches(refilledGrid)
      if (cascadeMatches.length > 0) {
        // Add small delay between cascades for visual clarity
        await new Promise(resolve => setTimeout(resolve, 200))
        await processMatches(cascadeMatches, true)  // Pass recursive flag
      }
      
      // Only reset on non-recursive call
      if (!isRecursive) {
        // No more matches, reset processing state
        resetCombo()
        updateGameState({ isProcessingMatches: false })
        processingRef.current = false
        
        // Hide score popup
        setTimeout(() => setShowScorePopup(null), 1500)
        
        // Check if no moves left
        if (!findPossibleMove(refilledGrid)) {
          // Need to shuffle
          handleShuffle()
        }
      }
    },
    [
      grid,
      setGrid,
      combo,
      moves,
      tileChangeIndex,
      calculateMatchScore,
      checkLuckyMatch,
      incrementScore,
      incrementCombo,
      resetCombo,
      updateGameState,
      setShowScorePopup,
      setLastLuckyMatch,
    ]
  )

  // Swap tiles
  const swapTiles = useCallback(
    async (from: Position, to: Position) => {
      if (isSwapping || isProcessingMatches || isGameOver) return
      
      updateGameState({ isSwapping: true })
      
      // Check if adjacent
      const isAdjacent =
        (Math.abs(from.row - to.row) === 1 && from.col === to.col) ||
        (Math.abs(from.col - to.col) === 1 && from.row === to.row)
      
      if (!isAdjacent) {
        updateGameState({ isSwapping: false })
        return
      }
      
      // Check if swap would create match
      if (!wouldCreateMatch(grid, from.row, from.col, to.row, to.col)) {
        // Check for near miss
        const nearMissPositions = checkNearMiss(grid, from, to)
        if (nearMissPositions) {
          // Show near miss feedback
          console.log('Near miss!', nearMissPositions)
        }
        
        // Invalid swap - consume move anyway
        decrementMoves()
        updateGameState({ isSwapping: false })
        
        if (moves - 1 <= 0) {
          setGameOver()
        }
        return
      }
      
      // Perform swap
      const newGrid = grid.map(row => [...row])
      const temp = newGrid[from.row][from.col]
      newGrid[from.row][from.col] = newGrid[to.row][to.col]
      newGrid[to.row][to.col] = temp
      setGrid(newGrid)
      
      // Decrement moves
      decrementMoves()
      
      // Update streak
      const now = Date.now()
      if (now - lastMatchTime < 3000) {
        setStreakCount(prev => prev + 1)
      } else {
        setStreakCount(1)
      }
      setLastMatchTime(now)
      
      // Wait for swap animation
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Find and process matches
      const matches = findMatches(newGrid)
      updateGameState({ isSwapping: false })
      
      if (matches.length > 0) {
        await processMatches(matches, false)  // Initial call, not recursive
      }
      
      // Check game over
      if (moves - 1 <= 0) {
        setGameOver()
      }
    },
    [
      grid,
      setGrid,
      moves,
      isSwapping,
      isProcessingMatches,
      isGameOver,
      updateGameState,
      decrementMoves,
      setGameOver,
      processMatches,
      lastMatchTime,
    ]
  )

  // Shuffle grid when no moves available
  const handleShuffle = useCallback(() => {
    const shuffled = shuffleGrid(grid)
    setGrid(shuffled)
  }, [grid, setGrid])

  // Check for game over conditions
  useEffect(() => {
    if (moves <= 0 && !isProcessingMatches) {
      setGameOver()
    }
  }, [moves, isProcessingMatches, setGameOver])

  return {
    grid,
    score,
    moves,
    combo,
    isGameOver,
    isSwapping,
    isProcessingMatches,
    streakCount,
    initializeGame,
    swapTiles,
    handleShuffle,
  }
}