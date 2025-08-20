🎯 상세 통합 계획 (Detailed Integration Plan)

📋 현재 상태 분석

kepler-combine/kepler-pop-webview 프로젝트:

기술 스택: Next.js, React Query, Framer Motion, TailwindCSS
게임 특징:
매치-3 퍼즐 게임 (6가지 타일 타입)
캐주얼/챌린지 모드
파워업 아이템 시스템 (shovel, mole, bomb)
유물(Artifact) 시스템
레벨업 & 경험치 시스템
부활 시스템 (광고/보석)
백엔드 연동 (점수, 리더보드, 인증)

현재 keplerpop 프로젝트:

기술 스택: React Native, Skia, Reanimated, Zustand
상태: 기본 보일러플레이트 구조

🎮 GameView 핵심 기능 추출

유지할 핵심 기능:

매치-3 게임 로직
타일 교환 (드래그/선택 모드)
매칭 검사 알고리즘
콤보 시스템
점수 계산

시각적 효과
타일 애니메이션
파티클 효과
점수 팝업
셔플 애니메이션

게임 아이템
3가지 파워업 (삽, 두더지, 폭탄)
아이템 애니메이션

제거할 기능 (백엔드 관련):

네트워크 통신 (KeplerBackend)
인증 시스템
리더보드
광고/결제 시스템
레벨/경험치 서버 동기화

🛠️ 필요한 라이브러리

JSON
{
"dependencies": {
// 애니메이션 & UI
"react-native-svg": "^15.10.0",
"react-native-haptic-feedback": "^2.6.0",
"react-native-sound": "^0.12.0",
"react-native-linear-gradient": "^2.8.3",

    // 유틸리티
    "uuid": "^11.0.5",
    "dayjs": "^1.12.1",

    // 상태 관리 (이미 설치됨)
    // "zustand": "^5.0.7"

}
}

💫 개선 사항 및 제안

성능 최적화
Skia 캔버스를 활용한 고성능 렌더링
Reanimated3를 활용한 부드러운 애니메이션
메모이제이션 강화

UX 개선
햅틱 피드백 추가
더 직관적인 튜토리얼
제스처 반응성 향상

시각적 개선
그라데이션 배경 효과
파티클 시스템 개선
네온 글로우 효과 강화

게임플레이 개선
오프라인 점수 저장
로컬 최고 점수 추적
간단한 업적 시스템

📁 제안 폴더 구조

PLAINTEXT
src/
├── screens/
│ ├── HomeScreen.tsx (메인 메뉴)
│ └── GameScreen.tsx (게임 화면)
├── components/
│ ├── game/
│ │ ├── GameBoard.tsx
│ │ ├── Tile.tsx
│ │ ├── PowerUpItem.tsx
│ │ └── ScoreDisplay.tsx
│ ├── ui/
│ │ ├── Modal.tsx
│ │ ├── Button.tsx
│ │ └── Toast.tsx
│ └── effects/
│ ├── ParticleSystem.tsx
│ └── Confetti.tsx
├── hooks/
│ ├── useGameLogic.ts
│ ├── useSound.ts
│ └── useHaptic.ts
├── utils/
│ ├── gameHelpers.ts
│ ├── animations.ts
│ └── storage.ts
├── constants/
│ ├── gameConfig.ts
│ └── tileConfig.ts
├── state/
│ └── gameStore.ts
└── assets/
├── sounds/
└── images/

⚠️ 주의사항

React Native 호환성
Next.js 특화 코드 제거
DOM 의존성 제거
React Native 컴포넌트로 변환

애니메이션 변환
Framer Motion → Reanimated
CSS → StyleSheet

상태 관리
React Query 제거
Zustand로 통합

🚀 구현 우선순위

Phase 1: 핵심 게임 로직 이식
Phase 2: UI 컴포넌트 구현
Phase 3: 애니메이션 & 효과
Phase 4: 사운드 & 햅틱
Phase 5: 최적화 & 폴리싱

이 계획을 승인하시면 단계별로 구현을 시작하겠습니다. 특히 관심있는 부분이나 우선적으로 구현했으면 하는 기능이 있으신가요?

---

🎯 백엔드 프리 중독성 게임 통합 계획 v2.0

📋 핵심 전략: "Zero Friction, Maximum Addiction"

원칙:

❌ 로그인 없음
❌ 백엔드 없음
✅ 즉시 플레이
✅ 로컬 저장 기반
✅ 오프라인 완전 동작

🧠 구현할 중독성 메커니즘 (백엔드 없이)

1단계: 즉시 구현 가능한 핵심 기능

TYPESCRIPT
// 1. 럭키 매치 시스템
interface LuckyMatchSystem {
implementation: {
storage: "none", // 저장 불필요
complexity: "low",
impact: "very_high"
},
features: {
criticalHit: {
chance: 0.05,
visualCue: "rainbow_explosion",
soundCue: "jackpot_sound",
scoreMultiplier: 3
},
luckyTile: {
spawnChance: 0.02,
types: ["2x_score", "free_move", "instant_item"],
animation: "glowing_pulse"
}
}
}
// 2. Flow State 최적화
interface FlowOptimization {
implementation: {
storage: "AsyncStorage", // 플레이어 스킬 추적
complexity: "medium"
},
features: {
dynamicDifficulty: {
trackMetrics: ["avg_move_time", "success_rate", "combo_frequency"],
adjustments: ["tile_distribution", "special_tile_rate", "hint_timing"]
},
hapticRhythm: {
pattern: "escalating_with_combo",
intensity: "adaptive_to_performance"
}
}
}
// 3. Near-Miss 시스템
interface NearMissExperience {
implementation: {
storage: "none",
complexity: "low"
},
features: {
almostWin: {
detection: "1_move_from_big_combo",
feedback: "slow_motion_reveal",
message: "So close! Try again!"
},
lastSecondSave: {
trigger: "win_on_last_move",
celebration: "epic_victory_sequence"
}
}
}

2단계: 로컬 저장 기반 진행 시스템

TYPESCRIPT
// 4. 로컬 업적 & 수집 시스템
interface LocalProgressionSystem {
implementation: {
storage: "AsyncStorage + MMKV",
encryption: "optional_for_anti_cheat"
},

collections: {
tileThemes: {
unlockConditions: ["play_100_games", "score_10000", "combo_20x"],
visualProgress: "collection_book",
completionReward: "master_theme"
},

    achievements: {
      categories: {
        speed: ["under_30sec", "under_20sec", "under_10sec"],
        combo: ["10x", "20x", "50x", "100x"],
        perfect: ["no_wrong_moves", "all_items_used", "zero_hints"],
        secret: ["hidden_pattern", "easter_egg", "developer_score"]
      },

      display: {
        unlockedCount: "32/100",
        nextUnlock: "hint_with_progress_bar",
        shareableCard: "generate_achievement_image"
      }
    },

    dailyStreak: {
      tracking: "local_date_check",
      rewards: [
        { day: 1, reward: "100_coins" },
        { day: 3, reward: "power_up_pack" },
        { day: 7, reward: "exclusive_theme" },
        { day: 30, reward: "legendary_tile_set" }
      ],
      missedDay: "keep_progress_but_reset_multiplier"
    }

}
}
// 5. 일일 도전 (오프라인)
interface OfflineDailyChallenge {
implementation: {
storage: "AsyncStorage",
seedGeneration: "date_based_deterministic"
},

features: {
sameBoardForAll: {
seed: "YYYYMMDD_hash",
ensures: "everyone_plays_same_puzzle"
},

    localLeaderboard: {
      compareWith: "your_previous_scores",
      ghostMode: "replay_your_best_attempt",
      statistics: "show_percentile_estimate"
    },

    timedAvailability: {
      duration: "24_hours",
      countdown: "visible_timer",
      missedChallenge: "show_what_you_missed"
    }

}
}

3단계: 세션 기반 중독 메커니즘

TYPESCRIPT
// 6. 세션 내 보너스 시스템
interface SessionBonusSystem {
implementation: {
storage: "memory_only",
resetOn: "app_restart"
},

features: {
playStreak: {
bonus: "increase_5%\_per_game",
maxBonus: "50%",
cooldown: "reset_after_5min_idle"
},

    hotHand: {
      trigger: "3_wins_in_row",
      effect: "double_points_next_game",
      visual: "fire_effect_on_tiles"
    },

    rushMode: {
      activation: "5_games_in_10min",
      reward: "unlimited_hints_for_5min"
    }

}
}
// 7. 심리적 압박 시스템
interface PsychologicalHooks {
implementation: {
storage: "AsyncStorage_for_patterns",
analysis: "local_ml_lite_model"
},

features: {
quitTiming: {
detect: "about_to_quit_pattern",
intervention: "show_next_reward_preview",
message: "Just 50 points to unlock new theme!"
},

    frustrationDetection: {
      signs: ["repeated_wrong_moves", "long_pause", "rage_tap"],
      response: "subtle_hint_or_encouragement"
    },

    celebrationScaling: {
      smallWin: "appropriate_celebration",
      bigWin: "massive_celebration",
      personalBest: "special_achievement_ceremony"
    }

}
}

📁 업데이트된 프로젝트 구조

PLAINTEXT
src/
├── screens/
│ ├── HomeScreen.tsx # 즉시 플레이 가능한 메인
│ ├── GameScreen.tsx # 핵심 게임 화면
│ └── DailyChallengeScreen.tsx # 일일 도전
│
├── components/
│ ├── game/
│ │ ├── GameBoard.tsx # Skia 기반 고성능 보드
│ │ ├── Tile.tsx # 애니메이션 타일
│ │ ├── LuckyTile.tsx # 특수 타일
│ │ ├── PowerUpBar.tsx # 파워업 UI
│ │ └── ComboDisplay.tsx # 콤보 표시
│ │
│ ├── progression/
│ │ ├── AchievementToast.tsx
│ │ ├── StreakCounter.tsx
│ │ ├── CollectionBook.tsx
│ │ └── DailyRewardModal.tsx
│ │
│ ├── effects/
│ │ ├── ParticleSystem.tsx # Skia 파티클
│ │ ├── LuckyMatchEffect.tsx
│ │ ├── NearMissEffect.tsx
│ │ └── FlowStateVisualizer.tsx
│ │
│ └── ui/
│ ├── QuickStartButton.tsx # 원터치 시작
│ └── SessionStreakBar.tsx
│
├── hooks/
│ ├── game/
│ │ ├── useGameLogic.ts
│ │ ├── useLuckyMatch.ts
│ │ ├── useNearMiss.ts
│ │ └── useFlowState.ts
│ │
│ ├── progression/
│ │ ├── useAchievements.ts
│ │ ├── useDailyChallenge.ts
│ │ ├── useLocalStorage.ts
│ │ └── useSessionBonus.ts
│ │
│ └── feedback/
│ ├── useHapticRhythm.ts
│ ├── useSoundEffects.ts
│ └── useVisualFeedback.ts
│
├── services/
│ ├── storage/
│ │ ├── LocalStorageService.ts # AsyncStorage wrapper
│ │ ├── SecureStorage.ts # 암호화 저장
│ │ └── CacheService.ts # 임시 데이터
│ │
│ ├── progression/
│ │ ├── AchievementTracker.ts
│ │ ├── StreakManager.ts
│ │ └── CollectionManager.ts
│ │
│ └── analytics/
│ └── LocalAnalytics.ts # 로컬 플레이 패턴 분석
│
├── state/
│ ├── gameStore.ts # Zustand 게임 상태
│ ├── progressionStore.ts # 진행 상태
│ └── sessionStore.ts # 세션 상태
│
├── utils/
│ ├── game/
│ │ ├── matchAlgorithm.ts
│ │ ├── luckySystem.ts
│ │ ├── difficultyAdjuster.ts
│ │ └── seedGenerator.ts # 일일 도전 시드
│ │
│ └── psychological/
│ ├── flowStateDetector.ts
│ ├── frustrationDetector.ts
│ └── celebrationScaler.ts
│
└── constants/
├── gameConfig.ts
├── achievementConfig.ts
├── luckConfig.ts
└── progressionConfig.ts

🚀 구현 로드맵

Phase 1: 핵심 게임플레이 (1주)
TYPESCRIPT
const phase1 = {
priority: "CRITICAL",
features: [
"기본 매치-3 로직",
"Skia 기반 렌더링",
"기본 애니메이션",
"즉시 플레이 (온보딩 없음)"
],
deliverable: "플레이 가능한 기본 게임"
}

Phase 2: 중독성 메커니즘 (1주)
TYPESCRIPT
const phase2 = {
priority: "HIGH",
features: [
"럭키 매치 시스템",
"Near-miss 감지",
"콤보 & 연쇄 시스템",
"햅틱 리듬"
],
deliverable: "도파민 유발 시스템"
}

Phase 3: 진행 시스템 (1주)
TYPESCRIPT
const phase3 = {
priority: "HIGH",
features: [
"로컬 업적",
"일일 도전",
"수집 요소",
"세션 보너스"
],
deliverable: "리텐션 시스템"
}

Phase 4: Flow 최적화 (3일)
TYPESCRIPT
const phase4 = {
priority: "MEDIUM",
features: [
"동적 난이도",
"플레이 패턴 분석",
"심리적 개입",
"celebration 스케일링"
],
deliverable: "몰입도 극대화"
}

Phase 5: 폴리싱 (3일)
TYPESCRIPT
const phase5 = {
priority: "MEDIUM",
features: [
"사운드 이펙트",
"파티클 최적화",
"성능 튜닝",
"A/B 테스트 준비"
],
deliverable: "출시 준비 완료"
}

💾 데이터 저장 전략

TYPESCRIPT
interface StorageStrategy {
AsyncStorage: {
// 영구 저장
data: ["achievements", "collections", "high_scores", "settings"],
encryption: false,
size: "~100KB"
},

MMKV: {
// 고속 저장 (선택적)
data: ["session_data", "temp_progress", "cache"],
encryption: true,
size: "~10KB"
},

InMemory: {
// 세션 데이터
data: ["current_game", "combo_streak", "session_bonus"],
encryption: false,
size: "~1KB"
}
}

🎯 KPI 목표 (백엔드 없이 측정)

TYPESCRIPT
const targetMetrics = {
day1Retention: "40%", // 로컬 저장 기반 측정
sessionLength: "15min", // 평균 세션 시간
sessionsPerDay: "5+", // 일일 플레이 횟수
uninstallRate: "<20%", // 첫 주 내

measurement: {
method: "local*analytics",
privacy: "완전*익명",
storage: "device_only"
}
}

이 통합 계획을 승인하시면 Phase 1부터 구현을 시작하겠습니다. 특별히 우선순위를 조정하고 싶은 기능이 있으신가요?
