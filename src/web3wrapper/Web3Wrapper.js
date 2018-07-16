import React, { Component } from 'react';
import './Web3Wrapper.css';
import AppConnected from '../AppConnected';
import Web3 from 'web3';
import { Web3Provider } from 'react-web3';
import logoTalao from '../images/logo-talao.png';
import FreelancerService from '../services/FreelancerService';

// If the browser has injected Web3.JS
if (window.web3) {
  // Then backup the good old injected Web3, sometimes it's usefull:
 
  window.web3.eth.getAccounts(function(err, accounts) { 
    window.account = accounts[0];
    FreelancerService.getFreelancer().setAddress(window.account, true);
  });
  //window.account = web3.eth.getAccounts(console.log)

  window.web3old = window.web3;
  // And replace the old injected version by the local Web3.JS version 1.0.0-beta.N
  window.web3 = new Web3(window.web3.currentProvider);
}

class Web3WrapperUnavailable extends Component {
  
  render() {
    return (
      <div className="Web3Wrapper">
        <img src={logoTalao} className="logo" alt="Talao" />
        <p>You need to use a web browser with the <a href="https://metamask.io/" rel="noopener noreferrer" target="_blank">Metamask extension</a> enabled, or any Ethereum compatible web browser.</p>
      </div>
    );
  }
}

class Web3WrapperUnavailableAccount extends Component {
  render() {
    return (
      <div className="Web3Wrapper">
        <img src={logoTalao} className="logo" alt="Talao" />
        <p>Great, you have a web browser with the Metamask extension enabled!</p>
        <p><strong>Log in now in Metamask</strong> to access Ethereum features.</p>
      </div>
    );
  }
}

class Web3Wrapper extends Component {
  render() {
    if(window.account != null) return (<AppConnected />);
    return (
      <Web3Provider
        web3UnavailableScreen={Web3WrapperUnavailable}
        accountUnavailableScreen={Web3WrapperUnavailableAccount}
      >
        <AppConnected />
      </Web3Provider>
    );
  }
}

export default Web3Wrapper;
