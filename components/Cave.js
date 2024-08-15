import React from 'react'
import { Svg, Path } from 'react-native-svg'
import { View } from 'react-native'

const Cave = () => {
	const caveData = ['-100 100', '-120 120', '-140 140', '-160 160']
	const segmentHeight = 10
	const canvasWidth = 500
	
	const generateCavePath = () => {
		let path = ''
		
		caveData.forEach((segment, index) => {
			const [left, right] = segment.split(' ').map(Number)
			const yPosition = index * segmentHeight
			
			const leftX = (canvasWidth / 2) + left
			const rightX = (canvasWidth / 2) + right
			
			if (index === 0) {
				path += `M ${leftX},${yPosition} L ${rightX},${yPosition} `
			} else {
				path += `L ${leftX},${yPosition} L ${rightX},${yPosition} `
			}
		})
		
		console.log('Generated Cave Path:', path)
		return path
	}
	
	return (
	  <View style={{ flex: 1 }}>
		  <Svg height="100%" width="100%">
			  <Path
				d={generateCavePath()}
				fill="none"
				stroke="white"
				strokeWidth="2"
			  />
		  </Svg>
	  </View>
	)
}

export default Cave
