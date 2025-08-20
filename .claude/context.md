# KeplerPop 프로젝트 컨텍스트

## 현재 개발 단계
- 초기 개발 단계의 React Native 프로젝트
- 기본 프로젝트 구조 설정 완료
- Skia 기반 그래픽 컴포넌트 개발 중

## 주요 파일 설명

### 핵심 앱 파일
- `App.tsx`: 루트 레벨 앱 컴포넌트
- `src/app/App.tsx`: 메인 애플리케이션 로직
- `src/screens/HomeScreen.tsx`: 홈 화면 컴포넌트
- `src/components/SkiaBoard.tsx`: Skia 기반 그래픽 보드 컴포넌트
- `src/state/store.ts`: Zustand 상태 관리 스토어

### 설정 파일
- `tsconfig.json`: TypeScript 설정 (`@/*` 경로 별칭 설정됨)
- `babel.config.js`: Babel 변환 설정
- `metro.config.js`: Metro 번들러 설정
- `jest.config.js`: Jest 테스트 설정

### 빌드 설정
- `android/`: Android 네이티브 프로젝트
- `ios/`: iOS 네이티브 프로젝트
- `package.json`: 의존성 및 스크립트 정의

## 개발 목표
- 고성능 2D 그래픽 애플리케이션
- 부드러운 애니메이션과 인터랙션
- 크로스플랫폼 호환성

## 코드 작성시 주의사항

### 성능 고려사항
- Skia 컴포넌트 사용시 불필요한 리렌더링 방지
- 애니메이션은 네이티브 스레드에서 실행되도록 worklet 사용
- 메모리 사용량 모니터링 필요

### 플랫폼 고려사항
- iOS와 Android 간 동작 차이 확인
- 네이티브 모듈 사용시 플랫폼별 구현 필요
- 안전 영역(Safe Area) 처리

### 상태 관리
- Zustand를 사용한 전역 상태 관리
- 컴포넌트별 로컬 상태는 useState/useReducer 사용
- 애니메이션 상태는 useSharedValue 사용

## 디버깅 정보
- `troubleshooting/2025-08-18_android_build_fix.md`: Android 빌드 관련 문제 해결 기록
- Metro bundler 사용으로 Fast Refresh 지원
- React Native Flipper 지원 (디버깅 도구)

## 의존성 관리
- Yarn 사용 (`yarn.lock` 파일 존재)
- pnpm에서 yarn으로 마이그레이션됨
- Node.js 18+ 필요

## 최근 변경사항
- pnpm-lock.yaml 제거됨
- yarn.lock 파일로 의존성 관리 변경
- .gitignore 업데이트됨 