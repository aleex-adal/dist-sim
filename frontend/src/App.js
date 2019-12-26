import React, { useState, useEffect } from 'react';
import './App.css';
import menu from './resource/menu.svg';

function App() {
  const [menuClasses, setMenuClasses] = useState(['menu', 'overlay', 'before-textarea blink']);

  useEffect(() => {
    document.documentElement.style.setProperty('--prompt-width', document.getElementById("prompt").offsetWidth + 'px');
    console.log('prompt width: ' + document.getElementById("prompt").offsetWidth);
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
      <div className="sim">
      </div>
      <div className="console">
        <div id="prompt" className={menuClasses[2]}>>>></div>
        <textarea onClick={() => {console.log('calling onclick'); const newMenuClasses = menuClasses; newMenuClasses[2] = 'before-textarea'; setMenuClasses(newMenuClasses)}}></textarea>
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
