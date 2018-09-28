import React from 'react';
import AppConnected from './AppConnected';
import Web3 from 'web3';
import { Web3Provider } from 'react-web3';
import { connect } from "react-redux";
import ErrorBoundary from 'react-error-boundary';
import ErrorPage from './components/errorBoundaries/ErrorPage';

// If the browser has injected Web3.JS
if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    console.log('yes')
} else {
    window.web3 = new Web3('https://ropsten.infura.io/v3/d151b6d373a147b5a83163a89f3156c2');
}

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
