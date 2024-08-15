import React from 'react'
import { Animated } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'

const Drone = ({ position }) => {
	return (
	  <Animated.View
		style={{
			position: 'absolute',
			transform: [{ translateX: position.x }, { translateY: position.y }],
		}}
	  >
		  <Svg height="50" width="50">
			  <Polygon points="25,0 50,50 0,50" fill="lime" stroke="purple" strokeWidth="1" />
		  </Svg>
	  </Animated.View>
	)
}

export default Drone
