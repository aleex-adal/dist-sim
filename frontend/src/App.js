import React, { useState, useEffect } from 'react';
import './App.css';
import menu from './resource/menu.svg';

import Sim from './component/Sim/Sim.js';

function App() {
  const [menuClasses, setMenuClasses] = useState(['menu', 'overlay']);

  useEffect(() => {
    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
  }, []);

  return (
    <div className="app">

      <header>
        <nav>
          <div className="nav-title">
            dist-sim
          </div>
          <img className="menu-btn" src={menu} alt="Menu icon" onClick={() => setMenuClasses(['menu menu-active', 'overlay overlay-active'])}></img>
        </nav>
      </header>

      <Sim />

      <div className="console">
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea onClick={() => document.getElementById('prompt').classList.remove('blink')}></textarea>
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
