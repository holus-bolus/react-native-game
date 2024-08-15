import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import Popup from '../components/Popup'
import { useDispatch, useSelector } from 'react-redux'
import { endGame, startGame } from '../store'

const GameScreen = ({ navigation }) => {
	const [dronePosition, setDronePosition] = useState({ x: 250, y: 50 })
	const [caveData, setCaveData] = useState([])
	const [showStartPopup, setShowStartPopup] = useState(true)
	const [showEndPopup, setShowEndPopup] = useState(false)
	const dispatch = useDispatch()
	const gameStatus = useSelector((state) => state.game.gameStatus)
	
	const startNewGame = (name, difficulty) => {
		dispatch(startGame({ name, difficulty }))
		setShowStartPopup(false)
	}
	
	const onGameEnd = (status) => {
		dispatch(endGame(status))
		setShowEndPopup(true)
	}
	
	const closeEndPopup = () => {
		setShowEndPopup(false)
		navigation.navigate('Scoreboard')
	}
	
	useEffect(() => {
		const ws = new WebSocket('wss://cave-drone-server.shtoa.xyz/cave')
		
		ws.onmessage = (event) => {
			const data = event.data.split(',')
			const left = parseInt(data[0], 10)
			const right = parseInt(data[1], 10)
			
			if (!isNaN(left) && !isNaN(right)) {
				setCaveData((prevData) => [...prevData, { left, right }])
			}
		}
		
		ws.onopen = () => {
			ws.send('player:[id]-[token]')
		}
		
		ws.onerror = (error) => {
			console.error('WebSocket Error: ', error)
		}
		
		ws.onclose = () => {
			console.log('WebSocket connection closed')
		}
		
		return () => ws.close()
	}, [])
	
	const moveDrone = (direction) => {
		setDronePosition(prev => ({
			...prev,
			x: direction === 'left' ? prev.x - 10 : prev.x + 10,
		}))
	}
	
	const renderCave = () => {
		return caveData.map((segment, index) => (
		  <View
			key={index}
			style={[
				styles.caveSegment,
				{ left: segment.left, width: segment.right - segment.left },
			]}
		  />
		))
	}
	
	return (
	  <View style={styles.container}>
		  <View style={styles.gameArea}>
			  {renderCave()}
			  <View style={[styles.drone, { left: dronePosition.x }]} />
		  </View>
		  <View style={styles.controls}>
			  <Pressable
				style={({ pressed }) => [
					styles.controlButton,
					pressed && styles.controlButtonPressed,
				]}
				onPress={() => moveDrone('left')}
			  >
				  <Text style={styles.controlButtonText}>Left</Text>
			  </Pressable>
			  <Pressable
				style={({ pressed }) => [
					styles.controlButton,
					pressed && styles.controlButtonPressed,
				]}
				onPress={() => moveDrone('right')}
			  >
				  <Text style={styles.controlButtonText}>Right</Text>
			  </Pressable>
		  </View>
		  <Popup
			visible={showStartPopup}
			title="Start Game"
			message="Enter your name and select difficulty"
			onClose={() => startNewGame('Player', 5)}
		  />
		  <Popup
			visible={showEndPopup}
			title={gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
			message={gameStatus === 'won' ? 'You won!' : 'You lost!'}
			onClose={closeEndPopup}
		  />
	  </View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	gameArea: {
		width: '100%',
		height: '80%',
		backgroundColor: '#ccc',
		position: 'relative',
	},
	caveSegment: {
		position: 'absolute',
		height: 10,
		backgroundColor: 'black',
	},
	drone: {
		position: 'absolute',
		width: 20,
		height: 20,
		backgroundColor: 'red',
		top: 0,
	},
	controls: {
		flexDirection: 'row',
		marginTop: 20,
	},
	controlButton: {
		padding: 15,
		backgroundColor: '#007BFF',
		borderRadius: 5,
		marginHorizontal: 10,
	},
	controlButtonPressed: {
		backgroundColor: '#0056b3',
	},
	controlButtonText: {
		color: '#fff',
		fontSize: 18,
	},
})

export default GameScreen
