import React from 'react'
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import { GameBoard } from './src/components/GameBoard'
import { LinearGradient } from 'react-native-linear-gradient'

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#FFD1FF', '#FAD0C4', '#C1E3FF']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <GameBoard />
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
})

export default App
