import React, { useEffect, useState } from 'react';
import './Sim.css';
import Network from '../../model/Network';
import { Instruction, buildNodeInfoString } from '../../util/interpret';

interface SimProps {
	net: Network;
	getNodeInfo: (id: number) => void;
	getPayloadInfo: (apiResIndex: number, msgId: string) => void;
	apiResponse: any;
	setApiResponse: React.Dispatch<any>;
	sentInstructions: Instruction[][];
	setSentInstructions: React.Dispatch<React.SetStateAction<Instruction[][]>>;
	setFinishedExecuting: React.Dispatch<React.SetStateAction<boolean>>;

	// so sim can update shown info for "silent" updates like datarange changes during the sim
	network: Network;
	mostRecentNodeInfo: Map<number, string>;

	rerenderSim: boolean;
 }

const Sim: React.FunctionComponent<SimProps> = (props) => {

	const [ instructionBlockToExecute, setInstructionBlockToExecute ] = useState(undefined as number);

	useEffect( () => {

		if (props.rerenderSim) {
			sizeOuterCircle();
			generateNodes(props.net.numNodes);
			insertAnimations(props.net.numNodes);
		}

	}, [props.rerenderSim]);

	useEffect(() => {

		// TODO: make this work for resizing too
		// window.addEventListener('resize', sizeOuterCircle);
		sizeOuterCircle();
	}, []);

	useEffect(() => {
		if (props.net) {
			generateNodes(props.net.numNodes);
			insertAnimations(props.net.numNodes);
		}
	}, [props.net]);

	useEffect( () => {
		if (!props.apiResponse || instructionBlockToExecute !== undefined) {
			return;
		}

		console.log('received api response! ', props.apiResponse);
		props.setFinishedExecuting(false);
		setInstructionBlockToExecute(0);
		
	}, [props.apiResponse]);

	useEffect( () => {
		if (instructionBlockToExecute === undefined) {
			return;
		}

		if (instructionBlockToExecute === props.sentInstructions.length) {
			console.log('executed all blocks!');
			props.setFinishedExecuting(true);
			setInstructionBlockToExecute(undefined); // reset ibToExecute

			// fill map with current node data to capture info from silent changes such as
			// datarange update notifications on insert (seen in clocks of all nodes)
			for (let i = 0; i < props.network.numNodes; i++) {
				props.mostRecentNodeInfo.set(i, buildNodeInfoString(props.network.getNode(i)));
			}
			return;
		}

		const instrToExecute = props.sentInstructions[instructionBlockToExecute];

		instrToExecute.forEach( instr => {
			const instrId = instr.instrId;
			
			for (let i = 0; i < props.apiResponse.length; i++ ) {
				if (props.apiResponse[i].instrId === instrId) {
					executeApiResponse(props.apiResponse, i, document.getElementById('run').innerHTML === 'wait');
					break;
				}
			}

		});

		// this is basically manipulating app state by looking directly at the dom...
		// goal is to pause the initial run button click. really bad obviously
		// the only other relevant code is in controls run button click function
		if (document.getElementById('run').innerHTML === 'wait') {
			document.getElementById('run').innerHTML = 'pause';
		}

	}, [instructionBlockToExecute]);

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
		const nodeDiameter = document.getElementById('circle-wrapper').offsetWidth / 7;
		document.documentElement.style.setProperty('--node-diameter', nodeDiameter + 'px');

		for (let i = 0; i < num; i++) {
			const newDiv = document.createElement('div');
			newDiv.setAttribute('class', 'dot');
			newDiv.setAttribute('id', i.toString());
			const newContent = document.createTextNode(i.toString());
			newDiv.appendChild(newContent);

			const deg = (360 / num) * i;

			var radius = (document.getElementById("circle-wrapper").offsetWidth / 2) + 'px';

			// if this is the second render, remove the already existing node
			if (document.getElementById(i.toString())) {
				document.getElementById(i.toString()).remove();
			}

			document.getElementById('circle-wrapper').append(newDiv);
			document.getElementById(i.toString()).style.transform = "rotate(-90deg) rotate(" + deg + "deg) translate(" + radius + ") rotate(-" + deg + "deg) rotate(90deg)";
			document.getElementById(i.toString()).style.lineHeight = document.getElementById(i.toString()).offsetWidth - 2 + 'px'; // reset line height, - 2 is border width

			document.getElementById(i.toString()).addEventListener('click', (ev) => {props.getNodeInfo(i)});
		}

		const edges = [];
		
		props.net.nodeMap.forEach(node => {
			node.connections.forEach( connection => {
				if (edges.findIndex(
					elem => (elem[0] === node.id && elem[1] === connection) || (elem[1] === node.id && elem[0] === connection)
				) < 0) {

					// add the edge to edges, create new line on the svg
					const newLine = connect(document.getElementById(node.id.toString()), document.getElementById(connection.toString()));
					document.getElementById('sim-wrapper').insertBefore(newLine, document.getElementById('circle-wrapper'));

				}
			});
		});
		
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
				
					x1 = document.getElementById(i.toString()).getBoundingClientRect().left + window.pageXOffset;
					y1 = document.getElementById(i.toString()).getBoundingClientRect().top + window.pageYOffset;
	
					x2 = document.getElementById(j.toString()).getBoundingClientRect().left + window.pageXOffset;
					y2 = document.getElementById(j.toString()).getBoundingClientRect().top + window.pageYOffset;
				
				
				// // going right or left
				// if (x2 - x1 > 0)      { x1 += Math.round(msgWidth/4); x2 -= Math.round(msgWidth/4); }				
				// else if (x2 - x1 < 0) { x1 -= Math.round(msgWidth/4); x2 += Math.round(msgWidth/4); }

				// // going down or up
				// if (y2 - y1 > 0)      { y1 += Math.round(msgWidth/4); y2 -= Math.round(msgWidth/4); }
				// else if (y2 - y1 < 0) { y1 -= Math.round(msgWidth/4); y2 += Math.round(msgWidth/4); }


				(document.styleSheets[0] as any).insertRule(
					`@keyframes id${i}to${j} { from{ left:${x1}px; top:${y1}px   } to{ left:${x2}px; top:${y2}px } }`
				);

				(document.styleSheets[0] as any).insertRule(
					`.msg${i}to${j} { left:${x1}px; top:${y1}px }`
				);
			}
		}
	};

	const executeApiResponse = (apiResponse: [{
		instrId: number,
		nodeId: number,
		dir: string,
		msg: string,
		payload: any,
		nodeInfoString: string,
		networkLatency?: number,
		additionalDelay?: number,
		done: boolean,
	}], i: number, pauseFirstAnimations?: boolean) => {

		console.log('executing ' + i);
		for (let ind = i-1; ind >= 0; --ind) {
			if (apiResponse[ind].done === false) {
				console.log('out of order, waiting for correct thing to execute');
				setTimeout(() => executeApiResponse(apiResponse, i), 500);
				return;
			}
		}

		if (i === apiResponse.length) {
			console.log('does this ever happen?');
			return;
		}

		const thisMsg = apiResponse[i];
		if (thisMsg.dir === 'recv' && thisMsg.msg.includes('original')) {
			console.log('finished instr ' + thisMsg.instrId);
			thisMsg.done = true;

			// emit apiResponse progression (separate from instruction progression)
			props.setApiResponse(JSON.parse(JSON.stringify(apiResponse)));

			// barrier synchronization
			const allInstr = props.sentInstructions;
			const thisBlock = allInstr[instructionBlockToExecute];
			const thisInstr = thisBlock.findIndex((inst) => inst.instrId === thisMsg.instrId);
			
			if (thisInstr >= 0) {
				thisBlock[thisInstr].done = true;
			}

			let thisBlockDone = true;
			for (let i = 0; i < thisBlock.length; i++) {
				if (!thisBlock[i].done) { thisBlockDone = false; }
			}

			// update sentInstructions so that the console can display properly
			props.setSentInstructions(JSON.parse(JSON.stringify(allInstr)));

			// execute the next block
			if (thisBlockDone) {
				setInstructionBlockToExecute(instructionBlockToExecute + 1);
			}
			return;
		}

		// ending the updateDataRange messages
		if (thisMsg.dir === 'recv' && thisMsg.msg.includes('final') && thisMsg.msg.includes('updateDataRange')) {
			console.log('finished instr ' + thisMsg.instrId);
			thisMsg.done = true;

			// emit apiResponse progression (separate from instruction progression)
			props.setApiResponse(JSON.parse(JSON.stringify(apiResponse)));

			return;
		}

		let next = i + 1;
		while (apiResponse[next].instrId !== apiResponse[i].instrId) {
			next++;
		} 

		const nextMsg = apiResponse[next];

		// ie. reading data on the same node
		if (nextMsg.nodeId === thisMsg.nodeId) {
			thisMsg.done = true;

			// emit apiResponse progression (separate from instruction progression)
			props.setApiResponse(JSON.parse(JSON.stringify(apiResponse)));

			executeApiResponse(apiResponse, next);
			return;
		}

		if (thisMsg.msg.includes('initial payload') ||
			(thisMsg.dir === 'send' && thisMsg.msg.includes('middle')) ||
			(thisMsg.dir === 'send' && thisMsg.msg.includes('final'))
		) {	
			let delay = 1 + (nextMsg.networkLatency/100) + (nextMsg.additionalDelay/100);

			const msg = document.createElement('div');
			const msgId = `instr_${thisMsg.instrId}_msg${thisMsg.nodeId}to${nextMsg.nodeId}_apiresindex_${i}`;
			msg.setAttribute('class', `msg msg${thisMsg.nodeId}to${nextMsg.nodeId}`);
			msg.setAttribute('id', msgId);
			document.getElementById('sim-wrapper').appendChild(msg);
			const div = document.getElementById(msgId);
			div.style.height = document.getElementById('0').offsetHeight + 'px';
			div.style.width = document.getElementById('0').offsetWidth + 'px';
			div.style.lineHeight = div.offsetHeight.toString() + 'px';

			if (pauseFirstAnimations) {
				div.style.animation = `id${thisMsg.nodeId}to${nextMsg.nodeId} ${delay}s linear forwards paused`;

			} else {
				div.style.animation = `id${thisMsg.nodeId}to${nextMsg.nodeId} ${delay}s linear forwards`;
			}

			div.addEventListener('animationend', () => {
				console.log(`Animation ${msgId} ended`);
				div.remove();
				executeApiResponse(apiResponse, next);
			});

			div.addEventListener('click', () => props.getPayloadInfo(i, msgId));

			thisMsg.done = true;

			// emit apiResponse progression (separate from instruction progression)
			props.setApiResponse(JSON.parse(JSON.stringify(apiResponse)));

			return;
		}

		if ((thisMsg.dir === 'recv' && thisMsg.msg.includes('middle')) ||
			(thisMsg.dir === 'recv' && thisMsg.msg.includes('final'))
		) {
			thisMsg.done = true;

			// emit apiResponse progression (separate from instruction progression)
			props.setApiResponse(JSON.parse(JSON.stringify(apiResponse)));

			
			return executeApiResponse(apiResponse, next);
		}
	}


	function getOffset( el ) {
		var rect = el.getBoundingClientRect();
		return {
			left: rect.left + window.pageXOffset,
			top: rect.top + window.pageYOffset,
			width: rect.width || el.offsetWidth,
			height: rect.height || el.offsetHeight
		};
	}
	
	function connect(div1: HTMLElement, div2: HTMLElement): HTMLElement { // draw a line connecting elements
		const thickness = 2;

		var off1 = getOffset(div1);
		var off2 = getOffset(div2);
		// middle
		var x1 = off1.left + (off1.width / 2);
		var y1 = off1.top + (off1.height / 2);
		// middle
		var x2 = off2.left + (off2.width / 2);
		var y2 = off2.top + (off2.height / 2);
		// distance
		var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
		// center
		var cx = ((x1 + x2) / 2) - (length / 2);
		var cy = ((y1 + y2) / 2) - (thickness / 2);
		// angle
		var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
		
		const newLine = document.createElement('div');
		newLine.style.padding = '0px';
		newLine.style.margin = '0px';
		newLine.style.height = '2px';
		newLine.style.backgroundColor = '#282c34';
		newLine.style.lineHeight = '1px';
		newLine.style.position = 'absolute';
		newLine.style.left = cx + 'px';
		newLine.style.top = cy + 'px';
		newLine.style.width = length + 'px';
		newLine.style.transform = 'rotate(' + angle + 'deg)';

		return newLine as HTMLElement;
	}


	return (
			<div id="sim-wrapper" className="sim-wrapper">
				<div id="circle-wrapper" className="circle-wrapper">

				</div>
			</div>
	);
}

export default Sim;