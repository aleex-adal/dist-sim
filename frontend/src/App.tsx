import React, { useState, useEffect } from 'react';
import './App.css';

import Sim from './component/Sim/Sim';
import Console from './component/Console/Console';
import Api from './component/Api/Api';
import NavAndMenu from './component/NavAndMenu/NavAndMenu';

import { Instruction, buildNodeInfoString, buildPayloadInfoString } from './util/interpret';
import Network from './model/Network';
import { ControlsProps } from './component/Controls/Controls';

const App: React.FC = () => {
    
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
  const [ mostRecentNodeInfo ] = useState(new Map<number, string>());
  const [ mostRecentStepCompleted, setMostRecentStepCompleted ] = useState([] as number[]);

  // re render sim if screen is over a certain size and we need to change padding
  const [ rerenderSim, setRerenderSim ] = useState(false);

  useEffect( () => {
    if (window.innerWidth > 1195) {
      document.documentElement.style.setProperty('--sim-wrapper-vertical-padding', '70px');
      document.documentElement.style.setProperty('--sim-wrapper-horizontal-padding', '70px');
      setRerenderSim(true);
    }
  }, []);

  useEffect(() => {
    if (!network) {
      return;
    }

    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
    document.getElementById("textarea").style.height = (document.getElementById("console").offsetHeight - 30 - document.getElementById("run").offsetHeight) + 'px';
    
    document.addEventListener('click',
      (ev) => {
        if ((ev.target as Element).id === 'circle-wrapper' || (ev.target as Element).id === 'sim-wrapper') {
          closeNodeInfo();
          // scrollToTop();
          // document.getElementById('app').style.overflowY = 'hidden';
        }
      });

    // when user clicks off of the textarea, scroll up so there isn't awks whitespace at the bottom
    const ta = document.getElementById("textarea");
    ta.addEventListener('click', event => {

      if (window.innerWidth <= 767) {
        scrollToEnd();
      }
      document.removeEventListener('click', detectClickOffTextArea);
      document.addEventListener('click', detectClickOffTextArea);
    });

    // fill map with current node data
    for (let i = 0; i < network.numNodes; i++) {
      mostRecentNodeInfo.set(i, buildNodeInfoString(network.getNode(i)));
    }

  }, [network]);

  useEffect( () => {
    if (!apiResponse) {
      return;
    }

    let i = mostRecentStepCompleted.length ? mostRecentStepCompleted[0] : 0;

    while (apiResponse[i] && apiResponse[i].done) {
      mostRecentNodeInfo.set(apiResponse[i].nodeId, apiResponse[i].nodeInfoString);
      i++;
    }

    mostRecentStepCompleted[0] = i > 0 ? i - 1 : 0;

  }, [apiResponse]);

  const detectClickOffTextArea = (event: MouseEvent) => {
    
    // only scroll up if the run button is not active. if it is active, controls component will scroll up for us
    const runButtonActive = document.getElementById("run").contains(event.target as Node) && document.getElementById("run").classList.length > 1;

    if (!document.getElementById("textarea").contains(event.target as Node) && !runButtonActive) {
      scrollToTop();
      document.removeEventListener('click', detectClickOffTextArea);
    }
  }

  const getNodeInfo = (id: number) => displayInfo(mostRecentNodeInfo.get(id));

  const getPayloadInfo = (apiResIndex: number, msgId: string) => 
    displayInfo(
      buildPayloadInfoString(
        apiResponse[apiResIndex].payload,
        msgId
      )
    );

  const displayInfo = (info: string) => {
    document.getElementById('node-info-wrapper').innerHTML = info;
    if (document.getElementById('node-info').classList.length === 1) {

      setNodeInfoClasses(['node-info node-info-active']);

      // remove right after the animation ends (0.3s)
      setTimeout( () => document.getElementById('liveinfo').style.display = 'none', 300);
      // scrollToEnd();
    }
  };

  const closeNodeInfo = () => {
    setNodeInfoClasses(['node-info']);

    document.getElementById('liveinfo').style.removeProperty('display');
    setTimeout( () => document.getElementById('node-info').style.removeProperty('height'), 300);
  }

  const handleTextAreaInput = (ev) => {
    const currValue = (document.getElementById('textarea') as any).value;

    if (document.getElementById('tutorial').classList.length === 1) {
      document.getElementById('tutorial').classList.add('display-none');
    }

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
      setRunState: setRunState,
      setMostRecentStepCompleted: setMostRecentStepCompleted,
    };
  }

  return (
    <div id="app" className="app">

      <NavAndMenu />

      <Sim 
        net={network}
        getNodeInfo={getNodeInfo}
        getPayloadInfo={getPayloadInfo}
        apiResponse={apiResponse}
        setApiResponse={setApiResponse}
        sentInstructions={instructionsToSend}
        setSentInstructions={setInstructionsToSend}
        setFinishedExecuting={setFinishedExecuting}
        network={network}
        mostRecentNodeInfo={mostRecentNodeInfo}
        rerenderSim={rerenderSim}
      />

      <Console
        ControlsProps={getControlsProps()}
        handleTextAreaInput={handleTextAreaInput}
        apiResponse={apiResponse}
        sentInstructions={instructionsToSend}
      />

      <div id='node-info' className={nodeInfoClasses[0]}>
        <svg 
          onClick={() => closeNodeInfo()}
          id="node-info-close" className="node-info-close" viewBox="0 0 20 20"
          style={{left: (window.innerWidth > 766 ? (window.innerWidth/2) - 45 : window.innerWidth - 45) + 'px'}}
          >
          <path fill="#f1f5fd" d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
        </svg>
        <div id='node-info-wrapper'></div>
      </div>

      <Api network={network} setNetwork={setNetwork} sentInstructions={instructionsToSend} setApiResponse={setApiResponse} simFinishedExecuting={finishedExecuting} />
    </div>
  );
}

export default App;