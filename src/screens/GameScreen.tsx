import React from 'react'
import { SafeAreaView } from 'react-native'
import { GameBoard } from '@/components/GameBoard'

const GameScreen = () => {
  return (
    <SafeAreaView>
      <GameBoard />
    </SafeAreaView>
  )
}

export default GameScreen
