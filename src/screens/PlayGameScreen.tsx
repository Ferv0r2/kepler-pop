import React, { FC, useState } from 'react'
import styled from 'styled-components/native'
import { GameBoard } from '@/components/GameBoard'
import { SafeAreaView } from 'react-native-safe-area-context'

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`

const Header = styled.View`
  padding: 20px;
  align-items: center;
`

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`

const Score = styled.Text`
  font-size: 18px;
  color: #666;
`

const PlayGameScreen: FC = () => {
  const [score, setScore] = useState(0)

  const handleScoreChange = (points: number) => {
    setScore((prevScore) => prevScore + points)
  }
  return (
    <StyledSafeAreaView>
      <Header>
        <Title>Kepler Pop</Title>
        <Score>Score: {score}</Score>
      </Header>
      <GameBoard onScoreChange={handleScoreChange} />
    </StyledSafeAreaView>
  )
}

export default PlayGameScreen
