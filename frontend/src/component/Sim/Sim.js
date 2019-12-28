import React, { useEffect } from 'react';
import './Sim.css';

const Sim = (props) => {

	useEffect(() => {
		// TODO: make this work for resizing too
		// window.addEventListener('resize', sizeOuterCircle);
		sizeOuterCircle();
		generateNodes(10);
	}, []);

	const sizeOuterCircle = () => {
		var width = document.getElementById("sim-wrapper").offsetWidth;
		var height = document.getElementById("sim-wrapper").offsetHeight;

		// screen is tall
		if (height > width) {
			var circleDiameter = document.getElementById("circle-wrapper").offsetWidth;

			document.documentElement.style.setProperty(
				'--circle-wrapper-height', 
				circleDiameter + 'px'
			);

			// set padding to center vertically
			document.documentElement.style.setProperty(
				'--sim-wrapper-vertical-padding',
				((document.getElementById("sim-wrapper").offsetHeight - circleDiameter) / 2) + 'px'
			)

			// reset height to what it was originally
			document.getElementById("sim-wrapper").style.height = height + 'px';

		// screen is wide
		} else if (height < width) {
			document.documentElement.style.setProperty(
				'--circle-wrapper-width', 
				document.getElementById("circle-wrapper").offsetHeight + 'px'
			);
		}

	};

	const generateNodes = (num) => {
		// transform: rotate(-90deg) rotate(45deg) translate(150px) rotate(-45deg);

		for (let i = 0; i < num; i++) {
			const newDiv = document.createElement('div');
			newDiv.setAttribute('class', 'dot');
			newDiv.setAttribute('id', i);
			const newContent = document.createTextNode(i);
			newDiv.appendChild(newContent);

			const deg = (360 / num) * i;

			document.getElementById('circle-wrapper').append(newDiv);
			document.getElementById(i).style.transform = 'rotate(-90deg) rotate(' + deg + 'deg) translate(150px) rotate(-' + deg + 'deg) rotate(90deg)';
		}
	};

	return (
  	<div id="sim-wrapper" className="sim-wrapper">
      <div id="circle-wrapper" className="circle-wrapper">
			
      </div>
    </div>
	)

}

export default Sim;