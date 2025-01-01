import React, { useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import styled from 'styled-components/native'

import { checkMatches, dropTiles, generateNewTiles } from '@/utils/gameLogic'
import type { TileType } from '@/types/TileType'
import { Tile } from '@/components/Tile'
import { BOARD_SIZE, TILE_SIZE } from '@/constants/basicConfig'
import { SwipeGesture } from '@/types/SwipeGesture'

// 보드를 감싸는 최상위 컨테이너
const BoardContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  elevation: 4; /* Android shadow */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`

// 보드 래퍼 (절대 위치로 타일을 배치하기 위해)
const BoardWrapper = styled.View`
  position: relative;
  width: ${BOARD_SIZE * TILE_SIZE}px;
  height: ${BOARD_SIZE * TILE_SIZE}px;
`

// 각 타일을 담을 Animated 뷰 (absolute)
const AnimatedTileContainer = styled(Animated.View)`
  position: absolute;
  width: ${TILE_SIZE}px;
  height: ${TILE_SIZE}px;
`

const GestureRecognizerContainer = styled(GestureRecognizer)`
  width: 100%;
  height: 100%;
`

type GameBoardProps = {
  onScoreChange: (score: number) => void
}

export const GameBoard = ({ onScoreChange }: GameBoardProps) => {
  const [board, setBoard] = useState<TileType[][]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  /**
   * 각 (y,x) 위치의 타일을 "어디에 그려야 하는지"를
   * Animated.ValueXY로 관리 (translateX, translateY)
   */
  const positionsRef = useRef<Animated.ValueXY[][]>([])

  useEffect(() => {
    initializeBoard()
  }, [])

  // 보드 및 Animated.ValueXY 초기 설정
  const initializeBoard = () => {
    let newBoard: TileType[][]
    let matches: number[][]

    do {
      newBoard = Array.from({ length: BOARD_SIZE }, (_, y) =>
        Array.from({ length: BOARD_SIZE }, (_, x) => ({
          id: y * BOARD_SIZE + x,
          type: Math.floor(Math.random() * 5),
          x,
          y,
        })),
      )
      matches = checkMatches(newBoard)
    } while (matches.length > 0)

    // positionsRef 세팅
    const newPositions: Animated.ValueXY[][] = []
    for (let y = 0; y < BOARD_SIZE; y++) {
      newPositions[y] = []
      for (let x = 0; x < BOARD_SIZE; x++) {
        newPositions[y][x] = new Animated.ValueXY({
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
        })
      }
    }
    positionsRef.current = newPositions

    setBoard(newBoard)
  }

  /**
   * 스와이프 → 인접 타일과 교차 이동
   */
  const handleSwipe = (direction: string, x: number, y: number) => {
    if (isProcessing) return

    let targetX = x
    let targetY = y

    switch (direction) {
      case SwipeGesture.SWIPE_LEFT:
        targetX = x - 1
        break
      case SwipeGesture.SWIPE_RIGHT:
        targetX = x + 1
        break
      case SwipeGesture.SWIPE_UP:
        targetY = y - 1
        break
      case SwipeGesture.SWIPE_DOWN:
        targetY = y + 1
        break
      default:
        return
    }

    // 범위 체크
    if (
      targetX < 0 ||
      targetX >= BOARD_SIZE ||
      targetY < 0 ||
      targetY >= BOARD_SIZE
    ) {
      return
    }

    setIsProcessing(true)
    // 교차 이동 (A <-> B)
    swapAndAnimate(x, y, targetX, targetY)
  }

  /**
   * 두 타일을 애니메이션으로 교차 이동 후, 매칭 검사
   */
  const swapAndAnimate = (
    x: number,
    y: number,
    targetX: number,
    targetY: number,
  ) => {
    const newBoard = board.map((row) => [...row])

    // A/B 애니메이션 값
    const APos = positionsRef.current[y][x]
    const BPos = positionsRef.current[targetY][targetX]

    // A/B의 현재 좌표
    const Ax = x * TILE_SIZE
    const Ay = y * TILE_SIZE
    const Bx = targetX * TILE_SIZE
    const By = targetY * TILE_SIZE

    // 보드 데이터에서 swap
    swapTiles(newBoard, { x, y }, { x: targetX, y: targetY })

    // 두 타일이 서로 자리로 교차 이동
    // (A -> B 자리), (B -> A 자리)
    const animA = Animated.timing(APos, {
      toValue: { x: Bx, y: By },
      duration: 200,
      useNativeDriver: false,
    })
    const animB = Animated.timing(BPos, {
      toValue: { x: Ax, y: Ay },
      duration: 200,
      useNativeDriver: false,
    })

    Animated.parallel([animA, animB]).start(async () => {
      // 교차 이동 완료 후 매칭 체크
      const matches = checkMatches(newBoard)
      if (matches.length > 0) {
        // 매칭 성공
        await processMatches(newBoard, matches)
        setIsProcessing(false)
      } else {
        // 매칭 실패 → 원위치로 되돌리기
        const animAback = Animated.timing(APos, {
          toValue: { x: Ax, y: Ay },
          duration: 200,
          useNativeDriver: false,
        })
        const animBback = Animated.timing(BPos, {
          toValue: { x: Bx, y: By },
          duration: 200,
          useNativeDriver: false,
        })

        Animated.parallel([animAback, animBback]).start(() => {
          // rollback 시 보드 데이터도 swap 복구
          swapTiles(newBoard, { x: targetX, y: targetY }, { x, y })
          setIsProcessing(false)
        })
      }
    })
  }

  const swapTiles = (
    boardBase: TileType[][],
    tile1: { x: number; y: number },
    tile2: { x: number; y: number },
  ) => {
    const temp = { ...boardBase[tile1.y][tile1.x] }
    boardBase[tile1.y][tile1.x] = {
      ...boardBase[tile2.y][tile2.x],
      x: tile1.x,
      y: tile1.y,
    }
    boardBase[tile2.y][tile2.x] = { ...temp, x: tile2.x, y: tile2.y }
    setBoard(boardBase)
  }

  const processMatches = async (
    boardBase: TileType[][],
    matches: number[][],
  ) => {
    const uniqueTiles = new Set<number>()
    matches.flat().forEach((index) => uniqueTiles.add(index))

    onScoreChange(uniqueTiles.size * 100)

    // 매칭된 타일 -1
    uniqueTiles.forEach((idx) => {
      const yy = Math.floor(idx / BOARD_SIZE)
      const xx = idx % BOARD_SIZE
      boardBase[yy][xx] = { ...boardBase[yy][xx], type: -1 }
    })
    setBoard([...boardBase])

    await delay(200)
    dropTiles(boardBase)
    setBoard([...boardBase])

    await delay(200)
    generateNewTiles(boardBase)
    setBoard([...boardBase])

    // 연속 매칭 검사
    const newMatches = checkMatches(boardBase)
    if (newMatches.length > 0) {
      await processMatches(boardBase, newMatches)
    }
  }

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  return (
    <BoardContainer>
      <BoardWrapper>
        {board.map((row) =>
          row.map((tile) => {
            const { x, y } = tile
            // 각 타일의 Animated.ValueXY
            const tileAnimStyle = {
              transform: [
                { translateX: positionsRef.current[y][x].x },
                { translateY: positionsRef.current[y][x].y },
              ],
            }

            return (
              <AnimatedTileContainer key={tile.id} style={tileAnimStyle}>
                <GestureRecognizerContainer
                  onSwipe={(dir) => handleSwipe(dir, x, y)}
                  config={{
                    velocityThreshold: 0.2,
                    directionalOffsetThreshold: 80,
                  }}
                >
                  <Tile type={tile.type} size={TILE_SIZE} />
                </GestureRecognizerContainer>
              </AnimatedTileContainer>
            )
          }),
        )}
      </BoardWrapper>
    </BoardContainer>
  )
}
