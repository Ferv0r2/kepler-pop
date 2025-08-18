import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SkiaBoard } from '@/components/SkiaBoard'
import { useAppStore } from '@/state/store'

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets()
  const { count, increment } = useAppStore()

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <Text style={styles.title}>Kepler Pop</Text>
      <Text style={styles.subtitle}>React Native + Skia + Reanimated</Text>
      <View style={styles.boardContainer}>
        <SkiaBoard />
      </View>
      <View style={styles.footer}>
        <Text style={styles.countText}>Count: {count}</Text>
        <Text style={styles.instructionText} onPress={increment}>
          Tap to increment
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  boardContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#0ff',
    textDecorationLine: 'underline',
  },
})