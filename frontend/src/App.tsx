import React, { useState, useEffect } from 'react';
import './App.css';
import menu from './resource/menu.svg';

import Sim from './component/Sim/Sim';
import Network from './model/network';

const App: React.FC = () => {
  const [menuClasses, setMenuClasses] = useState(['menu', 'overlay']);
  
  // this needs to be a pointer or the tsx element will just do a primitive string copy and won't receive changes
  const [nodeInfoClasses, setNodeInfoClasses] = useState(['node-info']);

  const [network, setNetwork] = useState(new Network(10));

  useEffect(() => {
    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
    document.getElementById('new-svg').addEventListener('click',
      (ev) => {
        setNodeInfoClasses(['node-info']);
        try {
          document.getElementById('nav').scrollIntoView({ behavior: "smooth"});
        } catch (e) { // mobile safari does not support smooth scroll
          document.getElementById('nav').scrollIntoView();
        }
        document.getElementById('nav').scrollIntoView({ behavior: "smooth"});
        document.getElementById('app').style.overflowY = 'hidden';
      });
    document.getElementById('app').style.overflowY = 'hidden';
  }, []);

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
    setNodeInfoClasses(['node-info node-info-active']);
    document.getElementById('app').style.overflowY = 'visible';
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

      <div className="console">
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea onClick={() => document.getElementById('prompt').classList.remove('blink')}></textarea>
      </div>

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
