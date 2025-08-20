# KeplerPop - React Native 프로젝트

## 프로젝트 개요
KeplerPop은 React Native로 개발된 크로스플랫폼 모바일 애플리케이션입니다.

### 주요 기술 스택
- **React Native 0.81.0**: 크로스플랫폼 모바일 개발
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **React Native Skia**: 2D 그래픽 및 애니메이션
- **React Native Reanimated**: 고성능 애니메이션
- **Zustand**: 상태 관리
- **React Native Gesture Handler**: 제스처 처리

## 프로젝트 구조
```
src/
├── app/           # 앱 설정 및 진입점
├── components/    # 재사용 가능한 UI 컴포넌트
├── screens/       # 화면 컴포넌트
└── state/         # 상태 관리 (Zustand store)
```

## 코딩 규칙 및 컨벤션

### TypeScript 규칙
- strict mode 활성화
- 모든 컴포넌트와 함수에 적절한 타입 정의
- interface는 파스칼 케이스 사용 (예: `UserInterface`)
- type은 파스칼 케이스 + Type 접미사 (예: `ButtonPropsType`)

### 네이밍 컨벤션
- **컴포넌트**: 파스칼 케이스 (예: `HomeScreen`, `SkiaBoard`)
- **파일명**: 컴포넌트 파일은 파스칼 케이스, 기타는 카멜 케이스
- **변수/함수**: 카멜 케이스
- **상수**: UPPER_SNAKE_CASE

### 파일 구조 규칙
- 컴포넌트는 기본적으로 단일 파일로 작성
- 복잡한 컴포넌트의 경우 폴더로 분리하고 index.tsx 사용
- 스타일은 StyleSheet.create() 사용하여 컴포넌트 하단에 배치

### Import 규칙
- 절대 경로 사용 (`@/` 별칭 활용)
- React 관련 import가 최상단
- 서드파티 라이브러리
- 내부 컴포넌트/유틸리티
- 타입 import는 type 키워드 사용

### React Native 특화 규칙
- Platform별 코드 분기시 Platform.OS 사용
- 스타일은 StyleSheet.create() 사용
- 색상은 상수로 정의하여 일관성 유지
- SafeAreaView 사용으로 기기별 안전 영역 고려

### Skia 관련 규칙
- Canvas 컴포넌트는 별도 파일로 분리
- 애니메이션 값은 useSharedValue 사용
- 성능 최적화를 위해 worklet 적극 활용

## 개발 환경
- Node.js >= 18
- React Native CLI
- TypeScript
- ESLint + Prettier
- Jest (테스트)

## 빌드 타겟
- iOS (Xcode 프로젝트)
- Android (Gradle 프로젝트)

## 주의사항
- React Native 버전 호환성 주의
- 네이티브 모듈 추가시 플랫폼별 설정 필요
- Skia 사용시 성능 최적화 고려
- 메모리 누수 방지를 위한 cleanup 코드 작성

## 코드 품질
- ESLint 규칙 준수
- Prettier로 코드 포맷팅
- TypeScript strict 모드 활용
- 컴포넌트 재사용성 고려
- 접근성(Accessibility) 고려

## MCP 및 고급 개발 방법론
- **MCP (Model Context Protocol)**: 외부 도구와의 연동으로 강화된 개발 환경
- **Context7**: 7가지 핵심 컨텍스트 영역 체계적 관리
- **Sequential Thinking**: 단계별 문제 해결 및 체계적 개발 접근

## 관련 설정 파일
- `.claude/mcp.md`: MCP 설정 및 Context7/Sequential Thinking 가이드
- `.claude/workflow.md`: MCP 기반 개발 워크플로우
- `.claude/context.md`: 프로젝트 상세 컨텍스트
- `.claude/rules.md`: 코딩 규칙 및 가이드라인
- `.claude/structure.md`: 프로젝트 구조 및 네이밍 컨벤션 