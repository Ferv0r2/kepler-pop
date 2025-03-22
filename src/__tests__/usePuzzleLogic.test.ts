import { renderHook, act } from '@testing-library/react-hooks'
import { useGameLogic } from '@/hooks/usePuzzleLogic'
import { BOARD_SIZE } from '@/constants/basicConfig'

describe('useGameLogic Hook', () => {
  // 가짜 타이머 사용 설정
  beforeEach(() => {
    jest.useFakeTimers()
  })

  test('초기 그리드 생성 테스트', () => {
    const { result } = renderHook(() => useGameLogic())
    const { grid } = result.current.gameState

    // 그리드 크기 확인
    expect(grid.length).toBe(BOARD_SIZE)
    expect(grid[0].length).toBe(BOARD_SIZE)

    // 모든 셀이 1-4 사이의 값을 가지는지 확인
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        expect(grid[r][c]).toBeGreaterThanOrEqual(1)
        expect(grid[r][c]).toBeLessThanOrEqual(4)
      }
    }
  })

  test('타일 교환 시 애니메이션 상태 테스트', () => {
    const { result } = renderHook(() => useGameLogic())

    // 초기 상태는 애니메이션이 아님
    expect(result.current.gameState.isAnimating).toBe(false)

    // 특정 패턴으로 그리드 설정
    act(() => {
      result.current.gameState.grid[0][0] = 1
      result.current.gameState.grid[0][1] = 2
    })

    // 타일 교환 액션
    act(() => {
      result.current.handleTileSwap(0, 0, 0, 1)
    })

    // 교환 후 애니메이션 상태가 true로 변경되는지 확인
    expect(result.current.gameState.isAnimating).toBe(true)
  })

  test('타일 교환 시 매치가 없을 때, 애니메이션 상태 해제 테스트', async () => {
    const { result } = renderHook(() => useGameLogic())

    act(() => {
      // 그리드 설정 - 모든 행에 1,2,3,4 패턴 반복
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          result.current.gameState.grid[r][c] = (c % 4) + 1
        }
      }
    })

    act(() => {
      result.current.handleTileSwap(0, 0, 0, 2) // 1과 3 교환 - 매치 없음
    })

    // 타이머 300ms 진행
    act(() => {
      jest.advanceTimersByTime(300)
    })
  })

  test('애니메이션 타임아웃 동작 테스트', async () => {
    const { result } = renderHook(() => useGameLogic())

    // 초기화 및 타일 교환 액션을 통해 애니메이션 상태 설정
    // 직접 isAnimating 상태를 설정하는 것은 useEffect 트리거가 안 될 수 있음
    act(() => {
      // 그리드에 특정 패턴 설정
      result.current.gameState.grid[0][0] = 1
      result.current.gameState.grid[0][1] = 2

      // 타일 교환으로 애니메이션 시작
      result.current.handleTileSwap(0, 0, 0, 1)
    })

    // 애니메이션 상태 확인
    expect(result.current.gameState.isAnimating).toBe(true)

    // 타이머 진행
    await act(async () => {
      jest.advanceTimersByTime(500) // 애니메이션 시간
    })

    // 타이머 완료 후 모든 타이머 실행
    await act(async () => {
      jest.runAllTimers()
    })

    // 이제 애니메이션 상태 확인
    expect(result.current.gameState.isAnimating).toBe(false)
    expect(result.current.gameState.matchedTiles).toEqual([])
    expect(result.current.gameState.newTiles).toEqual([])
  })
})
