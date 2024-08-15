import React, { useState } from 'react'
import { View, Button, TextInput, StyleSheet } from 'react-native'
import GameScreen from "./screens/GameScreen";


const App = () => {
    const [playerName, setPlayerName] = useState('')
    const [difficulty, setDifficulty] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    
    const startGame = () => {
        setGameStarted(true)
    }
    
    return (
      <View style={styles.container}>
          {!gameStarted ? (
            <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={playerName}
                  onChangeText={setPlayerName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter difficulty (0-10)"
                  keyboardType="numeric"
                  value={String(difficulty)}
                  onChangeText={(text) => setDifficulty(Number(text))}
                />
                <Button title="Start Game" onPress={startGame} />
            </>
          ) : (
            <GameScreen playerName={playerName} difficulty={difficulty} />
          )}
      </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        borderWidth: 1,
        padding: 8,
        marginBottom: 12,
    },
})

export default App
