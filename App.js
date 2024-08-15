import React from 'react'
import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import store from './store'
import GameScreen from './screens/GameScreen'
import ScoreboardScreen from "./screens/ScoreBoardScreen";
// import ScoreboardScreen from './screens/ScoreboardScreen'

const Stack = createNativeStackNavigator()

const App = () => {
    return (
      <Provider store={store}>
          <NavigationContainer>
              <Stack.Navigator initialRouteName="Game">
                  <Stack.Screen name="Game" options={{headerShown:false}} component={GameScreen} />
                    <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
              </Stack.Navigator>
          </NavigationContainer>
      </Provider>
    )
}

export default App
