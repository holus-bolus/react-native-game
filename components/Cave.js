import React from 'react'
import { Svg, Path } from 'react-native-svg'
import { View } from 'react-native'

const Cave = ({ caveData }) => {
	const segmentHeight = 100
	
	const generateCavePath = () => {
		if (caveData.length === 0) {
			return ''
		}
		
		let path = ''
		caveData.forEach((segment, index) => {
			const [left, right] = segment.split(' ').map(Number)
			const yPosition = index * segmentHeight
			
			const leftX = 250 + left
			const rightX = 250 + right
			
			if (index === 0) {
				path += `M ${leftX},${yPosition} L ${rightX},${yPosition} `
			} else {
				path += `L ${leftX},${yPosition} L ${rightX},${yPosition} `
			}
		})
		return path
	}
	
	
	return (
	  <View style={{ flex: 1 }}>
		  <Svg height="100%" width="100%" viewBox="0 0 500 1000">
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
