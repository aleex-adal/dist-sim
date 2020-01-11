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
	}, []);

	useEffect(() => {
		if (props.net) {
			generateNodes(props.net.numNodes);
			insertAnimations(props.net.numNodes);

			var div = document.getElementById('msg');

			setTimeout( () => {
				div.style.animation = 'id0to6 0.5s ease-out forwards';
			}, 0);
		}
	}, [props.net]);

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

			var radius = (document.getElementById("circle-wrapper").offsetWidth / 2) + 'px';

			document.getElementById('circle-wrapper').append(newDiv);
			document.getElementById(i.toString()).style.transform = "rotate(-90deg) rotate(" + deg + "deg) translate(" + radius + ") rotate(-" + deg + "deg) rotate(90deg)";
			document.getElementById(i.toString()).style.lineHeight = document.getElementById(i.toString()).offsetWidth - 2 + 'px'; // reset line height, - 2 is border width

			document.getElementById(i.toString()).addEventListener('click', (ev) => {props.getNodeInfo(i)});
		}

		const edges = [];
		const subtractByTop = document.getElementById('0').getBoundingClientRect().top;
		const subtractByLeft = (document.getElementById('0').getBoundingClientRect().left) - 229; // trial and error baby
		var width = document.getElementById("sim-wrapper").offsetWidth;
		var height = document.getElementById("sim-wrapper").offsetHeight;

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

					let x1 = document.getElementById(node.id.toString()).getBoundingClientRect().left;
					let y1 = document.getElementById(node.id.toString()).getBoundingClientRect().top - subtractByTop;

					let x2 = document.getElementById(connection.toString()).getBoundingClientRect().left;
					let y2 = document.getElementById(connection.toString()).getBoundingClientRect().top - subtractByTop;;

					if ( height < width) { x1 -= subtractByLeft; x2 -= subtractByLeft; y1 += 2; y2 += 2 }

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

		// setTimeout( () => document.getElementById('msg').style.animation = 'msg1 1s linear forwards', 3000);		
	};

	const insertAnimations = (numNodes: number) => {
		const subtractBy = document.getElementById('0').getBoundingClientRect().top;
		const msgWidth = parseInt(getComputedStyle(document.getElementById('0')).width);
		var width = document.getElementById("sim-wrapper").offsetWidth;
		var height = document.getElementById("sim-wrapper").offsetHeight;

		for (let i = 0; i < numNodes; i++) {
			for (let j = 0; j < numNodes; j++) {
				if (i === j) {
					continue;
				}

				let x1, x2, y1, y2;
				if ( height >= width) {
					x1 = document.getElementById(i.toString()).getBoundingClientRect().left - (msgWidth/2);
					y1 = document.getElementById(i.toString()).getBoundingClientRect().top - subtractBy - (msgWidth/2);
	
					x2 = document.getElementById(j.toString()).getBoundingClientRect().left - (msgWidth/2);
					y2 = document.getElementById(j.toString()).getBoundingClientRect().top - subtractBy - (msgWidth/2);
				} else {
					/// this doesnt work lol
					x1 = document.getElementById(i.toString()).getBoundingClientRect().left - 122; // trial and error baby
					y1 = document.getElementById(i.toString()).getBoundingClientRect().top - 68;
	
					x2 = document.getElementById(j.toString()).getBoundingClientRect().left - 122;
					y2 = document.getElementById(j.toString()).getBoundingClientRect().top - 68;
				}
				
				// going right or left
				if (x2 - x1 > 0)      { x1 += Math.round(msgWidth/4); x2 -= Math.round(msgWidth/4); }				
				else if (x2 - x1 < 0) { x1 -= Math.round(msgWidth/4); x2 += Math.round(msgWidth/4); }

				// going down or up
				if (y2 - y1 > 0)      { y1 += Math.round(msgWidth/4); y2 -= Math.round(msgWidth/4); }
				else if (y2 - y1 < 0) { y1 -= Math.round(msgWidth/4); y2 += Math.round(msgWidth/4); }


				(document.styleSheets[0] as any).insertRule(
					`@keyframes id${i}to${j} { from{ left:${x1}px; top:${y1}px   } to{ left:${x2}px; top:${y2}px } }`
				);
			}
		}

		const msg = document.createElement('div');
		msg.setAttribute('class', 'msg');
		msg.setAttribute('id', 'msg');
		document.getElementById('circle-wrapper').insertBefore(msg, document.getElementById('0'));
	};

	

	return (
		<div id="sim-wrapper" className="sim-wrapper">
		<div id="circle-wrapper" className="circle-wrapper">

		</div>
		</div>
	);
}

export default Sim;