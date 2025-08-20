import type { TileType, TierType } from '@/types/game.types'

export interface TileConfig {
  type: TileType
  name: string
  colors: Record<TierType, string>
  emoji: string
  gradients: Record<TierType, string[]>
}

export const TILE_CONFIGS: Record<TileType, TileConfig> = {
  1: {
    type: 1,
    name: 'Crystal',
    emoji: '💎',
    colors: {
      1: '#9333EA',
      2: '#A855F7',
      3: '#C084FC',
    },
    gradients: {
      1: ['#9333EA', '#7C3AED'],
      2: ['#A855F7', '#9333EA'],
      3: ['#C084FC', '#A855F7'],
    },
  },
  2: {
    type: 2,
    name: 'Flame',
    emoji: '🔥',
    colors: {
      1: '#DC2626',
      2: '#EF4444',
      3: '#F87171',
    },
    gradients: {
      1: ['#DC2626', '#B91C1C'],
      2: ['#EF4444', '#DC2626'],
      3: ['#F87171', '#EF4444'],
    },
  },
  3: {
    type: 3,
    name: 'Leaf',
    emoji: '🍀',
    colors: {
      1: '#16A34A',
      2: '#22C55E',
      3: '#4ADE80',
    },
    gradients: {
      1: ['#16A34A', '#15803D'],
      2: ['#22C55E', '#16A34A'],
      3: ['#4ADE80', '#22C55E'],
    },
  },
  4: {
    type: 4,
    name: 'Water',
    emoji: '💧',
    colors: {
      1: '#0284C7',
      2: '#0EA5E9',
      3: '#38BDF8',
    },
    gradients: {
      1: ['#0284C7', '#0369A1'],
      2: ['#0EA5E9', '#0284C7'],
      3: ['#38BDF8', '#0EA5E9'],
    },
  },
  5: {
    type: 5,
    name: 'Star',
    emoji: '⭐',
    colors: {
      1: '#CA8A04',
      2: '#EAB308',
      3: '#FACC15',
    },
    gradients: {
      1: ['#CA8A04', '#A16207'],
      2: ['#EAB308', '#CA8A04'],
      3: ['#FACC15', '#EAB308'],
    },
  },
  6: {
    type: 6,
    name: 'Heart',
    emoji: '❤️',
    colors: {
      1: '#E11D48',
      2: '#F43F5E',
      3: '#FB7185',
    },
    gradients: {
      1: ['#E11D48', '#BE123C'],
      2: ['#F43F5E', '#E11D48'],
      3: ['#FB7185', '#F43F5E'],
    },
  },
}

export const getTileConfig = (type: TileType): TileConfig => {
  return TILE_CONFIGS[type]
}

export const getTileColor = (type: TileType, tier: TierType): string => {
  return TILE_CONFIGS[type].colors[tier]
}

export const getTileGradient = (type: TileType, tier: TierType): string[] => {
  return TILE_CONFIGS[type].gradients[tier]
}