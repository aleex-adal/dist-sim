import React from 'react';
import './App.css';
import menu from './resource/menu.svg';

function App() {
  return (
    <div className="app">
      <header>
        <nav>
          <div className="nav-title">
            dist-sim
          </div>
          <img className="menu-btn" src={menu} alt="Menu icon"></img>
        </nav>
      </header>
      <div className="sim">
        Hello World!
      </div>
      <div className="console">
        >>> Here is some sample text
      </div>

      <div className="menu">
        <ul>
          <li>about</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
