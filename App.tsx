import React, { FC } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import LoadingScreen from '@/screens/LoadingScreen'
import MainScreen from '@/screens/MainScreen'
// import AvatarScreen from '@/screens/AvatarScreen'
// import SettingsScreen from '@/screens/SettingsScreen'
import PlayGameScreen from '@/screens/PlayGameScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export type RootStackParamList = {
  Loading: undefined
  Main: undefined
  Avatar: undefined
  Settings: undefined
  Game: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const App: FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Loading"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Game" component={PlayGameScreen} />
          {/* <Stack.Screen name="Avatar" component={AvatarScreen} /> */}
          {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App
