import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import GameScreen from '@/screens/GameScreen'

const Stack = createStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Match 3 Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
