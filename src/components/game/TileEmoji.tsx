import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { getTileConfig } from '@/constants/tileConfig'
import type { TileType } from '@/types/game.types'

interface TileEmojiProps {
  type: TileType
  size: number
  x?: number
  y?: number
}

export const TileEmoji: React.FC<TileEmojiProps> = ({ type, size, x = 0, y = 0 }) => {
  const config = getTileConfig(type)
  
  const containerStyle = x !== 0 || y !== 0 ? {
    position: 'absolute' as const,
    left: x,
    top: y,
    width: size,
    height: size,
  } : {
    width: size,
    height: size,
  }
  
  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.emoji, { fontSize: size * 0.8 }]}>
        {config.emoji}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
})