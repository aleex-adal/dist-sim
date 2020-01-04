import React, { useEffect, useState } from 'react';
import './Sim.css';
import Network from '../../model/Network';

interface SimProps {
	net: Network
	getNodeInfo: (id: number) => void;
 }

const Sim: React.FunctionComponent<SimProps> = (props) => {

	useEffect(() => {
		// TODO: make this work for resizing too
		// window.addEventListener('resize', sizeOuterCircle);
		sizeOuterCircle();
		generateNodes(props.net.numNodes);
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
		for (let i = 0; i < num; i++) {
			const newDiv = document.createElement('div');
			newDiv.setAttribute('class', 'dot');
			newDiv.setAttribute('id', i.toString());
			const newContent = document.createTextNode(i.toString());
			newDiv.appendChild(newContent);

			const deg = (360 / num) * i;

			var width = (document.getElementById("circle-wrapper").offsetWidth / 2) + 'px';

			document.getElementById('circle-wrapper').append(newDiv);
			document.getElementById(i.toString()).style.transform = "rotate(-90deg) rotate(" + deg + "deg) translate(" + width + ") rotate(-" + deg + "deg) rotate(90deg)";
			document.getElementById(i.toString()).style.lineHeight = document.getElementById(i.toString()).offsetWidth - 2 + 'px'; // reset line height, - 2 is border width

			document.getElementById(i.toString()).addEventListener('click', (ev) => {props.getNodeInfo(i)});
		}

		const edges = [];
		const subtractBy = document.getElementById('0').getBoundingClientRect().top;

		let newSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		newSvg.setAttribute('width',  document.getElementById('circle-wrapper').offsetWidth.toString());
		newSvg.setAttribute('height', document.getElementById('circle-wrapper').offsetWidth.toString());
		newSvg.setAttribute('id', 'new-svg');

		props.net.nodeMap.forEach(node => {
			node.connections.forEach( connection => {
				if (edges.findIndex(
					elem => (elem[0] === node.id && elem[1] === connection) || (elem[1] === node.id && elem[0] === connection)
				) < 0) {
					// add the edge to edges, create new line on the svg
					edges.push([node.id, connection]);

					const x1 = document.getElementById(node.id.toString()).getBoundingClientRect().left;
					const y1 = document.getElementById(node.id.toString()).getBoundingClientRect().top - subtractBy;

					const x2 = document.getElementById(connection.toString()).getBoundingClientRect().left;
					const y2 = document.getElementById(connection.toString()).getBoundingClientRect().top - subtractBy;

					const newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
					newLine.setAttribute('x1', x1.toString());
					newLine.setAttribute('y1', y1.toString());
					newLine.setAttribute('x2', x2.toString());
					newLine.setAttribute('y2', y2.toString());
					newLine.setAttribute('stroke', '#282c34');
					newLine.setAttribute('stroke-width', '2px');

					newSvg.append(newLine);
				}
			});
		});
		
		document.getElementById('circle-wrapper').insertBefore(newSvg, document.getElementById('0'));
	};

	return (
		<div id="sim-wrapper" className="sim-wrapper">
		<div id="circle-wrapper" className="circle-wrapper">

		</div>
		</div>
	);
}

export default Sim;