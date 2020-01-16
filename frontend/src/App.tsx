import React, { useState, useEffect, ChangeEvent } from 'react';
import './App.css';
import menu from './resource/menu.svg';

import Sim from './component/Sim/Sim';
import Console from './component/Console/Console';
import Api from './component/Api/Api';

import { Instruction, buildNodeInfoString } from './util/interpret';
import Network from './model/Network';
import { ControlsProps } from './component/Controls/Controls';
import { number } from 'prop-types';

const App: React.FC = () => {
  const [menuClasses, setMenuClasses] = useState(['menu', 'overlay']);
  
  // this needs to be a pointer or the tsx element will just do a primitive string copy and won't receive changes
  const [nodeInfoClasses, setNodeInfoClasses] = useState(['node-info']);
  const [runButtonClasses, setRunButtonClasses] = useState(['run']);
  const [ runState, setRunState ] = useState('init');

  // this is set when the API component mounts. For a real API, make the request for a network object from the real API
  const [network, setNetwork] = useState(undefined as Network);

  // initialize state to null values but keep those suckers typed... mostly
  const [instructionsToSend, setInstructionsToSend] = useState(undefined as Instruction[][]);
  const [apiResponse, setApiResponse] = useState(undefined);

  // are we done executing the current set of instructions?
  const [ finishedExecuting, setFinishedExecuting ] = useState(undefined as boolean);

  // display progressive node info as simulation executes
  // if we didn't have this state, getNodeInfo would display the completed node state immediately
  // because the simulation has already been done on the displayed network
  const [ mostRecentNodeInfo, setMostRecentNodeInfo ] = useState(new Map<number, string>());
  const [ mostRecentStepCompleted, setMostRecentStepCompleted ] = useState([]);

  useEffect(() => {
    if (!network) {
      return;
    }

    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
    document.getElementById("textarea").style.height = (document.getElementById("console").offsetHeight - 30 - document.getElementById("run").offsetHeight) + 'px';
    document.getElementById('new-svg').addEventListener('click',
      (ev) => {
        setNodeInfoClasses(['node-info']);

        document.getElementById('liveinfo').style.removeProperty('display');
        setTimeout( () => document.getElementById('node-info').style.removeProperty('height'), 300);
        scrollToTop();
        document.getElementById('app').style.overflowY = 'hidden';
      });

    // when user clicks off of the textarea, scroll up so there isn't awks whitespace at the bottom
    const ta = document.getElementById("textarea");
    ta.addEventListener('click', event => {
      scrollToEnd();
      document.removeEventListener('click', detectClickOffTextArea);
      document.addEventListener('click', detectClickOffTextArea);
    });

    //set most recent node info here??

  }, [network]);

  useEffect( () => {
    if (!apiResponse) {
      setMostRecentStepCompleted([]);
      return;
    }

    if (mostRecentStepCompleted.length === 0) {

      let i = 0;
      while (apiResponse[i].done) {
        mostRecentNodeInfo.set(apiResponse[i].nodeId, apiResponse[i].nodeInfoString);
        i++;
      }

      mostRecentStepCompleted[0] = i - 1;
    }


  }, [apiResponse]);

  const detectClickOffTextArea = (event: MouseEvent) => {
    
    // only scroll up if the run button is not active. if it is active, controls component will scroll up for us
    const runButtonActive = document.getElementById("run").contains(event.target as Node) && document.getElementById("run").classList.length > 1;

    if (!document.getElementById("textarea").contains(event.target as Node) && !runButtonActive) {
      scrollToTop();
      document.removeEventListener('click', detectClickOffTextArea);
    }
  }

  const getNodeInfo = (id: number) => {

    let infoToPrint = '';

    if (!apiResponse) {
      const node = network.getNode(id);
      infoToPrint = buildNodeInfoString(node);

    } else if (mostRecentNodeInfo) {

    }

    document.getElementById('node-info').innerHTML = infoToPrint;
    if (document.getElementById('node-info').classList.length === 1) {
      setNodeInfoClasses(['node-info node-info-active']);

      // remove right after the animation ends (0.3s)
      setTimeout( () => document.getElementById('liveinfo').style.display = 'none', 300);
      document.getElementById('node-info').style.height = '75vh';
      scrollToEnd();
    }
  };

  const handleTextAreaInput = (event: ChangeEvent) => {
    const currValue = (document.getElementById('textarea') as any).value;

    if (runButtonClasses[0] !== 'run run-active' && currValue) {
      setRunButtonClasses(['run run-active']);
      document.getElementById('run').classList.add('run-active');

    } else if (!currValue) {
      setRunButtonClasses(['run']);
      document.getElementById('run').classList.remove('run-active');
    }
  };

  const scrollToTop = () => {
    try {
      document.getElementById('nav').scrollIntoView({ behavior: "smooth"});
    } catch (e) { // mobile safari does not support smooth scroll
      document.getElementById('nav').scrollIntoView();
    }
  };

  const scrollToEnd = () => {
    try {
      document.getElementById('end').scrollIntoView({behavior: "smooth"});
    } catch (e) { // mobile safari does not support smooth scroll
      document.getElementById('end').scrollIntoView();
    }
  };

  const getControlsProps = (): ControlsProps => {
    return {
      setInstructionsToSend: setInstructionsToSend,
      finishedExecuting: finishedExecuting,
      setFinishedExecuting: setFinishedExecuting,
      setRunButtonClasses: setRunButtonClasses,
      runState: runState,
      setRunState: setRunState
    };
  }

  return (
    <div id="app" className="app">

      <header>
        <nav id='nav'>
          <div className="nav-title">
            dist-sim
          </div>
          <img className="menu-btn" src={menu} alt="Menu icon" onClick={() => setMenuClasses(['menu menu-active', 'overlay overlay-active'])}></img>
        </nav>
      </header>

      <Sim 
        net={network}
        getNodeInfo={getNodeInfo}
        apiResponse={apiResponse}
        setApiResponse={setApiResponse}
        sentInstructions={instructionsToSend}
        setSentInstructions={setInstructionsToSend}
        setFinishedExecuting={setFinishedExecuting}
      />

      <Console
        ControlsProps={getControlsProps()}
        handleTextAreaInput={handleTextAreaInput}
        apiResponse={apiResponse}
        sentInstructions={instructionsToSend}
      />
      <div id="end"></div>

      <div id='node-info' className={nodeInfoClasses[0]}>
      </div>

      <div className={menuClasses[1]} onClick={() => setMenuClasses(['menu', 'overlay'])}></div>
      <div className={menuClasses[0]}>
        <ul>
          <li>about</li>
        </ul>
      </div>

      <Api network={network} setNetwork={setNetwork} sentInstructions={instructionsToSend} setApiResponse={setApiResponse} simFinishedExecuting={finishedExecuting} />
    </div>
  );
}

export default App;