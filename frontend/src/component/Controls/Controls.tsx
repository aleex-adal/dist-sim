import React, { useEffect, useState } from 'react';
import './Controls.css';
import { compileFunction } from 'vm';

interface ControlsProps {

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
			btn.innerHTML = 'pause';
			btn.classList.add('run-running');
			compile((document.getElementById("textarea") as any).value);

		} else if (runOrControls === 'run' && running) {// toggle and show the back-play-forward btns
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
	
	const compile = (input: string) => {
		console.log('received string: ' + input);
	}

	return (
		<>
		<div id="run" className="run" onClick={() => {if(document.getElementById('run').classList.length > 1) { scrollToTop(); changeRunStatus('run'); }}}>run</div>
		<div id="back" className="back" onClick={() => {scrollToTop(); changeRunStatus('back');}}>&lt;=</div>
		<div id="play" className="play" onClick={() => {scrollToTop(); changeRunStatus('play');}}>play</div>
		<div id="forward" className="forward" onClick={() => {scrollToTop(); changeRunStatus('forward');}}>=></div>
		</>
	);

}

export default Controls;