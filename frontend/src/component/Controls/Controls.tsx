import React, { useEffect, useState } from 'react';
import './Controls.css';
import * as interpret from '../../util/interpret';

interface ControlsProps {
	setInstructionBlocks: React.Dispatch<React.SetStateAction<interpret.InstructionBlock[]>>
}

const Controls: React.FunctionComponent<ControlsProps> = (props) => {

	const changeRunStatus = (runOrControls: string) => {

		const btn = document.getElementById('run');
		const active = btn.classList.contains('run-active');
		const running = btn.classList.contains('run-running');

		const back = document.getElementById('back');
		const play = document.getElementById('play');
		const forward = document.getElementById('forward');

		if (runOrControls === 'run' && active && !running) {
			if (document.getElementById('err-text')) {
				document.getElementById('err-text').remove();
			}

			let success = true;
			const blocks = interpret.createInstructionBlocks((document.getElementById("textarea") as any).value);

			blocks.forEach( instructionBlock => {

				instructionBlock.instructions.forEach(instr => {

					const checkResult = interpret.interpretOneCommand(instr.instrId, instr.text, false);
					if (checkResult.failure) {

						success = false;

						const errText = document.createElement('span');
						errText.setAttribute('id', 'err-text');
						errText.setAttribute('style', 'color: orange');
						const newContent = document.createTextNode('failure: ' + checkResult.msg);
						errText.appendChild(newContent);

						document.getElementById('console').insertBefore(errText, document.getElementById('textarea'));
					};
				});
			});

			if (success) {
				props.setInstructionBlocks(blocks);
				scrollToTop();
				btn.innerHTML = 'pause';
				btn.classList.add('run-running');
			};

		} else if(runOrControls === 'run' && running) {
			// toggle and show the back-play-forward btns
			btn.classList.remove('run-active');
			btn.classList.remove('run-running');
			btn.classList.remove('display-block');
			btn.classList.add('display-none');

			back.classList.remove('display-none');
			play.classList.remove('display-none');
			forward.classList.remove('display-none');
			back.classList.add('display-inline-block');
			play.classList.add('display-inline-block');
			forward.classList.add('display-inline-block');

		} else if (runOrControls === 'play') {
			btn.classList.remove('display-none');
			btn.classList.add('display-block');
			btn.classList.add('run-active');
			btn.classList.add('run-running');

			back.classList.remove('display-inline-block');
			play.classList.remove('display-inline-block');
			forward.classList.remove('display-inline-block');
			back.classList.add('display-none');
			play.classList.add('display-none');
			forward.classList.add('display-none');
		}
	};
	
	const scrollToTop = () => {
		try {
			document.getElementById('nav').scrollIntoView({ behavior: "smooth"});
		} catch (e) { // mobile safari does not support smooth scroll
			document.getElementById('nav').scrollIntoView();
		}
	};

	return (
		<>
		<div id="run" className="run" onClick={() => {if(document.getElementById('run').classList.length > 1) { changeRunStatus('run'); }}}>run</div>
		<div id="back" className="back" onClick={() => {scrollToTop(); changeRunStatus('back');}}>&lt;=</div>
		<div id="play" className="play" onClick={() => {scrollToTop(); changeRunStatus('play');}}>play</div>
		<div id="forward" className="forward" onClick={() => {scrollToTop(); changeRunStatus('forward');}}>=></div>
		</>
	);

}

export default Controls;