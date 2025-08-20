export const GRID_SIZE = 8
export const MIN_MATCH_COUNT = 3
export const TILE_SIZE = 40

export const CASUAL_MODE_MOVE_COUNT = 30
export const CHALLENGE_MODE_MOVE_COUNT = 20

export const ANIMATION_DURATION = 200
export const SHOW_EFFECT_TIME_MS = 1500
export const SHOW_HINT_TIME_MS = 2000
export const HINT_MOVE_INTERVAL_MS = 5000
export const SHOW_STREAK_MAINTAIN_TIME_MS = 3000

export const SCORE = {
  BASE: 10,
  COMBO_MULTIPLIER: 1.5,
  STREAK_MULTIPLIER: 1.2,
  TIER_MULTIPLIER: {
    1: 1,
    2: 2,
    3: 3,
  },
}

export const TILE_MAX_TIER = 3

// Lucky match configuration
export const LUCKY_CONFIG = {
  CRITICAL_HIT_CHANCE: 0.05,
  LUCKY_TILE_SPAWN_CHANCE: 0.02,
  MEGA_COMBO_THRESHOLD: 10,
  EFFECTS: {
    critical: {
      multiplier: 3,
      color: '#FFD700',
      effect: 'rainbow_explosion',
      sound: 'critical_hit',
    },
    bonus: {
      multiplier: 2,
      color: '#00FF00',
      effect: 'star_burst',
      sound: 'bonus_match',
    },
    mega: {
      multiplier: 5,
      color: '#FF00FF',
      effect: 'mega_explosion',
      sound: 'mega_combo',
    },
  },
}

// Near miss configuration
export const NEAR_MISS_CONFIG = {
  DETECTION_THRESHOLD: 1, // tiles away from match
  SLOWDOWN_DURATION: 500,
  MESSAGES: [
    'So close!',
    'Almost there!',
    'One more move!',
    'Nearly got it!',
  ],
}

// Session bonus configuration
export const SESSION_CONFIG = {
  STREAK_TIMEOUT_MS: 300000, // 5 minutes
  HOT_HAND_THRESHOLD: 3, // wins in a row
  RUSH_MODE_GAMES: 5,
  RUSH_MODE_TIME_MS: 600000, // 10 minutes
  MAX_BONUS_MULTIPLIER: 1.5,
  BONUS_INCREMENT: 0.05,
}