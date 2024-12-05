import React, { FC, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import styled from 'styled-components/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import { SafeAreaView } from 'react-native'

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #282c34;
`

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
`

const LoadingScreen: FC<Props> = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Main')
    }, 2000) // 2초 후 메인 화면으로 이동
  }, [navigation])

  return (
    <StyledSafeAreaView>
      <Title>Kepler Pop 로딩 중...</Title>
      <ActivityIndicator size="large" color="#00ff00" />
    </StyledSafeAreaView>
  )
}

export default LoadingScreen
