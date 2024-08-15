import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions, TextInput, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { endGame, resetGame, startGame } from '../store';
import Popup from "../components/Popup";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = ({ navigation }) => {
	const [dronePosition, setDronePosition] = useState({ x: screenWidth / 2 - 10, y: 50 });
	const [caveData, setCaveData] = useState([]);
	const [showStartPopup, setShowStartPopup] = useState(true);
	const [showEndPopup, setShowEndPopup] = useState(false);
	const [playerName, setPlayerName] = useState('');
	const [difficulty, setDifficulty] = useState(5);
	const dispatch = useDispatch();
	const gameStatus = useSelector((state) => state.game.gameStatus);
	const movementInterval = useRef(null);
	const wsRef = useRef(null);
	
	const fetchPlayerToken = async (playerId) => {
		try {
			const tokenChunks = await Promise.all(
			  [1, 2, 3, 4].map((chunkNo) =>
				fetch(`https://cave-drone-server.shtoa.xyz/token/${chunkNo}?id=${playerId}`)
				.then((res) => res.json())
				.then((data) => data.chunk)
			  )
			);
			return tokenChunks.join('');
		} catch (error) {
			console.error('Failed to fetch token:', error);
			return null;
		}
	};
	
	const closeEndPopup = () => {
		setShowEndPopup(false);
		dispatch(resetGame());
		setShowStartPopup(true);
	};
	
	const initializeGame = async () => {
		const playerId = await startNewGame();
		if (playerId) {
			const token = await fetchPlayerToken(playerId);
			if (token) {
				wsRef.current = new WebSocket('wss://cave-drone-server.shtoa.xyz/cave');
				wsRef.current.onopen = () => {
					wsRef.current.send(`player:${playerId}-${token}`);
					console.log('WebSocket connection opened.');
				};
				
				wsRef.current.onmessage = (event) => {
					const data = event.data.split(',');
					const left = parseInt(data[0], 10);
					const right = parseInt(data[1], 10);
					
					if (!isNaN(left) && !isNaN(right)) {
						console.log('Received cave segment:', { left, right });
						setCaveData((prevData) => [...prevData, { left, right }]);
					} else {
						console.error('Invalid cave data received:', event.data);
					}
				};
				
				wsRef.current.onerror = (error) => {
					console.error('WebSocket Error:', error);
				};
				
				wsRef.current.onclose = (event) => {
					if (event.code !== 1000) {
						console.error(`WebSocket closed with code ${event.code}: ${event.reason}`);
					}
				};
				
				return () => {
					if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
						wsRef.current.close(1000, 'Client closing connection');
					}
				};
			}
		}
	};
	
	useEffect(() => {
		initializeGame();
		
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, []);
	
	const startNewGame = async () => {
		if (!playerName.trim()) {
			alert('Please enter a valid name before starting the game.');
			setShowStartPopup(true);
			return;
		}
		
		if (difficulty < 0 || difficulty > 10) {
			alert('Please select a difficulty between 0 and 10.');
			setShowStartPopup(true);
			return;
		}
		
		dispatch(startGame({ name: playerName, difficulty }));
		setShowStartPopup(false);
		setCaveData([]); // Reset cave data when starting a new game
		
		try {
			const requestBody = JSON.stringify({ name: playerName, complexity: difficulty });
			
			const response = await fetch('https://cave-drone-server.shtoa.xyz/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: requestBody,
			});
			
			if (response.ok) {
				const data = await response.json();
				return data.id;
			} else {
				console.error('Unexpected response format:', await response.text());
				return null;
			}
		} catch (error) {
			console.error('Failed to initialize game:', error);
		}
	};
	
	const renderCave = () => {
		if (!caveData.length) {
			return null;
		}
		
	
		const startIndex = Math.max(0, Math.floor((dronePosition.y - 500) / 10));
		const endIndex = Math.min(caveData.length, Math.floor(dronePosition.y / 10));
		
		return caveData.slice(startIndex, endIndex).map((segment, index) => {
			const leftWall = segment.left;
			const rightWall = segment.right;
			const segmentTop = (startIndex + index) * 10 - dronePosition.y + 500;
			
			return (
			  <View
				key={index}
				style={{
					position: 'absolute',
					height: 10,
					backgroundColor: 'black',
					left: leftWall,
					width: rightWall - leftWall,
					top: segmentTop,
				}}
			  />
			);
		});
	};

	
	const startMovingDrone = (direction) => {
		console.log(`Moving drone to the ${direction}`);
		movementInterval.current = setInterval(() => {
			setDronePosition((prev) => {
				const newX = direction === 'left' ? prev.x - 5 : prev.x + 5;
				const newY = prev.y + 1; // Move drone downwards to simulate cave movement
				
				if (newX < 0 || newX > screenWidth - 20) {
					return prev;
				}
				
				return {
					x: newX,
					y: newY,
				};
			});
		}, 50);
	};
	
	const stopMovingDrone = () => {
		console.log("Stopping drone movement");
		if (movementInterval.current) {
			clearInterval(movementInterval.current);
		}
	};
	
	return (
	  <View style={styles.container}>
		  <View style={styles.gameArea}>
			  {renderCave()}
			  <View style={[styles.drone, { left: dronePosition.x, top: dronePosition.y % screenHeight }]} />
		  </View>
		  <View style={styles.controls}>
			  <Pressable
				style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
				onPressIn={() => startMovingDrone('left')}
				onPressOut={stopMovingDrone}
			  >
				  <Text style={styles.controlButtonText}>Left</Text>
			  </Pressable>
			  <Pressable
				style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
				onPressIn={() => startMovingDrone('right')}
				onPressOut={stopMovingDrone}
			  >
				  <Text style={styles.controlButtonText}>Right</Text>
			  </Pressable>
		  </View>
		  <Modal visible={showStartPopup} animationType="slide">
			  <View style={styles.modalContainer}>
				  <Text style={styles.modalTitle}>Start Game</Text>
				  <TextInput
					style={styles.input}
					placeholder="Enter your name"
					value={playerName}
					onChangeText={setPlayerName}
				  />
				  <TextInput
					style={styles.input}
					placeholder="Enter difficulty (0-10)"
					value={difficulty.toString()}
					onChangeText={(value) => setDifficulty(parseInt(value, 10))}
					keyboardType="numeric"
				  />
				  <Pressable style={styles.controlButton} onPress={startNewGame}>
					  <Text style={styles.controlButtonText}>Start</Text>
				  </Pressable>
			  </View>
		  </Modal>
		  <Popup
			visible={showEndPopup}
			title={gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
			message={gameStatus === 'won' ? 'You won!' : 'You lost!'}
			onClose={closeEndPopup}
		  />
	  </View>
	);
};

	
	const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#fff',
	},
	input: {
		width: '80%',
		padding: 10,
		backgroundColor: '#fff',
		marginBottom: 20,
		borderRadius: 5,
	},
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
		overflow: 'hidden',
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
		top: 50,
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
});


export default GameScreen;
