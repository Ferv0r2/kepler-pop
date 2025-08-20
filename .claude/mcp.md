# MCP (Model Context Protocol) 설정

## MCP 개요
Model Context Protocol을 통해 Claude가 외부 도구와 데이터 소스에 연결하여 더 강력한 개발 지원을 제공합니다.

## Context7 설정

### Context7 원칙
Context7은 7가지 핵심 컨텍스트 영역을 체계적으로 관리하는 방법론입니다:

1. **Project Context** - 프로젝트 전체 구조와 목적
2. **Technical Context** - 기술 스택과 아키텍처
3. **Business Context** - 비즈니스 요구사항과 목표
4. **User Context** - 사용자 경험과 인터페이스
5. **Performance Context** - 성능 요구사항과 최적화
6. **Security Context** - 보안 고려사항
7. **Maintenance Context** - 유지보수성과 확장성

### KeplerPop에서의 Context7 적용

#### 1. Project Context
```markdown
- 프로젝트명: KeplerPop
- 타입: React Native 모바일 애플리케이션
- 목적: 고성능 2D 그래픽 및 애니메이션 앱
- 개발 단계: 초기 개발 (MVP)
- 팀 구성: 개인/소규모 팀
```

#### 2. Technical Context
```markdown
- 플랫폼: iOS/Android (React Native 0.81.0)
- 언어: TypeScript (strict mode)
- 주요 라이브러리:
  - React Native Skia (2D 그래픽)
  - React Native Reanimated (애니메이션)
  - Zustand (상태 관리)
  - React Native Gesture Handler
- 빌드 도구: Metro Bundler
- 의존성 관리: Yarn
```

#### 3. Business Context
```markdown
- 사용자: 그래픽/애니메이션 콘텐츠 소비자
- 핵심 가치: 부드러운 사용자 경험
- 성공 지표: 앱 성능, 사용자 참여도
- 제약사항: 네이티브 성능 요구
```

#### 4. User Context
```markdown
- 주요 사용자: 모바일 사용자
- 사용 환경: iOS/Android 디바이스
- 접근성: 다양한 기기 크기 지원
- UX 원칙: 직관적이고 반응성 좋은 인터페이스
```

#### 5. Performance Context
```markdown
- 목표 FPS: 60fps 애니메이션
- 메모리 사용량: 최소화
- 배터리 효율성: 네이티브 스레드 활용
- 로딩 시간: 빠른 앱 시작
- 번들 크기: 최적화된 크기 유지
```

#### 6. Security Context
```markdown
- 데이터 보안: 로컬 저장소 암호화
- API 보안: 안전한 통신 프로토콜
- 사용자 인증: 필요시 보안 인증
- 민감 정보: 안전한 키 관리
```

#### 7. Maintenance Context
```markdown
- 코드 품질: TypeScript strict, ESLint
- 테스트: Jest 단위 테스트
- 문서화: 코드 주석, README
- 버전 관리: 의미적 버전 관리
- 업데이트: React Native 호환성 유지
```

## Sequential Thinking 가이드라인

### Sequential Thinking 개념
복잡한 문제를 단계별로 분해하여 체계적으로 접근하는 사고 방식입니다.

### 개발 프로세스에서의 Sequential Thinking

#### 1. 문제 분석 단계
```
Step 1: 요구사항 명확화
├── 기능 요구사항 식별
├── 비기능 요구사항 확인
└── 제약사항 파악

Step 2: 기술적 고려사항
├── 플랫폼 특성 분석
├── 성능 요구사항 검토
└── 호환성 확인
```

#### 2. 설계 단계
```
Step 1: 아키텍처 설계
├── 컴포넌트 구조 설계
├── 상태 관리 전략
└── 데이터 흐름 설계

Step 2: UI/UX 설계
├── 화면 구조 설계
├── 인터랙션 정의
└── 애니메이션 계획
```

#### 3. 구현 단계
```
Step 1: 핵심 기능 구현
├── 기본 컴포넌트 생성
├── 상태 관리 설정
└── 기본 네비게이션

Step 2: 고급 기능 구현
├── Skia 그래픽 구현
├── 애니메이션 추가
└── 제스처 처리

Step 3: 최적화 및 테스트
├── 성능 최적화
├── 테스트 작성
└── 디버깅
```

#### 4. 문제 해결 프로세스
```
1. 문제 식별
   - 현상 파악
   - 에러 메시지 분석
   - 재현 조건 확인

2. 원인 분석
   - 코드 검토
   - 로그 분석
   - 디버깅 도구 활용

3. 해결책 탐색
   - 여러 대안 검토
   - 영향도 분석
   - 최적 해결책 선택

4. 구현 및 검증
   - 단계별 구현
   - 테스트 실행
   - 결과 검증
```

### 코드 작성시 Sequential Thinking

#### 컴포넌트 개발 순서
```typescript
// Step 1: 타입 정의
interface ComponentProps {
  // 필요한 props 정의
}

// Step 2: 기본 구조
export const Component: React.FC<ComponentProps> = (props) => {
  // Step 3: 상태 및 훅
  const [state, setState] = useState();
  
  // Step 4: 이벤트 핸들러
  const handleAction = useCallback(() => {
    // 로직
  }, []);
  
  // Step 5: 렌더링
  return (
    <View>
      {/* JSX */}
    </View>
  );
};

// Step 6: 스타일 정의
const styles = StyleSheet.create({
  // 스타일
});
```

#### 디버깅 Sequential Approach
```
1. 증상 확인
   → 정확한 에러 메시지 수집
   
2. 범위 좁히기
   → 문제 발생 위치 특정
   
3. 가설 수립
   → 가능한 원인들 나열
   
4. 검증
   → 하나씩 체계적으로 확인
   
5. 수정 적용
   → 최소한의 변경으로 해결
   
6. 회귀 테스트
   → 다른 기능에 영향 없는지 확인
```

## MCP 도구 활용 가이드

### 개발 도구 연동
```markdown
1. 코드 분석 도구
   - TypeScript 언어 서버
   - ESLint 린터
   - Prettier 포매터

2. 빌드 도구
   - Metro Bundler
   - React Native CLI
   - 네이티브 빌드 도구

3. 디버깅 도구
   - React Native Debugger
   - Flipper
   - Chrome DevTools
```

### 정보 검색 전략
```markdown
1. 공식 문서 우선
   - React Native 공식 문서
   - Skia 문서
   - TypeScript 문서

2. 커뮤니티 리소스
   - GitHub Issues
   - Stack Overflow
   - Reddit 커뮤니티

3. 최신 정보 확인
   - 릴리즈 노트
   - 변경 로그
   - 마이그레이션 가이드
```

## Context 유지 전략

### 세션 중 컨텍스트 관리
1. **프로젝트 상태 추적**
   - 현재 작업 중인 기능
   - 해결 중인 문제
   - 다음 단계 계획

2. **기술적 결정 기록**
   - 선택한 라이브러리와 이유
   - 아키텍처 결정사항
   - 성능 최적화 방법

3. **학습된 내용 축적**
   - 발견한 버그와 해결법
   - 성능 개선 팁
   - 베스트 프랙티스

### 장기적 컨텍스트 보존
- 중요한 결정사항은 문서화
- 트러블슈팅 히스토리 유지
- 코드 리뷰 피드백 반영 