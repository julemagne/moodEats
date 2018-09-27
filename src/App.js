import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './Components/MainComponent';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Main />
        <header className="App-header">
          <div className="bg">
            <div className="mountain">
              <div className="mountain-top">
                <div className="mountain-cap-1"></div>
                <div className="mountain-cap-2"></div>
                <div className="mountain-cap-3"></div>
              </div>
            </div>
            <div className="mountain-two">
              <div className="mountain-top">
                <div className="mountain-cap-1"></div>
                <div className="mountain-cap-2"></div>
                <div className="mountain-cap-3"></div>
              </div>
            </div>
            <div className="mountain-three">
              <div className="mountain-top">
                <div className="mountain-cap-1"></div>
                <div className="mountain-cap-2"></div>
                <div className="mountain-cap-3"></div>
              </div>
            </div>
            <div className="cloud"></div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
