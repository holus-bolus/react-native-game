import { configureStore, createSlice } from '@reduxjs/toolkit'

const initialState = {
	scores: [],
	currentPlayer: {
		name: '',
		difficulty: 0,
		score: 0,
	},
	gameStatus: 'idle',
}

const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		startGame: (state, action) => {
			state.currentPlayer.name = action.payload.name
			state.currentPlayer.difficulty = action.payload.difficulty
			state.currentPlayer.score = 0
			state.gameStatus = 'playing'
		},
		updateScore: (state, action) => {
			state.currentPlayer.score += action.payload
		},
		endGame: (state, action) => {
			state.gameStatus = action.payload
			if (action.payload === 'won') {
				state.scores.push({
					name: state.currentPlayer.name,
					difficulty: state.currentPlayer.difficulty,
					score: state.currentPlayer.score,
				})
			}
		},
		resetGame: (state) => {
			state.currentPlayer = initialState.currentPlayer
			state.gameStatus = 'idle'
		},
	},
})

export const { startGame, updateScore, endGame, resetGame } = gameSlice.actions

const store = configureStore({
	reducer: {
		game: gameSlice.reducer,
	},
})

export default store
