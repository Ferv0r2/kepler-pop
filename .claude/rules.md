# KeplerPop 코딩 규칙 및 가이드라인

## 전반적인 원칙
1. **타입 안전성**: 모든 코드는 TypeScript strict 모드 기준을 만족해야 함
2. **성능 우선**: React Native와 Skia의 성능 특성을 고려한 코드 작성
3. **일관성**: 기존 코드베이스의 패턴과 스타일을 유지
4. **가독성**: 명확하고 이해하기 쉬운 코드 작성

## TypeScript 규칙

### 타입 정의
```typescript
// ✅ 좋은 예
interface UserProfileProps {
  userId: string;
  onUpdate: (user: User) => void;
  isLoading?: boolean;
}

type AnimationState = 'idle' | 'running' | 'paused';

// ❌ 피해야 할 예
interface Props {
  data: any;
  callback: Function;
}
```

### Import/Export 규칙
```typescript
// ✅ 타입 import는 type 키워드 사용
import type { ComponentProps } from 'react';
import type { SharedValue } from 'react-native-reanimated';

// ✅ 절대 경로 사용
import { HomeScreen } from '@/screens/HomeScreen';
import { useAppStore } from '@/state/store';

// ✅ 명시적 export
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // ...
};

export type { UserProfileProps };
```

## React Native 컴포넌트 구조

### 컴포넌트 템플릿
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ComponentPropsType } from './types';

interface Props {
  // 타입 정의
}

export const ComponentName: React.FC<Props> = ({ 
  prop1, 
  prop2 
}) => {
  // hooks
  // 로직
  
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 스타일
  },
});
```

## Skia 관련 규칙

### Canvas 컴포넌트
```typescript
// ✅ Skia 컴포넌트는 별도 파일로 분리
import { Canvas, Circle, useValue } from '@shopify/react-native-skia';
import { useSharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

export const SkiaAnimation: React.FC = () => {
  const progress = useSharedValue(0);
  
  const animatedProps = useDerivedValue(() => ({
    cx: progress.value * 100,
    cy: 50,
  }), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Circle r={20} {...animatedProps} color="blue" />
    </Canvas>
  );
};
```

## 상태 관리 규칙

### Zustand Store
```typescript
// ✅ 타입 안전한 스토어 정의
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
}

interface AppActions {
  setUser: (user: User) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  user: null,
  theme: 'light',
  isLoading: false,
  
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

## 스타일링 규칙

### StyleSheet 사용
```typescript
// ✅ 컴포넌트 하단에 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  // 플랫폼별 스타일
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

## 애니메이션 규칙

### Reanimated 사용
```typescript
// ✅ worklet 사용으로 UI 스레드에서 실행
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      { translateX: progress.value * 100 },
    ],
  };
}, [progress]);
```

## 에러 처리

### 에러 바운더리
```typescript
// ✅ 에러 바운더리 사용
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## 테스트 규칙

### Jest 테스트
```typescript
// ✅ 컴포넌트 테스트
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('home-screen')).toBeDefined();
  });
});
```

## 성능 최적화

### 메모이제이션
```typescript
// ✅ React.memo 사용
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  const processedData = useMemo(() => {
    return processLargeData(data);
  }, [data]);

  return <View>{processedData}</View>;
});

// ✅ useCallback 사용
const handlePress = useCallback((id: string) => {
  onItemPress(id);
}, [onItemPress]);
```

## 접근성

### 접근성 고려사항
```typescript
// ✅ 접근성 속성 추가
<TouchableOpacity
  accessible={true}
  accessibilityLabel="홈으로 이동"
  accessibilityRole="button"
  onPress={handleHomePress}
>
  <Text>홈</Text>
</TouchableOpacity>
```

## 코드 리뷰 체크리스트
- [ ] TypeScript 타입 정의가 명확한가?
- [ ] 성능에 영향을 주는 코드는 없는가?
- [ ] 플랫폼별 차이를 고려했는가?
- [ ] 접근성을 고려했는가?
- [ ] 에러 처리가 적절한가?
- [ ] 테스트 케이스가 충분한가?
- [ ] 메모리 누수 가능성은 없는가? 