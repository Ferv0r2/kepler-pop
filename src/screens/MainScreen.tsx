import React, { FC } from 'react'
import styled from 'styled-components/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`

const Button = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
`

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
`

const MainScreen: FC<Props> = ({ navigation }) => {
  return (
    <StyledSafeAreaView>
      <Title>Kepler Pop 메인 화면</Title>
      <Button onPress={() => navigation.navigate('Avatar')}>
        <ButtonText>아바타 관리</ButtonText>
      </Button>
      <Button onPress={() => navigation.navigate('Settings')}>
        <ButtonText>설정</ButtonText>
      </Button>
      <Button onPress={() => navigation.navigate('Game')}>
        <ButtonText>게임 시작</ButtonText>
      </Button>
    </StyledSafeAreaView>
  )
}

export default MainScreen
