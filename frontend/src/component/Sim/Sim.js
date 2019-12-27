import React, { useState, useEffect } from 'react';
import './Sim.css';

const Sim = (props) => {
	const circleRef = React.createRef();

	useEffect(() => {
		var width = document.getElementById("sim-wrapper").offsetWidth;
		var height = document.getElementById("sim-wrapper").offsetHeight;

		// screen is tall
		if (height > width) {
			var circleRadius = document.getElementById("circle-wrapper").offsetWidth;

			document.documentElement.style.setProperty(
				'--circle-wrapper-height', 
				circleRadius + 'px'
			);

			// set padding to center vertically
			// document.documentElement.style.setProperty(
			// 	'--sim-wrapper-vertical-padding',
			// 	((document.getElementById("sim-wrapper").offsetHeight - circleRadius) / 2) + 'px'
			// )

		// screen is wide
		} else if (height < width) {
			document.documentElement.style.setProperty(
				'--circle-wrapper-width', 
				document.getElementById("circle-wrapper").offsetHeight + 'px'
			);
		}
	}, []);

  return (
  	<div id="sim-wrapper" className="sim-wrapper">
      <div id="circle-wrapper" ref={circleRef} className="circle-wrapper">
			
      </div>
    </div>
	)

}

export default Sim;