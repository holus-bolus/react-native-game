import React from 'react'
import { View, Text, Button, StyleSheet, Modal } from 'react-native'

const Popup = ({ visible, onClose, title, message }) => {
	return (
	  <Modal
		visible={visible}
		transparent
		animationType="slide"
		onRequestClose={onClose}
	  >
		  <View style={styles.modalContainer}>
			  <View style={styles.modalContent}>
				  <Text style={styles.title}>{title}</Text>
				  <Text style={styles.message}>{message}</Text>
				  <Button title="Close" onPress={onClose} />
			  </View>
		  </View>
	  </Modal>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		width: 300,
		padding: 20,
		backgroundColor: '#fff',
		borderRadius: 10,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	message: {
		fontSize: 16,
		marginBottom: 20,
	},
})

export default Popup
