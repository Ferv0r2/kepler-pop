# KeplerPop 프로젝트 구조 및 네이밍 컨벤션

## 프로젝트 디렉토리 구조

```
keplerpop/
├── .claude/                    # Claude Code 설정
│   ├── project.md
│   ├── context.md
│   ├── rules.md
│   ├── structure.md
│   └── ignore
├── android/                    # Android 네이티브 코드
├── ios/                        # iOS 네이티브 코드
├── src/                        # 메인 소스 코드
│   ├── app/                    # 앱 설정 및 진입점
│   │   └── App.tsx
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   ├── skia/               # Skia 관련 컴포넌트
│   │   └── ui/                 # UI 컴포넌트
│   ├── screens/                # 화면 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   └── [기타 화면들]
│   ├── state/                  # 상태 관리
│   │   ├── store.ts            # Zustand 메인 스토어
│   │   ├── slices/             # 스토어 슬라이스들
│   │   └── types.ts            # 상태 관련 타입
│   ├── utils/                  # 유틸리티 함수
│   │   ├── animation.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useAnimation.ts
│   │   └── useSkia.ts
│   ├── types/                  # 타입 정의
│   │   ├── common.ts
│   │   ├── navigation.ts
│   │   └── api.ts
│   └── assets/                 # 에셋 파일
│       ├── images/
│       ├── fonts/
│       └── animations/
├── __tests__/                  # 테스트 파일
├── public/                     # 정적 파일
└── [설정 파일들]
```

## 파일 네이밍 컨벤션

### 컴포넌트 파일
- **화면 컴포넌트**: `[Name]Screen.tsx` (예: `HomeScreen.tsx`, `ProfileScreen.tsx`)
- **일반 컴포넌트**: `[ComponentName].tsx` (파스칼 케이스)
- **Skia 컴포넌트**: `Skia[Name].tsx` (예: `SkiaBoard.tsx`, `SkiaCanvas.tsx`)

### 훅 파일
- **커스텀 훅**: `use[HookName].ts` (예: `useAnimation.ts`, `useSkiaBoard.ts`)
- **상태 관리 훅**: `use[StoreName]Store.ts` (예: `useAppStore.ts`)

### 유틸리티 파일
- **기능별 분류**: `[기능명].ts` (카멜 케이스)
- **상수**: `constants.ts`
- **헬퍼 함수**: `helpers.ts`
- **타입 정의**: `types.ts`

### 테스트 파일
- **컴포넌트 테스트**: `[ComponentName].test.tsx`
- **훅 테스트**: `[hookName].test.ts`
- **유틸리티 테스트**: `[utilName].test.ts`

## 디렉토리별 역할

### `/src/components/`
```
components/
├── common/                     # 범용 컴포넌트
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── Button.tsx
│   │   ├── types.ts
│   │   └── styles.ts
│   ├── Modal/
│   └── Input/
├── skia/                       # Skia 관련 컴포넌트
│   ├── SkiaBoard.tsx
│   ├── SkiaCanvas.tsx
│   └── animations/
└── ui/                         # UI 특화 컴포넌트
    ├── Header.tsx
    ├── Navigation.tsx
    └── Layout.tsx
```

### `/src/screens/`
- 각 화면은 단일 파일로 구성
- 복잡한 화면의 경우 폴더로 분리하고 `index.tsx` 사용
- 화면별 하위 컴포넌트는 같은 폴더 내에 배치

### `/src/state/`
```
state/
├── store.ts                    # 메인 스토어
├── slices/                     # 기능별 상태 슬라이스
│   ├── userSlice.ts
│   ├── themeSlice.ts
│   └── animationSlice.ts
├── types.ts                    # 상태 관련 타입
└── middleware.ts               # 스토어 미들웨어
```

### `/src/utils/`
```
utils/
├── animation.ts                # 애니메이션 유틸
├── constants.ts                # 앱 상수
├── helpers.ts                  # 범용 헬퍼 함수
├── platform.ts                # 플랫폼 관련 유틸
├── performance.ts              # 성능 최적화 유틸
└── validation.ts               # 검증 함수
```

### `/src/hooks/`
```
hooks/
├── useAnimation.ts             # 애니메이션 훅
├── useSkia.ts                  # Skia 관련 훅
├── useGesture.ts              # 제스처 훅
├── usePlatform.ts             # 플랫폼 훅
└── usePerformance.ts          # 성능 관련 훅
```

## 폴더/파일 생성 규칙

### 컴포넌트 생성시
1. 단순한 컴포넌트: 단일 파일 (`ComponentName.tsx`)
2. 복잡한 컴포넌트: 폴더 구조
   ```
   ComponentName/
   ├── index.tsx              # export 전용
   ├── ComponentName.tsx      # 메인 컴포넌트
   ├── types.ts              # 타입 정의
   ├── styles.ts             # 스타일 정의
   └── hooks.ts              # 컴포넌트 전용 훅
   ```

### 새로운 기능 추가시
1. 기능별로 디렉토리 분리
2. 관련 파일들을 같은 폴더에 그룹화
3. `index.ts` 파일로 내보내기 통합

## Import 경로 규칙

### 절대 경로 별칭 (`@/`)
```typescript
// ✅ 올바른 사용
import { HomeScreen } from '@/screens/HomeScreen';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/utils/constants';
import type { User } from '@/types/common';

// ❌ 상대 경로 사용 금지 (깊은 중첩시)
import { Button } from '../../../components/common/Button';
```

### Import 순서
1. React 관련
2. React Native 관련  
3. 서드파티 라이브러리
4. 내부 컴포넌트 (절대 경로)
5. 타입 import (별도 그룹)

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

import { Button } from '@/components/common/Button';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/utils/constants';

import type { ComponentProps } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { UserProfile } from '@/types/common';
```

## 파일 내부 구조 순서

### 컴포넌트 파일 구조
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants (컴포넌트 레벨)
// 4. Component
// 5. Styles
// 6. Default export

import React from 'react';
// ... other imports

interface Props {
  // 타입 정의
}

const DEFAULT_CONFIG = {
  // 상수
};

export const ComponentName: React.FC<Props> = () => {
  // 컴포넌트 로직
};

const styles = StyleSheet.create({
  // 스타일
});

export default ComponentName;
```

## 특수 파일 규칙

### `index.ts` 파일
- 디렉토리의 내보내기 전용
- 실제 로직 구현 금지
- 명확한 export 문 사용

```typescript
// ✅ 올바른 index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export type { ButtonProps, ModalProps } from './types';

// ❌ 잘못된 index.ts
export { Button } from './Button';
const someLogic = () => { /* 로직 */ };
```

### `types.ts` 파일
- 해당 모듈의 타입만 정의
- 다른 모듈의 타입은 import 후 재export

```typescript
// ✅ 올바른 types.ts
export interface UserProfile {
  id: string;
  name: string;
}

export type UserStatus = 'active' | 'inactive';

// 다른 모듈의 타입 재export
export type { CommonType } from '@/types/common';
```

이제 Claude Code 설정이 완료되었습니다! 🎉 