import React, { useState, useEffect, useRef } from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Animated, Button} from 'react-native'
import Cave from '../components/Cave'
import Drone from '../components/Drone'
import AsyncStorage from '@react-native-community/async-storage'

const GameScreen = ({ playerName, difficulty }) => {
	const [caveData, setCaveData] = useState([])
	const dronePosition = useRef(new Animated.ValueXY({ x: 250, y: 0 })).current
	const [gameOver, setGameOver] = useState(false)
	const [score, setScore] = useState(0)
	const ws = useRef(null)
	
	useEffect(() => {
		initGameSession()
		return () => {
			ws.current && ws.current.close()
		}
	}, [])
	
	const initGameSession = async () => {
		try {
			console.log('Initializing game session...')
			const response = await fetch('https://cave-drone-server.shtoa.xyz/init', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: playerName, complexity: difficulty }),
			})
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const { id } = await response.json()
			console.log('Received player ID:', id)
			
			const tokenChunks = await Promise.all(
			  [1, 2, 3, 4].map((chunkNo) =>
				fetch(`https://cave-drone-server.shtoa.xyz/token/${chunkNo}?id=${id}`).then(
				  (res) => res.json()
				)
			  )
			)
			
			const token = tokenChunks.map((chunk) => chunk.chunk).join('')
			console.log('Received token:', token)
			
			ws.current = new WebSocket(`wss://cave-drone-server.shtoa.xyz/cave`)
			
			ws.current.onopen = () => {
				console.log('WebSocket connection opened')
				const authMessage = `player:${id}-${token}`
				ws.current.send(authMessage)
				console.log('Sent auth message:', authMessage)
			}
			
			ws.current.onmessage = (e) => {
				console.log('Raw WebSocket data:', e.data)
				
				if (e.data === 'finished') {
					console.log('Cave data transmission finished.')
					ws.current.close()
					return
				}
				const validFormat = /^-?\d+,-?\d+$/
				if (validFormat.test(e.data)) {
					const [left, right] = e.data.split(',').map(Number)
					const MAX_SEGMENTS = 50;
					
					setCaveData((prev) => {
						const updatedData = [...prev, `${left} ${right}`]
						if (updatedData.length > MAX_SEGMENTS) {
							updatedData.shift();  // Remove the oldest segment
						}
						console.log('Updated Cave Data:', updatedData)
						return updatedData
					});
				} else {
					console.log('Received unexpected data:', e.data)
				}
			}
			
			
			
			ws.current.onerror = (error) => {
				console.error('WebSocket error:', error)
			}
			
			ws.current.onclose = () => {
				console.log('WebSocket closed')
			}
		} catch (error) {
			console.error('Failed to initialize game session:', error)
		}
	}



	
	const handleCollision = () => {
		console.log('Collision detected')
		setGameOver(true)
		saveGameSession()
	}
	
	const saveGameSession = async () => {
		try {
			const sessions = JSON.parse(
			  (await AsyncStorage.getItem('gameSessions')) || '[]'
			)
			sessions.push({ playerName, difficulty, score })
			await AsyncStorage.setItem('gameSessions', JSON.stringify(sessions))
		} catch (error) {
			console.error('Failed to save game session:', error)
		}
	}

	const startMoving = (direction) => {
		let toValue
		switch (direction) {
			case 'left':
				toValue = { x: dronePosition.x._value - 100, y: dronePosition.y._value }
				break
			case 'right':
				toValue = { x: dronePosition.x._value + 100, y: dronePosition.y._value }
				break
			case 'up':
				toValue = { x: dronePosition.x._value, y: dronePosition.y._value - 100 }
				break
			case 'down':
				toValue = { x: dronePosition.x._value, y: dronePosition.y._value + 100 }
				break
		}
		
		Animated.timing(dronePosition, {
			toValue,
			duration: 1000,
			useNativeDriver: false,
		}).start(() => {
		})
	}
	
	const stopMoving = () => {
		Animated.timing(dronePosition).stop()
	}
	
	if (gameOver) {
		return (
		  <View style={styles.gameOver}>
			  <Text>Game Over! Score: {score}</Text>
			  <Button title="Go to Scoreboard" onPress={() => setGameOver(false)} />
		  </View>
		)
	}
	
	return (
	  <View style={styles.container}>
		  <Cave caveData={caveData} />
		  <Drone position={dronePosition} onCollision={handleCollision} />
		  <Text style={styles.score}>Score: {score}</Text>
		  
		  <View style={styles.controls}>
			  <View style={styles.controlRow}>
				  <TouchableOpacity
					style={styles.controlButton}
					onPressIn={() => startMoving('up')}
					onPressOut={stopMoving}
				  >
					  <Text style={styles.controlText}>↑</Text>
				  </TouchableOpacity>
			  </View>
			  <View style={styles.controlRow}>
				  <TouchableOpacity
					style={styles.controlButton}
					onPressIn={() => startMoving('left')}
					onPressOut={stopMoving}
				  >
					  <Text style={styles.controlText}>←</Text>
				  </TouchableOpacity>
				  <TouchableOpacity
					style={styles.controlButton}
					onPressIn={() => startMoving('right')}
					onPressOut={stopMoving}
				  >
					  <Text style={styles.controlText}>→</Text>
				  </TouchableOpacity>
			  </View>
			  <View style={styles.controlRow}>
				  <TouchableOpacity
					style={styles.controlButton}
					onPressIn={() => startMoving('down')}
					onPressOut={stopMoving}
				  >
					  <Text style={styles.controlText}>↓</Text>
				  </TouchableOpacity>
			  </View>
		  </View>
	  </View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ccc',
	},
	gameOver: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	score: {
		color: '#fff',
		position: 'absolute',
		top: 10,
		right: 10,
	},
	controls: {
		position: 'absolute',
		bottom: 50,
		left: '50%',
		transform: [{ translateX: -50 }],
	},
	controlRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 5,
	},
	controlButton: {
		backgroundColor: '#444',
		padding: 20,
		margin: 5,
		borderRadius: 5,
	},
	controlText: {
		color: '#fff',
		fontSize: 24,
	},
})

export default GameScreen
