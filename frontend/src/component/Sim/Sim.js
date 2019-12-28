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

			var width = (document.getElementById("circle-wrapper").offsetWidth / 2) + 'px';

			document.getElementById('circle-wrapper').append(newDiv);
			document.getElementById(i).style.transform = "rotate(-90deg) rotate(" + deg + "deg) translate(" + width + ") rotate(-" + deg + "deg) rotate(90deg)";
			document.getElementById(i).style.lineHeight = document.getElementById(i).offsetWidth - 2 + 'px'; // reset line height, - 2 is border width
		}

		// test, connect 0 with 3
		var cxZero = document.getElementById('0').getBoundingClientRect().left;

		var subtractBy = document.getElementById('0').getBoundingClientRect().top;
		var cyZero = document.getElementById('0').getBoundingClientRect().top - subtractBy;

		var cxThree = document.getElementById('3').getBoundingClientRect().left;
		var cyThree = document.getElementById('3').getBoundingClientRect().top - subtractBy;

		console.log('0: ' + cxZero + ' ' + cyZero + ', 3: ' + cxThree + ' ' + cyThree);
	};

	return (
  	<div id="sim-wrapper" className="sim-wrapper">
      <div id="circle-wrapper" className="circle-wrapper">
	  	<svg width="500" height="500"><line x1="179.71875" y1="0" x2="351.38446044921875" y2="236.277587890625" stroke="black"/></svg>

      </div>
    </div>
	)

}

export default Sim;