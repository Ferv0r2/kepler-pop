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
   * 각 (y,x) 위치 타일의 "현재 translateX, translateY"를
   * Animated.ValueXY로 관리
   */
  const positionsRef = useRef<Animated.ValueXY[][]>([])

  /**
   * 각 타일의 투명도를 관리하기 위한 Animated.Value (기본 1)
   */
  const opacityRef = useRef<Animated.Value[][]>([])

  useEffect(() => {
    initializeBoard()
  }, [])

  // 보드 및 Animated.Value 초기 설정
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
    } while (matches.length > 0) // 매칭 없이 시작

    // positionsRef, opacityRef 세팅
    const newPositions: Animated.ValueXY[][] = []
    const newOpacities: Animated.Value[][] = []

    for (let y = 0; y < BOARD_SIZE; y++) {
      newPositions[y] = []
      newOpacities[y] = []
      for (let x = 0; x < BOARD_SIZE; x++) {
        newPositions[y][x] = new Animated.ValueXY({
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
        })
        newOpacities[y][x] = new Animated.Value(1) // 기본 투명도 1
      }
    }

    positionsRef.current = newPositions
    opacityRef.current = newOpacities

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

  /**
   * 매칭된 타일을 서서히 투명화 후 제거 → 드롭 → 새 타일 생성
   */
  const processMatches = async (
    boardBase: TileType[][],
    matches: number[][],
  ) => {
    const uniqueTiles = new Set<number>()
    matches.flat().forEach((index) => uniqueTiles.add(index))

    onScoreChange(uniqueTiles.size * 100)

    // 1) 매칭된 타일들을 서서히 투명화 (opacity: 1 → 0)
    const fadeOutAnimations: Animated.CompositeAnimation[] = []
    uniqueTiles.forEach((idx) => {
      const yy = Math.floor(idx / BOARD_SIZE)
      const xx = idx % BOARD_SIZE

      const tileOpacity = opacityRef.current[yy][xx]
      const anim = Animated.timing(tileOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      })
      fadeOutAnimations.push(anim)
    })

    await new Promise<void>((resolve) =>
      Animated.parallel(fadeOutAnimations).start(() => resolve()),
    )

    // 2) 실제 board 데이터에서 type을 -1로 변경 (사라진 타일)
    uniqueTiles.forEach((idx) => {
      const yy = Math.floor(idx / BOARD_SIZE)
      const xx = idx % BOARD_SIZE
      boardBase[yy][xx] = { ...boardBase[yy][xx], type: -1 }
    })
    setBoard([...boardBase])

    // 투명도는 다시 1로 돌려놓기(재활용 가능)
    uniqueTiles.forEach((idx) => {
      const yy = Math.floor(idx / BOARD_SIZE)
      const xx = idx % BOARD_SIZE
      opacityRef.current[yy][xx].setValue(1)
    })

    // 3) 타일 드롭
    await animateDrop(boardBase)

    // 4) 새 타일 생성
    await animateNewTiles(boardBase)

    // 연쇄 매칭 (체인 반응)
    const newMatches = checkMatches(boardBase)
    if (newMatches.length > 0) {
      await processMatches(boardBase, newMatches)
    }
  }

  /**
   * 타일 드롭:
   *  - dropTiles()로 실제 (x,y)값 재배치
   *  - positionsRef 애니메이션으로 부드럽게 이동
   */
  const animateDrop = async (boardBase: TileType[][]) => {
    dropTiles(boardBase)
    setBoard([...boardBase])

    const dropAnimations: Animated.CompositeAnimation[] = []
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const tile = boardBase[y][x]
        if (tile.type !== -1) {
          const pos = positionsRef.current[y][x]
          const newX = x * TILE_SIZE
          const newY = y * TILE_SIZE

          const anim = Animated.timing(pos, {
            toValue: { x: newX, y: newY },
            duration: 300,
            useNativeDriver: false,
          })
          dropAnimations.push(anim)
        }
      }
    }

    await new Promise<void>((resolve) =>
      Animated.parallel(dropAnimations).start(() => resolve()),
    )
  }

  /**
   * 새 타일 생성:
   *  - 실제 board 데이터에서 type=-1 칸에 새 타입 할당
   *  - positionsRef는 y=-TILE_SIZE(보드 위쪽)에서 시작 -> 제자리까지 떨어지도록
   */
  const animateNewTiles = async (boardBase: TileType[][]) => {
    const newAnimations: Animated.CompositeAnimation[] = []

    // generateNewTiles() 대신, 여기서 직접 위치 셋팅 & 애니메이션 처리해도 됨
    generateNewTiles(boardBase)
    setBoard([...boardBase])

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const tile = boardBase[y][x]
        if (tile.type !== -1) {
          // 만약 방금 새로 생긴 타일이면?
          // (type이 -1이었다가 새로 할당된 상태를 추적하기 위해서는
          //  별도 플래그를 두거나, 혹은 이전 단계와 비교하는 로직이 필요할 수 있음)
          // 여기서는 간단히 "위에서 내려온다"는 연출을 위해 '이 자리에 있는 타일이 -1이었을 수 있다'고 가정

          const pos = positionsRef.current[y][x]

          // 혹시 아직 y 값이 위(=-TILE_SIZE)에 있다면 → y*TILE_SIZE로 이동
          // (boardBase가 새로 업데이트되면서 실제 y 좌표는 y*TILE_SIZE가 되어야 함)
          if ((pos.y as Animated.Value & { _value: number })._value < 0) {
            // 타일을 Animated.timing으로 내려오게
            const anim = Animated.timing(pos, {
              toValue: { x: x * TILE_SIZE, y: y * TILE_SIZE },
              duration: 300,
              useNativeDriver: false,
            })
            newAnimations.push(anim)
          }
        }
      }
    }

    await new Promise<void>((resolve) =>
      Animated.parallel(newAnimations).start(() => resolve()),
    )
  }

  return (
    <BoardContainer>
      <BoardWrapper>
        {board.map((row) =>
          row.map((tile) => {
            const { x, y, id, type } = tile

            const tileAnimStyle = {
              transform: [
                { translateX: positionsRef.current[y][x].x },
                { translateY: positionsRef.current[y][x].y },
              ],
              opacity: opacityRef.current[y][x],
            }

            return (
              <AnimatedTileContainer key={id} style={tileAnimStyle}>
                <GestureRecognizerContainer
                  onSwipe={(dir) => handleSwipe(dir, x, y)}
                  config={{
                    velocityThreshold: 0.2,
                    directionalOffsetThreshold: 80,
                  }}
                >
                  <Tile type={type} size={TILE_SIZE} />
                </GestureRecognizerContainer>
              </AnimatedTileContainer>
            )
          }),
        )}
      </BoardWrapper>
    </BoardContainer>
  )
}
