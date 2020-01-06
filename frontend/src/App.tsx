import React, { useState, useEffect, ChangeEvent } from 'react';
import './App.css';
import menu from './resource/menu.svg';

import Sim from './component/Sim/Sim';
import Controls from './component/Controls/Controls';

import * as api from './util/sim-api';
import { InstructionBlock, Instruction } from './util/interpret';

const App: React.FC = () => {
  const [menuClasses, setMenuClasses] = useState(['menu', 'overlay']);
  
  // this needs to be a pointer or the tsx element will just do a primitive string copy and won't receive changes
  const [nodeInfoClasses, setNodeInfoClasses] = useState(['node-info']);
  const [runButtonClasses, setRunButtonClasses] = useState(['run']);
  const [network, setNetwork] = useState(api.generateNetwork(10));

  let ib: InstructionBlock[];
  const [instructionBlocks, setInstructions] = useState(ib);

  useEffect(() => {
    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
    document.getElementById("textarea").style.height = (document.getElementById("console").offsetHeight - 30 - document.getElementById("run").offsetHeight) + 'px';
    document.getElementById('new-svg').addEventListener('click',
      (ev) => {
        setNodeInfoClasses(['node-info']);
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

  }, []);

  useEffect(() => {

    if (!instructionBlocks) {
      return;
    }

    let instructionsToSend: Instruction[][] = [];
    instructionBlocks.forEach( block => {
      instructionsToSend.push(block.instructions);
    })
    const timeline = api.processInstructions(instructionsToSend);

  }, [instructionBlocks]);

  const detectClickOffTextArea = (event: MouseEvent) => {
    
    // only scroll up if the run button is not active. if it is active, controls component will scroll up for us
    const runButtonActive = document.getElementById("run").contains(event.target as Node) && document.getElementById("run").classList.length > 1;

    if (!document.getElementById("textarea").contains(event.target as Node) && !runButtonActive) {
      scrollToTop();
      document.removeEventListener('click', detectClickOffTextArea);
    }
  }

  const getNodeInfo = (id: number) => {
    const node = network.getNode(id);

    let dataRangeString = '[{';
    for (let i = 0; i < node.dataRange.length; i++) {
      dataRangeString = dataRangeString.concat('range: ' + node.dataRange[i].start + ' => ' + node.dataRange[i].end + ', full: ' + node.dataRange[i].full);
      if (i + 1 < node.dataRange.length) {
        dataRangeString = dataRangeString.concat('}, {');
      }
    }
    dataRangeString = dataRangeString.concat('}]');

    let dataSliceString = "<span style='color: #18cdfa'>[</span></br>";
    const it = node.dataSlice.entries();

    let val = it.next().value;
    while (!!val) {
      dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>{</span>itemId: " + val[0] + ', ');
      Object.keys(val[1]).forEach( (key) => {
        dataSliceString = dataSliceString.concat(key + ': ' + val[1][key] + ', ');
      });
      dataSliceString = dataSliceString.slice(0, -2); 

      if (val = it.next().value) {
        dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>}</span>,</br>");
      } else {
        dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>}</span></br>");
      }
    }
    dataSliceString = dataSliceString.concat("<span style='color: #18cdfa'>]</span>");

    let infoToPrint = "<span style='color: #dd9f58'>{</span>" + 
      "<span style='color: #f1ef43'>nodeId: </span>"          + node.id                          + ',</br>' +
      "<span style='color: #f1ef43'>connections: </span>" + JSON.stringify(node.connections) + ',</br>' +
      "<span style='color: #f1ef43'>dataRange: </span>"   + dataRangeString                  + ',</br>' +
      "<span style='color: #f1ef43'>dataSlice: </span>"   + dataSliceString   + ',</br>' +
      "<span style='color: #f1ef43'>clock: </span>"       + JSON.stringify(node.clock)       + "<span style='color: #dd9f58'>}</span>";

    document.getElementById('node-info').innerHTML = infoToPrint;
    if (document.getElementById('node-info').classList.length === 1) {
      setNodeInfoClasses(['node-info node-info-active']);
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

      <Sim net={network} getNodeInfo={getNodeInfo} />

      <div id="console" className="console">
        <Controls setInstructions={setInstructions}/>
  
        <div id="prompt" className="before-textarea blink">>>></div>
        {/* <span style={{color: 'red'}}>test</span> */}
        <textarea id="textarea" onClick={() => document.getElementById('prompt').classList.remove('blink')} onChange={handleTextAreaInput}></textarea>
      </div>
      <div id="end"></div>

      <div id='node-info' className={nodeInfoClasses[0]}>
      </div>

      <div className={menuClasses[1]} onClick={() => setMenuClasses(['menu', 'overlay'])}></div>
      <div className={menuClasses[0]}>
        <ul>
          <li>about</li>
        </ul>
      </div>

    </div>
  );
}

export default App;