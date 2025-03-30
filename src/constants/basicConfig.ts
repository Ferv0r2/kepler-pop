// Game Config
export const BOARD_SIZE = 6
export const MAX_TILE_VALUE = 6
export const INITIAL_MOVES = 20

// UI
export const TILE_SIZE = 60
export const TILE_CONTENT_SIZE = 50
export const TILE_BORDER_RADIUS = 15
export const TILE_CONTENT_BORDER_RADIUS = 12

// Animation
export const ANIMATION_SPRING_CONFIG = {
  damping: 12,
  stiffness: 90,
}

export const ANIMATION_TIMING = {
  scale: {
    duration: 100,
  },
  match: {
    duration: 200,
  },
  swap: {
    duration: 300,
  },
  tile: {
    appear: 300,
    disappear: 200,
    press: 100,
    grow: 150,
    shrink: 200,
    restore: 150,
  },
  shimmer: {
    on: 150,
    off: 150,
  },
  cascade: {
    matchDisplay: 400,
    dropDelay: 350,
    newTileDelay: 150,
    newMatchCheck: 350,
    animationComplete: 250,
  },
  dropTileBounce: {
    damping: 15,
    stiffness: 120,
    mass: 1.2,
    overshootClamping: false,
  },
  safetyTimeout: 5000,
}

// UI Styles
export const UI_COLORS = {
  background: {
    primary: '#f8f9fa',
    secondary: '#e9ecef',
  },
  board: {
    background: 'rgba(255, 255, 255, 0.3)',
  },
  score: {
    text: '#ff6b6b',
  },
  moves: {
    text: '#4ecdc4',
  },
  button: {
    background: 'rgba(106, 5, 114, 0.8)',
  },
  tile: {
    values: [
      '#FF6B6B', // 1
      '#4ECDC4', // 2
      '#FFD166', // 3
      '#6A0572', // 4
      '#FF9A8B', // 5
      '#A5DEE5', // 6
    ],
  },
}

// Layout
export const LAYOUT = {
  padding: {
    container: 20,
    board: 15,
    panel: 15,
  },
  borderRadius: {
    panel: 20,
    board: 20,
    button: 30,
  },
  shadow: {
    panel: {
      offset: 3,
      radius: 10,
      opacity: 0.1,
    },
    board: {
      offset: 5,
      radius: 15,
      opacity: 0.2,
    },
    button: {
      offset: 3,
      radius: 5,
      opacity: 0.2,
    },
  },
}
