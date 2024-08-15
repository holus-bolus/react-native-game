import React from 'react'
import { useSelector } from 'react-redux'
import { View, Text, FlatList, StyleSheet } from 'react-native'

const ScoreboardScreen = () => {
	const scores = useSelector((state) => state.game.scores)
	
	return (
	  <View style={styles.container}>
		  <Text style={styles.title}>Scoreboard</Text>
		  <FlatList
			data={scores}
			keyExtractor={(item, index) => index.toString()}
			renderItem={({ item }) => (
			  <View style={styles.scoreItem}>
				  <Text>{item.name}</Text>
				  <Text>Difficulty: {item.difficulty}</Text>
				  <Text>Score: {item.score}</Text>
			  </View>
			)}
		  />
	  </View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	scoreItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
})

export default ScoreboardScreen
