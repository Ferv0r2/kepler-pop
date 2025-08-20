import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import {
  Canvas,
  Group,
  RoundedRect,
  LinearGradient,
  vec,
  Shadow,
  BlurMask,
} from '@shopify/react-native-skia'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { GRID_SIZE, TILE_SIZE } from '@/constants/gameConfig'
import { getTileConfig } from '@/constants/tileConfig'
import { useGameStore } from '@/state/gameStore'
import type { GridItem, Position } from '@/types/game.types'
import { AnimatedTile } from './AnimatedTile'

const { width: screenWidth } = Dimensions.get('window')
const BOARD_SIZE = Math.min(screenWidth - 32, 400)
const CELL_SIZE = BOARD_SIZE / GRID_SIZE
const PADDING = 4

interface GameBoardProps {
  onTilePress: (position: Position) => void
  onTileSwap: (from: Position, to: Position) => void
}

export const GameBoard: React.FC<GameBoardProps> = ({ onTilePress, onTileSwap }) => {
  const { grid, tileSwapMode, selectedTile, setSelectedTile, draggedTile, setDraggedTile } =
    useGameStore()
  
  // Track previous grid to detect new tiles
  const prevGridRef = React.useRef<GridItem[][]>([])
  const [newTileIds, setNewTileIds] = React.useState<Set<string>>(new Set())

  // Debug logging and new tile detection
  React.useEffect(() => {
    console.log('GameBoard grid:', grid?.length, 'x', grid[0]?.length)
    
    // Detect new tiles
    if (grid && grid.length > 0) {
      const prevGrid = prevGridRef.current
      const newIds = new Set<string>()
      
      grid.forEach(row => {
        row.forEach(tile => {
          // Check if this tile ID existed in previous grid
          const existedBefore = prevGrid.some(prevRow => 
            prevRow.some(prevTile => prevTile.id === tile.id)
          )
          if (!existedBefore && !tile.isMatched) {
            newIds.add(tile.id)
          }
        })
      })
      
      setNewTileIds(newIds)
      prevGridRef.current = grid.map(row => row.map(tile => ({ ...tile })))
      
      // Clear new tile status after animation
      if (newIds.size > 0) {
        setTimeout(() => {
          setNewTileIds(new Set())
        }, 600)
      }
    }
  }, [grid])

  // Touch tracking
  const touchStart = useSharedValue<Position | null>(null)
  const touchCurrent = useSharedValue<Position | null>(null)
  const dragOffset = useSharedValue({ x: 0, y: 0 })

  // Handle tile selection (select mode) - JS thread function
  const handleTileSelect = useCallback(
    (position: Position) => {
      if (tileSwapMode !== 'select') return

      if (!selectedTile) {
        setSelectedTile(position)
      } else if (
        selectedTile.row === position.row &&
        selectedTile.col === position.col
      ) {
        setSelectedTile(null)
      } else {
        // Check if adjacent
        const isAdjacent =
          (Math.abs(selectedTile.row - position.row) === 1 &&
            selectedTile.col === position.col) ||
          (Math.abs(selectedTile.col - position.col) === 1 &&
            selectedTile.row === position.row)

        if (isAdjacent) {
          onTileSwap(selectedTile, position)
          setSelectedTile(null)
        } else {
          setSelectedTile(position)
        }
      }
    },
    [tileSwapMode, selectedTile, setSelectedTile, onTileSwap]
  )

  // Handle gesture start - JS thread function
  const handleGestureStart = useCallback(
    (position: Position) => {
      if (tileSwapMode === 'select') {
        handleTileSelect(position)
      } else {
        setDraggedTile(position)
      }
    },
    [tileSwapMode, handleTileSelect, setDraggedTile]
  )

  // Handle drag swap - JS thread function
  const handleDragSwap = useCallback(
    (from: Position, to: Position) => {
      if (tileSwapMode === 'drag') {
        onTileSwap(from, to)
        setDraggedTile(null)
      }
    },
    [tileSwapMode, onTileSwap, setDraggedTile]
  )

  // Gesture handler with worklet functions
  const gesture = Gesture.Pan()
    .onStart((e) => {
      'worklet'
      // Convert screen coordinates to grid position in worklet
      const col = Math.floor(e.x / CELL_SIZE)
      const row = Math.floor(e.y / CELL_SIZE)
      
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const position = { row, col }
        touchStart.value = position
        touchCurrent.value = position
        
        // Call JS thread function
        runOnJS(handleGestureStart)(position)
      }
    })
    .onUpdate((e) => {
      'worklet'
      if (touchStart.value) {
        // Convert screen coordinates to grid position in worklet
        const col = Math.floor(e.x / CELL_SIZE)
        const row = Math.floor(e.y / CELL_SIZE)
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          const current = { row, col }
          
          if (touchCurrent.value) {
            // Check if we moved to adjacent tile
            if (
              current.row !== touchCurrent.value.row ||
              current.col !== touchCurrent.value.col
            ) {
              const isAdjacent =
                (Math.abs(touchStart.value.row - current.row) === 1 &&
                  touchStart.value.col === current.col) ||
                (Math.abs(touchStart.value.col - current.col) === 1 &&
                  touchStart.value.row === current.row)

              if (isAdjacent) {
                const startPos = { ...touchStart.value }
                const currentPos = { ...current }
                
                // Call JS thread function for swap
                runOnJS(handleDragSwap)(startPos, currentPos)
                
                touchStart.value = null
                touchCurrent.value = null
              } else {
                touchCurrent.value = current
              }
            }
          }
        }
        
        // Update drag offset
        if (touchStart.value) {
          dragOffset.value = {
            x: e.x - (touchStart.value.col * CELL_SIZE + CELL_SIZE / 2),
            y: e.y - (touchStart.value.row * CELL_SIZE + CELL_SIZE / 2),
          }
        }
      }
    })
    .onEnd(() => {
      'worklet'
      touchStart.value = null
      touchCurrent.value = null
      dragOffset.value = { x: 0, y: 0 }
      runOnJS(setDraggedTile)(null)
    })

  // Render tiles
  const tiles = useMemo(() => {
    if (!grid || grid.length === 0) return null

    return grid.map((row, rowIndex) =>
      row.map((tile, colIndex) => {
        const config = getTileConfig(tile.type)
        const x = colIndex * CELL_SIZE + PADDING
        const y = rowIndex * CELL_SIZE + PADDING
        const size = CELL_SIZE - PADDING * 2
        
        const isSelected =
          selectedTile?.row === rowIndex && selectedTile?.col === colIndex
        const isDragged =
          draggedTile?.row === rowIndex && draggedTile?.col === colIndex

        return (
          <Group key={tile.id}>
            {/* Glow effect for lucky tiles */}
            {tile.isLucky && (
              <Group>
                <RoundedRect
                  x={x - 2}
                  y={y - 2}
                  width={size + 4}
                  height={size + 4}
                  r={12}
                  color="#FFD700"
                  opacity={0.3}
                >
                  <BlurMask blur={8} style="normal" />
                </RoundedRect>
              </Group>
            )}
            
            {/* Tile background */}
            <RoundedRect
              x={x}
              y={y}
              width={size}
              height={size}
              r={8}
            >
              <LinearGradient
                start={vec(x, y)}
                end={vec(x + size, y + size)}
                colors={config.gradients[tile.tier]}
              />
              {(isSelected || isDragged) && (
                <Shadow dx={0} dy={4} blur={8} color="rgba(0,0,0,0.3)" />
              )}
            </RoundedRect>
            
            {/* Tile emoji will be rendered as a React Native component overlay */}
            
            {/* Selection indicator */}
            {isSelected && (
              <RoundedRect
                x={x}
                y={y}
                width={size}
                height={size}
                r={8}
                color="white"
                style="stroke"
                strokeWidth={3}
                opacity={0.8}
              />
            )}
          </Group>
        )
      })
    )
  }, [grid, selectedTile, draggedTile])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragOffset.value.x },
      { translateY: dragOffset.value.y },
    ],
  }))

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.board}>
        <Canvas style={styles.canvas}>
          {/* Board background */}
          <RoundedRect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} r={16}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(BOARD_SIZE, BOARD_SIZE)}
              colors={['#1a1a2e', '#0f0f1e']}
            />
          </RoundedRect>
          
          {/* Grid lines */}
          <Group opacity={0.1}>
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <React.Fragment key={i}>
                <RoundedRect
                  x={i * CELL_SIZE - 0.5}
                  y={0}
                  width={1}
                  height={BOARD_SIZE}
                  r={0}
                  color="white"
                />
                <RoundedRect
                  x={0}
                  y={i * CELL_SIZE - 0.5}
                  width={BOARD_SIZE}
                  height={1}
                  r={0}
                  color="white"
                />
              </React.Fragment>
            ))}
          </Group>
          
          {/* Render tiles */}
          {tiles}
        </Canvas>
        
        {/* Animated tiles overlay */}
        {grid && grid.length > 0 && (
          <View style={styles.emojiOverlay} pointerEvents="none">
            {grid.map((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <AnimatedTile
                  key={tile.id}
                  tile={tile}
                  x={colIndex * CELL_SIZE + PADDING}
                  y={rowIndex * CELL_SIZE + PADDING}
                  size={CELL_SIZE - PADDING * 2}
                  isNew={newTileIds.has(tile.id)}
                />
              ))
            )}
          </View>
        )}
        
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.gestureArea, animatedStyle]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
  },
  canvas: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  },
  gestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emojiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  },
})