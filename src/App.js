import React from 'react';
import AppConnected from './AppConnected';
import Web3Wrapper from './web3wrapper/Web3Wrapper';
import logo from './assets/images/Talao.svg';
import './App.css';

class App extends React.Component {

    render() {
        return (
            <div className="App">
            <header className="App-header white">
              <a href="/">
                <img src={ logo } className="App-header-logo" alt="logo" />
              </a>
            </header>
            <section className="App-main white">
              <Web3Wrapper>
                <AppConnected />
              </Web3Wrapper>
            </section>
            <footer className="App-footer green">
              <p>This is our work in progress prototype, stay tuned for new features added on a regular basis.</p>
              <ul className="App-footer-links">
                <li><a href="https://github.com/TalaoDAO" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://ico.talao.io" target="_blank" rel="noopener noreferrer">The Talao ICO</a></li>
                <li><a href="https://talao.io" target="_blank" rel="noopener noreferrer">Talao.io</a></li>
              </ul>
              <p>v0.9</p>
            </footer>
          </div>
            );
    }
}

export default App;