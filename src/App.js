import React from 'react';
import AppConnected from './AppConnected';
import Web3 from 'web3';
import { Web3Provider } from 'react-web3';
import { connect } from "react-redux";
import ErrorBoundary from 'react-error-boundary';
import ErrorPage from './components/errorBoundaries/ErrorPage';

async function init() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
    } catch (error) {
      console.error(error);
    }
  } else {
    window.web3 = new Web3('https://' + process.env.REACT_APP_ETHEREUM_NETWORK + '.infura.io/v3/' + process.env.REACT_APP_INFURA_API_KEY);
  }
}
init();

const myErrorHandler = (error, componentStack) => {
    /*let errors = JSON.parse(localStorage.getItem('errors'));
    errors = (!errors) && [];
    let err = error + ' ' + componentStack;
    errors.push(err);
    localStorage.setItem('errors', JSON.stringify(errors));*/
};

class App extends React.Component {
    render() {
        return (
            <div>
                <Web3Provider passive={true}>
                    <ErrorBoundary onError={myErrorHandler} FallbackComponent={ErrorPage}>
                        <AppConnected />
                    </ErrorBoundary>
                </Web3Provider>
            </div>
        );
    }
}

export default connect()(App);
